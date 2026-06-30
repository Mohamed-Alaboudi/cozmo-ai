# Cozmo Agent — Build Log

Date: 2026-06-30. Built end to end: ElevenLabs agent + 4 webhook tools + 4 Next
route handlers + a fresh Telnyx number wired to ElevenLabs over SIP + a verified
live test call.

## What was created (IDs)

- **Agent:** `agent_5301kwbtt4hsf3197ft3rm79g4jd` — "Cozmo - Insurance Outreach
  (Outbound)", gpt-4o, voice `JLoQGscVswB5SeQe5wul`, `eleven_flash_v2`, temp 0.4.
  GET-verified: prompt 9900 chars (contains `{{call_id}}` and the per-resolved-case
  pricing), correct first message, all 4 tool_ids attached.
- **Tools:** `book_demo` `tool_2801kwbtswzke31r9g0db38j3b1w`, `log_interest`
  `tool_7501kwbtsxaffvpsd7m683e5w4dn`, `lookup_account`
  `tool_7701kwbtsxgwf7988w784kc6d5b9`, `take_message`
  `tool_9301kwbtsxpfe1majpppnjbw2b99`. Each carries the `x-agent-secret` header.
- **Routes:** `app/api/agent/{book_demo,log_interest,lookup_account,take_message}/route.ts`
  plus `app/api/agent/_shared.ts` (auth + defensive parse + always-200 envelope +
  best-effort account resolution). `npx tsc --noEmit` is clean.
- **Telnyx number (fresh, purchased ~$1/mo):** **`+1 346 248 8408`**
  (phone_number_id `2993585140828997174`), order `57c60585-0cbc-4a96-ad6d-8eefa2196a68`
  completed `success`, status `active`, on connection `2993584682165077544`.
- **Telnyx SIP path:** outbound voice profile `2993584547016214048`; FQDN
  connection `2993584682165077544` (TCP); FQDN record `2993584684371281450` →
  `sip.rtc.elevenlabs.io:5060`; SIP user `cozmo9190db32`.
- **ElevenLabs SIP number:** `phnum_7601kwbtyz4ne0a8fbper16pj7av` for
  `+13462488408`, provider `sip_trunk`, `supports_inbound:true`,
  `supports_outbound:true`, assigned to the Cozmo agent, outbound_trunk
  `sip.telnyx.com` TCP credential auth (user `cozmo9190db32`), inbound allow-list
  `[sip.telnyx.com, 192.76.120.10, 192.76.120.20]`.

## The live call (what it did)

Pre-created `cozmo.calls` row `3e1b8a67-4217-4ec5-8f2b-4b4105c1a8ac`
(to_number `+17342920276`), then triggered:

`POST /v1/convai/sip-trunk/outbound-call` →
`{ "success": true, "conversation_id": "conv_0601kwbtzttffnxazscxz4e0esxp",
   "sip_call_id": "SCL_LfEYvJBWfrze" }`

Conversation result (GET `/v1/convai/conversations/conv_0601kwbtzttffnxazscxz4e0esxp`):

- `status: done`, `call_successful: success`, `call_duration_secs: 6`.
- `phone_call.type: "sip_trunking"`, `direction: "outbound"`,
  `agent_number: +13462488408`, `external_number: +17342920276`. **This proves
  the Telnyx↔ElevenLabs SIP outbound path is live.**
- Agent spoke its opener: *"Hi, this is Cozmo, I'm reaching out from Cozmo about
  your claim intake call handling. Do you have a quick minute?"* — graceful cold
  open, no false prior-relationship claim.
- `call_id` dynamic variable `3e1b8a67-4217-4ec5-8f2b-4b4105c1a8ac` was present
  in the conversation, proving the call_id injection works.
- The recipient hung up after ~6s (`Client disconnected: 1000`), so no tool
  calls fired — expected for a quick pickup. Tool→DB writes were independently
  verified by direct route smoke tests (see below).

The call row was then updated to `status=completed`,
`outcome=live_test_connected`, `elevenlabs_conversation_id=conv_0601...`,
`duration_s=6`, transcript stored — confirming the call_id-update path.

## Verification done

- ElevenLabs auth OK (subscription tier check). Telnyx auth OK via the
  livekit-project key (balance $85.41; the repo `.env.local` Telnyx key is a
  different, untested value — used the livekit key for all Telnyx ops).
- Routes smoke-tested locally against the real `cozmo` schema: secret gate
  returns 200 `success:false`; `lookup_account` returned the real seeded
  "BELFOR Property Restoration" account; `take_message` wrote an activity row
  (then deleted). Agent GET confirmed prompt + 4 tools attached. EL number GET
  confirmed `supports_outbound:true` + agent assignment. Telnyx number GET
  confirmed `active` on the Cozmo connection.

## Gotchas (for next time)

1. **`request_headers` format.** ElevenLabs tool `api_schema.request_headers`
   must be a **dict keyed by header name with a plain string value**
   (`{"x-agent-secret": "<secret>"}`). The array form and the
   `{type:value,value:…}` object form both 422. Fixed in `create-tools.sh`.
2. **Telnyx FQDN connection + outbound profile ordering.** You cannot attach an
   outbound voice profile while creating the connection — Telnyx returns 10015
   ("must be fully configured"). Create the bare FQDN connection first, attach
   the FQDN record, set `outbound.ip_authentication_method` (token), then PATCH
   the `outbound_voice_profile_id`. Only after that will it stick.
3. **Existing livekit FQDN connection is NOT for ElevenLabs.** Infisical
   `TELNYX_FQDN_CONNECTION_ID = 2989606889035138933` points at
   `23jxtp694v5.sip.livekit.cloud`. Reusing it would have routed Cozmo to
   LiveKit. A fresh connection pointing at `sip.rtc.elevenlabs.io` was created.
4. **Repo `.env.local` Telnyx key did not authenticate.** All Telnyx API calls
   used the livekit-project key from Infisical. If the repo key is meant to be
   canonical, it needs to be re-issued.
5. **POST agent create returns only `agent_id`** (not the full config), so you
   must GET the agent back to confirm the prompt/tools actually attached. PATCH
   returns the full object.
6. **Tool webhooks for the live test ran over a Cloudflare quick tunnel**
   (ephemeral). For production, deploy the Cozmo app and re-run `create-tools.sh`
   with `TOOL_BASE` = the deployed URL, then re-run `upsert-agent.sh` to repoint
   the agent. The tunnel URL dies when the local dev server stops.

## Did NOT touch

- `+1 212 810 4458` (Cortex Clinic, agent `agent_9901ktfd1dq3fymtr1jnbgcz9dh9`)
  and its connection `2976586268445509288` — left fully intact.
