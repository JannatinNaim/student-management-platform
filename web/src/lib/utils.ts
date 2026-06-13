import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale, TFunction, TranslationKey } from "./i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(value);
}

/** Locale-aware date. Pass the active locale (defaults to English month names). */
export function formatDate(value: string | Date, locale: Locale = "en"): string {
  return new Date(value).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const TIME_UNITS: Array<[number, "year" | "month" | "week" | "day" | "hour" | "minute"]> = [
  [31536000, "year"],
  [2592000, "month"],
  [604800, "week"],
  [86400, "day"],
  [3600, "hour"],
  [60, "minute"],
];

/**
 * Relative time. Pass a `t` to translate (see `dict/time.ts`); without it,
 * falls back to English so non-React callers still work.
 */
export function timeAgo(value: string | Date, t?: TFunction): string {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  for (const [unitSeconds, label] of TIME_UNITS) {
    const amount = Math.floor(seconds / unitSeconds);
    if (amount >= 1) {
      const key = `time.${label}.${amount === 1 ? "one" : "other"}` as TranslationKey;
      if (t) return t(key, { n: amount });
      return `${amount} ${label}${amount > 1 ? "s" : ""} ago`;
    }
  }
  return t ? t("time.justNow") : "just now";
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Copy text to the clipboard. The async Clipboard API is only available in
 * secure contexts (HTTPS or localhost); on plain HTTP `navigator.clipboard`
 * is undefined, so fall back to the legacy execCommand("copy") approach.
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}
