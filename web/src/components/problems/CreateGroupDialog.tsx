"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import type { ProblemGroup } from "@/lib/types";
import { useT, tContent } from "@/lib/i18n";
import { useSubjects } from "@/components/landing/SubjectsGrid";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

export function CreateGroupDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useT();
  const { data: subjects } = useSubjects();
  const [form, setForm] = useState({ name: "", description: "", subjectId: "", tags: "" });

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ data: ProblemGroup }>("/groups", form);
      return data.data;
    },
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success(t("groups.toast.created"));
      router.push(`/groups/${group.slug}`);
    },
    onError: (err) => toast.error(apiErrorMessage(err, t, "groups.err.createFailed")),
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">{t("groups.create.title")}</h2>
            <button
              onClick={onClose}
              aria-label={t("common.close")}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium">{t("groups.create.nameLabel")}</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={t("groups.create.namePlaceholder")}
                className="input"
                required
                minLength={3}
                maxLength={80}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t("groups.create.descriptionLabel")}</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder={t("groups.create.descriptionPlaceholder")}
                className="input min-h-[90px] resize-none"
                required
                minLength={10}
                maxLength={2000}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">{t("groups.create.subjectLabel")}</label>
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
                  className="input"
                >
                  <option value="">{t("groups.create.noSubject")}</option>
                  {(subjects ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {tContent(t, "subject." + s.slug + ".name", s.name)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{t("groups.create.tagsLabel")}</label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder={t("groups.create.tagsPlaceholder")}
                  className="input"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" loading={mutation.isPending}>
                {t("groups.create.submit")}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
