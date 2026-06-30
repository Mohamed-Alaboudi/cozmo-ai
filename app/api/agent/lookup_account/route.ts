import { dbAdmin } from "@/lib/db/client";
import { authorized, ok, readBody, str } from "../_shared";

export { dynamic } from "../_shared";

/**
 * lookup_account — give the agent real context on the company it is calling.
 *
 * Body: { company? , domain? }
 * Returns name / blurb / mapped_page / fit_reason / segment from cozmo.accounts
 * so the agent can reference real facts instead of guessing. Always 200; when
 * nothing matches it returns success:false with a graceful message the agent
 * can act on (proceed without account context).
 */
export async function POST(req: Request) {
  if (!authorized(req)) return ok(false, "No account on file. Proceed without it.");

  const b = await readBody(req);
  const company = str(b.company);
  const domain = str(b.domain);

  if (!company && !domain) {
    return ok(false, "No company or domain provided. Proceed without account context.");
  }

  try {
    const db = dbAdmin();
    let row:
      | {
          name: string;
          blurb: string | null;
          mapped_page: string | null;
          fit_reason: string | null;
          segment: string;
        }
      | null = null;

    if (domain) {
      const host = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      const { data } = await db
        .from("accounts")
        .select("name, blurb, mapped_page, fit_reason, segment")
        .ilike("domain", `%${host}%`)
        .limit(1)
        .maybeSingle();
      row = data ?? null;
    }
    if (!row && company) {
      const { data } = await db
        .from("accounts")
        .select("name, blurb, mapped_page, fit_reason, segment")
        .ilike("name", `%${company}%`)
        .limit(1)
        .maybeSingle();
      row = data ?? null;
    }

    if (!row) {
      return ok(false, "No account on file for that name. Proceed without account context.");
    }

    return ok(true, `Found ${row.name}.`, {
      name: row.name,
      segment: row.segment,
      blurb: row.blurb,
      mapped_page: row.mapped_page,
      fit_reason: row.fit_reason,
    });
  } catch {
    return ok(false, "Account lookup is unavailable. Proceed without account context.");
  }
}
