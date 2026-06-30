#!/usr/bin/env python3
"""
Scrapling-based page fetcher for the Cozmo enrichment pipeline.

Usage:  python3 automation/py/scrape.py <url> [--max-chars 3000]
Output: a single JSON object on stdout:
        {"ok": true, "url": "...", "title": "...", "text": "...", "links": [...]}
        {"ok": false, "url": "...", "error": "..."}

Tries a plain stealthy HTTP fetch first (fast, no browser); falls back to the
dynamic/browser fetcher only if needed. Designed to run LOCALLY (not on Vercel).
Install:  pip install scrapling  (and `scrapling install` for browser fetchers)
"""
import argparse
import json
import sys


def emit(obj):
    sys.stdout.write(json.dumps(obj, ensure_ascii=False))
    sys.stdout.flush()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--max-chars", type=int, default=3000)
    args = ap.parse_args()
    url = args.url

    page = None
    err = None

    # 1) Fast path: stealthy HTTP fetch (impersonates a browser's TLS/headers).
    try:
        from scrapling.fetchers import Fetcher

        page = Fetcher.get(url, stealthy_headers=True, timeout=20)
    except Exception as e:  # noqa: BLE001
        err = f"Fetcher: {e}"

    # 2) Fallback: full browser render for JS-heavy sites.
    if page is None or getattr(page, "status", 0) >= 400:
        try:
            from scrapling.fetchers import StealthyFetcher

            page = StealthyFetcher.fetch(url, headless=True, network_idle=True, timeout=45000)
        except Exception as e:  # noqa: BLE001
            err = (err + " | " if err else "") + f"StealthyFetcher: {e}"

    if page is None:
        emit({"ok": False, "url": url, "error": err or "no page"})
        return

    try:
        text = page.get_all_text(ignore_tags=("script", "style", "noscript"))
    except Exception:  # noqa: BLE001
        text = getattr(page, "text", "") or ""

    title = ""
    try:
        t = page.css_first("title")
        title = t.text.strip() if t else ""
    except Exception:  # noqa: BLE001
        pass

    # A few outbound links help discover contact/about pages downstream.
    links = []
    try:
        for a in page.css("a::attr(href)")[:40]:
            if a:
                links.append(str(a))
    except Exception:  # noqa: BLE001
        pass

    emit(
        {
            "ok": True,
            "url": url,
            "title": title,
            "text": (text or "")[: args.max_chars],
            "links": links,
        }
    )


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # noqa: BLE001
        emit({"ok": False, "url": sys.argv[1] if len(sys.argv) > 1 else "", "error": str(e)})
