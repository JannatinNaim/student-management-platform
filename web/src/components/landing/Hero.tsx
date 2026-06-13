"use client";

import { motion } from "framer-motion";
import { Sparkles, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/search/SearchBar";
import { tContent, useT } from "@/lib/i18n";

// [label, slug] — slug matches the seeded subject slugs / content-map keys.
const popularSubjects: Array<[string, string]> = [
  ["Physics", "physics"],
  ["Chemistry", "chemistry"],
  ["Mathematics", "mathematics"],
  ["Biology", "biology"],
  ["ICT", "ict"],
  ["English", "english"],
];

export function Hero() {
  const t = useT();
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-primary-400/20 blur-3xl" />
        <div className="absolute -right-20 top-10 h-80 w-80 rounded-full bg-secondary-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-accent-400/10 blur-3xl" />
      </div>

      <div className="container-page flex flex-col items-center py-20 text-center sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-xs font-semibold text-primary-700 dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-300"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {t("landing.hero.badge")}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
        >
          {t("landing.hero.titlePrefix")}
          <span className="gradient-text">{t("landing.hero.titleHighlight")}</span>
          {t("landing.hero.titleSuffix")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="mt-5 max-w-xl text-base text-slate-500 dark:text-slate-400 sm:text-lg"
        >
          {t("landing.hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="mt-9 w-full max-w-xl"
        >
          <SearchBar large />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/upload">
            <Button size="lg" className="gap-2">
              <Upload className="h-5 w-5" /> {t("landing.hero.uploadCta")}
            </Button>
          </Link>
          <Link href="/notes">
            <Button size="lg" variant="outline">
              {t("landing.hero.browseCta")}
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {t("landing.hero.popular")}
          </span>
          {popularSubjects.map(([label, slug]) => (
            <Link
              key={slug}
              href={`/notes?subject=${slug}`}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-primary-300 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-primary-700 dark:hover:text-primary-400"
            >
              {tContent(t, `subject.${slug}.name`, label)}
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
