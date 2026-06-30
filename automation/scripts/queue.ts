/**
 * STAGE 4 — queue: promote draft messages to queued/sent.
 *
 * DRY-RUN (default, OUTBOUND_LIVE != 'true'): marks messages 'sent', stamps
 * sent_at, logs activity, and writes the rendered email to automation/outbox/
 * for inspection. NO real email leaves. This is the safe demo path.
 *
 * LIVE (OUTBOUND_LIVE='true'): would call the email provider here. Left as a
 * clearly-marked, gated stub so flipping one env var is the only change needed.
 *
 * Usage:
 *   npx tsx automation/scripts/queue.ts            # dry-run send all drafts
 *   npx tsx automation/scripts/queue.ts --simulate-opens 0.4  # also mark ~40% opened (demo funnel)
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { db, logActivity } from "../lib/db";
import { sendEmail, emailConfigured } from "../lib/email";

// LIVE sends real email only when BOTH the flag is on AND Resend is configured.
const LIVE = process.env.OUTBOUND_LIVE === "true" && emailConfigured;
const OUTBOX = resolve(process.cwd(), "automation/outbox");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

type QueueMsg = {
  id: string;
  account_id: string;
  subject: string | null;
  body: string | null;
  to_email?: string | null;
  accounts?: { name?: string; domain?: string } | null;
};

/** Send one email for real via Resend (only reached when LIVE === true). */
async function liveSend(msg: QueueMsg): Promise<{ ok: boolean; id?: string }> {
  const to =
    msg.to_email ||
    (msg.accounts?.domain ? `claims@${msg.accounts.domain}` : "");
  const r = await sendEmail({
    to,
    subject: msg.subject ?? "Hello from Cozmo",
    text: msg.body ?? "",
  });
  if (!r.ok) throw new Error(r.error ?? "send failed");
  return { ok: true, id: r.id };
}

async function main() {
  mkdirSync(OUTBOX, { recursive: true });
  const simulateOpens = Number(arg("--simulate-opens") ?? "0"); // 0..1

  const { data: drafts, error } = await db
    .from("messages")
    .select(
      "id, account_id, subject, body, send_mode, accounts(name, domain), contacts(email)",
    )
    .eq("status", "draft")
    .limit(500);
  if (error) throw error;
  if (!drafts?.length) {
    console.log("No draft messages to queue.");
    return;
  }

  console.log(`Queueing ${drafts.length} message(s) [${LIVE ? "LIVE" : "DRY-RUN"}]...`);
  let sent = 0;
  for (const m of drafts) {
    const acc = (m as { accounts?: { name?: string; domain?: string } }).accounts;
    const toEmail =
      (m as { contacts?: { email?: string | null } }).contacts?.email ?? null;
    if (LIVE) {
      try {
        const r = await liveSend({ ...(m as unknown as QueueMsg), to_email: toEmail });
        await db
          .from("messages")
          .update({ status: "sent", sent_at: new Date().toISOString(), provider_id: r.id ?? null })
          .eq("id", m.id);
      } catch (e) {
        console.error(`  LIVE send failed: ${(e as Error).message}`);
        throw e;
      }
    } else {
      // Dry-run: stamp sent, write rendered email to outbox (the body is also
      // already persisted in messages.body for the Vercel-safe path).
      await db
        .from("messages")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          provider_id: `dry-${m.id.slice(0, 8)}`,
        })
        .eq("id", m.id);
      const file = resolve(OUTBOX, `${acc?.domain ?? m.account_id}.txt`);
      writeFileSync(
        file,
        `To: ${acc?.name ?? m.account_id} <${acc?.domain ? `claims@${acc.domain}` : "unknown"}>\n` +
          `Subject: ${m.subject}\n` +
          `Mode: DRY-RUN (no email sent)\n\n${m.body}\n`
      );
    }
    await logActivity(m.account_id, "sent", `Sent opener to ${acc?.name ?? "account"} `);
    sent++;

    // Optionally simulate opens so the demo funnel shows movement past "sent".
    if (simulateOpens > 0 && Math.abs(hashFrac(m.id)) < simulateOpens) {
      await db.from("messages").update({ status: "opened" }).eq("id", m.id);
      await logActivity(m.account_id, "opened", `${acc?.name ?? "Account"} opened the email`);
    }
  }
  console.log(`Done. ${sent} message(s) ${LIVE ? "sent" : "sent"}; outbox: ${OUTBOX}`);
}

/** Deterministic per-id fraction in [0,1) so --simulate-opens is stable across runs. */
function hashFrac(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (h >>> 0) / 0xffffffff;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
