import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";
import { noteCardSelect } from "../utils/select";

const router = Router();

router.get(
  "/overview",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const [noteAgg, likesReceived, bookmarks, user, achievements] = await Promise.all([
      prisma.note.aggregate({
        where: { authorId: userId, status: "PUBLISHED" },
        _sum: { downloadsCount: true, views: true },
        _count: true,
      }),
      prisma.like.count({ where: { note: { authorId: userId } } }),
      prisma.bookmark.count({ where: { userId } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { points: true, level: true },
      }),
      prisma.userAchievement.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: {
        notes: noteAgg._count,
        downloads: noteAgg._sum.downloadsCount ?? 0,
        views: noteAgg._sum.views ?? 0,
        likes: likesReceived,
        bookmarks,
        points: user?.points ?? 0,
        level: user?.level ?? 1,
        achievements,
      },
    });
  })
);

router.get(
  "/analytics",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    const [downloads, uploads] = await Promise.all([
      prisma.download.findMany({
        where: { note: { authorId: userId }, createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      prisma.note.findMany({
        where: { authorId: userId, createdAt: { gte: since } },
        select: { createdAt: true },
      }),
    ]);

    const days: Record<string, { date: string; downloads: number; uploads: number }> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      days[key] = { date: key, downloads: 0, uploads: 0 };
    }
    for (const dl of downloads) {
      const key = dl.createdAt.toISOString().slice(0, 10);
      if (days[key]) days[key].downloads++;
    }
    for (const up of uploads) {
      const key = up.createdAt.toISOString().slice(0, 10);
      if (days[key]) days[key].uploads++;
    }

    res.json({ success: true, data: Object.values(days) });
  })
);

router.get(
  "/my-notes",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notes = await prisma.note.findMany({
      where: { authorId: req.user!.id, status: { not: "REMOVED" } },
      orderBy: { createdAt: "desc" },
      select: { ...noteCardSelect, status: true },
      take: 50,
    });
    res.json({ success: true, data: notes });
  })
);

router.get(
  "/activity",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { actor: { select: { name: true, username: true, avatarUrl: true } } },
    });
    res.json({ success: true, data: notifications });
  })
);

export default router;
