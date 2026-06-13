"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BookMarked,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessagesSquare,
  Settings,
  ShieldCheck,
  Timer,
  Trophy,
  Upload,
  User as UserIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/search/SearchBar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useT, type TranslationKey } from "@/lib/i18n";

const navLinks: Array<{ href: string; labelKey: TranslationKey; icon: typeof BookOpen }> = [
  { href: "/notes", labelKey: "nav.browseNotes", icon: BookOpen },
  { href: "/groups", labelKey: "nav.groups", icon: MessagesSquare },
  { href: "/subjects", labelKey: "nav.subjects", icon: GraduationCap },
  { href: "/syllabus", labelKey: "nav.syllabus", icon: ClipboardList },
  { href: "/leaderboard", labelKey: "nav.leaderboard", icon: Trophy },
  { href: "/study-tools", labelKey: "nav.studyTools", icon: Timer },
];

export function Navbar() {
  const { user, isAuthenticated, isAdmin, hydrated, logout } = useAuth();
  const t = useT();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const { data: unread } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: async () => {
      const { data } = await api.get("/notifications", { params: { limit: 1 } });
      return (data.meta?.unread ?? 0) as number;
    },
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-surface-dark/80">
      <nav className="mx-auto flex h-16 w-full max-w-screen-2xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-secondary-600 text-white shadow-sm">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="hidden text-lg sm:block">
            Smart<span className="gradient-text">Notes</span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 justify-center px-2 md:flex">
          <SearchBar className="min-w-[10rem] max-w-md" />
        </div>

        <div className="hidden items-center gap-0.5 xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "whitespace-nowrap rounded-xl px-2.5 py-2 text-sm font-medium transition",
                pathname.startsWith(link.href)
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <LanguageToggle />
          <ThemeToggle />

          {hydrated && isAuthenticated && user ? (
            <>
              <Link
                href="/notifications"
                aria-label={t("nav.notifications")}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Bell className="h-5 w-5" />
                {!!unread && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>

              <Link href="/upload" className="hidden sm:block">
                <Button size="sm" className="gap-1.5" aria-label={t("common.upload")}>
                  <Upload className="h-4 w-4" />
                  <span className="hidden 2xl:inline">{t("common.upload")}</span>
                </Button>
              </Link>

              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-label={t("nav.accountMenu")}
                  className="ml-1 rounded-full ring-2 ring-transparent transition hover:ring-primary-400"
                >
                  <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
                        <p className="truncate text-sm font-semibold">{user.name}</p>
                        <p className="truncate text-xs text-slate-400">@{user.username}</p>
                      </div>
                      {[
                        { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
                        { href: `/profile/${user.username}`, label: t("nav.myProfile"), icon: UserIcon },
                        { href: "/bookmarks", label: t("nav.bookmarks"), icon: BookMarked },
                        { href: "/settings", label: t("nav.settings"), icon: Settings },
                        ...(isAdmin
                          ? [{ href: "/admin", label: t("nav.adminPanel"), icon: ShieldCheck }]
                          : []),
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <item.icon className="h-4 w-4" /> {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      >
                        <LogOut className="h-4 w-4" /> {t("common.signOut")}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : hydrated ? (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {t("common.signIn")}
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button size="sm">{t("common.getStarted")}</Button>
              </Link>
            </div>
          ) : (
            <div className="h-9 w-20" />
          )}

          <button
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={t("nav.toggleMenu")}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 xl:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-200 dark:border-slate-800 xl:hidden"
          >
            <div className="container-page space-y-1 py-3">
              <div className="pb-2 md:hidden">
                <SearchBar />
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <link.icon className="h-4 w-4" /> {t(link.labelKey)}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <Link
                    href="/upload"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-slate-800"
                  >
                    <Upload className="h-4 w-4" /> {t("nav.uploadNotes")}
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Settings className="h-4 w-4" /> {t("nav.settings")}
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
