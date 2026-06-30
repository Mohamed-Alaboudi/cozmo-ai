/**
 * Minimal .env.local loader for the tsx-run automation scripts.
 * No dependency on dotenv — parses KEY=VALUE lines, ignores comments,
 * and does not overwrite vars already present in the real environment
 * (so EXA_API_KEY from the shell wins, and CI can override).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

let loaded = false;

export function loadEnv() {
  if (loaded) return;
  loaded = true;
  for (const file of [".env.local", ".env"]) {
    try {
      const text = readFileSync(resolve(process.cwd(), file), "utf8");
      for (const raw of text.split("\n")) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        const eq = line.indexOf("=");
        if (eq === -1) continue;
        const k = line.slice(0, eq).trim();
        const v = line.slice(eq + 1).trim();
        if (process.env[k] === undefined) process.env[k] = v;
      }
    } catch {
      /* file optional */
    }
  }
}
