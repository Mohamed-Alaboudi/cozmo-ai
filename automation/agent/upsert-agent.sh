#!/bin/sh
# Creates or updates the Cozmo outreach phone agent in ElevenLabs.
#
# The full system prompt is read from automation/agent/system-prompt.md so the
# spoken content stays reviewable as text. Pass the 4 tool ids (from
# create-tools.sh) as arguments to attach them.
#
# Usage:
#   set -a; . ./.env.local; set +a
#   # create (no COZMO_AGENT_ID set) or update (export COZMO_AGENT_ID=agent_...)
#   sh automation/agent/upsert-agent.sh <book_demo_id> <log_interest_id> <lookup_account_id> <take_message_id>
#
# Prints the agent_id. Re-running with COZMO_AGENT_ID set is idempotent.
set -e

H_KEY="xi-api-key: $ELEVENLABS_API_KEY"
H_JSON="Content-Type: application/json"
PROMPT_FILE="$(dirname "$0")/system-prompt.md"
[ -f "$PROMPT_FILE" ] || { echo "missing $PROMPT_FILE"; exit 1; }

# Build the request body. The prompt is injected from the file via env so we
# never have to escape it inside the heredoc.
COZMO_PROMPT="$(cat "$PROMPT_FILE")" python3 - "$@" <<'PY' > /tmp/cozmo-agent-body.json
import json, os, sys

SYSTEM = os.environ["COZMO_PROMPT"]

FIRST = ("Hi, this is Cozmo, I'm reaching out from Cozmo about your claim intake "
         "call handling. Do you have a quick minute?")

tool_ids = [t for t in sys.argv[1:] if t and not t.startswith("ERR")]

body = {
  "name": "Cozmo - Insurance Outreach (Outbound)",
  "conversation_config": {
    "agent": {
      "language": "en",
      "first_message": FIRST,
      "prompt": {
        "prompt": SYSTEM,
        "llm": "gpt-4o",
        "temperature": 0.4,
        "tool_ids": tool_ids,
      },
    },
    "tts": {
      "voice_id": "JLoQGscVswB5SeQe5wul",
      "model_id": "eleven_flash_v2",
    },
  },
}
print(json.dumps(body))
PY

echo "agent body bytes: $(wc -c < /tmp/cozmo-agent-body.json)"

if [ -n "$COZMO_AGENT_ID" ]; then
  echo "Updating existing agent $COZMO_AGENT_ID ..."
  URL="https://api.elevenlabs.io/v1/convai/agents/$COZMO_AGENT_ID"
  RESP=$(curl -s -X PATCH "$URL" -H "$H_KEY" -H "$H_JSON" --data @/tmp/cozmo-agent-body.json)
else
  echo "Creating new agent ..."
  URL="https://api.elevenlabs.io/v1/convai/agents/create"
  RESP=$(curl -s -X POST "$URL" -H "$H_KEY" -H "$H_JSON" --data @/tmp/cozmo-agent-body.json)
fi

printf '%s' "$RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
aid=d.get('agent_id')
if aid:
    ca=d.get('conversation_config',{}).get('agent',{})
    p=ca.get('prompt',{})
    print('OK agent_id:', aid)
    print('name:', d.get('name'))
    print('llm:', p.get('llm'))
    print('tool_ids:', p.get('tool_ids'))
    print('first_message:', (ca.get('first_message') or '')[:80])
else:
    print('RESPONSE:', json.dumps(d)[:600])
    sys.exit(1)
"
