"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Building2, CalendarDays, Download, GraduationCap, Github, Globe, Heart, Linkedin, MapPin, Settings, Trophy, Twitter, UserPlus, UserMinus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { api, apiErrorMessage, fileUrl } from "@/lib/api";
import type { Achievement, NoteCard as NoteCardType, ProfileUser } from "@/lib/types";
import { levelName } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";
import { useT, useFormat, tContent } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { NoteCard } from "@/components/notes/NoteCard";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { NoteGridSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { toast } from "@/components/ui/Toast";

type Tab = "notes" | "achievements";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const t = useT();
  const { formatDate } = useFormat();
  const { user: viewer, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("notes");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data } = await api.get<{ data: ProfileUser }>(`/users/${username}`);
      return data.data;
    },
  });

  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ["profile-notes", username],
    queryFn: async () => {
      const { data } = await api.get<{ data: NoteCardType[] }>(`/users/${username}/notes`, {
        params: { limit: 24 },
      });
      return data.data;
    },
  });

  const { data: achievements } = useQuery({
    queryKey: ["profile-achievements", username],
    queryFn: async () => {
      const { data } = await api.get<{ data: Achievement[] }>(`/users/${username}/achievements`);
      return data.data;
    },
    enabled: tab === "achievements",
  });

  const followMutation = useMutation({
    mutationFn: () => api.post(`/users/${username}/follow`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", username] }),
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  if (isLoading || !profile) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-44 w-full" />
        <div className="mt-6"><NoteGridSkeleton count={4} /></div>
      </div>
    );
  }

  const isOwn = viewer?.username === profile.username;
  const stats = [
    { label: t("profile.stat.notes"), value: profile.stats.notes, icon: BookOpen },
    { label: t("profile.stat.downloads"), value: profile.stats.downloads, icon: Download },
    { label: t("profile.stat.likes"), value: profile.stats.likes, icon: Heart },
    { label: t("profile.stat.points"), value: profile.points, icon: Trophy },
  ];

  return (
    <div className="container-page py-10">
      {/* Header */}
      <div className="card overflow-hidden">
        {/* Cover */}
        <div className="h-36 w-full bg-gradient-to-br from-primary-500/80 to-secondary-600/80 sm:h-52">
          {profile.coverUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={fileUrl(profile.coverUrl) ?? undefined} alt="" className="h-full w-full object-cover" />
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="-mt-16 flex flex-col items-center gap-6 sm:-mt-14 sm:flex-row sm:items-end">
            <Avatar
              src={profile.avatarUrl}
              name={profile.name}
              size="xl"
              className="h-28 w-28 ring-4 ring-white dark:ring-slate-900"
            />
            <div className="flex-1 text-center sm:pb-1 sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <Badge tone="secondary">
                  Lv.{profile.level} {tContent(t, "level." + profile.level, levelName(profile.level))}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-slate-400">@{profile.username}</p>
            </div>
            {isOwn ? (
              <Link href="/settings">
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" /> {t("profile.editProfile")}
                </Button>
              </Link>
            ) : isAuthenticated && (
              <Button
                variant={profile.isFollowing ? "outline" : "primary"}
                className="gap-2"
                loading={followMutation.isPending}
                onClick={() => followMutation.mutate()}
              >
                {profile.isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4" /> {t("profile.unfollow")}
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" /> {t("profile.follow")}
                  </>
                )}
              </Button>
            )}
          </div>

          {profile.bio && (
            <p className="mt-4 max-w-2xl text-sm text-slate-600 dark:text-slate-300">{profile.bio}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
            {profile.institution && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" /> {profile.institution}
              </span>
            )}
            {profile.course && (
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" /> {profile.course}
                {profile.gradYear ? ` · ${profile.gradYear}` : ""}
              </span>
            )}
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex items-center gap-1 text-primary-500 hover:underline"
              >
                <Globe className="h-3.5 w-3.5" /> {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" /> {t("profile.joined", { date: formatDate(profile.createdAt) })}
            </span>
          </div>

          {/* Social + follow counts */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            <span className="text-slate-400">
              <span className="font-semibold text-slate-600 dark:text-slate-200">{formatNumber(profile.stats.followers)}</span> {t("profile.followers")}
            </span>
            <span className="text-slate-400">
              <span className="font-semibold text-slate-600 dark:text-slate-200">{formatNumber(profile.stats.following)}</span> {t("profile.following")}
            </span>
            {profile.twitter && (
              <a href={`https://x.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 transition hover:text-primary-500" aria-label={t("profile.social.twitter")}>
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {profile.github && (
              <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 transition hover:text-primary-500" aria-label={t("profile.social.github")}>
                <Github className="h-4 w-4" />
              </a>
            )}
            {profile.linkedin && (
              <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 transition hover:text-primary-500" aria-label={t("profile.social.linkedin")}>
                <Linkedin className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* Interests */}
          {profile.interests?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.interests.map((tag) => (
                <Link
                  key={tag}
                  href={`/notes?q=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 transition hover:bg-primary-50 hover:text-primary-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-primary-900/40 dark:hover:text-primary-300"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 px-6 pb-6 sm:grid-cols-4 sm:px-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 rounded-2xl bg-slate-50 py-4 dark:bg-slate-800/60"
            >
              <stat.icon className="h-4 w-4 text-primary-500" />
              <span className="text-xl font-bold">{formatNumber(stat.value)}</span>
              <span className="text-xs text-slate-400">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {(["notes", "achievements"] as Tab[]).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-semibold transition",
              tab === tabKey
                ? "border-primary-600 text-primary-600 dark:text-primary-400"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            {tabKey === "notes" ? t("profile.tab.notes", { count: profile.stats.notes }) : t("profile.tab.achievements")}
          </button>
        ))}
      </div>

      <div className="mt-7">
        {tab === "notes" &&
          (notesLoading ? (
            <NoteGridSkeleton count={4} />
          ) : notes?.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {notes.map((note, index) => (
                <NoteCard key={note.id} note={note} index={index % 8} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={t("profile.notes.emptyTitle")}
              description={isOwn ? t("profile.notes.emptyOwn") : t("profile.notes.emptyOther", { name: profile.name })}
            />
          ))}

        {tab === "achievements" &&
          (achievements?.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="card flex items-center gap-4 p-5">
                  <DynamicIcon name={achievement.icon} className="h-10 w-10 shrink-0 text-secondary-500" />
                  <div>
                    <p className="font-semibold">{tContent(t, "achievement." + achievement.code + ".name", achievement.name)}</p>
                    <p className="text-xs text-slate-400">{tContent(t, "achievement." + achievement.code + ".desc", achievement.description)}</p>
                    {achievement.earnedAt && (
                      <p className="mt-1 text-[11px] text-slate-400">
                        {t("profile.achievements.earned", { date: formatDate(achievement.earnedAt) })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title={t("profile.achievements.emptyTitle")} description={t("profile.achievements.emptyDesc")} />
          ))}
      </div>
    </div>
  );
}
