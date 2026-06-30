# Cozmo Insurance Outreach Phone Agent

A live ElevenLabs conversational phone agent that calls insurance contractors,
TPAs, and carriers as the phone follow up to Cozmo's outbound email outreach. It
knows Cozmo's offering, qualifies the lead, and books a demo, writing every
outcome back into the `cozmo` Supabase schema.

## Live IDs (as built 2026-06-30)

| Thing | Value |
|---|---|
| ElevenLabs agent | `agent_5301kwbtt4hsf3197ft3rm79g4jd` ("Cozmo - Insurance Outreach (Outbound)") |
| LLM / voice / TTS | `gpt-4o` · voice `JLoQGscVswB5SeQe5wul` · `eleven_flash_v2` |
| ElevenLabs phone number | `phnum_7601kwbtyz4ne0a8fbper16pj7av` (provider `sip_trunk`, supports inbound+outbound) |
| Telnyx number (fresh, purchased) | **`+1 346 248 8408`** — phone_number_id `2993585140828997174` |
| Telnyx FQDN connection | `2993584682165077544` ("cozmo-elevenlabs", TCP) |
| Telnyx FQDN record | `2993584684371281450` → `sip.rtc.elevenlabs.io:5060` |
| Telnyx outbound voice profile | `2993584547016214048` ("Cozmo Outbound", conversational) |
| Telnyx SIP user | `cozmo9190db32` (password in Telnyx connection; not committed) |

### Tool IDs (registered in ElevenLabs)

| Tool | ID | Route |
|---|---|---|
| `book_demo` | `tool_2801kwbtswzke31r9g0db38j3b1w` | `POST /api/agent/book_demo` |
| `log_interest` | `tool_7501kwbtsxaffvpsd7m683e5w4dn` | `POST /api/agent/log_interest` |
| `lookup_account` | `tool_7701kwbtsxgwf7988w784kc6d5b9` | `POST /api/agent/lookup_account` |
| `take_message` | `tool_9301kwbtsxpfe1majpppnjbw2b99` | `POST /api/agent/take_message` |

> The tool IDs above were registered against an ephemeral Cloudflare tunnel used
> for the first live test. **Before production, re-run `create-tools.sh` with
> `TOOL_BASE` set to the deployed Cozmo Vercel URL**, then re-run `upsert-agent.sh`
> with the new IDs so the agent points at stable webhooks (see "Re-running").

## SIP wiring (the proven handshake)

The chain, matching the working Cortex Clinic setup:

```
ElevenLabs agent  ──sip_trunk──▶  ElevenLabs SIP number phnum_7601...
        │  outbound_trunk: sip.telnyx.com TCP, credential auth (user cozmo9190db32)
        ▼
Telnyx FQDN connection 2993584682165077544  (TCP)
        │  FQDN record → sip.rtc.elevenlabs.io : 5060
        │  outbound voice profile 2993584547016214048
        │  SIP credentials user_name/password (match the EL outbound_trunk creds)
        ▼
Telnyx number +1 346 248 8408  (active, assigned to the connection)
```

Key facts that make it work (the confirmed bug sources):

1. **Outbound calls use `POST /v1/convai/sip-trunk/outbound-call`** — NOT the
   `/twilio/outbound-call` endpoint. A Telnyx SIP-trunk number is not a Twilio
   number.
2. The ElevenLabs SIP number needs
   `inbound_trunk_config.allowed_addresses = [sip.telnyx.com, 192.76.120.10, 192.76.120.20]`
   and `outbound_trunk_config.address = sip.telnyx.com transport = tcp`.
3. Telnyx needs an **FQDN connection (not a Credential connection)** whose FQDN
   record points at `sip.rtc.elevenlabs.io` over **TCP:5060**, with an outbound
   voice profile attached. The connection was set to IP/token auth so the
   outbound profile would attach, then given SIP credentials that match the
   ElevenLabs `outbound_trunk` credentials.
4. We did **not** reuse the existing Infisical livekit FQDN connection
   (`2989606889035138933`) — it points at `23jxtp694v5.sip.livekit.cloud`, not
   ElevenLabs, so a fresh connection was created.

We also did **not** touch `+1 212 810 4458` (the live Cortex Clinic number on
agent `agent_9901ktfd1dq3fymtr1jnbgcz9dh9`).

## The `call_id` lifecycle (how tools update the right row)

1. The outbound call is triggered with a **pre-created `cozmo.calls` row id**.
2. That id is injected into the conversation via
   `conversation_initiation_client_data.dynamic_variables.call_id` on the
   `sip-trunk/outbound-call` request.
3. The system prompt references it as `{{call_id}}` and instructs the agent to
   pass exactly that value to `book_demo`, `log_interest`, and `take_message`.
4. Those route handlers `UPDATE cozmo.calls WHERE id = call_id` (set `outcome`,
   `demo_booked`, etc.) instead of inserting orphan rows. If `call_id` is
   missing or invalid, they fall back to an insert so nothing is lost.

Verified in the live test: the agent received `call_id =
3e1b8a67-4217-4ec5-8f2b-4b4105c1a8ac` (visible in the conversation's
`dynamic_variables`).

## The tools and the backing routes

Each tool is an ElevenLabs webhook that POSTs JSON to a Next.js App Router
handler under `app/api/agent/<tool>/route.ts`. Every handler:

- checks the `x-agent-secret` header against `AGENT_SHARED_SECRET`,
- parses the body defensively (never throws on bad JSON),
- writes to the `cozmo` schema via `dbAdmin()` (service role, schema-pinned),
- **always returns HTTP 200** with `{ success, message }` so a tool failure can
  never drop the live call.

Schema note: `cozmo.calls` has no `company`/`email`/`contactName` columns, so
those land in `cozmo.activity.meta_json`; the call row carries `outcome`,
`demo_booked`, `status`, `duration_s`, `elevenlabs_conversation_id`, and
`transcript`. `lookup_account` reads `cozmo.accounts`
(`name/blurb/mapped_page/fit_reason/segment`).

## Re-running

```sh
# 0. Load secrets (never printed, never committed)
set -a; . ./.env.local; set +a
# Telnyx ops in this build used the livekit-project Telnyx key (the .env.local
# TELNYX_API_KEY differs); fetch it if you need to touch Telnyx again:
#   infisical secrets get TELNYX_API_KEY --projectId 588066b3-accd-4136-9e3f-d32a3564989e --env dev --plain

# 1. Register the 4 tools against a public origin serving /api/agent/*
#    (a Vercel deployment, or a Cloudflare quick tunnel for local testing).
TOOL_BASE="https://<your-deployed-host>" sh automation/agent/create-tools.sh
#    -> prints book_demo=tool_... etc.

# 2. Create or update the agent with those tool ids.
#    Create (first time): leave COZMO_AGENT_ID unset.
#    Update (idempotent): export COZMO_AGENT_ID=agent_5301kwbtt4hsf3197ft3rm79g4jd
sh automation/agent/upsert-agent.sh <book_demo_id> <log_interest_id> <lookup_account_id> <take_message_id>

# 3. Verify the agent came back correct
curl -s -H "xi-api-key: $ELEVENLABS_API_KEY" \
  https://api.elevenlabs.io/v1/convai/agents/agent_5301kwbtt4hsf3197ft3rm79g4jd | python3 -m json.tool | head -40
```

### Place an outbound call (the exact trigger)

Pre-create a `cozmo.calls` row, then trigger via the **sip-trunk** endpoint,
passing its id as the `call_id` dynamic variable:

```sh
set -a; . ./.env.local; set +a
CALL_ID="<uuid of a freshly inserted cozmo.calls row>"
TO="+1XXXXXXXXXX"
curl -s -X POST https://api.elevenlabs.io/v1/convai/sip-trunk/outbound-call \
  -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" \
  -d "{
    \"agent_id\": \"agent_5301kwbtt4hsf3197ft3rm79g4jd\",
    \"agent_phone_number_id\": \"phnum_7601kwbtyz4ne0a8fbper16pj7av\",
    \"to_number\": \"$TO\",
    \"conversation_initiation_client_data\": { \"dynamic_variables\": { \"call_id\": \"$CALL_ID\" } }
  }"
# -> { "success": true, "conversation_id": "conv_...", "sip_call_id": "SCL_..." }

# Pull the transcript afterwards:
curl -s -H "xi-api-key: $ELEVENLABS_API_KEY" \
  https://api.elevenlabs.io/v1/convai/conversations/<conversation_id> | python3 -m json.tool
```

The first live test placed a call from `+1 346 248 8408` to `+1 734 292 0276`
(the owner's `DEMO_SMS_TO` number); see `BUILD-LOG.md`.
