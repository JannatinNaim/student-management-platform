"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  Circle,
  Coffee,
  FileText,
  Flame,
  ListChecks,
  ListTodo,
  NotebookPen,
  Pause,
  Play,
  Plus,
  Puzzle,
  RotateCcw,
  StickyNote,
  Target,
  Timer,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import type { Exam, StudyGoal, Todo, TodoCategory, TodoPriority } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useFormat, useT, type TFunction, type TranslationKey } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

function daysLeft(date: string) {
  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000));
}

function ExamCountdown() {
  const queryClient = useQueryClient();
  const t = useT();
  const { formatDate } = useFormat();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const { data: exams } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => (await api.get("/study/exams")).data.data as Exam[],
  });

  const addMutation = useMutation({
    mutationFn: () => api.post("/study/exams", { title, date }),
    onSuccess: () => {
      setTitle("");
      setDate("");
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/study/exams/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });

  return (
    <div className="card p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <CalendarClock className="h-5 w-5 text-primary-500" /> {t("studyTools.exam.title")}
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (title && date) addMutation.mutate();
        }}
        className="mt-4 flex flex-wrap gap-2"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("studyTools.exam.titlePlaceholder")}
          className="input flex-1"
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)}
          className="input w-auto"
          required
          aria-label={t("studyTools.exam.dateLabel")}
        />
        <Button type="submit" loading={addMutation.isPending} aria-label={t("studyTools.exam.addExam")}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>
      <div className="mt-5 space-y-3">
        {exams?.length === 0 && (
          <p className="text-sm text-slate-400">{t("studyTools.exam.empty")}</p>
        )}
        {exams?.map((exam) => {
          const days = daysLeft(exam.date);
          return (
            <div
              key={exam.id}
              className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-primary-50 to-secondary-50 p-4 dark:from-primary-950/40 dark:to-secondary-950/40"
            >
              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-900">
                <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
                  {days}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-slate-400">{t("studyTools.exam.days")}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{exam.title}</p>
                <p className="text-xs text-slate-400">
                  {formatDate(exam.date)}
                </p>
              </div>
              <button
                onClick={() => deleteMutation.mutate(exam.id)}
                className="text-slate-300 transition hover:text-rose-500"
                aria-label={t("studyTools.exam.deleteExam", { title: exam.title })}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StudyPlanner() {
  const queryClient = useQueryClient();
  const t = useT();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"DAILY" | "WEEKLY">("DAILY");

  const { data: goals } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => (await api.get("/study/goals")).data.data as StudyGoal[],
  });

  const addMutation = useMutation({
    mutationFn: () => api.post("/study/goals", { title, type }),
    onSuccess: () => {
      setTitle("");
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) =>
      api.patch(`/study/goals/${id}`, { done }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/study/goals/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  const daily = goals?.filter((goal) => goal.type === "DAILY") ?? [];
  const weekly = goals?.filter((goal) => goal.type === "WEEKLY") ?? [];
  const doneCount = goals?.filter((goal) => goal.done).length ?? 0;
  const progress = goals?.length ? Math.round((doneCount / goals.length) * 100) : 0;

  const renderList = (list: StudyGoal[], heading: string) =>
    list.length > 0 && (
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {heading}
        </h3>
        <div className="space-y-1.5">
          {list.map((goal) => (
            <div
              key={goal.id}
              className="group flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800"
            >
              <button
                onClick={() => toggleMutation.mutate({ id: goal.id, done: !goal.done })}
                aria-label={goal.done ? t("studyTools.planner.markIncomplete") : t("studyTools.planner.markComplete")}
              >
                {goal.done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                )}
              </button>
              <span
                className={cn(
                  "flex-1 text-sm",
                  goal.done && "text-slate-400 line-through"
                )}
              >
                {goal.title}
              </span>
              <button
                onClick={() => deleteMutation.mutate(goal.id)}
                className="text-slate-200 opacity-0 transition group-hover:opacity-100 hover:text-rose-500 dark:text-slate-700"
                aria-label={t("studyTools.planner.deleteGoal")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="card p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <ListTodo className="h-5 w-5 text-secondary-500" /> {t("studyTools.planner.title")}
      </h2>
      {goals && goals.length > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-400">
            <span>{t("studyTools.planner.progress")}</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (title) addMutation.mutate();
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("studyTools.planner.goalPlaceholder")}
          className="input flex-1"
          required
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "DAILY" | "WEEKLY")}
          className="input w-auto"
          aria-label={t("studyTools.planner.goalType")}
        >
          <option value="DAILY">{t("studyTools.planner.daily")}</option>
          <option value="WEEKLY">{t("studyTools.planner.weekly")}</option>
        </select>
        <Button type="submit" loading={addMutation.isPending} aria-label={t("studyTools.planner.addGoal")}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>
      <div className="mt-5 space-y-5">
        {renderList(daily, t("studyTools.planner.dailyGoals"))}
        {renderList(weekly, t("studyTools.planner.weeklyGoals"))}
        {goals?.length === 0 && (
          <p className="text-sm text-slate-400">{t("studyTools.planner.empty")}</p>
        )}
      </div>
    </div>
  );
}

const FOCUS_MINUTES = 25;
const BREAK_MINUTES = 5;

function Pomodoro() {
  const queryClient = useQueryClient();
  const t = useT();
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MINUTES * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: summary } = useQuery({
    queryKey: ["pomodoro-summary"],
    queryFn: async () =>
      (await api.get("/study/pomodoro/summary")).data.data as {
        sessions: number;
        totalMinutes: number;
      },
  });

  const logSession = useMutation({
    mutationFn: (minutes: number) => api.post("/study/pomodoro", { minutes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pomodoro-summary"] }),
  });

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((seconds) => {
        if (seconds <= 1) {
          setRunning(false);
          if (mode === "focus") {
            logSession.mutate(FOCUS_MINUTES);
            toast.success(t("studyTools.pomodoro.toast.focusDone"));
            setMode("break");
            return BREAK_MINUTES * 60;
          }
          toast.info(t("studyTools.pomodoro.toast.breakOver"));
          setMode("focus");
          return FOCUS_MINUTES * 60;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode]);

  const reset = () => {
    setRunning(false);
    setSecondsLeft((mode === "focus" ? FOCUS_MINUTES : BREAK_MINUTES) * 60);
  };

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const total = (mode === "focus" ? FOCUS_MINUTES : BREAK_MINUTES) * 60;
  const progress = ((total - secondsLeft) / total) * 100;

  return (
    <div className="card p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Timer className="h-5 w-5 text-accent-500" /> {t("studyTools.pomodoro.title")}
      </h2>
      <div className="mt-5 flex flex-col items-center">
        <div className="flex gap-2">
          {(["focus", "break"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setRunning(false);
                setSecondsLeft((m === "focus" ? FOCUS_MINUTES : BREAK_MINUTES) * 60);
              }}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition",
                mode === m
                  ? "bg-accent-500 text-white"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800"
              )}
            >
              <span className="flex items-center gap-1.5">
                {m === "focus" ? <Target className="h-3.5 w-3.5" /> : <Coffee className="h-3.5 w-3.5" />}
                {m === "focus" ? t("studyTools.pomodoro.focus") : t("studyTools.pomodoro.break")}
              </span>
            </button>
          ))}
        </div>

        <div className="relative mt-6 flex h-44 w-44 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-800" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#pomodoro-gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(progress / 100) * 283} 283`}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="pomodoro-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-4xl font-extrabold tabular-nums">
            {minutes}:{seconds}
          </span>
        </div>

        <div className="mt-5 flex gap-2">
          <Button onClick={() => setRunning((r) => !r)} className="w-28 gap-2">
            {running ? (
              <>
                <Pause className="h-4 w-4" /> {t("studyTools.pomodoro.pause")}
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> {t("studyTools.pomodoro.start")}
              </>
            )}
          </Button>
          <Button variant="outline" onClick={reset} aria-label={t("studyTools.pomodoro.resetTimer")}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {summary && (
          <p className="mt-5 text-xs text-slate-400">
            {t("studyTools.pomodoro.summary", {
              sessions: summary.sessions,
              minutes: summary.totalMinutes,
            })}
          </p>
        )}
      </div>
    </div>
  );
}

const TODO_CATEGORIES: {
  key: TodoCategory;
  labelKey: TranslationKey;
  icon: typeof FileText;
  accent: string;
}[] = [
  { key: "NOTE", labelKey: "studyTools.todos.cat.notes", icon: FileText, accent: "text-primary-500" },
  { key: "HOMEWORK", labelKey: "studyTools.todos.cat.homework", icon: NotebookPen, accent: "text-amber-500" },
  { key: "PROBLEM", labelKey: "studyTools.todos.cat.problems", icon: BrainCircuit, accent: "text-secondary-500" },
  { key: "SCRATCH", labelKey: "studyTools.todos.cat.scratch", icon: StickyNote, accent: "text-emerald-500" },
];

const PRIORITY_META: Record<
  TodoPriority,
  { labelKey: TranslationKey; dot: string; badge: string }
> = {
  HIGH: {
    labelKey: "studyTools.todos.priority.high",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
  },
  MEDIUM: {
    labelKey: "studyTools.todos.priority.medium",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  },
  LOW: {
    labelKey: "studyTools.todos.priority.low",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
};

function dueLabel(dueDate: string, t: TFunction) {
  const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { text: t("studyTools.todos.overdue", { days: Math.abs(days) }), overdue: true };
  if (days === 0) return { text: t("studyTools.todos.dueToday"), overdue: true };
  if (days === 1) return { text: t("studyTools.todos.dueTomorrow"), overdue: false };
  return { text: t("studyTools.todos.dueIn", { days }), overdue: false };
}

function TodoRow({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
}) {
  const t = useT();
  const meta = TODO_CATEGORIES.find((c) => c.key === todo.category);
  const Icon = meta?.icon ?? StickyNote;
  const priority = PRIORITY_META[todo.priority];
  const due = todo.dueDate && !todo.done ? dueLabel(todo.dueDate, t) : null;

  return (
    <div className="group flex items-start gap-3 rounded-xl border border-slate-100 px-3 py-2.5 transition hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700">
      <button
        onClick={() => onToggle(todo)}
        className="mt-0.5 shrink-0"
        aria-label={todo.done ? t("studyTools.todos.markIncomplete") : t("studyTools.todos.markComplete")}
      >
        {todo.done ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium", todo.done && "text-slate-400 line-through")}>
          {todo.title}
        </p>
        {todo.details && !todo.done && (
          <p className="mt-0.5 line-clamp-2 whitespace-pre-wrap text-xs text-slate-400">
            {todo.details}
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            )}
          >
            <Icon className={cn("h-3 w-3", meta?.accent)} /> {meta ? t(meta.labelKey) : null}
          </span>
          {!todo.done && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                priority.badge
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} /> {t(priority.labelKey)}
            </span>
          )}
          {due && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                due.overdue
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              )}
            >
              {due.text}
            </span>
          )}
          {todo.note && (
            <Link
              href={`/notes/${todo.note.id}`}
              className="flex max-w-[12rem] items-center gap-1 truncate rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-600 hover:underline dark:bg-primary-950/40 dark:text-primary-400"
            >
              <FileText className="h-3 w-3 shrink-0" /> <span className="truncate">{todo.note.title}</span>
            </Link>
          )}
          {todo.problem && (
            <span className="flex max-w-[12rem] items-center gap-1 truncate rounded-full bg-secondary-50 px-2 py-0.5 text-[10px] font-semibold text-secondary-600 dark:bg-secondary-950/40 dark:text-secondary-400">
              <Puzzle className="h-3 w-3 shrink-0" /> <span className="truncate">{todo.problem.title}</span>
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="mt-0.5 shrink-0 text-slate-200 opacity-0 transition group-hover:opacity-100 hover:text-rose-500 dark:text-slate-700"
        aria-label={t("studyTools.todos.deleteTodo")}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function TodoTracker() {
  const queryClient = useQueryClient();
  const t = useT();
  const [filter, setFilter] = useState<TodoCategory | "ALL">("ALL");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TodoCategory>("HOMEWORK");
  const [priority, setPriority] = useState<TodoPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");

  const { data: todos } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => (await api.get("/study/todos")).data.data as Todo[],
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["todos"] });

  const addMutation = useMutation({
    mutationFn: () =>
      api.post("/study/todos", {
        title,
        category,
        priority,
        ...(dueDate ? { dueDate } : {}),
      }),
    onSuccess: () => {
      setTitle("");
      setDueDate("");
      invalidate();
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  const toggleMutation = useMutation({
    mutationFn: (todo: Todo) => api.patch(`/study/todos/${todo.id}`, { done: !todo.done }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/study/todos/${id}`),
    onSuccess: invalidate,
  });

  const clearMutation = useMutation({
    mutationFn: () => api.delete("/study/todos"),
    onSuccess: invalidate,
  });

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const todo of todos ?? []) {
      if (!todo.done) map[todo.category] = (map[todo.category] ?? 0) + 1;
    }
    return map;
  }, [todos]);

  const visible = (todos ?? []).filter((t) => filter === "ALL" || t.category === filter);
  const openCount = (todos ?? []).filter((t) => !t.done).length;
  const doneCount = (todos ?? []).length - openCount;

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <ListChecks className="h-5 w-5 text-primary-500" /> {t("studyTools.todos.title")}
        </h2>
        <span className="text-xs text-slate-400">
          {t("studyTools.todos.counts", { open: openCount, done: doneCount })}
        </span>
      </div>

      {/* Category filter */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("ALL")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition",
            filter === "ALL"
              ? "bg-primary-500 text-white"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800"
          )}
        >
          {t("common.all")}
        </button>
        {TODO_CATEGORIES.map(({ key, labelKey, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              setFilter(key);
              setCategory(key);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
              filter === key
                ? "bg-primary-500 text-white"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800"
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {t(labelKey)}
            {counts[key] ? (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px]",
                  filter === key ? "bg-white/25" : "bg-white dark:bg-slate-900"
                )}
              >
                {counts[key]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Add form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) addMutation.mutate();
        }}
        className="mt-4 flex flex-wrap gap-2"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("studyTools.todos.titlePlaceholder")}
          className="input min-w-[12rem] flex-1"
          maxLength={160}
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TodoCategory)}
          className="input w-auto"
          aria-label={t("studyTools.todos.categoryLabel")}
        >
          {TODO_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {t(c.labelKey)}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TodoPriority)}
          className="input w-auto"
          aria-label={t("studyTools.todos.priorityLabel")}
        >
          <option value="HIGH">{t("studyTools.todos.priority.high")}</option>
          <option value="MEDIUM">{t("studyTools.todos.priority.medium")}</option>
          <option value="LOW">{t("studyTools.todos.priority.low")}</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          className="input w-auto"
          aria-label={t("studyTools.todos.dueDateLabel")}
        />
        <Button type="submit" loading={addMutation.isPending} aria-label={t("studyTools.todos.addTodo")}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {/* List */}
      <div className="mt-5 space-y-1.5">
        {visible.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">
            {todos?.length
              ? t("studyTools.todos.emptyCategory")
              : t("studyTools.todos.empty")}
          </p>
        )}
        {visible.map((todo) => (
          <TodoRow
            key={todo.id}
            todo={todo}
            onToggle={(t) => toggleMutation.mutate(t)}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}
      </div>

      {doneCount > 0 && (
        <button
          onClick={() => clearMutation.mutate()}
          disabled={clearMutation.isPending}
          className="mt-4 text-xs font-semibold text-slate-400 transition hover:text-rose-500 disabled:opacity-50"
        >
          {t("studyTools.todos.clearCompleted", { count: doneCount })}
        </button>
      )}
    </div>
  );
}

function formatMinutes(total: number) {
  if (total < 60) return `${total}m`;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * At-a-glance overview that aggregates progress across the page's tools. Reuses
 * the same react-query keys as the individual widgets, so it stays in sync with
 * them automatically (no extra requests, no extra backend).
 */
function ProgressTracker() {
  const t = useT();
  const { data: goals } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => (await api.get("/study/goals")).data.data as StudyGoal[],
  });
  const { data: todos } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => (await api.get("/study/todos")).data.data as Todo[],
  });
  const { data: summary } = useQuery({
    queryKey: ["pomodoro-summary"],
    queryFn: async () =>
      (await api.get("/study/pomodoro/summary")).data.data as {
        sessions: number;
        totalMinutes: number;
      },
  });
  const { data: exams } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => (await api.get("/study/exams")).data.data as Exam[],
  });

  const goalsDone = goals?.filter((g) => g.done).length ?? 0;
  const goalsTotal = goals?.length ?? 0;
  const todosDone = todos?.filter((t) => t.done).length ?? 0;
  const todosTotal = todos?.length ?? 0;
  const focusMinutes = summary?.totalMinutes ?? 0;

  // Soonest upcoming exam (the API already returns them ascending by date).
  const nextExam = useMemo(
    () => exams?.find((exam) => new Date(exam.date).getTime() > Date.now()) ?? null,
    [exams]
  );

  // Overall completion blends goals and to-dos — the two checklists on the page.
  const totalItems = goalsTotal + todosTotal;
  const totalDone = goalsDone + todosDone;
  const overall = totalItems ? Math.round((totalDone / totalItems) * 100) : 0;

  const tiles = [
    {
      icon: ListTodo,
      accent: "text-secondary-500",
      label: t("studyTools.progress.goals"),
      value: `${goalsDone}/${goalsTotal}`,
    },
    {
      icon: ListChecks,
      accent: "text-primary-500",
      label: t("studyTools.progress.todosDone"),
      value: `${todosDone}/${todosTotal}`,
    },
    {
      icon: Timer,
      accent: "text-accent-500",
      label: t("studyTools.progress.focus7Days"),
      value: formatMinutes(focusMinutes),
    },
    {
      icon: CalendarClock,
      accent: "text-rose-500",
      label: nextExam ? t("studyTools.progress.nextExam") : t("studyTools.progress.exams"),
      value: nextExam ? t("studyTools.progress.examDays", { days: daysLeft(nextExam.date) }) : "—",
    },
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Target className="h-5 w-5 text-primary-500" /> {t("studyTools.progress.title")}
        </h2>
        {totalItems > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
            <Flame className="h-3.5 w-3.5 text-amber-500" /> {t("studyTools.progress.complete", { done: totalDone, total: totalItems })}
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
        {/* Overall completion ring */}
        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="7"
              className="text-slate-100 dark:text-slate-800"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#progress-gradient)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${(overall / 100) * 283} 283`}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="progress-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-extrabold tabular-nums">{overall}%</span>
            <span className="text-[10px] uppercase tracking-wide text-slate-400">{t("studyTools.progress.done")}</span>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="grid w-full grid-cols-2 gap-3">
          {tiles.map(({ icon: Icon, accent, label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-100 p-3 dark:border-slate-800"
            >
              <Icon className={cn("h-4 w-4", accent)} />
              <p className="mt-2 text-xl font-bold tabular-nums">{value}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudyToolsPage() {
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const t = useT();

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.push("/login?next=/study-tools");
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) return null;

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("studyTools.title")}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("studyTools.subtitle")}
        </p>
      </div>
      <div className="mb-6">
        <ProgressTracker />
      </div>
      <div className="mb-6">
        <TodoTracker />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <ExamCountdown />
        <StudyPlanner />
        <Pomodoro />
      </div>
    </div>
  );
}
