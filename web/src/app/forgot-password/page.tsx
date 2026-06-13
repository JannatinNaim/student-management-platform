"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

export default function ForgotPasswordPage() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (error) {
      toast.error(apiErrorMessage(error, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t("auth.forgot.title")}
      subtitle={t("auth.forgot.subtitle")}
      footer={
        <Link href="/login" className="font-semibold text-primary-600 dark:text-primary-400">
          {t("auth.forgot.backToSignIn")}
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <MailCheck className="h-10 w-10 text-emerald-500" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t("auth.forgot.sentMessage", { email })}
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">{t("auth.forgot.emailLabel")}</label>
            <input
              id="email"
              type="email"
              required
              className="input"
              placeholder={t("auth.forgot.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            {t("auth.forgot.submit")}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
