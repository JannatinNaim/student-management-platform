"use client";

/* eslint-disable @next/next/no-img-element */
import { motion } from "framer-motion";
import { BadgeCheck, Download, Eye, FileText, FileType2, Heart, ImageIcon, PenLine } from "lucide-react";
import Link from "next/link";
import { fileUrl } from "@/lib/api";
import type { NoteCard as NoteCardType } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { useT, useFormat, tContent } from "@/lib/i18n";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";

const typeIcons = {
  PDF: <FileText className="h-10 w-10" />,
  IMAGE: <ImageIcon className="h-10 w-10" />,
  HANDWRITTEN: <PenLine className="h-10 w-10" />,
  DOCUMENT: <FileType2 className="h-10 w-10" />,
};

const typeLabelKeys = {
  PDF: "notes.type.pdf",
  IMAGE: "notes.type.image",
  HANDWRITTEN: "notes.type.handwritten",
  DOCUMENT: "notes.type.document",
} as const;

export function NoteCard({ note, index = 0 }: { note: NoteCardType; index?: number }) {
  const t = useT();
  const { timeAgo } = useFormat();
  const thumb = fileUrl(note.thumbnailUrl);
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -4 }}
      className={
        "card group overflow-hidden transition-shadow hover:shadow-card-hover" +
        (note.isOfficial
          ? " ring-2 ring-emerald-400/70 dark:ring-emerald-500/60"
          : "")
      }
    >
      <Link href={`/notes/${note.id}`} className="block">
        <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 text-primary-300 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900 dark:text-slate-600">
          {thumb ? (
            <img
              src={thumb}
              alt={note.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            typeIcons[note.type]
          )}
          <div className="absolute left-3 top-3">
            <Badge tone="primary">
              {note.subject.icon} {tContent(t, "subject." + note.subject.slug + ".name", note.subject.name)}
            </Badge>
          </div>
          <div className="absolute right-3 top-3">
            <Badge tone={note.type === "PDF" ? "accent" : "secondary"}>{t(typeLabelKeys[note.type])}</Badge>
          </div>
          {note.isOfficial && (
            <div className="absolute bottom-3 left-3">
              <Badge tone="success" className="shadow-sm">
                <BadgeCheck className="h-3.5 w-3.5" /> {t("noteCard.official")}
              </Badge>
            </div>
          )}
        </div>

        <div className="space-y-3 p-4">
          <div>
            <h3 className="line-clamp-2 font-semibold leading-snug text-slate-900 transition-colors group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400">
              {note.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {note.chapter} · {timeAgo(note.createdAt)}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <StarRating value={note.avgRating} readOnly />
              <span>{t("noteCard.ratingsCount", { count: note.ratingsCount })}</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar src={note.author.avatarUrl} name={note.author.name} size="xs" />
              <span className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">
                {note.author.name}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Download className="h-3.5 w-3.5" /> {formatNumber(note.downloadsCount)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" /> {formatNumber(note.likesCount)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> {formatNumber(note.views)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
