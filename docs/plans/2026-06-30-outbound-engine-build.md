# Cozmo AI — Outbound Engine + CRM + Phone Agent — Build Plan

**Date:** 2026-06-30
**Owner:** Claude (Opus 4.8), for Hamoodey
**Status:** PLAN v2 — /spinner-hardened (4 must-fixes folded in), building now

## ⚠️ /spinner fixes folded into this plan (2026-06-30)
1. **Telnyx number is NOT free** — `+1 212 810 4458` is wired to the live Cortex Clinic agent. **Decision: buy a fresh dedicated Cozmo number** (user confirmed), apply the proven §12 FQDN handshake, never touch the clinic.
2. **Wrong outbound endpoint** — a Telnyx SIP-trunk number needs `POST /v1/convai/sip-trunk/outbound-call`, NOT the repo's existing `/v1/convai/twilio/outbound-call`. Fix the trigger to branch on provider.
3. **Dashboard is NOT a port** — Cortex-Dashboard is Tailwind v3 HSL + shadcn/Radix/recharts; Cozmo is Tailwind v4 `@theme` hex with none of that. Build ~5 bespoke components against Cozmo's own v4 tokens; add only `recharts`. Cortex-Dashboard = screenshot reference only.
4. **Build the live call FIRST** — it's the only irreversible, externally-dependent piece and depends only on the 4 content files + creds. Front-load it so a real transcript + CRM row exist hours before deploy; it also validates the `calls` schema early.

Plus: generate `call_id` at trigger time, agent tools UPDATE-by-id (not insert) so call rows don't orphan; `outbox/` to disk breaks on Vercel read-only FS → deployed path writes to `messages.body`; verify creds reachable first 10 min; warm Supabase before demo (free-tier auto-pause); agent first-message must NOT claim prior contact on a cold test call; point site CTA at the real number once live. Impress-upgrades: visible moving funnel, "why this account" field (Exa source + segment-fit + mapped page), hand-verify ~5 hero accounts, curate 5–10 excellent openers, 90-sec demo narrative, lead with dry-run as a feature.

---

## 0. What's already done vs. what I'm building

The Cozmo marketing site already exists in this repo (`/Users/moea/Cozmo AI`): an umbrella home page plus **Homeowners / Contractors / Carriers** audience pages (Next.js 15 App Router, React 19, Tailwind v4, Lenis, a working provider-agnostic `/api/call-me`). That covers the brief's "sub-websites + centralized website."

**My scope (Stage 1.b + 1.c, minus the site):**
1. **Outbound engine** — scrape top 100 contractors + 35 TPAs, Claude-personalize outreach per account, queue/track sends.
2. **Claude automation** — the orchestration layer that drives scrape → enrich → personalize → queue → follow-up.
3. **Dashboard / CRM** — real persistent backend (Supabase) showing contacts, campaigns, message log, call outcomes.
4. **Phone agent follow-up** — a *real* ElevenLabs conversational agent on a *real* Telnyx number that knows everything about the 4 Cozmo sites and follows up on outbound.
5. **Unify + deploy** — one app, deployed to a fresh Vercel project (preview URL).

### Locked decisions (from user)
| Area | Decision |
|---|---|
| Outbound send mode | **Dry-run / simulated** — built live-ready, flip a flag to actually send. Zero deliverability risk. |
| Data backend | **Supabase** (via `supabase-cortex` MCP) — real CRM, persists outbound activity. |
| Target list | **Auto-scrape with Claude + Exa**, ship a cached snapshot so the demo works offline. |
| Phone agent | **Real** — Opus 4.8 + ultrathink builds it in ElevenLabs, knows all 4 sites; one Telnyx number; mirror prior ElevenLabs setup; run live tests. |
| Telnyx number | **Reuse if one's unused; buy only if not.** (A wired number `+1 212 810 4458` already exists from a prior build — confirm before buying.) |
| Deploy | **New Vercel project**, `*.vercel.app` preview URL. |

---

## 1. Assets I can reuse (verified on disk)

### ElevenLabs + Telnyx (the hard part is already solved once)
- **`/Users/moea/cortex-receptionist/scripts/update-agent.sh`** — canonical API-driven agent definition: `PATCH /v1/convai/agents/<id>` with `conversation_config.agent.{first_message, prompt:{prompt, tool_ids}}`, full system prompt inline. **Clone + rewrite for insurance.**
- **`/Users/moea/cortex-receptionist/scripts/create-tools.sh`** — `POST /v1/convai/tools` webhook-tool registration → returns tool IDs.
- **`/Users/moea/Elevenlabs Hackathon/docs/plans/backend-and-telephony-plan.md` §12** — the **exact working SIP FQDN handshake**:
  - Telnyx FQDN connection → `sip.rtc.elevenlabs.io` TCP:5060; number points at FQDN connection.
  - ElevenLabs SIP number `supports_inbound:true/outbound:true` → assigned to agent.
  - KEY FIX: ElevenLabs needs `inbound_trunk_config.allowed_addresses` + `outbound_trunk_config.address=sip.telnyx.com transport=tcp`; Telnyx needs an **FQDN** connection (not Credential).
  - Live number already wired: **`+1 212 810 4458`** (line 174: "Inbound AND outbound confirmed").
  - SIP creds in Infisical: `TELNYX_SIP_USER`, `TELNYX_SIP_PASS`, `TELNYX_FQDN_CONNECTION_ID`, `TELNYX_VOICE_NUMBER`.
- **`/Users/moea/Elevenlabs Hackathon/cortex-app/app/api/agent/*/route.ts`** — webhook tool handler template: shared-secret header check, defensive parse, **always return HTTP 200 `{success, message}`** so a tool error never drops the call.
- **TTS-safe prompt rules** (from `cortex-backend/docs/prompt.md` + receptionist prompt): spell out numbers/dates/times as words, commas for pauses, never em-dashes/abbreviations.
- **Outbound-call trigger:** `POST /v1/convai/twilio/outbound-call` `{agent_id, agent_phone_number_id, to_number}` header `xi-api-key` — already half-present in this repo's `/api/call-me/route.ts`.

### Dashboard / CRM design system
Port from **`/Users/moea/Cortex-Dashboard`** (shadcn new-york + Radix + recharts):
- **Theme tokens** (`src/index.css` `:root`/`.dark` HSL) — but Cozmo has its *own* brand (Space Grotesk + Inter, restrained accent). **Decision: keep Cozmo's existing marketing-site design tokens** for brand consistency across site↔dashboard; borrow Cortex-Dashboard's *component structure*, not its cream/crimson palette.
- **Components to port** (framework-agnostic JSX, adapt to Tailwind v4 + App Router): `KpiStatCard`, `PageHeader`, `StatusPill`, `DataTable` (+ the expandable-row pattern from `OrdersTable` → `ContactsTable`), `OrderFilters` → `ContactFilters`, `DashboardChart` (recharts area, add `"use client"`), `EmptyState`/`ErrorState`/`LoadingSkeleton`.
- Vite→Next adaptations noted: `react-router`→`next/navigation`, `import.meta.env`→`process.env`, add `"use client"` to stateful/recharts components, drop the `window`-at-module-load `isIframe` line.

### Scraping
- **Exa MCP** (`mcp__exa__web_search_exa`, `web_fetch_exa`) for discovery + extraction.
- **`/Users/moea/adloop`** (Python) — patterns for a CLI automation harness if useful.

---

## 2. Architecture (the unified system)

```
┌───────────────────────────── Next.js 15 app (one repo, one Vercel project) ─────────────────────────────┐
│                                                                                                           │
│  PUBLIC (already built)                  /dashboard (NEW — gated)                  /api (NEW + existing)   │
│  ─ / (umbrella)                          ─ Overview (KPIs + activity chart)        ─ /api/call-me (exists) │
│  ─ /homeowners                           ─ Contacts (CRM table, expandable)        ─ /api/outbound/*       │
│  ─ /contractors                          ─ Campaigns (sequences + status)          ─ /api/agent/* (tools) │
│  ─ /carriers                             ─ Calls (agent follow-up outcomes)        ─ /api/cron/*          │
│                                          ─ Activity log (timeline)                                         │
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘
            │                                        │                                       │
            ▼                                        ▼                                       ▼
   ┌─────────────────┐                    ┌────────────────────┐                 ┌────────────────────────┐
   │ Claude automation│  scrape→enrich→   │  Supabase (Postgres)│                │  ElevenLabs ConvAI agent│
   │ (TS scripts +    │  personalize→     │  accounts, contacts,│◀───tool───────▶│  "Cozmo" — knows all 4  │
   │  Anthropic SDK + │  queue→follow-up  │  campaigns, messages,│   webhooks     │  sites; follows up      │
   │  Exa)            │──────────────────▶│  calls, activity    │                │  on outbound            │
   └─────────────────┘                    └────────────────────┘                └────────────┬───────────┘
                                                                                              │ SIP (FQDN)
                                                                                   ┌──────────▼───────────┐
                                                                                   │ Telnyx number        │
                                                                                   │ +1 212 810 4458      │
                                                                                   │ (reuse if free)      │
                                                                                   └──────────────────────┘
```

### Data model (Supabase)
- `accounts` — id, name, segment (`contractor` | `tpa`), website, domain, hq_city, hq_state, blurb, source_url, rank, enriched_json, created_at.
- `contacts` — id, account_id FK, name, title, email, phone, linkedin, confidence, created_at.
- `campaigns` — id, name, segment, channel (`email`), status, created_at.
- `sequence_steps` — id, campaign_id FK, step_no, delay_days, subject_template, body_template.
- `messages` — id, account_id FK, contact_id FK, campaign_id FK, channel, subject, body (Claude-personalized), status (`draft`|`queued`|`sent`|`opened`|`replied`|`bounced`), send_mode (`dry_run`|`live`), provider_id, scheduled_at, sent_at, created_at.
- `calls` — id, account_id FK, contact_id FK, trigger (`no_reply`|`opened`|`replied`|`manual`), status, elevenlabs_conversation_id, transcript, outcome, duration_s, recording_url, created_at.
- `activity` — id, account_id FK, type, summary, meta_json, created_at. (timeline feed)

RLS: a single service-role server path for the demo (no public auth needed); dashboard is behind a simple shared-secret/basic gate so it's not wide open.

---

## 3. The Claude automation (the "how you'd build a Claude automation" deliverable)

A small TypeScript automation package (`automation/`) runnable via `npm run outbound:*`, each stage idempotent and logging to Supabase:

1. **`discover`** — Exa search per segment ("top homeowners-claims contractors", "largest TPAs insurance") → candidate domains. Dedupe, rank, cap at 100 + 35. Writes `accounts` (+ caches raw JSON to `automation/data/accounts.snapshot.json` so the demo runs offline).
2. **`enrich`** — for each account, Exa-fetch the site + Claude (Opus) extracts: what they do, segment fit, a personalization hook, best-guess contact. Writes `contacts` + `accounts.enriched_json`.
3. **`personalize`** — Claude (Opus) writes a per-account opener referencing their actual business + the matching Cozmo page (homeowners/contractors/carriers). Tone = the Cozmo brand voice. Writes `messages` as `draft`.
4. **`queue`** — promote drafts → `queued` with a send schedule (sequence steps). In **dry_run** mode "sending" just stamps `sent` + logs to `activity` and writes the rendered email to `automation/outbox/` for inspection; in **live** mode it calls the provider (Resend) — gated behind `OUTBOUND_LIVE=true`.
5. **`follow-up`** — the bridge to the phone agent: accounts with no reply after N days → create a `calls` row (`trigger=no_reply`) and fire the ElevenLabs outbound-call endpoint (or, in dry-run, just queue the call + log it).

**Why Claude here (the narrative for the deliverable):** scraping gets you rows; Claude turns rows into *relevance* — reading each contractor's site and writing an opener a human would believe, picking the right Cozmo landing page per account, and deciding follow-up priority. The same Anthropic SDK call pattern scales from 1 account to 135 with no template-mail-merge tell.

Orchestration options documented: (a) `npm` scripts run manually, (b) a Vercel Cron (`/api/cron/tick`) that advances the queue daily, (c) the full fan-out via the **Workflow tool** for the initial 135-account scrape+enrich+personalize (parallel, fast). I'll implement (a)+(b) and use a Workflow for the bulk enrichment pass.

---

## 4. Phone agent (real, Opus 4.8 + ultrathink)

Hand a dedicated **`effort-max` Opus 4.8 agent** the brief + the 4 sites' content + the reusable templates, with ElevenLabs API access (key from Infisical/.env). It will:
1. Build the **knowledge base** from the 4 Cozmo pages (`lib/content/*.ts` is the source of truth — home/homeowners/contractors/carriers) so the agent can answer "what does Cozmo do for contractors?" accurately.
2. Write the **system prompt** in Cozmo's voice with TTS-safe rules (numbers/dates as words, no em-dashes), persona = a Cozmo outreach follow-up rep who booked/triggered the call, goal = qualify + book a demo (Calendly) + capture intent, guardrails = no fabrication, graceful tool-failure.
3. Define **tools** (webhook → `/api/agent/*`): `book_demo`, `log_interest`, `lookup_account`, `take_message` — each backed by an always-200 route writing to Supabase `calls`/`activity`.
4. **Create the agent** via the `update-agent.sh`-style API flow (clone of the receptionist scripts), attach tools.
5. **Wire the number:** first check whether `+1 212 810 4458` / its `phnum_*` is free to reuse (resolve Infisical creds). If free → reassign to the Cozmo agent. If not → buy one Telnyx number and apply the proven FQDN handshake.
6. **Live tests:** place an outbound call to a test number, verify it answers, knows the sites, books a demo, logs to CRM. Mirror what was used in ElevenLabs before. Capture transcript.

The agent's final config (prompt, tool JSON, IDs) is committed to `automation/agent/` so it's reproducible.

---

## 5. Dashboard (go look at my repos for inspo — done)

Routes under `/app/(dashboard)/dashboard/`:
- **Overview** — KpiStatCards (accounts scraped, emails queued/sent, open/reply rate, calls placed, demos booked) + a recharts activity area chart + recent activity list.
- **Contacts** — ContactsTable (ported expandable-row pattern): per-account row → expand to contacts, message history, call outcomes, the Claude-written opener. Filters: segment / status / has-replied.
- **Campaigns** — sequences, per-step status, send-mode badge (dry-run/live).
- **Calls** — phone-agent follow-up outcomes + transcripts.
- Brand: **Cozmo's existing tokens** (Space Grotesk/Inter, the site's accent) so site↔dashboard feel like one product; Cortex-Dashboard donates structure/components only.
- Data via Supabase server components + a thin client SDK. Gated behind a shared-secret cookie (simple, not a full auth build).

---

## 6. Build order (and where I parallelize)

1. **Supabase project + schema** (MCP: create project → apply migration). Generate TS types.
2. **Automation scaffolding** — `automation/` package, Anthropic + Exa + Supabase clients, `.env` wiring.
3. **Scrape + enrich + personalize 135 accounts** — via a **Workflow** (parallel fan-out), write to Supabase + snapshot. *(token-heavy → delegated, not inline)*
4. **Dashboard** — port components, build the 4 routes against real Supabase data. *(can run parallel to #5 via a worker)*
5. **Phone agent** — the Opus `effort-max` agent builds + wires + tests it. *(parallel to #4; isolated by API surface)*
6. **Unify + outbound API routes** (`/api/outbound/*`, `/api/agent/*`, `/api/cron/tick`).
7. **Deploy to new Vercel project**, set env, smoke-test the live URL.
8. **Tests** — typecheck, build, Playwright smoke of site+dashboard, an automation dry-run end-to-end, a live agent call. Then `/bookend`.

### Delegation map (per global efficient-frontier rule)
- **Scrape/enrich/personalize** → Workflow with Sonnet workers (bounded extraction) + Opus for personalization quality; Haiku finders for discovery.
- **Dashboard port** → `worker-deep` (Opus) — design judgment in adapting v3→v4 + App Router.
- **Phone agent** → `effort-max` (Opus 4.8 + ultrathink) — the user explicitly asked for this; live infra + subtle SIP work.
- **Verification** → fresh `verifier` (escalated to Opus for the SIP/agent claims) — adversarially confirm the call actually worked, the dry-run actually wrote rows.
- Orchestration/integration/final review stays central (me).

---

## 7. Risks & how I de-risk

| Risk | Mitigation |
|---|---|
| ElevenLabs/Telnyx creds not reachable headless | Resolve via Infisical first; if absent, build agent config + one-command instantiate script and report exactly what to run. Never block the rest. |
| Buying a Telnyx number unattended | Reuse the existing wired number if free; only buy if not, and the user OK'd that. |
| Scrape returns junk / rate-limited | Cap + dedupe + cache snapshot; Claude validates segment fit; demo never depends on a live scrape. |
| Live email deliverability | Default **dry_run**; live path gated behind explicit env flag, tested only against user's own inbox. |
| Vercel serverless + Supabase | Server components/route handlers with service role; no local disk reliance. |
| Tailwind v3→v4 port friction | Keep Cozmo's existing v4 tokens; port component *structure* only; add `"use client"` where needed. |
| Scope creep / not finishing | Build order front-loads the real backend + automation; phone-agent live-call is the one external dependency, isolated so it can't block deploy. |

---

## 8. Definition of done
- [ ] Supabase has 135 real accounts + enriched contacts + Claude-personalized drafts.
- [ ] `npm run outbound:*` runs the full pipeline in dry-run, writing rows + an inspectable outbox.
- [ ] Dashboard (Overview/Contacts/Campaigns/Calls) renders real Supabase data, on-brand.
- [ ] ElevenLabs "Cozmo" agent exists, knows the 4 sites, books a demo; **one live test call placed + transcript captured** (or, if creds truly unreachable, a one-command instantiate + the reason documented).
- [ ] Whole app deployed to a new Vercel project; live URL returned; site + dashboard smoke-tested.
- [ ] Typecheck + build green; Playwright smoke green; `/bookend`.
