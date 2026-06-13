/** Shared Prisma select fragments to keep payloads lean and consistent. */

export const authorSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  level: true,
} as const;

export const noteCardSelect = {
  id: true,
  title: true,
  description: true,
  chapter: true,
  tags: true,
  type: true,
  isOfficial: true,
  thumbnailUrl: true,
  fileType: true,
  views: true,
  downloadsCount: true,
  likesCount: true,
  avgRating: true,
  ratingsCount: true,
  commentsCount: true,
  createdAt: true,
  subject: { select: { id: true, name: true, slug: true, icon: true } },
  author: { select: authorSelect },
} as const;

const groupSubjectSelect = { select: { id: true, name: true, slug: true, icon: true } } as const;

export const groupCardSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  tags: true,
  membersCount: true,
  problemsCount: true,
  createdAt: true,
  subject: groupSubjectSelect,
  creator: { select: authorSelect },
} as const;

export const problemCardSelect = {
  id: true,
  title: true,
  body: true,
  tags: true,
  status: true,
  views: true,
  messagesCount: true,
  createdAt: true,
  subject: groupSubjectSelect,
  author: { select: authorSelect },
  group: { select: { id: true, name: true, slug: true } },
} as const;

export const messageSelect = {
  id: true,
  content: true,
  isSolution: true,
  attachmentUrl: true,
  attachmentName: true,
  attachmentType: true,
  attachmentSize: true,
  createdAt: true,
  problemId: true,
  author: { select: authorSelect },
} as const;

export const publicUserSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  coverUrl: true,
  bio: true,
  institution: true,
  location: true,
  website: true,
  course: true,
  gradYear: true,
  interests: true,
  twitter: true,
  github: true,
  linkedin: true,
  points: true,
  level: true,
  createdAt: true,
} as const;
