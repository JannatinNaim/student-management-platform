import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { notes: { where: { status: "PUBLISHED" } }, groups: true },
        },
      },
    });
    res.json({
      success: true,
      data: subjects.map(({ _count, ...subject }) => ({
        ...subject,
        notesCount: _count.notes,
        groupsCount: _count.groups,
      })),
    });
  })
);

export default router;
