/**
 * Server-emitted error & status codes, translated client-side.
 *
 * The API returns a machine `code` (and optional `params`) on every error and
 * on status responses; `apiErrorMessage()` / mutations resolve it to one of
 * these `errors.<CODE>` keys. Keep the CODE list in sync with the server's
 * `src/lib/messages.ts` MESSAGE_CODES map and notification keys.
 */
export const en = {
  // Generic / fallback
  "errors.generic": "Something went wrong",
  "errors.network": "Network error — check your connection and try again.",
  "errors.INTERNAL_ERROR": "Internal server error",
  "errors.VALIDATION_FAILED": "Please check the form and try again.",
  "errors.ENDPOINT_NOT_FOUND": "Endpoint not found",

  // Auth
  "errors.UNAUTHORIZED": "Authentication required",
  "errors.FORBIDDEN": "You do not have permission to do that",
  "errors.INVALID_CREDENTIALS": "Invalid credentials",
  "errors.ACCOUNT_SUSPENDED": "Your account has been suspended",
  "errors.GOOGLE_NOT_CONFIGURED": "Google sign-in is not configured",
  "errors.INVALID_GOOGLE_TOKEN": "Invalid Google token",
  "errors.NO_SESSION": "No session",
  "errors.SESSION_EXPIRED": "Session expired, please sign in again",
  "errors.EMAIL_TAKEN": "Email is already registered",
  "errors.USERNAME_TAKEN": "Username is taken",
  "errors.INVALID_VERIFICATION_LINK": "Invalid or expired verification link",
  "errors.EMAIL_ALREADY_VERIFIED": "Email is already verified",
  "errors.INVALID_RESET_LINK": "Invalid or expired reset link",

  // Notes
  "errors.NOTE_NOT_FOUND": "Note not found",
  "errors.NOTE_FILE_REQUIRED": "A note file is required",
  "errors.THUMBNAIL_INVALID_IMAGE": "Thumbnail must be a valid image",
  "errors.FILE_CATEGORY_MISMATCH":
    "A {category} file cannot be uploaded as “{type}”",
  "errors.DUPLICATE_FILE": "You already uploaded this file as “{title}”",
  "errors.FILE_NOT_AVAILABLE": "File not available",
  "errors.UNKNOWN_SUBJECT": "Unknown subject",

  // Uploads (shared middleware)
  "errors.UNSUPPORTED_FILE_TYPE": "Unsupported file type. Allowed: {allowed}",
  "errors.FILE_CONTENT_MISMATCH":
    "File content does not match its extension — upload rejected",
  "errors.FILE_TOO_LARGE": "File too large. Maximum size is {mb}MB",
  "errors.INVALID_IMAGE": "{label} must be a valid image",
  "errors.AVATAR_INVALID_IMAGE": "Avatar must be a valid image",
  "errors.COVER_INVALID_IMAGE": "Cover photo must be a valid image",

  // Comments
  "errors.COMMENT_NOT_FOUND": "Comment not found",
  "errors.INVALID_PARENT_COMMENT": "Invalid parent comment",

  // Interactions
  "errors.CANNOT_RATE_OWN_NOTE": "You cannot rate your own note",

  // Users / follows
  "errors.USER_NOT_FOUND": "User not found",
  "errors.CANNOT_FOLLOW_SELF": "You cannot follow yourself",

  // Groups
  "errors.GROUP_NOT_FOUND": "Group not found",
  "errors.OWNER_CANNOT_LEAVE": "The owner cannot leave their own group",
  "errors.JOIN_GROUP_TO_PARTICIPATE": "Join this group to participate",

  // Problems
  "errors.PROBLEM_NOT_FOUND": "Problem not found",
  "errors.MESSAGE_NOT_FOUND": "Message not found",
  "errors.INVALID_MESSAGE": "Invalid message",
  "errors.MESSAGE_OR_FILE_REQUIRED": "Write a message or attach a file",

  // Syllabus
  "errors.SYLLABUS_NOT_FOUND": "Syllabus not found",
  "errors.TOPIC_NOT_FOUND": "Topic not found",

  // Study tools
  "errors.EXAM_NOT_FOUND": "Exam not found",
  "errors.GOAL_NOT_FOUND": "Goal not found",
  "errors.TODO_NOT_FOUND": "To-do not found",
  "errors.LINKED_NOTE_NOT_FOUND": "Linked note not found",
  "errors.LINKED_PROBLEM_NOT_FOUND": "Linked problem not found",

  // Admin
  "errors.CANNOT_MODIFY_OWN_ACCOUNT": "You cannot modify your own account",
  "errors.SUBJECT_NOT_FOUND": "Subject not found",
  "errors.SUBJECT_IN_USE":
    "“{name}” still has {notes} note(s) and {syllabi} syllabus(es). Move or remove them first.",

  // ── Success / status codes (shown in toasts) ──
  "status.NOTIFICATIONS_MARKED_READ": "All notifications marked read",
  "status.COMMENT_DELETED": "Comment deleted",
  "status.REPORT_SUBMITTED": "Report submitted",
  "status.REPORT_SUBMITTED_MODERATED":
    "Report submitted. Our moderators will review it.",
  "status.SUBJECT_DELETED": "Subject deleted",
  "status.PROBLEM_DELETED": "Problem deleted",
  "status.MESSAGE_DELETED": "Message deleted",
  "status.NOTE_DELETED": "Note deleted",
  "status.GROUP_DELETED": "Group deleted",
  "status.SIGNED_OUT": "Signed out",
  "status.EMAIL_VERIFIED": "Email verified! You can now upload notes.",
  "status.VERIFICATION_EMAIL_SENT": "Verification email sent",
  "status.RESET_LINK_SENT": "If that email exists, a reset link has been sent",
  "status.PASSWORD_UPDATED": "Password updated, please sign in",
  "status.SYLLABUS_DELETED": "Syllabus deleted",
} as const;

export const bn: Record<keyof typeof en, string> = {
  // Generic / fallback
  "errors.generic": "কিছু একটা সমস্যা হয়েছে",
  "errors.network": "নেটওয়ার্ক সমস্যা — আপনার সংযোগ যাচাই করে আবার চেষ্টা করুন।",
  "errors.INTERNAL_ERROR": "সার্ভারে ত্রুটি হয়েছে",
  "errors.VALIDATION_FAILED": "অনুগ্রহ করে ফর্মটি যাচাই করে আবার চেষ্টা করুন।",
  "errors.ENDPOINT_NOT_FOUND": "এন্ডপয়েন্ট পাওয়া যায়নি",

  // Auth
  "errors.UNAUTHORIZED": "প্রমাণীকরণ প্রয়োজন",
  "errors.FORBIDDEN": "এই কাজটি করার অনুমতি আপনার নেই",
  "errors.INVALID_CREDENTIALS": "ভুল তথ্য দিয়েছেন",
  "errors.ACCOUNT_SUSPENDED": "আপনার অ্যাকাউন্টটি স্থগিত করা হয়েছে",
  "errors.GOOGLE_NOT_CONFIGURED": "Google সাইন-ইন কনফিগার করা নেই",
  "errors.INVALID_GOOGLE_TOKEN": "অবৈধ Google টোকেন",
  "errors.NO_SESSION": "কোনো সেশন নেই",
  "errors.SESSION_EXPIRED": "সেশনের মেয়াদ শেষ, অনুগ্রহ করে আবার সাইন ইন করুন",
  "errors.EMAIL_TAKEN": "এই ইমেইলটি ইতিমধ্যে নিবন্ধিত",
  "errors.USERNAME_TAKEN": "এই ইউজারনেমটি ইতিমধ্যে নেওয়া হয়েছে",
  "errors.INVALID_VERIFICATION_LINK": "যাচাইকরণ লিঙ্কটি অবৈধ বা মেয়াদোত্তীর্ণ",
  "errors.EMAIL_ALREADY_VERIFIED": "ইমেইল ইতিমধ্যে যাচাই করা হয়েছে",
  "errors.INVALID_RESET_LINK": "রিসেট লিঙ্কটি অবৈধ বা মেয়াদোত্তীর্ণ",

  // Notes
  "errors.NOTE_NOT_FOUND": "নোট পাওয়া যায়নি",
  "errors.NOTE_FILE_REQUIRED": "একটি নোট ফাইল আবশ্যক",
  "errors.THUMBNAIL_INVALID_IMAGE": "থাম্বনেইল অবশ্যই একটি বৈধ ছবি হতে হবে",
  "errors.FILE_CATEGORY_MISMATCH":
    "একটি {category} ফাইল “{type}” হিসেবে আপলোড করা যাবে না",
  "errors.DUPLICATE_FILE": "এই ফাইলটি আপনি ইতিমধ্যে “{title}” নামে আপলোড করেছেন",
  "errors.FILE_NOT_AVAILABLE": "ফাইলটি উপলব্ধ নেই",
  "errors.UNKNOWN_SUBJECT": "অজানা বিষয়",

  // Uploads
  "errors.UNSUPPORTED_FILE_TYPE": "অসমর্থিত ফাইলের ধরন। অনুমোদিত: {allowed}",
  "errors.FILE_CONTENT_MISMATCH":
    "ফাইলের কনটেন্ট তার এক্সটেনশনের সাথে মেলে না — আপলোড প্রত্যাখ্যাত",
  "errors.FILE_TOO_LARGE": "ফাইল অনেক বড়। সর্বোচ্চ আকার {mb}MB",
  "errors.INVALID_IMAGE": "{label} অবশ্যই একটি বৈধ ছবি হতে হবে",
  "errors.AVATAR_INVALID_IMAGE": "অ্যাভাটার অবশ্যই একটি বৈধ ছবি হতে হবে",
  "errors.COVER_INVALID_IMAGE": "কভার ছবি অবশ্যই একটি বৈধ ছবি হতে হবে",

  // Comments
  "errors.COMMENT_NOT_FOUND": "মন্তব্য পাওয়া যায়নি",
  "errors.INVALID_PARENT_COMMENT": "অবৈধ মূল মন্তব্য",

  // Interactions
  "errors.CANNOT_RATE_OWN_NOTE": "আপনি নিজের নোট রেট করতে পারবেন না",

  // Users / follows
  "errors.USER_NOT_FOUND": "ব্যবহারকারী পাওয়া যায়নি",
  "errors.CANNOT_FOLLOW_SELF": "আপনি নিজেকে ফলো করতে পারবেন না",

  // Groups
  "errors.GROUP_NOT_FOUND": "গ্রুপ পাওয়া যায়নি",
  "errors.OWNER_CANNOT_LEAVE": "মালিক নিজের গ্রুপ ছেড়ে যেতে পারেন না",
  "errors.JOIN_GROUP_TO_PARTICIPATE": "অংশগ্রহণ করতে এই গ্রুপে যোগ দিন",

  // Problems
  "errors.PROBLEM_NOT_FOUND": "সমস্যাটি পাওয়া যায়নি",
  "errors.MESSAGE_NOT_FOUND": "বার্তা পাওয়া যায়নি",
  "errors.INVALID_MESSAGE": "অবৈধ বার্তা",
  "errors.MESSAGE_OR_FILE_REQUIRED": "একটি বার্তা লিখুন বা একটি ফাইল সংযুক্ত করুন",

  // Syllabus
  "errors.SYLLABUS_NOT_FOUND": "সিলেবাস পাওয়া যায়নি",
  "errors.TOPIC_NOT_FOUND": "টপিক পাওয়া যায়নি",

  // Study tools
  "errors.EXAM_NOT_FOUND": "পরীক্ষা পাওয়া যায়নি",
  "errors.GOAL_NOT_FOUND": "লক্ষ্য পাওয়া যায়নি",
  "errors.TODO_NOT_FOUND": "টু-ডু পাওয়া যায়নি",
  "errors.LINKED_NOTE_NOT_FOUND": "সংযুক্ত নোট পাওয়া যায়নি",
  "errors.LINKED_PROBLEM_NOT_FOUND": "সংযুক্ত সমস্যা পাওয়া যায়নি",

  // Admin
  "errors.CANNOT_MODIFY_OWN_ACCOUNT": "আপনি নিজের অ্যাকাউন্ট পরিবর্তন করতে পারবেন না",
  "errors.SUBJECT_NOT_FOUND": "বিষয় পাওয়া যায়নি",
  "errors.SUBJECT_IN_USE":
    "“{name}”-এ এখনও {notes}টি নোট এবং {syllabi}টি সিলেবাস রয়েছে। প্রথমে সেগুলো সরান।",

  // Success / status
  "status.NOTIFICATIONS_MARKED_READ": "সব নোটিফিকেশন পঠিত হিসেবে চিহ্নিত হয়েছে",
  "status.COMMENT_DELETED": "মন্তব্য মুছে ফেলা হয়েছে",
  "status.REPORT_SUBMITTED": "রিপোর্ট জমা দেওয়া হয়েছে",
  "status.REPORT_SUBMITTED_MODERATED":
    "রিপোর্ট জমা দেওয়া হয়েছে। আমাদের মডারেটররা এটি পর্যালোচনা করবেন।",
  "status.SUBJECT_DELETED": "বিষয় মুছে ফেলা হয়েছে",
  "status.PROBLEM_DELETED": "সমস্যাটি মুছে ফেলা হয়েছে",
  "status.MESSAGE_DELETED": "বার্তা মুছে ফেলা হয়েছে",
  "status.NOTE_DELETED": "নোট মুছে ফেলা হয়েছে",
  "status.GROUP_DELETED": "গ্রুপ মুছে ফেলা হয়েছে",
  "status.SIGNED_OUT": "সাইন আউট হয়েছে",
  "status.EMAIL_VERIFIED": "ইমেইল যাচাই হয়েছে! এখন আপনি নোট আপলোড করতে পারবেন।",
  "status.VERIFICATION_EMAIL_SENT": "যাচাইকরণ ইমেইল পাঠানো হয়েছে",
  "status.RESET_LINK_SENT": "সেই ইমেইল থাকলে একটি রিসেট লিঙ্ক পাঠানো হয়েছে",
  "status.PASSWORD_UPDATED": "পাসওয়ার্ড আপডেট হয়েছে, অনুগ্রহ করে সাইন ইন করুন",
  "status.SYLLABUS_DELETED": "সিলেবাস মুছে ফেলা হয়েছে",
};
