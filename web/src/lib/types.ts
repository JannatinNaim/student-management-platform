export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  institution: string | null;
  location: string | null;
  website: string | null;
  course: string | null;
  gradYear: number | null;
  interests: string[];
  twitter: string | null;
  github: string | null;
  linkedin: string | null;
  role: "STUDENT" | "ADMIN";
  locale: "en" | "bn";
  emailVerified: boolean;
  points: number;
  level: number;
  createdAt: string;
}

export interface Author {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  level: number;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  icon: string;
  coverImage: string | null;
  description: string;
  notesCount?: number;
  groupsCount?: number;
}

export type NoteType = "PDF" | "IMAGE" | "HANDWRITTEN" | "DOCUMENT";

export interface NoteCard {
  id: string;
  title: string;
  description: string;
  chapter: string;
  tags: string[];
  type: NoteType;
  isOfficial: boolean;
  thumbnailUrl: string | null;
  fileType: string;
  views: number;
  downloadsCount: number;
  likesCount: number;
  avgRating: number;
  ratingsCount: number;
  commentsCount: number;
  createdAt: string;
  subject: Pick<Subject, "id" | "name" | "slug" | "icon">;
  author: Author;
  status?: "PUBLISHED" | "FLAGGED" | "REMOVED";
}

export interface NoteDetail extends NoteCard {
  fileUrl: string;
  fileSize: number;
  className: string | null;
  board: string | null;
  college: string | null;
  teacherName: string | null;
  updatedAt: string;
  viewer: { liked: boolean; bookmarked: boolean; rating: number | null } | null;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId: string | null;
  user: Author;
  replies?: Comment[];
}

export interface Notification {
  id: string;
  type: string;
  /** Legacy/fallback English text (pre-i18n rows). */
  message: string | null;
  /** i18n template key (`notif.*`); render with `messageParams`. */
  messageKey: string | null;
  /** JSON-encoded interpolation params for `messageKey`. */
  messageParams: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
  actor: Author | null;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

export type GroupRole = "OWNER" | "MODERATOR" | "MEMBER";
export type ProblemStatus = "OPEN" | "SOLVED";

export interface ProblemGroup {
  id: string;
  name: string;
  slug: string;
  description: string;
  tags: string[];
  membersCount: number;
  problemsCount: number;
  createdAt: string;
  subject: Pick<Subject, "id" | "name" | "slug" | "icon"> | null;
  creator: Author;
  viewer?: { membership: GroupRole | null } | null;
}

export interface GroupMember {
  role: GroupRole;
  createdAt: string;
  user: Author;
}

export interface Problem {
  id: string;
  title: string;
  body: string;
  tags: string[];
  status: ProblemStatus;
  views: number;
  messagesCount: number;
  createdAt: string;
  subject: Pick<Subject, "id" | "name" | "slug" | "icon"> | null;
  author: Author;
  group: { id: string; name: string; slug: string };
}

export interface ProblemDetail extends Problem {
  solutionMessageId: string | null;
  updatedAt: string;
  viewer?: { membership: GroupRole | null; isAuthor: boolean } | null;
}

export interface ProblemMessage {
  id: string;
  content: string;
  isSolution: boolean;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentType: string | null;
  attachmentSize: number | null;
  createdAt: string;
  problemId: string;
  author: Author;
}

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  unread?: number;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  meta: PageMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PlatformStats {
  students: number;
  notes: number;
  downloads: number;
  contributors: number;
}

export interface ProfileUser extends Omit<User, "email" | "role" | "emailVerified"> {
  stats: {
    notes: number;
    followers: number;
    following: number;
    bookmarks: number;
    downloads: number;
    views: number;
    likes: number;
  };
  isFollowing: boolean;
}

export interface DashboardOverview {
  notes: number;
  downloads: number;
  views: number;
  likes: number;
  bookmarks: number;
  points: number;
  level: number;
  achievements: number;
}

export interface Exam {
  id: string;
  title: string;
  date: string;
}

export interface StudyGoal {
  id: string;
  title: string;
  type: "DAILY" | "WEEKLY";
  done: boolean;
  createdAt: string;
}

export type TodoCategory = "NOTE" | "HOMEWORK" | "PROBLEM" | "SCRATCH";
export type TodoPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Todo {
  id: string;
  title: string;
  details: string | null;
  category: TodoCategory;
  priority: TodoPriority;
  done: boolean;
  dueDate: string | null;
  position: number;
  noteId: string | null;
  problemId: string | null;
  note: { id: string; title: string } | null;
  problem: { id: string; title: string; groupId: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface SyllabusOfficial {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
}

export interface SyllabusCard {
  id: string;
  title: string;
  description: string;
  className: string | null;
  board: string | null;
  status: "PUBLISHED" | "ARCHIVED";
  fileUrl: string | null;
  fileType: string | null;
  fileSize: number | null;
  createdAt: string;
  subject: Pick<Subject, "id" | "name" | "slug" | "icon">;
  createdBy: SyllabusOfficial;
  topicsCount: number;
  trackersCount: number;
  tracking: boolean;
  completedCount: number;
}

export interface SyllabusTopic {
  id: string;
  title: string;
  order: number;
  done: boolean;
}

export interface SyllabusDetail extends SyllabusCard {
  updatedAt: string;
  topics: SyllabusTopic[];
}

export const LEVEL_NAMES = ["Beginner", "Learner", "Contributor", "Expert", "Master"];

export function levelName(level: number) {
  return LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length) - 1] ?? "Beginner";
}
