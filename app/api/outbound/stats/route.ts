import { NextResponse } from "next/server";
import { dbAdmin, dbConfigured } from "@/lib/db/client";

export const dynamic = "force-dynamic";

/**
 * Outbound funnel stats as JSON. Backs the dashboard Overview (and is a
 * handy demo/debug endpoint). Returns counts for each funnel stage from
 * the cozmo schema.
 */
export async function GET() {
  if (!dbConfigured) {
    return NextResponse.json({ ok: false, error: "db not configured" }, { status: 503 });
  }
  const db = dbAdmin();

  const [accounts, enriched, messages, sent, opened, replied, calls, demos] = await Promise.all([
    db.from("accounts").select("*", { count: "exact", head: true }),
    db.from("accounts").select("*", { count: "exact", head: true }).not("fit_reason", "is", null),
    db.from("messages").select("*", { count: "exact", head: true }),
    db.from("messages").select("*", { count: "exact", head: true }).in("status", ["sent", "opened", "replied"]),
    db.from("messages").select("*", { count: "exact", head: true }).in("status", ["opened", "replied"]),
    db.from("messages").select("*", { count: "exact", head: true }).eq("status", "replied"),
    db.from("calls").select("*", { count: "exact", head: true }),
    db.from("calls").select("*", { count: "exact", head: true }).eq("demo_booked", true),
  ]);

  return NextResponse.json({
    ok: true,
    funnel: {
      scraped: accounts.count ?? 0,
      enriched: enriched.count ?? 0,
      personalized: messages.count ?? 0,
      sent: sent.count ?? 0,
      opened: opened.count ?? 0,
      replied: replied.count ?? 0,
      calls: calls.count ?? 0,
      demos: demos.count ?? 0,
    },
  });
}
