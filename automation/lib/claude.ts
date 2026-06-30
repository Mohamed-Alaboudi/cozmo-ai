/**
 * Claude wrapper for the automation. Routes generation through the
 * Claude Code CLI (`claude -p`) so no raw ANTHROPIC_API_KEY is required —
 * the CLI uses the user's existing auth. Each call is a one-shot,
 * non-interactive completion. We force JSON-only output where needed and
 * parse defensively.
 */
import { spawn } from "node:child_process";

export type ClaudeOpts = {
  model?: string;
  /** Max time to wait for a single completion. */
  timeoutMs?: number;
};

const DEFAULT_MODEL = "claude-sonnet-4-6";

/** Run one prompt through `claude -p`, return the raw text reply. */
export function claude(prompt: string, opts: ClaudeOpts = {}): Promise<string> {
  const model = opts.model ?? DEFAULT_MODEL;
  const timeoutMs = opts.timeoutMs ?? 120_000;
  return new Promise((resolve, reject) => {
    const child = spawn("claude", ["-p", "--model", model], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    let out = "";
    let err = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`claude -p timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) reject(new Error(`claude -p exited ${code}: ${err.slice(0, 300)}`));
      else resolve(out.trim());
    });
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

/**
 * Run a prompt and parse the reply as JSON. The prompt should ask for
 * JSON only; we still strip code fences and locate the first JSON value
 * so a stray prose line doesn't break the run.
 */
export async function claudeJson<T = unknown>(
  prompt: string,
  opts: ClaudeOpts = {}
): Promise<T> {
  const raw = await claude(
    prompt +
      "\n\nReturn ONLY valid JSON. No prose, no markdown fences, no commentary.",
    opts
  );
  return extractJson<T>(raw);
}

export function extractJson<T = unknown>(raw: string): T {
  let s = raw.trim();
  // Strip ```json ... ``` fences if present.
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  // Otherwise locate the first { or [ and its matching close.
  const start = s.search(/[[{]/);
  if (start === -1) throw new Error(`No JSON found in reply: ${raw.slice(0, 200)}`);
  const open = s[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let end = -1;
  let inStr = false;
  let esc = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  const slice = end === -1 ? s.slice(start) : s.slice(start, end + 1);
  return JSON.parse(slice) as T;
}
