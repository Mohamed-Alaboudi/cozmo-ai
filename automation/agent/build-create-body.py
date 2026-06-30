#!/usr/bin/env python3
"""Build the ElevenLabs create-agent body for the rebuilt Cozmo agent.

Clones the structure of the snapshot (so we keep the tuned asr/turn/vad/
conversation/built_in_tools and the 4 tool_ids) and applies the deltas the
user asked for: Hamood voice, steadier model + slower speed for natural pacing,
the `elevenlabs` TTS normalizer so numbers/emails are read correctly, patient
turn-taking so it doesn't talk over the caller, and the freshly written prompt.

Usage:
  python3 automation/agent/build-create-body.py <snapshot.json> <prompt.md> > body.json
"""
import json, sys

snap_path, prompt_path = sys.argv[1], sys.argv[2]
snap = json.load(open(snap_path))
SYSTEM = open(prompt_path).read()

cc = snap["conversation_config"]
agent = cc["agent"]
prompt = agent["prompt"]
tts = cc["tts"]

FIRST = ("Hi, this is Cozmo, reaching out from Cozmo about how you handle your "
         "claim intake calls. Did I catch you at an okay time?")

# Keep the 4 real tool ids that were attached to the old agent.
tool_ids = [t for t in (prompt.get("tool_ids") or []) if t]

body = {
    "name": "Cozmo - Insurance Outreach (Outbound)",
    "conversation_config": {
        "asr": cc.get("asr", {}),
        "vad": cc.get("vad", {}),
        "turn": {
            **cc.get("turn", {}),
            # Patience so the agent stops jumping in on the caller.
            "turn_eagerness": "patient",
            # Check in after ~5s of silence (was 12s), per user request.
            "turn_timeout": 5.0,
            # Back-channel words must not cut the agent off.
            "interruption_ignore_terms": ["gotcha", "mm-hmm", "mhm", "right", "okay", "yeah", "uh huh"],
        },
        "conversation": cc.get("conversation", {}),
        "agent": {
            "language": agent.get("language", "en"),
            "first_message": FIRST,
            # Don't let the opener get chopped.
            "disable_first_message_interruptions": True,
            "prompt": {
                "prompt": SYSTEM,
                "llm": prompt.get("llm", "gpt-4o"),
                "temperature": prompt.get("temperature", 0.4),
                "max_tokens": prompt.get("max_tokens", -1),
                "tool_ids": tool_ids,
                "built_in_tools": prompt.get("built_in_tools", {}),
                "enable_parallel_tool_calls": prompt.get("enable_parallel_tool_calls", False),
            },
        },
        "tts": {
            # NOTE: Eleven v3 Conversational (Expressive mode) is the ideal per research
            # (audio tags + prosody turn-taking), but this account returns
            # "Expressive TTS is not allowed" (feature_not_available). Falling back to
            # multilingual_v2 with the bigger non-model levers: lower stability + the
            # paraphrase-not-recite prompt. Flip model_id->eleven_v3 + expressive_mode->True
            # once the plan has Expressive enabled.
            "voice_id": "6S78YB8nPV68dVimio5N",          # Hamood (Instant clone)
            "model_id": "eleven_multilingual_v2",          # steadier + good number normalization
            "speed": 0.9,                                   # 0.9-1.1 = most natural (docs)
            "stability": 0.7,                               # steadier: stops short-sentence swing (0.8 flat, 0.4 erratic)
            "similarity_boost": 0.85,                       # higher = holds one consistent timbre across turns
            # NOTE: `seed` (for determinism) is a raw-TTS-API field; the ConvAI agent
            # config silently drops it, so it is intentionally not set here. Consistency
            # comes from stability 0.7 + the full-sentence acknowledgment prompt rule.
            "text_normalisation_type": "elevenlabs",        # post-LLM normalizer (correct number/email reads)
            "optimize_streaming_latency": 0,                # no latency opt -> best pronunciation/pacing
            "agent_output_audio_format": tts.get("agent_output_audio_format", "pcm_16000"),
            "pronunciation_dictionary_locators": tts.get("pronunciation_dictionary_locators", []),
        },
    },
    # Layer 2 of "block random questions": platform guardrails that run independently
    # of the LLM. focus = keep on-topic (reinforces the system-prompt redirect rules);
    # prompt_injection = detect/block instruction-override + jailbreak attempts.
    "platform_settings": {
        **snap.get("platform_settings", {}),
        "guardrails": {
            "version": "1",
            "focus": {"is_enabled": True},
            "prompt_injection": {"is_enabled": True},
        },
    },
}
print(json.dumps(body))
