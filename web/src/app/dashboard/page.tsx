"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  BookMarked,
  BookOpen,
  Download,
  Eye,
  Hand,
  Heart,
  Star,
  Trash2,
  Trophy,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api, apiErrorMessage } from "@/lib/api";
import type { DashboardOverview, NoteCard as NoteCardType, Notification } from "@/lib/types";
import { levelName } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { tContent, useFormat, useT } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "@/components/ui/Toast";

const LEVEL_THRESHOLDS = [0, 50, 150, 400, 1000];

export default function DashboardPage() {
  const { user, isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useT();
  const { timeAgo } = useFormat();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.push("/login?next=/dashboard");
  }, [hydrated, isAuthenticated, router]);

  const { data: overview } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardOverview }>("/dashboard/overview");
      return data.data;
    },
    enabled: isAuthenticated,
  });

  const { data: analytics } = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/analytics");
      return data.data as Array<{ date: string; downloads: number; uploads: number }>;
    },
    enabled: isAuthenticated,
  });

  const { data: myNotes } = useQuery({
    queryKey: ["my-notes"],
    queryFn: async () => {
      const { data } = await api.get<{ data: NoteCardType[] }>("/dashboard/my-notes");
      return data.data;
    },
    enabled: isAuthenticated,
  });

  const { data: activity } = useQuery({
    queryKey: ["dashboard-activity"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/activity");
      return data.data as Notification[];
    },
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      toast.success(t("dashboard.toast.noteDeleted"));
      setConfirmId(null);
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, t));
      setConfirmId(null);
    },
  });

  if (!hydrated || !isAuthenticated || !user) return null;

  const cards = [
    { label: t("dashboard.stat.notes"), value: overview?.notes ?? 0, icon: BookOpen, color: "from-primary-500 to-primary-600" },
    { label: t("dashboard.stat.downloads"), value: overview?.downloads ?? 0, icon: Download, color: "from-secondary-500 to-secondary-600" },
    { label: t("dashboard.stat.views"), value: overview?.views ?? 0, icon: Eye, color: "from-accent-500 to-accent-600" },
    { label: t("dashboard.stat.likes"), value: overview?.likes ?? 0, icon: Heart, color: "from-rose-500 to-rose-600" },
    { label: t("dashboard.stat.bookmarks"), value: overview?.bookmarks ?? 0, icon: BookMarked, color: "from-emerald-500 to-emerald-600" },
    { label: t("dashboard.stat.points"), value: overview?.points ?? 0, icon: Trophy, color: "from-amber-500 to-orange-500" },
  ];

  const level = overview?.level ?? user.level;
  const points = overview?.points ?? user.points;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? null;
  const prevThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const progress = nextThreshold
    ? Math.min(100, Math.round(((points - prevThreshold) / (nextThreshold - prevThreshold)) * 100))
    : 100;

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {t("dashboard.welcomeBack", { name: user.name.split(" ")[0] })}
            <Hand className="h-6 w-6 text-amber-400" />
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("dashboard.subtitle")}
          </p>
        </div>
        <Link href="/upload">
          <Button className="gap-2">
            <Upload className="h-4 w-4" /> {t("dashboard.uploadNote")}
          </Button>
        </Link>
      </div>

      {/* Level progress */}
      <div className="card mt-7 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-secondary-500" />
            <div>
              <p className="font-bold">
                {t("dashboard.levelLabel", {
                  level,
                  name: tContent(t, "level." + level, levelName(level)),
                })}
              </p>
              <p className="text-xs text-slate-400">
                {nextThreshold
                  ? t("dashboard.pointsToNext", {
                      points: nextThreshold - points,
                      level: level + 1,
                    })
                  : t("dashboard.maxLevel")}
              </p>
            </div>
          </div>
          <Badge tone="primary">{t("dashboard.pointsBadge", { points: formatNumber(points) })}</Badge>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => (
          <div key={card.label} className="card p-4">
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-sm`}
            >
              <card.icon className="h-4 w-4" />
            </span>
            <p className="mt-3 text-2xl font-extrabold">{formatNumber(card.value)}</p>
            <p className="text-xs text-slate-400">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Analytics chart */}
      <div className="card mt-6 p-6">
        <h2 className="font-bold">{t("dashboard.analyticsTitle")}</h2>
        <div className="mt-4 h-64">
          {analytics ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics}>
                <defs>
                  <linearGradient id="downloads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="uploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value: string) => value.slice(5)}
                  stroke="#94a3b8"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" width={30} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="downloads" stroke="#2563eb" strokeWidth={2} fill="url(#downloads)" />
                <Area type="monotone" dataKey="uploads" stroke="#9333ea" strokeWidth={2} fill="url(#uploads)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Skeleton className="h-full w-full" />
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* My notes */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{t("dashboard.myNotes")}</h2>
            <span className="text-xs text-slate-400">{t("dashboard.totalCount", { count: myNotes?.length ?? 0 })}</span>
          </div>
          <div className="mt-4 space-y-2.5">
            {myNotes?.length ? (
              myNotes.slice(0, 6).map((note) => (
                <div
                  key={note.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-primary-200 hover:bg-primary-50/40 dark:border-slate-800 dark:hover:border-primary-900 dark:hover:bg-primary-950/20"
                >
                  <Link href={`/notes/${note.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <DynamicIcon name={note.subject.icon} className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{note.title}</p>
                      <p className="text-xs text-slate-400">
                        {t("dashboard.noteStats", {
                          downloads: formatNumber(note.downloadsCount),
                          views: formatNumber(note.views),
                        })}
                        <Star className="inline h-3 w-3 -translate-y-px fill-amber-400 text-amber-400" /> {note.avgRating.toFixed(1)}
                      </p>
                    </div>
                  </Link>
                  {note.status && note.status !== "PUBLISHED" && (
                    <Badge tone={note.status === "FLAGGED" ? "warning" : "danger"}>
                      {t(("dashboard.status." + note.status) as "dashboard.status.FLAGGED")}
                    </Badge>
                  )}
                  {confirmId === note.id ? (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(note.id)}
                        disabled={deleteMutation.isPending}
                        className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-rose-700 disabled:opacity-60"
                      >
                        {deleteMutation.isPending ? t("common.deleting") : t("common.delete")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        disabled={deleteMutation.isPending}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {t("common.cancel")}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(note.id)}
                      aria-label={t("dashboard.deleteNote", { title: note.title })}
                      className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <EmptyState title={t("dashboard.noNotesTitle")} description={t("dashboard.noNotesDesc")} />
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card p-6">
          <h2 className="font-bold">{t("dashboard.recentActivity")}</h2>
          <div className="mt-4 space-y-3">
            {activity?.length ? (
              activity.map((item) => (
                <div key={item.id} className="flex gap-2.5 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
                  <div className="min-w-0">
                    <p className="text-slate-600 dark:text-slate-300">
                      {item.actor && <strong>{item.actor.name} </strong>}
                      {item.message}
                    </p>
                    <p className="text-xs text-slate-400">{timeAgo(item.createdAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">{t("dashboard.noActivity")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
