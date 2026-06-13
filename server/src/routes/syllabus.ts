import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { deleteFile, storeFile } from "../lib/storage";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth";
import { ApiError, asyncHandler } from "../middleware/error";
import { uploadLimiter } from "../middleware/rateLimit";
import { upload, inspectFile } from "../middleware/upload";
import { validate } from "../middleware/validate";
import { pageMeta, paginate, paginationSchema } from "../utils/pagination";

const router = Router();

const officialSelect = { id: true, name: true, username: true, avatarUrl: true } as const;

const syllabusCardSelect = {
  id: true,
  title: true,
  description: true,
  className: true,
  board: true,
  status: true,
  fileUrl: true,
  fileType: true,
  fileSize: true,
  createdAt: true,
  subject: { select: { id: true, name: true, slug: true, icon: true } },
  createdBy: { select: officialSelect },
  _count: { select: { topics: true, tracks: true } },
} as const;

/** Newline- (or comma-) separated checklist text -> ordered topic titles. */
const topicsField = z
  .string()
  .transform((value) =>
    value
      .split(/[\r\n]+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.slice(0, 200))
      .slice(0, 200)
  )
  .refine((topics) => topics.length > 0, "Add at least one topic");

/**
 * Attach the current viewer's tracking state and completed-topic count to a
 * list of syllabuses. Returns the cards untouched when there is no viewer.
 */
async function withViewerProgress<T extends { id: string; _count: { topics: number } }>(
  cards: T[],
  userId: string | undefined
) {
  const base = cards.map((card) => ({
    ...card,
    topicsCount: card._count.topics,
    trackersCount: (card as unknown as { _count: { tracks?: number } })._count.tracks ?? 0,
    tracking: false,
    completedCount: 0,
  }));
  if (!userId || base.length === 0) return base;

  const ids = base.map((c) => c.id);
  const [tracks, progress] = await Promise.all([
    prisma.syllabusTrack.findMany({
      where: { userId, syllabusId: { in: ids } },
      select: { syllabusId: true },
    }),
    prisma.syllabusProgress.findMany({
      where: { userId, topic: { syllabusId: { in: ids } } },
      select: { topic: { select: { syllabusId: true } } },
    }),
  ]);

  const tracked = new Set(tracks.map((t) => t.syllabusId));
  const completed = new Map<string, number>();
  for (const row of progress) {
    const sid = row.topic.syllabusId;
    completed.set(sid, (completed.get(sid) ?? 0) + 1);
  }
  for (const card of base) {
    card.tracking = tracked.has(card.id);
    card.completedCount = completed.get(card.id) ?? 0;
  }
  return base;
}

// ---- Browse published syllabuses ----
const listSchema = paginationSchema.extend({
  q: z.string().trim().max(120).optional(),
  subject: z.string().optional(),
});

router.get(
  "/",
  optionalAuth,
  validate(listSchema, "query"),
  asyncHandler(async (req, res) => {
    const { q, subject, page, limit } = req.query as unknown as z.infer<typeof listSchema>;

    const where: Prisma.SyllabusWhereInput = { status: "PUBLISHED" };
    if (subject) where.subject = { slug: subject };
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { subject: { name: { contains: q } } },
      ];
    }

    const [total, syllabi] = await Promise.all([
      prisma.syllabus.count({ where }),
      prisma.syllabus.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: syllabusCardSelect,
        ...paginate(page, limit),
      }),
    ]);

    const data = await withViewerProgress(syllabi, req.user?.id);
    res.json({ success: true, data, meta: pageMeta(total, page, limit) });
  })
);

// ---- Syllabuses the current user is tracking ----
router.get(
  "/tracked",
  requireAuth,
  asyncHandler(async (req, res) => {
    const syllabi = await prisma.syllabus.findMany({
      where: { status: "PUBLISHED", tracks: { some: { userId: req.user!.id } } },
      orderBy: { createdAt: "desc" },
      select: syllabusCardSelect,
    });
    const data = await withViewerProgress(syllabi, req.user!.id);
    res.json({ success: true, data });
  })
);

// ---- Single syllabus with its topic checklist ----
router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const syllabus = await prisma.syllabus.findUnique({
      where: { id: req.params.id },
      select: {
        ...syllabusCardSelect,
        updatedAt: true,
        topics: { orderBy: { order: "asc" }, select: { id: true, title: true, order: true } },
      },
    });
    if (!syllabus || (syllabus.status !== "PUBLISHED" && req.user?.role !== "ADMIN")) {
      throw ApiError.notFound("Syllabus not found");
    }

    let tracking = false;
    const completedTopicIds = new Set<string>();
    if (req.user) {
      const [track, progress] = await Promise.all([
        prisma.syllabusTrack.findUnique({
          where: { userId_syllabusId: { userId: req.user.id, syllabusId: syllabus.id } },
        }),
        prisma.syllabusProgress.findMany({
          where: { userId: req.user.id, topic: { syllabusId: syllabus.id } },
          select: { topicId: true },
        }),
      ]);
      tracking = !!track;
      progress.forEach((p) => completedTopicIds.add(p.topicId));
    }

    const topics = syllabus.topics.map((topic) => ({ ...topic, done: completedTopicIds.has(topic.id) }));
    res.json({
      success: true,
      data: {
        ...syllabus,
        topics,
        topicsCount: syllabus._count.topics,
        trackersCount: syllabus._count.tracks,
        completedCount: completedTopicIds.size,
        tracking,
      },
    });
  })
);

// ---- Create (officials / admins only) ----
const createSchema = z.object({
  title: z.string().trim().min(4).max(160),
  description: z.string().trim().min(10).max(3000),
  subjectId: z.string().min(1),
  className: z.string().trim().max(60).optional().or(z.literal("")),
  board: z.string().trim().max(60).optional().or(z.literal("")),
  topics: topicsField,
});

router.post(
  "/",
  requireAuth,
  requireAdmin,
  uploadLimiter,
  upload.fields([{ name: "file", maxCount: 1 }]),
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const file = files?.file?.[0];

    const { title, description, subjectId, className, board, topics } = req.body as z.infer<typeof createSchema>;

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw ApiError.badRequest("Unknown subject");

    let stored: { url: string } | null = null;
    let fileType: string | null = null;
    if (file) {
      fileType = inspectFile(file).mime;
      stored = await storeFile(file.buffer, file.originalname, "notes");
    }

    const syllabus = await prisma.syllabus.create({
      data: {
        title,
        description,
        subjectId,
        className: className || null,
        board: board || null,
        fileUrl: stored?.url ?? null,
        fileType,
        fileSize: file?.size ?? null,
        createdById: req.user!.id,
        topics: { create: topics.map((topicTitle, order) => ({ title: topicTitle, order })) },
      },
      select: { id: true },
    });

    res.status(201).json({ success: true, data: syllabus });
  })
);

// ---- Edit metadata / status, optionally replace the topic list (admins) ----
const updateSchema = z.object({
  title: z.string().trim().min(4).max(160).optional(),
  description: z.string().trim().min(10).max(3000).optional(),
  subjectId: z.string().min(1).optional(),
  className: z.string().trim().max(60).optional().or(z.literal("")),
  board: z.string().trim().max(60).optional().or(z.literal("")),
  status: z.enum(["PUBLISHED", "ARCHIVED"]).optional(),
  // Replacing the topic list resets every student's progress on this syllabus.
  topics: topicsField.optional(),
});

router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof updateSchema>;
    const existing = await prisma.syllabus.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!existing) throw ApiError.notFound("Syllabus not found");

    const data: Prisma.SyllabusUpdateInput = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.subjectId !== undefined) data.subject = { connect: { id: body.subjectId } };
    if (body.className !== undefined) data.className = body.className || null;
    if (body.board !== undefined) data.board = body.board || null;
    if (body.status !== undefined) data.status = body.status;
    if (body.topics) {
      data.topics = {
        deleteMany: {},
        create: body.topics.map((title, order) => ({ title, order })),
      };
    }

    await prisma.syllabus.update({ where: { id: existing.id }, data });
    res.json({ success: true });
  })
);

// ---- Delete (admins) ----
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const syllabus = await prisma.syllabus.findUnique({
      where: { id: req.params.id },
      select: { id: true, fileUrl: true },
    });
    if (!syllabus) throw ApiError.notFound("Syllabus not found");
    await prisma.syllabus.delete({ where: { id: syllabus.id } });
    await deleteFile(syllabus.fileUrl);
    res.json({ success: true, code: "SYLLABUS_DELETED", message: "Syllabus deleted" });
  })
);

// ---- Track / untrack ----
router.post(
  "/:id/track",
  requireAuth,
  asyncHandler(async (req, res) => {
    const syllabus = await prisma.syllabus.findUnique({
      where: { id: req.params.id },
      select: { id: true, status: true },
    });
    if (!syllabus || syllabus.status !== "PUBLISHED") throw ApiError.notFound("Syllabus not found");

    await prisma.syllabusTrack.upsert({
      where: { userId_syllabusId: { userId: req.user!.id, syllabusId: syllabus.id } },
      update: {},
      create: { userId: req.user!.id, syllabusId: syllabus.id },
    });
    res.status(201).json({ success: true, data: { tracking: true } });
  })
);

router.delete(
  "/:id/track",
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.$transaction([
      prisma.syllabusProgress.deleteMany({
        where: { userId: req.user!.id, topic: { syllabusId: req.params.id } },
      }),
      prisma.syllabusTrack.deleteMany({
        where: { userId: req.user!.id, syllabusId: req.params.id },
      }),
    ]);
    res.json({ success: true, data: { tracking: false } });
  })
);

// ---- Toggle a topic's completion for the current user ----
router.patch(
  "/:id/topics/:topicId",
  requireAuth,
  validate(z.object({ done: z.boolean() })),
  asyncHandler(async (req, res) => {
    const { id, topicId } = req.params;
    const topic = await prisma.syllabusTopic.findFirst({
      where: { id: topicId, syllabusId: id, syllabus: { status: "PUBLISHED" } },
      select: { id: true },
    });
    if (!topic) throw ApiError.notFound("Topic not found");

    if (req.body.done) {
      // Ticking a topic auto-tracks the syllabus so it appears in the tracker.
      await prisma.syllabusTrack.upsert({
        where: { userId_syllabusId: { userId: req.user!.id, syllabusId: id } },
        update: {},
        create: { userId: req.user!.id, syllabusId: id },
      });
      await prisma.syllabusProgress.upsert({
        where: { userId_topicId: { userId: req.user!.id, topicId } },
        update: {},
        create: { userId: req.user!.id, topicId },
      });
    } else {
      await prisma.syllabusProgress.deleteMany({ where: { userId: req.user!.id, topicId } });
    }
    res.json({ success: true, data: { done: req.body.done } });
  })
);

export default router;
