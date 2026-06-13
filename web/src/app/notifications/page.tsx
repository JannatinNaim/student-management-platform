"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/lib/api";
import type { Notification } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useFormat, useT, type TFunction, type TranslationKey } from "@/lib/i18n";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Render a notification's text in the active language. The server stores a
 * stable `messageKey` (+ JSON `messageParams`); we translate it, enriching the
 * params for keys whose content is itself translatable (level / achievement
 * names). Falls back to the legacy English `message` for pre-i18n rows.
 */
function notificationText(n: Notification, t: TFunction): string {
  if (!n.messageKey) return n.message ?? "";
  let params: Record<string, string | number> = {};
  if (n.messageParams) {
    try {
      params = JSON.parse(n.messageParams);
    } catch {
      params = {};
    }
  }
  if (n.messageKey === "notif.levelUp" && params.level != null) {
    params = { ...params, levelName: t(`level.${params.level}` as TranslationKey) };
  }
  if (n.messageKey === "notif.achievement" && params.code != null) {
    params = { ...params, name: t(`achievement.${params.code}.name` as TranslationKey) };
  }
  return t(n.messageKey as TranslationKey, params);
}

export default function NotificationsPage() {
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useT();
  const { timeAgo } = useFormat();

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.push("/login?next=/notifications");
  }, [hydrated, isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get("/notifications", { params: { limit: 50 } });
      return data.data as Notification[];
    },
    enabled: isAuthenticated,
  });

  const markAll = useMutation({
    mutationFn: () => api.post("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  const markOne = useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  if (!hydrated || !isAuthenticated) return null;

  return (
    <div className="container-page max-w-2xl py-10">
      <div className="mb-7 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("notifications.title")}</h1>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => markAll.mutate()}>
          <CheckCheck className="h-4 w-4" /> {t("notifications.markAllRead")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : data?.length ? (
        <div className="space-y-2.5">
          {data.map((notification) => {
            const inner = (
              <div
                className={cn(
                  "card flex items-start gap-3.5 p-4 transition hover:shadow-card-hover",
                  !notification.read &&
                    "border-primary-200 bg-primary-50/60 dark:border-primary-900 dark:bg-primary-950/30"
                )}
              >
                {notification.actor ? (
                  <Avatar src={notification.actor.avatarUrl} name={notification.actor.name} size="sm" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/50">
                    <Bell className="h-4 w-4" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    {notification.actor && (
                      <span className="font-semibold">{notification.actor.name} </span>
                    )}
                    {notificationText(notification, t)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{timeAgo(notification.createdAt)}</p>
                </div>
                {!notification.read && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                )}
              </div>
            );
            return notification.link ? (
              <Link
                key={notification.id}
                href={notification.link}
                onClick={() => !notification.read && markOne.mutate(notification.id)}
                className="block"
              >
                {inner}
              </Link>
            ) : (
              <button
                key={notification.id}
                onClick={() => !notification.read && markOne.mutate(notification.id)}
                className="block w-full text-left"
              >
                {inner}
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="h-7 w-7" />}
          title={t("notifications.empty.title")}
          description={t("notifications.empty.description")}
        />
      )}
    </div>
  );
}
