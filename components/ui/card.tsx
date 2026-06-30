import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Light surface card. `accent` tints the one highlighted card per view;
 * `glass` is a slightly elevated white card. Default is a hairline card.
 */
export function Card({
  children,
  className,
  accent = false,
  glass = false,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
  glass?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-card p-6 md:p-8",
        accent
          ? "border border-accent/30 bg-accent/[0.04]"
          : glass
            ? "border border-line bg-paper shadow-[0_24px_60px_-32px_rgba(11,11,12,0.35)]"
            : "border border-line bg-paper",
        className,
      )}
    >
      {children}
    </div>
  );
}
