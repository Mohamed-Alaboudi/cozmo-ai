"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/ui/logo";
import { LinkButton } from "@/components/ui/button";
import { NAV_LINKS, SITE } from "@/lib/site";
import { cn } from "@/lib/cn";

/** Signature easing - soft, fast-out / slow-settle. */
const EASE = "cubic-bezier(.16,1,.3,1)";

/**
 * Floating pill nav. Transparent over the page at the top; on scroll past
 * ~12px it condenses into a glass pill (shrinks to ~1080px, white/80 +
 * backdrop blur + hairline + soft shadow). Wordmark left, segment links with
 * an active accent, a primary "Book a demo" CTA, and a mobile burger sheet.
 */
export function Nav() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  // Solidify the pill once the page leaves the very top.
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock the page behind the mobile sheet while it is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-[60]"
      style={{
        paddingBlock: solid ? 11 : 18,
        paddingInline: solid ? "clamp(14px,3vw,30px)" : "var(--mgn)",
        transition: `padding .5s ${EASE}`,
      }}
    >
      <div
        className={cn(
          "pointer-events-auto relative z-[2] mx-auto flex items-center gap-[clamp(12px,2vw,26px)] rounded-full border",
          solid
            ? "border-hair bg-white/80 backdrop-blur-md backdrop-saturate-150"
            : "border-transparent bg-transparent",
        )}
        style={{
          maxWidth: solid ? 1080 : "var(--maxw)",
          height: solid ? 54 : 56,
          paddingLeft: solid ? 24 : 0,
          paddingRight: solid ? 8 : 0,
          boxShadow: solid ? "0 18px 46px -24px rgba(11,11,12,.45)" : "none",
          transition: `max-width .55s ${EASE}, height .45s ${EASE}, padding .5s ${EASE}, background .4s ${EASE}, border-color .4s ${EASE}, box-shadow .4s ${EASE}`,
        }}
      >
        <Wordmark className="mr-auto" />

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-11 items-center rounded-full px-4 text-[14px] font-medium transition-colors duration-200",
                  active ? "text-accent-text" : "text-ink/80 hover:text-accent-text",
                )}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-x-4 bottom-[7px] h-[2px] origin-left rounded-full bg-accent transition-transform duration-300",
                    active ? "scale-x-100" : "scale-x-0",
                  )}
                  style={{ transitionTimingFunction: EASE }}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA - the one accent pill → HubSpot scheduler */}
        <LinkButton
          href={SITE.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="accent"
          className="hidden md:inline-flex"
        >
          Book a demo
        </LinkButton>

        {/* Mobile burger */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-white/60 text-ink backdrop-blur-md transition-colors hover:text-accent-text md:hidden"
        >
          {open ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile sheet - slides down from the top */}
      <div
        id="mobile-nav"
        className={cn(
          "absolute inset-x-0 top-0 z-[1] md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        style={{
          transform: open ? "translateY(0)" : "translateY(-102%)",
          transition: `transform .55s ${EASE}`,
        }}
      >
        <div className="border-b border-hair bg-white/95 px-[clamp(22px,6vw,42px)] pb-8 pt-24 backdrop-blur-xl">
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-[56px] items-center border-b border-hair font-disp text-[23px] font-medium tracking-[-0.015em] transition-colors",
                    active ? "text-accent-text" : "text-ink hover:text-accent-text",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <LinkButton
              href={SITE.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="accent"
              size="lg"
              className="mt-7 w-full"
              onClick={() => setOpen(false)}
            >
              Book a demo
            </LinkButton>
          </nav>
        </div>
      </div>
    </header>
  );
}
