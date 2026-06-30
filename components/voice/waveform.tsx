"use client";

import { useEffect, useRef } from "react";

/**
 * Pure-canvas gold→orange "Siri" ribbon. No audio - it fakes an active
 * call. Center-peaked envelope, livelier when `speaking`. Honors
 * reduced-motion (draws one static frame). Decorative (aria-hidden).
 */
export function Waveform({
  className,
  bars = 48,
  speaking = true,
}: {
  className?: string;
  bars?: number;
  speaking?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Non-null aliases so the narrowing survives into the nested closures.
    const el: HTMLCanvasElement = canvas;
    const ctx: CanvasRenderingContext2D = context;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let t = 0;
    let w = 0;
    let h = 0;

    function resize() {
      const parent = el.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      el.width = w * dpr;
      el.height = h * dpr;
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const mid = h / 2;
      const gap = w / bars;
      const barW = Math.max(2, gap * 0.42);

      for (let i = 0; i < bars; i++) {
        const env = Math.sin((i / (bars - 1)) * Math.PI);
        const wobble = speaking
          ? 0.35 + 0.65 * Math.abs(Math.sin(i * 0.5 + t))
          : 0.18 + 0.12 * Math.abs(Math.sin(i * 0.4 + t * 0.4));
        const amp = env * wobble * (h * 0.42);
        const x = i * gap + gap / 2;
        const top = mid - amp;
        const bot = mid + amp;

        const grad = ctx.createLinearGradient(0, top, 0, bot);
        grad.addColorStop(0, "rgba(240, 132, 63, 0.95)");
        grad.addColorStop(0.5, "#d96a2c");
        grad.addColorStop(1, "rgba(168, 75, 23, 0.55)");
        ctx.fillStyle = grad;

        const r = barW / 2;
        ctx.beginPath();
        ctx.roundRect(x - r, top, barW, Math.max(barW, bot - top), r);
        ctx.fill();
      }

      if (!reduce) {
        t += speaking ? 0.12 : 0.05;
        raf = requestAnimationFrame(draw);
      }
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [bars, speaking]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
