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
import { homeowners } from "@/lib/content/homeowners";

export const metadata: Metadata = {
  // Root layout owns the template "%s · Cozmo", so this segment title stays short.
  title: "Homeowners insurance",
  description:
    "AI phone agents for homeowners insurance. Cozmo answers every policyholder call 24/7, files the first notice of loss, books adjusters, and answers coverage questions in your agency's voice, wired into Applied Epic, EZLynx, and the systems you already run.",
};

export default function HomeownersPage() {
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
  } = homeowners;

  // Surface tone alternates on every other band (StatStrip, Capabilities,
  // Integrations, Faq) for vertical rhythm; the Hero owns its own .hero-bg.
  return (
    <>
      <Hero
        eyebrow={hero.eyebrow}
        h1={hero.h1}
        sub={hero.sub}
        heroStat={hero.heroStat}
        scene={hero.phone}
        image="/brand/hero-homeowners.png"
      />

      <StatStrip tone="surface" stats={stats} />

      <ProblemSection
        eyebrow={problem.eyebrow}
        title={problem.title}
        pains={problem.pains}
        resolution={problem.resolution}
      />

      <Capabilities
        tone="surface"
        eyebrow={capabilities.eyebrow}
        title={capabilities.title}
        sub={capabilities.sub}
        items={capabilities.items}
      />

      <HowItWorks
        eyebrow={steps.eyebrow}
        title={steps.title}
        steps={steps.items}
      />

      <Integrations
        tone="surface"
        eyebrow={integrations.eyebrow}
        title={integrations.title}
        sub={integrations.sub}
        items={integrations.items}
      />

      <ProofQuote proof={proof} />

      {/* The locked content type carries faqs[] but no FAQ heading, so the page
          supplies this band's eyebrow + title (see reply note). */}
      <Faq
        tone="surface"
        eyebrow="FAQ"
        title="What agencies ask first"
        faqs={faqs}
      />

      <DemoSection eyebrow={cta.eyebrow} title={cta.title} sub={cta.sub} />
    </>
  );
}
