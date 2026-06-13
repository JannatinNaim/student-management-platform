"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiErrorMessage } from "@/lib/api";
import { useT, useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

const passwordRules = [
  { key: "auth.register.rule.minLength", test: (p: string) => p.length >= 8 },
  { key: "auth.register.rule.uppercase", test: (p: string) => /[A-Z]/.test(p) },
  { key: "auth.register.rule.lowercase", test: (p: string) => /[a-z]/.test(p) },
  { key: "auth.register.rule.number", test: (p: string) => /[0-9]/.test(p) },
] as const;

export default function RegisterPage() {
  const t = useT();
  const { locale } = useLanguage();
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const passwordValid = passwordRules.every((rule) => rule.test(form.password));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) {
      toast.error(t("auth.register.meetRequirements"));
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, locale };
      await register(payload);
      toast.success(t("auth.register.accountCreated"));
      router.push("/dashboard");
    } catch (error) {
      toast.error(apiErrorMessage(error, t, "auth.err.registrationFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t("auth.register.title")}
      subtitle={t("auth.register.subtitle")}
      footer={
        <>
          {t("auth.register.footerPrompt")}{" "}
          <Link href="/login" className="font-semibold text-primary-600 dark:text-primary-400">
            {t("common.signIn")}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="label">{t("auth.register.nameLabel")}</label>
            <input id="name" required minLength={2} className="input" placeholder={t("auth.register.namePlaceholder")} value={form.name} onChange={set("name")} />
          </div>
          <div>
            <label htmlFor="username" className="label">{t("auth.register.usernameLabel")}</label>
            <input
              id="username"
              required
              minLength={3}
              pattern="[A-Za-z0-9_]+"
              title={t("auth.register.usernameTitle")}
              className="input"
              placeholder={t("auth.register.usernamePlaceholder")}
              value={form.username}
              onChange={set("username")}
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="label">{t("auth.register.emailLabel")}</label>
          <input id="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com" value={form.email} onChange={set("email")} />
        </div>
        <div>
          <label htmlFor="password" className="label">{t("auth.register.passwordLabel")}</label>
          <input id="password" type="password" required autoComplete="new-password" className="input" placeholder="••••••••" value={form.password} onChange={set("password")} />
          {form.password && (
            <ul className="mt-2 grid grid-cols-2 gap-1">
              {passwordRules.map((rule) => {
                const passed = rule.test(form.password);
                return (
                  <li
                    key={rule.key}
                    className={cn(
                      "flex items-center gap-1 text-[11px]",
                      passed ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                    )}
                  >
                    {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {t(rule.key)}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          {t("auth.register.submit")}
        </Button>
      </form>
      <GoogleButton />
    </AuthShell>
  );
}
