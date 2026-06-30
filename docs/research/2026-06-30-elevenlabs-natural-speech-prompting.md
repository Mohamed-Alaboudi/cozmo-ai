# ElevenLabs ConvAI — natural speech + correct pronunciation (applied to the Cozmo agent)

Date: 2026-06-30. Sources: ElevenLabs docs (prompting-guide, TTS best-practices/normalization,
models), the elevenlabs/skills agents SKILL.md, and the local cortex tester runbook
(`cortex-phone-agents/cortex-backend/docs/runbooks/tester.md`) which documents the *same*
"agent talks too fast / over the caller" failure on the sibling clinic ConvAI agent and its fix.

## System-prompt structure (the 6 building blocks)

Use markdown headings — the model prioritizes/interprets instructions more reliably:

```
# Personality   – named character, 2-3 traits
# Environment   – where they are, who they talk to, the channel (phone)
# Tone          – vocal style as bullets (THIS is where naturalness lives)
# Goal          – what success looks like; number the steps for multi-step flows
# Guardrails    – non-negotiable rules (model pays extra attention to this heading)
# Tools         – when/how to use each tool, sequencing, failure handling
```

- One action per line. Keep instructions short + action-based.
- Mark critical steps with "This step is important."
- Put tone guidance ONCE (in `# Tone` or `# Personality`); don't repeat it everywhere.

## Naturalness (from the ElevenLabs reference "Alexis" agent)

- Keep spoken replies **under ~3 sentences**.
- Use **affirmations** ("Sure thing", "Got it") and natural **filler words** ("so", "you know", "I mean").
- Allow **mild disfluencies / false starts** to sound human, not scripted.
- Spoken output should contain **no abbreviations, no math notation, no special alphabets** — write the way it should be said.
- Conditional tone: "If the user is frustrated, acknowledge their concerns before proceeding."

## Pacing / turn-taking (the "don't speak too fast" fix)

The local tester runbook found the sibling clinic ConvAI agent (`agent_9901…`, the very agent
whose number we're taking) **speaks too fast and talks over the caller**. Prescribed fix, which
we apply to Cozmo:

1. **TTS speed below 1.0** (≈0.85–0.9) in voice settings.
2. **Use a steadier, non-Flash TTS model** — Flash/Turbo are latency-optimized and read fast.
3. Prompt directives:
   - "Speak slowly and calmly."
   - "Ask ONE question at a time, then STOP and wait for the caller to finish before saying anything else. Do not stack questions."
   - "After you ask a question, pause and give the caller a few seconds to respond. Never start your next sentence until they've clearly finished."
   - "If the caller is mid-sentence or hesitating, stay silent and let them finish — never interrupt or finish their sentence."

## Pronunciation / normalization (the "doesn't read words weirdly" fix) — DECISIVE

- **Flash v2.5 + Flash/Turbo: text normalization is OFF by default** → phone numbers, dates,
  currency, times get mispronounced. The current Cozmo agent was on `eleven_turbo_v2`.
- **`eleven_multilingual_v2` normalizes numbers much better** — ElevenLabs explicitly recommends
  it "for phone numbers and other cases where number normalization is important." It also reads
  more steadily (less rushed). → **We switch the Cozmo agent to `eleven_multilingual_v2`.**
- Belt-and-suspenders, set the agent's TTS **normalization strategy to `elevenlabs`** (post-LLM
  normalizer): more reliable than LLM-based, keeps transcripts clean ("$1,000"), minor latency.
- Also instruct the LLM in-prompt to write numbers/symbols/emails as words. Examples:
  - cardinal `123` → "one hundred twenty-three"
  - phone `123-456-7890` → "one two three, four five six, seven eight nine zero"
  - money `$45.67` → "forty-five dollars and sixty-seven cents"
  - percent `100%` → "one hundred percent"; units `100km` → "one hundred kilometers"
  - email `a@b.com` → "a at b dot com"; URL `x.io/y` → "x dot io slash y"
  - abbreviations expand: `Dr.`→Doctor, `Ave.`→Avenue, `St.`→Street (but keep "St. Patrick")
  - acronyms: write how they're said (e.g. "SOC two type two", "F-N-O-L" or "first notice of loss").
- **Tool-param gotcha:** when normalization/STT puts spoken-form text in context, tool params can
  receive "john at gmail dot com". Each tool param description must state the expected written
  format with an example, AND the prompt tells the agent to pass properly-formatted values
  (real email with @, digits-only phone). The 4 Cozmo tools collect email/phone — handled in prompt.

## Net changes applied to the Cozmo agent

- voice → `6S78YB8nPV68dVimio5N` (Hamood original; was Hamood V2 `JLoQ…`).
- tts model → `eleven_multilingual_v2` (was `eleven_turbo_v2`).
- tts speed → ~0.88.
- normalization strategy → `elevenlabs`.
- system prompt → rewritten to the 6-block structure with pacing + normalization + naturalness.
- 4 tools re-attached (book_demo / log_interest / lookup_account / take_message).
