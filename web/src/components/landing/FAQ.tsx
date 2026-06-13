"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

const faqs = ["1", "2", "3", "4", "5", "6"] as const;

export function FAQ() {
  const t = useT();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="container-page max-w-3xl py-12">
      <div className="mb-7 text-center">
        <h2 className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <HelpCircle className="h-7 w-7 text-primary-600 dark:text-primary-400" /> {t("landing.faq.title")}
        </h2>
      </div>
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq} className="card overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <span className="text-sm font-semibold sm:text-base">{t(`landing.faq.q${faq}`)}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-slate-400 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {t(`landing.faq.a${faq}`)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
