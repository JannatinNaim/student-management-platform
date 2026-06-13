/**
 * i18n dictionary for Smart Notes (aggregator).
 *
 * EVERY user-facing string the platform serves must be translatable between
 * English (`en`) and Bangla (`bn`/বাংলা) — UI labels, toasts, server error &
 * status codes, notification templates, and platform-authored DB content
 * (subjects, achievements). The ONLY exception is user-generated/posted media
 * (note titles, comment bodies, uploaded files, profile bios, …).
 *
 * Strings live in per-surface modules under `./dict/*`; each module exports an
 * `en` literal and a `bn: Record<keyof typeof en, string>` (so TS flags any
 * missing Bangla translation). This file merges them. Components read strings
 * through the `useT()` hook — never hardcode display text in JSX.
 *
 * Add a key to the relevant `./dict/<surface>.ts` module (both locales). Server
 * error/status codes live in `./dict/errors.ts` and MUST stay in sync with the
 * API's `server/src/lib/messages.ts`; notification templates in
 * `./dict/notifications.ts` stay in sync with the server's `notify()` calls.
 */
import * as common from "./dict/common";
import * as nav from "./dict/nav";
import * as footer from "./dict/footer";
import * as errors from "./dict/errors";
import * as notifications from "./dict/notifications";
import * as content from "./dict/content";
import * as time from "./dict/time";
import * as auth from "./dict/auth";
import * as notes from "./dict/notes";
import * as problems from "./dict/problems";
import * as groups from "./dict/groups";
import * as syllabus from "./dict/syllabus";
import * as pages from "./dict/pages";
import * as account from "./dict/account";
import * as landing from "./dict/landing";
import * as ui from "./dict/ui";

export type Locale = "en" | "bn";

export const LOCALES: Locale[] = ["en", "bn"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  bn: "বাংলা",
};

/** Short label shown inside the toggle button. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  bn: "বাং",
};

const en = {
  ...common.en,
  ...nav.en,
  ...footer.en,
  ...errors.en,
  ...notifications.en,
  ...content.en,
  ...time.en,
  ...auth.en,
  ...notes.en,
  ...problems.en,
  ...groups.en,
  ...syllabus.en,
  ...pages.en,
  ...account.en,
  ...landing.en,
  ...ui.en,
} as const;

/** All translatable keys, derived from the English base so TS flags omissions. */
export type TranslationKey = keyof typeof en;

const bn: Record<TranslationKey, string> = {
  ...common.bn,
  ...nav.bn,
  ...footer.bn,
  ...errors.bn,
  ...notifications.bn,
  ...content.bn,
  ...time.bn,
  ...auth.bn,
  ...notes.bn,
  ...problems.bn,
  ...groups.bn,
  ...syllabus.bn,
  ...pages.bn,
  ...account.bn,
  ...landing.bn,
  ...ui.bn,
};

export const dictionary: Record<Locale, Record<TranslationKey, string>> = {
  en,
  bn,
};
