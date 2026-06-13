"use client";

import { motion } from "framer-motion";
import { MessageSquareQuote, Quote } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { StarRating } from "@/components/ui/StarRating";
import { useT } from "@/lib/i18n";

const testimonials = [
  { id: "1", name: "Ayesha Rahman", rating: 5 },
  { id: "2", name: "Tanvir Hasan", rating: 5 },
  { id: "3", name: "Nusrat Jahan", rating: 4 },
] as const;

export function Testimonials() {
  const t = useT();
  return (
    <section className="container-page py-12">
      <div className="mb-7 text-center">
        <h2 className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <MessageSquareQuote className="h-7 w-7 text-primary-600 dark:text-primary-400" /> {t("landing.testimonials.title")}
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          {t("landing.testimonials.subtitle")}
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <motion.figure
            key={testimonial.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="card flex flex-col gap-4 p-6"
          >
            <Quote className="h-7 w-7 text-primary-200 dark:text-primary-800" />
            <blockquote className="flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              “{t(`landing.testimonials.${testimonial.id}.quote`)}”
            </blockquote>
            <StarRating value={testimonial.rating} readOnly />
            <figcaption className="flex items-center gap-3">
              <Avatar name={testimonial.name} size="sm" />
              <div>
                <p className="text-sm font-semibold">{testimonial.name}</p>
                <p className="text-xs text-slate-400">{t(`landing.testimonials.${testimonial.id}.role`)}</p>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
