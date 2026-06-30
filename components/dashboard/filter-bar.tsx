"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Filter bar: one or more segmented toggle groups + an optional search box.
 * Pill toggles on Cozmo tokens (accent fill on the active option). Controlled.
 */

export type FilterOption = { value: string; label: string };

export type FilterGroup = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
};

export function FilterBar({
  groups,
  search,
  resultCount,
  totalCount,
}: {
  groups: FilterGroup[];
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: LucideIcon;
  };
  resultCount?: number;
  totalCount?: number;
}) {
  const SearchIcon = search?.icon;
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      {groups.map((group) => (
        <div key={group.label} className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-2">
            {group.label}
          </span>
          <div className="inline-flex items-center gap-1 rounded-full border border-line bg-paper p-1">
            {group.options.map((opt) => {
              const active = group.value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => group.onChange(opt.value)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                    active
                      ? "bg-ink text-paper"
                      : "text-gray hover:bg-ink/[0.04] hover:text-ink",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {search ? (
        <div className="relative lg:ml-auto lg:w-[260px]">
          {SearchIcon ? (
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-2"
              aria-hidden="true"
            />
          ) : null}
          <input
            type="search"
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder}
            aria-label={search.placeholder ?? "Search"}
            className={cn(
              "h-10 w-full rounded-full border border-line bg-paper text-[13.5px] text-ink placeholder:text-gray-2 transition-colors focus:border-accent focus:outline-none focus:[box-shadow:0_0_0_3px_rgba(217,106,44,0.16)]",
              SearchIcon ? "pl-9 pr-3.5" : "px-3.5",
            )}
          />
        </div>
      ) : null}

      {resultCount != null && totalCount != null ? (
        <span className="text-[12px] text-gray-2 lg:ml-1">
          <span className="tabular font-medium text-gray">{resultCount}</span>
          {resultCount !== totalCount ? (
            <span className="tabular"> / {totalCount}</span>
          ) : null}{" "}
          shown
        </span>
      ) : null}
    </div>
  );
}
