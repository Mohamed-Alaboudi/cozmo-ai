/**
 * Thin Exa REST client for discovery + page-content fetch. Uses
 * EXA_API_KEY from the environment. If the key is absent, callers fall
 * back to the cached snapshot so the pipeline always runs for a demo.
 */
import { loadEnv } from "./env";

loadEnv();

const KEY = process.env.EXA_API_KEY;
const BASE = "https://api.exa.ai";

export const exaConfigured = Boolean(KEY);

export type ExaResult = {
  title?: string;
  url: string;
  text?: string;
  publishedDate?: string;
  author?: string;
};

async function post<T>(path: string, body: unknown): Promise<T> {
  if (!KEY) throw new Error("EXA_API_KEY not set");
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": KEY },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Exa ${path} ${res.status}: ${t.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/** Neural/keyword search. Returns results, optionally with page text. */
export async function exaSearch(
  query: string,
  opts: { numResults?: number; text?: boolean; category?: string } = {}
): Promise<ExaResult[]> {
  const body: Record<string, unknown> = {
    query,
    numResults: opts.numResults ?? 10,
    type: "auto",
  };
  if (opts.category) body.category = opts.category;
  if (opts.text) body.contents = { text: { maxCharacters: 2500 } };
  const data = await post<{ results: ExaResult[] }>("/search", body);
  return data.results ?? [];
}

/** Fetch cleaned page text for a set of URLs. */
export async function exaContents(urls: string[]): Promise<ExaResult[]> {
  if (urls.length === 0) return [];
  const data = await post<{ results: ExaResult[] }>("/contents", {
    urls,
    text: { maxCharacters: 3000 },
  });
  return data.results ?? [];
}
