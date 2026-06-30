import { NextResponse } from "next/server";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * "Cozmo calls you" trigger. Provider-agnostic: the body shape
 * ({ phone } in, { ok } out) is identical whether you wire ElevenLabs,
 * Vapi, Retell, or Bland behind it. With no provider env set it returns
 * a graceful 503 telling the caller to dial the line directly - so the
 * UI is fully functional in a preview without placing real calls.
 */

// Naive in-memory limiter (resets on cold start) - enough for a demo.
const hits = new Map<string, number[]>();
function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > max;
}

function normalize(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const ten =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (ten.length !== 10) return null;
  if (/^[01]/.test(ten)) return null; // US area code can't start with 0 or 1
  return `+1${ten}`;
}

export async function POST(req: Request) {
  let body: {
    phone?: string;
    name?: string;
    email?: string;
    honeypot?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  // Honeypot: pretend success, place no call.
  if (body.honeypot && body.honeypot.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const to = normalize(body.phone ?? "");
  if (!to) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit US number." },
      { status: 400 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(`p:${to}`, 1, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "We just called that number. Give it a minute." },
      { status: 429 },
    );
  }
  if (limited(`ip:${ip}`, 5, 24 * 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Daily demo limit reached for this network." },
      { status: 429 },
    );
  }

  const apiKey = process.env.VOICE_API_KEY;
  const agentId = process.env.VOICE_AGENT_ID;
  const agentPhoneId = process.env.VOICE_AGENT_PHONE_ID;

  // No provider configured → graceful demo fallback.
  if (!apiKey || !agentId || !agentPhoneId) {
    return NextResponse.json(
      {
        error: `Live calling isn't wired in this preview. Dial Cozmo directly at ${SITE.demoPhone}.`,
      },
      { status: 503 },
    );
  }

  try {
    // ElevenLabs Conversational AI over Twilio. Swap URL + body for Vapi/Retell/Bland.
    const res = await fetch(
      "https://api.elevenlabs.io/v1/convai/twilio/outbound-call",
      {
        method: "POST",
        headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: agentId,
          agent_phone_number_id: agentPhoneId,
          to_number: to,
        }),
      },
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "Our line is busy. Try again in a moment." },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Couldn't place the call. Try again." },
      { status: 502 },
    );
  }
}
