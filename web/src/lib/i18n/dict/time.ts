/**
 * Relative-time strings used by `timeAgo()`. The `{n}` placeholder is the count;
 * each unit has a `.one` / `.other` variant for English pluralisation (Bangla
 * uses the same form for both).
 */
export const en = {
  "time.justNow": "just now",
  "time.year.one": "{n} year ago",
  "time.year.other": "{n} years ago",
  "time.month.one": "{n} month ago",
  "time.month.other": "{n} months ago",
  "time.week.one": "{n} week ago",
  "time.week.other": "{n} weeks ago",
  "time.day.one": "{n} day ago",
  "time.day.other": "{n} days ago",
  "time.hour.one": "{n} hour ago",
  "time.hour.other": "{n} hours ago",
  "time.minute.one": "{n} minute ago",
  "time.minute.other": "{n} minutes ago",
} as const;

export const bn: Record<keyof typeof en, string> = {
  "time.justNow": "এইমাত্র",
  "time.year.one": "{n} বছর আগে",
  "time.year.other": "{n} বছর আগে",
  "time.month.one": "{n} মাস আগে",
  "time.month.other": "{n} মাস আগে",
  "time.week.one": "{n} সপ্তাহ আগে",
  "time.week.other": "{n} সপ্তাহ আগে",
  "time.day.one": "{n} দিন আগে",
  "time.day.other": "{n} দিন আগে",
  "time.hour.one": "{n} ঘণ্টা আগে",
  "time.hour.other": "{n} ঘণ্টা আগে",
  "time.minute.one": "{n} মিনিট আগে",
  "time.minute.other": "{n} মিনিট আগে",
};
