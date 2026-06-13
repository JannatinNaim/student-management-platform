import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/error";
import { validate } from "../middleware/validate";
import { pageMeta, paginate, paginationSchema } from "../utils/pagination";
import { authorSelect } from "../utils/select";

const router = Router();

router.get(
  "/",
  requireAuth,
  validate(paginationSchema, "query"),
  asyncHandler(async (req, res) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const where = { userId: req.user!.id };
    const [total, unread, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, read: false } }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { actor: { select: authorSelect } },
        ...paginate(page, limit),
      }),
    ]);
    res.json({
      success: true,
      data: notifications,
      meta: { ...pageMeta(total, page, limit), unread },
    });
  })
);

router.post(
  "/read-all",
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true },
    });
    res.json({ success: true, code: "NOTIFICATIONS_MARKED_READ", message: "All notifications marked read" });
  })
);

router.post(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { read: true },
    });
    res.json({ success: true });
  })
);

export default router;
