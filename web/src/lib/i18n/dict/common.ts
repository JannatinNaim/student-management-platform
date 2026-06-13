/**
 * Shared, surface-agnostic strings. Reuse these everywhere instead of adding a
 * duplicate key to a surface module — generic actions ("Save", "Cancel",
 * "Delete"), loading/empty/error states, and pagination all live here.
 */
export const en = {
  // App / brand
  "common.appName": "Smart Notes",

  // Auth shortcuts (used in nav + several surfaces)
  "common.signIn": "Sign in",
  "common.getStarted": "Get Started",
  "common.signOut": "Sign out",
  "common.upload": "Upload",

  // Generic actions
  "common.save": "Save",
  "common.saveChanges": "Save changes",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.remove": "Remove",
  "common.edit": "Edit",
  "common.create": "Create",
  "common.submit": "Submit",
  "common.confirm": "Confirm",
  "common.close": "Close",
  "common.back": "Back",
  "common.next": "Next",
  "common.previous": "Previous",
  "common.continue": "Continue",
  "common.search": "Search",
  "common.filter": "Filter",
  "common.clear": "Clear",
  "common.clearAll": "Clear all",
  "common.apply": "Apply",
  "common.reset": "Reset",
  "common.viewAll": "View all",
  "common.seeMore": "See more",
  "common.showMore": "Show more",
  "common.showLess": "Show less",
  "common.loadMore": "Load more",
  "common.retry": "Try again",
  "common.copy": "Copy",
  "common.copied": "Copied",
  "common.copyLink": "Copy link",
  "common.share": "Share",
  "common.report": "Report",
  "common.optional": "Optional",
  "common.required": "Required",
  "common.yes": "Yes",
  "common.no": "No",
  "common.all": "All",
  "common.none": "None",
  "common.or": "or",
  "common.and": "and",

  // States
  "common.loading": "Loading…",
  "common.saving": "Saving…",
  "common.deleting": "Deleting…",
  "common.uploading": "Uploading…",
  "common.processing": "Processing…",
  "common.somethingWentWrong": "Something went wrong",
  "common.tryAgainLater": "Please try again later.",
  "common.noResults": "No results found",

  // Pagination
  "common.page": "Page",
  "common.pageOf": "Page {current} of {total}",
  "common.results": "{count} results",

  // Confirmation
  "common.areYouSure": "Are you sure?",
  "common.thisCannotBeUndone": "This action cannot be undone.",

  // Language toggle
  "lang.switchTo": "Switch to {label}",
} as const;

export const bn: Record<keyof typeof en, string> = {
  // App / brand
  "common.appName": "স্মার্ট নোটস",

  // Auth shortcuts
  "common.signIn": "সাইন ইন",
  "common.getStarted": "শুরু করুন",
  "common.signOut": "সাইন আউট",
  "common.upload": "আপলোড",

  // Generic actions
  "common.save": "সংরক্ষণ করুন",
  "common.saveChanges": "পরিবর্তন সংরক্ষণ করুন",
  "common.cancel": "বাতিল করুন",
  "common.delete": "মুছুন",
  "common.remove": "সরান",
  "common.edit": "সম্পাদনা করুন",
  "common.create": "তৈরি করুন",
  "common.submit": "জমা দিন",
  "common.confirm": "নিশ্চিত করুন",
  "common.close": "বন্ধ করুন",
  "common.back": "ফিরে যান",
  "common.next": "পরবর্তী",
  "common.previous": "পূর্ববর্তী",
  "common.continue": "চালিয়ে যান",
  "common.search": "অনুসন্ধান করুন",
  "common.filter": "ফিল্টার",
  "common.clear": "পরিষ্কার করুন",
  "common.clearAll": "সব পরিষ্কার করুন",
  "common.apply": "প্রয়োগ করুন",
  "common.reset": "রিসেট করুন",
  "common.viewAll": "সব দেখুন",
  "common.seeMore": "আরও দেখুন",
  "common.showMore": "আরও দেখান",
  "common.showLess": "কম দেখান",
  "common.loadMore": "আরও লোড করুন",
  "common.retry": "আবার চেষ্টা করুন",
  "common.copy": "কপি করুন",
  "common.copied": "কপি হয়েছে",
  "common.copyLink": "লিঙ্ক কপি করুন",
  "common.share": "শেয়ার করুন",
  "common.report": "রিপোর্ট করুন",
  "common.optional": "ঐচ্ছিক",
  "common.required": "আবশ্যক",
  "common.yes": "হ্যাঁ",
  "common.no": "না",
  "common.all": "সব",
  "common.none": "কোনোটিই নয়",
  "common.or": "অথবা",
  "common.and": "এবং",

  // States
  "common.loading": "লোড হচ্ছে…",
  "common.saving": "সংরক্ষণ করা হচ্ছে…",
  "common.deleting": "মুছে ফেলা হচ্ছে…",
  "common.uploading": "আপলোড হচ্ছে…",
  "common.processing": "প্রক্রিয়া করা হচ্ছে…",
  "common.somethingWentWrong": "কিছু একটা সমস্যা হয়েছে",
  "common.tryAgainLater": "অনুগ্রহ করে পরে আবার চেষ্টা করুন।",
  "common.noResults": "কোনো ফলাফল পাওয়া যায়নি",

  // Pagination
  "common.page": "পৃষ্ঠা",
  "common.pageOf": "পৃষ্ঠা {current} / {total}",
  "common.results": "{count}টি ফলাফল",

  // Confirmation
  "common.areYouSure": "আপনি কি নিশ্চিত?",
  "common.thisCannotBeUndone": "এই কাজটি আর ফেরানো যাবে না।",

  // Language toggle
  "lang.switchTo": "{label}-এ স্যুইচ করুন",
};
