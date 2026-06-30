#!/bin/sh
# Registers the 4 Cozmo agent webhook tools in ElevenLabs and prints their IDs.
#
# The tools POST to the Next.js App Router handlers under
# /api/agent/<tool> and authenticate with the x-agent-secret header.
#
# Usage:
#   set -a; . ./.env.local; set +a
#   TOOL_BASE="https://<public-host>" sh automation/agent/create-tools.sh
#
# TOOL_BASE must be a public HTTPS origin where the Cozmo app's
# /api/agent/* routes are reachable (a Vercel deployment, or a Cloudflare
# quick tunnel during local testing). AGENT_SHARED_SECRET and
# ELEVENLABS_API_KEY come from the environment (.env.local).
set -e

BASE="${TOOL_BASE:?Set TOOL_BASE to the public origin serving /api/agent/*}"
SECRET="${AGENT_SHARED_SECRET:?Set AGENT_SHARED_SECRET}"
API="https://api.elevenlabs.io/v1/convai/tools"
H_KEY="xi-api-key: $ELEVENLABS_API_KEY"
H_JSON="Content-Type: application/json"

create () {
  NAME="$1"; BODY="$2"
  RESP=$(curl -s -X POST "$API" -H "$H_KEY" -H "$H_JSON" -d "$BODY")
  ID=$(printf '%s' "$RESP" | python3 -c "import sys,json
d=json.load(sys.stdin)
print(d.get('id') or d.get('tool_id') or (d.get('tool_config',{}) or {}).get('id') or 'ERR:'+json.dumps(d)[:300])")
  echo "$NAME=$ID"
}

# Shared secret header reused by every tool. ElevenLabs expects request_headers
# as a dict keyed by header name with a plain string value.
SECRET_HEADER="\"request_headers\": { \"x-agent-secret\": \"$SECRET\" }"

# Shared dynamic-variable wiring: call_id is injected per call so writes update
# the right cozmo.calls row. We declare it as a query/body param sourced from a
# dynamic variable on the conversation.

create "book_demo" "{
  \"tool_config\": {
    \"type\": \"webhook\",
    \"name\": \"book_demo\",
    \"description\": \"Call this when the person agrees to a demo or a follow up meeting with Cozmo. Collect their company, their name, their email, and a rough time that works before calling. Always pass call_id. Wait for a success result before telling them the demo is booked.\",
    \"response_timeout_secs\": 20,
    \"api_schema\": {
      \"url\": \"$BASE/api/agent/book_demo\",
      \"method\": \"POST\",
      $SECRET_HEADER,
      \"request_body_schema\": {
        \"type\": \"object\",
        \"properties\": {
          \"call_id\": {\"type\": \"string\", \"description\": \"The call_id dynamic variable for this call. Always pass it.\"},
          \"company\": {\"type\": \"string\", \"description\": \"The company the person works at\"},
          \"contactName\": {\"type\": \"string\", \"description\": \"The person's full name\"},
          \"email\": {\"type\": \"string\", \"description\": \"The email to send the calendar invite to\"},
          \"when\": {\"type\": \"string\", \"description\": \"A rough time that works for the demo, in the caller's words\"},
          \"notes\": {\"type\": \"string\", \"description\": \"Any useful context for the team\"}
        },
        \"required\": [\"call_id\"]
      }
    }
  }
}"

create "log_interest" "{
  \"tool_config\": {
    \"type\": \"webhook\",
    \"name\": \"log_interest\",
    \"description\": \"Call this near the end of most calls to record where the person landed. Set level to interested, not_interested, or callback. Always pass call_id and a short note.\",
    \"response_timeout_secs\": 20,
    \"api_schema\": {
      \"url\": \"$BASE/api/agent/log_interest\",
      \"method\": \"POST\",
      $SECRET_HEADER,
      \"request_body_schema\": {
        \"type\": \"object\",
        \"properties\": {
          \"call_id\": {\"type\": \"string\", \"description\": \"The call_id dynamic variable for this call. Always pass it.\"},
          \"company\": {\"type\": \"string\", \"description\": \"The company the person works at\"},
          \"level\": {\"type\": \"string\", \"description\": \"One of interested, not_interested, or callback\"},
          \"notes\": {\"type\": \"string\", \"description\": \"A short note on how the call went\"}
        },
        \"required\": [\"call_id\", \"level\"]
      }
    }
  }
}"

create "lookup_account" "{
  \"tool_config\": {
    \"type\": \"webhook\",
    \"name\": \"lookup_account\",
    \"description\": \"Call this to get real context on the company you are calling before or early in the call. Pass company or domain. If it returns details, reference them naturally. If it returns nothing, proceed without inventing facts.\",
    \"response_timeout_secs\": 20,
    \"api_schema\": {
      \"url\": \"$BASE/api/agent/lookup_account\",
      \"method\": \"POST\",
      $SECRET_HEADER,
      \"request_body_schema\": {
        \"type\": \"object\",
        \"properties\": {
          \"company\": {\"type\": \"string\", \"description\": \"Company name to look up\"},
          \"domain\": {\"type\": \"string\", \"description\": \"Company website domain to look up\"}
        },
        \"required\": []
      }
    }
  }
}"

create "take_message" "{
  \"tool_config\": {
    \"type\": \"webhook\",
    \"name\": \"take_message\",
    \"description\": \"Call this when the person wants someone specific to follow up, or asks something to route to a human. Capture the caller name, a callback phone if given, and the message. Always pass call_id.\",
    \"response_timeout_secs\": 20,
    \"api_schema\": {
      \"url\": \"$BASE/api/agent/take_message\",
      \"method\": \"POST\",
      $SECRET_HEADER,
      \"request_body_schema\": {
        \"type\": \"object\",
        \"properties\": {
          \"call_id\": {\"type\": \"string\", \"description\": \"The call_id dynamic variable for this call. Always pass it.\"},
          \"company\": {\"type\": \"string\", \"description\": \"The company the person works at\"},
          \"caller\": {\"type\": \"string\", \"description\": \"The caller's name\"},
          \"phone\": {\"type\": \"string\", \"description\": \"A callback phone number if given\"},
          \"body\": {\"type\": \"string\", \"description\": \"What the caller needs, summarized\"}
        },
        \"required\": [\"call_id\", \"body\"]
      }
    }
  }
}"
