import { Router } from "express";
import { z } from "zod";
import { notify } from "../lib/gamification";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { ApiError, asyncHandler } from "../middleware/error";
import { validate } from "../middleware/validate";
import { pageMeta, paginate, paginationSchema } from "../utils/pagination";
import { authorSelect } from "../utils/select";

const router = Router();

const contentSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  parentId: z.string().optional(),
});

const commentInclude = {
  user: { select: authorSelect },
  replies: {
    where: { isHidden: false },
    orderBy: { createdAt: "asc" as const },
    include: { user: { select: authorSelect } },
  },
};

router.get(
  "/notes/:id/comments",
  validate(paginationSchema, "query"),
  asyncHandler(async (req, res) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const where = { noteId: req.params.id, parentId: null, isHidden: false };
    const [total, comments] = await Promise.all([
      prisma.comment.count({ where }),
      prisma.comment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: commentInclude,
        ...paginate(page, limit),
      }),
    ]);
    res.json({ success: true, data: comments, meta: pageMeta(total, page, limit) });
  })
);

router.post(
  "/notes/:id/comments",
  requireAuth,
  validate(contentSchema),
  asyncHandler(async (req, res) => {
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      select: { id: true, title: true, authorId: true, status: true },
    });
    if (!note || note.status !== "PUBLISHED") throw ApiError.notFound("Note not found");

    let parent: { id: string; userId: string; noteId: string } | null = null;
    if (req.body.parentId) {
      parent = await prisma.comment.findUnique({
        where: { id: req.body.parentId },
        select: { id: true, userId: true, noteId: true },
      });
      if (!parent || parent.noteId !== note.id) throw ApiError.badRequest("Invalid parent comment");
    }

    const comment = await prisma.$transaction(async (tx) => {
      const created = await tx.comment.create({
        data: {
          content: req.body.content,
          userId: req.user!.id,
          noteId: note.id,
          parentId: parent?.id ?? null,
        },
        include: commentInclude,
      });
      await tx.note.update({
        where: { id: note.id },
        data: { commentsCount: { increment: 1 } },
      });
      return created;
    });

    if (parent) {
      await notify({
        userId: parent.userId,
        actorId: req.user!.id,
        type: "REPLY",
        messageKey: "notif.commentReply",
        messageParams: { title: note.title },
        link: `/notes/${note.id}#comments`,
      });
    } else {
      await notify({
        userId: note.authorId,
        actorId: req.user!.id,
        type: "COMMENT",
        messageKey: "notif.commented",
        messageParams: { title: note.title },
        link: `/notes/${note.id}#comments`,
      });
    }

    // @mentions -> notify mentioned users
    const content: string = req.body.content;
    const mentions = [...new Set(content.match(/@([a-z0-9_]{3,24})/gi) ?? [])].map((m) =>
      m.slice(1).toLowerCase()
    );
    if (mentions.length) {
      const users = await prisma.user.findMany({
        where: { username: { in: mentions } },
        select: { id: true },
      });
      await Promise.all(
        users.map((u) =>
          notify({
            userId: u.id,
            actorId: req.user!.id,
            type: "MENTION",
            messageKey: "notif.mentionComment",
            messageParams: { title: note.title },
            link: `/notes/${note.id}#comments`,
          })
        )
      );
    }

    res.status(201).json({ success: true, data: comment });
  })
);

router.patch(
  "/comments/:id",
  requireAuth,
  validate(z.object({ content: z.string().trim().min(1).max(2000) })),
  asyncHandler(async (req, res) => {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment || comment.isHidden) throw ApiError.notFound("Comment not found");
    if (comment.userId !== req.user!.id) throw ApiError.forbidden();
    const updated = await prisma.comment.update({
      where: { id: comment.id },
      data: { content: req.body.content },
      include: commentInclude,
    });
    res.json({ success: true, data: updated });
  })
);

router.delete(
  "/comments/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { replies: true } } },
    });
    if (!comment) throw ApiError.notFound("Comment not found");
    if (comment.userId !== req.user!.id && req.user!.role !== "ADMIN") {
      throw ApiError.forbidden();
    }
    const removed = 1 + comment._count.replies;
    await prisma.$transaction([
      prisma.comment.delete({ where: { id: comment.id } }),
      prisma.note.update({
        where: { id: comment.noteId },
        data: { commentsCount: { decrement: removed } },
      }),
    ]);
    res.json({ success: true, code: "COMMENT_DELETED", message: "Comment deleted" });
  })
);

router.post(
  "/comments/:id/report",
  requireAuth,
  validate(
    z.object({
      reason: z.string().trim().min(3).max(120),
      details: z.string().trim().max(1000).optional(),
    })
  ),
  asyncHandler(async (req, res) => {
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });
    if (!comment) throw ApiError.notFound("Comment not found");
    await prisma.report.create({
      data: {
        reason: req.body.reason,
        details: req.body.details,
        commentId: comment.id,
        reporterId: req.user!.id,
      },
    });
    res.status(201).json({ success: true, code: "REPORT_SUBMITTED", message: "Report submitted" });
  })
);

export default router;
