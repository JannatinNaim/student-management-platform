import { Router } from "express";
import { z } from "zod";
import { notify } from "../lib/gamification";
import { prisma } from "../lib/prisma";
import { deleteFile, storeFile } from "../lib/storage";
import { optionalAuth, requireAuth } from "../middleware/auth";
import { ApiError, asyncHandler } from "../middleware/error";
import { upload, inspectFile } from "../middleware/upload";
import { validate } from "../middleware/validate";
import { pageMeta, paginate, paginationSchema } from "../utils/pagination";
import { noteCardSelect, publicUserSelect } from "../utils/select";

const router = Router();

router.get(
  "/:username",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username.toLowerCase() },
      select: {
        ...publicUserSelect,
        _count: {
          select: {
            notes: { where: { status: "PUBLISHED" } },
            followers: true,
            following: true,
            bookmarks: true,
          },
        },
      },
    });
    if (!user) throw ApiError.notFound("User not found");

    const [agg, likesReceived, isFollowing] = await Promise.all([
      prisma.note.aggregate({
        where: { authorId: user.id, status: "PUBLISHED" },
        _sum: { downloadsCount: true, views: true },
      }),
      prisma.like.count({ where: { note: { authorId: user.id } } }),
      req.user
        ? prisma.follow.findUnique({
            where: {
              followerId_followingId: { followerId: req.user.id, followingId: user.id },
            },
          })
        : null,
    ]);

    res.json({
      success: true,
      data: {
        ...user,
        stats: {
          notes: user._count.notes,
          followers: user._count.followers,
          following: user._count.following,
          bookmarks: user._count.bookmarks,
          downloads: agg._sum.downloadsCount ?? 0,
          views: agg._sum.views ?? 0,
          likes: likesReceived,
        },
        isFollowing: !!isFollowing,
      },
    });
  })
);

router.get(
  "/:username/notes",
  validate(paginationSchema, "query"),
  asyncHandler(async (req, res) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const where = {
      author: { username: req.params.username.toLowerCase() },
      status: "PUBLISHED" as const,
    };
    const [total, notes] = await Promise.all([
      prisma.note.count({ where }),
      prisma.note.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: noteCardSelect,
        ...paginate(page, limit),
      }),
    ]);
    res.json({ success: true, data: notes, meta: pageMeta(total, page, limit) });
  })
);

router.get(
  "/:username/achievements",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username.toLowerCase() },
      select: { id: true },
    });
    if (!user) throw ApiError.notFound("User not found");
    const achievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" },
    });
    res.json({
      success: true,
      data: achievements.map((a) => ({ ...a.achievement, earnedAt: a.earnedAt })),
    });
  })
);

router.post(
  "/:username/follow",
  requireAuth,
  asyncHandler(async (req, res) => {
    const target = await prisma.user.findUnique({
      where: { username: req.params.username.toLowerCase() },
      select: { id: true, name: true },
    });
    if (!target) throw ApiError.notFound("User not found");
    if (target.id === req.user!.id) throw ApiError.badRequest("You cannot follow yourself");

    const key = {
      followerId_followingId: { followerId: req.user!.id, followingId: target.id },
    };
    const existing = await prisma.follow.findUnique({ where: key });
    if (existing) {
      await prisma.follow.delete({ where: key });
      return res.json({ success: true, data: { following: false } });
    }
    await prisma.follow.create({
      data: { followerId: req.user!.id, followingId: target.id },
    });
    await notify({
      userId: target.id,
      actorId: req.user!.id,
      type: "FOLLOW",
      messageKey: "notif.followed",
      link: `/profile/${req.params.username}`,
    });
    res.json({ success: true, data: { following: true } });
  })
);

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

const profileSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  // Preferred UI/email language; lets the client persist its locale so
  // server-sent emails arrive in the right language.
  locale: z.enum(["en", "bn"]).optional(),
  bio: optionalText(300),
  institution: optionalText(120),
  location: optionalText(120),
  // Accept bare domains too; we normalize to a URL before storing.
  website: z.string().trim().max(200).optional().or(z.literal("")),
  course: optionalText(120),
  gradYear: z.coerce.number().int().min(1950).max(2100).optional().or(z.literal("")),
  // Social handles, with or without a leading "@".
  twitter: optionalText(40),
  github: optionalText(40),
  linkedin: optionalText(60),
  // Sent as a JSON-encoded string by multipart clients.
  interests: z
    .string()
    .optional()
    .transform((raw) => {
      if (raw === undefined || raw === "") return undefined;
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return undefined;
        return Array.from(
          new Set(
            parsed
              .map((t) => String(t).trim().toLowerCase())
              .filter(Boolean)
          )
        ).slice(0, 12);
      } catch {
        return undefined;
      }
    }),
});

const stripHandle = (v: string) => v.replace(/^@+/, "").trim();

function normalizeWebsite(v: string): string | null {
  const trimmed = v.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

async function storeImage(
  file: Express.Multer.File,
  folder: "avatars" | "covers",
  label: string
) {
  if (inspectFile(file).category !== "IMAGE") {
    throw ApiError.badRequest(`${label} must be a valid image`, {
      code: folder === "avatars" ? "AVATAR_INVALID_IMAGE" : "COVER_INVALID_IMAGE",
    });
  }
  return storeFile(file.buffer, file.originalname, folder);
}

router.patch(
  "/me/profile",
  requireAuth,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  validate(profileSchema),
  asyncHandler(async (req, res) => {
    const data: Record<string, unknown> = {};
    if (req.body.name) data.name = req.body.name;
    if (req.body.locale !== undefined) data.locale = req.body.locale;
    if (req.body.bio !== undefined) data.bio = req.body.bio || null;
    if (req.body.institution !== undefined) data.institution = req.body.institution || null;
    if (req.body.location !== undefined) data.location = req.body.location || null;
    if (req.body.website !== undefined) data.website = normalizeWebsite(req.body.website ?? "");
    if (req.body.course !== undefined) data.course = req.body.course || null;
    if (req.body.gradYear !== undefined)
      data.gradYear = req.body.gradYear === "" ? null : req.body.gradYear;
    if (req.body.twitter !== undefined)
      data.twitter = req.body.twitter ? stripHandle(req.body.twitter) : null;
    if (req.body.github !== undefined)
      data.github = req.body.github ? stripHandle(req.body.github) : null;
    if (req.body.linkedin !== undefined)
      data.linkedin = req.body.linkedin ? stripHandle(req.body.linkedin) : null;
    if (req.body.interests !== undefined) data.interests = req.body.interests;

    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const avatarFile = files?.avatar?.[0];
    const coverFile = files?.cover?.[0];

    if (avatarFile) data.avatarUrl = (await storeImage(avatarFile, "avatars", "Avatar")).url;
    if (coverFile) data.coverUrl = (await storeImage(coverFile, "covers", "Cover photo")).url;

    // Capture the photos being replaced so we can clean them up afterwards.
    const previous =
      avatarFile || coverFile
        ? await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { avatarUrl: true, coverUrl: true },
          })
        : null;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: { ...publicUserSelect, email: true, role: true, locale: true, emailVerified: true },
    });

    if (avatarFile && previous?.avatarUrl) await deleteFile(previous.avatarUrl);
    if (coverFile && previous?.coverUrl) await deleteFile(previous.coverUrl);

    res.json({ success: true, data: user });
  })
);

export default router;
