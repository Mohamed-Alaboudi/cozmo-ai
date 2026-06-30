# Turning on the email campaign (Resend)

The email campaign is **built and wired, but OFF by default** — messages stay in
`draft` / dry-run (written to `automation/outbox/`, nothing actually sent) until
you complete the steps below. The calling campaign works independently via the
existing ElevenLabs path.

## What's already done
- `automation/lib/email.ts` — Resend send client (`sendEmail`), gated by env.
- `automation/scripts/queue.ts` — `liveSend()` calls Resend; only sends when
  `OUTBOUND_LIVE=true` **and** Resend is configured (`emailConfigured`).
- Premade "Insurance Outbound — Email" campaign + 3 sequence steps (run
  `npx tsx automation/scripts/seed-campaigns.ts`).
- Recipient = the enriched contact's `email` (from Scrapling+OpenAI), falling
  back to `claims@<domain>` if no real address was found.

## To go live (3 steps)
1. **Create a Resend account** → https://resend.com, then **add + verify your
   sending domain** (Resend → Domains → Add Domain). Resend gives you DNS records
   to add at your registrar:
   - an **SPF** TXT record,
   - **DKIM** TXT record(s),
   - (recommended) a **DMARC** TXT record.
   Wait for the domain to show **Verified** in Resend. (You cannot reliably send
   cold email from an unverified domain — it will land in spam or bounce.)

2. **Set the env vars** (Vercel project `cozmo-ai` + local `.env.local`):
   ```
   RESEND_API_KEY=re_xxxxxxxx
   RESEND_FROM=Cozmo <hello@yourdomain.com>     # must be on the verified domain
   RESEND_REPLY_TO=alok.k@cozmox.ai             # optional
   OUTBOUND_LIVE=true                           # flips dry-run → live send
   ```

3. **Run the pipeline** locally:
   ```
   npm run outbound:discover      # find accounts (OpenAI + curated list)
   npm run outbound:enrich        # Scrapling scrape + OpenAI extract contacts
   npm run outbound:personalize   # OpenAI writes the opener per account
   npm run outbound:queue         # with OUTBOUND_LIVE=true → sends via Resend
   ```
   (Without `OUTBOUND_LIVE=true` or without Resend configured, `queue` stays
   dry-run and writes rendered emails to `automation/outbox/` instead of sending.)

## Deliverability notes (cold outreach)
- **Warm up** the domain — start with a low daily volume and ramp.
- Keep an **unsubscribe / opt-out** line in the body (the templates end with a
  soft "reply to stop"; add a real unsubscribe if you scale).
- Personalize (the pipeline already does) — generic blasts get flagged.
- Monitor Resend's bounce/complaint dashboard; prune bad addresses.
