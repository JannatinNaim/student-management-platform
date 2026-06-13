"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Paperclip, Send, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api, apiErrorMessage, fileUrl } from "@/lib/api";
import { messagesKey, problemKey, useProblemChat } from "@/hooks/useProblemChat";
import type { ProblemDetail, ProblemMessage } from "@/lib/types";
import { cn, formatBytes } from "@/lib/utils";
import { useT, useFormat, type TFunction } from "@/lib/i18n";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

interface Props {
  problem: ProblemDetail;
  currentUserId: string | null;
  canPost: boolean;
  canAcceptSolution: boolean;
  onRequireJoin: () => void;
}

export function ProblemChat({ problem, currentUserId, canPost, canAcceptSolution, onRequireJoin }: Props) {
  const queryClient = useQueryClient();
  const t = useT();
  const { timeAgo } = useFormat();
  const { messages, isLoading, typingName, emitTyping } = useProblemChat(problem.id);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastTyping = useRef(0);

  const MAX_ATTACHMENT_MB = 15;

  // Auto-scroll to the newest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typingName]);

  const sendMutation = useMutation({
    mutationFn: async ({ value, attachment }: { value: string; attachment: File | null }) => {
      const form = new FormData();
      if (value) form.append("content", value);
      if (attachment) form.append("attachment", attachment);
      const { data } = await api.post<{ data: ProblemMessage }>(
        `/problems/${problem.id}/messages`,
        form
      );
      return data.data;
    },
    onSuccess: (msg) => {
      // Merge immediately; the socket echo is de-duped by id.
      queryClient.setQueryData<ProblemMessage[]>(messagesKey(problem.id), (prev) => {
        if (!prev) return [msg];
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setContent("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (err) => toast.error(apiErrorMessage(err, t, "problems.err.sendFailed")),
  });

  const solveMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await api.post(`/problems/${problem.id}/solve`, { messageId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: problemKey(problem.id) });
      toast.success(t("problems.toast.markedSolution"));
    },
    onError: (err) => toast.error(apiErrorMessage(err, t, "problems.err.solveFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await api.delete(`/problems/messages/${messageId}`);
    },
    onSuccess: (_d, messageId) => {
      queryClient.setQueryData<ProblemMessage[]>(messagesKey(problem.id), (prev) =>
        prev?.filter((m) => m.id !== messageId)
      );
    },
    onError: (err) => toast.error(apiErrorMessage(err, t, "problems.err.deleteFailed")),
  });

  const pickFile = (selected: File | null) => {
    if (!selected) return setFile(null);
    if (selected.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
      toast.error(t("problems.chat.maxAttachmentSize", { mb: MAX_ATTACHMENT_MB }));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFile(selected);
  };

  const submit = () => {
    const value = content.trim();
    if ((!value && !file) || sendMutation.isPending) return;
    if (!canPost) return onRequireJoin();
    sendMutation.mutate({ value, attachment: file });
  };

  return (
    <div className="card flex h-[70vh] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
            {t("problems.chat.emptyState")}
          </div>
        ) : (
          messages.map((msg) => {
            const mine = msg.author.id === currentUserId;
            const canDelete =
              currentUserId && (mine || canAcceptSolution) && !deleteMutation.isPending;
            return (
              <div key={msg.id} className={cn("flex gap-3", mine && "flex-row-reverse")}>
                <Avatar src={msg.author.avatarUrl} name={msg.author.name} size="sm" />
                <div className={cn("group max-w-[78%]", mine && "items-end text-right")}>
                  <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {msg.author.name}
                    </span>
                    <span>{timeAgo(msg.createdAt)}</span>
                  </div>
                  {msg.content && (
                    <div
                      className={cn(
                        "inline-block whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm",
                        msg.isSolution
                          ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-100 dark:ring-emerald-700"
                          : mine
                            ? "bg-primary-600 text-white"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                      )}
                    >
                      {msg.content}
                    </div>
                  )}
                  {msg.attachmentUrl && (
                    <MessageAttachment message={msg} mine={mine} t={t} />
                  )}
                  <div className="mt-1 flex items-center gap-3 text-xs">
                    {msg.isSolution && (
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {t("problems.chat.acceptedSolution")}
                      </span>
                    )}
                    {canAcceptSolution && !msg.isSolution && (
                      <button
                        onClick={() => solveMutation.mutate(msg.id)}
                        disabled={solveMutation.isPending}
                        className="text-emerald-600 opacity-0 transition group-hover:opacity-100 hover:underline dark:text-emerald-400"
                      >
                        {t("problems.chat.markAsSolution")}
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => deleteMutation.mutate(msg.id)}
                        aria-label={t("problems.chat.deleteMessageAria")}
                        className="text-slate-400 opacity-0 transition group-hover:opacity-100 hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {typingName && (
          <p className="text-xs italic text-slate-400">{t("problems.chat.typing", { name: typingName })}</p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        {canPost ? (
          <div className="space-y-2">
            {file && (
              <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
                <Paperclip className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="flex-1 truncate text-slate-600 dark:text-slate-300">{file.name}</span>
                <span className="shrink-0 text-xs text-slate-400">{formatBytes(file.size)}</span>
                <button
                  type="button"
                  onClick={() => pickFile(null)}
                  aria-label={t("problems.chat.removeAttachmentAria")}
                  className="shrink-0 text-slate-400 transition hover:text-rose-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.odt,.odp,.ods,.txt,.md,.csv,.rtf,.epub"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label={t("problems.chat.attachFileAria")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-primary-600 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  const now = Date.now();
                  if (now - lastTyping.current > 1500) {
                    lastTyping.current = now;
                    emitTyping(t("problems.chat.someone"));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={1}
                placeholder={t("problems.chat.messagePlaceholder")}
                className="input max-h-32 min-h-[2.75rem] flex-1 resize-none py-2.5"
              />
              <Button onClick={submit} loading={sendMutation.isPending} className="gap-1.5">
                <Send className="h-4 w-4" /> {t("problems.chat.send")}
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={onRequireJoin}
            className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {t("problems.chat.joinToReply")}
          </button>
        )}
      </div>
    </div>
  );
}

/** Renders a message attachment — images inline, everything else as a download chip. */
function MessageAttachment({ message, mine, t }: { message: ProblemMessage; mine: boolean; t: TFunction }) {
  const url = fileUrl(message.attachmentUrl);
  if (!url) return null;
  const isImage = message.attachmentType?.startsWith("image/");

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="mt-1 block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={message.attachmentName ?? t("problems.chat.attachmentAlt")}
          className="max-h-72 max-w-full rounded-xl border border-slate-200 object-contain dark:border-slate-700"
        />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={message.attachmentName ?? undefined}
      className={cn(
        "mt-1 flex max-w-full items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
        mine
          ? "border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-200"
          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      )}
    >
      <Paperclip className="h-4 w-4 shrink-0" />
      <span className="truncate font-medium">{message.attachmentName ?? t("problems.chat.attachmentFallback")}</span>
      {message.attachmentSize != null && (
        <span className="shrink-0 text-xs opacity-70">{formatBytes(message.attachmentSize)}</span>
      )}
    </a>
  );
}
