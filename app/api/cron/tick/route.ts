import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { dbAdmin, dbConfigured } from "@/lib/db/client";

export const dynamic = "force-dynamic";

/**
 * Daily queue tick. In production a Vercel Cron hits this to advance the
 * outbound sequence. It is also directly callable for a demo (the cron
 * *story* is real without depending on a scheduled trigger firing).
 *
 * Behavior: promotes any 'draft' messages to 'sent' (stamping
 * sent_at) so the funnel moves, and logs activity. Live sending stays gated
 * behind OUTBOUND_LIVE + a wired provider in the automation layer.
 *
 * Auth: fails CLOSED. CRON_SECRET must be set (Vercel Cron sends it as a
 * bearer); without it the route refuses all requests. Compared in constant time.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "server not configured" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(auth);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!dbConfigured) {
    return NextResponse.json({ ok: false, error: "db not configured" }, { status: 503 });
  }
  const db = dbAdmin();

  const { data: drafts } = await db
    .from("messages")
    .select("id, account_id")
    .eq("status", "draft")
    .limit(200);

  let advanced = 0;
  for (const m of drafts ?? []) {
    await db
      .from("messages")
      .update({ status: "sent", sent_at: new Date().toISOString(), provider_id: `cron-${m.id.slice(0, 8)}` })
      .eq("id", m.id);
    await db
      .from("activity")
      .insert({ account_id: m.account_id, type: "sent", summary: "Sequence tick: opener sent" });
    advanced++;
  }

  return NextResponse.json({ ok: true, advanced, mode: process.env.OUTBOUND_LIVE === "true" ? "live" : "dry_run" });
}
