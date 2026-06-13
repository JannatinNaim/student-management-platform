"use client";

import { BadgeCheck, ListChecks } from "lucide-react";
import Link from "next/link";
import type { SyllabusCard } from "@/lib/types";
import { useT, tContent } from "@/lib/i18n";

export function SyllabusCardItem({ syllabus }: { syllabus: SyllabusCard }) {
  const t = useT();
  const pct =
    syllabus.topicsCount > 0
      ? Math.round((syllabus.completedCount / syllabus.topicsCount) * 100)
      : 0;

  return (
    <Link
      href={`/syllabus/${syllabus.id}`}
      className="card group flex h-full flex-col p-5 transition hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <span className="text-base">{syllabus.subject.icon}</span>
        <span>{tContent(t, "subject." + syllabus.subject.slug + ".name", syllabus.subject.name)}</span>
        {syllabus.className && (
          <>
            <span aria-hidden>·</span>
            <span>{syllabus.className}</span>
          </>
        )}
      </div>

      <h3 className="mt-2 line-clamp-2 font-bold leading-snug text-slate-800 group-hover:text-primary-600 dark:text-slate-100">
        {syllabus.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-slate-500 dark:text-slate-400">
        {syllabus.description}
      </p>

      <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1">
          <ListChecks className="h-3.5 w-3.5" /> {t("syllabus.card.topics", { count: syllabus.topicsCount })}
        </span>
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <BadgeCheck className="h-3.5 w-3.5" /> {t("syllabus.card.official")}
        </span>
      </div>

      {syllabus.tracking && (
        <div className="mt-3">
          <div className="flex justify-between text-[11px] font-medium text-slate-400">
            <span>{t("syllabus.card.yourProgress")}</span>
            <span>
              {t("syllabus.card.progressStat", {
                completed: syllabus.completedCount,
                total: syllabus.topicsCount,
                pct,
              })}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  );
}
