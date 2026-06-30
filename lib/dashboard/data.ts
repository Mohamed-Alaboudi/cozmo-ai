import {
  dbConfigured,
  dbRead,
  type Account,
  type Activity,
  type Call,
  type Campaign,
  type Contact,
  type Message,
  type SequenceStep,
} from "@/lib/db/client";

/**
 * Server-side data access for the Cozmo CRM dashboard.
 *
 * Every reader is defensive: if Supabase isn't configured, or a query fails,
 * it returns an empty result instead of throwing, so the UI can render a
 * tasteful empty state rather than a 500. All access is read-only (`dbRead`).
 */

/* ----------------------------------------------------------------------------
 * Domain vocab — single source of truth for statuses + their ordering.
 * Built to the real schema enums so derived UI stays in sync with the data.
 * ------------------------------------------------------------------------- */

export const MESSAGE_STATUS_ORDER = [
  "draft",
  "queued",
  "sent",
  "opened",
  "replied",
  "bounced",
] as const;
export type MessageStatus = (typeof MESSAGE_STATUS_ORDER)[number];

export const CALL_STATUS_ORDER = [
  "queued",
  "dialing",
  "connected",
  "completed",
  "no_answer",
  "failed",
] as const;
export type CallStatus = (typeof CALL_STATUS_ORDER)[number];

/** Where an account sits in the funnel, derived from its latest signal. */
export type AccountStage =
  | "scraped"
  | "enriched"
  | "personalized"
  | "queued"
  | "sent"
  | "opened"
  | "replied"
  | "called"
  | "demo";

export const STAGE_ORDER: AccountStage[] = [
  "scraped",
  "enriched",
  "personalized",
  "queued",
  "sent",
  "opened",
  "replied",
  "called",
  "demo",
];

export const STAGE_LABEL: Record<AccountStage, string> = {
  scraped: "Scraped",
  enriched: "Enriched",
  personalized: "Personalized",
  queued: "Queued",
  sent: "Sent",
  opened: "Opened",
  replied: "Replied",
  called: "Called",
  demo: "Demo booked",
};

/* ----------------------------------------------------------------------------
 * Low-level readers (each independently safe).
 * ------------------------------------------------------------------------- */

async function safe<T>(
  run: () => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  if (!dbConfigured) return [];
  try {
    const { data, error } = await run();
    if (error) {
      console.error("[dashboard] query error:", error);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error("[dashboard] query threw:", err);
    return [];
  }
}

export function getAccounts() {
  return safe<Account>(() =>
    dbRead()
      .from("accounts")
      .select("*")
      .order("rank", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),
  );
}

export function getContacts() {
  return safe<Contact>(() => dbRead().from("contacts").select("*"));
}

export function getCampaigns() {
  return safe<Campaign>(() =>
    dbRead().from("campaigns").select("*").order("created_at", { ascending: true }),
  );
}

export function getSequenceSteps() {
  return safe<SequenceStep>(() =>
    dbRead().from("sequence_steps").select("*").order("step_no", { ascending: true }),
  );
}

export function getMessages() {
  return safe<Message>(() =>
    dbRead().from("messages").select("*").order("created_at", { ascending: false }),
  );
}

export function getCalls() {
  return safe<Call>(() =>
    dbRead().from("calls").select("*").order("created_at", { ascending: false }),
  );
}

export function getActivity(limit = 200) {
  return safe<Activity>(() =>
    dbRead()
      .from("activity")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit),
  );
}

/* ----------------------------------------------------------------------------
 * Derivations — turn raw rows into the funnel + per-account stage.
 * ------------------------------------------------------------------------- */

/** Highest-progress message status for a set of messages. */
function topMessageStatus(messages: Message[]): MessageStatus | null {
  let best = -1;
  for (const m of messages) {
    const idx = MESSAGE_STATUS_ORDER.indexOf(m.status as MessageStatus);
    if (idx > best) best = idx;
  }
  return best >= 0 ? MESSAGE_STATUS_ORDER[best] : null;
}

/** Derive an account's funnel stage from its messages, calls and activity. */
export function deriveStage(input: {
  account: Account;
  messages: Message[];
  calls: Call[];
}): AccountStage {
  const { account, messages, calls } = input;

  if (calls.some((c) => c.demo_booked)) return "demo";
  if (calls.length > 0) return "called";

  const ms = topMessageStatus(messages);
  if (ms === "replied") return "replied";
  if (ms === "opened") return "opened";
  if (ms === "sent" || ms === "bounced") return "sent";
  if (ms === "queued") return "queued";
  if (ms === "draft") return "personalized";

  // No outreach yet — distinguish enriched from freshly scraped.
  const enriched =
    Boolean(account.fit_reason) ||
    Boolean(account.blurb) ||
    Boolean(account.enriched_json);
  return enriched ? "enriched" : "scraped";
}

export type FunnelStep = {
  key: AccountStage;
  label: string;
  /** Count of accounts that have REACHED at least this stage. */
  count: number;
};

/**
 * The headline outbound funnel: for each stage, how many accounts have reached
 * it. Monotonic counts (reaching "sent" implies having been "queued"), which is
 * what makes a funnel legible.
 */
export function buildFunnel(input: {
  accounts: Account[];
  messages: Message[];
  calls: Call[];
}): FunnelStep[] {
  const byAccountMessages = groupBy(input.messages, (m) => m.account_id);
  const byAccountCalls = groupBy(input.calls, (c) => c.account_id ?? "");

  // Per-account furthest stage.
  const reachedIdx = input.accounts.map((account) => {
    const stage = deriveStage({
      account,
      messages: byAccountMessages.get(account.id) ?? [],
      calls: byAccountCalls.get(account.id) ?? [],
    });
    return STAGE_ORDER.indexOf(stage);
  });

  return STAGE_ORDER.map((key, idx) => ({
    key,
    label: STAGE_LABEL[key],
    count: reachedIdx.filter((r) => r >= idx).length,
  }));
}

/* ----------------------------------------------------------------------------
 * Per-account bundle — everything the Contacts CRM expandable row needs, in one
 * serializable shape (server-assembled, passed to the client table).
 * ------------------------------------------------------------------------- */

export type AccountBundle = {
  account: Account;
  contacts: Contact[];
  messages: Message[];
  calls: Call[];
  stage: AccountStage;
  stageLabel: string;
  /** ISO timestamp of the most recent signal across messages/calls/account. */
  lastActivity: string | null;
};

function latestTs(values: (string | null | undefined)[]): string | null {
  let best: number | null = null;
  let bestIso: string | null = null;
  for (const v of values) {
    if (!v) continue;
    const t = new Date(v).getTime();
    if (Number.isNaN(t)) continue;
    if (best == null || t > best) {
      best = t;
      bestIso = v;
    }
  }
  return bestIso;
}

export function buildAccountBundles(input: {
  accounts: Account[];
  contacts: Contact[];
  messages: Message[];
  calls: Call[];
}): AccountBundle[] {
  const byContacts = groupBy(input.contacts, (c) => c.account_id);
  const byMessages = groupBy(input.messages, (m) => m.account_id);
  const byCalls = groupBy(input.calls, (c) => c.account_id ?? "");

  return input.accounts.map((account) => {
    const contacts = byContacts.get(account.id) ?? [];
    const messages = byMessages.get(account.id) ?? [];
    const calls = byCalls.get(account.id) ?? [];
    const stage = deriveStage({ account, messages, calls });
    const lastActivity = latestTs([
      account.created_at,
      ...messages.map((m) => m.sent_at ?? m.scheduled_at ?? m.created_at),
      ...calls.map((c) => c.updated_at ?? c.created_at),
    ]);
    return {
      account,
      contacts,
      messages,
      calls,
      stage,
      stageLabel: STAGE_LABEL[stage],
      lastActivity,
    };
  });
}

/* ----------------------------------------------------------------------------
 * Headline KPIs for the Overview stat cards.
 * ------------------------------------------------------------------------- */

export type Kpis = {
  totalAccounts: number;
  emailsQueued: number; // messages in queued/sent/opened/replied (left the draft stage)
  emailsSent: number;
  sendRate: number; // sent / (drafted+queued+sent) as a percentage 0..100
  callsPlaced: number;
  demosBooked: number;
};

export function buildKpis(input: {
  accounts: Account[];
  messages: Message[];
  calls: Call[];
}): Kpis {
  const { accounts, messages, calls } = input;
  const drafted = messages.length;
  const sent = messages.filter((m) =>
    ["sent", "opened", "replied"].includes(m.status),
  ).length;
  const queued = messages.filter((m) =>
    ["queued", "sent", "opened", "replied"].includes(m.status),
  ).length;

  return {
    totalAccounts: accounts.length,
    emailsQueued: queued,
    emailsSent: sent,
    sendRate: drafted > 0 ? Math.round((sent / drafted) * 100) : 0,
    callsPlaced: calls.length,
    demosBooked: calls.filter((c) => c.demo_booked).length,
  };
}

/* ----------------------------------------------------------------------------
 * Campaign view model — a campaign + its ordered steps, each with per-status
 * message counts, plus campaign totals.
 * ------------------------------------------------------------------------- */

export type StepView = {
  step: SequenceStep;
  total: number;
  /** Counts per message status for THIS step across all accounts. */
  counts: Partial<Record<MessageStatus, number>>;
};

export type CampaignView = {
  campaign: Campaign;
  steps: StepView[];
  totalMessages: number;
  sent: number;
  replied: number;
  /** Dominant send mode across this campaign's messages (defaults to dry_run). */
  sendMode: "dry_run" | "live";
};

export function buildCampaignViews(input: {
  campaigns: Campaign[];
  steps: SequenceStep[];
  messages: Message[];
}): CampaignView[] {
  const stepsByCampaign = groupBy(input.steps, (s) => s.campaign_id);
  const msgsByCampaign = groupBy(
    input.messages.filter((m) => m.campaign_id),
    (m) => m.campaign_id as string,
  );

  return input.campaigns.map((campaign) => {
    const steps = (stepsByCampaign.get(campaign.id) ?? []).sort(
      (a, b) => a.step_no - b.step_no,
    );
    const msgs = msgsByCampaign.get(campaign.id) ?? [];

    const stepViews: StepView[] = steps.map((step) => {
      const stepMsgs = msgs.filter((m) => m.step_no === step.step_no);
      const counts: Partial<Record<MessageStatus, number>> = {};
      for (const m of stepMsgs) {
        const s = m.status as MessageStatus;
        counts[s] = (counts[s] ?? 0) + 1;
      }
      return { step, total: stepMsgs.length, counts };
    });

    const liveCount = msgs.filter((m) => m.send_mode === "live").length;
    return {
      campaign,
      steps: stepViews,
      totalMessages: msgs.length,
      sent: msgs.filter((m) => ["sent", "opened", "replied"].includes(m.status)).length,
      replied: msgs.filter((m) => m.status === "replied").length,
      sendMode: liveCount > msgs.length / 2 && msgs.length > 0 ? "live" : "dry_run",
    };
  });
}

/* ----------------------------------------------------------------------------
 * Activity time-series for the Overview chart.
 * ------------------------------------------------------------------------- */

export type ActivityDay = {
  /** ISO date (YYYY-MM-DD), local. */
  date: string;
  /** Human label e.g. "Jun 30". */
  label: string;
  total: number;
  scraped: number;
  enriched: number;
  outreach: number; // personalized | queued | sent | opened | replied
  calls: number; // call_triggered | call_completed
  demos: number; // demo_booked
};

const OUTREACH_TYPES = new Set([
  "personalized",
  "queued",
  "sent",
  "opened",
  "replied",
]);
const CALL_TYPES = new Set(["call_triggered", "call_completed"]);

/**
 * Bucket activity rows by calendar day across the last `days` days (inclusive
 * of today), grouped into the chart's series. Always returns a contiguous range
 * so the chart has a clean x-axis even on sparse data.
 */
export function buildActivitySeries(activity: Activity[], days = 14): ActivityDay[] {
  const buckets = new Map<string, ActivityDay>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const date = toLocalISO(d);
    buckets.set(date, {
      date,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      total: 0,
      scraped: 0,
      enriched: 0,
      outreach: 0,
      calls: 0,
      demos: 0,
    });
  }

  for (const a of activity) {
    const d = new Date(a.created_at);
    if (Number.isNaN(d.getTime())) continue;
    d.setHours(0, 0, 0, 0);
    const date = toLocalISO(d);
    const bucket = buckets.get(date);
    if (!bucket) continue; // outside window
    bucket.total += 1;
    if (a.type === "scraped") bucket.scraped += 1;
    else if (a.type === "enriched") bucket.enriched += 1;
    else if (a.type === "demo_booked") bucket.demos += 1;
    else if (CALL_TYPES.has(a.type)) bucket.calls += 1;
    else if (OUTREACH_TYPES.has(a.type)) bucket.outreach += 1;
  }

  return [...buckets.values()];
}

/* ----------------------------------------------------------------------------
 * Small utilities.
 * ------------------------------------------------------------------------- */

export function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const list = map.get(k);
    if (list) list.push(item);
    else map.set(k, [item]);
  }
  return map;
}

function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "3m ago", "2h ago", "Jun 30" — compact relative time for feeds/tables. */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Seconds → "m:ss" for call durations. */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds)) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
