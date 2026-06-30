"use client";

import { useState } from "react";
import { Clock, ArrowRight, ChevronDown } from "lucide-react";
import { MessageStatusPill } from "@/components/dashboard/status-pill";
import { MESSAGE_STATUS_ORDER, type StepView } from "@/lib/dashboard/data";

/**
 * Turn {{merge_tokens}} into styled chips. (Kept in sync with the same helper
 * on the campaigns page; lives here so the card can be a client component.)
 */
function renderTemplate(text: string) {
  const parts = text.split(/(\{\{\s*[\w.]+\s*\}\})/g);
  return parts.map((part, i) => {
    const m = part.match(/^\{\{\s*([\w.]+)\s*\}\}$/);
    if (!m) return <span key={i}>{part}</span>;
    return (
      <span
        key={i}
        className="mx-0.5 inline-flex items-center rounded-[5px] bg-accent/10 px-1.5 py-px font-medium text-accent-text"
        style={{ fontSize: "0.92em" }}
      >
        {m[1]}
      </span>
    );
  });
}

/**
 * A sequence step card. Click (or Enter/Space) to expand it inline and read the
 * full subject + body; click again to collapse.
 */
export function SequenceStepCard({
  view,
  isLast,
}: {
  view: StepView;
  isLast: boolean;
}) {
  const { step, total, counts } = view;
  const [open, setOpen] = useState(false);

  return (
    <li className="relative">
      {/* connector arrow between cards on desktop */}
      {!isLast ? (
        <span
          aria-hidden="true"
          className="absolute -right-3 top-1/2 z-[1] hidden -translate-y-1/2 text-gray-2 md:block"
        >
          <ArrowRight className="size-4" />
        </span>
      ) : null}

      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className="h-full cursor-pointer rounded-[12px] border border-line bg-paper-2/40 p-4 transition-colors hover:border-ink/25 hover:bg-paper-2/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        title={open ? "Click to collapse" : "Click to read the full step"}
      >
        <div className="flex items-center justify-between">
          <span className="tabular inline-flex size-7 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-paper">
            {step.step_no}
          </span>
          <span className="inline-flex items-center gap-2 text-[11.5px] text-gray">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3 text-gray-2" aria-hidden="true" />
              {step.delay_days === 0 ? "Day 0" : `+${step.delay_days}d`}
            </span>
            <ChevronDown
              className={`size-3.5 text-gray-2 transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </span>
        </div>

        <p className="mt-3 text-[13.5px] font-semibold leading-snug text-ink">
          {renderTemplate(step.subject_template || "Untitled step")}
        </p>
        {step.body_template ? (
          <p
            className={`mt-1.5 whitespace-pre-line text-[12.5px] leading-[1.5] text-gray ${open ? "" : "line-clamp-2"}`}
          >
            {renderTemplate(step.body_template)}
          </p>
        ) : null}

        {/* per-step status counts */}
        <div className="mt-3 border-t border-line pt-3">
          {total > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {MESSAGE_STATUS_ORDER.filter((s) => counts[s]).map((s) => (
                <span key={s} className="inline-flex items-center gap-1">
                  <MessageStatusPill status={s} />
                  <span className="tabular text-[11px] font-semibold text-gray-2">
                    {counts[s]}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[12px] italic text-gray-2">No sends yet</p>
          )}
        </div>
      </div>
    </li>
  );
}
