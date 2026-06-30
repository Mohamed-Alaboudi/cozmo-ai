"use client";

import { useMemo, useState } from "react";
import { PhoneCall, FileText, CheckCircle2 } from "lucide-react";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CallStatusPill, StatusPill } from "@/components/dashboard/status-pill";
import { FilterBar, type FilterGroup } from "@/components/dashboard/filter-bar";
import { relativeTime, formatDuration } from "@/lib/dashboard/data";
import type { Call } from "@/lib/db/client";
import { safeExternalHref } from "@/lib/dashboard/safe-url";

/** A call enriched with its account name for display. */
export type CallRow = Call & { accountName: string | null };

function titleize(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CallsTable({ calls }: { calls: CallRow[] }) {
  const [status, setStatus] = useState("all");

  const statuses = useMemo(
    () => Array.from(new Set(calls.map((c) => c.status))),
    [calls],
  );

  const filtered = useMemo(
    () => (status === "all" ? calls : calls.filter((c) => c.status === status)),
    [calls, status],
  );

  const groups: FilterGroup[] = [
    {
      label: "Status",
      value: status,
      onChange: setStatus,
      options: [
        { value: "all", label: "All" },
        ...statuses.map((s) => ({ value: s, label: s === "no_answer" ? "No answer" : titleize(s) })),
      ],
    },
  ];

  const columns: Column<CallRow>[] = [
    {
      key: "account",
      header: "Account",
      width: "minmax(160px,1.3fr)",
      cell: (c) => (
        <span className="truncate font-medium text-ink">
          {c.accountName ?? "Unknown account"}
        </span>
      ),
    },
    {
      key: "trigger",
      header: "Trigger",
      hideBelow: "md",
      cell: (c) => <span className="text-[13px] text-gray">{titleize(c.trigger)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => <CallStatusPill status={c.status} />,
    },
    {
      key: "outcome",
      header: "Outcome",
      hideBelow: "lg",
      width: "minmax(0,1.2fr)",
      cell: (c) =>
        c.outcome ? (
          <span className="line-clamp-1 text-[13px] text-ink">{c.outcome}</span>
        ) : (
          <span className="text-gray-2">—</span>
        ),
    },
    {
      key: "demo",
      header: "Demo",
      align: "center",
      hideBelow: "sm",
      width: "90px",
      cell: (c) =>
        c.demo_booked ? (
          <StatusPill tone="good" dot={false}>
            <CheckCircle2 className="size-3" aria-hidden="true" />
            Yes
          </StatusPill>
        ) : (
          <span className="text-gray-2">—</span>
        ),
    },
    {
      key: "duration",
      header: "Duration",
      align: "right",
      hideBelow: "sm",
      width: "90px",
      cell: (c) => (
        <span className="tabular text-[13px] text-gray">{formatDuration(c.duration_s)}</span>
      ),
    },
    {
      key: "created",
      header: "Created",
      align: "right",
      width: "100px",
      cell: (c) => (
        <span className="tabular text-[12.5px] text-gray">{relativeTime(c.created_at)}</span>
      ),
    },
  ];

  return (
    <div>
      <FilterBar groups={groups} resultCount={filtered.length} totalCount={calls.length} />

      <div className="mt-4 overflow-hidden rounded-card border border-line bg-paper">
        {filtered.length > 0 ? (
          <DataTable
            ariaLabel="Calls"
            columns={columns}
            rows={filtered}
            getRowId={(c) => c.id}
            renderExpanded={(c) => <CallDetail call={c} />}
          />
        ) : (
          <EmptyState
            icon={PhoneCall}
            title={calls.length === 0 ? "No calls yet" : "No calls match this filter"}
            description={
              calls.length === 0
                ? "The phone agent dials accounts after the email sequence runs. Outcomes and transcripts show up here."
                : "Try a different status."
            }
          />
        )}
      </div>
    </div>
  );
}

function CallDetail({ call }: { call: CallRow }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      {/* meta */}
      <div className="rounded-[12px] border border-line bg-paper p-4">
        <h4 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray">
          <PhoneCall className="size-3.5 text-accent-text" aria-hidden="true" />
          Call detail
        </h4>
        <dl className="grid grid-cols-2 gap-y-3 text-[13px]">
          <Meta label="Status">
            <CallStatusPill status={call.status} />
          </Meta>
          <Meta label="Demo booked">
            {call.demo_booked ? (
              <StatusPill tone="good" dot={false}>
                Yes
              </StatusPill>
            ) : (
              <span className="text-gray">No</span>
            )}
          </Meta>
          <Meta label="Duration">
            <span className="tabular text-ink">{formatDuration(call.duration_s)}</span>
          </Meta>
          <Meta label="Trigger">
            <span className="text-ink">{titleize(call.trigger)}</span>
          </Meta>
          {call.to_number ? (
            <Meta label="To">
              <span className="tabular text-ink">{call.to_number}</span>
            </Meta>
          ) : null}
          <Meta label="Created">
            <span className="tabular text-ink">{relativeTime(call.created_at)}</span>
          </Meta>
        </dl>
        {call.outcome ? (
          <p className="mt-3 border-t border-line pt-3 text-[13px] leading-[1.5] text-ink">
            {call.outcome}
          </p>
        ) : null}
        {safeExternalHref(call.recording_url) ? (
          <a
            href={safeExternalHref(call.recording_url)!}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex text-[12.5px] font-medium text-accent-text underline decoration-line underline-offset-2"
            onClick={(e) => e.stopPropagation()}
          >
            Listen to recording
          </a>
        ) : null}
      </div>

      {/* transcript */}
      <div className="rounded-[12px] border border-line bg-paper p-4">
        <h4 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray">
          <FileText className="size-3.5 text-accent-text" aria-hidden="true" />
          Transcript
        </h4>
        {call.transcript ? (
          <p className="max-h-72 overflow-y-auto whitespace-pre-line text-[12.5px] leading-[1.65] text-gray">
            {call.transcript}
          </p>
        ) : (
          <p className="text-[13px] italic text-gray-2">
            No transcript captured for this call.
          </p>
        )}
      </div>
    </div>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.1em] text-gray-2">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}
