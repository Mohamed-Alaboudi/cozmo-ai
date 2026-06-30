/**
 * STAGE 2 — enrich: for each account missing enrichment, fetch its site text
 * (Exa) and have Claude extract a blurb, HQ, the best-fit Cozmo page, and a
 * "why this account" reason. Also creates a best-guess decision-maker contact.
 *
 * Idempotent: only processes accounts where fit_reason IS NULL (or --all / --id).
 *
 * Usage:
 *   npx tsx automation/scripts/enrich.ts             # all un-enriched
 *   npx tsx automation/scripts/enrich.ts --id <uuid> # one account (Workflow drives this)
 *   npx tsx automation/scripts/enrich.ts --limit 20
 */
import { db, logActivity } from "../lib/db";
import { exaContents, exaConfigured } from "../lib/exa";
import { claudeJson } from "../lib/claude";
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
  // Pull page text if we can; otherwise enrich from name + domain alone.
  let siteText = acc.blurb ?? "";
  if (exaConfigured && acc.website && siteText.length < 200) {
    try {
      const [page] = await exaContents([acc.website]);
      if (page?.text) siteText = page.text.slice(0, 2500);
    } catch {
      /* fall back to name-only enrichment */
    }
  }

  const prompt = `${COZMO_CONTEXT}

You are qualifying a sales target for Cozmo. Here is the company:

Name: ${acc.name}
Segment (our guess): ${acc.segment}
Website: ${acc.website ?? "unknown"}
Site text (may be empty): """${siteText.slice(0, 2200)}"""

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
  "contact_title_guess": "the job title of the most likely buyer, e.g. 'VP of Claims Operations'",
  "is_real_target": true if this is a real restoration/contractor or TPA/claims-admin company; false if it's a directory, listicle, blog, franchise-ranking, or aggregator (e.g. modernize.com, franchisechatter.com)
}
Be concrete and specific to THIS company. Do not invent facts not implied by the name/segment/site.`;

  const e = await claudeJson<Enrichment>(prompt, { model: "claude-sonnet-4-6" });

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
    await db.from("contacts").insert({
      account_id: acc.id,
      name: "(decision maker)",
      title: e.contact_title_guess?.slice(0, 120) ?? "VP, Claims Operations",
      email: acc.domain ? `claims@${acc.domain}` : null,
      confidence: "low",
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
