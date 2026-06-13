"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { LOCALE_LABELS, LOCALE_SHORT } from "@/lib/i18n";

export function LanguageToggle() {
  const { locale, toggleLocale, t, hydrated } = useLanguage();

  // Avoid a hydration flash before the persisted locale is read.
  if (!hydrated) return <div className="h-9 w-9" />;

  const next = locale === "en" ? "bn" : "en";

  return (
    <button
      onClick={toggleLocale}
      aria-label={t("lang.switchTo", { label: LOCALE_LABELS[next] })}
      title={t("lang.switchTo", { label: LOCALE_LABELS[next] })}
      className="flex h-9 items-center justify-center gap-1.5 rounded-xl px-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      <Languages className="h-5 w-5" />
      <span className="text-xs font-semibold">{LOCALE_SHORT[locale]}</span>
    </button>
  );
}
