"use client";

import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { Wifi } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * iPhone-style chrome - a clean DARK device that sits on the light page.
 * Renders {children} as the screen. Tilts subtly to the pointer.
 */
export function PhoneFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  function onMove(e: ReactPointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -py * 4, ry: px * 4 });
  }

  function onLeave() {
    setTilt({ rx: 0, ry: 0 });
  }

  return (
    <div className={cn("[perspective:1700px]", className)}>
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative mx-auto w-[300px] transition-transform duration-300 ease-out [transform-style:preserve-3d] motion-reduce:!transform-none sm:w-[330px]"
        style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
      >
        {/* bezel */}
        <div className="relative rounded-[3.3rem] bg-gradient-to-b from-neutral-800 to-neutral-950 p-2.5 shadow-[0_50px_90px_-30px_rgba(11,11,12,0.55)]">
          {/* screen */}
          <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.7rem] bg-[#0c0c0e]">
            {/* status bar */}
            <div className="absolute inset-x-0 top-0 z-20 flex h-12 items-center justify-between px-7 pt-2.5 text-white">
              <span className="tabular text-[13px] font-semibold">9:41</span>
              {/* dynamic island */}
              <div className="absolute left-1/2 top-2.5 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
              <div className="flex items-center gap-1.5">
                <span className="flex items-end gap-0.5" aria-hidden="true">
                  <span className="h-1.5 w-0.5 rounded-sm bg-white" />
                  <span className="h-2 w-0.5 rounded-sm bg-white" />
                  <span className="h-2.5 w-0.5 rounded-sm bg-white" />
                  <span className="h-3 w-0.5 rounded-sm bg-white/40" />
                </span>
                <Wifi className="size-3.5" />
                <span className="ml-0.5 flex h-3 w-6 items-center rounded-[3px] border border-white/50 p-px">
                  <span className="block h-full w-2/3 rounded-[1px] bg-white" />
                </span>
              </div>
            </div>

            {/* screen content */}
            <div className="relative z-10 h-full pt-12">{children}</div>

            {/* faint top sheen */}
            <div
              className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
