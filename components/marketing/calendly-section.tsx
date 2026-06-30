"use client";

import { useEffect, useRef, useState } from "react";
import { InlineWidget } from "react-calendly";
import { CalendarDays } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/cn";

/** Reserved height so the band never reflows when the widget mounts. */
const RESERVE = 700;

/**
 * Calendly inline scheduler, re-themed light. Mounts only when it nears the
 * viewport (IntersectionObserver, once). Falls back to a light email CTA card
 * when no Calendly URL is configured, so the demo band always works.
 */
export function CalendlySection({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const hasCalendly = Boolean(SITE.calendlyUrl);

  useEffect(() => {
    if (!hasCalendly) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setMounted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasCalendly]);

  if (!hasCalendly) {
    return (
      <div
        className={cn(
          "flex min-h-[700px] flex-col items-start justify-center rounded-card border border-line bg-paper p-8 md:p-10",
          className,
        )}
      >
        <span className="inline-flex size-12 items-center justify-center rounded-field bg-accent/10 text-accent">
          <CalendarDays className="size-6" aria-hidden="true" />
        </span>
        <h3 className="mt-6 font-disp text-[clamp(24px,2.4vw,32px)] font-bold leading-[1.02] tracking-[-0.02em] text-ink">
          Grab time with us
        </h3>
        <p className="mt-4 max-w-[40ch] text-[16px] font-light leading-[1.6] text-gray">
          Pick a slot and we&apos;ll walk you through Cozmo answering live
          insurance calls, wired into your stack.
        </p>
        <LinkButton
          href={SITE.emailHref}
          variant="accent"
          size="lg"
          className="mt-8"
        >
          Email to schedule
        </LinkButton>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden rounded-card border border-line bg-paper",
        className,
      )}
      style={{ minHeight: RESERVE }}
    >
      {mounted ? (
        <InlineWidget
          url={SITE.calendlyUrl}
          styles={{ height: `${RESERVE}px`, minWidth: "320px" }}
          pageSettings={{
            backgroundColor: "ffffff",
            primaryColor: "d96a2c",
            textColor: "0b0b0c",
            hideEventTypeDetails: false,
            hideLandingPageDetails: false,
            hideGdprBanner: true,
          }}
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex items-center justify-center text-gray-2"
          style={{ height: RESERVE }}
        >
          <CalendarDays className="size-6 animate-pulse" />
        </div>
      )}
    </div>
  );
}
