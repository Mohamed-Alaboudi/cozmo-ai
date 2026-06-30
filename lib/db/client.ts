import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Cozmo data lives in the `cozmo` schema of a shared Supabase project.
 * Supabase only exposes `public` to PostgREST by default, so we pin the
 * client to the `cozmo` schema explicitly. All access is server-side
 * (server components + route handlers) using the service-role key, so we
 * never ship the secret to the browser and don't depend on RLS for the demo.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const schema = (process.env.SUPABASE_DB_SCHEMA ?? "cozmo") as "cozmo";

/** True when the backend is configured. Lets pages render a tasteful
 *  "connect Supabase" state instead of throwing in a fresh checkout. */
export const dbConfigured = Boolean(url && (serviceKey || anonKey));

/** Server-side admin client (service role) — bypasses RLS, full read/write. */
export function dbAdmin() {
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createClient<Database, "cozmo">(url, serviceKey, {
    db: { schema },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Read-only client used where a service role isn't warranted. */
export function dbRead() {
  const key = serviceKey ?? anonKey;
  if (!url || !key) throw new Error("Supabase not configured.");
  return createClient<Database, "cozmo">(url, key, {
    db: { schema },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Convenience row types for the app + automation.
export type Account = Database["cozmo"]["Tables"]["accounts"]["Row"];
export type Contact = Database["cozmo"]["Tables"]["contacts"]["Row"];
export type Campaign = Database["cozmo"]["Tables"]["campaigns"]["Row"];
export type SequenceStep = Database["cozmo"]["Tables"]["sequence_steps"]["Row"];
export type Message = Database["cozmo"]["Tables"]["messages"]["Row"];
export type Call = Database["cozmo"]["Tables"]["calls"]["Row"];
export type Activity = Database["cozmo"]["Tables"]["activity"]["Row"];
