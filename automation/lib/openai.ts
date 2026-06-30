/**
 * OpenAI wrapper for the automation — structured extraction during enrichment.
 * Uses OPENAI_API_KEY (loaded from .env.local / Infisical). Mirrors claude.ts's
 * `claudeJson()` shape and reuses its defensive `extractJson()` so callers can
 * swap Claude→OpenAI with no change to how they consume the result.
 */
import { loadEnv } from "./env";
import { extractJson } from "./claude";

loadEnv();

const KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
const BASE = "https://api.openai.com/v1";

export const openaiConfigured = Boolean(KEY);

export type OpenAiOpts = {
  model?: string;
  timeoutMs?: number;
  /** Ask the API for a guaranteed-JSON object response. */
  jsonMode?: boolean;
};

/** Run one prompt through the Chat Completions API, return the raw text reply. */
export async function openai(prompt: string, opts: OpenAiOpts = {}): Promise<string> {
  if (!KEY) throw new Error("OPENAI_API_KEY not set");
  const model = opts.model ?? MODEL;
  const timeoutMs = opts.timeoutMs ?? 120_000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`OpenAI ${res.status}: ${t.slice(0, 300)}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return (data.choices?.[0]?.message?.content ?? "").trim();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Run a prompt and parse the reply as JSON. Uses the API's json_object mode and
 * still runs the defensive extractor so a stray fence/prose line can't break it.
 */
export async function openaiJson<T = unknown>(
  prompt: string,
  opts: OpenAiOpts = {},
): Promise<T> {
  const raw = await openai(
    prompt +
      "\n\nReturn ONLY valid JSON. No prose, no markdown fences, no commentary.",
    { ...opts, jsonMode: true },
  );
  return extractJson<T>(raw);
}
