/**
 * Carriers segment page.
 *
 * Thin server component: it imports the carriers content and the shared
 * marketing sections, then orders the bands per docs/BUILD-CONTRACT.md. All
 * styling lives in the section components; this file only composes + passes
 * props and alternates `tone="surface"` on every other band for rhythm.
 */

import type { Metadata } from "next";

import {
  Capabilities,
  DemoSection,
  Faq,
  Hero,
  HowItWorks,
  Integrations,
  ProblemSection,
  ProofQuote,
  StatStrip,
} from "@/components/marketing/sections";
import { carriers } from "@/lib/content/carriers";

export const metadata: Metadata = {
  // Short title: the root layout applies the "%s · Cozmo" template.
  title: "Carriers & TPAs",
  description:
    "AI phone agents for carriers and TPAs. Cozmo files first notice of loss in minutes, deflects the status-check flood, and routes complex losses to your adjusters with full context, holding the line through the catastrophe surge.",
};

export default function CarriersPage() {
  const {
    hero,
    stats,
    problem,
    capabilities,
    steps,
    integrations,
    proof,
    faqs,
    cta,
  } = carriers;

  return (
    <>
      {/* Hero owns the hero-bg band; alternation starts below it. */}
      <Hero
        eyebrow={hero.eyebrow}
        h1={hero.h1}
        sub={hero.sub}
        heroStat={hero.heroStat}
      />

      <StatStrip stats={stats} tone="surface" />

      <ProblemSection
        eyebrow={problem.eyebrow}
        title={problem.title}
        pains={problem.pains}
        resolution={problem.resolution}
      />

      <Capabilities
        eyebrow={capabilities.eyebrow}
        title={capabilities.title}
        sub={capabilities.sub}
        items={capabilities.items}
        tone="surface"
      />

      <HowItWorks
        eyebrow={steps.eyebrow}
        title={steps.title}
        steps={steps.items}
      />

      <Integrations
        eyebrow={integrations.eyebrow}
        title={integrations.title}
        sub={integrations.sub}
        items={integrations.items}
        tone="surface"
      />

      <ProofQuote proof={proof} />

      <DemoSection eyebrow={cta.eyebrow} title={cta.title} sub={cta.sub} />

      {/* Content carries no FAQ heading by design, so the page supplies it. */}
      <Faq
        eyebrow="FAQ"
        title="Questions claims teams ask."
        faqs={faqs}
        tone="surface"
      />
    </>
  );
}
