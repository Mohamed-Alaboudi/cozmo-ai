/**
 * STAGE 2 — enrich: for each account missing enrichment, fetch its site text
 * (Scrapling) and have OpenAI extract a blurb, HQ, the best-fit Cozmo page, a
 * "why this account" reason, AND a decision-maker contact (name/title/email).
 *
 * Idempotent: only processes accounts where fit_reason IS NULL (or --all / --id).
 * Runs LOCALLY (needs python3 + `pip install scrapling`, and OPENAI_API_KEY).
 *
 * Usage:
 *   npx tsx automation/scripts/enrich.ts             # all un-enriched
 *   npx tsx automation/scripts/enrich.ts --id <uuid> # one account (Workflow drives this)
 *   npx tsx automation/scripts/enrich.ts --limit 20
 */
import { db, logActivity } from "../lib/db";
import { scrape } from "../lib/scrapling";
import { openaiJson } from "../lib/openai";
import { COZMO_CONTEXT } from "../lib/cozmo-context";
import type { Enrichment } from "../lib/types";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

async function enrichOne(acc: {
  id: string;
  name: string;
  segment: string;
  website: string | null;
  domain: string | null;
  blurb: string | null;
}) {
  // Pull page text with Scrapling; otherwise enrich from name + domain alone.
  let siteText = acc.blurb ?? "";
  let pageLinks: string[] = [];
  if (acc.website && siteText.length < 200) {
    try {
      const page = await scrape(acc.website, 2800);
      if (page.ok && page.text) {
        siteText = page.text.slice(0, 2500);
        pageLinks = page.links ?? [];
      }
    } catch {
      /* fall back to name-only enrichment */
    }
  }

  const prompt = `${COZMO_CONTEXT}

You are qualifying a sales target for Cozmo and pulling its best contact. Company:

Name: ${acc.name}
Segment (our guess): ${acc.segment}
Website: ${acc.website ?? "unknown"}
Site text (may be empty): """${siteText.slice(0, 2200)}"""
Links found on the page (may include team/contact/about): ${pageLinks.slice(0, 25).join(", ") || "none"}

The "Name" above may be a web-page title rather than the real company name
(e.g. "Commercial Restoration Services Near You" for a domain like servpro.com).
Infer the actual company name from the domain and text.

Return a JSON object with these fields:
{
  "company_name": "the REAL company name (e.g. 'Servpro', 'Paul Davis Restoration'), inferred from the domain — not the page title",
  "blurb": "one tight sentence on what this company actually does",
  "hq_city": "city or empty string if unknown",
  "hq_state": "2-letter US state or empty string",
  "mapped_page": "homeowners | contractors | carriers — which Cozmo landing page best fits this account",
  "fit_reason": "one specific sentence: WHY this company is a good Cozmo target, referencing their actual business and the concrete call-volume / claims pain Cozmo would solve for them",
  "contact_name": "the real name of the most likely buyer/decision-maker if it appears in the text, else empty string",
  "contact_title_guess": "their job title, e.g. 'VP of Claims Operations' (best guess if not stated)",
  "contact_email": "a real email address found in the text, else empty string (do NOT invent one)",
  "is_real_target": true if this is a real restoration/contractor or TPA/claims-admin company; false if it's a directory, listicle, blog, franchise-ranking, or aggregator (e.g. modernize.com, franchisechatter.com)
}
Be concrete and specific to THIS company. Only use emails/names actually present in the text; otherwise leave them empty.`;

  const e = await openaiJson<Enrichment>(prompt);

  const mapped =
    e.mapped_page === "homeowners" || e.mapped_page === "contractors" || e.mapped_page === "carriers"
      ? e.mapped_page
      : acc.segment === "contractor"
      ? "contractors"
      : "carriers";

  // Adopt the cleaned company name when Claude produced a sensible one.
  const cleanName =
    e.company_name && e.company_name.length >= 2 && e.company_name.length <= 80
      ? e.company_name.trim()
      : acc.name;

  await db
    .from("accounts")
    .update({
      name: cleanName,
      blurb: e.blurb?.slice(0, 500) ?? acc.blurb,
      hq_city: e.hq_city || null,
      hq_state: (e.hq_state || "").slice(0, 2) || null,
      mapped_page: mapped,
      fit_reason: e.fit_reason?.slice(0, 600) ?? null,
      // Mark aggregators/listicles so the demo can filter to real targets.
      rank: e.is_real_target === false ? 999 : undefined,
      enriched_json: e as unknown as Record<string, unknown>,
    })
    .eq("id", acc.id);

  // Best-guess single contact (low confidence — generic role inbox).
  const { data: hasContact } = await db
    .from("contacts")
    .select("id")
    .eq("account_id", acc.id)
    .maybeSingle();
  if (!hasContact) {
    const realName = (e.contact_name ?? "").trim();
    const realEmail = (e.contact_email ?? "").trim();
    const emailLooksReal = /.+@.+\..+/.test(realEmail);
    await db.from("contacts").insert({
      account_id: acc.id,
      name: realName || "(decision maker)",
      title: e.contact_title_guess?.slice(0, 120) ?? "VP, Claims Operations",
      email: emailLooksReal
        ? realEmail.slice(0, 160)
        : acc.domain
        ? `claims@${acc.domain}`
        : null,
      // High confidence only when we found a real name AND a real email.
      confidence: realName && emailLooksReal ? "high" : "low",
    });
  }

  await logActivity(acc.id, "enriched", `Enriched ${acc.name} → ${mapped}`, {
    fit_reason: e.fit_reason,
  });
  console.log(`  ✓ ${acc.name} → ${mapped}`);
}

async function main() {
  const id = arg("--id");
  const all = process.argv.includes("--all");
  const limit = Number(arg("--limit") ?? "200");

  let q = db.from("accounts").select("id,name,segment,website,domain,blurb");
  if (id) q = q.eq("id", id);
  else if (!all) q = q.is("fit_reason", null);
  q = q.limit(limit);

  const { data: accounts, error } = await q;
  if (error) throw error;
  if (!accounts?.length) {
    console.log("Nothing to enrich.");
    return;
  }
  console.log(`Enriching ${accounts.length} account(s)...`);
  for (const acc of accounts) {
    try {
      await enrichOne(acc);
    } catch (e) {
      console.warn(`  ✗ ${acc.name}: ${(e as Error).message}`);
    }
  }
  console.log("Enrich done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
