/**
 * STAGE 1 — discover: find the target list (top contractors + TPAs) via Exa,
 * dedupe by domain, rank, cap at 100 contractors + 35 TPAs, and upsert to
 * cozmo.accounts. Writes a cached snapshot to automation/data/accounts.snapshot.json
 * so the rest of the pipeline (and the demo) runs offline.
 *
 * Idempotent: re-running upserts by domain, never duplicates.
 *
 * Usage:
 *   npx tsx automation/scripts/discover.ts            # live Exa, else snapshot
 *   npx tsx automation/scripts/discover.ts --snapshot # force snapshot only
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { db, logActivity } from "../lib/db";
import { exaSearch, exaConfigured } from "../lib/exa";
import type { Candidate, Segment } from "../lib/types";

const SNAPSHOT = resolve(process.cwd(), "automation/data/accounts.snapshot.json");
const CONTRACTOR_CAP = 100;
const TPA_CAP = 35;

// Search angles per segment — multiple queries widen real coverage.
const QUERIES: { segment: Segment; q: string }[] = [
  { segment: "contractor", q: "largest property restoration contractors USA water fire storm damage" },
  { segment: "contractor", q: "top disaster restoration companies insurance claims nationwide" },
  { segment: "contractor", q: "biggest roofing and mitigation contractors property insurance claims" },
  { segment: "contractor", q: "national water damage and mold remediation restoration firms" },
  { segment: "tpa", q: "largest third party administrators insurance claims TPA" },
  { segment: "tpa", q: "top insurance claims management outsourcing companies TPA" },
  { segment: "tpa", q: "biggest property and casualty claims administrators United States" },
];

function domainOf(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname
      .replace(/^www\./, "")
      .toLowerCase();
  } catch {
    return undefined;
  }
}

/** Junk domains that show up in "top N" listicles but aren't real targets. */
const BLOCK = [
  "wikipedia.org", "linkedin.com", "facebook.com", "youtube.com", "indeed.com",
  "glassdoor.com", "reddit.com", "yelp.com", "bbb.org", "crunchbase.com",
  "crunchbase.com", "zoominfo.com", "dnb.com", "thomasnet.com", "forbes.com",
  "inc.com", "ibisworld.com", "statista.com", "g2.com", "clutch.co",
];

async function discoverViaExa(): Promise<Candidate[]> {
  const byDomain = new Map<string, Candidate>();
  for (const { segment, q } of QUERIES) {
    let results;
    try {
      results = await exaSearch(q, { numResults: 20, text: false });
    } catch (e) {
      console.warn(`  exa search failed for "${q}": ${(e as Error).message}`);
      continue;
    }
    for (const r of results) {
      const domain = domainOf(r.url);
      if (!domain || BLOCK.some((b) => domain.endsWith(b))) continue;
      if (byDomain.has(domain)) continue;
      const name = (r.title ?? domain)
        .replace(/\s*[|\-–—:].*$/, "") // strip "Company | tagline"
        .replace(/\s+\d{4}.*$/, "")
        .trim()
        .slice(0, 80);
      byDomain.set(domain, {
        name: name || domain,
        segment,
        website: `https://${domain}`,
        domain,
        source_url: r.url,
        blurb: r.text?.slice(0, 280),
      });
    }
    console.log(`  "${q.slice(0, 40)}..." -> ${byDomain.size} unique so far`);
  }
  return [...byDomain.values()];
}

/** A curated real-company fallback so the demo never depends on a live scrape. */
function curatedFallback(): Candidate[] {
  const c = (name: string, domain: string, segment: Segment): Candidate => ({
    name, domain, segment, website: `https://${domain}`, source_url: `https://${domain}`,
  });
  return [
    c("BELFOR Property Restoration", "belfor.com", "contractor"),
    c("ServiceMaster Restore", "servicemasterrestore.com", "contractor"),
    c("ServPro", "servpro.com", "contractor"),
    c("Paul Davis Restoration", "pauldavis.com", "contractor"),
    c("PuroClean", "puroclean.com", "contractor"),
    c("Rainbow Restoration", "rainbowrestores.com", "contractor"),
    c("First Onsite Property Restoration", "firstonsite.com", "contractor"),
    c("Cotton Holdings", "cottonholdings.com", "contractor"),
    c("DKI (Disaster Kleenup Intl)", "dkiservices.com", "contractor"),
    c("ATI Restoration", "atirestoration.com", "contractor"),
    c("Interstate Restoration", "interstaterestoration.com", "contractor"),
    c("BluSky Restoration Contractors", "goblusky.com", "contractor"),
    c("AdvantaClean", "advantaclean.com", "contractor"),
    c("1-800 Water Damage", "1800waterdamage.com", "contractor"),
    c("Restoration 1", "restoration1.com", "contractor"),
    c("Sedgwick", "sedgwick.com", "tpa"),
    c("Crawford & Company", "crawco.com", "tpa"),
    c("Gallagher Bassett", "gallagherbassett.com", "tpa"),
    c("ESIS (Chubb)", "esis.com", "tpa"),
    c("Broadspire", "choosebroadspire.com", "tpa"),
    c("CorVel", "corvel.com", "tpa"),
    c("York (Sedgwick)", "yorkrsg.com", "tpa"),
    c("Davies Group", "davies-group.com", "tpa"),
    c("Engle Martin", "englemartin.com", "tpa"),
    c("CCMSI", "ccmsi.com", "tpa"),
  ];
}

function rankAndCap(cands: Candidate[]): Candidate[] {
  const out: Candidate[] = [];
  for (const seg of ["contractor", "tpa"] as Segment[]) {
    const cap = seg === "contractor" ? CONTRACTOR_CAP : TPA_CAP;
    const group = cands.filter((c) => c.segment === seg).slice(0, cap);
    out.push(...group);
  }
  return out;
}

async function main() {
  const forceSnapshot = process.argv.includes("--snapshot");
  let candidates: Candidate[] = [];

  if (!forceSnapshot && exaConfigured) {
    console.log("Discovering via Exa...");
    candidates = await discoverViaExa();
  }

  // Top up / fall back with curated real companies so we always have a usable list.
  const haveDomains = new Set(candidates.map((c) => c.domain));
  for (const f of curatedFallback()) {
    if (!haveDomains.has(f.domain)) candidates.push(f);
  }
  if (candidates.length === 0 && existsSync(SNAPSHOT)) {
    console.log("No live results; loading snapshot.");
    candidates = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
  }

  const ranked = rankAndCap(candidates).map((c, i, arr) => ({
    ...c,
    // rank within segment
    rank:
      arr.filter((x) => x.segment === c.segment).findIndex((x) => x.domain === c.domain) + 1,
  }));

  // Snapshot for offline reruns.
  writeFileSync(SNAPSHOT, JSON.stringify(ranked, null, 2));
  console.log(`Snapshot written: ${ranked.length} accounts -> ${SNAPSHOT}`);

  // Upsert into cozmo.accounts (idempotent on domain).
  let inserted = 0;
  for (const c of ranked) {
    const { data: existing } = await db
      .from("accounts")
      .select("id")
      .eq("domain", c.domain!)
      .maybeSingle();
    if (existing) continue;
    const { data, error } = await db
      .from("accounts")
      .insert({
        name: c.name,
        segment: c.segment,
        website: c.website,
        domain: c.domain,
        blurb: c.blurb ?? null,
        source_url: c.source_url ?? null,
        rank: (c as Candidate & { rank?: number }).rank ?? null,
      })
      .select("id")
      .single();
    if (error) {
      console.warn(`  insert failed for ${c.name}: ${error.message}`);
      continue;
    }
    inserted++;
    await logActivity(data!.id, "scraped", `Discovered ${c.name} (${c.segment})`, {
      source_url: c.source_url,
    });
  }
  console.log(`Inserted ${inserted} new accounts (existing skipped).`);
  const { count } = await db.from("accounts").select("*", { count: "exact", head: true });
  console.log(`Total accounts in DB: ${count}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
