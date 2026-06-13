"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Flame, Medal, Sparkles, Star, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { NoteCard as NoteCardType } from "@/lib/types";
import { NoteCard } from "@/components/notes/NoteCard";
import { NoteGridSkeleton } from "@/components/ui/Skeleton";
import { useT } from "@/lib/i18n";

const ICONS = {
  medal: Medal,
  flame: Flame,
  star: Star,
  sparkles: Sparkles,
} satisfies Record<string, LucideIcon>;

export type NoteSectionIcon = keyof typeof ICONS;

export function NoteSection({
  title,
  subtitle,
  endpoint,
  viewAllHref,
  icon,
}: {
  title: string;
  subtitle: string;
  endpoint: string;
  viewAllHref: string;
  icon: NoteSectionIcon;
}) {
  const t = useT();
  const Icon = ICONS[icon];

  const { data: notes, isLoading } = useQuery({
    queryKey: ["note-section", endpoint],
    queryFn: async () => {
      const { data } = await api.get<{ data: NoteCardType[] }>(endpoint);
      return data.data;
    },
  });

  if (!isLoading && !notes?.length) return null;

  return (
    <section className="container-page py-12">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" /> {title}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <Link
          href={viewAllHref}
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 sm:flex"
        >
          {t("common.viewAll")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {isLoading ? (
        <NoteGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {notes!.slice(0, 4).map((note, index) => (
            <NoteCard key={note.id} note={note} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
