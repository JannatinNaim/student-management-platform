"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Download, GraduationCap, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { PlatformStats } from "@/lib/types";
import { useT } from "@/lib/i18n";

function CountUp({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      const duration = 1200;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        setValue(Math.floor(target * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{value.toLocaleString()}</span>;
}

export function Stats() {
  const t = useT();
  const { data } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const { data } = await api.get<{ data: PlatformStats }>("/stats/platform");
      return data.data;
    },
  });

  const items = [
    { key: "students", label: t("landing.stats.students"), value: data?.students ?? 0, icon: GraduationCap, color: "text-primary-500" },
    { key: "notes", label: t("landing.stats.notes"), value: data?.notes ?? 0, icon: BookOpen, color: "text-secondary-500" },
    { key: "downloads", label: t("landing.stats.downloads"), value: data?.downloads ?? 0, icon: Download, color: "text-accent-500" },
    { key: "contributors", label: t("landing.stats.contributors"), value: data?.contributors ?? 0, icon: Users, color: "text-emerald-500" },
  ];

  return (
    <section className="container-page pb-16">
      <div className="card grid grid-cols-2 divide-slate-100 dark:divide-slate-800 lg:grid-cols-4 lg:divide-x">
        {items.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="flex flex-col items-center gap-1.5 py-8"
          >
            <item.icon className={`h-6 w-6 ${item.color}`} />
            <span className="text-3xl font-extrabold tracking-tight">
              <CountUp target={item.value} />
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
