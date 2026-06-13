"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Medal, Trophy } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { levelName } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useT } from "@/lib/i18n";

interface Contributor {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  institution: string | null;
  points: number;
  level: number;
  notesCount: number;
}

export function TopContributors() {
  const t = useT();
  const { data: contributors } = useQuery({
    queryKey: ["top-contributors"],
    queryFn: async () => {
      const { data } = await api.get<{ data: Contributor[] }>("/stats/top-contributors");
      return data.data;
    },
  });

  if (!contributors?.length) return null;

  return (
    <section className="bg-gradient-to-b from-transparent via-primary-50/50 to-transparent py-12 dark:via-primary-950/20">
      <div className="container-page">
        <div className="mb-7 text-center">
          <h2 className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Trophy className="h-7 w-7 text-amber-500" /> {t("landing.contributors.title")}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {t("landing.contributors.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {contributors.map((contributor, index) => (
            <motion.div
              key={contributor.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
            >
              <Link
                href={`/profile/${contributor.username}`}
                className="card flex flex-col items-center gap-2 p-5 text-center transition hover:shadow-card-hover"
              >
                <div className="relative">
                  <Avatar src={contributor.avatarUrl} name={contributor.name} size="lg" />
                  {index < 3 && (
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-white shadow">
                      <Medal className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
                <div>
                  <p className="line-clamp-1 text-sm font-semibold">{contributor.name}</p>
                  <p className="text-xs text-slate-400">@{contributor.username}</p>
                </div>
                <Badge tone="primary">
                  <Trophy className="h-3 w-3" />{" "}
                  {t("landing.contributors.points", { points: contributor.points })}
                </Badge>
                <p className="text-[11px] text-slate-400">
                  {t("landing.contributors.level", {
                    level: contributor.level,
                    name: levelName(contributor.level),
                    count: contributor.notesCount,
                  })}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
