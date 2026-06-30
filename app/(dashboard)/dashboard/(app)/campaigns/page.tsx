import type { Metadata } from "next";
import {
  Send,
  FlaskConical,
  Radio,
  Clock,
  ArrowRight,
  MailCheck,
  Reply,
  Megaphone,
} from "lucide-react";
import { PageHeader, Panel } from "@/components/dashboard/panel";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusPill, SegmentPill, MessageStatusPill } from "@/components/dashboard/status-pill";
import {
  getCampaigns,
  getSequenceSteps,
  getMessages,
  buildCampaignViews,
  MESSAGE_STATUS_ORDER,
  type CampaignView,
  type StepView,
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
        description="Each outbound campaign and its multi-step email sequence. Per-step status counts update as the engine sends."
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
  const { campaign, steps, totalMessages, sent, replied, sendMode } = view;
  const isLive = sendMode === "live";

  return (
    <section className="rounded-card border border-line bg-paper">
      {/* header */}
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-disp text-[18px] font-semibold tracking-[-0.01em] text-ink">
              {campaign.name}
            </h2>
            <StatusPill tone={campaign.status === "active" ? "good" : "neutral"}>
              {campaign.status}
            </StatusPill>
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

        <div className="flex items-center gap-2">
          <StatusPill tone={isLive ? "good" : "accent"}>
            {isLive ? (
              <Radio className="size-3" aria-hidden="true" />
            ) : (
              <FlaskConical className="size-3" aria-hidden="true" />
            )}
            {isLive ? "Live" : "Dry-run"}
          </StatusPill>
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

function SequenceStepCard({ view, isLast }: { view: StepView; isLast: boolean }) {
  const { step, total, counts } = view;
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

      <div className="h-full rounded-[12px] border border-line bg-paper-2/40 p-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-paper tabular">
            {step.step_no}
          </span>
          <span className="inline-flex items-center gap-1 text-[11.5px] text-gray">
            <Clock className="size-3 text-gray-2" aria-hidden="true" />
            {step.delay_days === 0 ? "Day 0" : `+${step.delay_days}d`}
          </span>
        </div>

        <p className="mt-3 text-[13.5px] font-semibold leading-snug text-ink">
          {step.subject_template || "Untitled step"}
        </p>
        {step.body_template ? (
          <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.5] text-gray">
            {step.body_template}
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
