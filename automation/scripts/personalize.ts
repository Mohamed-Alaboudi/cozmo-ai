/**
 * STAGE 3 — personalize: for each enriched account without a draft message,
 * have Claude write a short, specific cold opener that references the account's
 * real business and links the matching Cozmo page. Writes cozmo.messages as
 * status='draft', send_mode from OUTBOUND_LIVE.
 *
 * Idempotent: only accounts with fit_reason set AND no draft message (or --id).
 *
 * Usage:
 *   npx tsx automation/scripts/personalize.ts
 *   npx tsx automation/scripts/personalize.ts --id <uuid>   # Workflow drives this
 */
import { db, logActivity } from "../lib/db";
import { openaiJson } from "../lib/openai";
import { COZMO_CONTEXT } from "../lib/cozmo-context";
import type { Personalization } from "../lib/types";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const SEND_MODE = process.env.OUTBOUND_LIVE === "true" ? "live" : "dry_run";
const CONTRACTOR_CAMPAIGN = "11111111-1111-1111-1111-111111111111";
const TPA_CAMPAIGN = "22222222-2222-2222-2222-222222222222";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hellocozmo.ai";

async function personalizeOne(acc: {
  id: string;
  name: string;
  segment: string;
  blurb: string | null;
  fit_reason: string | null;
  mapped_page: string | null;
  hq_city: string | null;
  hq_state: string | null;
}) {
  const page = acc.mapped_page ?? (acc.segment === "contractor" ? "contractors" : "carriers");

  const prompt = `${COZMO_CONTEXT}

Write a COLD outbound email opener from Cozmo to this company. This is the first
touch in a sequence.

Company: ${acc.name}
What they do: ${acc.blurb ?? "(unknown)"}
Why they fit Cozmo: ${acc.fit_reason ?? "(general fit)"}
Best Cozmo page for them: ${SITE}/${page}

Rules:
- Subject: under 8 words, specific to them, no clickbait, no emoji.
- Body: 60-90 words, 3 short paragraphs max. Plain text, not HTML.
- Open with a specific observation about THEIR business or the call-volume pain
  they plausibly have (FNOL surge, claim-status calls, after-hours overflow).
  Do NOT use generic flattery ("I came across your impressive company").
- One sentence on what Cozmo does for a company like them, naming the
  outcome-based model (pay per resolved case).
- End with a soft, low-friction ask (a 10-minute call or a link to ${SITE}/${page}).
- Sound like a sharp human SDR, not a mail-merge. No buzzword soup. No dashes as
  punctuation; use commas and periods.

Return JSON: { "subject": "...", "body": "..." }`;

  const p = await openaiJson<Personalization>(prompt);

  const { data: contact } = await db
    .from("contacts")
    .select("id")
    .eq("account_id", acc.id)
    .maybeSingle();

  await db.from("messages").insert({
    account_id: acc.id,
    contact_id: contact?.id ?? null,
    campaign_id: acc.segment === "contractor" ? CONTRACTOR_CAMPAIGN : TPA_CAMPAIGN,
    step_no: 1,
    channel: "email",
    subject: p.subject?.slice(0, 200) ?? `Cozmo + ${acc.name}`,
    body: p.body ?? "",
    status: "draft",
    send_mode: SEND_MODE,
  });

  await logActivity(acc.id, "personalized", `Drafted opener for ${acc.name}`, {
    subject: p.subject,
  });
  console.log(`  ✓ ${acc.name}: "${p.subject?.slice(0, 50)}"`);
}

async function main() {
  const id = arg("--id");
  const limit = Number(arg("--limit") ?? "200");

  // Accounts enriched but without a draft message yet.
  let accs;
  if (id) {
    const { data } = await db
      .from("accounts")
      .select("id,name,segment,blurb,fit_reason,mapped_page,hq_city,hq_state")
      .eq("id", id);
    accs = data ?? [];
  } else {
    const { data } = await db
      .from("accounts")
      .select("id,name,segment,blurb,fit_reason,mapped_page,hq_city,hq_state")
      .not("fit_reason", "is", null)
      .limit(limit);
    // filter out those that already have a message
    const ids = (data ?? []).map((a) => a.id);
    const { data: withMsg } = await db
      .from("messages")
      .select("account_id")
      .in("account_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const done = new Set((withMsg ?? []).map((m) => m.account_id));
    accs = (data ?? []).filter((a) => !done.has(a.id));
  }

  if (!accs.length) {
    console.log("Nothing to personalize.");
    return;
  }
  console.log(`Personalizing ${accs.length} account(s) [send_mode=${SEND_MODE}]...`);
  for (const acc of accs) {
    try {
      await personalizeOne(acc);
    } catch (e) {
      console.warn(`  ✗ ${acc.name}: ${(e as Error).message}`);
    }
  }
  console.log("Personalize done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
