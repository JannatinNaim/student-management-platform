"use client";

import { useMutation } from "@tanstack/react-query";
import { Camera, ImagePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, apiErrorMessage, fileUrl } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

interface ProfileForm {
  name: string;
  bio: string;
  institution: string;
  location: string;
  website: string;
  course: string;
  gradYear: string;
  twitter: string;
  github: string;
  linkedin: string;
}

const EMPTY: ProfileForm = {
  name: "",
  bio: "",
  institution: "",
  location: "",
  website: "",
  course: "",
  gradYear: "",
  twitter: "",
  github: "",
  linkedin: "",
};

export default function SettingsPage() {
  const t = useT();
  const { user, isAuthenticated, hydrated, refreshUser } = useAuth();
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [form, setForm] = useState<ProfileForm>(EMPTY);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestDraft, setInterestDraft] = useState("");

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.push("/login?next=/settings");
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        bio: user.bio ?? "",
        institution: user.institution ?? "",
        location: user.location ?? "",
        website: user.website ?? "",
        course: user.course ?? "",
        gradYear: user.gradYear ? String(user.gradYear) : "",
        twitter: user.twitter ?? "",
        github: user.github ?? "",
        linkedin: user.linkedin ?? "",
      });
      setInterests(user.interests ?? []);
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: async () => {
      const body = new FormData();
      (Object.keys(form) as (keyof ProfileForm)[]).forEach((key) => body.append(key, form[key]));
      body.append("interests", JSON.stringify(interests));
      if (avatar) body.append("avatar", avatar);
      if (cover) body.append("cover", cover);
      await api.patch("/users/me/profile", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: async () => {
      await refreshUser();
      setAvatar(null);
      setCover(null);
      toast.success(t("settings.toast.updated"));
    },
    onError: (error) => toast.error(apiErrorMessage(error, t)),
  });

  function update<K extends keyof ProfileForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addInterest() {
    const value = interestDraft.trim().toLowerCase();
    if (value && !interests.includes(value) && interests.length < 12) {
      setInterests((prev) => [...prev, value]);
    }
    setInterestDraft("");
  }

  if (!hydrated || !user) return null;

  const coverPreview = cover ? URL.createObjectURL(cover) : fileUrl(user.coverUrl);

  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="text-2xl font-bold tracking-tight">{t("settings.title")}</h1>
      <p className="mt-1 text-sm text-slate-400">
        {t("settings.subtitle")}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="card mt-7 overflow-hidden"
      >
        {/* Cover photo */}
        <div className="group relative h-40 w-full bg-gradient-to-br from-primary-500/80 to-secondary-600/80 sm:h-48">
          {coverPreview && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={coverPreview} alt={t("settings.coverAlt")} className="h-full w-full object-cover" />
          )}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/70"
          >
            <ImagePlus className="h-3.5 w-3.5" /> {user.coverUrl || cover ? t("settings.changeCover") : t("settings.addCover")}
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={(e) => setCover(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="space-y-5 p-6">
          {/* Avatar */}
          <div className="-mt-16 flex items-end gap-5">
            <div className="relative">
              <Avatar
                src={avatar ? URL.createObjectURL(avatar) : user.avatarUrl}
                name={user.name}
                size="xl"
                className="ring-4 ring-white dark:ring-slate-900"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow transition hover:bg-primary-700"
                aria-label={t("settings.changeAvatar")}
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="pb-1">
              <p className="font-semibold">@{user.username}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="label">{t("settings.displayName")}</label>
            <input id="name" className="input" required minLength={2} maxLength={60} value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>

          <div>
            <label htmlFor="bio" className="label">{t("settings.bio")}</label>
            <textarea id="bio" rows={3} maxLength={300} className="input resize-none" placeholder={t("settings.bioPlaceholder")} value={form.bio} onChange={(e) => update("bio", e.target.value)} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="institution" className="label">{t("settings.institution")}</label>
              <input id="institution" className="input" placeholder={t("settings.institutionPlaceholder")} value={form.institution} onChange={(e) => update("institution", e.target.value)} />
            </div>
            <div>
              <label htmlFor="course" className="label">{t("settings.course")}</label>
              <input id="course" className="input" placeholder={t("settings.coursePlaceholder")} value={form.course} onChange={(e) => update("course", e.target.value)} />
            </div>
            <div>
              <label htmlFor="location" className="label">{t("settings.location")}</label>
              <input id="location" className="input" placeholder={t("settings.locationPlaceholder")} value={form.location} onChange={(e) => update("location", e.target.value)} />
            </div>
            <div>
              <label htmlFor="gradYear" className="label">{t("settings.gradYear")}</label>
              <input id="gradYear" type="number" min={1950} max={2100} className="input" placeholder={t("settings.gradYearPlaceholder")} value={form.gradYear} onChange={(e) => update("gradYear", e.target.value)} />
            </div>
          </div>

          <div>
            <label htmlFor="website" className="label">{t("settings.website")}</label>
            <input id="website" className="input" placeholder={t("settings.websitePlaceholder")} value={form.website} onChange={(e) => update("website", e.target.value)} />
          </div>

          {/* Interests */}
          <div>
            <label htmlFor="interests" className="label">{t("settings.interests")}</label>
            <div className="input flex flex-wrap items-center gap-2">
              {interests.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  {tag}
                  <button type="button" onClick={() => setInterests((prev) => prev.filter((item) => item !== tag))} aria-label={t("settings.removeInterest", { tag })}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                id="interests"
                className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none"
                placeholder={interests.length >= 12 ? t("settings.interestsLimitReached") : t("settings.interestsPlaceholder")}
                value={interestDraft}
                disabled={interests.length >= 12}
                onChange={(e) => setInterestDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addInterest();
                  } else if (e.key === "Backspace" && !interestDraft) {
                    setInterests((prev) => prev.slice(0, -1));
                  }
                }}
                onBlur={addInterest}
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">{t("settings.interestsHelp")}</p>
          </div>

          {/* Social links */}
          <div>
            <p className="label">{t("settings.socialLinks")}</p>
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label htmlFor="twitter" className="sr-only">{t("settings.twitter")}</label>
                <div className="input flex items-center gap-1">
                  <span className="text-slate-400">@</span>
                  <input id="twitter" className="flex-1 bg-transparent outline-none" placeholder={t("settings.twitter")} value={form.twitter} onChange={(e) => update("twitter", e.target.value)} />
                </div>
              </div>
              <div>
                <label htmlFor="github" className="sr-only">{t("settings.github")}</label>
                <div className="input flex items-center gap-1">
                  <span className="text-slate-400">@</span>
                  <input id="github" className="flex-1 bg-transparent outline-none" placeholder={t("settings.github")} value={form.github} onChange={(e) => update("github", e.target.value)} />
                </div>
              </div>
              <div>
                <label htmlFor="linkedin" className="sr-only">{t("settings.linkedin")}</label>
                <div className="input flex items-center gap-1">
                  <span className="text-slate-400">@</span>
                  <input id="linkedin" className="flex-1 bg-transparent outline-none" placeholder={t("settings.linkedin")} value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" loading={mutation.isPending}>{t("common.saveChanges")}</Button>
        </div>
      </form>
    </div>
  );
}
