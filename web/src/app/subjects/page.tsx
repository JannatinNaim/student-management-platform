"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useSubjects } from "@/components/landing/SubjectsGrid";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Skeleton } from "@/components/ui/Skeleton";
import { tContent, useT } from "@/lib/i18n";

export default function SubjectsPage() {
  const { data: subjects, isLoading } = useSubjects();
  const t = useT();

  return (
    <div className="container-page py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("subjects.title")}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t("subjects.subtitle")}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }, (_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(subjects ?? []).map((subject, index) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(index * 0.04, 0.4) }}
            >
              <div className="card group flex h-full flex-col gap-4 p-6 transition hover:-translate-y-1 hover:shadow-card-hover">
                <Link href={`/notes?subject=${subject.slug}`} className="flex flex-1 gap-4">
                  <DynamicIcon
                    name={subject.icon}
                    className="h-10 w-10 shrink-0 text-primary-600 transition-transform group-hover:scale-110 dark:text-primary-400"
                  />
                  <div>
                    <h2 className="font-semibold group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      {tContent(t, "subject." + subject.slug + ".name", subject.name)}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                      {tContent(t, "subject." + subject.slug + ".desc", subject.description)}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400">
                      {t("subjects.notesCount", { count: subject.notesCount ?? 0 })} <ArrowRight className="h-3.5 w-3.5" />
                    </p>
                  </div>
                </Link>
                {!!subject.groupsCount && (
                  <Link
                    href={`/groups?subject=${subject.slug}`}
                    className="-mb-1 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500 hover:text-primary-600 dark:border-slate-800 dark:text-slate-400"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> {t(subject.groupsCount === 1 ? "subjects.groupCount_one" : "subjects.groupCount_other", { count: subject.groupsCount })}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
