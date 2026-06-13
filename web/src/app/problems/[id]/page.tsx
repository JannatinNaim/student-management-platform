"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Eye, Flag, Loader2, MessageCircle, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { problemKey } from "@/hooks/useProblemChat";
import type { ProblemDetail } from "@/lib/types";
import { useT, useFormat, tContent } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { ProblemChat } from "@/components/problems/ProblemChat";
import { RelatedProblems } from "@/components/problems/RelatedProblems";
import { ReportProblemDialog } from "@/components/problems/ReportProblemDialog";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ProblemDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const t = useT();
  const { timeAgo } = useFormat();
  const [reportOpen, setReportOpen] = useState(false);

  const { data: problem, isLoading } = useQuery({
    queryKey: problemKey(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: ProblemDetail }>(`/problems/${id}`);
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="container-page flex justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-primary-500" />
      </div>
    );
  }
  if (!problem) {
    return (
      <div className="container-page py-20">
        <EmptyState title={t("problems.detail.notFoundTitle")} description={t("problems.detail.notFoundDescription")} />
      </div>
    );
  }

  const membership = problem.viewer?.membership ?? null;
  const canPost = Boolean(membership);
  const canAcceptSolution =
    Boolean(problem.viewer?.isAuthor) ||
    membership === "OWNER" ||
    membership === "MODERATOR" ||
    user?.role === "ADMIN";
  const solved = problem.status === "SOLVED";

  const onRequireJoin = () => {
    if (!isAuthenticated) return router.push("/login");
    router.push(`/groups/${problem.group.slug}`);
  };

  return (
    <div className="container-page py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main: problem + chat */}
        <div>
          <div className="card mb-6 p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {solved ? (
                <Badge tone="success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {t("problems.status.solved")}
                </Badge>
              ) : (
                <Badge tone="warning">{t("problems.status.open")}</Badge>
              )}
              {problem.subject && (
                <Link href={`/problems?subject=${problem.subject.slug}`}>
                  <Badge tone="primary">
                    {problem.subject.icon}{" "}
                    {tContent(t, "subject." + problem.subject.slug + ".name", problem.subject.name)}
                  </Badge>
                </Link>
              )}
              <Link
                href={`/groups/${problem.group.slug}`}
                className="text-xs text-slate-400 hover:text-primary-600"
              >
                {t("problems.detail.inGroup", { group: problem.group.name })}
              </Link>
            </div>

            <h1 className="text-2xl font-bold tracking-tight">{problem.title}</h1>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
              {problem.body}
            </p>

            {problem.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {problem.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/problems?q=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Link href={`/profile/${problem.author.username}`} className="flex items-center gap-2.5">
                <Avatar src={problem.author.avatarUrl} name={problem.author.name} size="sm" />
                <div>
                  <p className="text-sm font-semibold">{problem.author.name}</p>
                  <p className="text-xs text-slate-400">{t("problems.detail.askedAgo", { time: timeAgo(problem.createdAt) })}</p>
                </div>
              </Link>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" /> {problem.messagesCount}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> {problem.views}
                </span>
                {isAuthenticated && (
                  <button
                    onClick={() => setReportOpen(true)}
                    className="flex items-center gap-1 hover:text-rose-500"
                  >
                    <Flag className="h-3.5 w-3.5" /> {t("common.report")}
                  </button>
                )}
              </div>
            </div>
          </div>

          <ProblemChat
            problem={problem}
            currentUserId={user?.id ?? null}
            canPost={canPost}
            canAcceptSolution={canAcceptSolution}
            onRequireJoin={onRequireJoin}
          />
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{t("problems.detail.groupHeading")}</h2>
            <Link href={`/groups/${problem.group.slug}`} className="block">
              <p className="font-semibold hover:text-primary-600">{problem.group.name}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                <Users className="h-3.5 w-3.5" /> {t("problems.detail.openGroupHint")}
              </p>
            </Link>
            {!canPost && (
              <button
                onClick={onRequireJoin}
                className="mt-4 w-full rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                {t("problems.detail.joinToParticipate")}
              </button>
            )}
          </div>
        </aside>
      </div>

      <RelatedProblems
        subject={problem.subject?.slug}
        tag={problem.tags[0]}
        exclude={problem.id}
        title={t("problems.related.heading")}
      />

      {reportOpen && <ReportProblemDialog problemId={problem.id} onClose={() => setReportOpen(false)} />}
    </div>
  );
}
