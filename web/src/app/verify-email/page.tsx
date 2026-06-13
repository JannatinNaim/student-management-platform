"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";

function VerifyEmail() {
  const t = useT();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { isAuthenticated, refreshUser } = useAuth();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("");
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) {
      if (!token) {
        setStatus("error");
        setMessage(t("auth.verify.missingToken"));
      }
      return;
    }
    attempted.current = true;
    api
      .post("/auth/verify-email", { token })
      .then(async () => {
        setStatus("success");
        if (isAuthenticated) await refreshUser().catch(() => undefined);
      })
      .catch((error) => {
        setStatus("error");
        setMessage(apiErrorMessage(error, t, "auth.err.verificationFailed"));
      });
  }, [token, isAuthenticated, refreshUser, t]);

  return (
    <AuthShell title={t("auth.verify.title")} subtitle={t("auth.verify.subtitle")}>
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        {status === "pending" && <Loader2 className="h-10 w-10 animate-spin text-primary-500" />}
        {status === "success" && (
          <>
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t("auth.verify.success")}
            </p>
            <Link href="/upload">
              <Button>{t("auth.verify.uploadFirstNote")}</Button>
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-rose-500" />
            <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
            <Link href="/dashboard">
              <Button variant="outline">{t("auth.verify.goToDashboard")}</Button>
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
