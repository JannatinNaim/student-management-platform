"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

const REPORT_REASONS = [
  { value: "Inappropriate content", labelKey: "problems.report.reason.inappropriate" },
  { value: "Spam or misleading", labelKey: "problems.report.reason.spam" },
  { value: "Harassment", labelKey: "problems.report.reason.harassment" },
  { value: "Off-topic", labelKey: "problems.report.reason.offTopic" },
  { value: "Other", labelKey: "problems.report.reason.other" },
] as const;

export function ReportProblemDialog({
  problemId,
  onClose,
}: {
  problemId: string;
  onClose: () => void;
}) {
  const t = useT();
  const [reason, setReason] = useState("Inappropriate content");
  const [details, setDetails] = useState("");
  const mutation = useMutation({
    mutationFn: () => api.post(`/problems/${problemId}/report`, { reason, details: details || undefined }),
    onSuccess: () => {
      toast.success(t("problems.toast.reportSubmitted"));
      onClose();
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold">{t("problems.report.title")}</h3>
        <div className="mt-4 space-y-3">
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="input">
            {REPORT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>{t(r.labelKey)}</option>
            ))}
          </select>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={t("problems.report.detailsPlaceholder")}
            rows={3}
            className="input resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>{t("common.cancel")}</Button>
            <Button variant="danger" loading={mutation.isPending} onClick={() => mutation.mutate()}>
              {t("problems.report.submit")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
