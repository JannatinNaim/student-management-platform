"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

function ResetPasswordForm() {
  const t = useT();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error(t("auth.reset.passwordsMismatch"));
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      toast.success(t("auth.reset.updated"));
      router.push("/login");
    } catch (error) {
      toast.error(apiErrorMessage(error, t, "auth.err.resetFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title={t("auth.reset.invalidTitle")} subtitle={t("auth.reset.invalidSubtitle")}>
        <p className="text-center text-sm text-slate-500">
          {t("auth.reset.requestNewPrefix")}{" "}
          <Link href="/forgot-password" className="font-semibold text-primary-600 dark:text-primary-400">
            {t("auth.reset.forgotPasswordPage")}
          </Link>
          .
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("auth.reset.title")} subtitle={t("auth.reset.subtitle")}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="label">{t("auth.reset.newPasswordLabel")}</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="confirm" className="label">{t("auth.reset.confirmLabel")}</label>
          <input
            id="confirm"
            type="password"
            required
            autoComplete="new-password"
            className="input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          {t("auth.reset.submit")}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
