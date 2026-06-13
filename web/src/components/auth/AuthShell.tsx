"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useT } from "@/lib/i18n";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const t = useT();
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-primary-400/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-secondary-400/15 blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="card w-full max-w-md p-8"
      >
        <div className="mb-7 text-center">
          <Link href="/" aria-label={t("auth.shell.homeAriaLabel")} className="inline-flex items-center gap-2 font-bold">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
              <BookOpen className="h-5 w-5" />
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        {children}
        {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
      </motion.div>
    </div>
  );
}
