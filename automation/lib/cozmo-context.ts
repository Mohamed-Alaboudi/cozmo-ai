/**
 * A compact, plain-text description of what Cozmo sells, distilled from
 * the site content. Passed to Claude during enrichment + personalization
 * so openers reference real capabilities and the right landing page —
 * not generic "AI for insurance" filler.
 */
export const COZMO_CONTEXT = `
Cozmo AI builds AI phone agents for the insurance industry. The agents handle
inbound and outbound phone calls, texts, and emails, then update the CRM end to
end: opening cases, reading documents, making policy decisions, and tracking to
payment. Core differentiators:

- Outcome-based pricing: customers pay per resolved case, not per call minute.
- Built for regulated enterprises (financial services and insurance); trusted by
  Fortune 100s, 1M+ live calls handled, 10M+ customer interactions.
- The control layer ("Agent Protocol Engine") governs the agents.

Cozmo serves three audiences, each with its own landing page:

1. homeowners — policyholders who call about a claim. Use cases: first notice of
   loss (FNOL), claim status, scheduling inspections/adjusters, policy questions,
   after-hours coverage. Map a target here only if it is a consumer-facing
   policyholder-support context (rare for B2B contractors/TPAs).

2. contractors — restoration / property-claims contractors (water, fire, storm,
   roofing, mitigation). Pain: high call volume from FNOL and catastrophe surges,
   after-hours overflow, scheduling, status calls from carriers and homeowners.
   Cozmo handles intake and status so crews stay in the field. Map restoration /
   mitigation / roofing / property-repair contractors here.

3. carriers — insurance carriers AND third-party administrators (TPAs) that run
   claims operations. Pain: claim-status call deflection, SLA adherence, FNOL
   intake at scale, after-hours and catastrophe surge. Cozmo automates policy and
   claim-status calls and routes the rest. Map carriers and TPAs here.
`.trim();
