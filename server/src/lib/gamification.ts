import { prisma } from "./prisma";

// SQLite has no enums; these mirror the NotificationType values in schema.prisma.
type NotificationType =
  | "LIKE"
  | "COMMENT"
  | "REPLY"
  | "MENTION"
  | "RATING"
  | "FOLLOW"
  | "DOWNLOAD"
  | "ACHIEVEMENT"
  | "SYSTEM"
  | "GROUP_POST"
  | "PROBLEM_REPLY"
  | "PROBLEM_SOLVED";

export const POINTS = {
  UPLOAD: 10,
  DOWNLOAD_RECEIVED: 2,
  LIKE_RECEIVED: 1,
  FIVE_STAR_RATING: 3,
  TOP_NOTE: 20,
  PROBLEM_POSTED: 5,
  SOLUTION_ACCEPTED: 15,
} as const;

// Cumulative points required to reach each level (index = level - 1)
const LEVEL_THRESHOLDS = [0, 50, 150, 400, 1000];

export const LEVEL_NAMES = ["Beginner", "Learner", "Contributor", "Expert", "Master"];

export function levelForPoints(points: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return level;
}

/**
 * Persist a notification as a stable i18n template key (+ params) so the client
 * renders it in the recipient's language. `messageKey` is one of the web app's
 * `notif.*` keys (see `web/src/lib/i18n/dict/notifications.ts`); `messageParams`
 * supplies interpolation values (note/problem titles stay as-authored — they're
 * user content and are not translated).
 */
export async function notify(opts: {
  userId: string;
  actorId?: string;
  type: NotificationType;
  messageKey: string;
  messageParams?: Record<string, string | number>;
  link?: string;
}) {
  // Never notify yourself
  if (opts.actorId && opts.actorId === opts.userId) return;
  await prisma.notification.create({
    data: {
      userId: opts.userId,
      actorId: opts.actorId,
      type: opts.type,
      messageKey: opts.messageKey,
      messageParams: opts.messageParams ? JSON.stringify(opts.messageParams) : null,
      link: opts.link,
    },
  });
}

export async function awardPoints(userId: string, amount: number) {
  if (amount === 0) return;
  const user = await prisma.user.update({
    where: { id: userId },
    data: { points: { increment: amount } },
    select: { id: true, points: true, level: true },
  });
  const newLevel = levelForPoints(user.points);
  if (newLevel !== user.level) {
    await prisma.user.update({ where: { id: userId }, data: { level: newLevel } });
    if (newLevel > user.level) {
      await notify({
        userId,
        type: "ACHIEVEMENT",
        messageKey: "notif.levelUp",
        messageParams: { level: newLevel },
        link: "/dashboard",
      });
    }
  }
}

async function grantAchievement(userId: string, code: string) {
  const achievement = await prisma.achievement.findUnique({ where: { code } });
  if (!achievement) return;
  const existing = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
  });
  if (existing) return;
  await prisma.userAchievement.create({
    data: { userId, achievementId: achievement.id },
  });
  await notify({
    userId,
    type: "ACHIEVEMENT",
    messageKey: "notif.achievement",
    messageParams: { code: achievement.code, icon: achievement.icon },
    link: "/dashboard?tab=achievements",
  });
}

/** Re-evaluate threshold-based achievements for a user. Cheap aggregate queries. */
export async function checkAchievements(userId: string) {
  const [noteAgg, likeCount] = await Promise.all([
    prisma.note.aggregate({
      where: { authorId: userId, status: "PUBLISHED" },
      _sum: { downloadsCount: true },
      _count: true,
    }),
    prisma.like.count({ where: { note: { authorId: userId } } }),
  ]);

  const downloads = noteAgg._sum.downloadsCount ?? 0;
  const uploads = noteAgg._count;

  const checks: Array<[boolean, string]> = [
    [uploads >= 1, "FIRST_UPLOAD"],
    [uploads >= 10, "RISING_CONTRIBUTOR"],
    [uploads >= 25, "TOP_CONTRIBUTOR"],
    [downloads >= 100, "DOWNLOADS_100"],
    [downloads >= 500, "DOWNLOADS_500"],
    [downloads >= 1000, "DOWNLOADS_1000"],
    [likeCount >= 100, "MOST_LIKED_CREATOR"],
  ];

  for (const [earned, code] of checks) {
    if (earned) await grantAchievement(userId, code);
  }

  const topRated = await prisma.note.count({
    where: { authorId: userId, avgRating: { gte: 4.5 }, ratingsCount: { gte: 5 } },
  });
  if (topRated >= 1) await grantAchievement(userId, "BEST_NOTES_AUTHOR");
}
