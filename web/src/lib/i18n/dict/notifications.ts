/**
 * Notification message templates + the notifications page UI.
 *
 * The server persists each notification as a stable `messageKey` (one of the
 * `notif.*` keys below) plus `messageParams` JSON; the client renders
 * `t(messageKey, params)`. The actor's name is rendered separately by the page,
 * so these templates start with the predicate. Keep keys in sync with the
 * server's `notify()` call sites.
 */
export const en = {
  // Message templates (params noted)
  "notif.rated": "rated “{title}” {value}/5", // {title,value}
  "notif.liked": "liked your note “{title}”", // {title}
  "notif.commented": "commented on your note “{title}”", // {title}
  "notif.commentReply": "replied to your comment on “{title}”", // {title}
  "notif.mentionComment": "mentioned you in a comment on “{title}”", // {title}
  "notif.followed": "started following you",
  "notif.problemReply": "replied on your problem “{title}”", // {title}
  "notif.mentionProblem": "mentioned you in “{title}”", // {title}
  "notif.solutionAccepted":
    "accepted your answer as the solution to “{title}”", // {title}
  "notif.noteRemoved": "Your note “{title}” was removed by a moderator.", // {title}
  "notif.levelUp": "You reached Level {level} - {levelName}!", // {level,levelName}
  "notif.achievement": "Achievement unlocked: {name}", // {name}

  // Notifications page
  "notifications.title": "Notifications",
  "notifications.markAllRead": "Mark all read",
  "notifications.empty.title": "All caught up!",
  "notifications.empty.description":
    "Likes, comments, ratings and follows will show up here.",
} as const;

export const bn: Record<keyof typeof en, string> = {
  "notif.rated": "“{title}”-কে {value}/5 রেটিং দিয়েছেন",
  "notif.liked": "আপনার নোট “{title}” পছন্দ করেছেন",
  "notif.commented": "আপনার নোট “{title}”-এ মন্তব্য করেছেন",
  "notif.commentReply": "“{title}”-এ আপনার মন্তব্যে উত্তর দিয়েছেন",
  "notif.mentionComment": "“{title}”-এর একটি মন্তব্যে আপনাকে উল্লেখ করেছেন",
  "notif.followed": "আপনাকে ফলো করা শুরু করেছেন",
  "notif.problemReply": "আপনার সমস্যা “{title}”-এ উত্তর দিয়েছেন",
  "notif.mentionProblem": "“{title}”-এ আপনাকে উল্লেখ করেছেন",
  "notif.solutionAccepted":
    "“{title}”-এর সমাধান হিসেবে আপনার উত্তর গ্রহণ করেছেন",
  "notif.noteRemoved": "আপনার নোট “{title}” একজন মডারেটর সরিয়ে দিয়েছেন।",
  "notif.levelUp": "আপনি লেভেল {level} - {levelName}-এ পৌঁছেছেন!",
  "notif.achievement": "অর্জন আনলক হয়েছে: {name}",

  // Page
  "notifications.title": "নোটিফিকেশন",
  "notifications.markAllRead": "সব পঠিত হিসেবে চিহ্নিত করুন",
  "notifications.empty.title": "সব দেখা হয়ে গেছে!",
  "notifications.empty.description":
    "লাইক, মন্তব্য, রেটিং এবং ফলো এখানে দেখা যাবে।",
};
