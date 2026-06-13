"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Library } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Subject } from "@/lib/types";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { useT, tContent } from "@/lib/i18n";

export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data } = await api.get<{ data: Subject[] }>("/subjects");
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function SubjectsGrid({ limit }: { limit?: number }) {
  const t = useT();
  const { data: subjects } = useSubjects();
  const shown = limit ? subjects?.slice(0, limit) : subjects;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {(shown ?? []).map((subject, index) => (
        <motion.div
          key={subject.id}
          className="h-full"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: Math.min(index * 0.04, 0.4) }}
        >
          <Link
            href={`/notes?subject=${subject.slug}`}
            className="card group flex h-full flex-col items-center justify-center gap-2 p-5 text-center transition hover:-translate-y-1 hover:shadow-card-hover"
          >
            <DynamicIcon
              name={subject.icon}
              className="h-9 w-9 shrink-0 text-primary-600 transition-transform group-hover:scale-110 dark:text-primary-400"
            />
            <span className="line-clamp-2 flex h-10 items-center text-sm font-semibold leading-tight">
              {tContent(t, "subject." + subject.slug + ".name", subject.name)}
            </span>
            <span className="text-xs text-slate-400">
              {t("landing.subjects.notesCount", { count: subject.notesCount ?? 0 })}
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

export function SubjectsSection() {
  const t = useT();
  return (
    <section className="container-page py-12">
      <div className="mb-7 text-center">
        <h2 className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Library className="h-7 w-7 text-primary-600 dark:text-primary-400" /> {t("landing.subjects.title")}
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          {t("landing.subjects.subtitle")}
        </p>
      </div>
      <SubjectsGrid limit={12} />
      <div className="mt-6 text-center">
        <Link
          href="/subjects"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          {t("landing.subjects.viewAll")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
