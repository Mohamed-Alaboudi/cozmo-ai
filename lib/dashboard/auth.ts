import { cookies } from "next/headers";

/**
 * Demo-grade shared-secret gate for the Cozmo CRM dashboard.
 *
 * Not production SSO — a single shared password (DASHBOARD_PASSWORD) unlocks an
 * httpOnly cookie that the dashboard layout checks server-side. We store a
 * salted hash of the password as the cookie value (never the password itself),
 * so a leaked cookie can't be replayed as the password and the value rotates if
 * the password changes.
 */

export const DASH_COOKIE = "cozmo_dash";

/** The configured password (defaults to the documented demo value). */
function password(): string {
  return process.env.DASHBOARD_PASSWORD ?? "cozmo-demo";
}

/** Stable, non-reversible token derived from the password. */
async function token(): Promise<string> {
  const data = new TextEncoder().encode(`cozmo::${password()}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(digest).toString("hex");
}

/** Constant-time-ish compare to validate a submitted password. */
export function passwordMatches(submitted: string): boolean {
  const a = submitted ?? "";
  const b = password();
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** The value to write into the auth cookie once a password is accepted. */
export async function sessionToken(): Promise<string> {
  return token();
}

/** True when the current request carries a valid dashboard session cookie. */
export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  const value = jar.get(DASH_COOKIE)?.value;
  if (!value) return false;
  return value === (await token());
}
