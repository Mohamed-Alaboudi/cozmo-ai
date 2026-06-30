import { NextResponse } from "next/server";
import { dbAdmin } from "@/lib/db/client";

/**
 * Shared helpers for the Cozmo agent webhook tools.
 *
 * Every tool route follows the same contract:
 *   - authenticate with the `x-agent-secret` header (=== AGENT_SHARED_SECRET)
 *   - parse the body defensively (never throw on bad JSON)
 *   - write to the `cozmo` schema via dbAdmin() (service role, schema-pinned)
 *   - ALWAYS return HTTP 200 with { success, message } so a tool failure
 *     can never drop the live phone call.
 *
 * call_id lifecycle: the outbound call is triggered with a pre-created
 * cozmo.calls row id, injected into the conversation as the `call_id`
 * dynamic variable. Tools UPDATE that row rather than inserting orphans.
 */

export const dynamic = "force-dynamic";

/** Uniform always-200 JSON envelope the agent can read back. */
export function ok(success: boolean, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ success, message, ...(extra ?? {}) }, { status: 200 });
}

/** Constant-time-ish shared-secret check. Returns true when authorized. */
export function authorized(req: Request): boolean {
  const expected = process.env.AGENT_SHARED_SECRET;
  if (!expected) return false;
  const got = req.headers.get("x-agent-secret") ?? "";
  // Lengths differ → not equal; avoids a length-leak short-circuit mattering here.
  if (got.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= got.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

/** Parse JSON body without ever throwing. */
export async function readBody<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    return {} as T;
  }
}

/** Trim a value to a string or undefined (handles non-string inputs). */
export function str(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}

/**
 * Best-effort: resolve a cozmo.accounts.id from a company name or domain so
 * activity / calls rows can be linked to the right account when one exists.
 * Never throws; returns null when nothing matches or the lookup errors.
 */
export async function resolveAccountId(
  db: ReturnType<typeof dbAdmin>,
  opts: { company?: string; domain?: string },
): Promise<string | null> {
  try {
    if (opts.domain) {
      const host = opts.domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      const { data } = await db
        .from("accounts")
        .select("id")
        .ilike("domain", `%${host}%`)
        .limit(1)
        .maybeSingle();
      if (data?.id) return data.id;
    }
    if (opts.company) {
      const { data } = await db
        .from("accounts")
        .select("id")
        .ilike("name", `%${opts.company}%`)
        .limit(1)
        .maybeSingle();
      if (data?.id) return data.id;
    }
  } catch {
    /* ignore — linkage is best-effort */
  }
  return null;
}
