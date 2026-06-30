/**
 * STAGE 5 — follow-up: the bridge from outbound email to the phone agent.
 *
 * Finds accounts that were emailed but haven't replied, creates a cozmo.calls
 * row FIRST (this id is the call_id the agent's tools update — no orphan rows),
 * then triggers an ElevenLabs outbound call via the SIP-TRUNK endpoint, passing
 * call_id + company context as dynamic variables.
 *
 * Safety: by default this is DRY (queues the call row + logs, places NO real
 * call). Pass --live to actually dial, and --to <E.164> to force the recipient
 * (so you never cold-call a scraped number by accident). For the demo, dial the
 * operator's own phone.
 *
 * Usage:
 *   npx tsx automation/scripts/follow-up.ts                      # queue calls (no dial)
 *   npx tsx automation/scripts/follow-up.ts --live --to +1XXXXXXXXXX --limit 1
 */
import { db, logActivity } from "../lib/db";

const EL_KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = process.env.ELEVENLABS_COZMO_AGENT_ID;
const PHONE_ID = process.env.ELEVENLABS_COZMO_PHONE_NUMBER_ID;

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

async function triggerCall(opts: {
  callId: string;
  toNumber: string;
  company: string;
  mappedPage: string | null;
  fitReason: string | null;
}): Promise<{ ok: boolean; conversationId?: string; error?: string }> {
  if (!EL_KEY || !AGENT_ID || !PHONE_ID) {
    return { ok: false, error: "Missing ELEVENLABS_API_KEY / AGENT_ID / PHONE_NUMBER_ID" };
  }
  // SIP-TRUNK endpoint (the Telnyx number is a SIP-trunk import) — NOT /twilio/.
  const res = await fetch("https://api.elevenlabs.io/v1/convai/sip-trunk/outbound-call", {
    method: "POST",
    headers: { "xi-api-key": EL_KEY, "content-type": "application/json" },
    body: JSON.stringify({
      agent_id: AGENT_ID,
      agent_phone_number_id: PHONE_ID,
      to_number: opts.toNumber,
      conversation_initiation_client_data: {
        dynamic_variables: {
          call_id: opts.callId,
          company: opts.company,
          mapped_page: opts.mappedPage ?? "",
          fit_reason: opts.fitReason ?? "",
        },
      },
    }),
  });
  const text = await res.text();
  if (!res.ok) return { ok: false, error: `${res.status}: ${text.slice(0, 200)}` };
  let json: { conversation_id?: string } = {};
  try {
    json = JSON.parse(text);
  } catch {
    /* some responses are bare */
  }
  return { ok: true, conversationId: json.conversation_id };
}

async function main() {
  const live = process.argv.includes("--live");
  const forceTo = arg("--to");
  const limit = Number(arg("--limit") ?? "10");

  // Accounts that were sent/opened but not replied, and not already called.
  const { data: sentMsgs } = await db
    .from("messages")
    .select("account_id, status")
    .in("status", ["sent", "opened"]);
  const candidateIds = [...new Set((sentMsgs ?? []).map((m) => m.account_id))];

  const { data: alreadyCalled } = await db
    .from("calls")
    .select("account_id")
    .in("account_id", candidateIds.length ? candidateIds : ["00000000-0000-0000-0000-000000000000"]);
  const calledSet = new Set((alreadyCalled ?? []).map((c) => c.account_id));

  const toCall = candidateIds.filter((id) => !calledSet.has(id)).slice(0, limit);
  if (!toCall.length) {
    console.log("No accounts ready for follow-up call.");
    return;
  }

  console.log(`Follow-up: ${toCall.length} account(s) [${live ? "LIVE DIAL" : "QUEUE ONLY"}]`);
  for (const accountId of toCall) {
    const { data: acc } = await db
      .from("accounts")
      .select("name, mapped_page, fit_reason")
      .eq("id", accountId)
      .single();
    const { data: contact } = await db
      .from("contacts")
      .select("id, phone")
      .eq("account_id", accountId)
      .maybeSingle();

    const toNumber = forceTo ?? contact?.phone ?? null;

    // Create the calls row FIRST — its id is the call_id the agent tools update.
    const { data: call, error } = await db
      .from("calls")
      .insert({
        account_id: accountId,
        contact_id: contact?.id ?? null,
        trigger: "no_reply",
        status: live && toNumber ? "dialing" : "queued",
        to_number: toNumber,
      })
      .select("id")
      .single();
    if (error || !call) {
      console.warn(`  ✗ ${acc?.name}: could not create call row: ${error?.message}`);
      continue;
    }
    await logActivity(accountId, "call_triggered", `Queued follow-up call to ${acc?.name}`);

    if (!live) {
      console.log(`  • queued call ${call.id.slice(0, 8)} for ${acc?.name} (no dial)`);
      continue;
    }
    if (!toNumber) {
      console.warn(`  ! ${acc?.name}: no number to dial (pass --to). Left queued.`);
      continue;
    }

    const r = await triggerCall({
      callId: call.id,
      toNumber,
      company: acc?.name ?? "your company",
      mappedPage: acc?.mapped_page ?? null,
      fitReason: acc?.fit_reason ?? null,
    });
    if (r.ok) {
      await db
        .from("calls")
        .update({ status: "connected", elevenlabs_conversation_id: r.conversationId ?? null })
        .eq("id", call.id);
      console.log(`  ✓ dialed ${acc?.name} → ${toNumber} (conv ${r.conversationId ?? "?"})`);
    } else {
      await db.from("calls").update({ status: "failed", outcome: r.error?.slice(0, 200) }).eq("id", call.id);
      console.warn(`  ✗ ${acc?.name}: ${r.error}`);
    }
  }
  console.log("Follow-up done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
