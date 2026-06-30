"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { AccountDetail } from "@/components/dashboard/account-detail";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SegmentPill, StagePill } from "@/components/dashboard/status-pill";
import { FilterBar, type FilterGroup } from "@/components/dashboard/filter-bar";
import { relativeTime, STAGE_LABEL, type AccountBundle } from "@/lib/dashboard/data";

/**
 * Contacts CRM table (client). Holds segment/status/search filter state and
 * renders the accessible DataTable whose expanded row is <AccountDetail/>.
 * Bundles arrive fully assembled from the server (serializable).
 */

const SEGMENT_LABEL: Record<string, string> = {
  contractor: "Contractors",
  tpa: "TPAs",
  carrier: "Carriers",
};

export function ContactsTable({ bundles }: { bundles: AccountBundle[] }) {
  const [segment, setSegment] = useState<string>("all");
  const [stage, setStage] = useState<string>("all");
  const [query, setQuery] = useState("");

  // Derive filter options from the data so new segments/stages appear automatically.
  const segments = useMemo(
    () => Array.from(new Set(bundles.map((b) => b.account.segment))).sort(),
    [bundles],
  );
  const stages = useMemo(
    () => Array.from(new Set(bundles.map((b) => b.stage))),
    [bundles],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bundles.filter((b) => {
      if (segment !== "all" && b.account.segment !== segment) return false;
      if (stage !== "all" && b.stage !== stage) return false;
      if (q) {
        const hay = `${b.account.name} ${b.account.domain ?? ""} ${b.account.hq_city ?? ""} ${b.account.hq_state ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [bundles, segment, stage, query]);

  const groups: FilterGroup[] = [
    {
      label: "Segment",
      value: segment,
      onChange: setSegment,
      options: [
        { value: "all", label: "All" },
        ...segments.map((s) => ({ value: s, label: SEGMENT_LABEL[s] ?? s })),
      ],
    },
    {
      label: "Status",
      value: stage,
      onChange: setStage,
      options: [
        { value: "all", label: "All" },
        ...stages.map((s) => ({ value: s, label: STAGE_LABEL[s] ?? s })),
      ],
    },
  ];

  const columns: Column<AccountBundle>[] = [
    {
      key: "name",
      header: "Account",
      width: "minmax(180px,1.4fr)",
      cell: (b) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-ink">{b.account.name}</div>
          {b.account.domain ? (
            <div className="truncate text-[12px] text-gray-2">{b.account.domain}</div>
          ) : null}
        </div>
      ),
    },
    {
      key: "segment",
      header: "Segment",
      cell: (b) => <SegmentPill segment={b.account.segment} />,
    },
    {
      key: "mapped",
      header: "Mapped page",
      hideBelow: "md",
      cell: (b) =>
        b.account.mapped_page ? (
          <span className="text-[13px] text-gray">/{b.account.mapped_page}</span>
        ) : (
          <span className="text-gray-2">—</span>
        ),
    },
    {
      key: "rank",
      header: "Rank",
      align: "center",
      hideBelow: "sm",
      width: "70px",
      cell: (b) =>
        b.account.rank != null ? (
          <span className="tabular text-[13px] font-medium text-ink">#{b.account.rank}</span>
        ) : (
          <span className="text-gray-2">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (b) => <StagePill stage={b.stage} label={b.stageLabel} />,
    },
    {
      key: "last",
      header: "Last activity",
      align: "right",
      hideBelow: "lg",
      cell: (b) => (
        <span className="tabular text-[12.5px] text-gray">{relativeTime(b.lastActivity)}</span>
      ),
    },
  ];

  return (
    <div>
      <FilterBar
        groups={groups}
        search={{ value: query, onChange: setQuery, placeholder: "Search accounts…", icon: Search }}
        resultCount={filtered.length}
        totalCount={bundles.length}
      />

      <div className="mt-4 overflow-hidden rounded-card border border-line bg-paper">
        {filtered.length > 0 ? (
          <DataTable
            ariaLabel="Accounts"
            columns={columns}
            rows={filtered}
            getRowId={(b) => b.account.id}
            renderExpanded={(b) => <AccountDetail bundle={b} />}
          />
        ) : (
          <EmptyState
            icon={Users}
            title={bundles.length === 0 ? "No accounts yet" : "No accounts match these filters"}
            description={
              bundles.length === 0
                ? "Once the scraper imports insurance contractors and TPAs, they appear here."
                : "Try clearing the segment or status filter."
            }
          />
        )}
      </div>
    </div>
  );
}
