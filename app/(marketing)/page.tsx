import type { Metadata } from "next";

import { home } from "@/lib/content/home";
import {
  Hero,
  StatStrip,
  ProblemSection,
  SegmentSelector,
  HowItWorks,
  Capabilities,
  Integrations,
  SecuritySection,
  Faq,
  DemoSection,
} from "@/components/marketing/sections";

// Root layout applies the "%s · Cozmo" title template, so keep this short.
export const metadata: Metadata = {
  title: "AI phone agents that answer every insurance call",
  description:
    "The AI phone agent for insurance. Cozmo answers first notice of loss, claim status, scheduling, and policy questions 24/7, in your brand's voice, wired into the systems you already run.",
};

export default function HomePage() {
  return (
    <>
      {/* Bands alternate default / surface for vertical rhythm.
          Hero owns hero-bg; every other band below is tone="surface". */}
      <Hero
        eyebrow={home.hero.eyebrow}
        h1={home.hero.h1}
        sub={home.hero.sub}
        heroStat={home.hero.heroStat}
      />

      <StatStrip stats={home.stats} tone="surface" />

      <ProblemSection {...home.problem} />

      <SegmentSelector {...home.segments} tone="surface" />

      <HowItWorks
        eyebrow={home.steps.eyebrow}
        title={home.steps.title}
        steps={home.steps.items}
      />

      <Capabilities {...home.capabilities} tone="surface" />

      <Integrations {...home.integrations} />

      <SecuritySection {...home.security} tone="surface" />

      <DemoSection {...home.demo} />

      <Faq
        eyebrow="FAQ"
        title="Questions teams ask before going live"
        faqs={home.faqs}
        tone="surface"
      />
    </>
  );
}
