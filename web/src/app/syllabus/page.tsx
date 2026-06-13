"use client";

import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";
import type { SyllabusCard } from "@/lib/types";
import { useT, tContent } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useSubjects } from "@/components/landing/SubjectsGrid";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { SyllabusCardItem } from "@/components/syllabus/SyllabusCardItem";

export default function SyllabusPage() {
  const t = useT();
  const { isAuthenticated, isAdmin } = useAuth();
  const { data: subjects } = useSubjects();
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("");

  const { data: list, isLoading } = useQuery({
    queryKey: ["syllabus", { q, subject }],
    queryFn: async () =>
      (
        await api.get("/syllabus", { params: { q: q || undefined, subject: subject || undefined, limit: 50 } })
      ).data.data as SyllabusCard[],
  });

  const { data: tracked } = useQuery({
    queryKey: ["syllabus-tracked"],
    queryFn: async () => (await api.get("/syllabus/tracked")).data.data as SyllabusCard[],
    enabled: isAuthenticated,
  });

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <ClipboardList className="h-7 w-7 text-primary-500" /> {t("syllabus.list.title")}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {t("syllabus.list.subtitle")}
          </p>
        </div>
        {isAdmin && (
          <Link href="/syllabus/new">
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" /> {t("syllabus.list.new")}
            </Button>
          </Link>
        )}
      </div>

      {tracked && tracked.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            {t("syllabus.list.continueTracking")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tracked.map((s) => (
              <SyllabusCardItem key={s.id} syllabus={s} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("syllabus.list.searchPlaceholder")}
            className="input pl-9"
            aria-label={t("syllabus.list.searchLabel")}
          />
        </div>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input w-auto"
          aria-label={t("syllabus.list.filterLabel")}
        >
          <option value="">{t("syllabus.list.allSubjects")}</option>
          {(subjects ?? []).map((s) => (
            <option key={s.id} value={s.slug}>
              {tContent(t, "subject." + s.slug + ".name", s.name)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : list && list.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <SyllabusCardItem key={s.id} syllabus={s} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ClipboardList className="h-7 w-7" />}
            title={t("syllabus.list.emptyTitle")}
            description={
              isAdmin
                ? t("syllabus.list.emptyAdmin")
                : t("syllabus.list.emptyStudent")
            }
            action={
              isAdmin ? (
                <Link href="/syllabus/new">
                  <Button className="gap-1.5">
                    <Plus className="h-4 w-4" /> {t("syllabus.list.new")}
                  </Button>
                </Link>
              ) : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
