"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Download,
  Flag,
  MessageSquare,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api, apiErrorMessage } from "@/lib/api";
import { cn, formatNumber } from "@/lib/utils";
import { useT, useFormat, tContent, type TFunction } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DynamicIcon, SUBJECT_ICON_NAMES } from "@/components/ui/DynamicIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "@/components/ui/Toast";

type Tab = "overview" | "users" | "notes" | "syllabi" | "reports" | "comments" | "subjects";

const tabs: Array<{ key: Tab; labelKey: string; icon: React.ElementType }> = [
  { key: "overview", labelKey: "admin.tab.overview", icon: BarChart3 },
  { key: "users", labelKey: "admin.tab.users", icon: Users },
  { key: "notes", labelKey: "admin.tab.notes", icon: BookOpen },
  { key: "syllabi", labelKey: "admin.tab.syllabi", icon: ClipboardList },
  { key: "reports", labelKey: "admin.tab.reports", icon: Flag },
  { key: "comments", labelKey: "admin.tab.comments", icon: MessageSquare },
  { key: "subjects", labelKey: "admin.tab.subjects", icon: ShieldCheck },
];

const NOTE_STATUS_KEY: Record<string, string> = {
  PUBLISHED: "admin.notes.status.published",
  FLAGGED: "admin.notes.status.flagged",
  REMOVED: "admin.notes.status.removed",
};

function noteStatusLabel(t: TFunction, status: string): string {
  const key = NOTE_STATUS_KEY[status];
  return key ? t(key as Parameters<TFunction>[0]) : status;
}

const SYLLABUS_STATUS_KEY: Record<string, string> = {
  PUBLISHED: "admin.syllabi.status.published",
  ARCHIVED: "admin.syllabi.status.archived",
};

function syllabusStatusLabel(t: TFunction, status: string): string {
  const key = SYLLABUS_STATUS_KEY[status];
  return key ? t(key as Parameters<TFunction>[0]) : status;
}

const REPORT_REASON_KEY: Record<string, string> = {
  SPAM: "admin.reports.reason.SPAM",
  INAPPROPRIATE: "admin.reports.reason.INAPPROPRIATE",
  COPYRIGHT: "admin.reports.reason.COPYRIGHT",
  MISINFORMATION: "admin.reports.reason.MISINFORMATION",
  OTHER: "admin.reports.reason.OTHER",
};

function reportReasonLabel(t: TFunction, reason: string): string {
  const key = REPORT_REASON_KEY[reason];
  return key ? t(key as Parameters<TFunction>[0]) : reason;
}

function Overview() {
  const t = useT();
  const { data: overview } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => (await api.get("/admin/overview")).data.data,
  });
  const { data: analytics } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => (await api.get("/admin/analytics")).data.data,
  });

  const cards = [
    { label: t("admin.overview.totalUsers"), value: overview?.users ?? 0, sub: t("admin.overview.thisMonth", { count: overview?.last30Days?.users ?? 0 }), icon: Users },
    { label: t("admin.overview.publishedNotes"), value: overview?.notes ?? 0, sub: t("admin.overview.thisMonth", { count: overview?.last30Days?.notes ?? 0 }), icon: BookOpen },
    { label: t("admin.overview.totalDownloads"), value: overview?.downloads ?? 0, sub: t("admin.overview.thisMonth", { count: overview?.last30Days?.downloads ?? 0 }), icon: Download },
    { label: t("admin.overview.openReports"), value: overview?.openReports ?? 0, sub: t("admin.overview.needsReview"), icon: Flag },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card p-5">
            <card.icon className="h-5 w-5 text-primary-500" />
            <p className="mt-3 text-2xl font-extrabold">{formatNumber(card.value)}</p>
            <p className="text-xs text-slate-400">{card.label}</p>
            <p className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{card.sub}</p>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <h2 className="font-bold">{t("admin.overview.growthTitle")}</h2>
        <div className="mt-4 h-72">
          {analytics ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(value: string) => value.slice(5)} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" width={30} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={2} dot={false} name={t("admin.overview.chart.newUsers")} />
                <Line type="monotone" dataKey="notes" stroke="#9333ea" strokeWidth={2} dot={false} name={t("admin.overview.chart.notes")} />
                <Line type="monotone" dataKey="downloads" stroke="#06b6d4" strokeWidth={2} dot={false} name={t("admin.overview.chart.downloads")} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Skeleton className="h-full w-full" />
          )}
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const t = useT();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const { data } = useQuery({
    queryKey: ["admin-users", q],
    queryFn: async () =>
      (await api.get("/admin/users", { params: { q: q || undefined, limit: 30 } })).data.data,
  });

  const patch = useMutation({
    mutationFn: ({ id, body }: { id: string; body: object }) => api.patch(`/admin/users/${id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  return (
    <div className="card overflow-x-auto">
      <div className="border-b border-slate-100 p-4 dark:border-slate-800">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("admin.users.search")} className="input max-w-sm" />
      </div>
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
            <th className="px-4 py-3">{t("admin.users.col.user")}</th>
            <th className="px-4 py-3">{t("admin.users.col.notes")}</th>
            <th className="px-4 py-3">{t("admin.users.col.points")}</th>
            <th className="px-4 py-3">{t("admin.users.col.status")}</th>
            <th className="px-4 py-3 text-right">{t("admin.users.col.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((user: any) => (
            <tr key={user.id} className="border-b border-slate-50 dark:border-slate-800/50">
              <td className="px-4 py-3">
                <p className="font-semibold">{user.name}</p>
                <p className="text-xs text-slate-400">@{user.username} · {user.email}</p>
              </td>
              <td className="px-4 py-3">{user._count.notes}</td>
              <td className="px-4 py-3">{user.points}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {user.role === "ADMIN" && <Badge tone="secondary">{t("admin.users.badge.admin")}</Badge>}
                  {user.isBlocked ? <Badge tone="danger">{t("admin.users.badge.blocked")}</Badge> : <Badge tone="success">{t("admin.users.badge.active")}</Badge>}
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                {user.role !== "ADMIN" && (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm(t("admin.users.confirmMakeAdmin", { name: user.name }))) {
                          patch.mutate({ id: user.id, body: { role: "ADMIN" } });
                        }
                      }}
                    >
                      {t("admin.users.makeAdmin")}
                    </Button>
                    <Button
                      size="sm"
                      variant={user.isBlocked ? "outline" : "danger"}
                      onClick={() => patch.mutate({ id: user.id, body: { isBlocked: !user.isBlocked } })}
                    >
                      {user.isBlocked ? t("admin.users.unblock") : t("admin.users.block")}
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NotesTab() {
  const t = useT();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [official, setOfficial] = useState("");
  const { data } = useQuery({
    queryKey: ["admin-notes", status, official],
    queryFn: async () =>
      (
        await api.get("/admin/notes", {
          params: { status: status || undefined, official: official || undefined, limit: 30 },
        })
      ).data.data,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-notes"] });
    queryClient.invalidateQueries({ queryKey: ["notes"] });
  };

  const patch = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/notes/${id}/status`, { status }),
    onSuccess: invalidate,
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  // Official toggle + hard delete reuse the (admin-authorized) /notes endpoints.
  const setOfficialFlag = useMutation({
    mutationFn: ({ id, isOfficial }: { id: string; isOfficial: boolean }) =>
      api.patch(`/notes/${id}`, { isOfficial }),
    onSuccess: (_d, vars) => {
      invalidate();
      toast.success(vars.isOfficial ? t("admin.notes.toast.markedOfficial") : t("admin.notes.toast.removedOfficial"));
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/notes/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.notes.toast.deleted"));
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto" aria-label={t("admin.notes.filterStatus")}>
          <option value="">{t("admin.notes.allStatuses")}</option>
          <option value="PUBLISHED">{t("admin.notes.status.published")}</option>
          <option value="FLAGGED">{t("admin.notes.status.flagged")}</option>
          <option value="REMOVED">{t("admin.notes.status.removed")}</option>
        </select>
        <select value={official} onChange={(e) => setOfficial(e.target.value)} className="input w-auto" aria-label={t("admin.notes.filterOfficial")}>
          <option value="">{t("admin.notes.allNotes")}</option>
          <option value="true">{t("admin.notes.officialOnly")}</option>
          <option value="false">{t("admin.notes.communityOnly")}</option>
        </select>
        <Link href="/upload" className="ml-auto">
          <Button size="sm" variant="outline">
            <Plus className="mr-1 h-4 w-4" /> {t("admin.notes.newOfficialNote")}
          </Button>
        </Link>
      </div>
      <div className="space-y-2.5">
        {(data ?? []).map((note: any) => (
          <div key={note.id} className="card flex flex-wrap items-center gap-3 p-4">
            <DynamicIcon name={note.subject.icon} className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" />
            <div className="min-w-0 flex-1">
              <Link href={`/notes/${note.id}`} className="truncate font-semibold hover:text-primary-600">
                {note.title}
              </Link>
              <p className="text-xs text-slate-400">
                {t("admin.notes.by", { username: note.author.username, downloads: formatNumber(note.downloadsCount) })} <Star className="inline h-3 w-3 -translate-y-px fill-amber-400 text-amber-400" /> {note.avgRating.toFixed(1)}
              </p>
            </div>
            {note.isOfficial && <Badge tone="secondary">{t("admin.notes.badge.official")}</Badge>}
            <Badge tone={note.status === "PUBLISHED" ? "success" : note.status === "FLAGGED" ? "warning" : "danger"}>
              {noteStatusLabel(t, note.status)}
            </Badge>
            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setOfficialFlag.mutate({ id: note.id, isOfficial: !note.isOfficial })}
              >
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                {note.isOfficial ? t("admin.notes.unmarkOfficial") : t("admin.notes.makeOfficial")}
              </Button>
              {note.status !== "PUBLISHED" && (
                <Button size="sm" variant="outline" onClick={() => patch.mutate({ id: note.id, status: "PUBLISHED" })}>{t("admin.notes.publish")}</Button>
              )}
              {note.status !== "FLAGGED" && (
                <Button size="sm" variant="outline" onClick={() => patch.mutate({ id: note.id, status: "FLAGGED" })}>{t("admin.notes.flag")}</Button>
              )}
              {note.status !== "REMOVED" && (
                <Button size="sm" variant="outline" onClick={() => patch.mutate({ id: note.id, status: "REMOVED" })}>{t("admin.notes.remove")}</Button>
              )}
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  if (confirm(t("admin.notes.confirmDelete", { title: note.title }))) {
                    remove.mutate(note.id);
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SyllabiTab() {
  const t = useT();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const { data } = useQuery({
    queryKey: ["admin-syllabi", status],
    queryFn: async () =>
      (await api.get("/admin/syllabi", { params: { status: status || undefined, limit: 30 } })).data.data,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-syllabi"] });
    queryClient.invalidateQueries({ queryKey: ["syllabi"] });
  };

  const setStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/syllabus/${id}`, { status }),
    onSuccess: invalidate,
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/syllabus/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.syllabi.toast.deleted"));
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto" aria-label={t("admin.syllabi.filter")}>
          <option value="">{t("admin.syllabi.allStatuses")}</option>
          <option value="PUBLISHED">{t("admin.syllabi.status.published")}</option>
          <option value="ARCHIVED">{t("admin.syllabi.status.archived")}</option>
        </select>
        <Link href="/syllabus/new" className="ml-auto">
          <Button size="sm" variant="outline">
            <Plus className="mr-1 h-4 w-4" /> {t("admin.syllabi.newSyllabus")}
          </Button>
        </Link>
      </div>
      {data?.length === 0 ? (
        <EmptyState title={t("admin.syllabi.emptyTitle")} description={t("admin.syllabi.emptyDesc")} />
      ) : (
        <div className="space-y-2.5">
          {(data ?? []).map((s: any) => (
            <div key={s.id} className="card flex flex-wrap items-center gap-3 p-4">
              <span className="text-xl">{s.subject.icon}</span>
              <div className="min-w-0 flex-1">
                <Link href={`/syllabus/${s.id}`} className="truncate font-semibold hover:text-primary-600">
                  {s.title}
                </Link>
                <p className="text-xs text-slate-400">
                  {tContent(t, "subject." + s.subject.slug + ".name", s.subject.name)}
                  {s.className ? ` · ${s.className}` : ""} · {t("admin.syllabi.meta", { topics: s._count.topics, tracks: s._count.tracks })}
                </p>
              </div>
              <Badge tone={s.status === "PUBLISHED" ? "success" : "warning"}>{syllabusStatusLabel(t, s.status)}</Badge>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setStatusMut.mutate({
                      id: s.id,
                      status: s.status === "PUBLISHED" ? "ARCHIVED" : "PUBLISHED",
                    })
                  }
                >
                  {s.status === "PUBLISHED" ? t("admin.syllabi.archive") : t("admin.syllabi.publish")}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (confirm(t("admin.syllabi.confirmDelete", { title: s.title }))) {
                      remove.mutate(s.id);
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportsTab() {
  const t = useT();
  const { timeAgo } = useFormat();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("OPEN");
  const { data } = useQuery({
    queryKey: ["admin-reports", status],
    queryFn: async () =>
      (await api.get("/admin/reports", { params: { status, limit: 30 } })).data.data,
  });

  const patch = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/reports/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-reports"] }),
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  return (
    <div className="space-y-4">
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto" aria-label={t("admin.reports.filter")}>
        <option value="OPEN">{t("admin.reports.status.open")}</option>
        <option value="RESOLVED">{t("admin.reports.status.resolved")}</option>
        <option value="DISMISSED">{t("admin.reports.status.dismissed")}</option>
      </select>
      {data?.length === 0 ? (
        <EmptyState title={t("admin.reports.emptyTitle")} description={t("admin.reports.emptyDesc")} />
      ) : (
        <div className="space-y-2.5">
          {(data ?? []).map((report: any) => (
            <div key={report.id} className="card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="danger">{reportReasonLabel(t, report.reason)}</Badge>
                <span className="text-xs text-slate-400">
                  {t("admin.reports.by", { username: report.reporter.username, time: timeAgo(report.createdAt) })}
                </span>
              </div>
              {report.details && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{report.details}</p>}
              <div className="mt-2 text-sm">
                {report.note && (
                  <Link href={`/notes/${report.note.id}`} className="font-medium text-primary-600 hover:underline">
                    {t("admin.reports.note", { title: report.note.title })}
                  </Link>
                )}
                {report.comment && (
                  <Link href={`/notes/${report.comment.noteId}#comments`} className="font-medium text-primary-600 hover:underline">
                    {t("admin.reports.comment", { content: report.comment.content.slice(0, 80) })}
                  </Link>
                )}
              </div>
              {status === "OPEN" && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => patch.mutate({ id: report.id, status: "RESOLVED" })}>{t("admin.reports.resolve")}</Button>
                  <Button size="sm" variant="ghost" onClick={() => patch.mutate({ id: report.id, status: "DISMISSED" })}>{t("admin.reports.dismiss")}</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentsTab() {
  const t = useT();
  const { timeAgo } = useFormat();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-comments"],
    queryFn: async () => (await api.get("/admin/comments", { params: { limit: 30 } })).data.data,
  });

  const hide = useMutation({
    mutationFn: ({ id, isHidden }: { id: string; isHidden: boolean }) =>
      api.patch(`/admin/comments/${id}/hide`, { isHidden }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-comments"] }),
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  return (
    <div className="space-y-2.5">
      {(data ?? []).map((comment: any) => (
        <div key={comment.id} className="card flex flex-wrap items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <p className={cn("text-sm", comment.isHidden && "text-slate-400 line-through")}>
              {comment.content}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {t("admin.comments.meta", { username: comment.user.username, title: comment.note.title, time: timeAgo(comment.createdAt) })}
            </p>
          </div>
          <Button
            size="sm"
            variant={comment.isHidden ? "outline" : "danger"}
            onClick={() => hide.mutate({ id: comment.id, isHidden: !comment.isHidden })}
          >
            {comment.isHidden ? t("admin.comments.unhide") : t("admin.comments.hide")}
          </Button>
        </div>
      ))}
    </div>
  );
}

const EMPTY_SUBJECT = { name: "", icon: "BookOpen", description: "" };

function SubjectsTab() {
  const t = useT();
  const queryClient = useQueryClient();
  // editId === null → the form creates; otherwise it edits that subject.
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_SUBJECT);
  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => (await api.get("/subjects")).data.data,
  });

  const reset = () => {
    setEditId(null);
    setForm(EMPTY_SUBJECT);
  };
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["subjects"] });

  const save = useMutation({
    mutationFn: () =>
      editId ? api.patch(`/admin/subjects/${editId}`, form) : api.post("/admin/subjects", form),
    onSuccess: () => {
      invalidate();
      toast.success(editId ? t("admin.subjects.toast.updated") : t("admin.subjects.toast.created"));
      reset();
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/subjects/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.subjects.toast.deleted"));
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  return (
    <div className="space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="card flex flex-wrap items-end gap-3 p-5"
      >
        <div className="w-40">
          <label className="label">{t("admin.subjects.icon")}</label>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-primary-600 dark:bg-slate-800 dark:text-primary-400">
              <DynamicIcon name={form.icon} className="h-5 w-5" />
            </span>
            <select
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              className="input"
              aria-label={t("admin.subjects.iconSelect")}
              required
            >
              {SUBJECT_ICON_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex-1">
          <label className="label">{t("admin.subjects.name")}</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" placeholder={t("admin.subjects.namePlaceholder")} required />
        </div>
        <div className="flex-[2]">
          <label className="label">{t("admin.subjects.description")}</label>
          <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input" placeholder={t("admin.subjects.descriptionPlaceholder")} required />
        </div>
        <Button type="submit" loading={save.isPending}>{editId ? t("common.saveChanges") : t("admin.subjects.addSubject")}</Button>
        {editId && (
          <Button type="button" variant="ghost" onClick={reset}>
            <X className="mr-1 h-4 w-4" /> {t("common.cancel")}
          </Button>
        )}
      </form>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(subjects ?? []).map((subject: any) => (
          <div key={subject.id} className="card flex items-center gap-3 p-4">
            <DynamicIcon name={subject.icon} className="h-6 w-6 shrink-0 text-primary-600 dark:text-primary-400" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{tContent(t, "subject." + subject.slug + ".name", subject.name)}</p>
              <p className="truncate text-xs text-slate-400">{t("admin.subjects.meta", { notes: subject.notesCount, groups: subject.groupsCount })}</p>
            </div>
            <button
              type="button"
              aria-label={t("admin.subjects.editAria", { name: subject.name })}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800"
              onClick={() => {
                setEditId(subject.id);
                setForm({ name: subject.name, icon: subject.icon, description: subject.description });
              }}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={t("admin.subjects.deleteAria", { name: subject.name })}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
              onClick={() => {
                if (confirm(t("admin.subjects.confirmDelete", { name: subject.name }))) {
                  remove.mutate(subject.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const t = useT();
  const { isAdmin, hydrated, isAuthenticated } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    if (hydrated && (!isAuthenticated || !isAdmin)) router.push("/");
  }, [hydrated, isAuthenticated, isAdmin, router]);

  if (!hydrated || !isAdmin) return null;

  return (
    <div className="container-page py-10">
      <div className="mb-7 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("admin.panel")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.managePlatform")}</p>
        </div>
      </div>

      <div className="mb-7 flex flex-wrap gap-1.5 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold transition",
              tab === tabItem.key
                ? "border-primary-600 text-primary-600 dark:text-primary-400"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            <tabItem.icon className="h-4 w-4" /> {t(tabItem.labelKey as Parameters<TFunction>[0])}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview />}
      {tab === "users" && <UsersTab />}
      {tab === "notes" && <NotesTab />}
      {tab === "syllabi" && <SyllabiTab />}
      {tab === "reports" && <ReportsTab />}
      {tab === "comments" && <CommentsTab />}
      {tab === "subjects" && <SubjectsTab />}
    </div>
  );
}
