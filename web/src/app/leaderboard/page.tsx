"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Medal, Trophy } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { levelName } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";
import { tContent, useT } from "@/lib/i18n";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

interface Entry {
  rank: number;
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  institution: string | null;
  points: number;
  level: number;
  notesCount: number;
  followersCount: number;
}

// Tailwind colour for each podium place: gold, silver, bronze.
const medalColor = ["text-amber-400", "text-slate-400", "text-amber-700"];

export default function LeaderboardPage() {
  const t = useT();
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await api.get<{ data: Entry[] }>("/stats/leaderboard", {
        params: { limit: 50 },
      });
      return data.data;
    },
  });

  return (
    <div className="container-page max-w-4xl py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
          <Trophy className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{t("leaderboard.title")}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t("leaderboard.subtitle")}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(index * 0.03, 0.3) }}
            >
              <Link
                href={`/profile/${entry.username}`}
                className={cn(
                  "card flex items-center gap-4 p-4 transition hover:shadow-card-hover sm:p-5",
                  entry.rank <= 3 &&
                    "border-amber-200 bg-gradient-to-r from-amber-50/80 to-transparent dark:border-amber-900/60 dark:from-amber-950/30"
                )}
              >
                <span className="flex w-10 justify-center text-lg font-bold text-slate-400">
                  {entry.rank <= 3 ? (
                    <Medal className={cn("h-6 w-6", medalColor[entry.rank - 1])} />
                  ) : (
                    `#${entry.rank}`
                  )}
                </span>
                <Avatar src={entry.avatarUrl} name={entry.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{entry.name}</p>
                  <p className="truncate text-xs text-slate-400">
                    @{entry.username}
                    {entry.institution && ` · ${entry.institution}`}
                  </p>
                </div>
                <div className="hidden text-right text-xs text-slate-400 sm:block">
                  <p>{t("leaderboard.notesCount", { count: entry.notesCount })}</p>
                  <p>{t("leaderboard.followersCount", { count: formatNumber(entry.followersCount) })}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-primary-600 dark:text-primary-400">
                    {formatNumber(entry.points)}
                  </p>
                  <Badge tone="secondary" className="text-[10px]">
                    {t("leaderboard.levelBadge", {
                      level: entry.level,
                      name: tContent(t, "level." + entry.level, levelName(entry.level)),
                    })}
                  </Badge>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
