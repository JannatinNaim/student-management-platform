"use client";

import { useQuery } from "@tanstack/react-query";
import { MessagesSquare } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ApiListResponse, Problem } from "@/lib/types";
import { useT } from "@/lib/i18n";
import { ProblemCard } from "@/components/problems/ProblemCard";

/**
 * Surfaces problem-solving discussions related to a note (or any subject/tag
 * context). Renders nothing when there are no matches so it can be dropped in
 * anywhere without leaving an empty section behind.
 */
export function RelatedProblems({
  subject,
  tag,
  exclude,
  title,
}: {
  subject?: string;
  tag?: string;
  exclude?: string;
  title?: string;
}) {
  const t = useT();
  const { data } = useQuery({
    queryKey: ["related-problems", { subject, tag, exclude }],
    queryFn: async () => {
      const { data } = await api.get<ApiListResponse<Problem>>("/problems", {
        params: { subject, tag, exclude, limit: 3, sort: "active" },
      });
      return data.data;
    },
    enabled: Boolean(subject || tag),
  });

  if (!data?.length) return null;

  return (
    <section className="mt-14">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <MessagesSquare className="h-5 w-5 text-primary-500" />{" "}
          {title ?? t("problems.related.defaultTitle")}
        </h2>
        <Link
          href={subject ? `/problems?subject=${subject}` : "/problems"}
          className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
        >
          {t("problems.related.browseAll")}
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((problem, index) => (
          <ProblemCard key={problem.id} problem={problem} index={index} showGroup />
        ))}
      </div>
    </section>
  );
}
