"use client";

import { useQuery } from "@tanstack/react-query";
import { BookMarked } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { NoteCard as NoteCardType } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { useT, tContent } from "@/lib/i18n";
import { useSubjects } from "@/components/landing/SubjectsGrid";
import { NoteCard } from "@/components/notes/NoteCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { NoteGridSkeleton } from "@/components/ui/Skeleton";

export default function BookmarksPage() {
  const t = useT();
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const { data: subjects } = useSubjects();
  const [subject, setSubject] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.push("/login?next=/bookmarks");
  }, [hydrated, isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["bookmarks", subject, sort],
    queryFn: async () => {
      const { data } = await api.get<{ data: NoteCardType[] }>("/bookmarks", {
        params: { subject: subject || undefined, sort, limit: 48 },
      });
      return data.data;
    },
    enabled: isAuthenticated,
  });

  if (!hydrated || !isAuthenticated) return null;

  return (
    <div className="container-page py-10">
      <div className="mb-7 flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("bookmarks.title")}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("bookmarks.subtitle")}
          </p>
        </div>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label={t("bookmarks.filterBySubject")} className="input h-9 w-auto py-0 text-xs">
          <option value="">{t("bookmarks.allSubjects")}</option>
          {(subjects ?? []).map((s) => (
            <option key={s.id} value={s.slug}>{tContent(t, "subject." + s.slug + ".name", s.name)}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as "newest" | "oldest")} aria-label={t("bookmarks.sortBookmarks")} className="input h-9 w-auto py-0 text-xs">
          <option value="newest">{t("bookmarks.sort.newest")}</option>
          <option value="oldest">{t("bookmarks.sort.oldest")}</option>
        </select>
      </div>

      {isLoading ? (
        <NoteGridSkeleton count={8} />
      ) : data?.length ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((note, index) => (
            <NoteCard key={note.id} note={note} index={index % 8} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookMarked className="h-7 w-7" />}
          title={t("bookmarks.empty.title")}
          description={t("bookmarks.empty.desc")}
          action={
            <Link href="/notes">
              <Button>{t("notes.browseTitle")}</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
