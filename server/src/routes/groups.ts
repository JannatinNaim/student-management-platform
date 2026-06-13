import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { optionalAuth, requireAuth } from "../middleware/auth";
import { ApiError, asyncHandler } from "../middleware/error";
import { validate } from "../middleware/validate";
import { pageMeta, paginate, paginationSchema } from "../utils/pagination";
import { authorSelect, groupCardSelect, problemCardSelect } from "../utils/select";

const router = Router();

const SORTS: Record<string, Prisma.ProblemGroupOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  members: { membersCount: "desc" },
  active: { problemsCount: "desc" },
};

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "group"
  );
}

const tagsSchema = z
  .string()
  .transform((value) =>
    value
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 8)
  )
  .or(z.array(z.string().trim().toLowerCase()).max(8));

const listSchema = paginationSchema.extend({
  q: z.string().trim().max(120).optional(),
  subject: z.string().optional(),
  tag: z.string().optional(),
  sort: z.enum(["newest", "oldest", "members", "active"]).default("active"),
});

router.get(
  "/",
  validate(listSchema, "query"),
  asyncHandler(async (req, res) => {
    const { q, subject, tag, sort, page, limit } = req.query as unknown as z.infer<typeof listSchema>;

    const where: Prisma.ProblemGroupWhereInput = {};
    if (subject) where.subject = { slug: subject };
    if (tag) where.tags = { contains: JSON.stringify(tag.toLowerCase()) };
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: JSON.stringify(q.toLowerCase()) } },
        { subject: { name: { contains: q } } },
      ];
    }

    const [total, groups] = await Promise.all([
      prisma.problemGroup.count({ where }),
      prisma.problemGroup.findMany({
        where,
        orderBy: SORTS[sort],
        select: groupCardSelect,
        ...paginate(page, limit),
      }),
    ]);

    res.json({ success: true, data: groups, meta: pageMeta(total, page, limit) });
  })
);

const createSchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().min(10).max(2000),
  subjectId: z.string().optional().or(z.literal("")),
  tags: tagsSchema.optional(),
});

router.post(
  "/",
  requireAuth,
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const { name, description, subjectId, tags } = req.body as z.infer<typeof createSchema>;

    if (subjectId) {
      const subject = await prisma.subject.findUnique({ where: { id: subjectId }, select: { id: true } });
      if (!subject) throw ApiError.badRequest("Unknown subject");
    }

    // Slugs are unique; append a short random suffix to avoid collisions.
    const base = slugify(name);
    const slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;

    const group = await prisma.$transaction(async (tx) => {
      const created = await tx.problemGroup.create({
        data: {
          name,
          slug,
          description,
          subjectId: subjectId || null,
          tags: (tags ?? []) as unknown as string,
          creatorId: req.user!.id,
        },
        select: groupCardSelect,
      });
      await tx.groupMember.create({
        data: { groupId: created.id, userId: req.user!.id, role: "OWNER" },
      });
      return created;
    });

    res.status(201).json({ success: true, data: { ...group, viewer: { membership: "OWNER" } } });
  })
);

/** Resolve a group by cuid or slug. */
async function findGroup(idOrSlug: string) {
  return prisma.problemGroup.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    select: groupCardSelect,
  });
}

router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const group = await findGroup(req.params.id);
    if (!group) throw ApiError.notFound("Group not found");

    let viewer: { membership: string | null } | null = null;
    if (req.user) {
      const member = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: group.id, userId: req.user.id } },
        select: { role: true },
      });
      viewer = { membership: member?.role ?? null };
    }

    res.json({ success: true, data: { ...group, viewer } });
  })
);

router.post(
  "/:id/join",
  requireAuth,
  asyncHandler(async (req, res) => {
    const group = await prisma.problemGroup.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!group) throw ApiError.notFound("Group not found");

    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId: req.user!.id } },
    });
    if (!existing) {
      await prisma.$transaction([
        prisma.groupMember.create({ data: { groupId: group.id, userId: req.user!.id, role: "MEMBER" } }),
        prisma.problemGroup.update({ where: { id: group.id }, data: { membersCount: { increment: 1 } } }),
      ]);
    }
    res.json({ success: true, data: { membership: existing?.role ?? "MEMBER" } });
  })
);

router.delete(
  "/:id/join",
  requireAuth,
  asyncHandler(async (req, res) => {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: req.params.id, userId: req.user!.id } },
    });
    if (!member) return res.json({ success: true, data: { membership: null } });
    if (member.role === "OWNER") throw ApiError.badRequest("The owner cannot leave their own group");

    await prisma.$transaction([
      prisma.groupMember.delete({
        where: { groupId_userId: { groupId: req.params.id, userId: req.user!.id } },
      }),
      prisma.problemGroup.update({ where: { id: req.params.id }, data: { membersCount: { decrement: 1 } } }),
    ]);
    res.json({ success: true, data: { membership: null } });
  })
);

const problemSorts: Record<string, Prisma.ProblemOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  active: { messagesCount: "desc" },
  views: { views: "desc" },
};

const groupProblemsSchema = paginationSchema.extend({
  status: z.enum(["OPEN", "SOLVED"]).optional(),
  sort: z.enum(["newest", "active", "views"]).default("newest"),
});

router.get(
  "/:id/problems",
  validate(groupProblemsSchema, "query"),
  asyncHandler(async (req, res) => {
    const { status, sort, page, limit } = req.query as unknown as z.infer<typeof groupProblemsSchema>;
    const where: Prisma.ProblemWhereInput = { groupId: req.params.id };
    if (status) where.status = status;

    const [total, problems] = await Promise.all([
      prisma.problem.count({ where }),
      prisma.problem.findMany({
        where,
        orderBy: problemSorts[sort],
        select: problemCardSelect,
        ...paginate(page, limit),
      }),
    ]);
    res.json({ success: true, data: problems, meta: pageMeta(total, page, limit) });
  })
);

router.get(
  "/:id/members",
  validate(paginationSchema, "query"),
  asyncHandler(async (req, res) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const where = { groupId: req.params.id };
    const [total, members] = await Promise.all([
      prisma.groupMember.count({ where }),
      prisma.groupMember.findMany({
        where,
        // OWNER first, then MODERATOR, then members by join date
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
        select: { role: true, createdAt: true, user: { select: authorSelect } },
        ...paginate(page, limit),
      }),
    ]);
    res.json({ success: true, data: members, meta: pageMeta(total, page, limit) });
  })
);

const updateSchema = createSchema.partial().omit({ subjectId: true });

async function requireOwner(groupId: string, userId: string, role: string) {
  if (role === "ADMIN") return;
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { role: true },
  });
  if (member?.role !== "OWNER") throw ApiError.forbidden();
}

router.patch(
  "/:id",
  requireAuth,
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const group = await prisma.problemGroup.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!group) throw ApiError.notFound("Group not found");
    await requireOwner(group.id, req.user!.id, req.user!.role);

    // req.body holds validated { name?, description?, tags?:string[] }; the prisma
    // extension serializes the tags array to a JSON string transparently.
    const updated = await prisma.problemGroup.update({
      where: { id: group.id },
      data: { ...req.body },
      select: groupCardSelect,
    });
    res.json({ success: true, data: updated });
  })
);

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const group = await prisma.problemGroup.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!group) throw ApiError.notFound("Group not found");
    await requireOwner(group.id, req.user!.id, req.user!.role);
    await prisma.problemGroup.delete({ where: { id: group.id } });
    res.json({ success: true, code: "GROUP_DELETED", message: "Group deleted" });
  })
);

export default router;
