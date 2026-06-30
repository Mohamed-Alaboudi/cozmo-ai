import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Section rhythm. tone="surface" = warm off-white band; tone="ink" = the
 * dark "cinematic" band (white text on near-black).
 */
export function Section({
  children,
  className,
  tone = "default",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "surface" | "ink";
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-28 py-20 md:py-28",
        tone === "surface" && "bg-paper-2",
        tone === "ink" && "bg-ink text-paper",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Wide centered container with fluid page margins (max 1500px). */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("shell", className)}>{children}</div>;
}

/** Accent uppercase eyebrow. */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn("eyebrow mb-5", className)}>{children}</p>;
}

/** Heavy Space Grotesk display headline (hero as="h1", openers as="h2"). */
export function Display({
  children,
  className,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  return <Tag className={cn("display", className)}>{children}</Tag>;
}

/** Default section heading. */
export function H2({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "display max-w-[20ch] text-[clamp(30px,3.8vw,54px)]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function Lede({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn("max-w-[56ch] text-[18px] leading-[1.62] text-gray", className)}
    >
      {children}
    </p>
  );
}
