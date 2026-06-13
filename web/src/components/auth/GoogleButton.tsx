"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCallback, useRef } from "react";
import { apiErrorMessage } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/Toast";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (el: HTMLElement, options: object) => void;
        };
      };
    };
  }
}

export function GoogleButton() {
  const t = useT();
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);

  const init = useCallback(() => {
    if (!CLIENT_ID || !window.google || !buttonRef.current) return;
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async (response: { credential: string }) => {
        try {
          await loginWithGoogle(response.credential);
          toast.success(t("auth.login.welcomeBack"));
          router.push("/dashboard");
        } catch (error) {
          toast.error(apiErrorMessage(error, t, "auth.err.googleSignInFailed"));
        }
      },
    });
    // GSI requires an explicit pixel width (valid range 200–400). Match the
    // container so the button never overflows narrow phone viewports.
    const available = buttonRef.current.clientWidth || 340;
    const width = Math.max(200, Math.min(400, Math.floor(available)));
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width,
      shape: "pill",
    });
  }, [loginWithGoogle, router, t]);

  if (!CLIENT_ID) return null;

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" onLoad={init} strategy="afterInteractive" />
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs uppercase tracking-wide text-slate-400">{t("common.or")}</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>
      <div ref={buttonRef} className="flex justify-center" />
    </>
  );
}
