"use client";

import { motion } from "framer-motion";
import { MessagesSquare, Users } from "lucide-react";
import Link from "next/link";
import type { ProblemGroup } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { useT, useFormat, tContent } from "@/lib/i18n";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

export function GroupCard({ group, index = 0 }: { group: ProblemGroup; index?: number }) {
  const t = useT();
  const { timeAgo } = useFormat();
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -4 }}
      className="card group flex h-full flex-col p-5 transition-shadow hover:shadow-card-hover"
    >
      <Link href={`/groups/${group.slug}`} className="flex h-full flex-col">
        <div className="mb-3 flex items-start justify-between gap-2">
          {group.subject ? (
            <Badge tone="primary">
              {group.subject.icon} {tContent(t, "subject." + group.subject.slug + ".name", group.subject.name)}
            </Badge>
          ) : (
            <Badge tone="neutral">{t("groups.general")}</Badge>
          )}
          <span className="shrink-0 text-xs text-slate-400">{timeAgo(group.createdAt)}</span>
        </div>

        <h3 className="line-clamp-1 font-semibold text-slate-900 transition-colors group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400">
          {group.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {group.description}
        </p>

        {group.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {group.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar src={group.creator.avatarUrl} name={group.creator.name} size="xs" />
            <span className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">
              {group.creator.name}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {formatNumber(group.membersCount)}
            </span>
            <span className="flex items-center gap-1">
              <MessagesSquare className="h-3.5 w-3.5" /> {formatNumber(group.problemsCount)}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
