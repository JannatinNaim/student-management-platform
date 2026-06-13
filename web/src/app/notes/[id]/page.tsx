"use client";

/* eslint-disable @next/next/no-img-element */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Bookmark,
  Calendar,
  Download,
  Eye,
  FileText,
  Flag,
  Heart,
  Link2,
  ListPlus,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api, API_URL, apiErrorMessage, fileUrl } from "@/lib/api";
import type { NoteCard as NoteCardType, NoteDetail } from "@/lib/types";
import { cn, copyToClipboard, formatBytes, formatNumber } from "@/lib/utils";
import { useT, useFormat, tContent } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Comments } from "@/components/notes/Comments";
import { NoteCard } from "@/components/notes/NoteCard";
import { RelatedProblems } from "@/components/problems/RelatedProblems";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StarRating } from "@/components/ui/StarRating";
import { toast } from "@/components/ui/Toast";

const noteTypeLabelKeys = {
  PDF: "notes.type.pdf",
  IMAGE: "notes.type.image",
  HANDWRITTEN: "notes.type.handwritten",
  DOCUMENT: "notes.type.document",
} as const;

const REPORT_REASONS = [
  { value: "Inappropriate content", labelKey: "notes.report.reason.inappropriate" },
  { value: "Copyright violation", labelKey: "notes.report.reason.copyright" },
  { value: "Spam or misleading", labelKey: "notes.report.reason.spam" },
  { value: "Poor quality", labelKey: "notes.report.reason.poorQuality" },
  { value: "Other", labelKey: "notes.report.reason.other" },
] as const;

function ReportDialog({ noteId, onClose }: { noteId: string; onClose: () => void }) {
  const t = useT();
  const [reason, setReason] = useState("Inappropriate content");
  const [details, setDetails] = useState("");
  const mutation = useMutation({
    mutationFn: () => api.post(`/notes/${noteId}/report`, { reason, details: details || undefined }),
    onSuccess: () => {
      toast.success(t("notes.toast.reportSubmitted"));
      onClose();
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold">{t("notes.report.title")}</h3>
        <div className="mt-4 space-y-3">
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="input">
            {REPORT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>{t(r.labelKey)}</option>
            ))}
          </select>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={t("notes.report.detailsPlaceholder")}
            rows={3}
            className="input resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>{t("common.cancel")}</Button>
            <Button variant="danger" loading={mutation.isPending} onClick={() => mutation.mutate()}>
              {t("notes.report.submit")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const t = useT();
  const { formatDate } = useFormat();
  const [reportOpen, setReportOpen] = useState(false);

  const { data: note, isLoading } = useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      const { data } = await api.get<{ data: NoteDetail }>(`/notes/${id}`);
      return data.data;
    },
  });

  const { data: related } = useQuery({
    queryKey: ["related", id],
    queryFn: async () => {
      const { data } = await api.get<{ data: NoteCardType[] }>(`/notes/${id}/related`);
      return data.data;
    },
    enabled: !!note,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["note", id] });
  const requireLogin = () => {
    toast.info(t("notes.toast.signInToDo"));
    router.push(`/login?next=/notes/${id}`);
  };

  const likeMutation = useMutation({
    mutationFn: () => api.post(`/notes/${id}/like`),
    onSuccess: invalidate,
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => api.post(`/notes/${id}/bookmark`),
    onSuccess: (response) => {
      invalidate();
      toast.success(
        response.data.data.bookmarked
          ? t("notes.toast.savedBookmark")
          : t("notes.toast.removedBookmark")
      );
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  const rateMutation = useMutation({
    mutationFn: (value: number) => api.put(`/notes/${id}/rating`, { value }),
    onSuccess: () => {
      invalidate();
      toast.success(t("notes.toast.ratingSaved"));
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/notes/${id}/download`);
    },
    onSuccess: () => {
      invalidate();
      // Hit the dedicated endpoint that responds with Content-Disposition:
      // attachment, so the browser saves the file instead of opening it.
      const link = document.createElement("a");
      link.href = `${API_URL}/api/notes/${id}/file`;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  const addTodoMutation = useMutation({
    mutationFn: () =>
      api.post("/study/todos", {
        title: t("notes.todoTitle", { title: note?.title ?? t("notes.todoFallback") }),
        category: "NOTE",
        noteId: id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success(t("notes.toast.addedTodo"));
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  const share = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: note?.title, url: shareUrl }).catch(() => undefined);
    } else {
      await copyToClipboard(shareUrl);
      toast.success(t("notes.toast.linkCopiedClipboard"));
    }
  };

  if (isLoading || !note) {
    return (
      <div className="container-page grid gap-8 py-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const isPdf = note.fileType === "application/pdf";
  const preview = fileUrl(isPdf ? note.thumbnailUrl : note.thumbnailUrl ?? note.fileUrl);

  return (
    <div className="container-page py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Preview */}
          <div className="card flex min-h-64 items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-slate-800 dark:via-slate-800/70 dark:to-slate-900">
            {preview ? (
              <img src={preview} alt={note.title} className="max-h-[480px] w-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                <FileText className="h-16 w-16" />
                <span className="text-sm font-medium">
                  {isPdf ? t("notes.pdfDocument") : t("notes.noteLabel")} · {formatBytes(note.fileSize)}
                </span>
              </div>
            )}
          </div>

          {/* Title + meta */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {note.isOfficial && (
                <Badge tone="success">
                  <BadgeCheck className="h-3.5 w-3.5" /> {t("notes.official")}
                </Badge>
              )}
              <Badge tone="primary">{note.subject.icon} {tContent(t, "subject." + note.subject.slug + ".name", note.subject.name)}</Badge>
              <Badge tone="accent">{t(noteTypeLabelKeys[note.type])}</Badge>
              <Badge tone="neutral">{note.chapter}</Badge>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{note.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> {formatDate(note.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" /> {t("notes.viewsLabel", { count: formatNumber(note.views) })}
              </span>
              <span className="flex items-center gap-1.5">
                <Download className="h-4 w-4" /> {t("notes.downloadsLabel", { count: formatNumber(note.downloadsCount) })}
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="h-4 w-4" /> {t("notes.likesLabel", { count: formatNumber(note.likesCount) })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button size="lg" className="gap-2" loading={downloadMutation.isPending} onClick={() => downloadMutation.mutate()}>
              <Download className="h-5 w-5" /> {t("notes.download")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={cn("gap-2", note.viewer?.liked && "border-rose-300 text-rose-600 dark:border-rose-800 dark:text-rose-400")}
              onClick={() => (isAuthenticated ? likeMutation.mutate() : requireLogin())}
            >
              <Heart className={cn("h-5 w-5", note.viewer?.liked && "fill-rose-500 text-rose-500")} />
              {note.viewer?.liked ? t("notes.liked") : t("notes.like")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={cn("gap-2", note.viewer?.bookmarked && "border-primary-300 text-primary-600 dark:border-primary-800 dark:text-primary-400")}
              onClick={() => (isAuthenticated ? bookmarkMutation.mutate() : requireLogin())}
            >
              <Bookmark className={cn("h-5 w-5", note.viewer?.bookmarked && "fill-primary-500 text-primary-500")} />
              {note.viewer?.bookmarked ? t("notes.saved") : t("notes.bookmark")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              loading={addTodoMutation.isPending}
              onClick={() => (isAuthenticated ? addTodoMutation.mutate() : requireLogin())}
            >
              <ListPlus className="h-5 w-5" /> {t("notes.addToTodos")}
            </Button>
            <Button variant="outline" size="lg" className="gap-2" onClick={share}>
              <Share2 className="h-5 w-5" /> {t("common.share")}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="gap-2 text-slate-400 hover:text-rose-500"
              onClick={() => (isAuthenticated ? setReportOpen(true) : requireLogin())}
            >
              <Flag className="h-5 w-5" /> {t("common.report")}
            </Button>
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="text-lg font-bold">{t("notes.about")}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {note.description}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-sm dark:border-slate-800 sm:grid-cols-3">
              {[
                [t("notes.meta.chapter"), note.chapter],
                [t("notes.meta.class"), note.className],
                [t("notes.meta.board"), note.board],
                [t("notes.meta.institution"), note.college],
                [t("notes.meta.teacher"), note.teacherName],
                [t("notes.meta.fileSize"), formatBytes(note.fileSize)],
              ]
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label as string}>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
                    <dd className="mt-0.5 font-medium">{value}</dd>
                  </div>
                ))}
            </dl>
            {note.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <Link key={tag} href={`/notes?q=${encodeURIComponent(tag)}`}>
                    <Badge tone="neutral" className="hover:bg-primary-100 hover:text-primary-700">#{tag}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Comments noteId={note.id} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{t("notes.author")}</h2>
            <Link href={`/profile/${note.author.username}`} className="mt-3 flex items-center gap-3">
              <Avatar src={note.author.avatarUrl} name={note.author.name} size="md" />
              <div>
                <p className="font-semibold hover:text-primary-600">{note.author.name}</p>
                <p className="text-xs text-slate-400">@{note.author.username} · {t("notes.level", { level: note.author.level })}</p>
              </div>
            </Link>
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{t("notes.rating")}</h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-4xl font-extrabold">{note.avgRating.toFixed(1)}</span>
              <div>
                <StarRating value={note.avgRating} readOnly size="md" />
                <p className="mt-0.5 text-xs text-slate-400">{t("notes.ratingsCount", { count: note.ratingsCount })}</p>
              </div>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                {note.viewer?.rating ? t("notes.yourRating") : t("notes.rateThese")}
              </p>
              <StarRating
                value={note.viewer?.rating ?? 0}
                size="lg"
                onChange={(value) => (isAuthenticated ? rateMutation.mutate(value) : requireLogin())}
              />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              <Link2 className="h-4 w-4" /> {t("notes.shareThisNote")}
            </h2>
            <button
              onClick={async () => {
                await copyToClipboard(window.location.href);
                toast.success(t("notes.toast.linkCopied"));
              }}
              className="input mt-3 truncate text-left text-xs text-slate-400 hover:border-primary-400"
            >
              {typeof window !== "undefined" ? window.location.href : ""}
            </button>
          </div>
        </aside>
      </div>

      {/* Related */}
      {!!related?.length && (
        <section className="mt-14">
          <h2 className="mb-6 text-xl font-bold">{t("notes.relatedNotes")}</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.slice(0, 3).map((relatedNote, index) => (
              <NoteCard key={relatedNote.id} note={relatedNote} index={index} />
            ))}
          </div>
        </section>
      )}

      <RelatedProblems subject={note.subject.slug} tag={note.tags[0]} title={t("notes.discussThisTopic")} />

      {reportOpen && <ReportDialog noteId={note.id} onClose={() => setReportOpen(false)} />}
    </div>
  );
}
