/* eslint-disable @next/next/no-img-element */
/**
 * Data-driven marketing sections for Cozmo.
 *
 * White paper page, near-black Space Grotesk display type, light-weight gray
 * Inter body, accent (Cozmo orange) rationed to <5% (one eyebrow, one headline
 * underline, the primary data emphasis). Hairline structure, no glows, no glass
 * blooms, no dark page background. The ONE dark "cinematic" band is ProofQuote.
 *
 * IMPORTANT cascade note: app/globals.css declares an UNLAYERED
 * `* { border-color: var(--color-line) }`, which in Tailwind v4 overrides every
 * layered `border-<color>` utility back to the light hairline. So any hairline
 * that must be a different color (accent, white-on-dark, heavy ink rule) is set
 * with an inline `style={{ borderColor }}`, an inset box-shadow, or a `bg-*`
 * element. Plain `border-line` (light) is fine because it matches that default.
 *
 * Export names + prop shapes are frozen: the four marketing pages import these.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import {
  type LucideIcon,
  // structural
  ArrowRight,
  Check,
  Plus,
  Quote,
  // content glyphs (resolved by name through iconMap)
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Voicemail,
  Clock,
  Clock3,
  CalendarCheck,
  CalendarClock,
  FileText,
  ClipboardCheck,
  ShieldCheck,
  Lock,
  Languages,
  MessageSquare,
  MessagesSquare,
  Mic,
  Headphones,
  Home,
  HardHat,
  Building2,
  Umbrella,
  CloudRain,
  Droplets,
  Flame,
  Wrench,
  Hammer,
  Camera,
  Map,
  Users,
  UserCheck,
  Zap,
  TrendingUp,
  BarChart3,
  Bell,
  CheckCircle2,
  RefreshCw,
  Workflow,
  Network,
  Sparkles,
  Star,
  DollarSign,
  Gauge,
  Activity,
  Database,
  Plug,
} from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { Container, Display, H2, Lede, Section } from "@/components/ui/section";
import { PhoneCallForm } from "@/components/voice/phone-call-form";
import { PhoneFrame } from "@/components/voice/phone-frame";

import { homeowners } from "@/lib/content/homeowners";
import { contractors } from "@/lib/content/contractors";
import { carriers } from "@/lib/content/carriers";
import type {
  Capability,
  Faq as FaqItem,
  Integration,
  Pain,
  PhoneScene,
  Proof,
  Stat,
  Step,
} from "@/lib/content/types";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/cn";

/* ============================================================
   Icons
   ============================================================ */

const iconMap: Record<string, LucideIcon> = {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Voicemail,
  Clock,
  Clock3,
  CalendarCheck,
  CalendarClock,
  FileText,
  ClipboardCheck,
  ShieldCheck,
  Lock,
  Languages,
  MessageSquare,
  MessagesSquare,
  Mic,
  Headphones,
  Home,
  HardHat,
  Building2,
  Umbrella,
  CloudRain,
  Droplets,
  Flame,
  Wrench,
  Hammer,
  Camera,
  Map,
  Users,
  UserCheck,
  Zap,
  TrendingUp,
  BarChart3,
  Bell,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Workflow,
  Network,
  Sparkles,
  Star,
  DollarSign,
  Gauge,
  Activity,
  Database,
  Plug,
};

function Icon({ name, className }: { name: string; className?: string }) {
  const Glyph = iconMap[name] ?? Sparkles;
  return <Glyph className={className} aria-hidden="true" />;
}

/* ============================================================
   Shared editorial helpers
   ============================================================ */

type Tone = "default" | "surface";

/** Accent uppercase eyebrow (written inline, not via the .eyebrow class, so the
 *  on-dark color override is reliable against the global border/utility cascade). */
function Kicker({
  children,
  onDark = false,
  className,
}: {
  children: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "mb-5 text-[12px] font-semibold uppercase tracking-[0.24em]",
        onDark ? "text-accent-hi" : "text-accent-text",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Eyebrow + heavy ink H2 + optional gray lede. Left, or centered for CTAs. */
function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <Reveal className={cn("max-w-[860px]", centered && "mx-auto text-center")}>
      {eyebrow ? <Kicker>{eyebrow}</Kicker> : null}
      <H2 className={cn(centered && "mx-auto")}>{title}</H2>
      {sub ? (
        <Lede className={cn("mt-6 max-w-[60ch]", centered && "mx-auto")}>
          {sub}
        </Lede>
      ) : null}
    </Reveal>
  );
}

/** Primary "Book a demo" CTA → HubSpot scheduler, opens in a new tab.
 *  Reuses the accent button look without importing the Link-based LinkButton. */
function DemoButton({
  children,
  size = "md",
  className,
}: {
  children: ReactNode;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <a
      href={SITE.demoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent font-semibold text-white transition-colors duration-200 hover:bg-accent-hi",
        size === "lg" ? "h-[54px] px-7 text-[15px]" : "h-11 px-5 text-[14px]",
        className,
      )}
    >
      {children}
    </a>
  );
}

/** Round hairline icon chip (ink glyph; accent is rationed elsewhere). */
function IconBadge({ name }: { name: string }) {
  return (
    <span className="inline-grid size-12 place-items-center rounded-full border border-line text-ink">
      <Icon name={name} className="size-5" />
    </span>
  );
}

/** Wrap the phrase after the last comma (or the last 3 words) in the accent
 *  underline, so each hero headline gets exactly ONE `.ul-accent` stroke. */
function AccentHeadline({ text }: { text: string }) {
  const comma = text.lastIndexOf(",");
  let head = "";
  let phrase = text;

  if (comma >= 0 && comma < text.length - 1) {
    head = text.slice(0, comma + 1);
    phrase = text.slice(comma + 1).trim();
    const lead = phrase.match(/^(and|then|so|but|yet)\s+/i);
    if (lead) {
      head = `${head} ${phrase.slice(0, lead[0].length).trim()}`;
      phrase = phrase.slice(lead[0].length);
    }
  } else {
    const words = text.trim().split(/\s+/);
    if (words.length > 3) {
      head = words.slice(0, -3).join(" ");
      phrase = words.slice(-3).join(" ");
    }
  }

  return (
    <>
      {head ? `${head} ` : null}
      <span className="ul-accent">{phrase}</span>
    </>
  );
}

/* ============================================================
   PhoneStage - the dark device on the light page
   ============================================================ */

export function PhoneStage(_props?: { scene?: PhoneScene }) {
  return (
    <PhoneFrame>
      <div className="relative flex h-full flex-col px-6 pb-6 pt-2 text-white">
        {/* ambient accent glow behind the content */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[22%] -z-0 size-56 -translate-x-1/2 rounded-full bg-accent/10 blur-[64px]"
        />

        {/* centered brand logo in a glass card */}
        <div className="relative z-10 flex flex-col items-center pt-3">
          <div className="mb-5 flex size-28 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/cozmo-icon.png"
              alt="Cozmo"
              className="size-full rounded-full object-contain"
            />
          </div>

          {/* eyebrow + heading */}
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-accent-hi">
            Interactive demo
          </p>
          <h3 className="mt-2 text-center font-disp text-[26px] font-semibold leading-tight tracking-[-0.01em] text-white">
            Call Cozmo&rsquo;s
            <br />
            <span className="italic text-accent-hi">AI agent</span>
          </h3>
        </div>

        {/* the call-me form, pinned toward the bottom */}
        <div className="relative z-10 mt-auto pt-6">
          <PhoneCallForm />
        </div>
      </div>
    </PhoneFrame>
  );
}

/* ============================================================
   Hero
   ============================================================ */

export function Hero({
  eyebrow,
  h1,
  sub,
  heroStat,
}: {
  eyebrow: string;
  h1: string;
  sub: string;
  heroStat: Stat;
  /** Legacy props — no longer rendered (phone is logo+form, no photo). */
  scene?: PhoneScene;
  image?: string;
}) {
  return (
    <Section className="overflow-hidden pt-28 md:pt-32 lg:pt-36">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16">
          {/* copy */}
          <Reveal className="max-w-[600px]">
            <Kicker>{eyebrow}</Kicker>
            <Display
              as="h1"
              className="text-[clamp(40px,6.2vw,84px)] leading-[0.95]"
            >
              <AccentHeadline text={h1} />
            </Display>
            <Lede className="mt-6 max-w-[44ch]">{sub}</Lede>

            <div className="mt-9 flex">
              <DemoButton size="lg" className="w-full sm:w-auto">
                Book a demo
                <ArrowRight className="size-4" aria-hidden="true" />
              </DemoButton>
            </div>

            <div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-7">
              <div className="flex items-baseline gap-3">
                <span className="tabular text-[34px] font-bold leading-none text-ink">
                  {heroStat.value}
                </span>
                <span className="max-w-[15ch] text-[14px] leading-[1.3] text-gray">
                  {heroStat.label}
                </span>
              </div>
              {heroStat.sub ? (
                <p className="max-w-[26ch] border-l border-line pl-8 text-[13.5px] leading-[1.4] text-gray-2">
                  {heroStat.sub}
                </p>
              ) : null}
            </div>
          </Reveal>

          {/* media: just the dark phone, centered in its column (no photo) */}
          <Reveal delay={120} className="flex justify-center lg:justify-end">
            <PhoneStage />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/* ============================================================
   Coverage marquee + StatStrip
   ============================================================ */

const COVERAGE = [
  "First notice of loss",
  "Claim status",
  "Scheduling & dispatch",
  "Policy service",
  "Certificates of insurance",
  "After-hours overflow",
  "Catastrophe surge",
];

function CoverageMarquee() {
  const row = [...COVERAGE, ...COVERAGE];
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y bg-ink py-3.5"
      style={{ borderColor: "var(--color-line-d)" }}
    >
      <div className="cozmo-marquee flex w-max items-center whitespace-nowrap will-change-transform">
        {row.map((c, i) => (
          <span key={i} className="flex items-center">
            <span className="font-disp text-[15px] font-medium tracking-[-0.01em] text-white/85">
              {c}
            </span>
            <span className="mx-7 text-[11px] text-accent-hi">&#10022;</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes cozmo-marquee { to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: no-preference) {
          .cozmo-marquee { animation: cozmo-marquee 42s linear infinite; }
        }
      `}</style>
    </div>
  );
}

export function StatStrip({
  stats,
  tone = "default",
}: {
  stats: Stat[];
  tone?: Tone;
}) {
  const cols =
    stats.length >= 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-3";
  return (
    <>
      <CoverageMarquee />
      <Section tone={tone}>
        <Container>
          <div className={cn("grid gap-x-6 gap-y-10 sm:gap-x-10", cols)}>
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 70}>
                <div className="border-t border-line pt-5">
                  <div className="tabular text-[clamp(30px,3.4vw,52px)] font-bold leading-[0.95] text-ink">
                    {s.value}
                  </div>
                  <div className="mt-3 font-disp text-[15px] font-medium tracking-[-0.01em] text-ink">
                    {s.label}
                  </div>
                  {s.sub ? (
                    <div className="mt-1.5 text-[13px] leading-[1.45] text-gray">
                      {s.sub}
                    </div>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

/* ============================================================
   ProblemSection
   ============================================================ */

export function ProblemSection({
  eyebrow,
  title,
  pains,
  resolution,
  tone = "default",
}: {
  eyebrow: string;
  title: string;
  pains: Pain[];
  resolution: string;
  tone?: Tone;
}) {
  return (
    <Section tone={tone}>
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />

        <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
          {pains.map((p, i) => (
            <Reveal key={p.title} delay={i * 80} className="border-t border-line pt-7">
              <IconBadge name={p.icon} />
              <h3 className="mt-5 font-disp text-[21px] font-medium tracking-[-0.01em] text-ink">
                {p.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.6] text-gray">{p.body}</p>
            </Reveal>
          ))}
        </div>

        {/* the single accent moment: the resolution, centered */}
        <Reveal delay={140} className="mt-14 border-t border-line pt-12">
          <div className="mx-auto flex max-w-[60ch] flex-col items-center text-center">
            <span
              aria-hidden="true"
              className="mb-5 inline-flex size-10 items-center justify-center rounded-full bg-accent text-white"
            >
              <ArrowRight className="size-4" />
            </span>
            <p className="font-disp text-[22px] font-medium leading-[1.3] tracking-[-0.01em] text-ink md:text-[26px]">
              {resolution}
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/* ============================================================
   SegmentSelector
   ============================================================ */

export function SegmentSelector({
  eyebrow,
  title,
  sub,
  tone = "default",
}: {
  eyebrow: string;
  title: string;
  sub: string;
  tone?: Tone;
}) {
  const segments = [homeowners, contractors, carriers];
  return (
    <Section tone={tone}>
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} sub={sub} />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {segments.map((seg, i) => (
            <Reveal key={seg.slug} delay={i * 80} className="h-full">
              <Link
                href={`/${seg.slug}`}
                className="group flex h-full flex-col rounded-card border border-line bg-paper p-7 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-1 hover:shadow-[0_30px_60px_-34px_rgba(11,11,12,0.45)]"
              >
                <span className="inline-grid size-12 place-items-center rounded-full border border-line text-ink transition-colors duration-300 group-hover:text-accent-text">
                  <Icon name={seg.card.icon} className="size-5" />
                </span>

                <h3 className="mt-6 font-disp text-[24px] font-semibold tracking-[-0.01em] text-ink">
                  {seg.nav}
                </h3>
                <p className="mt-2 text-[13.5px] font-medium leading-[1.4] text-accent-text">
                  {seg.card.tagline}
                </p>
                <p className="mt-3 text-[15px] leading-[1.6] text-gray">
                  {seg.card.blurb}
                </p>

                <ul className="mt-6 space-y-3">
                  {seg.card.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-3 text-[14.5px] leading-[1.45] text-ink"
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-gray-2"
                        aria-hidden="true"
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <span className="mt-auto inline-flex items-center gap-2 pt-7 text-[14px] font-semibold text-ink transition-colors duration-300 group-hover:text-accent-text">
                  Explore {seg.nav}
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ============================================================
   HowItWorks - big ghost numerals over heavy ink rules
   ============================================================ */

export function HowItWorks({
  eyebrow,
  title,
  steps,
  tone = "default",
}: {
  eyebrow: string;
  title: string;
  steps: Step[];
  tone?: Tone;
}) {
  const cols =
    steps.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3";
  return (
    <Section tone={tone}>
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />

        <div className={cn("mt-14 grid gap-x-10 gap-y-12", cols)}>
          {steps.map((st, i) => (
            <Reveal key={st.n} delay={i * 80}>
              <div
                className="border-t-2 pt-6"
                style={{ borderColor: "var(--color-ink)" }}
              >
                <div className="tabular text-[clamp(36px,3.6vw,56px)] font-bold leading-none text-ink/15">
                  {st.n}
                </div>
                <h3 className="mt-4 font-disp text-[20px] font-medium tracking-[-0.01em] text-ink">
                  {st.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.6] text-gray">
                  {st.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ============================================================
   Capabilities
   ============================================================ */

export function Capabilities({
  eyebrow,
  title,
  sub,
  items,
  tone = "default",
}: {
  eyebrow: string;
  title: string;
  sub: string;
  items: Capability[];
  tone?: Tone;
}) {
  return (
    <Section tone={tone}>
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} sub={sub} />

        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c, i) => (
            <Reveal
              key={c.title}
              delay={(i % 3) * 80}
              className="border-t border-line pt-7"
            >
              <IconBadge name={c.icon} />
              <h3 className="mt-5 font-disp text-[19px] font-medium tracking-[-0.01em] text-ink">
                {c.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.6] text-gray">{c.body}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ============================================================
   Integrations
   ============================================================ */

export function Integrations({
  eyebrow,
  title,
  sub,
  items,
  tone = "default",
}: {
  eyebrow: string;
  title: string;
  sub: string;
  items: Integration[];
  tone?: Tone;
}) {
  return (
    <Section tone={tone}>
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} sub={sub} />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <Reveal
              key={it.name}
              delay={(i % 3) * 60}
              className="flex items-center gap-4 rounded-card border border-line bg-paper px-5 py-4 transition-shadow duration-300 hover:shadow-[0_18px_42px_-30px_rgba(11,11,12,0.5)]"
            >
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 place-items-center rounded-full border border-line font-disp text-[15px] font-semibold text-ink"
              >
                {it.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <div className="truncate font-disp text-[15.5px] font-medium tracking-[-0.01em] text-ink">
                  {it.name}
                </div>
                <div className="truncate text-[12.5px] text-gray">
                  {it.category}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ============================================================
   SecuritySection
   ============================================================ */

export function SecuritySection({
  eyebrow,
  title,
  sub,
  items,
  tone = "default",
}: {
  eyebrow: string;
  title: string;
  sub: string;
  items: { icon: string; title: string; body: string }[];
  tone?: Tone;
}) {
  return (
    <Section tone={tone}>
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} sub={sub} />

        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((s, i) => (
            <Reveal
              key={s.title}
              delay={(i % 4) * 70}
              className="border-t border-line pt-7"
            >
              <IconBadge name={s.icon} />
              <h3 className="mt-5 font-disp text-[17px] font-medium tracking-[-0.01em] text-ink">
                {s.title}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.55] text-gray">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ============================================================
   ProofQuote - the ONE dark cinematic band
   ============================================================ */

export function ProofQuote({ proof }: { proof: Proof }) {
  return (
    <Section tone="ink">
      <Container>
        <Reveal>
          <Kicker onDark>In their words</Kicker>
          <figure className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-20">
            <div className="relative">
              <Quote
                className="absolute -left-1 -top-7 size-12 text-accent/30 md:-top-9 md:size-16"
                aria-hidden="true"
              />
              <blockquote className="relative font-disp text-[clamp(22px,2.5vw,34px)] font-semibold leading-[1.22] tracking-[-0.015em] text-paper">
                {proof.quote}
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-px w-8 shrink-0 bg-accent-hi"
                />
                <span className="text-[15px] leading-snug text-white/85">
                  <span className="font-medium text-paper">{proof.name}</span>
                  <span className="text-white/55">
                    , {proof.role} &middot; {proof.org}
                  </span>
                </span>
              </figcaption>
            </div>

            {proof.stat ? (
              <div
                className="shrink-0 border-t pt-6 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0"
                style={{ borderColor: "var(--color-line-d)" }}
              >
                <div className="tabular text-[clamp(48px,5vw,84px)] font-bold leading-none text-accent-hi">
                  {proof.stat.value}
                </div>
                <div className="mt-3 max-w-[22ch] text-[14px] leading-[1.5] text-white/65">
                  {proof.stat.label}
                </div>
                {proof.stat.sub ? (
                  <div className="mt-1.5 max-w-[22ch] text-[13px] leading-[1.45] text-white/45">
                    {proof.stat.sub}
                  </div>
                ) : null}
              </div>
            ) : null}
          </figure>
        </Reveal>
      </Container>
    </Section>
  );
}

/* ============================================================
   Faq
   ============================================================ */

export function Faq({
  eyebrow,
  title,
  faqs,
  tone = "default",
}: {
  eyebrow?: string;
  title: string;
  faqs: FaqItem[];
  tone?: Tone;
}) {
  return (
    <Section tone={tone}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            {eyebrow ? <Kicker>{eyebrow}</Kicker> : null}
            <H2>{title}</H2>
            <p className="mt-6 max-w-[34ch] text-[15px] leading-[1.6] text-gray">
              Still deciding? Email{" "}
              <a
                href={SITE.emailHref}
                className="font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent-text"
              >
                {SITE.email}
              </a>{" "}
              and a human answers.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <div className="border-t border-line">
              {faqs.map((f, idx) => (
                <details
                  key={f.q}
                  className="group relative border-b border-line"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-300 group-open:scale-y-100"
                  />
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-start gap-4">
                      <span className="tabular mt-1 text-[13px] font-semibold text-accent-text">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="font-disp text-[19px] font-medium leading-snug tracking-[-0.01em] text-ink transition-colors group-hover:text-accent-text md:text-[22px]">
                        {f.q}
                      </span>
                    </span>
                    <Plus
                      className="mt-1.5 size-5 shrink-0 text-gray transition-all duration-300 group-open:rotate-45 group-open:text-accent"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="max-w-[64ch] pb-7 pl-[2.6rem] pr-8 text-[15px] leading-[1.7] text-gray">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/* ============================================================
   DemoSection
   ============================================================ */

export function DemoSection({
  eyebrow,
  title,
  sub,
  tone = "default",
}: {
  eyebrow: string;
  title: string;
  sub: string;
  tone?: Tone;
}) {
  return (
    <Section id="demo" tone={tone}>
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} sub={sub} align="center" />

        {/* just the phone to call + a button to book a demo, centered */}
        <div className="mt-14 flex flex-col items-center">
          <Reveal className="flex justify-center">
            <PhoneStage />
          </Reveal>

          <Reveal delay={80} className="mt-10 flex flex-col items-center gap-4">
            <DemoButton size="lg">
              Book a demo
              <ArrowRight className="size-4" aria-hidden="true" />
            </DemoButton>
            <p className="flex items-center gap-2 text-[14px] text-gray">
              <Phone className="size-4 text-accent-text" aria-hidden="true" />
              Or dial{" "}
              <a
                href={SITE.demoPhoneHref}
                className="tabular font-medium text-ink underline decoration-line underline-offset-4 hover:text-accent-text"
              >
                {SITE.demoPhone}
              </a>
            </p>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
