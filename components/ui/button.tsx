import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/cn";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-60";

const variants = {
  primary: "bg-ink text-paper hover:bg-ink-2",
  accent: "bg-accent text-white hover:bg-accent-hi",
  secondary: "border border-line text-ink hover:border-ink/40 hover:bg-ink/[0.03]",
  ghost: "text-ink hover:bg-ink/[0.05]",
} as const;

const sizes = {
  md: "h-11 px-5 text-[14px]",
  lg: "h-[54px] px-7 text-[15px]",
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
