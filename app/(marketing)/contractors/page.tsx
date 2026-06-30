import type { Metadata } from "next";

import { contractors } from "@/lib/content/contractors";
import {
  Capabilities,
  DemoSection,
  Faq,
  Hero,
  HowItWorks,
  Integrations,
  ProblemSection,
  StatStrip,
} from "@/components/marketing/sections";

/**
 * Contractors segment page (restoration / roofing / water mitigation).
 * Thin server component: it orders the shared marketing bands and feeds each
 * one the matching slice of `contractors` content. Tone alternates to
 * `surface` on every other band for vertical rhythm; the sections own styling.
 */
export const metadata: Metadata = {
  title: "Contractors",
  description:
    "AI phone agents for restoration and roofing: answer every call 24/7, qualify the loss, and book inspections onto the crew calendar. No lead lost to voicemail.",
};

export default function ContractorsPage() {
  return (
    <>
      <Hero
        eyebrow={contractors.hero.eyebrow}
        h1={contractors.hero.h1}
        sub={contractors.hero.sub}
        heroStat={contractors.hero.heroStat}
      />

      <StatStrip stats={contractors.stats} tone="surface" />

      <ProblemSection
        eyebrow={contractors.problem.eyebrow}
        title={contractors.problem.title}
        pains={contractors.problem.pains}
        resolution={contractors.problem.resolution}
      />

      <Capabilities
        eyebrow={contractors.capabilities.eyebrow}
        title={contractors.capabilities.title}
        sub={contractors.capabilities.sub}
        items={contractors.capabilities.items}
        tone="surface"
      />

      <HowItWorks
        eyebrow={contractors.steps.eyebrow}
        title={contractors.steps.title}
        steps={contractors.steps.items}
      />

      <Integrations
        eyebrow={contractors.integrations.eyebrow}
        title={contractors.integrations.title}
        sub={contractors.integrations.sub}
        items={contractors.integrations.items}
        tone="surface"
      />

      <DemoSection
        eyebrow={contractors.cta.eyebrow}
        title={contractors.cta.title}
        sub={contractors.cta.sub}
      />

      <Faq title="Common questions" faqs={contractors.faqs} tone="surface" />
    </>
  );
}
