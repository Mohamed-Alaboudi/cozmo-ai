# Cozmo AI — Outbound Engine: Demo Walkthrough

A 90-second narrative for the unified system: **scrape → personalize → send → call → book**, all visible in one dashboard, with a real phone agent on a real number.

> **Lead with this:** sends run in **dry-run** by default — the engine is built live-ready and is one env flag (`OUTBOUND_LIVE=true`) from production, so the whole pipeline is demonstrable with **zero risk to real contractors** during evaluation. The rendered emails are inspectable in `automation/outbox/` and in the `messages` table.

---

## The problem
Insurance contractors, TPAs, and carriers drown in repetitive phone work: first notice of loss, claim-status calls, after-hours overflow, catastrophe surges. Cozmo sells AI phone agents that handle those calls end to end and charges **per resolved case, not per minute**. To sell that, you need an outbound engine that finds the right accounts and starts real conversations.

## What this system does (the funnel)
Open **`/dashboard`** (password `cozmo-demo`). The Overview shows the funnel moving on real data:

1. **Scraped** — Exa search across 7 angles found ~100 real restoration contractors + ~35 TPAs (BELFOR, Servpro, Paul Davis, Sedgwick, Crawford, Gallagher Bassett…), deduped and ranked. *Run: `npm run outbound:discover`.*
2. **Enriched** — Claude read each company and wrote a one-line **"why this account"** (e.g. *"Servpro's 2,380 franchise locations run 24/7 emergency intake → massive FNOL call volume"*), mapped it to the right Cozmo page, and guessed the buyer. *Run: `npm run outbound:enrich`.*
3. **Personalized** — Claude wrote a specific cold opener per account that references their real business and the pay-per-resolved-case model — not mail-merge. *Run: `npm run outbound:personalize`.*
4. **Sent (dry-run)** — the queue stamps each message sent and writes it to the outbox. *Run: `npm run outbound:queue -- --simulate-opens 0.4`.*
5. **Follow-up call** — for a no-reply account, the engine creates a call record and **places a real phone call** with Cozmo's ElevenLabs agent, which knows the four Cozmo pages and books a demo. *Run: `npm run outbound:follow-up -- --live --to +1XXXXXXXXXX --limit 1`.*

## The 30-second "wow"
On the **Contacts** page, expand any account: you see the contacts, the **Claude-written opener**, the **"why this account"** provenance (fit reason + Exa source + mapped page), and any call outcome/transcript. Then trigger a follow-up call to your own phone — the agent opens with *"I'm reaching out from Cozmo about your claim-intake call handling…"*, references that specific company, and the booking lands back as a row in the CRM in front of you. That single chain proves **list → personalize → send → follow-up → close**, end to end.

## The phone agent (real)
- Agent: `agent_5301kwbtt4hsf3197ft3rm79g4jd` ("Cozmo — Insurance Outreach"), ElevenLabs ConvAI.
- Number: **+1 346 248 8408** (fresh Telnyx number, wired to ElevenLabs over SIP using the proven FQDN handshake).
- Knows: what Cozmo does, outcome-based pricing, and the homeowners/contractors/carriers use cases (knowledge built from the site content).
- Tools (webhooks → `/api/agent/*`, always-200, write to the `cozmo` schema): `book_demo`, `log_interest`, `lookup_account`, `take_message`. Each call is triggered with a pre-created `call_id` so the agent's tool-writes update the right CRM row.
- See `automation/agent/README.md` for IDs + the exact re-run/trigger commands, and `automation/agent/BUILD-LOG.md` for the live-call evidence.

## How I'd scale this
- **Sends:** flip `OUTBOUND_LIVE=true` and wire a warmed-domain provider (Resend/Instantly) in `queue.ts:liveSend()`; add per-domain caps, plain-text + opt-out, and inbox warmup. Everything downstream already records status/provider_id.
- **Volume:** `discover` already caps + dedupes; the enrich/personalize stages are idempotent and shard trivially (run N workers, or the Workflow driver) to take 10k accounts.
- **Cron:** `vercel.json` schedules `/api/cron/tick` to advance sequences daily; it's also directly callable.
- **Sequencing:** the `sequence_steps` table holds multi-touch cadences; step 2/3 bumps and the no-reply→call trigger are wired to the same `messages`/`calls` model.

## Architecture in one line
Next.js 15 (sites + dashboard + API) · Supabase `cozmo` schema (CRM) · Claude via `claude -p` (enrichment + copy) · Exa (discovery) · ElevenLabs + Telnyx (the phone agent). One repo, one Vercel project.
