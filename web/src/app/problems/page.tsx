"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, SearchX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import type { ApiListResponse, Problem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useT, tContent } from "@/lib/i18n";
import { useSubjects } from "@/components/landing/SubjectsGrid";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { NoteGridSkeleton } from "@/components/ui/Skeleton";

const sortOptions = [
  { value: "newest", labelKey: "problems.sort.newest" },
  { value: "active", labelKey: "problems.sort.active" },
  { value: "views", labelKey: "problems.sort.views" },
] as const;

const statusOptions = [
  { value: "", labelKey: "common.all" },
  { value: "OPEN", labelKey: "problems.status.open" },
  { value: "SOLVED", labelKey: "problems.status.solved" },
] as const;

function BrowseProblems() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: subjects } = useSubjects();
  const t = useT();

  const q = searchParams.get("q") ?? "";
  const subject = searchParams.get("subject") ?? "";
  const status = searchParams.get("status") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/problems?${params.toString()}`);
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["problems", { q, subject, status, sort }],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<ApiListResponse<Problem>>("/problems", {
        params: {
          q: q || undefined,
          subject: subject || undefined,
          status: status || undefined,
          sort,
          page: pageParam,
          limit: 12,
        },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.page + 1 : undefined,
  });

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "400px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const problems = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.meta.total ?? 0;

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("problems.browse.title")}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {q
            ? t("problems.browse.resultsSubtitle", { q, count: total })
            : t("problems.browse.countSubtitle", { count: total })}
        </p>
      </div>

      <div className="mb-6">
        <input
          defaultValue={q}
          onKeyDown={(e) => e.key === "Enter" && setParam("q", (e.target as HTMLInputElement).value.trim())}
          placeholder={t("problems.browse.searchPlaceholder")}
          className="input h-11"
          aria-label={t("problems.browse.searchAria")}
        />
      </div>

      <div className="mb-7 flex flex-wrap items-center gap-2.5">
        <select
          value={subject}
          onChange={(e) => setParam("subject", e.target.value)}
          aria-label={t("problems.browse.filterSubjectAria")}
          className="input h-9 w-auto py-0 text-xs"
        >
          <option value="">{t("problems.browse.allSubjects")}</option>
          {(subjects ?? []).map((s) => (
            <option key={s.id} value={s.slug}>
              {tContent(t, "subject." + s.slug + ".name", s.name)}
            </option>
          ))}
        </select>
        <div className="flex gap-1.5">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setParam("status", option.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                status === option.value
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              )}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setParam("sort", option.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                sort === option.value
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              )}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <NoteGridSkeleton count={9} />
      ) : problems.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-7 w-7" />}
          title={t("problems.browse.emptyTitle")}
          description={t("problems.browse.emptyDescription")}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((problem, index) => (
              <ProblemCard key={problem.id} problem={problem} index={index % 12} showGroup />
            ))}
          </div>
          <div ref={sentinelRef} className="flex justify-center py-8">
            {isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin text-primary-500" />}
          </div>
        </>
      )}
    </div>
  );
}

export default function ProblemsPage() {
  return (
    <Suspense fallback={<div className="container-page py-8"><NoteGridSkeleton count={9} /></div>}>
      <BrowseProblems />
    </Suspense>
  );
}
