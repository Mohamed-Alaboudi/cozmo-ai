import Link from "next/link";
import { cn } from "@/lib/cn";

/** Optional voice-signal mark (kept available; the wordmark is text-only by default). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("size-5", className)}
      aria-hidden="true"
    >
      <circle cx="7.5" cy="12" r="2.5" fill="currentColor" />
      <path
        d="M12.8 8.4a6 6 0 0 1 0 7.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16.4 5.6a10.5 10.5 0 0 1 0 12.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

/** Brand wordmark: the real Cozmo logo image, linked home. */
export function Wordmark({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="Cozmo home"
      className={cn("inline-flex items-center", className)}
    >
      {/* Logo art is solid black on transparent: keep it black on light surfaces, invert to white on dark ones. */}
      <img
        src="/brand/cozmo-logo.png"
        alt="Cozmo AI"
        className={cn("h-6 w-auto", onDark && "[filter:invert(1)]")}
      />
    </Link>
  );
}
