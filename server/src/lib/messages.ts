/**
 * Maps the platform's English error/status strings to stable machine CODES that
 * the web client translates (see `web/src/lib/i18n/dict/errors.ts`).
 *
 * Most `ApiError` throw sites keep their English message; `errorHandler` looks
 * the message up here to attach a `code`. Throw sites whose message is dynamic
 * (interpolated) pass an explicit `code` + `params` instead — see `ApiError`.
 *
 * Keep this in sync with the client's `errors.*` / `status.*` keys.
 */
export const STATIC_MESSAGE_CODES: Record<string, string> = {
  // Auth
  "Authentication required": "UNAUTHORIZED",
  "You do not have permission to do that": "FORBIDDEN",
  "Invalid credentials": "INVALID_CREDENTIALS",
  "Your account has been suspended": "ACCOUNT_SUSPENDED",
  "Google sign-in is not configured": "GOOGLE_NOT_CONFIGURED",
  "Invalid Google token": "INVALID_GOOGLE_TOKEN",
  "No session": "NO_SESSION",
  "Session expired, please sign in again": "SESSION_EXPIRED",
  "Email is already registered": "EMAIL_TAKEN",
  "Username is taken": "USERNAME_TAKEN",
  "Invalid or expired verification link": "INVALID_VERIFICATION_LINK",
  "Email is already verified": "EMAIL_ALREADY_VERIFIED",
  "Invalid or expired reset link": "INVALID_RESET_LINK",

  // Notes
  "Note not found": "NOTE_NOT_FOUND",
  "A note file is required": "NOTE_FILE_REQUIRED",
  "Thumbnail must be a valid image": "THUMBNAIL_INVALID_IMAGE",
  "File not available": "FILE_NOT_AVAILABLE",
  "Unknown subject": "UNKNOWN_SUBJECT",

  // Uploads
  "File content does not match its extension — upload rejected":
    "FILE_CONTENT_MISMATCH",

  // Comments
  "Comment not found": "COMMENT_NOT_FOUND",
  "Invalid parent comment": "INVALID_PARENT_COMMENT",

  // Interactions
  "You cannot rate your own note": "CANNOT_RATE_OWN_NOTE",

  // Users
  "User not found": "USER_NOT_FOUND",
  "You cannot follow yourself": "CANNOT_FOLLOW_SELF",

  // Groups
  "Group not found": "GROUP_NOT_FOUND",
  "The owner cannot leave their own group": "OWNER_CANNOT_LEAVE",
  "Join this group to participate": "JOIN_GROUP_TO_PARTICIPATE",

  // Problems
  "Problem not found": "PROBLEM_NOT_FOUND",
  "Message not found": "MESSAGE_NOT_FOUND",
  "Invalid message": "INVALID_MESSAGE",
  "Write a message or attach a file": "MESSAGE_OR_FILE_REQUIRED",

  // Syllabus
  "Syllabus not found": "SYLLABUS_NOT_FOUND",
  "Topic not found": "TOPIC_NOT_FOUND",

  // Study tools
  "Exam not found": "EXAM_NOT_FOUND",
  "Goal not found": "GOAL_NOT_FOUND",
  "To-do not found": "TODO_NOT_FOUND",
  "Linked note not found": "LINKED_NOTE_NOT_FOUND",
  "Linked problem not found": "LINKED_PROBLEM_NOT_FOUND",

  // Admin
  "You cannot modify your own account": "CANNOT_MODIFY_OWN_ACCOUNT",
  "Subject not found": "SUBJECT_NOT_FOUND",

  // Generic / framework
  "Endpoint not found": "ENDPOINT_NOT_FOUND",
  "Validation failed": "VALIDATION_FAILED",
  "Internal server error": "INTERNAL_ERROR",

  // Status / success
  "All notifications marked read": "NOTIFICATIONS_MARKED_READ",
  "Comment deleted": "COMMENT_DELETED",
  "Report submitted": "REPORT_SUBMITTED",
  "Report submitted. Our moderators will review it.":
    "REPORT_SUBMITTED_MODERATED",
  "Subject deleted": "SUBJECT_DELETED",
  "Problem deleted": "PROBLEM_DELETED",
  "Message deleted": "MESSAGE_DELETED",
  "Note deleted": "NOTE_DELETED",
  "Group deleted": "GROUP_DELETED",
  "Signed out": "SIGNED_OUT",
  "Email verified! You can now upload notes.": "EMAIL_VERIFIED",
  "Verification email sent": "VERIFICATION_EMAIL_SENT",
  "If that email exists, a reset link has been sent": "RESET_LINK_SENT",
  "Password updated, please sign in": "PASSWORD_UPDATED",
  "Syllabus deleted": "SYLLABUS_DELETED",
};

/** Look up the stable code for a known static English message, if any. */
export function codeForMessage(message: string): string | undefined {
  return STATIC_MESSAGE_CODES[message];
}
