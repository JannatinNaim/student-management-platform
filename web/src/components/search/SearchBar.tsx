"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, MessagesSquare, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const HISTORY_KEY = "sn-search-history";

function getHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function pushHistory(query: string) {
  const next = [query, ...getHistory().filter((h) => h !== query)].slice(0, 6);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

interface Suggestion {
  id: string;
  title: string;
  subject: { name: string };
}

interface ProblemSuggestion {
  id: string;
  title: string;
  status: "OPEN" | "SOLVED";
  group: { name: string };
}

export function SearchBar({ large = false, className }: { large?: boolean; className?: string }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useT();

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const { data: suggestions } = useQuery({
    queryKey: ["suggestions", debounced],
    queryFn: async () => {
      const { data } = await api.get<{ data: Suggestion[] }>("/notes/suggestions", {
        params: { q: debounced },
      });
      return data.data;
    },
    enabled: debounced.length >= 2,
  });

  const { data: problemSuggestions } = useQuery({
    queryKey: ["problem-suggestions", debounced],
    queryFn: async () => {
      const { data } = await api.get<{ data: ProblemSuggestion[] }>("/problems/suggestions", {
        params: { q: debounced },
      });
      return data.data;
    },
    enabled: debounced.length >= 2,
  });

  const submit = (value: string) => {
    const q = value.trim();
    if (!q) return;
    pushHistory(q);
    setOpen(false);
    router.push(`/notes?q=${encodeURIComponent(q)}`);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400",
            large ? "h-5 w-5" : "h-4 w-4"
          )}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setHistory(getHistory());
            setOpen(true);
          }}
          onKeyDown={(e) => e.key === "Enter" && submit(query)}
          placeholder={t("search.placeholder")}
          aria-label={t("search.ariaSearchNotes")}
          className={cn(
            "input",
            large ? "h-14 rounded-2xl pl-12 pr-12 text-base shadow-card" : "h-10 pl-10 pr-9"
          )}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label={t("search.ariaClear")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (query.length >= 2 || history.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-40 mt-2 w-full min-w-[18rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
          >
            {query.length >= 2 ? (
              <ul>
                {(suggestions ?? []).map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => {
                        pushHistory(s.title);
                        setOpen(false);
                        router.push(`/notes/${s.id}`);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Search className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">{s.title}</span>
                      <span className="ml-auto shrink-0 text-xs text-slate-400">
                        {s.subject.name}
                      </span>
                    </button>
                  </li>
                ))}
                {!!problemSuggestions?.length && (
                  <>
                    <li className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {t("search.discussions")}
                    </li>
                    {problemSuggestions.map((p) => (
                      <li key={p.id}>
                        <button
                          onClick={() => {
                            pushHistory(p.title);
                            setOpen(false);
                            router.push(`/problems/${p.id}`);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <MessagesSquare className="h-4 w-4 shrink-0 text-slate-400" />
                          <span className="truncate">{p.title}</span>
                          <span className="ml-auto shrink-0 text-xs text-slate-400">{p.group.name}</span>
                        </button>
                      </li>
                    ))}
                  </>
                )}
                <li>
                  <button
                    onClick={() => submit(query)}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-slate-800"
                  >
                    {t("search.searchAllFor", { query })}
                  </button>
                </li>
              </ul>
            ) : (
              <ul>
                <li className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t("search.recentSearches")}
                </li>
                {history.map((h) => (
                  <li key={h}>
                    <button
                      onClick={() => submit(h)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">{h}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
