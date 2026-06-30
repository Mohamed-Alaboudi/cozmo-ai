import type { Metadata } from "next";
import { Send, MailCheck, Reply, Megaphone } from "lucide-react";
import { PageHeader, Panel } from "@/components/dashboard/panel";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusPill, SegmentPill } from "@/components/dashboard/status-pill";
import { RunCampaignButton } from "@/components/dashboard/run-campaign-button";
import { SequenceStepCard } from "@/components/dashboard/sequence-step-card";
import {
  getCampaigns,
  getSequenceSteps,
  getMessages,
  buildCampaignViews,
  type CampaignView,
} from "@/lib/dashboard/data";

export const metadata: Metadata = { title: "Campaigns" };
export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const [campaigns, steps, messages] = await Promise.all([
    getCampaigns(),
    getSequenceSteps(),
    getMessages(),
  ]);

  const views = buildCampaignViews({ campaigns, steps, messages });

  return (
    <>
      <PageHeader
        eyebrow="Sequences"
        title="Campaigns"
        description="Each campaign and its email sequence, with live per-step status counts."
      />

      {views.length > 0 ? (
        <div className="flex flex-col gap-6">
          {views.map((view) => (
            <CampaignCard key={view.campaign.id} view={view} />
          ))}
        </div>
      ) : (
        <Panel>
          <EmptyState
            icon={Megaphone}
            title="No campaigns yet"
            description="Campaigns and their sequences appear here once configured."
          />
        </Panel>
      )}
    </>
  );
}

function CampaignCard({ view }: { view: CampaignView }) {
  const { campaign, steps, totalMessages, sent, replied } = view;
  // Any step still holding draft messages → the primary action sends them.
  const hasDrafts = steps.some((sv) => (sv.counts.draft ?? 0) > 0);

  return (
    <section className="rounded-card border border-line bg-paper">
      {/* header */}
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-disp text-[18px] font-semibold tracking-[-0.01em] text-ink">
              {campaign.name}
            </h2>
            {/* Only call it "active" once it has actually sent something;
                otherwise it's still a draft (nothing has gone out yet). */}
            {sent > 0 ? (
              <StatusPill tone="good">active</StatusPill>
            ) : (
              <StatusPill tone="neutral">draft</StatusPill>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12.5px] text-gray">
            <SegmentPill segment={campaign.segment} />
            <span className="inline-flex items-center gap-1">
              <Send className="size-3 text-gray-2" aria-hidden="true" />
              {campaign.channel}
            </span>
            <span className="text-gray-2">·</span>
            <span className="tabular">{steps.length}-step sequence</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* The "Live"/"Running" indicator now lives inside RunCampaignButton
              and only shows while a run/advance is actually executing. */}
          <RunCampaignButton campaignId={campaign.id} hasDrafts={hasDrafts} />
        </div>
      </header>

      {/* campaign rollup */}
      <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
        <Rollup label="Messages" value={totalMessages} />
        <Rollup label="Sent" value={sent} icon={MailCheck} />
        <Rollup label="Replied" value={replied} icon={Reply} accent />
      </div>

      {/* sequence */}
      <div className="p-5">
        {steps.length > 0 ? (
          <ol className="grid gap-4 md:grid-cols-3">
            {steps.map((sv, i) => (
              <SequenceStepCard key={sv.step.id} view={sv} isLast={i === steps.length - 1} />
            ))}
          </ol>
        ) : (
          <EmptyState
            icon={Send}
            title="No steps configured"
            description="Add sequence steps to this campaign to start sending."
            compact
          />
        )}
      </div>
    </section>
  );
}

function Rollup({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: number;
  icon?: typeof MailCheck;
  accent?: boolean;
}) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-1.5">
        {Icon ? (
          <Icon
            className={accent ? "size-3.5 text-accent-text" : "size-3.5 text-gray-2"}
            aria-hidden="true"
          />
        ) : null}
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray">
          {label}
        </span>
      </div>
      <div
        className={`tabular mt-1 text-[26px] font-bold leading-none ${accent ? "text-accent-text" : "text-ink"}`}
      >
        {value}
      </div>
    </div>
  );
}

