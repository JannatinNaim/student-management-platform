/**
 * Shared UI bits, search, and the 404 page. See dict/common.ts for the module
 * shape. Reuse common.* for generic actions/states instead of redefining them.
 */
export const en = {
  // Search bar
  "search.placeholder": "Search notes, subjects, chapters, authors...",
  "search.ariaSearchNotes": "Search notes",
  "search.ariaClear": "Clear search",
  "search.discussions": "Discussions",
  "search.recentSearches": "Recent searches",
  "search.searchAllFor": "Search all results for “{query}”",

  // 404 / not found
  "notFound.title": "Page not found",
  "notFound.description": "The page you're looking for doesn't exist or may have been moved.",
  "notFound.backHome": "Back to Home",

  // Generic UI
  "ui.rating": "Rating: {value} of 5",
  "ui.rateStars": "{count} star",
  "ui.rateStarsPlural": "{count} stars",
} as const;

export const bn: Record<keyof typeof en, string> = {
  // Search bar
  "search.placeholder": "নোট, বিষয়, অধ্যায়, লেখক অনুসন্ধান করুন...",
  "search.ariaSearchNotes": "নোট অনুসন্ধান করুন",
  "search.ariaClear": "অনুসন্ধান পরিষ্কার করুন",
  "search.discussions": "আলোচনা",
  "search.recentSearches": "সাম্প্রতিক অনুসন্ধান",
  "search.searchAllFor": "“{query}”-এর সব ফলাফল অনুসন্ধান করুন",

  // 404 / not found
  "notFound.title": "পৃষ্ঠা পাওয়া যায়নি",
  "notFound.description": "আপনি যে পৃষ্ঠাটি খুঁজছেন তা নেই অথবা সরিয়ে ফেলা হয়ে থাকতে পারে।",
  "notFound.backHome": "হোমে ফিরে যান",

  // Generic UI
  "ui.rating": "রেটিং: ৫-এর মধ্যে {value}",
  "ui.rateStars": "{count} তারা",
  "ui.rateStarsPlural": "{count} তারা",
};
