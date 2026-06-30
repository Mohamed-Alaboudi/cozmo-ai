import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Standard dashboard surface — a hairline card tuned for dense data (lighter
 * padding than the marketing `Card`). `title`/`action` render an optional
 * header row separated by a hairline.
 */
export function Panel({
  children,
  title,
  subtitle,
  action,
  className,
  bodyClassName,
  padded = true,
}: {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  padded?: boolean;
}) {
  return (
    <section className={cn("rounded-card border border-line bg-paper", className)}>
      {title || action ? (
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            {title ? (
              <h2 className="font-disp text-[16px] font-semibold tracking-[-0.01em] text-ink">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-0.5 text-[13px] leading-[1.4] text-gray">{subtitle}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn(padded && "p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Page title block: eyebrow + display heading + optional lede, dashboard-scaled. */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-accent-text">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="display text-[clamp(26px,3vw,38px)]">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-[60ch] text-[15px] leading-[1.55] text-gray">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
