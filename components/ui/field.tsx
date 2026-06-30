import type { InputHTMLAttributes, LabelHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-gray",
        className,
      )}
      {...props}
    />
  );
}

const fieldBase =
  "w-full rounded-field border border-line bg-paper px-3.5 text-ink placeholder:text-gray-2 transition-colors focus:border-accent focus:outline-none focus:[box-shadow:0_0_0_3px_rgba(217,106,44,0.18)]";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, "h-12", className)} {...props} />;
}
