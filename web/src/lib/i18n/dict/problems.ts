/** Problem-solving surface strings (browse, detail, chat, create, report). */
export const en = {
  // Browse / list page
  "problems.browse.title": "Problems",
  "problems.browse.countSubtitle": "{count} problems the community is working on",
  "problems.browse.resultsSubtitle": "Results for “{q}” — {count} found",
  "problems.browse.searchPlaceholder": "Search problems by title, tag or subject…",
  "problems.browse.searchAria": "Search problems",
  "problems.browse.filterSubjectAria": "Filter by subject",
  "problems.browse.allSubjects": "All Subjects",
  "problems.browse.emptyTitle": "No problems found",
  "problems.browse.emptyDescription": "Try a different search or explore the groups.",

  // Sort options
  "problems.sort.newest": "Newest",
  "problems.sort.active": "Most Active",
  "problems.sort.views": "Most Viewed",

  // Status
  "problems.status.open": "Open",
  "problems.status.solved": "Solved",

  // Card
  "problems.card.inGroup": "in {group}",

  // Detail page
  "problems.detail.notFoundTitle": "Problem not found",
  "problems.detail.notFoundDescription": "This problem may have been removed.",
  "problems.detail.inGroup": "in {group}",
  "problems.detail.askedAgo": "asked {time}",
  "problems.detail.groupHeading": "Group",
  "problems.detail.openGroupHint": "Open the group to see more problems",
  "problems.detail.joinToParticipate": "Join group to participate",

  // Related problems
  "problems.related.defaultTitle": "Related Discussions",
  "problems.related.heading": "Related Problems",
  "problems.related.browseAll": "Browse all",

  // Chat
  "problems.chat.emptyState":
    "No replies yet. Start the discussion and work towards a solution together.",
  "problems.chat.acceptedSolution": "Accepted solution",
  "problems.chat.markAsSolution": "Mark as solution",
  "problems.chat.deleteMessageAria": "Delete message",
  "problems.chat.typing": "{name} is typing…",
  "problems.chat.someone": "Someone",
  "problems.chat.removeAttachmentAria": "Remove attachment",
  "problems.chat.attachFileAria": "Attach a file",
  "problems.chat.messagePlaceholder":
    "Share an idea or a solution…  (Enter to send, Shift+Enter for a new line)",
  "problems.chat.send": "Send",
  "problems.chat.joinToReply": "Join this group to reply and help solve the problem",
  "problems.chat.attachmentFallback": "Attachment",
  "problems.chat.attachmentAlt": "attachment",
  "problems.chat.maxAttachmentSize": "Attachments must be {mb} MB or smaller",

  // Create dialog
  "problems.create.title": "Post a problem",
  "problems.create.titleLabel": "Title",
  "problems.create.titlePlaceholder": "Summarise the problem in one line",
  "problems.create.detailsLabel": "Details",
  "problems.create.detailsPlaceholder": "Describe what you've tried and where you're stuck…",
  "problems.create.tagsLabel": "Tags (optional)",
  "problems.create.tagsPlaceholder": "comma, separated — helps it surface elsewhere",
  "problems.create.submit": "Post problem",

  // Report dialog
  "problems.report.title": "Report this problem",
  "problems.report.detailsPlaceholder": "Additional details (optional)",
  "problems.report.submit": "Submit Report",
  "problems.report.reason.inappropriate": "Inappropriate content",
  "problems.report.reason.spam": "Spam or misleading",
  "problems.report.reason.harassment": "Harassment",
  "problems.report.reason.offTopic": "Off-topic",
  "problems.report.reason.other": "Other",

  // Toasts
  "problems.toast.markedSolution": "Marked as the solution",
  "problems.toast.problemPosted": "Problem posted!",
  "problems.toast.reportSubmitted": "Report submitted, thank you",

  // Error fallbacks
  "problems.err.sendFailed": "Could not send your message",
  "problems.err.solveFailed": "Could not mark the solution",
  "problems.err.deleteFailed": "Could not delete the message",
  "problems.err.postFailed": "Could not post the problem",
} as const;

export const bn: Record<keyof typeof en, string> = {
  // Browse / list page
  "problems.browse.title": "সমস্যাসমূহ",
  "problems.browse.countSubtitle": "কমিউনিটি যে {count}টি সমস্যা নিয়ে কাজ করছে",
  "problems.browse.resultsSubtitle": "“{q}”-এর ফলাফল — {count}টি পাওয়া গেছে",
  "problems.browse.searchPlaceholder": "শিরোনাম, ট্যাগ বা বিষয় দিয়ে সমস্যা অনুসন্ধান করুন…",
  "problems.browse.searchAria": "সমস্যা অনুসন্ধান করুন",
  "problems.browse.filterSubjectAria": "বিষয় অনুসারে ফিল্টার করুন",
  "problems.browse.allSubjects": "সব বিষয়",
  "problems.browse.emptyTitle": "কোনো সমস্যা পাওয়া যায়নি",
  "problems.browse.emptyDescription": "ভিন্ন কিছু অনুসন্ধান করুন অথবা গ্রুপগুলো ঘুরে দেখুন।",

  // Sort options
  "problems.sort.newest": "নতুনতম",
  "problems.sort.active": "সবচেয়ে সক্রিয়",
  "problems.sort.views": "সবচেয়ে বেশি দেখা",

  // Status
  "problems.status.open": "উন্মুক্ত",
  "problems.status.solved": "সমাধান হয়েছে",

  // Card
  "problems.card.inGroup": "{group}-এ",

  // Detail page
  "problems.detail.notFoundTitle": "সমস্যাটি পাওয়া যায়নি",
  "problems.detail.notFoundDescription": "এই সমস্যাটি হয়তো সরিয়ে ফেলা হয়েছে।",
  "problems.detail.inGroup": "{group}-এ",
  "problems.detail.askedAgo": "জিজ্ঞাসা করা হয়েছে {time}",
  "problems.detail.groupHeading": "গ্রুপ",
  "problems.detail.openGroupHint": "আরও সমস্যা দেখতে গ্রুপটি খুলুন",
  "problems.detail.joinToParticipate": "অংশগ্রহণ করতে গ্রুপে যোগ দিন",

  // Related problems
  "problems.related.defaultTitle": "সম্পর্কিত আলোচনা",
  "problems.related.heading": "সম্পর্কিত সমস্যাসমূহ",
  "problems.related.browseAll": "সব ব্রাউজ করুন",

  // Chat
  "problems.chat.emptyState":
    "এখনও কোনো উত্তর নেই। আলোচনা শুরু করুন এবং একসাথে সমাধানের দিকে এগিয়ে যান।",
  "problems.chat.acceptedSolution": "গৃহীত সমাধান",
  "problems.chat.markAsSolution": "সমাধান হিসেবে চিহ্নিত করুন",
  "problems.chat.deleteMessageAria": "বার্তা মুছুন",
  "problems.chat.typing": "{name} টাইপ করছেন…",
  "problems.chat.someone": "কেউ একজন",
  "problems.chat.removeAttachmentAria": "সংযুক্তি সরান",
  "problems.chat.attachFileAria": "একটি ফাইল সংযুক্ত করুন",
  "problems.chat.messagePlaceholder":
    "একটি ধারণা বা সমাধান শেয়ার করুন…  (পাঠাতে Enter, নতুন লাইনের জন্য Shift+Enter)",
  "problems.chat.send": "পাঠান",
  "problems.chat.joinToReply": "উত্তর দিতে এবং সমস্যা সমাধানে সাহায্য করতে এই গ্রুপে যোগ দিন",
  "problems.chat.attachmentFallback": "সংযুক্তি",
  "problems.chat.attachmentAlt": "সংযুক্তি",
  "problems.chat.maxAttachmentSize": "সংযুক্তি অবশ্যই {mb} MB বা তার কম হতে হবে",

  // Create dialog
  "problems.create.title": "একটি সমস্যা পোস্ট করুন",
  "problems.create.titleLabel": "শিরোনাম",
  "problems.create.titlePlaceholder": "এক লাইনে সমস্যাটি সংক্ষেপে লিখুন",
  "problems.create.detailsLabel": "বিস্তারিত",
  "problems.create.detailsPlaceholder": "আপনি কী চেষ্টা করেছেন এবং কোথায় আটকে আছেন তা বর্ণনা করুন…",
  "problems.create.tagsLabel": "ট্যাগ (ঐচ্ছিক)",
  "problems.create.tagsPlaceholder": "কমা, দিয়ে আলাদা করুন — এটি অন্যত্র খুঁজে পেতে সাহায্য করে",
  "problems.create.submit": "সমস্যা পোস্ট করুন",

  // Report dialog
  "problems.report.title": "এই সমস্যাটি রিপোর্ট করুন",
  "problems.report.detailsPlaceholder": "অতিরিক্ত বিবরণ (ঐচ্ছিক)",
  "problems.report.submit": "রিপোর্ট জমা দিন",
  "problems.report.reason.inappropriate": "অনুপযুক্ত কন্টেন্ট",
  "problems.report.reason.spam": "স্প্যাম বা বিভ্রান্তিকর",
  "problems.report.reason.harassment": "হয়রানি",
  "problems.report.reason.offTopic": "প্রসঙ্গবহির্ভূত",
  "problems.report.reason.other": "অন্যান্য",

  // Toasts
  "problems.toast.markedSolution": "সমাধান হিসেবে চিহ্নিত করা হয়েছে",
  "problems.toast.problemPosted": "সমস্যা পোস্ট করা হয়েছে!",
  "problems.toast.reportSubmitted": "রিপোর্ট জমা দেওয়া হয়েছে, ধন্যবাদ",

  // Error fallbacks
  "problems.err.sendFailed": "আপনার বার্তা পাঠানো যায়নি",
  "problems.err.solveFailed": "সমাধান চিহ্নিত করা যায়নি",
  "problems.err.deleteFailed": "বার্তাটি মুছে ফেলা যায়নি",
  "problems.err.postFailed": "সমস্যাটি পোস্ট করা যায়নি",
};
