import { Prisma } from "@prisma/client";
import { Router } from "express";
import path from "path";
import { z } from "zod";
import { awardPoints, checkAchievements, POINTS } from "../lib/gamification";
import { prisma } from "../lib/prisma";
import { deleteFile, fileHash, storeFile, UPLOAD_DIR } from "../lib/storage";
import { optionalAuth, requireAuth } from "../middleware/auth";
import { ApiError, asyncHandler } from "../middleware/error";
import { uploadLimiter } from "../middleware/rateLimit";
import { upload, inspectFile, FileCategory } from "../middleware/upload";
import { validate } from "../middleware/validate";
import { pageMeta, paginate, paginationSchema } from "../utils/pagination";
import { noteCardSelect } from "../utils/select";

const router = Router();

const SORTS: Record<string, Prisma.NoteOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  downloads: { downloadsCount: "desc" },
  rating: { avgRating: "desc" },
  likes: { likesCount: "desc" },
  views: { views: "desc" },
};

const listSchema = paginationSchema.extend({
  q: z.string().trim().max(120).optional(),
  subject: z.string().optional(),
  type: z.enum(["PDF", "IMAGE", "HANDWRITTEN"]).optional(),
  author: z.string().optional(),
  tag: z.string().optional(),
  official: z.enum(["true", "false"]).optional(),
  sort: z.enum(["newest", "oldest", "downloads", "rating", "likes", "views"]).default("newest"),
});

router.get(
  "/",
  validate(listSchema, "query"),
  asyncHandler(async (req, res) => {
    const { q, subject, type, author, tag, official, sort, page, limit } = req.query as unknown as z.infer<typeof listSchema>;

    const where: Prisma.NoteWhereInput = { status: "PUBLISHED" };
    if (subject) where.subject = { slug: subject };
    if (type) where.type = type;
    if (official) where.isOfficial = official === "true";
    if (author) where.author = { username: author };
    // tags are stored as a JSON string e.g. ["mechanics","summary"]; match the
    // quoted token to avoid partial-word collisions.
    if (tag) where.tags = { contains: JSON.stringify(tag.toLowerCase()) };
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { chapter: { contains: q } },
        { tags: { contains: JSON.stringify(q.toLowerCase()) } },
        { subject: { name: { contains: q } } },
        { author: { name: { contains: q } } },
        { author: { username: { contains: q } } },
      ];
    }

    const [total, notes] = await Promise.all([
      prisma.note.count({ where }),
      prisma.note.findMany({
        where,
        // Official, admin-curated resources always rank above community notes.
        orderBy: [{ isOfficial: "desc" }, SORTS[sort]],
        select: noteCardSelect,
        ...paginate(page, limit),
      }),
    ]);

    res.json({ success: true, data: notes, meta: pageMeta(total, page, limit) });
  })
);

router.get(
  "/suggestions",
  validate(z.object({ q: z.string().trim().min(1).max(120) }), "query"),
  asyncHandler(async (req, res) => {
    const q = String(req.query.q);
    const notes = await prisma.note.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q } },
          { chapter: { contains: q } },
          { subject: { name: { contains: q } } },
        ],
      },
      select: { id: true, title: true, subject: { select: { name: true } } },
      orderBy: { downloadsCount: "desc" },
      take: 6,
    });
    res.json({ success: true, data: notes });
  })
);

router.get(
  "/trending",
  asyncHandler(async (_req, res) => {
    // Trending = engagement-weighted activity over the last 14 days
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const recentDownloads = await prisma.download.groupBy({
      by: ["noteId"],
      where: { createdAt: { gte: since } },
      _count: { noteId: true },
      orderBy: { _count: { noteId: "desc" } },
      take: 50,
    });
    const ids = recentDownloads.map((d) => d.noteId);
    const notes = await prisma.note.findMany({
      where: ids.length
        ? { id: { in: ids }, status: "PUBLISHED" }
        : { status: "PUBLISHED" },
      select: noteCardSelect,
      take: 8,
      orderBy: ids.length ? undefined : { downloadsCount: "desc" },
    });
    if (ids.length) {
      const score = new Map(recentDownloads.map((d) => [d.noteId, d._count.noteId]));
      notes.sort((a, b) => (score.get(b.id) ?? 0) - (score.get(a.id) ?? 0));
    }
    res.json({ success: true, data: notes.slice(0, 8) });
  })
);

router.get(
  "/top-rated",
  asyncHandler(async (_req, res) => {
    const notes = await prisma.note.findMany({
      where: { status: "PUBLISHED", ratingsCount: { gte: 1 } },
      orderBy: [{ avgRating: "desc" }, { ratingsCount: "desc" }],
      select: noteCardSelect,
      take: 8,
    });
    res.json({ success: true, data: notes });
  })
);

router.get(
  "/official",
  asyncHandler(async (_req, res) => {
    const notes = await prisma.note.findMany({
      where: { status: "PUBLISHED", isOfficial: true },
      orderBy: [{ downloadsCount: "desc" }, { createdAt: "desc" }],
      select: noteCardSelect,
      take: 8,
    });
    res.json({ success: true, data: notes });
  })
);

router.get(
  "/recent",
  asyncHandler(async (_req, res) => {
    const notes = await prisma.note.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      select: noteCardSelect,
      take: 8,
    });
    res.json({ success: true, data: notes });
  })
);

const createSchema = z.object({
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().min(10).max(3000),
  subjectId: z.string().min(1),
  chapter: z.string().trim().min(1).max(120),
  tags: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 8)
    ),
  type: z.enum(["PDF", "IMAGE", "HANDWRITTEN", "DOCUMENT"]),
  className: z.string().trim().max(60).optional().or(z.literal("")),
  board: z.string().trim().max(60).optional().or(z.literal("")),
  college: z.string().trim().max(120).optional().or(z.literal("")),
  teacherName: z.string().trim().max(60).optional().or(z.literal("")),
  // Sent by the upload form as a string; only honored when the uploader is an admin.
  isOfficial: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
});

router.post(
  "/",
  requireAuth,
  uploadLimiter,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const file = files?.file?.[0];
    const thumbnail = files?.thumbnail?.[0];
    if (!file) throw ApiError.badRequest("A note file is required");

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw ApiError.unauthorized();

    // Validates content against the extension and returns the canonical
    // category + MIME type (browser-declared mimetype is not trusted).
    const inspected = inspectFile(file);
    if (thumbnail && inspectFile(thumbnail).category !== "IMAGE") {
      throw ApiError.badRequest("Thumbnail must be a valid image");
    }

    // Keep the user-declared note type consistent with the actual file.
    const allowedTypes: Record<FileCategory, string[]> = {
      PDF: ["PDF"],
      IMAGE: ["IMAGE", "HANDWRITTEN"],
      DOCUMENT: ["DOCUMENT"],
    };
    if (!allowedTypes[inspected.category].includes(req.body.type)) {
      throw ApiError.badRequest(
        `A ${inspected.category.toLowerCase()} file cannot be uploaded as "${req.body.type}"`,
        {
          code: "FILE_CATEGORY_MISMATCH",
          params: { category: inspected.category.toLowerCase(), type: req.body.type },
        }
      );
    }

    const hash = fileHash(file.buffer);
    const duplicate = await prisma.note.findFirst({
      where: { authorId: user.id, fileHash: hash, status: { not: "REMOVED" } },
      select: { id: true, title: true },
    });
    if (duplicate) {
      throw ApiError.conflict(`You already uploaded this file as "${duplicate.title}"`, {
        code: "DUPLICATE_FILE",
        params: { title: duplicate.title },
      });
    }

    const stored = await storeFile(file.buffer, file.originalname, "notes");
    const storedThumb = thumbnail
      ? await storeFile(thumbnail.buffer, thumbnail.originalname, "thumbnails")
      : null;

    const { title, description, subjectId, chapter, tags, type, className, board, college, teacherName, isOfficial } = req.body;

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw ApiError.badRequest("Unknown subject");

    const note = await prisma.note.create({
      data: {
        title,
        description,
        subjectId,
        chapter,
        tags,
        type,
        fileUrl: stored.url,
        fileType: inspected.mime,
        fileSize: file.size,
        fileHash: hash,
        thumbnailUrl: storedThumb?.url ?? (inspected.category === "IMAGE" ? stored.url : null),
        className: className || null,
        board: board || null,
        college: college || null,
        teacherName: teacherName || null,
        isOfficial: user.role === "ADMIN" ? Boolean(isOfficial) : false,
        authorId: user.id,
      },
      select: noteCardSelect,
    });

    await awardPoints(user.id, POINTS.UPLOAD);
    await checkAchievements(user.id);

    res.status(201).json({ success: true, data: note });
  })
);

router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
      select: {
        ...noteCardSelect,
        fileUrl: true,
        fileSize: true,
        status: true,
        className: true,
        board: true,
        college: true,
        teacherName: true,
        updatedAt: true,
      },
    }).catch(() => null);
    if (!note || (note.status !== "PUBLISHED" && req.user?.role !== "ADMIN" && note.author.id !== req.user?.id)) {
      throw ApiError.notFound("Note not found");
    }

    let viewer: { liked: boolean; bookmarked: boolean; rating: number | null } | null = null;
    if (req.user) {
      const [like, bookmark, rating] = await Promise.all([
        prisma.like.findUnique({ where: { userId_noteId: { userId: req.user.id, noteId: note.id } } }),
        prisma.bookmark.findUnique({ where: { userId_noteId: { userId: req.user.id, noteId: note.id } } }),
        prisma.rating.findUnique({ where: { userId_noteId: { userId: req.user.id, noteId: note.id } } }),
      ]);
      viewer = { liked: !!like, bookmarked: !!bookmark, rating: rating?.value ?? null };
    }

    res.json({ success: true, data: { ...note, viewer } });
  })
);

router.get(
  "/:id/related",
  asyncHandler(async (req, res) => {
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      select: { subjectId: true, tags: true },
    });
    if (!note) throw ApiError.notFound("Note not found");
    // tags is deserialized to string[] by the prisma extension.
    const tags = note.tags as unknown as string[];
    const related = await prisma.note.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: req.params.id },
        OR: [
          { subjectId: note.subjectId },
          ...tags.map((t) => ({ tags: { contains: JSON.stringify(t) } })),
        ],
      },
      orderBy: { downloadsCount: "desc" },
      select: noteCardSelect,
      take: 6,
    });
    res.json({ success: true, data: related });
  })
);

router.post(
  "/:id/download",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      select: { id: true, fileUrl: true, status: true, authorId: true, title: true },
    });
    if (!note || note.status !== "PUBLISHED") throw ApiError.notFound("Note not found");

    await prisma.$transaction([
      prisma.download.create({ data: { noteId: note.id, userId: req.user?.id ?? null } }),
      prisma.note.update({ where: { id: note.id }, data: { downloadsCount: { increment: 1 } } }),
    ]);

    if (req.user?.id !== note.authorId) {
      await awardPoints(note.authorId, POINTS.DOWNLOAD_RECEIVED);
      await checkAchievements(note.authorId);
    }

    res.json({ success: true, data: { fileUrl: note.fileUrl } });
  })
);

// Streams the note's file as an attachment so the browser downloads it (with a
// friendly name) instead of rendering it inline like the static /uploads route.
router.get(
  "/:id/file",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      select: { fileUrl: true, status: true, authorId: true, title: true },
    });
    const visible =
      note &&
      (note.status === "PUBLISHED" ||
        req.user?.role === "ADMIN" ||
        note.authorId === req.user?.id);
    if (!note || !visible || !note.fileUrl?.startsWith("/uploads/")) {
      throw ApiError.notFound("File not available");
    }

    const target = path.resolve(UPLOAD_DIR, note.fileUrl.replace(/^\/uploads\//, ""));
    // Guard against path traversal in stored URLs.
    if (!target.startsWith(UPLOAD_DIR + path.sep)) {
      throw ApiError.notFound("File not available");
    }

    const ext = path.extname(note.fileUrl);
    const base = note.title.replace(/[^\w.\- ]+/g, "").trim().slice(0, 80) || "note";
    res.download(target, `${base}${ext}`, (err) => {
      if (err && !res.headersSent) res.status(404).json({ success: false, error: { message: "File not available" } });
    });
  })
);

const updateSchema = createSchema
  .omit({ tags: true, type: true, subjectId: true })
  .partial()
  .extend({
    tags: z.array(z.string().trim().toLowerCase()).max(8).optional(),
    subjectId: z.string().optional(),
  });

router.patch(
  "/:id",
  requireAuth,
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) throw ApiError.notFound("Note not found");
    if (note.authorId !== req.user!.id && req.user!.role !== "ADMIN") {
      throw ApiError.forbidden();
    }
    // Only admins may change a note's official status.
    const data = { ...req.body };
    if (req.user!.role !== "ADMIN") delete data.isOfficial;
    const updated = await prisma.note.update({
      where: { id: note.id },
      data,
      select: noteCardSelect,
    });
    res.json({ success: true, data: updated });
  })
);

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) throw ApiError.notFound("Note not found");
    if (note.authorId !== req.user!.id && req.user!.role !== "ADMIN") {
      throw ApiError.forbidden();
    }
    await prisma.note.delete({ where: { id: note.id } });
    await Promise.all([deleteFile(note.fileUrl), deleteFile(note.thumbnailUrl)]);
    res.json({ success: true, code: "NOTE_DELETED", message: "Note deleted" });
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
    const note = await prisma.note.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!note) throw ApiError.notFound("Note not found");
    await prisma.report.create({
      data: {
        reason: req.body.reason,
        details: req.body.details,
        noteId: note.id,
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
