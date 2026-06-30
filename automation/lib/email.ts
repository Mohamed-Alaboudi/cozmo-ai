/**
 * Email send via Resend — the one place the outbound pipeline goes live.
 * Provider-agnostic shape ({to, subject, html/text} → {ok, id}) so SendGrid/SMTP
 * could swap in. GATED: only sends when RESEND_API_KEY + RESEND_FROM are set;
 * otherwise emailConfigured is false and callers keep messages in draft.
 *
 * Resend setup to go live (see SETUP doc):
 *   1) Create a Resend account; add + VERIFY your sending domain (SPF/DKIM DNS).
 *   2) Set RESEND_API_KEY and RESEND_FROM="Cozmo <hello@yourdomain.com>".
 */
import { loadEnv } from "./env";

loadEnv();

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM; // e.g. "Cozmo <hello@cozmox.ai>"
const REPLY_TO = process.env.RESEND_REPLY_TO || undefined;

/** True only when a key AND a verified-domain From address are configured. */
export const emailConfigured = Boolean(KEY && FROM);

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type SendEmailResult = { ok: boolean; id?: string; error?: string };

/** Send one email through Resend. Throws if not configured (callers gate first). */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!emailConfigured) {
    throw new Error(
      "Email not configured: set RESEND_API_KEY + RESEND_FROM (verified domain).",
    );
  }
  if (!/.+@.+\..+/.test(input.to)) {
    return { ok: false, error: `invalid recipient: ${input.to}` };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: input.to,
        subject: input.subject,
        text: input.text,
        ...(input.html ? { html: input.html } : {}),
        ...(REPLY_TO ? { reply_to: REPLY_TO } : {}),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };
    if (!res.ok) {
      return { ok: false, error: data.message ?? `Resend ${res.status}` };
    }
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: String(e).slice(0, 200) };
  }
}
