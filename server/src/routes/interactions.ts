import { Router } from "express";
import { z } from "zod";
import { awardPoints, checkAchievements, notify, POINTS } from "../lib/gamification";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { ApiError, asyncHandler } from "../middleware/error";
import { validate } from "../middleware/validate";
import { pageMeta, paginate, paginationSchema } from "../utils/pagination";
import { noteCardSelect } from "../utils/select";

const router = Router();

async function getPublishedNote(noteId: string) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { id: true, title: true, authorId: true, status: true },
  });
  if (!note || note.status !== "PUBLISHED") throw ApiError.notFound("Note not found");
  return note;
}

// ---- Ratings ----
router.put(
  "/notes/:id/rating",
  requireAuth,
  validate(z.object({ value: z.coerce.number().int().min(1).max(5) })),
  asyncHandler(async (req, res) => {
    const note = await getPublishedNote(req.params.id);
    if (note.authorId === req.user!.id) {
      throw ApiError.badRequest("You cannot rate your own note");
    }
    const value: number = req.body.value;

    const previous = await prisma.rating.findUnique({
      where: { userId_noteId: { userId: req.user!.id, noteId: note.id } },
    });

    await prisma.rating.upsert({
      where: { userId_noteId: { userId: req.user!.id, noteId: note.id } },
      create: { userId: req.user!.id, noteId: note.id, value },
      update: { value },
    });

    const agg = await prisma.rating.aggregate({
      where: { noteId: note.id },
      _avg: { value: true },
      _count: true,
    });
    const updated = await prisma.note.update({
      where: { id: note.id },
      data: {
        avgRating: Math.round((agg._avg.value ?? 0) * 100) / 100,
        ratingsCount: agg._count,
      },
      select: { avgRating: true, ratingsCount: true },
    });

    if (value === 5 && previous?.value !== 5) {
      await awardPoints(note.authorId, POINTS.FIVE_STAR_RATING);
    }
    if (!previous) {
      await notify({
        userId: note.authorId,
        actorId: req.user!.id,
        type: "RATING",
        messageKey: "notif.rated",
        messageParams: { title: note.title, value },
        link: `/notes/${note.id}`,
      });
    }
    await checkAchievements(note.authorId);

    res.json({ success: true, data: { ...updated, yourRating: value } });
  })
);

router.get(
  "/notes/:id/rating-stats",
  asyncHandler(async (req, res) => {
    const grouped = await prisma.rating.groupBy({
      by: ["value"],
      where: { noteId: req.params.id },
      _count: true,
    });
    const distribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: grouped.find((g) => g.value === star)?._count ?? 0,
    }));
    res.json({ success: true, data: distribution });
  })
);

// ---- Likes ----
router.post(
  "/notes/:id/like",
  requireAuth,
  asyncHandler(async (req, res) => {
    const note = await getPublishedNote(req.params.id);
    const key = { userId_noteId: { userId: req.user!.id, noteId: note.id } };
    const existing = await prisma.like.findUnique({ where: key });

    if (existing) {
      const [, updated] = await prisma.$transaction([
        prisma.like.delete({ where: key }),
        prisma.note.update({
          where: { id: note.id },
          data: { likesCount: { decrement: 1 } },
          select: { likesCount: true },
        }),
      ]);
      return res.json({ success: true, data: { liked: false, likesCount: updated.likesCount } });
    }

    const [, updated] = await prisma.$transaction([
      prisma.like.create({ data: { userId: req.user!.id, noteId: note.id } }),
      prisma.note.update({
        where: { id: note.id },
        data: { likesCount: { increment: 1 } },
        select: { likesCount: true },
      }),
    ]);
    if (note.authorId !== req.user!.id) {
      await awardPoints(note.authorId, POINTS.LIKE_RECEIVED);
      await notify({
        userId: note.authorId,
        actorId: req.user!.id,
        type: "LIKE",
        messageKey: "notif.liked",
        messageParams: { title: note.title },
        link: `/notes/${note.id}`,
      });
      await checkAchievements(note.authorId);
    }
    res.json({ success: true, data: { liked: true, likesCount: updated.likesCount } });
  })
);

// ---- Bookmarks ----
router.post(
  "/notes/:id/bookmark",
  requireAuth,
  asyncHandler(async (req, res) => {
    const note = await getPublishedNote(req.params.id);
    const key = { userId_noteId: { userId: req.user!.id, noteId: note.id } };
    const existing = await prisma.bookmark.findUnique({ where: key });
    if (existing) {
      await prisma.bookmark.delete({ where: key });
      return res.json({ success: true, data: { bookmarked: false } });
    }
    await prisma.bookmark.create({ data: { userId: req.user!.id, noteId: note.id } });
    res.json({ success: true, data: { bookmarked: true } });
  })
);

router.get(
  "/bookmarks",
  requireAuth,
  validate(
    paginationSchema.extend({
      subject: z.string().optional(),
      sort: z.enum(["newest", "oldest"]).default("newest"),
    }),
    "query"
  ),
  asyncHandler(async (req, res) => {
    const { page, limit, subject, sort } = req.query as unknown as {
      page: number; limit: number; subject?: string; sort: "newest" | "oldest";
    };
    const where = {
      userId: req.user!.id,
      ...(subject ? { note: { subject: { slug: subject } } } : {}),
    };
    const [total, bookmarks] = await Promise.all([
      prisma.bookmark.count({ where }),
      prisma.bookmark.findMany({
        where,
        orderBy: { createdAt: sort === "newest" ? "desc" : "asc" },
        include: { note: { select: noteCardSelect } },
        ...paginate(page, limit),
      }),
    ]);
    res.json({
      success: true,
      data: bookmarks.map((b) => ({ savedAt: b.createdAt, ...b.note })),
      meta: pageMeta(total, page, limit),
    });
  })
);

export default router;
