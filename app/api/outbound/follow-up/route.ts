import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { dbAdmin, dbConfigured } from "@/lib/db/client";

export const dynamic = "force-dynamic";

const EL_KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = process.env.ELEVENLABS_COZMO_AGENT_ID;
const PHONE_ID = process.env.ELEVENLABS_COZMO_PHONE_NUMBER_ID;

/**
 * Trigger a phone follow-up for one account from the dashboard/API.
 *
 * Creates the cozmo.calls row FIRST (its id is the call_id the agent's
 * tools update — no orphans), then fires an ElevenLabs outbound call via the
 * SIP-TRUNK endpoint with call_id + company context as dynamic variables.
 *
 * Safety: requires an explicit `to` (E.164) in the body so a scraped number is
 * never cold-dialed by accident; requires the agent shared secret.
 */
export async function POST(req: Request) {
  if (!dbConfigured) {
    return NextResponse.json({ ok: false, error: "db not configured" }, { status: 503 });
  }

  // Fail closed: if the secret is not configured, refuse all requests.
  const secret = process.env.AGENT_SHARED_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "server not configured" }, { status: 503 });
  }
  // Read from header, not body, so it never appears in request-body logs.
  const provided = req.headers.get("x-agent-secret") ?? "";
  const secretBuf = Buffer.from(secret);
  const providedBuf = Buffer.alloc(secretBuf.length);
  Buffer.from(provided).copy(providedBuf);
  if (!timingSafeEqual(secretBuf, providedBuf)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { accountId?: string; to?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }
  if (!body.accountId || !body.to) {
    return NextResponse.json({ ok: false, error: "accountId and to (E.164) required" }, { status: 400 });
  }
  if (!/^\+[1-9]\d{6,14}$/.test(body.to)) {
    return NextResponse.json({ ok: false, error: "to must be a valid E.164 number" }, { status: 400 });
  }

  const db = dbAdmin();
  const { data: acc } = await db
    .from("accounts")
    .select("name, mapped_page, fit_reason")
    .eq("id", body.accountId)
    .single();
  const { data: contact } = await db
    .from("contacts")
    .select("id")
    .eq("account_id", body.accountId)
    .maybeSingle();

  const { data: call, error } = await db
    .from("calls")
    .insert({
      account_id: body.accountId,
      contact_id: contact?.id ?? null,
      trigger: "manual",
      status: "dialing",
      to_number: body.to,
    })
    .select("id")
    .single();
  if (error || !call) {
    return NextResponse.json({ ok: false, error: error?.message ?? "could not create call" }, { status: 500 });
  }

  if (!EL_KEY || !AGENT_ID || !PHONE_ID) {
    await db.from("calls").update({ status: "queued", outcome: "agent not configured" }).eq("id", call.id);
    return NextResponse.json({ ok: true, callId: call.id, dialed: false, note: "agent env not set; call queued" });
  }

  const res = await fetch("https://api.elevenlabs.io/v1/convai/sip-trunk/outbound-call", {
    method: "POST",
    headers: { "xi-api-key": EL_KEY, "content-type": "application/json" },
    body: JSON.stringify({
      agent_id: AGENT_ID,
      agent_phone_number_id: PHONE_ID,
      to_number: body.to,
      conversation_initiation_client_data: {
        dynamic_variables: {
          call_id: call.id,
          company: acc?.name ?? "your company",
          mapped_page: acc?.mapped_page ?? "",
          fit_reason: acc?.fit_reason ?? "",
        },
      },
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    await db.from("calls").update({ status: "failed", outcome: text.slice(0, 200) }).eq("id", call.id);
    return NextResponse.json({ ok: false, callId: call.id, error: text.slice(0, 200) }, { status: 502 });
  }
  let json: { conversation_id?: string } = {};
  try {
    json = JSON.parse(text);
  } catch {
    /* bare ok */
  }
  await db
    .from("calls")
    .update({ status: "connected", elevenlabs_conversation_id: json.conversation_id ?? null })
    .eq("id", call.id);
  await db
    .from("activity")
    .insert({ account_id: body.accountId, type: "call_triggered", summary: `Follow-up call placed to ${acc?.name}` });

  return NextResponse.json({ ok: true, callId: call.id, dialed: true, conversationId: json.conversation_id });
}
