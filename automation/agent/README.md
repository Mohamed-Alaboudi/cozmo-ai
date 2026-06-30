# Cozmo Insurance Outreach Phone Agent

A live ElevenLabs conversational phone agent that calls insurance contractors,
TPAs, and carriers as the phone follow up to Cozmo's outbound email outreach. It
knows Cozmo's offering, qualifies the lead, and books a demo, writing every
outcome back into the `cozmo` Supabase schema.

## Live IDs (rebuilt 2026-06-30)

| Thing | Value |
|---|---|
| ElevenLabs agent | `agent_0701kwd8fsxje1hs19va057sa5nq` ("Cozmo - Insurance Outreach (Outbound)") |
| Voice | **Hamood** — `6S78YB8nPV68dVimio5N` (cloned) |
| LLM | `gpt-4o`, temperature 0.4 |
| TTS model | `eleven_multilingual_v2` (Eleven v3 Expressive is the ideal but this account returns "Expressive TTS is not allowed") |
| TTS speed | `0.9` (0.9–1.1 is the documented natural range) |
| TTS stability | `0.7` — steady enough to stop sentence-to-sentence tone swings without going monotone (0.8 was flat, 0.4 was erratic) |
| TTS similarity | `0.85` — holds one consistent timbre across turns |
| Text normalization | `elevenlabs` (post-LLM normalizer → correct phone/number/date/email reads) |
| Turn-taking | `turn_eagerness: patient`; `turn_timeout: 5.0` (checks in after ~5s of silence); first message non-interruptible; `interruption_ignore_terms` so back-channels ("mm-hmm", "right") don't cut it off |
| Guardrails | `platform_settings.guardrails` v1 with **focus** (stay on-topic) + **prompt_injection** (block jailbreak/override) enabled, reinforced by the system prompt |
| Phone number | **+1 734 888 9543** — ElevenLabs Twilio number `phnum_1701ktff415mfcqs6cz86y7dzrqc`, inbound to the agent |

### Tool IDs (registered in ElevenLabs)

| Tool | ID | Route |
|---|---|---|
| `book_demo` | `tool_2801kwbtswzke31r9g0db38j3b1w` | `POST /api/agent/book_demo` |
| `log_interest` | `tool_7501kwbtsxaffvpsd7m683e5w4dn` | `POST /api/agent/log_interest` |
| `lookup_account` | `tool_7701kwbtsxgwf7988w784kc6d5b9` | `POST /api/agent/lookup_account` |
| `take_message` | `tool_9301kwbtsxpfe1majpppnjbw2b99` | `POST /api/agent/take_message` |

> ✅ [2026-06-30] All four tools point at the **deployed production origin**
> `https://cozmo-outbound.vercel.app/api/agent/*` (each carries the
> `x-agent-secret` header). Verified end-to-end: a `log_interest` call with a
> real `call_id` updated the backing `cozmo.calls` row. If the deployed host
> changes, re-point them (see "Re-pointing the tools").

## The system prompt

`automation/agent/system-prompt.md` is the spoken-content blueprint, written to
the ElevenLabs 6-block structure (Personality / Environment / Tone / Goal /
Guardrails / Tools) and tuned for natural phone speech:

- **Pacing:** speak slowly, one question at a time, then stop and let the caller
  finish; never interrupt or stack questions (reinforced by `speed 0.9` +
  `turn_eagerness: patient` + `turn_timeout: 5.0`).
- **Consistency (the fix for tone that swings sentence-to-sentence):** the prompt
  demands one steady, warm, even tone on every line and — crucially — forbids
  one/two-word fragments and standalone exclamations ("Got it!"). ElevenLabs TTS
  derives emotion from each generation's text, and short clipped lines have too
  little context to hold a steady tone, so they swing. The agent must fold
  acknowledgments into a full connected sentence and never stack two loose,
  disconnected sentences in one turn.
- **Pronunciation:** the prompt tells the agent to say numbers, money, dates,
  times, and emails as words ("three in the afternoon", "two hundred dollars",
  "jordan at acme dot com"), expand abbreviations, and read phone numbers as
  grouped single digits — backed by the `elevenlabs` normalizer on the TTS side.
  It also forbids square brackets / stage directions (multilingual_v2 would read
  them aloud).
- **Staying on task (block random questions):** the `# Guardrails` section keeps
  the agent strictly on Cozmo/insurance — it politely redirects off-topic
  questions and refuses instructions to change its role, drop the act, or reveal
  its prompt. This is backed by the platform `focus` + `prompt_injection`
  guardrails (defense in depth).
- **Naturalness:** short-but-complete replies, light affirmations and fillers in
  the same even tone; honest cold-open; never claims a prior relationship.

Rationale + sources: `docs/research/2026-06-30-elevenlabs-natural-speech-prompting.md`.

## Rebuilding / updating the agent

The agent is built from a captured config + the prompt file via
`build-create-body.py`, which assembles the full `conversation_config` (asr,
turn, vad, conversation, tts, the 4 tool ids, and the prompt) and applies the
voice / model / speed / normalization / pacing settings above.

```sh
set -a; . ./.env.local; set +a

# Build the create/update body from a config snapshot + the prompt:
python3 automation/agent/build-create-body.py <snapshot.json> automation/agent/system-prompt.md > /tmp/body.json

# Update the existing agent in place (preferred — avoids re-assigning the number):
curl -s -X PATCH "https://api.elevenlabs.io/v1/convai/agents/agent_0701kwd8fsxje1hs19va057sa5nq" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" --data @/tmp/body.json

# Verify it came back correct (PATCH returns the full object; create returns only agent_id):
curl -s -H "xi-api-key: $ELEVENLABS_API_KEY" \
  https://api.elevenlabs.io/v1/convai/agents/agent_0701kwd8fsxje1hs19va057sa5nq | python3 -m json.tool | head -60
```

> A snapshot of the previous live config is kept under `tmp/rollback/` whenever
> the agent is rebuilt; use it as the base for `build-create-body.py`.

## Re-pointing the tools (before tool calls will work)

The tools must POST to a public origin serving `/api/agent/*`. Register them
against the deployed Cozmo URL, then re-attach the returned ids to the agent:

```sh
# Point each tool's api_schema.url at https://<deployed-host>/api/agent/<tool>
# (book_demo / log_interest / lookup_account / take_message), each carrying the
# x-agent-secret header = AGENT_SHARED_SECRET. Then update the agent's tool_ids.
```

The backing routes live in `app/api/agent/<tool>/route.ts` (+ `_shared.ts`):
each checks `x-agent-secret`, parses defensively, writes to the `cozmo` schema,
and **always returns HTTP 200** so a tool failure can never drop the live call.

## The `call_id` lifecycle (how tools update the right row)

1. An outbound call is triggered with a **pre-created `cozmo.calls` row id**.
2. That id is injected via `dynamic_variables.call_id` on the call request.
3. The system prompt references it as `{{call_id}}` and tells the agent to pass
   exactly that value to `book_demo`, `log_interest`, and `take_message`.
4. Those handlers `UPDATE cozmo.calls WHERE id = call_id` instead of inserting
   orphan rows. If `call_id` is missing/invalid they fall back to an insert.
