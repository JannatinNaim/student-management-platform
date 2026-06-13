"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
  size = "sm",
  readOnly = false,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  const t = useT();
  const dimension = size === "lg" ? "h-7 w-7" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  const active = hover || Math.round(value);

  return (
    <div className="flex items-center gap-0.5" role={readOnly ? "img" : "radiogroup"} aria-label={t("ui.rating", { value })}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={cn("transition-transform", !readOnly && "cursor-pointer hover:scale-125")}
          aria-label={t(star > 1 ? "ui.rateStarsPlural" : "ui.rateStars", { count: star })}
        >
          <Star
            className={cn(
              dimension,
              star <= active
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-slate-300 dark:text-slate-600"
            )}
          />
        </button>
      ))}
    </div>
  );
}
