"use client";

import { FAQ } from "@/components/landing/FAQ";
import { Hero } from "@/components/landing/Hero";
import { NoteSection } from "@/components/landing/NoteSection";
import { Stats } from "@/components/landing/Stats";
import { SubjectsSection } from "@/components/landing/SubjectsGrid";
import { Testimonials } from "@/components/landing/Testimonials";
import { TopContributors } from "@/components/landing/TopContributors";
import { useT } from "@/lib/i18n";

export default function HomePage() {
  const t = useT();
  return (
    <>
      <Hero />
      <Stats />
      <TopContributors />
      <NoteSection
        icon="medal"
        title={t("landing.section.official.title")}
        subtitle={t("landing.section.official.subtitle")}
        endpoint="/notes/official"
        viewAllHref="/notes?official=true"
      />
      <NoteSection
        icon="flame"
        title={t("landing.section.trending.title")}
        subtitle={t("landing.section.trending.subtitle")}
        endpoint="/notes/trending"
        viewAllHref="/notes?sort=downloads"
      />
      <NoteSection
        icon="star"
        title={t("landing.section.topRated.title")}
        subtitle={t("landing.section.topRated.subtitle")}
        endpoint="/notes/top-rated"
        viewAllHref="/notes?sort=rating"
      />
      <NoteSection
        icon="sparkles"
        title={t("landing.section.recent.title")}
        subtitle={t("landing.section.recent.subtitle")}
        endpoint="/notes/recent"
        viewAllHref="/notes?sort=newest"
      />
      <SubjectsSection />
      <Testimonials />
      <FAQ />
    </>
  );
}
