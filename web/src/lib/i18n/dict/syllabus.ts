/** Syllabus surface — list, detail, creation form, and card item. */
export const en = {
  // List page
  "syllabus.list.title": "Syllabus Tracker",
  "syllabus.list.subtitle":
    "Follow official curriculum syllabuses uploaded by the SmartNotes team and tick off topics as you go.",
  "syllabus.list.new": "New syllabus",
  "syllabus.list.continueTracking": "Continue tracking",
  "syllabus.list.searchPlaceholder": "Search syllabuses…",
  "syllabus.list.searchLabel": "Search syllabuses",
  "syllabus.list.filterLabel": "Filter by subject",
  "syllabus.list.allSubjects": "All subjects",
  "syllabus.list.emptyTitle": "No syllabuses yet",
  "syllabus.list.emptyAdmin":
    "Upload the first official syllabus so students can start tracking their progress.",
  "syllabus.list.emptyStudent":
    "Check back soon — official syllabuses will appear here once they're published.",

  // Detail page
  "syllabus.detail.notFound": "Syllabus not found",
  "syllabus.detail.backToAll": "Back to all syllabuses",
  "syllabus.detail.allSyllabuses": "All syllabuses",
  "syllabus.detail.trackersCount": "{count} tracking",
  "syllabus.detail.sourceDocument": "Source document",
  "syllabus.detail.tracking": "Tracking",
  "syllabus.detail.track": "Track this syllabus",
  "syllabus.detail.deleteConfirm": "Delete this syllabus? Student progress will be lost.",
  "syllabus.detail.progress": "Progress",
  "syllabus.detail.progressStat": "{completed}/{total} topics · {pct}%",
  "syllabus.detail.topics": "Topics",
  "syllabus.detail.topicsHint":
    "Tick off each topic as you complete it — your progress is saved automatically.",
  "syllabus.detail.signInToTrack": "Sign in to track your progress",

  // Card
  "syllabus.card.topics": "{count} topics",
  "syllabus.card.official": "Official",
  "syllabus.card.yourProgress": "Your progress",
  "syllabus.card.progressStat": "{completed}/{total} · {pct}%",

  // New / creation form
  "syllabus.new.title": "New Syllabus",
  "syllabus.new.subtitle":
    "Publish an official curriculum syllabus. Students can track it and tick off topics as they progress.",
  "syllabus.new.titleLabel": "Title *",
  "syllabus.new.titlePlaceholder": "e.g. HSC Physics 1st Paper — Official Syllabus",
  "syllabus.new.descriptionLabel": "Description *",
  "syllabus.new.descriptionPlaceholder": "What does this syllabus cover, and who is it for?",
  "syllabus.new.subjectLabel": "Subject *",
  "syllabus.new.subjectPlaceholder": "Select a subject",
  "syllabus.new.classLabel": "Class",
  "syllabus.new.classPlaceholder": "e.g. HSC / Class 12",
  "syllabus.new.boardLabel": "Board / Authority",
  "syllabus.new.boardPlaceholder": "e.g. National Curriculum",
  "syllabus.new.topicsLabel": "Topics *",
  "syllabus.new.topicsHint": "— one per line ({count})",
  "syllabus.new.sourceLabel": "Source document (optional)",
  "syllabus.new.attachFile": "Attach the official PDF (optional)",
  "syllabus.new.removeFile": "Remove file",
  "syllabus.new.publish": "Publish Syllabus",

  // Toasts
  "syllabus.toast.deleted": "Syllabus deleted",
  "syllabus.toast.published": "Syllabus published",
  "syllabus.toast.fileTooLarge": "File too large — maximum is {max}MB",
  "syllabus.toast.unsupportedFile": "Unsupported file type — upload a PDF, image, or document",
  "syllabus.toast.pickSubject": "Please pick a subject",
  "syllabus.toast.addTopic": "Add at least one topic (one per line)",

  // Errors
  "syllabus.err.publishFailed": "Could not publish syllabus",
} as const;

export const bn: Record<keyof typeof en, string> = {
  // List page
  "syllabus.list.title": "সিলেবাস ট্র্যাকার",
  "syllabus.list.subtitle":
    "স্মার্টনোটস টিমের আপলোড করা অফিসিয়াল কারিকুলাম সিলেবাস অনুসরণ করুন এবং এগিয়ে যাওয়ার সাথে সাথে টপিকগুলো টিক দিন।",
  "syllabus.list.new": "নতুন সিলেবাস",
  "syllabus.list.continueTracking": "ট্র্যাকিং চালিয়ে যান",
  "syllabus.list.searchPlaceholder": "সিলেবাস অনুসন্ধান করুন…",
  "syllabus.list.searchLabel": "সিলেবাস অনুসন্ধান করুন",
  "syllabus.list.filterLabel": "বিষয় অনুযায়ী ফিল্টার করুন",
  "syllabus.list.allSubjects": "সব বিষয়",
  "syllabus.list.emptyTitle": "এখনও কোনো সিলেবাস নেই",
  "syllabus.list.emptyAdmin":
    "প্রথম অফিসিয়াল সিলেবাস আপলোড করুন যাতে শিক্ষার্থীরা তাদের অগ্রগতি ট্র্যাক করা শুরু করতে পারে।",
  "syllabus.list.emptyStudent":
    "শীঘ্রই আবার দেখুন — প্রকাশিত হওয়ার পর অফিসিয়াল সিলেবাসগুলো এখানে দেখা যাবে।",

  // Detail page
  "syllabus.detail.notFound": "সিলেবাস পাওয়া যায়নি",
  "syllabus.detail.backToAll": "সব সিলেবাসে ফিরে যান",
  "syllabus.detail.allSyllabuses": "সব সিলেবাস",
  "syllabus.detail.trackersCount": "{count} জন ট্র্যাক করছে",
  "syllabus.detail.sourceDocument": "উৎস নথি",
  "syllabus.detail.tracking": "ট্র্যাক করা হচ্ছে",
  "syllabus.detail.track": "এই সিলেবাস ট্র্যাক করুন",
  "syllabus.detail.deleteConfirm":
    "এই সিলেবাস মুছবেন? শিক্ষার্থীদের অগ্রগতি হারিয়ে যাবে।",
  "syllabus.detail.progress": "অগ্রগতি",
  "syllabus.detail.progressStat": "{completed}/{total} টপিক · {pct}%",
  "syllabus.detail.topics": "টপিক",
  "syllabus.detail.topicsHint":
    "প্রতিটি টপিক সম্পন্ন করার সাথে সাথে টিক দিন — আপনার অগ্রগতি স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়।",
  "syllabus.detail.signInToTrack": "আপনার অগ্রগতি ট্র্যাক করতে সাইন ইন করুন",

  // Card
  "syllabus.card.topics": "{count} টপিক",
  "syllabus.card.official": "অফিসিয়াল",
  "syllabus.card.yourProgress": "আপনার অগ্রগতি",
  "syllabus.card.progressStat": "{completed}/{total} · {pct}%",

  // New / creation form
  "syllabus.new.title": "নতুন সিলেবাস",
  "syllabus.new.subtitle":
    "একটি অফিসিয়াল কারিকুলাম সিলেবাস প্রকাশ করুন। শিক্ষার্থীরা এটি ট্র্যাক করতে এবং অগ্রগতির সাথে সাথে টপিক টিক দিতে পারবে।",
  "syllabus.new.titleLabel": "শিরোনাম *",
  "syllabus.new.titlePlaceholder": "যেমন HSC পদার্থবিজ্ঞান ১ম পত্র — অফিসিয়াল সিলেবাস",
  "syllabus.new.descriptionLabel": "বিবরণ *",
  "syllabus.new.descriptionPlaceholder": "এই সিলেবাস কী কভার করে এবং কাদের জন্য?",
  "syllabus.new.subjectLabel": "বিষয় *",
  "syllabus.new.subjectPlaceholder": "একটি বিষয় নির্বাচন করুন",
  "syllabus.new.classLabel": "শ্রেণি",
  "syllabus.new.classPlaceholder": "যেমন HSC / দ্বাদশ শ্রেণি",
  "syllabus.new.boardLabel": "বোর্ড / কর্তৃপক্ষ",
  "syllabus.new.boardPlaceholder": "যেমন জাতীয় কারিকুলাম",
  "syllabus.new.topicsLabel": "টপিক *",
  "syllabus.new.topicsHint": "— প্রতি লাইনে একটি ({count})",
  "syllabus.new.sourceLabel": "উৎস নথি (ঐচ্ছিক)",
  "syllabus.new.attachFile": "অফিসিয়াল PDF সংযুক্ত করুন (ঐচ্ছিক)",
  "syllabus.new.removeFile": "ফাইল সরান",
  "syllabus.new.publish": "সিলেবাস প্রকাশ করুন",

  // Toasts
  "syllabus.toast.deleted": "সিলেবাস মুছে ফেলা হয়েছে",
  "syllabus.toast.published": "সিলেবাস প্রকাশিত হয়েছে",
  "syllabus.toast.fileTooLarge": "ফাইল খুব বড় — সর্বোচ্চ {max}MB",
  "syllabus.toast.unsupportedFile":
    "অসমর্থিত ফাইল টাইপ — একটি PDF, ছবি বা নথি আপলোড করুন",
  "syllabus.toast.pickSubject": "অনুগ্রহ করে একটি বিষয় নির্বাচন করুন",
  "syllabus.toast.addTopic": "অন্তত একটি টপিক যোগ করুন (প্রতি লাইনে একটি)",

  // Errors
  "syllabus.err.publishFailed": "সিলেবাস প্রকাশ করা যায়নি",
};
