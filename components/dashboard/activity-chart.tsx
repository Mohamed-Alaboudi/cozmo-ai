"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ActivityDay } from "@/lib/dashboard/data";

/**
 * Stacked activity-over-time chart (recharts → "use client"). Series map to the
 * funnel's color language: ink for scrape/enrich, accent for outreach, deeper
 * accent for calls/demos. Tooltip + axes styled on Cozmo tokens, no chart
 * library chrome (no legend box, hairline grid only).
 */

const SERIES: { key: keyof ActivityDay; label: string; color: string }[] = [
  { key: "scraped", label: "Scraped", color: "rgba(11,11,12,0.55)" },
  { key: "enriched", label: "Enriched", color: "rgba(11,11,12,0.30)" },
  { key: "outreach", label: "Outreach", color: "#d96a2c" },
  { key: "calls", label: "Calls", color: "#a84b17" },
  { key: "demos", label: "Demos", color: "#3c7a43" },
];

type TooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ name?: string; value?: number; color?: string; dataKey?: string | number }>;
};

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((p) => (p.value ?? 0) > 0);
  return (
    <div className="rounded-[10px] border border-line bg-paper px-3 py-2 shadow-[0_18px_42px_-28px_rgba(11,11,12,0.5)]">
      <p className="mb-1 font-disp text-[12px] font-semibold tracking-[-0.01em] text-ink">
        {label}
      </p>
      {rows.length === 0 ? (
        <p className="text-[12px] text-gray-2">No activity</p>
      ) : (
        rows.map((p) => (
          <p key={String(p.dataKey)} className="flex items-center gap-2 text-[12px] text-gray">
            <span
              aria-hidden="true"
              className="inline-block size-2 rounded-[2px]"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-ink">{p.name}</span>
            <span className="tabular ml-auto pl-3 font-medium text-ink">{p.value}</span>
          </p>
        ))
      )}
    </div>
  );
}

export function ActivityChart({ data }: { data: ActivityDay[] }) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 6, bottom: 0, left: -18 }}>
          <defs>
            {SERIES.map((s) => (
              <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="rgba(11,11,12,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#9a9aa1", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(11,11,12,0.10)" }}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis
            tick={{ fill: "#9a9aa1", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={34}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(11,11,12,0.12)" }} />
          {SERIES.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stackId="1"
              stroke={s.color}
              strokeWidth={1.5}
              fill={`url(#fill-${s.key})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
