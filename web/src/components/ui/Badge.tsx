import { cn } from "@/lib/utils";

const tones = {
  primary: "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
  secondary: "bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300",
  accent: "bg-accent-100 text-accent-700 dark:bg-accent-700/20 dark:text-accent-300",
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  danger: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
