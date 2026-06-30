import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  neutral: "border-line bg-ink/[0.04] text-gray",
  accent: "border-accent/25 bg-accent/[0.08] text-accent-text",
  success: "border-[rgba(60,122,67,0.25)] bg-[rgba(60,122,67,0.08)] text-[#3c7a43]",
  info: "border-line bg-ink/[0.04] text-ink",
} as const;

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
