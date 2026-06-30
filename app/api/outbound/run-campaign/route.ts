import { NextResponse } from "next/server";
import { dbAdmin, dbConfigured } from "@/lib/db/client";
import { isAuthed } from "@/lib/dashboard/auth";

export const dynamic = "force-dynamic";

/**
 * Dashboard-initiated "Run campaign" — executes the outbound dry-run pipeline
 * IN-PROCESS (no shelling out to the npm scripts) so it works on Vercel
 * serverless. This mirrors the dry-run "send" in automation/scripts/queue.ts,
 * but is driven by the dashboard rather than the CLI.
 *
 * Auth: this is a dashboard action, so it is gated by the dashboard session
 * cookie (isAuthed) — NOT the agent shared secret. A browser fetch carries the
 * httpOnly cookie automatically; nothing secret is embedded client-side. We
 * fail closed: any request without a valid cozmo_dash cookie is rejected 401.
 *
 * Body: { campaignId: string, action: "advance" | "send_drafts" }
 *   send_drafts → draft → sent (+ provider_id, sent_at, "sent" activity)
 *   advance     → sent → opened (~45%) → replied (~12% of opened), deterministic
 *                 via a stable per-message-id hash so re-runs only ever move the
 *                 funnel forward (idempotent-ish), each transition logging
 *                 matching "opened"/"replied" activity.
 *
 * Never sends real email. Always returns JSON; never 500s on an empty result —
 * an empty campaign returns ok with zero counts.
 */

type Action = "advance" | "send_drafts";

/** Probabilities for the simulated sequence progression. */
const OPEN_RATE = 0.45; // of sent → opened
const REPLY_RATE = 0.12; // of opened → replied

/**
 * Deterministic per-id fraction in [0, 1). Same FNV-ish hash used by
 * automation/scripts/queue.ts so the simulated funnel is stable across runs and
 * consistent between the CLI and this route.
 */
function hashFrac(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (h >>> 0) / 0xffffffff;
}

/**
 * Salted variant so the "open" decision and the "reply" decision use different
 * thresholds on the same id (otherwise every replied id would be a strict
 * subset boundary collision). The salt just perturbs the input string.
 */
function hashFracSalted(s: string, salt: string): number {
  return hashFrac(`${salt}:${s}`);
}

export async function POST(req: Request) {
  if (!dbConfigured) {
    return NextResponse.json(
      { ok: false, message: "Backend not configured." },
      { status: 503 },
    );
  }

  // Fail closed: dashboard session cookie required. No cookie → 401.
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }

  let body: { campaignId?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "bad request" }, { status: 400 });
  }

  const campaignId = body.campaignId;
  const action = body.action as Action | undefined;
  if (!campaignId || (action !== "advance" && action !== "send_drafts")) {
    return NextResponse.json(
      { ok: false, message: "campaignId and action ('advance' | 'send_drafts') required" },
      { status: 400 },
    );
  }

  const db = dbAdmin();

  // Resolve the campaign (also validates it exists before we mutate anything).
  const { data: campaign, error: campErr } = await db
    .from("campaigns")
    .select("id, name")
    .eq("id", campaignId)
    .maybeSingle();
  if (campErr) {
    return NextResponse.json(
      { ok: false, message: campErr.message },
      { status: 502 },
    );
  }
  if (!campaign) {
    return NextResponse.json({ ok: false, message: "campaign not found" }, { status: 404 });
  }

  const nowIso = new Date().toISOString();

  if (action === "send_drafts") {
    // Promote this campaign's draft messages to "sent" (dry-run), stamp
    // sent_at + a dry provider id, and log a "sent" activity row each.
    const { data: drafts, error } = await db
      .from("messages")
      .select("id, account_id")
      .eq("campaign_id", campaignId)
      .eq("status", "draft");
    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 502 });
    }

    let sent = 0;
    for (const m of drafts ?? []) {
      const { error: upErr } = await db
        .from("messages")
        .update({
          status: "sent",
          sent_at: nowIso,
          provider_id: `dry-${m.id.slice(0, 8)}`,
        })
        .eq("id", m.id)
        .eq("status", "draft"); // guard: only flip rows still in draft
      if (upErr) continue;
      await db.from("activity").insert({
        account_id: m.account_id,
        type: "sent",
        summary: `Sent opener for ${campaign.name} (dry-run)`,
      });
      sent++;
    }

    await db.from("campaigns").update({ status: "active" }).eq("id", campaignId);

    return NextResponse.json({
      ok: true,
      sent,
      message:
        sent > 0
          ? `Sent ${sent} draft${sent === 1 ? "" : "s"} (dry-run).`
          : "No drafts to send — try advancing the sequence.",
    });
  }

  // action === "advance": move the funnel forward deterministically.
  // sent → opened (~45%), then opened → replied (~12% of the opened set).
  const { data: sentMsgs, error: sentErr } = await db
    .from("messages")
    .select("id, account_id")
    .eq("campaign_id", campaignId)
    .eq("status", "sent");
  if (sentErr) {
    return NextResponse.json({ ok: false, message: sentErr.message }, { status: 502 });
  }

  let opened = 0;
  const newlyOpened: { id: string; account_id: string }[] = [];
  for (const m of sentMsgs ?? []) {
    if (hashFrac(m.id) < OPEN_RATE) {
      const { error: upErr } = await db
        .from("messages")
        .update({ status: "opened" })
        .eq("id", m.id)
        .eq("status", "sent");
      if (upErr) continue;
      await db.from("activity").insert({
        account_id: m.account_id,
        type: "opened",
        summary: `Recipient opened the ${campaign.name} email`,
      });
      newlyOpened.push(m);
      opened++;
    }
  }

  // Of everything now "opened" (the freshly opened this run + any opened from a
  // prior run), promote a deterministic subset to "replied". We re-query so a
  // second "advance" can still convert previously-opened messages to replies —
  // that keeps the action meaningful on repeat clicks and moves the funnel.
  const { data: openedMsgs, error: openedErr } = await db
    .from("messages")
    .select("id, account_id")
    .eq("campaign_id", campaignId)
    .eq("status", "opened");
  if (openedErr) {
    return NextResponse.json({ ok: false, message: openedErr.message }, { status: 502 });
  }

  let replied = 0;
  for (const m of openedMsgs ?? []) {
    // Threshold is relative to the open set; a salted hash decides replies so it
    // is independent of the open decision but still stable for a given id.
    if (hashFracSalted(m.id, "reply") < REPLY_RATE / OPEN_RATE) {
      const { error: upErr } = await db
        .from("messages")
        .update({ status: "replied" })
        .eq("id", m.id)
        .eq("status", "opened");
      if (upErr) continue;
      await db.from("activity").insert({
        account_id: m.account_id,
        type: "replied",
        summary: `Reply received on ${campaign.name}`,
      });
      replied++;
    }
  }

  await db.from("campaigns").update({ status: "active" }).eq("id", campaignId);

  const parts: string[] = [];
  if (opened > 0) parts.push(`${opened} opened`);
  if (replied > 0) parts.push(`${replied} replied`);
  return NextResponse.json({
    ok: true,
    opened,
    replied,
    message: parts.length > 0 ? parts.join(", ") : "Sequence is fully progressed — no new movement.",
  });
}
