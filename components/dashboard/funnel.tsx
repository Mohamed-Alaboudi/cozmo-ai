import { ArrowRight } from "lucide-react";
import type { FunnelStep } from "@/lib/dashboard/data";
import { cn } from "@/lib/cn";

/**
 * The outbound funnel — the centerpiece of the Overview. Each stage is a row
 * with a proportional bar (width = count / top-of-funnel), a tabular count, and
 * the step-over-step conversion. Pure server render off real DB counts.
 *
 * Accent is rationed to the two "money" stages (Replied, Demo booked); upstream
 * stages use a graduated ink fill so the eye reads left-to-right narrowing.
 */

const ACCENT_STAGES = new Set(["replied", "demo"]);

function barColor(stage: string, ratio: number): string {
  if (ACCENT_STAGES.has(stage)) return "var(--color-accent)";
  // Ink that lightens as the funnel narrows — keeps the wall of bars legible.
  const alpha = 0.20 + 0.55 * ratio;
  return `rgba(11,11,12,${alpha.toFixed(3)})`;
}

export function Funnel({ steps }: { steps: FunnelStep[] }) {
  const top = Math.max(steps[0]?.count ?? 0, 1);

  return (
    <div className="flex flex-col gap-2.5">
      {steps.map((step, i) => {
        const ratio = step.count / top;
        const widthPct = Math.max(ratio * 100, step.count > 0 ? 4 : 1.5);
        const prev = steps[i - 1];
        const conv =
          prev && prev.count > 0
            ? Math.round((step.count / prev.count) * 100)
            : null;
        const isAccent = ACCENT_STAGES.has(step.key);

        return (
          <div key={step.key} className="grid grid-cols-[148px_1fr_auto] items-center gap-4">
            {/* label */}
            <div className="flex items-center gap-2.5">
              <span className="tabular w-5 text-right text-[12px] font-semibold text-gray-2">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "truncate font-disp text-[14px] font-medium tracking-[-0.01em]",
                  isAccent ? "text-accent-text" : "text-ink",
                )}
              >
                {step.label}
              </span>
            </div>

            {/* bar track */}
            <div className="relative h-9 overflow-hidden rounded-[8px] bg-ink/[0.035]">
              <div
                className="flex h-full items-center rounded-[8px] px-3 transition-[width] duration-700"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: barColor(step.key, ratio),
                  transitionTimingFunction: "cubic-bezier(.16,1,.3,1)",
                }}
              >
                <span className="tabular text-[13px] font-bold leading-none text-white mix-blend-luminosity">
                  {step.count}
                </span>
              </div>
            </div>

            {/* conversion vs previous */}
            <div className="w-[88px] text-right">
              {conv != null ? (
                <span className="tabular inline-flex items-center gap-1 text-[12px] font-medium text-gray">
                  <ArrowRight className="size-3 text-gray-2" aria-hidden="true" />
                  {conv}%
                </span>
              ) : (
                <span className="text-[12px] text-gray-2">·</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
