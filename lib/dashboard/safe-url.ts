/**
 * Guard DB-sourced URLs before they reach an href/src.
 *
 * Account/source/recording URLs come from scraped + seeded data, so a
 * malicious or malformed value (e.g. a `javascript:` URI) must never be
 * placed directly into an anchor. Returns the URL only when it is an
 * http(s) link, otherwise null — callers render the <a> only when non-null.
 */
export function safeExternalHref(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}
