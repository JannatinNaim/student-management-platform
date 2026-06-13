"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { BadgeCheck, Filter, Loader2, SearchX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import type { ApiListResponse, NoteCard as NoteCardType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NoteCard } from "@/components/notes/NoteCard";
import { SearchBar } from "@/components/search/SearchBar";
import { useSubjects } from "@/components/landing/SubjectsGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { NoteGridSkeleton } from "@/components/ui/Skeleton";
import { useT, tContent } from "@/lib/i18n";

const sortOptions = [
  { value: "newest", labelKey: "notes.sort.newest" },
  { value: "oldest", labelKey: "notes.sort.oldest" },
  { value: "downloads", labelKey: "notes.sort.downloads" },
  { value: "rating", labelKey: "notes.sort.rating" },
  { value: "likes", labelKey: "notes.sort.likes" },
] as const;

const typeOptions = [
  { value: "", labelKey: "notes.allTypes" },
  { value: "PDF", labelKey: "notes.type.pdf" },
  { value: "IMAGE", labelKey: "notes.type.image" },
  { value: "HANDWRITTEN", labelKey: "notes.type.handwritten" },
  { value: "DOCUMENT", labelKey: "notes.type.document" },
] as const;

function BrowseNotes() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: subjects } = useSubjects();
  const t = useT();

  const q = searchParams.get("q") ?? "";
  const subject = searchParams.get("subject") ?? "";
  const type = searchParams.get("type") ?? "";
  const official = searchParams.get("official") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/notes?${params.toString()}`);
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["notes", { q, subject, type, official, sort }],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<ApiListResponse<NoteCardType>>("/notes", {
        params: { q: q || undefined, subject: subject || undefined, type: type || undefined, official: official || undefined, sort, page: pageParam, limit: 12 },
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

  const notes = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.meta.total ?? 0;

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("notes.browseTitle")}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {official === "true"
            ? t(total === 1 ? "notes.officialCountOne" : "notes.officialCount", { count: total })
            : q
              ? t("notes.resultsFor", { q, count: total })
              : t("notes.communityCount", { count: total })}
        </p>
      </div>

      <div className="mb-6 md:hidden">
        <SearchBar />
      </div>

      <div className="mb-7 flex flex-wrap items-center gap-2.5">
        <Filter className="h-4 w-4 text-slate-400" />
        <select
          value={subject}
          onChange={(e) => setParam("subject", e.target.value)}
          aria-label={t("notes.filterBySubject")}
          className="input h-9 w-auto py-0 text-xs"
        >
          <option value="">{t("notes.allSubjects")}</option>
          {(subjects ?? []).map((s) => (
            <option key={s.id} value={s.slug}>
              {tContent(t, "subject." + s.slug + ".name", s.name)}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setParam("type", e.target.value)}
          aria-label={t("notes.filterByType")}
          className="input h-9 w-auto py-0 text-xs"
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
        <button
          onClick={() => setParam("official", official === "true" ? "" : "true")}
          aria-pressed={official === "true"}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition",
            official === "true"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          )}
        >
          <BadgeCheck className="h-3.5 w-3.5" /> {t("notes.official")}
        </button>
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
        <NoteGridSkeleton count={12} />
      ) : notes.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-7 w-7" />}
          title={t("notes.empty.title")}
          description={t("notes.empty.desc")}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {notes.map((note, index) => (
              <NoteCard key={note.id} note={note} index={index % 12} />
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

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="container-page py-8"><NoteGridSkeleton count={12} /></div>}>
      <BrowseNotes />
    </Suspense>
  );
}
