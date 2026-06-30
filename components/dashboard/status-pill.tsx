import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Semantic status pill on Cozmo tokens.
 *
 * The marketing CSS declares an UNLAYERED `* { border-color: var(--color-line) }`
 * which overrides Tailwind `border-<color>` utilities. So every non-default
 * border color here is applied via inline `style={{ borderColor }}` — that wins
 * the cascade. Fills/text use rgba()s tuned to the brand (ink, accent, a muted
 * green for "good", the bad red token, a slate for neutral/in-flight).
 */

type Tone = "neutral" | "info" | "progress" | "accent" | "good" | "bad" | "muted";

const TONES: Record<Tone, { bg: string; fg: string; border: string; dot: string }> = {
  neutral: { bg: "rgba(11,11,12,0.04)", fg: "#5f5f66", border: "rgba(11,11,12,0.12)", dot: "#9a9aa1" },
  muted: { bg: "rgba(11,11,12,0.03)", fg: "#9a9aa1", border: "rgba(11,11,12,0.10)", dot: "#c7c7cc" },
  info: { bg: "rgba(11,11,12,0.05)", fg: "#0b0b0c", border: "rgba(11,11,12,0.14)", dot: "#0b0b0c" },
  progress: { bg: "rgba(60,95,160,0.08)", fg: "#3a5aa0", border: "rgba(60,95,160,0.22)", dot: "#3a5aa0" },
  accent: { bg: "rgba(217,106,44,0.10)", fg: "#b3531d", border: "rgba(217,106,44,0.28)", dot: "#d96a2c" },
  good: { bg: "rgba(60,122,67,0.09)", fg: "#3c7a43", border: "rgba(60,122,67,0.26)", dot: "#3c7a43" },
  bad: { bg: "rgba(196,90,79,0.10)", fg: "#b14a40", border: "rgba(196,90,79,0.28)", dot: "#c45a4f" },
};

export function StatusPill({
  children,
  tone = "neutral",
  dot = true,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-[3px] text-[12px] font-medium leading-none",
        className,
      )}
      style={{ backgroundColor: t.bg, color: t.fg, borderColor: t.border }}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="inline-block size-[6px] shrink-0 rounded-full"
          style={{ backgroundColor: t.dot }}
        />
      ) : null}
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------------------
 * Status → label + tone maps, kept beside the pill so colors stay consistent
 * across every table and panel in the dashboard.
 * ------------------------------------------------------------------------- */

const MESSAGE_TONE: Record<string, Tone> = {
  draft: "neutral",
  queued: "progress",
  sent: "info",
  opened: "accent",
  replied: "good",
  bounced: "bad",
};

const CALL_TONE: Record<string, Tone> = {
  queued: "neutral",
  dialing: "progress",
  connected: "progress",
  completed: "good",
  no_answer: "muted",
  failed: "bad",
};

const STAGE_TONE: Record<string, Tone> = {
  scraped: "neutral",
  enriched: "info",
  personalized: "progress",
  queued: "progress",
  sent: "info",
  opened: "accent",
  replied: "good",
  called: "accent",
  demo: "good",
};

function titleize(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function MessageStatusPill({ status }: { status: string }) {
  return <StatusPill tone={MESSAGE_TONE[status] ?? "neutral"}>{titleize(status)}</StatusPill>;
}

export function CallStatusPill({ status }: { status: string }) {
  const label = status === "no_answer" ? "No answer" : titleize(status);
  return <StatusPill tone={CALL_TONE[status] ?? "neutral"}>{label}</StatusPill>;
}

export function StagePill({ stage, label }: { stage: string; label: string }) {
  return <StatusPill tone={STAGE_TONE[stage] ?? "neutral"}>{label}</StatusPill>;
}

export function SegmentPill({ segment }: { segment: string }) {
  // Contractor / TPA / Carrier — neutral chips, ink text, no dot (denser tables).
  const label = segment === "tpa" ? "TPA" : titleize(segment);
  return (
    <StatusPill tone="info" dot={false}>
      {label}
    </StatusPill>
  );
}
