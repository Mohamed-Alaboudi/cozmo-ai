/**
 * Supabase admin client for the automation scripts. Server-side only,
 * service-role, pinned to the `cozmo` schema. Reads .env.local so the
 * scripts run with `tsx` outside Next.
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./env";

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const schema = process.env.SUPABASE_DB_SCHEMA ?? "cozmo";

if (!url || !key) {
  throw new Error(
    "Missing Supabase creds. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY."
  );
}

export const db = createClient(url, key, {
  db: { schema },
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Append a row to the activity timeline (best-effort; never throws). */
export async function logActivity(
  accountId: string | null,
  type: string,
  summary: string,
  meta?: Record<string, unknown>
) {
  try {
    await db.from("activity").insert({
      account_id: accountId,
      type,
      summary,
      meta_json: meta ?? null,
    });
  } catch {
    /* timeline is non-critical */
  }
}
