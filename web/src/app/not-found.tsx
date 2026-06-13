"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/i18n";

export default function NotFound() {
  const t = useT();
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-7xl font-extrabold gradient-text">404</p>
      <h1 className="text-xl font-bold">{t("notFound.title")}</h1>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {t("notFound.description")}
      </p>
      <Link href="/">
        <Button>{t("notFound.backHome")}</Button>
      </Link>
    </div>
  );
}
