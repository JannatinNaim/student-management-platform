"use client";

import { useMutation } from "@tanstack/react-query";
import { ClipboardList, FileCheck2, FileUp, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import { formatBytes } from "@/lib/utils";
import { useT, tContent } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useSubjects } from "@/components/landing/SubjectsGrid";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

const MAX_SIZE_MB = 15;

export default function NewSyllabusPage() {
  const t = useT();
  const { isAuthenticated, isAdmin, hydrated } = useAuth();
  const router = useRouter();
  const { data: subjects } = useSubjects();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subjectId: "",
    className: "",
    board: "",
    topics: "",
  });

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.push("/login?next=/syllabus/new");
    else if (hydrated && isAuthenticated && !isAdmin) router.push("/syllabus");
  }, [hydrated, isAuthenticated, isAdmin, router]);

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const acceptFile = (selected: File | undefined) => {
    if (!selected) return;
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(t("syllabus.toast.fileTooLarge", { max: MAX_SIZE_MB }));
      return;
    }
    if (
      !/\.(pdf|png|jpe?g|webp|gif|docx?|pptx?|xlsx?|odt|odp|ods|epub|txt|md|markdown|csv|rtf)$/i.test(
        selected.name
      )
    ) {
      toast.error(t("syllabus.toast.unsupportedFile"));
      return;
    }
    setFile(selected);
  };

  const topicCount = form.topics.split(/[\r\n]+/).map((t) => t.trim()).filter(Boolean).length;

  const mutation = useMutation({
    mutationFn: async () => {
      const body = new FormData();
      if (file) body.append("file", file);
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      const { data } = await api.post("/syllabus", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data as { id: string };
    },
    onSuccess: (syllabus) => {
      toast.success(t("syllabus.toast.published"));
      router.push(`/syllabus/${syllabus.id}`);
    },
    onError: (error) => toast.error(apiErrorMessage(error, t, "syllabus.err.publishFailed")),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId) {
      toast.error(t("syllabus.toast.pickSubject"));
      return;
    }
    if (topicCount === 0) {
      toast.error(t("syllabus.toast.addTopic"));
      return;
    }
    mutation.mutate();
  };

  if (!hydrated || !isAuthenticated || !isAdmin) return null;

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
        <ClipboardList className="h-7 w-7 text-primary-500" /> {t("syllabus.new.title")}
      </h1>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        {t("syllabus.new.subtitle")}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div className="card space-y-5 p-6">
          <div>
            <label htmlFor="title" className="label">{t("syllabus.new.titleLabel")}</label>
            <input
              id="title"
              required
              minLength={4}
              maxLength={160}
              className="input"
              placeholder={t("syllabus.new.titlePlaceholder")}
              value={form.title}
              onChange={set("title")}
            />
          </div>
          <div>
            <label htmlFor="description" className="label">{t("syllabus.new.descriptionLabel")}</label>
            <textarea
              id="description"
              required
              minLength={10}
              maxLength={3000}
              rows={3}
              className="input resize-none"
              placeholder={t("syllabus.new.descriptionPlaceholder")}
              value={form.description}
              onChange={set("description")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="subject" className="label">{t("syllabus.new.subjectLabel")}</label>
              <select id="subject" required className="input" value={form.subjectId} onChange={set("subjectId")}>
                <option value="">{t("syllabus.new.subjectPlaceholder")}</option>
                {(subjects ?? []).map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.icon} {tContent(t, "subject." + subject.slug + ".name", subject.name)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="className" className="label">{t("syllabus.new.classLabel")}</label>
              <input id="className" maxLength={60} className="input" placeholder={t("syllabus.new.classPlaceholder")} value={form.className} onChange={set("className")} />
            </div>
            <div>
              <label htmlFor="board" className="label">{t("syllabus.new.boardLabel")}</label>
              <input id="board" maxLength={60} className="input" placeholder={t("syllabus.new.boardPlaceholder")} value={form.board} onChange={set("board")} />
            </div>
          </div>

          <div>
            <label htmlFor="topics" className="label">
              {t("syllabus.new.topicsLabel")} <span className="font-normal text-slate-400">{t("syllabus.new.topicsHint", { count: topicCount })}</span>
            </label>
            <textarea
              id="topics"
              required
              rows={8}
              className="input resize-y font-mono text-sm"
              placeholder={"Physical World and Measurement\nVectors\nNewtonian Mechanics\nWork, Energy and Power"}
              value={form.topics}
              onChange={set("topics")}
            />
          </div>

          <div>
            <label className="label">{t("syllabus.new.sourceLabel")}</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.odt,.odp,.ods,.epub,.txt,.md,.markdown,.csv,.rtf"
              className="hidden"
              onChange={(e) => acceptFile(e.target.files?.[0])}
            />
            {file ? (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                <FileCheck2 className="h-5 w-5 text-emerald-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-slate-300 hover:text-rose-500"
                  aria-label={t("syllabus.new.removeFile")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-600 transition hover:border-primary-400 dark:border-slate-700 dark:text-slate-300"
              >
                <FileUp className="h-4 w-4" /> {t("syllabus.new.attachFile")}
              </button>
            )}
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
          {t("syllabus.new.publish")}
        </Button>
      </form>
    </div>
  );
}
