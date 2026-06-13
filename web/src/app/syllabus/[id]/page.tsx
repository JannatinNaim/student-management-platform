"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CheckCircle2,
  Circle,
  ClipboardList,
  FileText,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, apiErrorMessage, fileUrl } from "@/lib/api";
import type { SyllabusDetail } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useT, tContent } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "@/components/ui/Toast";

export default function SyllabusDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useT();
  const { isAuthenticated, isAdmin } = useAuth();
  const queryKey = ["syllabus", id];

  const { data: syllabus, isLoading } = useQuery({
    queryKey,
    queryFn: async () => (await api.get(`/syllabus/${id}`)).data.data as SyllabusDetail,
  });

  const trackMutation = useMutation({
    mutationFn: (track: boolean) =>
      track ? api.post(`/syllabus/${id}/track`) : api.delete(`/syllabus/${id}/track`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["syllabus-tracked"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ topicId, done }: { topicId: string; done: boolean }) =>
      api.patch(`/syllabus/${id}/topics/${topicId}`, { done }),
    // Optimistically flip the topic so the checklist feels instant.
    onMutate: async ({ topicId, done }) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<SyllabusDetail>(queryKey);
      if (prev) {
        const topics = prev.topics.map((t) => (t.id === topicId ? { ...t, done } : t));
        queryClient.setQueryData<SyllabusDetail>(queryKey, {
          ...prev,
          topics,
          tracking: prev.tracking || done,
          completedCount: topics.filter((t) => t.done).length,
        });
      }
      return { prev };
    },
    onError: (error, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
      toast.error(apiErrorMessage(error, t));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabus-tracked"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/syllabus/${id}`),
    onSuccess: () => {
      toast.success(t("syllabus.toast.deleted"));
      router.push("/syllabus");
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  if (isLoading) {
    return (
      <div className="container-page max-w-3xl py-10">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-4 h-24 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!syllabus) {
    return (
      <div className="container-page max-w-3xl py-20 text-center">
        <h1 className="text-xl font-bold">{t("syllabus.detail.notFound")}</h1>
        <Link href="/syllabus" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
          <ArrowLeft className="h-4 w-4" /> {t("syllabus.detail.backToAll")}
        </Link>
      </div>
    );
  }

  const pct =
    syllabus.topicsCount > 0
      ? Math.round((syllabus.completedCount / syllabus.topicsCount) * 100)
      : 0;

  const onToggle = (topicId: string, done: boolean) => {
    if (!isAuthenticated) {
      toast.info(t("syllabus.detail.signInToTrack"));
      router.push(`/login?next=/syllabus/${id}`);
      return;
    }
    toggleMutation.mutate({ topicId, done });
  };

  return (
    <div className="container-page max-w-3xl py-10">
      <Link
        href="/syllabus"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" /> {t("syllabus.detail.allSyllabuses")}
      </Link>

      <div className="card mt-4 p-6">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span className="text-base">{syllabus.subject.icon}</span>
          <span>{tContent(t, "subject." + syllabus.subject.slug + ".name", syllabus.subject.name)}</span>
          {syllabus.className && (
            <>
              <span aria-hidden>·</span>
              <span>{syllabus.className}</span>
            </>
          )}
          {syllabus.board && (
            <>
              <span aria-hidden>·</span>
              <span>{syllabus.board}</span>
            </>
          )}
        </div>

        <h1 className="mt-2 flex items-start gap-2 text-2xl font-bold tracking-tight">
          <ClipboardList className="mt-1 h-6 w-6 shrink-0 text-primary-500" />
          {syllabus.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{syllabus.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <Avatar src={syllabus.createdBy.avatarUrl} name={syllabus.createdBy.name} size="xs" />
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <BadgeCheck className="h-3.5 w-3.5" /> {syllabus.createdBy.name}
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {t("syllabus.detail.trackersCount", { count: syllabus.trackersCount })}
          </span>
          {syllabus.fileUrl && (
            <a
              href={fileUrl(syllabus.fileUrl) ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary-600 hover:underline"
            >
              <FileText className="h-3.5 w-3.5" /> {t("syllabus.detail.sourceDocument")}
            </a>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            variant={syllabus.tracking ? "outline" : "primary"}
            loading={trackMutation.isPending}
            onClick={() => {
              if (!isAuthenticated) {
                router.push(`/login?next=/syllabus/${id}`);
                return;
              }
              trackMutation.mutate(!syllabus.tracking);
            }}
          >
            {syllabus.tracking ? (
              <>
                <Check className="h-4 w-4" /> {t("syllabus.detail.tracking")}
              </>
            ) : (
              t("syllabus.detail.track")
            )}
          </Button>
          {isAdmin && (
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => {
                if (confirm(t("syllabus.detail.deleteConfirm"))) {
                  deleteMutation.mutate();
                }
              }}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" /> {t("common.delete")}
            </Button>
          )}
        </div>

        <div className="mt-5">
          <div className="flex justify-between text-xs font-medium text-slate-400">
            <span>{t("syllabus.detail.progress")}</span>
            <span>
              {t("syllabus.detail.progressStat", {
                completed: syllabus.completedCount,
                total: syllabus.topicsCount,
                pct,
              })}
            </span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="text-lg font-bold">{t("syllabus.detail.topics")}</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          {t("syllabus.detail.topicsHint")}
        </p>
        <div className="mt-4 space-y-1.5">
          {syllabus.topics.map((topic, index) => (
            <button
              key={topic.id}
              onClick={() => onToggle(topic.id, !topic.done)}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-3 py-3 text-left transition hover:border-primary-200 dark:border-slate-800 dark:hover:border-primary-900"
            >
              {topic.done ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-600" />
              )}
              <span className="shrink-0 text-xs font-medium tabular-nums text-slate-300 dark:text-slate-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "text-sm",
                  topic.done && "text-slate-400 line-through"
                )}
              >
                {topic.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
