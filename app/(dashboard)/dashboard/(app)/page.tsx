import type { Metadata } from "next";
import {
  Building2,
  Send,
  Gauge,
  PhoneCall,
  CalendarCheck,
  Activity as ActivityIcon,
  TrendingUp,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Funnel } from "@/components/dashboard/funnel";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Panel, PageHeader } from "@/components/dashboard/panel";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusPill } from "@/components/dashboard/status-pill";
import {
  getAccounts,
  getMessages,
  getCalls,
  getActivity,
  buildFunnel,
  buildKpis,
  buildActivitySeries,
} from "@/lib/dashboard/data";
import { dbConfigured } from "@/lib/db/client";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [accounts, messages, calls, activity] = await Promise.all([
    getAccounts(),
    getMessages(),
    getCalls(),
    getActivity(400),
  ]);

  const kpis = buildKpis({ accounts, messages, calls });
  const funnel = buildFunnel({ accounts, messages, calls });
  const series = buildActivitySeries(activity, 14);
  const accountNames = new Map(accounts.map((a) => [a.id, a.name]));
  const recent = activity.slice(0, 15);
  const hasActivity = series.some((d) => d.total > 0);

  return (
    <>
      <PageHeader
        eyebrow="Outbound engine"
        title="Overview"
        description="The live funnel from scrape to booked demo, plus today's activity."
      />

      {!dbConfigured ? (
        <Panel className="mb-6">
          <EmptyState
            icon={ActivityIcon}
            title="Connect Supabase to see live data"
            description="Set NEXT_PUBLIC_SUPABASE_URL and a service-role key in .env.local. The dashboard reads the cozmo schema read-only."
          />
        </Panel>
      ) : null}

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard
          label="Accounts"
          value={kpis.totalAccounts}
          icon={Building2}
          hint="Scraped & enriched"
        />
        <KpiCard
          label="Emails queued"
          value={kpis.emailsQueued}
          icon={Send}
          hint={`${kpis.emailsSent} sent (dry-run)`}
        />
        <KpiCard
          label="Send rate"
          value={kpis.sendRate}
          suffix="%"
          icon={Gauge}
          hint="Sent ÷ drafted"
        />
        <KpiCard
          label="Calls placed"
          value={kpis.callsPlaced}
          icon={PhoneCall}
          hint="Phone follow-ups"
        />
        <KpiCard
          label="Demos booked"
          value={kpis.demosBooked}
          icon={CalendarCheck}
          accent
          hint="From call outcomes"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Funnel + chart */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Panel
          title="Outbound funnel"
          subtitle="Accounts reaching each stage"
          action={
            <StatusPill tone="neutral" dot={false}>
              {kpis.totalAccounts} accounts
            </StatusPill>
          }
        >
          <Funnel steps={funnel} />
        </Panel>

        <Panel
          title="Activity"
          subtitle="Last 14 days"
          action={
            <span className="inline-flex items-center gap-1.5 text-[12px] text-gray">
              <TrendingUp className="size-3.5 text-accent-text" aria-hidden="true" />
              {activity.length} events
            </span>
          }
        >
          {hasActivity ? (
            <ActivityChart data={series} />
          ) : (
            <EmptyState
              icon={ActivityIcon}
              title="No activity in this window"
              description="The engine logs every scrape, send and call here as it runs."
              compact
            />
          )}
        </Panel>
      </div>

      {/* Recent activity feed */}
      <div className="mt-6">
        <Panel title="Recent activity" subtitle="Latest 15 events across the engine">
          {recent.length > 0 ? (
            <ActivityFeed activity={recent} accountNames={accountNames} />
          ) : (
            <EmptyState
              icon={ActivityIcon}
              title="Nothing yet"
              description="As soon as the outbound engine runs, its timeline shows up here."
              compact
            />
          )}
        </Panel>
      </div>
    </>
  );
}
