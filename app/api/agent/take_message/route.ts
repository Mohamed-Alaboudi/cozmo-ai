import { dbAdmin } from "@/lib/db/client";
import { authorized, ok, readBody, resolveAccountId, str } from "../_shared";

export { dynamic } from "../_shared";

/**
 * take_message — fallback when the caller needs something outside the agent's
 * scope, or wants a human to follow up.
 *
 * Body: { call_id?, company?, caller?, phone?, body? }
 * INSERT a cozmo.activity row type='message'.
 */
export async function POST(req: Request) {
  if (!authorized(req)) return ok(false, "Unauthorized.");

  const b = await readBody(req);
  const callId = str(b.call_id);
  const company = str(b.company);
  const caller = str(b.caller);
  const phone = str(b.phone);
  const messageBody = str(b.body) ?? str(b.message);

  try {
    const db = dbAdmin();
    const accountId = await resolveAccountId(db, { company });

    await db.from("activity").insert({
      account_id: accountId,
      type: "message",
      summary: `Message${caller ? ` from ${caller}` : ""}${
        company ? ` at ${company}` : ""
      }${messageBody ? `: ${messageBody}` : "."}`,
      meta_json: {
        company: company ?? null,
        caller: caller ?? null,
        phone: phone ?? null,
        body: messageBody ?? null,
        call_id: callId ?? null,
      },
    });

    // Best-effort: note on the call row that a message was taken.
    if (callId) {
      await db
        .from("calls")
        .update({ outcome: "message", updated_at: new Date().toISOString() })
        .eq("id", callId);
    }

    return ok(true, "Got it. I have passed your message to the team and someone will follow up.");
  } catch {
    return ok(true, "Got it. I have noted your message and someone will follow up.");
  }
}
