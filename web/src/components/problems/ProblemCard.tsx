"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Eye, MessageCircle } from "lucide-react";
import Link from "next/link";
import type { Problem } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { useT, useFormat, tContent } from "@/lib/i18n";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

export function ProblemCard({
  problem,
  index = 0,
  showGroup = false,
}: {
  problem: Problem;
  index?: number;
  showGroup?: boolean;
}) {
  const t = useT();
  const { timeAgo } = useFormat();
  const solved = problem.status === "SOLVED";
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.25) }}
      className="card p-5 transition-shadow hover:shadow-card-hover"
    >
      <Link href={`/problems/${problem.id}`} className="block">
        <div className="mb-2 flex items-center gap-2">
          {solved ? (
            <Badge tone="success">
              <CheckCircle2 className="h-3.5 w-3.5" /> {t("problems.status.solved")}
            </Badge>
          ) : (
            <Badge tone="warning">{t("problems.status.open")}</Badge>
          )}
          {problem.subject && (
            <Badge tone="primary">
              {problem.subject.icon}{" "}
              {tContent(t, "subject." + problem.subject.slug + ".name", problem.subject.name)}
            </Badge>
          )}
          {showGroup && (
            <span className="truncate text-xs text-slate-400">
              {t("problems.card.inGroup", { group: problem.group.name })}
            </span>
          )}
        </div>

        <h3 className="line-clamp-1 font-semibold text-slate-900 transition-colors hover:text-primary-600 dark:text-slate-100">
          {problem.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{problem.body}</p>

        {problem.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {problem.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar src={problem.author.avatarUrl} name={problem.author.name} size="xs" />
            <span className="truncate text-xs text-slate-500 dark:text-slate-400">
              {problem.author.name} · {timeAgo(problem.createdAt)}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" /> {formatNumber(problem.messagesCount)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {formatNumber(problem.views)}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
