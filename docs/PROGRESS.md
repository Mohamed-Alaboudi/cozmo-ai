# Progress log

Append-only. Most recent first. Date stamps as `## YYYY-MM-DD`.
Never edit past entries — supersede with a new one if facts change.
This is portable long-term memory: track failed approaches so future sessions don't re-attempt them.

---

## 2026-06-30 (later) — tool webhooks live

The 4 ElevenLabs tool webhooks were re-pointed off the dead Cloudflare tunnel to the
**deployed production origin** `https://cozmo-outbound.vercel.app/api/agent/*` (Vercel
project `cozmo-outbound`, team personal-3f062084). Deployed the current branch to prod
first (the `/api/agent/*` routes had never been deployed — they 404'd live), verified
each route returns 200 with the secret gate working, then PATCHed each tool's
`api_schema.url` (preserving the `x-agent-secret` header + body schema). Proven
end-to-end: a `log_interest` call with a real `call_id` flipped the backing
`cozmo.calls` row's `outcome` to `interest_interested`. The earlier "known follow-up"
about dead tool webhooks is now resolved. Demo-booking / CRM writes work.

Note: the Vercel MCP token can't reach this team (SAML scope error); used the `vercel`
CLI directly. `book_demo`/`take_message`/`log_interest`/`lookup_account` all 200.

## 2026-06-30

**Cozmo phone agent rebuilt and shipped — READY.** The live ElevenLabs Conversational AI
outreach agent was deleted and rebuilt from scratch this session, tuned for natural speech,
and re-pointed to a Cortex Clinic number per request. Owner confirmed it sounds good on a live call.

Live state (verified via API at ship time):
- **Agent:** `agent_0701kwd8fsxje1hs19va057sa5nq` ("Cozmo - Insurance Outreach (Outbound)").
- **Voice:** Hamood `6S78YB8nPV68dVimio5N` (Instant clone).
- **TTS:** `eleven_multilingual_v2`, stability `0.7`, similarity `0.85`, speed `0.9`, `elevenlabs` normalization.
- **Turn-taking:** `turn_eagerness: patient`, `turn_timeout: 5.0` (checks in after ~5s silence), first message non-interruptible, `interruption_ignore_terms` for back-channels.
- **Guardrails:** `platform_settings.guardrails` v1 with **focus** + **prompt_injection** enabled, reinforced by the system prompt (stay on Cozmo/insurance, refuse off-topic + role-override).
- **Tools:** 4 attached (`book_demo`, `log_interest`, `lookup_account`, `take_message`).
- **Number:** **+1 734 888 9543** (ElevenLabs Twilio `phnum_1701ktff415mfcqs6cz86y7dzrqc`), moved off the Cortex Clinic Front Desk agent to the Cozmo agent. The clinic keeps its other line **+1 212 810 4458** (verified intact).

What changed:
- Deleted the old agent `agent_5301kwbtt4hsf3197ft3rm79g4jd`; rebuilt via the new `automation/agent/build-create-body.py` (assembles the full `conversation_config` + `platform_settings` from a config snapshot + `system-prompt.md`).
- Rewrote `automation/agent/system-prompt.md` to the ElevenLabs 6-block structure, grounded in a deep-research pass on ElevenLabs + Cartesia natural-speech docs (saved at `~/.claude/deep-research/2026-06-30-natural-ai-phone-agents-elevenlabs-cartesia.md`; rationale mirrored in `docs/research/2026-06-30-elevenlabs-natural-speech-prompting.md`).
- Removed dead build artifacts: `upsert-agent.sh`, `create-tools.sh`, `BUILD-LOG.md`.
- Updated `automation/agent/README.md` and `docs/DEMO.md` to the shipped config.

Iteration history on voice quality (what we learned, so we don't redo it):
- stability `0.8` → sounded like **reading off words** (monotone). Too high.
- stability `0.4` → **inconsistent**, sentences swung mellow↔excited. Too low.
- Landed **stability `0.7`** + a prompt rule to **paraphrase, not recite** + **no clipped one/two-word fragments** (fold acknowledgments into a full sentence). Root cause of the swing: ElevenLabs TTS derives emotion from each generation's text, and short fragments have too little context to hold a steady tone.

Dead-ends (do NOT re-attempt):
- **Eleven v3 / Expressive mode** (audio tags + prosody turn-taking) is the documented ideal, but this account returns **`"Expressive TTS is not allowed"` (feature_not_available)** on PATCH. Blocked until the plan enables Expressive. The builder has a commented note to flip `model_id`→`eleven_v3` + `expressive_mode`→True once available.
- **`seed`** (for deterministic delivery) is a raw-TTS-API field; the ConvAI agent config **silently drops it** (comes back `null`). Not usable here.
- The cortex-phone-agents **`cozmo` tester mode dials +1 346 248 8408 → the cortex cascaded agent, NOT this ElevenLabs agent.** To exercise the EL agent, place an ElevenLabs outbound call (`/v1/convai/twilio/outbound-call`) or call its inbound number +1 734 888 9543 directly. Testing this session used EL outbound calls to the owner.
- During the rebuild, a freshly-created agent **vanished** between create and call (a concurrent actor in this shared tree deleted it — see the shared-worktree-collision memory). Mitigation: after create, re-verify existence + re-confirm the number assignment immediately before dialing.

Known follow-up (not blocking "ready"):
- The 4 tool webhooks still point at a **dead Cloudflare quick-tunnel** (`circus-silk-higher-follows.trycloudflare.com`) from the original build, so demo-booking/CRM writes won't fire until the tools are re-pointed at the deployed Cozmo URL. The conversation (voice/pacing/pitch) works fully without them. Re-point per `automation/agent/README.md` → "Re-pointing the tools".

Dead-ends / open questions: none blocking.
