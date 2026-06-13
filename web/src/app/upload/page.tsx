"use client";

import { useMutation } from "@tanstack/react-query";
import { CloudUpload, FileCheck2, ImagePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import { cn, formatBytes } from "@/lib/utils";
import { useT, tContent } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useSubjects } from "@/components/landing/SubjectsGrid";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

const MAX_SIZE_MB = 15;

const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;
const PDF_EXT = /\.pdf$/i;
const DOC_EXT = /\.(docx?|pptx?|xlsx?|odt|odp|ods|epub|txt|md|markdown|csv|rtf)$/i;
const ACCEPTED_EXT =
  /\.(pdf|png|jpe?g|webp|gif|docx?|pptx?|xlsx?|odt|odp|ods|epub|txt|md|markdown|csv|rtf)$/i;
const ACCEPT_ATTR =
  ".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.odt,.odp,.ods,.epub,.txt,.md,.markdown,.csv,.rtf";

export default function UploadPage() {
  const t = useT();
  const { isAuthenticated, user, hydrated } = useAuth();
  const router = useRouter();
  const { data: subjects } = useSubjects();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isOfficial, setIsOfficial] = useState(false);
  const isAdmin = user?.role === "ADMIN";
  const [form, setForm] = useState({
    title: "",
    description: "",
    subjectId: "",
    chapter: "",
    tags: "",
    type: "PDF",
    className: "",
    board: "",
    college: "",
    teacherName: "",
  });

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.push("/login?next=/upload");
  }, [hydrated, isAuthenticated, router]);

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const acceptFile = (selected: File | undefined) => {
    if (!selected) return;
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(t("upload.toast.tooLarge", { max: MAX_SIZE_MB }));
      return;
    }
    if (!ACCEPTED_EXT.test(selected.name)) {
      toast.error(t("upload.toast.unsupported"));
      return;
    }
    setFile(selected);
    setForm((f) => {
      let type = f.type;
      if (PDF_EXT.test(selected.name)) type = "PDF";
      else if (IMAGE_EXT.test(selected.name)) type = f.type === "HANDWRITTEN" ? "HANDWRITTEN" : "IMAGE";
      else if (DOC_EXT.test(selected.name)) type = "DOCUMENT";
      return {
        ...f,
        type,
        title: f.title || selected.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      };
    });
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const body = new FormData();
      body.append("file", file!);
      if (thumbnail) body.append("thumbnail", thumbnail);
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      if (isAdmin) body.append("isOfficial", String(isOfficial));
      const { data } = await api.post("/notes", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data;
    },
    onSuccess: (note) => {
      toast.success(t("upload.toast.published"));
      router.push(`/notes/${note.id}`);
    },
    onError: (error) => toast.error(apiErrorMessage(error, t, "upload.err.failed")),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error(t("upload.toast.chooseFile"));
      return;
    }
    if (!form.subjectId) {
      toast.error(t("upload.toast.pickSubject"));
      return;
    }
    mutation.mutate();
  };

  if (!hydrated || !isAuthenticated) return null;

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("upload.title")}</h1>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        {t("upload.subtitle")}
      </p>

      {!user?.emailVerified && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {t("upload.emailUnverified")}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            acceptFile(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition",
            dragging
              ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30"
              : "border-slate-300 hover:border-primary-400 dark:border-slate-700"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTR}
            className="hidden"
            onChange={(e) => acceptFile(e.target.files?.[0])}
          />
          {file ? (
            <>
              <FileCheck2 className="h-10 w-10 text-emerald-500" />
              <div>
                <p className="font-semibold">{file.name}</p>
                <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="flex items-center gap-1 text-xs text-rose-500 hover:underline"
              >
                <X className="h-3 w-3" /> {t("common.remove")}
              </button>
            </>
          ) : (
            <>
              <CloudUpload className="h-10 w-10 text-primary-400" />
              <div>
                <p className="font-semibold">{t("upload.dropTitle")}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {t("upload.dropHint", { max: MAX_SIZE_MB })}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="card space-y-5 p-6">
          <div>
            <label htmlFor="title" className="label">{t("upload.fieldTitle")} *</label>
            <input id="title" required minLength={4} maxLength={120} className="input" placeholder={t("upload.titlePlaceholder")} value={form.title} onChange={set("title")} />
          </div>
          <div>
            <label htmlFor="description" className="label">{t("upload.fieldDescription")} *</label>
            <textarea id="description" required minLength={10} maxLength={3000} rows={4} className="input resize-none" placeholder={t("upload.descriptionPlaceholder")} value={form.description} onChange={set("description")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="subject" className="label">{t("upload.fieldSubject")} *</label>
              <select id="subject" required className="input" value={form.subjectId} onChange={set("subjectId")}>
                <option value="">{t("upload.selectSubject")}</option>
                {(subjects ?? []).map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.icon} {tContent(t, "subject." + subject.slug + ".name", subject.name)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="chapter" className="label">{t("upload.fieldChapter")} *</label>
              <input id="chapter" required maxLength={120} className="input" placeholder={t("upload.chapterPlaceholder")} value={form.chapter} onChange={set("chapter")} />
            </div>
            <div>
              <label htmlFor="type" className="label">{t("upload.fieldType")} *</label>
              <select id="type" required className="input" value={form.type} onChange={set("type")}>
                <option value="PDF">{t("upload.type.pdf")}</option>
                <option value="IMAGE">{t("upload.type.image")}</option>
                <option value="HANDWRITTEN">{t("upload.type.handwritten")}</option>
                <option value="DOCUMENT">{t("upload.type.document")}</option>
              </select>
            </div>
            <div>
              <label htmlFor="tags" className="label">{t("upload.fieldTags")}</label>
              <input id="tags" className="input" placeholder={t("upload.tagsPlaceholder")} value={form.tags} onChange={set("tags")} />
            </div>
          </div>

          <details className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <summary className="cursor-pointer text-sm font-semibold text-slate-600 dark:text-slate-300">
              {t("upload.optionalDetails")}
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="className" className="label">{t("upload.fieldClass")}</label>
                <input id="className" className="input" placeholder={t("upload.classPlaceholder")} value={form.className} onChange={set("className")} />
              </div>
              <div>
                <label htmlFor="board" className="label">{t("upload.fieldBoard")}</label>
                <input id="board" className="input" placeholder={t("upload.boardPlaceholder")} value={form.board} onChange={set("board")} />
              </div>
              <div>
                <label htmlFor="college" className="label">{t("upload.fieldCollege")}</label>
                <input id="college" className="input" placeholder={t("upload.collegePlaceholder")} value={form.college} onChange={set("college")} />
              </div>
              <div>
                <label htmlFor="teacherName" className="label">{t("upload.fieldTeacher")}</label>
                <input id="teacherName" className="input" placeholder={t("upload.teacherPlaceholder")} value={form.teacherName} onChange={set("teacherName")} />
              </div>
            </div>
          </details>

          {isAdmin && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-emerald-600"
                checked={isOfficial}
                onChange={(e) => setIsOfficial(e.target.checked)}
              />
              <span className="text-sm">
                <span className="font-semibold text-emerald-800 dark:text-emerald-200">
                  {t("upload.officialLabel")}
                </span>
                <span className="mt-0.5 block text-xs text-emerald-700/80 dark:text-emerald-300/80">
                  {t("upload.officialHint")}
                </span>
              </span>
            </label>
          )}

          <div>
            <label className="label">{t("upload.thumbnail")}</label>
            <input
              ref={thumbInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => thumbInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-600 transition hover:border-primary-400 dark:border-slate-700 dark:text-slate-300"
            >
              <ImagePlus className="h-4 w-4" />
              {thumbnail ? thumbnail.name : t("upload.chooseCover")}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={mutation.isPending}
          disabled={!user?.emailVerified}
        >
          {t("upload.publish")}
        </Button>
      </form>
    </div>
  );
}
