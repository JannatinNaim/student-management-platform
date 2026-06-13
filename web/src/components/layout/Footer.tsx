"use client";

import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useT, type TranslationKey } from "@/lib/i18n";

const columns: Array<{
  titleKey: TranslationKey;
  links: Array<{ href: string; labelKey: TranslationKey }>;
}> = [
  {
    titleKey: "footer.col.platform",
    links: [
      { href: "/notes", labelKey: "footer.link.browseNotes" },
      { href: "/subjects", labelKey: "footer.link.subjects" },
      { href: "/upload", labelKey: "footer.link.uploadNotes" },
      { href: "/leaderboard", labelKey: "footer.link.leaderboard" },
    ],
  },
  {
    titleKey: "footer.col.studyTools",
    links: [
      { href: "/study-tools", labelKey: "footer.link.examCountdown" },
      { href: "/study-tools", labelKey: "footer.link.studyPlanner" },
      { href: "/study-tools", labelKey: "footer.link.pomodoro" },
    ],
  },
  {
    titleKey: "footer.col.account",
    links: [
      { href: "/register", labelKey: "footer.link.createAccount" },
      { href: "/login", labelKey: "footer.link.signIn" },
      { href: "/dashboard", labelKey: "footer.link.dashboard" },
      { href: "/bookmarks", labelKey: "footer.link.bookmarks" },
    ],
  },
];

export function Footer() {
  const t = useT();

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-surface-dark">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="text-lg">
              Smart<span className="gradient-text">Notes</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {t("footer.tagline")}
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.titleKey}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              {t(column.titleKey)}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 py-5 dark:border-slate-800">
        <p className="container-page text-center text-xs text-slate-400">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
