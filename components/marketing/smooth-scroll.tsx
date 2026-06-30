"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

/**
 * Lenis smooth-scroll provider. Starts a RAF loop on mount and tears it down
 * on unmount. A no-op when the user prefers reduced motion, so the page falls
 * back to native scrolling.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const lenis = new Lenis({ lerp: 0.1 });
    let frame = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };
    frame = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
