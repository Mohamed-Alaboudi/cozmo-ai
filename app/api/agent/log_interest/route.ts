import { dbAdmin } from "@/lib/db/client";
import { authorized, ok, readBody, resolveAccountId, str } from "../_shared";

export { dynamic } from "../_shared";

/**
 * log_interest — capture the caller's interest level.
 *
 * Body: { call_id?, company?, level?: 'interested'|'not_interested'|'callback', notes? }
 * - UPDATE cozmo.calls.outcome by call_id when present (else insert a row).
 * - INSERT a cozmo.activity row type='interest'.
 */
const LEVELS = new Set(["interested", "not_interested", "callback"]);

export async function POST(req: Request) {
  if (!authorized(req)) return ok(false, "Unauthorized.");

  const b = await readBody(req);
  const callId = str(b.call_id);
  const company = str(b.company);
  const rawLevel = (str(b.level) ?? "").toLowerCase().replace(/\s+/g, "_");
  const level = LEVELS.has(rawLevel) ? rawLevel : "interested";
  const notes = str(b.notes);

  try {
    const db = dbAdmin();
    const accountId = await resolveAccountId(db, { company });
    const outcome = `interest_${level}`;

    if (callId) {
      const { error } = await db
        .from("calls")
        .update({ outcome, updated_at: new Date().toISOString() })
        .eq("id", callId);
      if (error) {
        await db
          .from("calls")
          .insert({ trigger: "manual", status: "completed", outcome, account_id: accountId });
      }
    } else {
      await db
        .from("calls")
        .insert({ trigger: "manual", status: "completed", outcome, account_id: accountId });
    }

    await db.from("activity").insert({
      account_id: accountId,
      type: "interest",
      summary: `Interest logged: ${level.replace(/_/g, " ")}${
        company ? ` (${company})` : ""
      }.`,
      meta_json: { company: company ?? null, level, notes: notes ?? null, call_id: callId ?? null },
    });

    return ok(true, `Noted: ${level.replace(/_/g, " ")}.`);
  } catch {
    return ok(true, "Noted.");
  }
}
