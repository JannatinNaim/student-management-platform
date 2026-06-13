"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import type { Problem } from "@/lib/types";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

export function CreateProblemDialog({
  groupId,
  onClose,
}: {
  groupId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useT();
  const [form, setForm] = useState({ title: "", body: "", tags: "" });

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ data: Problem }>("/problems", { ...form, groupId });
      return data.data;
    },
    onSuccess: (problem) => {
      queryClient.invalidateQueries({ queryKey: ["group-problems", groupId] });
      toast.success(t("problems.toast.problemPosted"));
      router.push(`/problems/${problem.id}`);
    },
    onError: (err) => toast.error(apiErrorMessage(err, t, "problems.err.postFailed")),
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
            <h2 className="text-lg font-bold">{t("problems.create.title")}</h2>
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
              <label className="mb-1 block text-sm font-medium">{t("problems.create.titleLabel")}</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder={t("problems.create.titlePlaceholder")}
                className="input"
                required
                minLength={6}
                maxLength={160}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t("problems.create.detailsLabel")}</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder={t("problems.create.detailsPlaceholder")}
                className="input min-h-[120px] resize-none"
                required
                minLength={10}
                maxLength={5000}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t("problems.create.tagsLabel")}</label>
              <input
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder={t("problems.create.tagsPlaceholder")}
                className="input"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" loading={mutation.isPending}>
                {t("problems.create.submit")}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
