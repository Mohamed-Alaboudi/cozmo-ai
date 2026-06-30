import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/panel";
import { CallsTable, type CallRow } from "@/components/dashboard/calls-table";
import { getAccounts, getCalls } from "@/lib/dashboard/data";

export const metadata: Metadata = { title: "Calls" };
export const dynamic = "force-dynamic";

export default async function CallsPage() {
  const [accounts, calls] = await Promise.all([getAccounts(), getCalls()]);
  const names = new Map(accounts.map((a) => [a.id, a.name]));

  const rows: CallRow[] = calls.map((c) => ({
    ...c,
    accountName: c.account_id ? (names.get(c.account_id) ?? null) : null,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Phone follow-ups"
        title="Calls"
        description="The AI phone agent's calls — triggered after the email sequence. Expand a call for its outcome and full transcript."
      />
      <CallsTable calls={rows} />
    </>
  );
}
