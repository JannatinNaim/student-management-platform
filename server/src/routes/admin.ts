import { Router } from "express";
import { z } from "zod";
import { notify } from "../lib/gamification";
import { prisma } from "../lib/prisma";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { ApiError, asyncHandler } from "../middleware/error";
import { validate } from "../middleware/validate";
import { pageMeta, paginate, paginationSchema } from "../utils/pagination";
import { noteCardSelect } from "../utils/select";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [users, notes, downloads, openReports, newUsers, newNotes, recentDownloads] =
      await Promise.all([
        prisma.user.count(),
        prisma.note.count({ where: { status: "PUBLISHED" } }),
        prisma.download.count(),
        prisma.report.count({ where: { status: "OPEN" } }),
        prisma.user.count({ where: { createdAt: { gte: since } } }),
        prisma.note.count({ where: { createdAt: { gte: since } } }),
        prisma.download.count({ where: { createdAt: { gte: since } } }),
      ]);
    res.json({
      success: true,
      data: {
        users,
        notes,
        downloads,
        openReports,
        last30Days: { users: newUsers, notes: newNotes, downloads: recentDownloads },
      },
    });
  })
);

router.get(
  "/users",
  validate(paginationSchema.extend({ q: z.string().optional() }), "query"),
  asyncHandler(async (req, res) => {
    const { page, limit, q } = req.query as unknown as { page: number; limit: number; q?: string };
    const where = q
      ? {
          OR: [
            { name: { contains: q } },
            { username: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : {};
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role: true,
          isBlocked: true,
          emailVerified: true,
          points: true,
          level: true,
          createdAt: true,
          _count: { select: { notes: true } },
        },
        ...paginate(page, limit),
      }),
    ]);
    res.json({ success: true, data: users, meta: pageMeta(total, page, limit) });
  })
);

router.patch(
  "/users/:id",
  // Promotion only: an existing admin may grant ADMIN to another user, but
  // revoking admin (demoting back to STUDENT) is intentionally not exposed —
  // it must be done directly in the database. So `role` accepts "ADMIN" only.
  validate(z.object({ isBlocked: z.boolean().optional(), role: z.literal("ADMIN").optional() })),
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user!.id) {
      throw ApiError.badRequest("You cannot modify your own account");
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
      select: { id: true, isBlocked: true, role: true },
    });
    if (req.body.isBlocked === true) {
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    }
    res.json({ success: true, data: user });
  })
);

router.get(
  "/notes",
  validate(
    paginationSchema.extend({
      q: z.string().optional(),
      status: z.enum(["PUBLISHED", "FLAGGED", "REMOVED"]).optional(),
      official: z.enum(["true", "false"]).optional(),
    }),
    "query"
  ),
  asyncHandler(async (req, res) => {
    const { page, limit, q, status, official } = req.query as unknown as {
      page: number; limit: number; q?: string; status?: "PUBLISHED" | "FLAGGED" | "REMOVED"; official?: "true" | "false";
    };
    const where = {
      ...(status ? { status } : {}),
      ...(official ? { isOfficial: official === "true" } : {}),
      ...(q ? { title: { contains: q } } : {}),
    };
    const [total, notes] = await Promise.all([
      prisma.note.count({ where }),
      prisma.note.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: { ...noteCardSelect, status: true },
        ...paginate(page, limit),
      }),
    ]);
    res.json({ success: true, data: notes, meta: pageMeta(total, page, limit) });
  })
);

router.patch(
  "/notes/:id/status",
  validate(z.object({ status: z.enum(["PUBLISHED", "FLAGGED", "REMOVED"]) })),
  asyncHandler(async (req, res) => {
    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
      select: { id: true, status: true, title: true, authorId: true },
    });
    if (req.body.status === "REMOVED") {
      await notify({
        userId: note.authorId,
        type: "SYSTEM",
        messageKey: "notif.noteRemoved",
        messageParams: { title: note.title },
      });
    }
    res.json({ success: true, data: note });
  })
);

router.get(
  "/reports",
  validate(
    paginationSchema.extend({
      status: z.enum(["OPEN", "RESOLVED", "DISMISSED"]).default("OPEN"),
    }),
    "query"
  ),
  asyncHandler(async (req, res) => {
    const { page, limit, status } = req.query as unknown as {
      page: number; limit: number; status: "OPEN" | "RESOLVED" | "DISMISSED";
    };
    const where = { status };
    const [total, reports] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          reporter: { select: { name: true, username: true } },
          note: { select: { id: true, title: true } },
          comment: { select: { id: true, content: true, noteId: true } },
        },
        ...paginate(page, limit),
      }),
    ]);
    res.json({ success: true, data: reports, meta: pageMeta(total, page, limit) });
  })
);

router.patch(
  "/reports/:id",
  validate(z.object({ status: z.enum(["RESOLVED", "DISMISSED"]) })),
  asyncHandler(async (req, res) => {
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json({ success: true, data: report });
  })
);

router.get(
  "/comments",
  validate(paginationSchema, "query"),
  asyncHandler(async (req, res) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const [total, comments] = await Promise.all([
      prisma.comment.count(),
      prisma.comment.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, username: true } },
          note: { select: { id: true, title: true } },
        },
        ...paginate(page, limit),
      }),
    ]);
    res.json({ success: true, data: comments, meta: pageMeta(total, page, limit) });
  })
);

router.patch(
  "/comments/:id/hide",
  validate(z.object({ isHidden: z.boolean() })),
  asyncHandler(async (req, res) => {
    const comment = await prisma.comment.update({
      where: { id: req.params.id },
      data: { isHidden: req.body.isHidden },
      select: { id: true, isHidden: true },
    });
    res.json({ success: true, data: comment });
  })
);

const subjectSchema = z.object({
  name: z.string().trim().min(2).max(60),
  icon: z.string().trim().min(1).max(8),
  description: z.string().trim().min(4).max(300),
  coverImage: z.string().url().optional().or(z.literal("")),
});

router.post(
  "/subjects",
  validate(subjectSchema),
  asyncHandler(async (req, res) => {
    const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const subject = await prisma.subject.create({
      data: {
        name: req.body.name,
        slug,
        icon: req.body.icon,
        description: req.body.description,
        coverImage: req.body.coverImage || null,
      },
    });
    res.status(201).json({ success: true, data: subject });
  })
);

router.patch(
  "/subjects/:id",
  validate(subjectSchema.partial()),
  asyncHandler(async (req, res) => {
    const subject = await prisma.subject.update({
      where: { id: req.params.id },
      data: {
        ...(req.body.name ? { name: req.body.name } : {}),
        ...(req.body.icon ? { icon: req.body.icon } : {}),
        ...(req.body.description ? { description: req.body.description } : {}),
        ...(req.body.coverImage !== undefined
          ? { coverImage: req.body.coverImage || null }
          : {}),
      },
    });
    res.json({ success: true, data: subject });
  })
);

// Removing a subject is blocked while official resources still reference it, so
// no notes/syllabuses are orphaned. Groups/problems use SetNull and are fine.
router.delete(
  "/subjects/:id",
  asyncHandler(async (req, res) => {
    const subject = await prisma.subject.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, _count: { select: { notes: true, syllabi: true } } },
    });
    if (!subject) throw ApiError.notFound("Subject not found");
    if (subject._count.notes > 0 || subject._count.syllabi > 0) {
      throw ApiError.badRequest(
        `“${subject.name}” still has ${subject._count.notes} note(s) and ${subject._count.syllabi} syllabus(es). Move or remove them first.`,
        {
          code: "SUBJECT_IN_USE",
          params: {
            name: subject.name,
            notes: subject._count.notes,
            syllabi: subject._count.syllabi,
          },
        }
      );
    }
    await prisma.subject.delete({ where: { id: subject.id } });
    res.json({ success: true, code: "SUBJECT_DELETED", message: "Subject deleted" });
  })
);

// All syllabuses regardless of status (the public list only returns PUBLISHED),
// so admins can manage archived ones too. Create/edit/delete live on /syllabus.
router.get(
  "/syllabi",
  validate(
    paginationSchema.extend({
      q: z.string().optional(),
      status: z.enum(["PUBLISHED", "ARCHIVED"]).optional(),
    }),
    "query"
  ),
  asyncHandler(async (req, res) => {
    const { page, limit, q, status } = req.query as unknown as {
      page: number; limit: number; q?: string; status?: "PUBLISHED" | "ARCHIVED";
    };
    const where = {
      ...(status ? { status } : {}),
      ...(q ? { title: { contains: q } } : {}),
    };
    const [total, syllabi] = await Promise.all([
      prisma.syllabus.count({ where }),
      prisma.syllabus.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          className: true,
          board: true,
          status: true,
          createdAt: true,
          subject: { select: { id: true, name: true, icon: true } },
          createdBy: { select: { name: true, username: true } },
          _count: { select: { topics: true, tracks: true } },
        },
        ...paginate(page, limit),
      }),
    ]);
    res.json({ success: true, data: syllabi, meta: pageMeta(total, page, limit) });
  })
);

router.get(
  "/analytics",
  asyncHandler(async (_req, res) => {
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    const [users, notes, downloads] = await Promise.all([
      prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      prisma.note.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      prisma.download.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    ]);

    const days: Record<string, { date: string; users: number; notes: number; downloads: number }> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      days[key] = { date: key, users: 0, notes: 0, downloads: 0 };
    }
    const bump = (list: { createdAt: Date }[], field: "users" | "notes" | "downloads") => {
      for (const item of list) {
        const key = item.createdAt.toISOString().slice(0, 10);
        if (days[key]) days[key][field]++;
      }
    };
    bump(users, "users");
    bump(notes, "notes");
    bump(downloads, "downloads");

    res.json({ success: true, data: Object.values(days) });
  })
);

export default router;
