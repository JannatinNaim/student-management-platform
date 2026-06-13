"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  dictionary,
  LOCALES,
  type Locale,
  type TranslationKey,
} from "./dictionary";
import { formatDate, timeAgo } from "../utils";
import { api } from "../api";
import { useAuthStore } from "@/stores/auth";

const STORAGE_KEY = "smart-notes-locale";
const DEFAULT_LOCALE: Locale = "en";

/** Persist the language preference for signed-in users (best-effort). */
async function persistLocale(locale: Locale): Promise<void> {
  if (!useAuthStore.getState().accessToken) return;
  try {
    await api.patch("/users/me/profile", { locale });
    const { user, setUser } = useAuthStore.getState();
    if (user) setUser({ ...user, locale });
  } catch {
    // Non-critical — localStorage remains the source of truth in the UI.
  }
}

/** A translate function: `t("nav.browseNotes")`, with optional `{placeholder}` vars. */
export type TFunction = (
  key: TranslationKey,
  vars?: Record<string, string | number>
) => string;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Switch between the two supported locales. */
  toggleLocale: () => void;
  t: TFunction;
  /** False until the persisted preference has been read on the client. */
  hydrated: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as string[]).includes(value);
}

function interpolate(
  template: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in vars ? String(vars[name]) : match
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [hydrated, setHydrated] = useState(false);

  // Read the persisted preference once on mount.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLocale(stored)) setLocaleState(stored);
    } catch {
      // localStorage unavailable (private mode, SSR mismatch) — keep default.
    }
    setHydrated(true);
  }, []);

  // Keep <html lang> in sync so the right font / a11y semantics apply.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore write failures.
    }
    // Best-effort: persist the preference for signed-in users so server-sent
    // emails arrive in the right language. Anonymous users only use localStorage.
    void persistLocale(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "bn" : "en");
  }, [locale, setLocale]);

  const t = useCallback<TFunction>(
    (key, vars) => {
      const table = dictionary[locale] ?? dictionary[DEFAULT_LOCALE];
      const template = table[key] ?? dictionary[DEFAULT_LOCALE][key] ?? key;
      return interpolate(template, vars);
    },
    [locale]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, toggleLocale, t, hydrated }),
    [locale, setLocale, toggleLocale, t, hydrated]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a <LanguageProvider>");
  }
  return ctx;
}

/** Convenience hook for components that only need the translate function. */
export function useT(): TFunction {
  return useLanguage().t;
}

/**
 * Translate a dynamically-built content key (e.g. `subject.${slug}.name`),
 * falling back to a server-provided English value when the key is unknown.
 * `t` echoes the key back for unknown keys, which is how we detect a miss.
 */
export function tContent(
  t: TFunction,
  key: string,
  fallback: string
): string {
  const result = t(key as TranslationKey);
  return result === key ? fallback : result;
}

/**
 * Locale-bound formatting helpers (relative time, dates) so components don't
 * have to thread `t`/`locale` into every `timeAgo`/`formatDate` call.
 */
export function useFormat(): {
  timeAgo: (value: string | Date) => string;
  formatDate: (value: string | Date) => string;
} {
  const { t, locale } = useLanguage();
  return useMemo(
    () => ({
      timeAgo: (value: string | Date) => timeAgo(value, t),
      formatDate: (value: string | Date) => formatDate(value, locale),
    }),
    [t, locale]
  );
}
