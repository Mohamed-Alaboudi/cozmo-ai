/**
 * Shared content contract. Every page's copy is data of these shapes,
 * written into lib/content/*.ts by the content agents and rendered by
 * the data-driven section components in components/marketing/sections.tsx.
 *
 * `icon` fields hold a lucide-react icon NAME (see the allowed list in
 * docs/BUILD-CONTRACT.md); sections.tsx resolves it through an icon map.
 */

export type IconName = string;

export type Stat = {
  /** Big mono figure, e.g. "24/7", "< 2 rings", "92%". */
  value: string;
  label: string;
  sub?: string;
};

export type Capability = {
  icon: IconName;
  title: string;
  body: string;
};

export type Pain = {
  icon: IconName;
  title: string;
  body: string;
};

export type Step = {
  /** Two-digit numeral, e.g. "01". */
  n: string;
  title: string;
  body: string;
};

export type Faq = { q: string; a: string };

export type Integration = { name: string; category: string };

export type TranscriptLine = {
  speaker: "cozmo" | "caller";
  text: string;
  /** A substring of `text` to render in the accent color. */
  highlight?: string;
};

/** The fake "live call" shown on the phone screen in a hero. */
export type PhoneScene = {
  badge: string; // "Live call · FNOL"
  caller: string; // "(248) 555-0148"
  callerMeta: string; // "Policyholder · water damage"
  agentLabel: string; // "Cozmo · Claims intake"
  timer: string; // "01:12"
  transcript: TranscriptLine[]; // 1-2 lines under the waveform
};

export type SegmentCard = {
  tagline: string; // one line for the home selector card
  blurb: string; // 1-2 sentences
  icon: IconName;
  bullets: string[]; // exactly 3 quick wins
};

export type Proof = {
  quote: string;
  name: string;
  role: string;
  org: string;
  stat?: Stat;
};

export type SegmentContent = {
  slug: "homeowners" | "contractors" | "carriers";
  nav: string;
  card: SegmentCard;
  hero: {
    eyebrow: string;
    h1: string;
    sub: string;
    heroStat: Stat;
    phone: PhoneScene;
  };
  stats: Stat[]; // exactly 3
  problem: {
    eyebrow: string;
    title: string;
    pains: Pain[]; // exactly 3
    resolution: string;
  };
  capabilities: {
    eyebrow: string;
    title: string;
    sub: string;
    items: Capability[]; // exactly 6
  };
  steps: {
    eyebrow: string;
    title: string;
    items: Step[]; // 3-4
  };
  integrations: {
    eyebrow: string;
    title: string;
    sub: string;
    items: Integration[]; // 6-8 REAL systems for this segment
  };
  proof: Proof;
  faqs: Faq[]; // 4-6
  cta: { eyebrow: string; title: string; sub: string };
};

export type HomeContent = {
  hero: {
    eyebrow: string;
    h1: string;
    sub: string;
    heroStat: Stat;
    phone: PhoneScene;
  };
  stats: Stat[]; // 3-4
  problem: {
    eyebrow: string;
    title: string;
    pains: Pain[]; // 3
    resolution: string;
  };
  segments: { eyebrow: string; title: string; sub: string };
  steps: { eyebrow: string; title: string; items: Step[] }; // 4 steps
  capabilities: {
    eyebrow: string;
    title: string;
    sub: string;
    items: Capability[]; // 6
  };
  integrations: {
    eyebrow: string;
    title: string;
    sub: string;
    items: Integration[]; // 8-10 across segments
  };
  security: {
    eyebrow: string;
    title: string;
    sub: string;
    items: { icon: IconName; title: string; body: string }[]; // 4
  };
  proof: Proof;
  faqs: Faq[]; // 5-6
  demo: { eyebrow: string; title: string; sub: string };
};
