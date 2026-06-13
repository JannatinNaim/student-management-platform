"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Crown, Loader2, Plus, Shield, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import type { ApiListResponse, GroupMember, Problem, ProblemGroup } from "@/lib/types";
import { useT, useFormat, tContent } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { CreateProblemDialog } from "@/components/problems/CreateProblemDialog";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/components/ui/Toast";

const roleIcon: Record<string, React.ReactNode> = {
  OWNER: <Crown className="h-3.5 w-3.5 text-amber-500" />,
  MODERATOR: <Shield className="h-3.5 w-3.5 text-primary-500" />,
};

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useT();
  const { timeAgo } = useFormat();
  const { isAuthenticated } = useAuth();
  const [postOpen, setPostOpen] = useState(false);

  const { data: group, isLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const { data } = await api.get<{ data: ProblemGroup }>(`/groups/${id}`);
      return data.data;
    },
  });

  const groupId = group?.id;

  const { data: problems } = useQuery({
    queryKey: ["group-problems", groupId],
    queryFn: async () => {
      const { data } = await api.get<ApiListResponse<Problem>>(`/groups/${groupId}/problems`, {
        params: { limit: 30 },
      });
      return data.data;
    },
    enabled: Boolean(groupId),
  });

  const { data: members } = useQuery({
    queryKey: ["group-members", groupId],
    queryFn: async () => {
      const { data } = await api.get<ApiListResponse<GroupMember>>(`/groups/${groupId}/members`, {
        params: { limit: 20 },
      });
      return data.data;
    },
    enabled: Boolean(groupId),
  });

  const isMember = Boolean(group?.viewer?.membership);

  const joinMutation = useMutation({
    mutationFn: async (join: boolean) => {
      if (join) await api.post(`/groups/${groupId}/join`);
      else await api.delete(`/groups/${groupId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });
    },
    onError: (err) => toast.error(apiErrorMessage(err, t)),
  });

  const onJoin = () => {
    if (!isAuthenticated) return router.push("/login");
    joinMutation.mutate(!isMember);
  };

  if (isLoading) {
    return (
      <div className="container-page flex justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-primary-500" />
      </div>
    );
  }
  if (!group) {
    return (
      <div className="container-page py-20">
        <EmptyState title={t("groups.detail.notFoundTitle")} description={t("groups.detail.notFoundDescription")} />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      {/* Header */}
      <div className="card mb-8 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {group.subject ? (
                <Link href={`/groups?subject=${group.subject.slug}`}>
                  <Badge tone="primary">
                    {group.subject.icon} {tContent(t, "subject." + group.subject.slug + ".name", group.subject.name)}
                  </Badge>
                </Link>
              ) : (
                <Badge tone="neutral">{t("groups.general")}</Badge>
              )}
              <span className="text-xs text-slate-400">{t("groups.detail.created", { time: timeAgo(group.createdAt) })}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              {group.description}
            </p>
            {group.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {group.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/groups?q=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {t("groups.detail.members", { count: group.membersCount })}
              </span>
              <span>{t("groups.detail.problemsCount", { count: group.problemsCount })}</span>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            {group.viewer?.membership !== "OWNER" && (
              <Button
                variant={isMember ? "outline" : "primary"}
                onClick={onJoin}
                loading={joinMutation.isPending}
              >
                {isMember ? t("groups.detail.leave") : t("groups.detail.join")}
              </Button>
            )}
            {isMember && (
              <Button onClick={() => setPostOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" /> {t("groups.detail.postProblem")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        {/* Problems */}
        <div>
          <h2 className="mb-4 text-lg font-bold">{t("groups.detail.problemsHeading")}</h2>
          {!problems ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
          ) : problems.length === 0 ? (
            <EmptyState
              title={t("groups.detail.problemsEmptyTitle")}
              description={isMember ? t("groups.detail.problemsEmptyMember") : t("groups.detail.problemsEmptyNonMember")}
              action={
                isMember ? (
                  <Button onClick={() => setPostOpen(true)} className="gap-1.5">
                    <Plus className="h-4 w-4" /> {t("groups.detail.postProblem")}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-4">
              {problems.map((problem, index) => (
                <ProblemCard key={problem.id} problem={problem} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Members sidebar */}
        <aside>
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {t("groups.detail.membersHeading")}
            </h2>
            <ul className="space-y-3">
              {(members ?? []).map((member) => (
                <li key={member.user.id}>
                  <Link
                    href={`/profile/${member.user.username}`}
                    className="flex items-center gap-2.5"
                  >
                    <Avatar src={member.user.avatarUrl} name={member.user.name} size="sm" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 truncate text-sm font-medium">
                        {member.user.name}
                        {roleIcon[member.role]}
                      </p>
                      <p className="truncate text-xs text-slate-400">@{member.user.username}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {isMember && (
            <p className="mt-3 flex items-center gap-1.5 px-1 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> {t("groups.detail.youAreMember")}
            </p>
          )}
        </aside>
      </div>

      {postOpen && groupId && (
        <CreateProblemDialog groupId={groupId} onClose={() => setPostOpen(false)} />
      )}
    </div>
  );
}
