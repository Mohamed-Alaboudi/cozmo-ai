/**
 * Reconcile call statuses against ElevenLabs. Any cozmo.calls row that is still
 * in a non-terminal state (queued/dialing/connected) gets its real outcome
 * pulled from the ElevenLabs conversation and written back, so the dashboard
 * never shows a stale "Dialing" for a call that already ended.
 *
 * A "dialing"/"connected" row with NO conversation_id never actually placed a
 * call (e.g. a queued follow-up that was never dialed, or a tool-only test) and
 * is marked 'failed' with a clear reason rather than left hanging.
 *
 * Usage: npx tsx automation/scripts/reconcile-calls.ts
 */
import { db } from "../lib/db";

const EL_KEY = process.env.ELEVENLABS_API_KEY;

type ElConversation = {
  status?: string; // "done" | "in-progress" | "failed" | ...
  analysis?: { call_successful?: string };
  call_successful?: string;
  metadata?: { call_duration_secs?: number };
  transcript?: { role: string; message: string | null }[];
};

const NON_TERMINAL = ["queued", "dialing", "connected"];

async function fetchConversation(id: string): Promise<ElConversation | null> {
  if (!EL_KEY) return null;
  const res = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${id}`, {
    headers: { "xi-api-key": EL_KEY },
  });
  if (!res.ok) return null;
  return (await res.json()) as ElConversation;
}

function transcriptText(c: ElConversation): string | null {
  if (!Array.isArray(c.transcript)) return null;
  const lines = c.transcript
    .filter((t) => t.message)
    .map((t) => `[${t.role === "agent" ? "agent" : "caller"}] ${t.message}`);
  return lines.length ? lines.join("\n") : null;
}

async function main() {
  const { data: rows, error } = await db
    .from("calls")
    .select("id, status, elevenlabs_conversation_id, outcome, demo_booked")
    .in("status", NON_TERMINAL);
  if (error) throw error;
  if (!rows?.length) {
    console.log("No non-terminal calls to reconcile.");
    return;
  }
  console.log(`Reconciling ${rows.length} call(s)...`);

  for (const row of rows) {
    // No conversation id → the call was never actually placed.
    if (!row.elevenlabs_conversation_id) {
      await db
        .from("calls")
        .update({ status: "failed", outcome: row.outcome ?? "not dialed" })
        .eq("id", row.id);
      console.log(`  ${row.id.slice(0, 8)} → failed (never dialed, no conversation id)`);
      continue;
    }

    const conv = await fetchConversation(row.elevenlabs_conversation_id);
    if (!conv) {
      console.log(`  ${row.id.slice(0, 8)} → could not fetch conversation; left as-is`);
      continue;
    }

    const elStatus = conv.status ?? "";
    const success = conv.analysis?.call_successful ?? conv.call_successful;
    const duration = conv.metadata?.call_duration_secs ?? null;
    const transcript = transcriptText(conv);

    // Map ElevenLabs status → our terminal status.
    let status = row.status;
    if (elStatus === "done" || elStatus === "completed") status = "completed";
    else if (elStatus === "failed") status = "failed";
    else if (elStatus === "in-progress" || elStatus === "processing") status = "connected";

    const update: Record<string, unknown> = { status };
    if (duration != null) update.duration_s = duration;
    if (transcript) update.transcript = transcript;
    // Only set a generic outcome if one isn't already set (e.g. booked_demo from a tool).
    if (status === "completed" && !row.outcome) {
      update.outcome = success === "success" ? "completed" : "no_answer";
    }

    await db.from("calls").update(update).eq("id", row.id);
    console.log(
      `  ${row.id.slice(0, 8)} → ${status}` +
        (duration != null ? ` (${duration}s)` : "") +
        (transcript ? ", transcript stored" : "")
    );
  }
  console.log("Reconcile done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
