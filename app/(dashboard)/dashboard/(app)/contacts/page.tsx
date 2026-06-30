import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/panel";
import { ContactsTable } from "@/components/dashboard/contacts-table";
import {
  getAccounts,
  getContacts,
  getMessages,
  getCalls,
  buildAccountBundles,
} from "@/lib/dashboard/data";

export const metadata: Metadata = { title: "Contacts" };
export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const [accounts, contacts, messages, calls] = await Promise.all([
    getAccounts(),
    getContacts(),
    getMessages(),
    getCalls(),
  ]);

  const bundles = buildAccountBundles({ accounts, contacts, messages, calls });

  return (
    <>
      <PageHeader
        eyebrow="CRM"
        title="Contacts"
        description="Every scraped account. Expand a row for its people, the Claude-personalized outreach, call outcomes, and why the engine targeted it."
      />
      <ContactsTable bundles={bundles} />
    </>
  );
}
