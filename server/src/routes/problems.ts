import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { awardPoints, notify, POINTS } from "../lib/gamification";
import { prisma } from "../lib/prisma";
import { emitToProblem } from "../lib/realtime";
import { deleteFile, storeFile } from "../lib/storage";
import { optionalAuth, requireAuth } from "../middleware/auth";
import { ApiError, asyncHandler } from "../middleware/error";
import { uploadLimiter } from "../middleware/rateLimit";
import { inspectFile, upload } from "../middleware/upload";
import { validate } from "../middleware/validate";
import { pageMeta, paginate, paginationSchema } from "../utils/pagination";
import { messageSelect, problemCardSelect } from "../utils/select";

const router = Router();

const SORTS: Record<string, Prisma.ProblemOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  active: { messagesCount: "desc" },
  views: { views: "desc" },
};

const listSchema = paginationSchema.extend({
  q: z.string().trim().max(120).optional(),
  subject: z.string().optional(),
  tag: z.string().optional(),
  group: z.string().optional(),
  status: z.enum(["OPEN", "SOLVED"]).optional(),
  exclude: z.string().optional(),
  sort: z.enum(["newest", "oldest", "active", "views"]).default("newest"),
});

router.get(
  "/",
  validate(listSchema, "query"),
  asyncHandler(async (req, res) => {
    const { q, subject, tag, group, status, exclude, sort, page, limit } =
      req.query as unknown as z.infer<typeof listSchema>;

    const where: Prisma.ProblemWhereInput = {};
    if (subject) where.subject = { slug: subject };
    if (group) where.groupId = group;
    if (status) where.status = status;
    if (exclude) where.id = { not: exclude };
    if (tag) where.tags = { contains: JSON.stringify(tag.toLowerCase()) };
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { body: { contains: q } },
        { tags: { contains: JSON.stringify(q.toLowerCase()) } },
        { subject: { name: { contains: q } } },
        { group: { name: { contains: q } } },
      ];
    }

    const [total, problems] = await Promise.all([
      prisma.problem.count({ where }),
      prisma.problem.findMany({
        where,
        orderBy: SORTS[sort],
        select: problemCardSelect,
        ...paginate(page, limit),
      }),
    ]);

    res.json({ success: true, data: problems, meta: pageMeta(total, page, limit) });
  })
);

router.get(
  "/suggestions",
  validate(z.object({ q: z.string().trim().min(1).max(120) }), "query"),
  asyncHandler(async (req, res) => {
    const q = String(req.query.q);
    const problems = await prisma.problem.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { tags: { contains: JSON.stringify(q.toLowerCase()) } },
          { group: { name: { contains: q } } },
        ],
      },
      select: {
        id: true,
        title: true,
        status: true,
        group: { select: { name: true } },
      },
      orderBy: { messagesCount: "desc" },
      take: 6,
    });
    res.json({ success: true, data: problems });
  })
);

const createSchema = z.object({
  groupId: z.string().min(1),
  title: z.string().trim().min(6).max(160),
  body: z.string().trim().min(10).max(5000),
  tags: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 8)
    )
    .or(z.array(z.string().trim().toLowerCase()).max(8))
    .optional(),
});

/** Ensure the user belongs to the group; returns the membership role. */
async function requireMembership(groupId: string, userId: string): Promise<string> {
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { role: true },
  });
  if (!member) throw ApiError.forbidden("Join this group to participate");
  return member.role;
}

router.post(
  "/",
  requireAuth,
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const { groupId, title, body, tags } = req.body as z.infer<typeof createSchema>;

    const group = await prisma.problemGroup.findUnique({
      where: { id: groupId },
      select: { id: true, subjectId: true },
    });
    if (!group) throw ApiError.notFound("Group not found");
    await requireMembership(group.id, req.user!.id);

    const problem = await prisma.$transaction(async (tx) => {
      const created = await tx.problem.create({
        data: {
          title,
          body,
          tags: (tags ?? []) as unknown as string,
          groupId: group.id,
          authorId: req.user!.id,
          subjectId: group.subjectId,
        },
        select: problemCardSelect,
      });
      await tx.problemGroup.update({
        where: { id: group.id },
        data: { problemsCount: { increment: 1 } },
      });
      return created;
    });

    await awardPoints(req.user!.id, POINTS.PROBLEM_POSTED);
    res.status(201).json({ success: true, data: problem });
  })
);

const problemDetailSelect = {
  ...problemCardSelect,
  body: true,
  solutionMessageId: true,
  updatedAt: true,
} as const;

router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const problem = await prisma.problem
      .update({
        where: { id: req.params.id },
        data: { views: { increment: 1 } },
        select: problemDetailSelect,
      })
      .catch(() => null);
    if (!problem) throw ApiError.notFound("Problem not found");

    let viewer: { membership: string | null; isAuthor: boolean } | null = null;
    if (req.user) {
      const member = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: problem.group.id, userId: req.user.id } },
        select: { role: true },
      });
      viewer = { membership: member?.role ?? null, isAuthor: problem.author.id === req.user.id };
    }

    res.json({ success: true, data: { ...problem, viewer } });
  })
);

router.get(
  "/:id/messages",
  validate(paginationSchema, "query"),
  asyncHandler(async (req, res) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const where = { problemId: req.params.id };
    const [total, messages] = await Promise.all([
      prisma.problemMessage.count({ where }),
      prisma.problemMessage.findMany({
        where,
        orderBy: { createdAt: "asc" },
        select: messageSelect,
        ...paginate(page, limit),
      }),
    ]);
    res.json({ success: true, data: messages, meta: pageMeta(total, page, limit) });
  })
);

router.post(
  "/:id/messages",
  requireAuth,
  uploadLimiter,
  upload.single("attachment"),
  // content is optional when a file is attached; both empty is rejected below.
  validate(z.object({ content: z.string().trim().max(4000).optional() })),
  asyncHandler(async (req, res) => {
    const content = (req.body.content as string | undefined)?.trim() ?? "";
    const file = req.file;
    if (!content && !file) throw ApiError.badRequest("Write a message or attach a file");

    const problem = await prisma.problem.findUnique({
      where: { id: req.params.id },
      select: { id: true, title: true, groupId: true, authorId: true },
    });
    if (!problem) throw ApiError.notFound("Problem not found");
    await requireMembership(problem.groupId, req.user!.id);

    // Validate the attachment's content against its extension and store it.
    let attachment: { url: string; name: string; type: string; size: number } | null = null;
    if (file) {
      const inspected = inspectFile(file);
      const stored = await storeFile(file.buffer, file.originalname, "problems");
      attachment = {
        url: stored.url,
        name: file.originalname.slice(0, 200),
        type: inspected.mime,
        size: file.size,
      };
    }

    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.problemMessage.create({
        data: {
          content,
          problemId: problem.id,
          authorId: req.user!.id,
          attachmentUrl: attachment?.url ?? null,
          attachmentName: attachment?.name ?? null,
          attachmentType: attachment?.type ?? null,
          attachmentSize: attachment?.size ?? null,
        },
        select: messageSelect,
      });
      await tx.problem.update({
        where: { id: problem.id },
        data: { messagesCount: { increment: 1 } },
      });
      return created;
    });

    // Broadcast to everyone viewing the problem in realtime.
    emitToProblem(problem.id, "message:new", message);

    // Notify the problem author (unless they wrote the message themselves).
    await notify({
      userId: problem.authorId,
      actorId: req.user!.id,
      type: "PROBLEM_REPLY",
      messageKey: "notif.problemReply",
      messageParams: { title: problem.title },
      link: `/problems/${problem.id}`,
    });

    // @mentions -> notify mentioned users (mirrors note comments).
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
            messageKey: "notif.mentionProblem",
            messageParams: { title: problem.title },
            link: `/problems/${problem.id}`,
          })
        )
      );
    }

    res.status(201).json({ success: true, data: message });
  })
);

router.post(
  "/:id/solve",
  requireAuth,
  validate(z.object({ messageId: z.string().min(1) })),
  asyncHandler(async (req, res) => {
    const problem = await prisma.problem.findUnique({
      where: { id: req.params.id },
      select: { id: true, title: true, groupId: true, authorId: true, solutionMessageId: true },
    });
    if (!problem) throw ApiError.notFound("Problem not found");

    // Only the problem author or a group OWNER/MODERATOR may accept a solution.
    if (problem.authorId !== req.user!.id && req.user!.role !== "ADMIN") {
      const role = await requireMembership(problem.groupId, req.user!.id);
      if (role !== "OWNER" && role !== "MODERATOR") throw ApiError.forbidden();
    }

    const message = await prisma.problemMessage.findUnique({
      where: { id: req.body.messageId },
      select: { id: true, authorId: true, problemId: true },
    });
    if (!message || message.problemId !== problem.id) throw ApiError.badRequest("Invalid message");

    await prisma.$transaction(async (tx) => {
      // Clear any previously accepted solution flag.
      if (problem.solutionMessageId && problem.solutionMessageId !== message.id) {
        await tx.problemMessage.update({
          where: { id: problem.solutionMessageId },
          data: { isSolution: false },
        });
      }
      await tx.problemMessage.update({ where: { id: message.id }, data: { isSolution: true } });
      await tx.problem.update({
        where: { id: problem.id },
        data: { status: "SOLVED", solutionMessageId: message.id },
      });
    });

    emitToProblem(problem.id, "problem:solved", { problemId: problem.id, messageId: message.id });

    if (message.authorId !== req.user!.id) {
      await awardPoints(message.authorId, POINTS.SOLUTION_ACCEPTED);
      await notify({
        userId: message.authorId,
        actorId: req.user!.id,
        type: "PROBLEM_SOLVED",
        messageKey: "notif.solutionAccepted",
        messageParams: { title: problem.title },
        link: `/problems/${problem.id}`,
      });
    }

    res.json({ success: true, data: { status: "SOLVED", solutionMessageId: message.id } });
  })
);

const updateSchema = z.object({
  title: z.string().trim().min(6).max(160).optional(),
  body: z.string().trim().min(10).max(5000).optional(),
  tags: z.array(z.string().trim().toLowerCase()).max(8).optional(),
});

router.patch(
  "/:id",
  requireAuth,
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const problem = await prisma.problem.findUnique({
      where: { id: req.params.id },
      select: { id: true, authorId: true },
    });
    if (!problem) throw ApiError.notFound("Problem not found");
    if (problem.authorId !== req.user!.id && req.user!.role !== "ADMIN") throw ApiError.forbidden();

    const updated = await prisma.problem.update({
      where: { id: problem.id },
      data: { ...req.body },
      select: problemDetailSelect,
    });
    res.json({ success: true, data: updated });
  })
);

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const problem = await prisma.problem.findUnique({
      where: { id: req.params.id },
      select: { id: true, groupId: true, authorId: true },
    });
    if (!problem) throw ApiError.notFound("Problem not found");

    let allowed = problem.authorId === req.user!.id || req.user!.role === "ADMIN";
    if (!allowed) {
      const member = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: problem.groupId, userId: req.user!.id } },
        select: { role: true },
      });
      allowed = member?.role === "OWNER" || member?.role === "MODERATOR";
    }
    if (!allowed) throw ApiError.forbidden();

    // Collect attachment files before the cascade deletes their message rows.
    const attachments = await prisma.problemMessage.findMany({
      where: { problemId: problem.id, attachmentUrl: { not: null } },
      select: { attachmentUrl: true },
    });

    await prisma.$transaction([
      prisma.problem.delete({ where: { id: problem.id } }),
      prisma.problemGroup.update({
        where: { id: problem.groupId },
        data: { problemsCount: { decrement: 1 } },
      }),
    ]);
    await Promise.all(attachments.map((m) => deleteFile(m.attachmentUrl)));
    res.json({ success: true, code: "PROBLEM_DELETED", message: "Problem deleted" });
  })
);

router.delete(
  "/messages/:mid",
  requireAuth,
  asyncHandler(async (req, res) => {
    const message = await prisma.problemMessage.findUnique({
      where: { id: req.params.mid },
      select: {
        id: true,
        authorId: true,
        problemId: true,
        attachmentUrl: true,
        problem: { select: { groupId: true } },
      },
    });
    if (!message) throw ApiError.notFound("Message not found");

    let allowed = message.authorId === req.user!.id || req.user!.role === "ADMIN";
    if (!allowed) {
      const member = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: message.problem.groupId, userId: req.user!.id } },
        select: { role: true },
      });
      allowed = member?.role === "OWNER" || member?.role === "MODERATOR";
    }
    if (!allowed) throw ApiError.forbidden();

    await prisma.$transaction([
      prisma.problemMessage.delete({ where: { id: message.id } }),
      prisma.problem.update({
        where: { id: message.problemId },
        data: { messagesCount: { decrement: 1 } },
      }),
    ]);
    await deleteFile(message.attachmentUrl);
    emitToProblem(message.problemId, "message:deleted", { id: message.id });
    res.json({ success: true, code: "MESSAGE_DELETED", message: "Message deleted" });
  })
);

router.post(
  "/:id/report",
  requireAuth,
  validate(
    z.object({
      reason: z.string().trim().min(3).max(120),
      details: z.string().trim().max(1000).optional(),
    })
  ),
  asyncHandler(async (req, res) => {
    const problem = await prisma.problem.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!problem) throw ApiError.notFound("Problem not found");
    await prisma.report.create({
      data: {
        reason: req.body.reason,
        details: req.body.details,
        problemId: problem.id,
        reporterId: req.user!.id,
      },
    });
    res.status(201).json({
      success: true,
      code: "REPORT_SUBMITTED_MODERATED",
      message: "Report submitted. Our moderators will review it.",
    });
  })
);

export default router;
