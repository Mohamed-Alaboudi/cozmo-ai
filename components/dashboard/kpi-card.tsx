import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Headline metric card for the Overview. Hairline surface, Space Grotesk
 * tabular figure, small ink icon chip, optional accent emphasis for the one
 * "hero" KPI per row. Stays on Cozmo tokens (no shadcn).
 */
export function KpiCard({
  label,
  value,
  suffix,
  hint,
  icon: Icon,
  accent = false,
  className,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  hint?: string;
  icon?: LucideIcon;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between rounded-card border p-5 transition-shadow duration-300",
        accent ? "bg-accent/[0.04]" : "bg-paper hover:shadow-[0_18px_42px_-32px_rgba(11,11,12,0.4)]",
        className,
      )}
      style={accent ? { borderColor: "rgba(217,106,44,0.30)" } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-gray">
          {label}
        </span>
        {Icon ? (
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-full border",
              accent ? "text-accent-text" : "text-ink",
            )}
            style={{ borderColor: accent ? "rgba(217,106,44,0.30)" : "var(--color-line)" }}
          >
            <Icon className="size-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex items-baseline gap-1.5">
        <span
          className={cn(
            "tabular text-[clamp(30px,3.4vw,42px)] font-bold leading-none",
            accent ? "text-accent-text" : "text-ink",
          )}
        >
          {value}
        </span>
        {suffix ? (
          <span className="tabular text-[18px] font-semibold leading-none text-gray-2">
            {suffix}
          </span>
        ) : null}
      </div>

      {hint ? <p className="mt-2 text-[12.5px] leading-[1.4] text-gray">{hint}</p> : null}
    </div>
  );
}
