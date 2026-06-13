import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";
import { publicUserSelect } from "../utils/select";

const router = Router();

router.get(
  "/platform",
  asyncHandler(async (_req, res) => {
    const [students, notes, downloads, contributors] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.note.count({ where: { status: "PUBLISHED" } }),
      prisma.download.count(),
      prisma.user.count({
        where: { notes: { some: { status: "PUBLISHED" } } },
      }),
    ]);
    res.json({ success: true, data: { students, notes, downloads, contributors } });
  })
);

router.get(
  "/leaderboard",
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 20), 50);
    const users = await prisma.user.findMany({
      where: { role: "STUDENT", isBlocked: false, points: { gt: 0 } },
      orderBy: { points: "desc" },
      take: limit,
      select: {
        ...publicUserSelect,
        _count: { select: { notes: { where: { status: "PUBLISHED" } }, followers: true } },
      },
    });
    res.json({
      success: true,
      data: users.map((u, i) => ({
        rank: i + 1,
        ...u,
        notesCount: u._count.notes,
        followersCount: u._count.followers,
      })),
    });
  })
);

router.get(
  "/top-contributors",
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      where: { role: "STUDENT", isBlocked: false, notes: { some: { status: "PUBLISHED" } } },
      orderBy: { points: "desc" },
      take: 6,
      select: {
        ...publicUserSelect,
        _count: { select: { notes: { where: { status: "PUBLISHED" } } } },
      },
    });
    res.json({
      success: true,
      data: users.map((u) => ({ ...u, notesCount: u._count.notes })),
    });
  })
);

export default router;
