/**
 * Node → Scrapling bridge. Scrapling is a Python framework, so we shell out to
 * automation/py/scrape.py (which prints one JSON object) and parse it. This is a
 * drop-in replacement for the old exa.ts `exaContents()` page-text fetch.
 *
 * Runs LOCALLY (needs python3 + `pip install scrapling`). Never call from a
 * Vercel serverless function — enrichment is an offline batch job; the deployed
 * dashboard only reads the resulting Supabase rows.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export type ScrapeResult = {
  ok: boolean;
  url: string;
  title?: string;
  text?: string;
  links?: string[];
  error?: string;
};

// Prefer the project venv (automation/py/.venv) so Scrapling is isolated from
// the system Python (macOS PEP 668 blocks system-wide installs). Override with
// PYTHON_BIN. Falls back to python3 if the venv isn't present.
const VENV_PY = resolve(process.cwd(), "automation/py/.venv/bin/python");
const PY = process.env.PYTHON_BIN ?? (existsSync(VENV_PY) ? VENV_PY : "python3");
const SCRIPT = resolve(process.cwd(), "automation/py/scrape.py");

/** Tells callers whether the scraper is runnable in this environment. */
export const scraplingConfigured = true; // resolved at call time; errors are caught

/** Fetch cleaned page text + title + links for ONE url via Scrapling. */
export function scrape(url: string, maxChars = 3000): Promise<ScrapeResult> {
  return new Promise((resolveP) => {
    const child = spawn(PY, [SCRIPT, url, "--max-chars", String(maxChars)], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "";
    let err = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolveP({ ok: false, url, error: "scrape timed out" });
    }, 90_000);
    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));
    child.on("error", (e) =>
      resolveP({ ok: false, url, error: `spawn ${PY}: ${String(e)}` }),
    );
    child.on("close", () => {
      clearTimeout(timer);
      try {
        resolveP(JSON.parse(out.trim()) as ScrapeResult);
      } catch {
        resolveP({
          ok: false,
          url,
          error: `bad scraper output: ${(err || out).slice(0, 200)}`,
        });
      }
    });
  });
}

/** Convenience: just the page text (empty string on failure). */
export async function scrapeText(url: string, maxChars = 3000): Promise<string> {
  const r = await scrape(url, maxChars);
  return r.ok ? r.text ?? "" : "";
}
