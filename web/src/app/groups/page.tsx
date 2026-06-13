"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, Plus, SearchX, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { ApiListResponse, ProblemGroup } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useT, tContent } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useSubjects } from "@/components/landing/SubjectsGrid";
import { GroupCard } from "@/components/groups/GroupCard";
import { CreateGroupDialog } from "@/components/problems/CreateGroupDialog";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { NoteGridSkeleton } from "@/components/ui/Skeleton";

function BrowseGroups() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const { isAuthenticated } = useAuth();
  const { data: subjects } = useSubjects();
  const [dialogOpen, setDialogOpen] = useState(false);

  const sortOptions = [
    { value: "active", label: t("groups.list.sortActive") },
    { value: "members", label: t("groups.list.sortMembers") },
    { value: "newest", label: t("groups.list.sortNewest") },
  ];

  const q = searchParams.get("q") ?? "";
  const subject = searchParams.get("subject") ?? "";
  const sort = searchParams.get("sort") ?? "active";

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/groups?${params.toString()}`);
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["groups", { q, subject, sort }],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<ApiListResponse<ProblemGroup>>("/groups", {
        params: { q: q || undefined, subject: subject || undefined, sort, page: pageParam, limit: 12 },
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

  const groups = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.meta.total ?? 0;

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("groups.list.title")}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {q
              ? t("groups.list.subtitleResults", { q, count: total })
              : t("groups.list.subtitleCount", { count: total })}
          </p>
        </div>
        <Button
          onClick={() => (isAuthenticated ? setDialogOpen(true) : router.push("/login"))}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" /> {t("groups.list.newGroup")}
        </Button>
      </div>

      <div className="mb-6">
        <input
          defaultValue={q}
          onKeyDown={(e) => e.key === "Enter" && setParam("q", (e.target as HTMLInputElement).value.trim())}
          placeholder={t("groups.list.searchPlaceholder")}
          className="input h-11"
          aria-label={t("groups.list.searchAria")}
        />
      </div>

      <div className="mb-7 flex flex-wrap items-center gap-2.5">
        <select
          value={subject}
          onChange={(e) => setParam("subject", e.target.value)}
          aria-label={t("groups.list.filterBySubject")}
          className="input h-9 w-auto py-0 text-xs"
        >
          <option value="">{t("groups.list.allSubjects")}</option>
          {(subjects ?? []).map((s) => (
            <option key={s.id} value={s.slug}>
              {tContent(t, "subject." + s.slug + ".name", s.name)}
            </option>
          ))}
        </select>
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
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <NoteGridSkeleton count={9} />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-7 w-7" />}
          title={t("groups.list.emptyTitle")}
          description={t("groups.list.emptyDescription")}
          action={
            <Button onClick={() => (isAuthenticated ? setDialogOpen(true) : router.push("/login"))} className="gap-1.5">
              <Users className="h-4 w-4" /> {t("groups.list.createGroup")}
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group, index) => (
              <GroupCard key={group.id} group={group} index={index % 12} />
            ))}
          </div>
          <div ref={sentinelRef} className="flex justify-center py-8">
            {isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin text-primary-500" />}
          </div>
        </>
      )}

      {dialogOpen && <CreateGroupDialog onClose={() => setDialogOpen(false)} />}
    </div>
  );
}

export default function GroupsPage() {
  return (
    <Suspense fallback={<div className="container-page py-8"><NoteGridSkeleton count={9} /></div>}>
      <BrowseGroups />
    </Suspense>
  );
}
