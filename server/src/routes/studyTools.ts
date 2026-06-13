import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { ApiError, asyncHandler } from "../middleware/error";
import { validate } from "../middleware/validate";

const router = Router();
router.use(requireAuth);

// ---- Exam countdowns ----
router.get(
  "/exams",
  asyncHandler(async (req, res) => {
    const exams = await prisma.exam.findMany({
      where: { userId: req.user!.id },
      orderBy: { date: "asc" },
    });
    res.json({ success: true, data: exams });
  })
);

router.post(
  "/exams",
  validate(
    z.object({
      title: z.string().trim().min(1).max(80),
      date: z.coerce.date().refine((d) => d > new Date(), "Exam date must be in the future"),
    })
  ),
  asyncHandler(async (req, res) => {
    const exam = await prisma.exam.create({
      data: { title: req.body.title, date: req.body.date, userId: req.user!.id },
    });
    res.status(201).json({ success: true, data: exam });
  })
);

router.delete(
  "/exams/:id",
  asyncHandler(async (req, res) => {
    const result = await prisma.exam.deleteMany({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!result.count) throw ApiError.notFound("Exam not found");
    res.json({ success: true });
  })
);

// ---- Study goals ----
router.get(
  "/goals",
  asyncHandler(async (req, res) => {
    const goals = await prisma.studyGoal.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json({ success: true, data: goals });
  })
);

router.post(
  "/goals",
  validate(
    z.object({
      title: z.string().trim().min(1).max(120),
      type: z.enum(["DAILY", "WEEKLY"]).default("DAILY"),
    })
  ),
  asyncHandler(async (req, res) => {
    const goal = await prisma.studyGoal.create({
      data: { title: req.body.title, type: req.body.type, userId: req.user!.id },
    });
    res.status(201).json({ success: true, data: goal });
  })
);

router.patch(
  "/goals/:id",
  validate(z.object({ done: z.boolean() })),
  asyncHandler(async (req, res) => {
    const result = await prisma.studyGoal.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { done: req.body.done },
    });
    if (!result.count) throw ApiError.notFound("Goal not found");
    res.json({ success: true });
  })
);

router.delete(
  "/goals/:id",
  asyncHandler(async (req, res) => {
    const result = await prisma.studyGoal.deleteMany({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!result.count) throw ApiError.notFound("Goal not found");
    res.json({ success: true });
  })
);

// ---- Pomodoro sessions ----
router.get(
  "/pomodoro/summary",
  asyncHandler(async (req, res) => {
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);
    const sessions = await prisma.pomodoroSession.findMany({
      where: { userId: req.user!.id, createdAt: { gte: since } },
      select: { minutes: true, createdAt: true },
    });
    const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
    res.json({
      success: true,
      data: { sessions: sessions.length, totalMinutes },
    });
  })
);

router.post(
  "/pomodoro",
  validate(z.object({ minutes: z.coerce.number().int().min(1).max(180) })),
  asyncHandler(async (req, res) => {
    const session = await prisma.pomodoroSession.create({
      data: { minutes: req.body.minutes, userId: req.user!.id },
    });
    res.status(201).json({ success: true, data: session });
  })
);

// ---- Personal to-dos / tracking ----
const TODO_CATEGORIES = ["NOTE", "HOMEWORK", "PROBLEM", "SCRATCH"] as const;
const TODO_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

const todoInclude = {
  note: { select: { id: true, title: true } },
  problem: { select: { id: true, title: true, groupId: true } },
} as const;

router.get(
  "/todos",
  validate(
    z.object({ category: z.enum(TODO_CATEGORIES).optional() }),
    "query"
  ),
  asyncHandler(async (req, res) => {
    const todos = await prisma.todo.findMany({
      where: {
        userId: req.user!.id,
        ...(req.query.category ? { category: String(req.query.category) } : {}),
      },
      include: todoInclude,
      // Open items first, then by priority weight (set client-side ordering via
      // position), then newest. Done items sink to the bottom.
      orderBy: [{ done: "asc" }, { position: "asc" }, { createdAt: "desc" }],
      take: 300,
    });
    res.json({ success: true, data: todos });
  })
);

router.post(
  "/todos",
  validate(
    z.object({
      title: z.string().trim().min(1).max(160),
      details: z.string().trim().max(2000).optional(),
      category: z.enum(TODO_CATEGORIES).default("SCRATCH"),
      priority: z.enum(TODO_PRIORITIES).default("MEDIUM"),
      dueDate: z.coerce.date().optional(),
      noteId: z.string().cuid().optional(),
      problemId: z.string().cuid().optional(),
    })
  ),
  asyncHandler(async (req, res) => {
    const { noteId, problemId } = req.body as { noteId?: string; problemId?: string };
    // Only link to resources that actually exist — keeps the optional FK honest.
    if (noteId) {
      const note = await prisma.note.findUnique({ where: { id: noteId }, select: { id: true } });
      if (!note) throw ApiError.badRequest("Linked note not found");
    }
    if (problemId) {
      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        select: { id: true },
      });
      if (!problem) throw ApiError.badRequest("Linked problem not found");
    }

    const todo = await prisma.todo.create({
      data: {
        title: req.body.title,
        details: req.body.details ?? null,
        category: req.body.category,
        priority: req.body.priority,
        dueDate: req.body.dueDate ?? null,
        noteId: noteId ?? null,
        problemId: problemId ?? null,
        userId: req.user!.id,
      },
      include: todoInclude,
    });
    res.status(201).json({ success: true, data: todo });
  })
);

router.patch(
  "/todos/:id",
  validate(
    z
      .object({
        title: z.string().trim().min(1).max(160).optional(),
        details: z.string().trim().max(2000).nullable().optional(),
        category: z.enum(TODO_CATEGORIES).optional(),
        priority: z.enum(TODO_PRIORITIES).optional(),
        done: z.boolean().optional(),
        dueDate: z.coerce.date().nullable().optional(),
        position: z.number().int().min(0).optional(),
      })
      .refine((body) => Object.keys(body).length > 0, "No fields to update")
  ),
  asyncHandler(async (req, res) => {
    const result = await prisma.todo.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: req.body,
    });
    if (!result.count) throw ApiError.notFound("To-do not found");
    const todo = await prisma.todo.findUnique({
      where: { id: req.params.id },
      include: todoInclude,
    });
    res.json({ success: true, data: todo });
  })
);

router.delete(
  "/todos/:id",
  asyncHandler(async (req, res) => {
    const result = await prisma.todo.deleteMany({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!result.count) throw ApiError.notFound("To-do not found");
    res.json({ success: true });
  })
);

// Clear all completed to-dos in one shot.
router.delete(
  "/todos",
  asyncHandler(async (req, res) => {
    const result = await prisma.todo.deleteMany({
      where: { userId: req.user!.id, done: true },
    });
    res.json({ success: true, data: { deleted: result.count } });
  })
);

export default router;
