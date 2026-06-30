/**
 * Seed the two premade Cozmo campaigns + their sequence steps. Idempotent:
 * upserts by (name) so re-running won't duplicate.
 *
 *   1) Email campaign  — 3-step sequence (intro / value / break-up), merge tokens
 *      {{company}}, {{first_name}}, {{fit_reason}}, {{mapped_page}}.
 *   2) Calling campaign — 1 step; calls run through the existing ElevenLabs path
 *      (app/api/outbound/run-campaign + automation/scripts/reconcile-calls.ts).
 *
 * Usage:  npx tsx automation/scripts/seed-campaigns.ts
 */
import { db } from "../lib/db";

type StepSeed = {
  step_no: number;
  delay_days: number;
  subject_template: string | null;
  body_template: string;
};

type CampaignSeed = {
  name: string;
  segment: string;
  channel: "email" | "call";
  status: string;
  steps: StepSeed[];
};

const CAMPAIGNS: CampaignSeed[] = [
  {
    name: "Insurance Outbound — Email",
    segment: "all",
    channel: "email",
    status: "active",
    steps: [
      {
        step_no: 1,
        delay_days: 0,
        subject_template: "Quick question about {{company}}'s claim calls",
        body_template:
          "Hi {{first_name}},\n\n" +
          "I'll keep this short. {{fit_reason}} " +
          "Cozmo is an AI phone agent built for insurance — it answers every call on the first ring, files the first notice of loss, books the adjuster, and handles status checks 24/7, in your brand's voice.\n\n" +
          "Worth a quick look at how it would fit {{company}}? Happy to send a 2-minute demo or just have it call you.\n\n" +
          "— Alok, Cozmo",
      },
      {
        step_no: 2,
        delay_days: 3,
        subject_template: "Re: {{company}}'s claim calls",
        body_template:
          "Hi {{first_name}},\n\n" +
          "Following up. The teams we work with were losing after-hours and storm-surge calls to voicemail — Cozmo picks those up, opens the claim, and texts the confirmation before anyone walks in.\n\n" +
          "If it's useful, I can show you exactly how it maps to {{company}}'s setup. 15 minutes?\n\n" +
          "— Alok, Cozmo",
      },
      {
        step_no: 3,
        delay_days: 5,
        subject_template: "Closing the loop, {{first_name}}",
        body_template:
          "Hi {{first_name}},\n\n" +
          "I'll stop here so I'm not crowding your inbox. If covering every claim call without adding night staff is ever on your list for {{company}}, just reply and I'll set up a demo.\n\n" +
          "— Alok, Cozmo",
      },
    ],
  },
  {
    name: "Insurance Outbound — Calling",
    segment: "all",
    channel: "call",
    status: "active",
    steps: [
      {
        step_no: 1,
        delay_days: 0,
        subject_template: null,
        body_template:
          "AI voice agent calls {{company}} to introduce Cozmo, reference {{fit_reason}}, " +
          "and offer a live demo / book a follow-up. Runs through the ElevenLabs agent; " +
          "outcome + transcript are reconciled back to the call record.",
      },
    ],
  },
];

async function upsertCampaign(c: CampaignSeed) {
  // Find existing by name (no unique constraint, so match-then-insert).
  const { data: existing } = await db
    .from("campaigns")
    .select("id")
    .eq("name", c.name)
    .maybeSingle();

  let campaignId = existing?.id as string | undefined;
  if (!campaignId) {
    const { data, error } = await db
      .from("campaigns")
      .insert({ name: c.name, segment: c.segment, channel: c.channel, status: c.status })
      .select("id")
      .single();
    if (error) throw error;
    campaignId = data!.id;
    console.log(`  + created campaign "${c.name}" (${c.channel})`);
  } else {
    await db
      .from("campaigns")
      .update({ segment: c.segment, channel: c.channel, status: c.status })
      .eq("id", campaignId);
    console.log(`  = campaign "${c.name}" exists — updated`);
  }

  // Replace its steps (delete + re-insert keeps templates in sync on re-run).
  await db.from("sequence_steps").delete().eq("campaign_id", campaignId);
  for (const s of c.steps) {
    const { error } = await db.from("sequence_steps").insert({
      campaign_id: campaignId,
      step_no: s.step_no,
      delay_days: s.delay_days,
      subject_template: s.subject_template,
      body_template: s.body_template,
    });
    if (error) throw error;
  }
  console.log(`    ${c.steps.length} sequence step(s) set`);
}

async function main() {
  console.log("Seeding premade campaigns...");
  for (const c of CAMPAIGNS) {
    await upsertCampaign(c);
  }
  const { count } = await db.from("campaigns").select("*", { count: "exact", head: true });
  console.log(`Done. ${count} campaign(s) in DB.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
