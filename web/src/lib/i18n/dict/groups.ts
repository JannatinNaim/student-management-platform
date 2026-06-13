/** Groups surface — browse, detail, group card, and create-group dialog. */
export const en = {
  // List / browse page
  "groups.list.title": "Problem-Solving Groups",
  "groups.list.subtitleResults": "Results for “{q}” — {count} found",
  "groups.list.subtitleCount": "{count} groups working through problems together",
  "groups.list.newGroup": "New group",
  "groups.list.searchPlaceholder": "Search groups by name, tag or subject…",
  "groups.list.searchAria": "Search groups",
  "groups.list.filterBySubject": "Filter by subject",
  "groups.list.allSubjects": "All Subjects",
  "groups.list.sortActive": "Most Active",
  "groups.list.sortMembers": "Most Members",
  "groups.list.sortNewest": "Newest",
  "groups.list.emptyTitle": "No groups yet",
  "groups.list.emptyDescription": "Be the first to start a problem-solving group.",
  "groups.list.createGroup": "Create a group",

  // Generic
  "groups.general": "General",

  // Card
  "groups.card.created": "Created {time}",

  // Detail page
  "groups.detail.created": "Created {time}",
  "groups.detail.members": "{count} members",
  "groups.detail.problemsCount": "{count} problems",
  "groups.detail.leave": "Leave group",
  "groups.detail.join": "Join group",
  "groups.detail.postProblem": "Post a problem",
  "groups.detail.problemsHeading": "Problems",
  "groups.detail.problemsEmptyTitle": "No problems yet",
  "groups.detail.problemsEmptyMember": "Post the first problem to get the group started.",
  "groups.detail.problemsEmptyNonMember": "Join the group to post the first problem.",
  "groups.detail.membersHeading": "Members",
  "groups.detail.youAreMember": "You're a member of this group",
  "groups.detail.notFoundTitle": "Group not found",
  "groups.detail.notFoundDescription": "This group may have been removed.",

  // Create dialog
  "groups.create.title": "New problem-solving group",
  "groups.create.nameLabel": "Name",
  "groups.create.namePlaceholder": "e.g. Calculus Problem Lab",
  "groups.create.descriptionLabel": "Description",
  "groups.create.descriptionPlaceholder": "What kind of problems will this group tackle?",
  "groups.create.subjectLabel": "Subject (optional)",
  "groups.create.noSubject": "No subject",
  "groups.create.tagsLabel": "Tags (optional)",
  "groups.create.tagsPlaceholder": "comma, separated",
  "groups.create.submit": "Create group",

  // Toasts
  "groups.toast.created": "Group created — you're the owner!",

  // Errors
  "groups.err.createFailed": "Could not create the group",
} as const;

export const bn: Record<keyof typeof en, string> = {
  // List / browse page
  "groups.list.title": "সমস্যা সমাধান গ্রুপ",
  "groups.list.subtitleResults": "“{q}”-এর ফলাফল — {count}টি পাওয়া গেছে",
  "groups.list.subtitleCount": "{count}টি গ্রুপ একসাথে সমস্যা সমাধান করছে",
  "groups.list.newGroup": "নতুন গ্রুপ",
  "groups.list.searchPlaceholder": "নাম, ট্যাগ বা বিষয় দিয়ে গ্রুপ খুঁজুন…",
  "groups.list.searchAria": "গ্রুপ অনুসন্ধান করুন",
  "groups.list.filterBySubject": "বিষয় অনুযায়ী ফিল্টার করুন",
  "groups.list.allSubjects": "সব বিষয়",
  "groups.list.sortActive": "সবচেয়ে সক্রিয়",
  "groups.list.sortMembers": "সবচেয়ে বেশি সদস্য",
  "groups.list.sortNewest": "নতুনতম",
  "groups.list.emptyTitle": "এখনও কোনো গ্রুপ নেই",
  "groups.list.emptyDescription": "একটি সমস্যা সমাধান গ্রুপ শুরু করা প্রথম ব্যক্তি হোন।",
  "groups.list.createGroup": "একটি গ্রুপ তৈরি করুন",

  // Generic
  "groups.general": "সাধারণ",

  // Card
  "groups.card.created": "{time} তৈরি হয়েছে",

  // Detail page
  "groups.detail.created": "{time} তৈরি হয়েছে",
  "groups.detail.members": "{count} জন সদস্য",
  "groups.detail.problemsCount": "{count}টি সমস্যা",
  "groups.detail.leave": "গ্রুপ ছাড়ুন",
  "groups.detail.join": "গ্রুপে যোগ দিন",
  "groups.detail.postProblem": "একটি সমস্যা পোস্ট করুন",
  "groups.detail.problemsHeading": "সমস্যাসমূহ",
  "groups.detail.problemsEmptyTitle": "এখনও কোনো সমস্যা নেই",
  "groups.detail.problemsEmptyMember": "গ্রুপটি শুরু করতে প্রথম সমস্যাটি পোস্ট করুন।",
  "groups.detail.problemsEmptyNonMember": "প্রথম সমস্যাটি পোস্ট করতে গ্রুপে যোগ দিন।",
  "groups.detail.membersHeading": "সদস্যবৃন্দ",
  "groups.detail.youAreMember": "আপনি এই গ্রুপের একজন সদস্য",
  "groups.detail.notFoundTitle": "গ্রুপ পাওয়া যায়নি",
  "groups.detail.notFoundDescription": "এই গ্রুপটি হয়তো সরিয়ে ফেলা হয়েছে।",

  // Create dialog
  "groups.create.title": "নতুন সমস্যা সমাধান গ্রুপ",
  "groups.create.nameLabel": "নাম",
  "groups.create.namePlaceholder": "যেমন ক্যালকুলাস প্রবলেম ল্যাব",
  "groups.create.descriptionLabel": "বিবরণ",
  "groups.create.descriptionPlaceholder": "এই গ্রুপটি কী ধরনের সমস্যা নিয়ে কাজ করবে?",
  "groups.create.subjectLabel": "বিষয় (ঐচ্ছিক)",
  "groups.create.noSubject": "কোনো বিষয় নেই",
  "groups.create.tagsLabel": "ট্যাগ (ঐচ্ছিক)",
  "groups.create.tagsPlaceholder": "কমা, দিয়ে আলাদা করুন",
  "groups.create.submit": "গ্রুপ তৈরি করুন",

  // Toasts
  "groups.toast.created": "গ্রুপ তৈরি হয়েছে — আপনিই মালিক!",

  // Errors
  "groups.err.createFailed": "গ্রুপটি তৈরি করা যায়নি",
};
