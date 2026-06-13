"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Pencil, Reply, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import type { Comment } from "@/lib/types";
import { useT, useFormat } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/components/ui/Toast";

const EMOJIS = ["👍", "🔥", "💯", "🙏", "😊", "🎯"];

function CommentForm({
  noteId,
  parentId,
  placeholder,
  onDone,
  initialValue = "",
  commentId,
}: {
  noteId: string;
  parentId?: string;
  placeholder: string;
  onDone?: () => void;
  initialValue?: string;
  commentId?: string;
}) {
  const t = useT();
  const [content, setContent] = useState(initialValue);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const mutation = useMutation({
    mutationFn: async () => {
      if (commentId) {
        await api.patch(`/comments/${commentId}`, { content });
      } else {
        await api.post(`/notes/${noteId}/comments`, { content, parentId });
      }
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", noteId] });
      onDone?.();
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  if (!isAuthenticated) {
    return (
      <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
        <Link href="/login" className="font-semibold text-primary-600 dark:text-primary-400">
          {t("comments.signInPrefix")}
        </Link>{" "}
        {t("comments.signInSuffix")}
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (content.trim()) mutation.mutate();
      }}
      className="space-y-2"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={2000}
        className="input resize-none"
      />
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setContent((c) => c + emoji)}
              className="rounded-lg p-1 text-base transition hover:scale-125"
              aria-label={t("comments.addEmoji", { emoji })}
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {onDone && (
            <Button type="button" variant="ghost" size="sm" onClick={onDone}>
              {t("common.cancel")}
            </Button>
          )}
          <Button type="submit" size="sm" loading={mutation.isPending} disabled={!content.trim()}>
            {commentId ? t("common.save") : t("comments.post")}
          </Button>
        </div>
      </div>
    </form>
  );
}

function CommentItem({ comment, noteId, isReply = false }: { comment: Comment; noteId: string; isReply?: boolean }) {
  const t = useT();
  const { timeAgo } = useFormat();
  const { user, isAdmin } = useAuth();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/comments/${comment.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", noteId] });
      toast.success(t("comments.toast.deleted"));
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  const isOwner = user?.id === comment.user.id;

  return (
    <div className={isReply ? "ml-10 mt-3" : ""}>
      <div className="flex gap-3">
        <Link href={`/profile/${comment.user.username}`}>
          <Avatar src={comment.user.avatarUrl} name={comment.user.name} size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <Link
                href={`/profile/${comment.user.username}`}
                className="text-sm font-semibold hover:text-primary-600 dark:hover:text-primary-400"
              >
                {comment.user.name}
              </Link>
              <span className="text-xs text-slate-400">@{comment.user.username} · {timeAgo(comment.createdAt)}</span>
            </div>
            {editing ? (
              <div className="mt-2">
                <CommentForm
                  noteId={noteId}
                  commentId={comment.id}
                  initialValue={comment.content}
                  placeholder={t("comments.editPlaceholder")}
                  onDone={() => setEditing(false)}
                />
              </div>
            ) : (
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700 dark:text-slate-200">
                {comment.content}
              </p>
            )}
          </div>
          <div className="mt-1 flex gap-3 px-2 text-xs text-slate-400">
            {!isReply && (
              <button onClick={() => setReplying((r) => !r)} className="flex items-center gap-1 hover:text-primary-600">
                <Reply className="h-3 w-3" /> {t("comments.reply")}
              </button>
            )}
            {isOwner && (
              <button onClick={() => setEditing((e) => !e)} className="flex items-center gap-1 hover:text-primary-600">
                <Pencil className="h-3 w-3" /> {t("common.edit")}
              </button>
            )}
            {(isOwner || isAdmin) && (
              <button
                onClick={() => deleteMutation.mutate()}
                className="flex items-center gap-1 hover:text-rose-500"
              >
                <Trash2 className="h-3 w-3" /> {t("common.delete")}
              </button>
            )}
          </div>
          {replying && (
            <div className="mt-2">
              <CommentForm
                noteId={noteId}
                parentId={comment.id}
                placeholder={t("comments.replyPlaceholder", { username: comment.user.username })}
                onDone={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </div>
      {comment.replies?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} noteId={noteId} isReply />
      ))}
    </div>
  );
}

export function Comments({ noteId }: { noteId: string }) {
  const t = useT();
  const { data } = useQuery({
    queryKey: ["comments", noteId],
    queryFn: async () => {
      const { data } = await api.get(`/notes/${noteId}/comments`, { params: { limit: 30 } });
      return data.data as Comment[];
    },
  });

  return (
    <section id="comments" className="space-y-5">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <MessageCircle className="h-5 w-5 text-primary-500" />
        {data && data.length > 0
          ? t("comments.discussionCount", { count: data.length })
          : t("comments.discussion")}
      </h2>
      <CommentForm noteId={noteId} placeholder={t("comments.composerPlaceholder")} />
      <div className="space-y-5">
        {data?.length === 0 && (
          <EmptyState title={t("comments.empty.title")} description={t("comments.empty.desc")} />
        )}
        {data?.map((comment) => (
          <CommentItem key={comment.id} comment={comment} noteId={noteId} />
        ))}
      </div>
    </section>
  );
}
