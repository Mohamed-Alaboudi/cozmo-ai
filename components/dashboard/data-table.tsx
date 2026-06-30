"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Generic, accessible data table with optional expandable rows.
 *
 * - Header + body on Cozmo hairlines (no zebra; hover tint instead).
 * - Expandable rows are real `role="button"` controls: Enter/Space toggles,
 *   Escape collapses, `aria-expanded` + `aria-controls` wired to the panel.
 * - Expansion content is supplied per-row via `renderExpanded`; when omitted
 *   rows are inert (plain display rows).
 * - Column `cell` receives the row; `align`/`width`/`hideBelow` control layout.
 *
 * Client component because expand/collapse is interactive state.
 */

export type Column<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  /** CSS width for the column (e.g. "120px", "minmax(0,1fr)"). */
  width?: string;
  /** Hide this column below a breakpoint, e.g. "md" → hidden until md. */
  hideBelow?: "sm" | "md" | "lg";
  className?: string;
};

const HIDE_CLASS: Record<NonNullable<Column<unknown>["hideBelow"]>, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

const ALIGN_CLASS = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  renderExpanded,
  ariaLabel,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  renderExpanded?: (row: T) => ReactNode;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const expandable = Boolean(renderExpanded);
  const colCount = columns.length + (expandable ? 1 : 0);

  function toggle(id: string) {
    setOpen((cur) => (cur === id ? null : id));
  }

  function onKey(e: KeyboardEvent<HTMLTableRowElement>, id: string) {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      toggle(id);
    } else if (e.key === "Escape" && open === id) {
      e.preventDefault();
      setOpen(null);
      e.currentTarget.focus();
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left" aria-label={ariaLabel}>
        <thead>
          <tr className="border-b border-line">
            {expandable ? <th className="w-9" aria-hidden="true" /> : null}
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray",
                  ALIGN_CLASS[col.align ?? "left"],
                  col.hideBelow && HIDE_CLASS[col.hideBelow],
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = getRowId(row);
            const isOpen = open === id;
            const panelId = `row-panel-${id}`;
            return (
              <RowGroup
                key={id}
                isOpen={isOpen}
                expandable={expandable}
                panelId={panelId}
                colCount={colCount}
                onToggle={() => toggle(id)}
                onKey={(e) => onKey(e, id)}
                expandedContent={renderExpanded?.(row)}
              >
                {expandable ? (
                  <td className="pl-3 align-middle">
                    <span
                      className={cn(
                        "grid size-6 place-items-center rounded-full border border-line text-gray transition-transform duration-300",
                        isOpen && "rotate-180 text-accent-text",
                      )}
                      style={{ transitionTimingFunction: "cubic-bezier(.16,1,.3,1)" }}
                    >
                      <ChevronDown className="size-3.5" aria-hidden="true" />
                    </span>
                  </td>
                ) : null}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-3 py-3.5 align-middle text-[14px] text-ink",
                      ALIGN_CLASS[col.align ?? "left"],
                      col.hideBelow && HIDE_CLASS[col.hideBelow],
                      col.className,
                    )}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </RowGroup>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** A display row + its (conditionally rendered) expansion panel row. */
function RowGroup({
  children,
  expandedContent,
  isOpen,
  expandable,
  panelId,
  colCount,
  onToggle,
  onKey,
}: {
  children: ReactNode;
  expandedContent?: ReactNode;
  isOpen: boolean;
  expandable: boolean;
  panelId: string;
  colCount: number;
  onToggle: () => void;
  onKey: (e: KeyboardEvent<HTMLTableRowElement>) => void;
}) {
  return (
    <>
      <tr
        {...(expandable
          ? {
              role: "button",
              tabIndex: 0,
              "aria-expanded": isOpen,
              "aria-controls": panelId,
              onClick: onToggle,
              onKeyDown: onKey,
            }
          : {})}
        className={cn(
          "border-b border-hair transition-colors",
          expandable && "cursor-pointer outline-none hover:bg-ink/[0.025] focus-visible:bg-accent/[0.05]",
          isOpen && "bg-accent/[0.03]",
        )}
      >
        {children}
      </tr>
      {expandable && isOpen ? (
        <tr id={panelId}>
          <td colSpan={colCount} className="border-b border-line bg-paper-2/60 p-0">
            <div className="animate-[dashExpand_.32s_cubic-bezier(.16,1,.3,1)] px-4 py-5 sm:px-6">
              {expandedContent}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
