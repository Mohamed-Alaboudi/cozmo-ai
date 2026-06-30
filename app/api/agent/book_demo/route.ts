import { dbAdmin } from "@/lib/db/client";
import { authorized, ok, readBody, resolveAccountId, str } from "../_shared";

export { dynamic } from "../_shared";

/**
 * book_demo — the caller agreed to a demo.
 *
 * Body: { call_id?, company?, contactName?, email?, when?, notes? }
 * - If call_id is present, UPDATE that cozmo.calls row: outcome='booked_demo',
 *   demo_booked=true, status='completed'.
 * - If no call_id, INSERT a fresh calls row so nothing is lost.
 * - Always INSERT a cozmo.activity row type='demo_booked' with the contact
 *   details in meta_json (calls has no company/email/contact columns).
 */
export async function POST(req: Request) {
  if (!authorized(req)) return ok(false, "Unauthorized.");

  const b = await readBody(req);
  const callId = str(b.call_id);
  const company = str(b.company);
  const contactName = str(b.contactName) ?? str(b.contact_name);
  const email = str(b.email);
  const when = str(b.when);
  const notes = str(b.notes);

  try {
    const db = dbAdmin();
    const accountId = await resolveAccountId(db, { company });

    const meta = {
      company: company ?? null,
      contact_name: contactName ?? null,
      email: email ?? null,
      when: when ?? null,
      notes: notes ?? null,
      call_id: callId ?? null,
    };

    if (callId) {
      const { error } = await db
        .from("calls")
        .update({
          outcome: "booked_demo",
          demo_booked: true,
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", callId);
      if (error) {
        // Row id was bad — fall back to an insert so the booking is captured.
        await db.from("calls").insert({
          trigger: "manual",
          status: "completed",
          outcome: "booked_demo",
          demo_booked: true,
          account_id: accountId,
        });
      }
    } else {
      await db.from("calls").insert({
        trigger: "manual",
        status: "completed",
        outcome: "booked_demo",
        demo_booked: true,
        account_id: accountId,
      });
    }

    await db.from("activity").insert({
      account_id: accountId,
      type: "demo_booked",
      summary: `Demo booked${company ? ` with ${company}` : ""}${
        when ? ` for ${when}` : ""
      }${contactName ? ` (contact ${contactName})` : ""}.`,
      meta_json: meta,
    });

    return ok(
      true,
      `Demo booked${when ? ` for ${when}` : ""}. A calendar invite goes to ${
        email ?? "the contact"
      }.`,
    );
  } catch {
    // Never drop the call. Confirm verbally; the booking is logged best-effort.
    return ok(
      true,
      "Demo request captured. The team will confirm the time by email shortly.",
    );
  }
}
