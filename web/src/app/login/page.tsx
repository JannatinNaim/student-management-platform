"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { apiErrorMessage } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

function LoginForm() {
  const t = useT();
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(identifier, password);
      toast.success(t("auth.login.welcomeBack"));
      router.push(searchParams.get("next") ?? "/dashboard");
    } catch (error) {
      toast.error(apiErrorMessage(error, t, "auth.err.signInFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t("auth.login.title")}
      subtitle={t("auth.login.subtitle")}
      footer={
        <>
          {t("auth.login.footerPrompt")}{" "}
          <Link href="/register" className="font-semibold text-primary-600 dark:text-primary-400">
            {t("auth.login.createAccount")}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="identifier" className="label">{t("auth.login.identifierLabel")}</label>
          <input
            id="identifier"
            type="text"
            required
            autoComplete="username"
            className="input"
            placeholder={t("auth.login.identifierPlaceholder")}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label">{t("auth.login.passwordLabel")}</label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
            >
              {t("auth.login.forgotPassword")}
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          {t("auth.login.submit")}
        </Button>
      </form>
      <GoogleButton />
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
