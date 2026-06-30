import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Tasteful empty state. Reads as "this pipeline stage hasn't produced rows yet"
 * rather than "broken" — important because the seeded demo has 0 messages/calls
 * until the outbound automation runs.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  compact = false,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-10" : "py-16",
        className,
      )}
    >
      {Icon ? (
        <span className="mb-4 grid size-12 place-items-center rounded-full border border-line text-gray-2">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      ) : null}
      <p className="font-disp text-[17px] font-medium tracking-[-0.01em] text-ink">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-[42ch] text-[14px] leading-[1.5] text-gray">{description}</p>
      ) : null}
    </div>
  );
}
