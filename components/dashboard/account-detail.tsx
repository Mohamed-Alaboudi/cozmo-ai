import {
  Lightbulb,
  Mail,
  MapPin,
  ExternalLink,
  User,
  PhoneCall,
  Bot,
  ArrowRight,
} from "lucide-react";
import type { AccountBundle } from "@/lib/dashboard/data";
import { relativeTime, formatDuration } from "@/lib/dashboard/data";
import { MessageStatusPill, CallStatusPill, StatusPill } from "@/components/dashboard/status-pill";
import { cn } from "@/lib/cn";

/**
 * The expanded Contacts row. Four panels:
 *  1. Why this account — provenance (fit_reason + mapped_page + source_url).
 *     A deliberate feature: it shows WHY the engine picked this account.
 *  2. Contacts — people + emails the scraper found.
 *  3. Personalized outreach — Claude-written subject + body per message.
 *  4. Call follow-ups — outcomes + transcript when present.
 *
 * Pure presentational; safe to render on the server inside the client table.
 */

function SubHead({ icon: Icon, children, count }: {
  icon: typeof Mail;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="size-3.5 text-accent-text" aria-hidden="true" />
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray">
        {children}
      </h4>
      {count != null ? (
        <span className="tabular text-[11px] font-semibold text-gray-2">{count}</span>
      ) : null}
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-[12px] border border-line bg-paper p-4", className)}>
      {children}
    </div>
  );
}

export function AccountDetail({ bundle }: { bundle: AccountBundle }) {
  const { account, contacts, messages, calls } = bundle;
  const mappedPage = account.mapped_page;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* LEFT: provenance + contacts */}
      <div className="flex flex-col gap-4">
        {/* Why this account — the provenance feature, accent-tinted */}
        <div
          className="rounded-[12px] border p-4"
          style={{ borderColor: "rgba(217,106,44,0.26)", backgroundColor: "rgba(217,106,44,0.045)" }}
        >
          <SubHead icon={Lightbulb}>Why this account</SubHead>
          {account.fit_reason ? (
            <p className="text-[13.5px] leading-[1.55] text-ink">{account.fit_reason}</p>
          ) : (
            <p className="text-[13.5px] italic leading-[1.55] text-gray">
              No fit rationale recorded yet.
            </p>
          )}
          {account.blurb ? (
            <p className="mt-2.5 border-t border-accent/15 pt-2.5 text-[12.5px] leading-[1.5] text-gray">
              {account.blurb}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {mappedPage ? (
              <StatusPill tone="accent" dot={false}>
                <ArrowRight className="size-3" aria-hidden="true" />
                Maps to /{mappedPage}
              </StatusPill>
            ) : null}
            {account.hq_city || account.hq_state ? (
              <span className="inline-flex items-center gap-1 text-[12px] text-gray">
                <MapPin className="size-3 text-gray-2" aria-hidden="true" />
                {[account.hq_city, account.hq_state].filter(Boolean).join(", ")}
              </span>
            ) : null}
            {account.source_url ? (
              <a
                href={account.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-ink underline decoration-line underline-offset-2 transition-colors hover:text-accent-text"
                onClick={(e) => e.stopPropagation()}
              >
                Source
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>

        {/* Contacts */}
        <Card>
          <SubHead icon={User} count={contacts.length}>
            Contacts
          </SubHead>
          {contacts.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {contacts.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium text-ink">
                      {c.name && c.name !== "(decision maker)" ? c.name : c.title || "Decision maker"}
                    </p>
                    <p className="truncate text-[12px] text-gray">
                      {c.title && (c.name && c.name !== "(decision maker)") ? c.title : null}
                      {c.email ? (
                        <a
                          href={`mailto:${c.email}`}
                          className="inline-flex items-center gap-1 font-medium text-gray transition-colors hover:text-accent-text"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail className="size-3" aria-hidden="true" />
                          {c.email}
                        </a>
                      ) : null}
                    </p>
                  </div>
                  {c.confidence ? (
                    <StatusPill
                      tone={c.confidence === "high" ? "good" : c.confidence === "medium" ? "progress" : "muted"}
                      dot={false}
                    >
                      {c.confidence}
                    </StatusPill>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] italic text-gray">No contacts discovered yet.</p>
          )}
        </Card>
      </div>

      {/* RIGHT: outreach + calls */}
      <div className="flex flex-col gap-4">
        {/* Personalized messages */}
        <Card>
          <SubHead icon={Bot} count={messages.length}>
            Personalized outreach
          </SubHead>
          {messages.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {messages.slice(0, 4).map((m) => (
                <li key={m.id} className="rounded-[10px] border border-hair bg-paper-2/50 p-3">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="tabular text-[11px] font-semibold text-gray-2">
                      Step {m.step_no}
                    </span>
                    <MessageStatusPill status={m.status} />
                  </div>
                  {m.subject ? (
                    <p className="text-[13px] font-semibold leading-snug text-ink">
                      {m.subject}
                    </p>
                  ) : null}
                  {m.body ? (
                    <p className="mt-1 line-clamp-4 whitespace-pre-line text-[12.5px] leading-[1.5] text-gray">
                      {m.body}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] italic text-gray">
              Not personalized yet — Claude drafts the sequence when this account enters a campaign.
            </p>
          )}
        </Card>

        {/* Calls */}
        <Card>
          <SubHead icon={PhoneCall} count={calls.length}>
            Call follow-ups
          </SubHead>
          {calls.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {calls.map((call) => (
                <li key={call.id} className="rounded-[10px] border border-hair bg-paper-2/50 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <CallStatusPill status={call.status} />
                    {call.demo_booked ? (
                      <StatusPill tone="good" dot={false}>
                        Demo booked
                      </StatusPill>
                    ) : null}
                    <span className="tabular ml-auto text-[12px] text-gray-2">
                      {formatDuration(call.duration_s)} · {relativeTime(call.created_at)}
                    </span>
                  </div>
                  {call.outcome ? (
                    <p className="mt-2 text-[12.5px] leading-[1.5] text-ink">{call.outcome}</p>
                  ) : null}
                  {call.transcript ? (
                    <details className="mt-2 group" onClick={(e) => e.stopPropagation()}>
                      <summary className="cursor-pointer list-none text-[12px] font-medium text-accent-text marker:content-none [&::-webkit-details-marker]:hidden">
                        View transcript
                      </summary>
                      <p className="mt-2 max-h-48 overflow-y-auto whitespace-pre-line rounded-[8px] border border-line bg-paper p-3 text-[12px] leading-[1.6] text-gray">
                        {call.transcript}
                      </p>
                    </details>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] italic text-gray">
              No calls yet — the phone agent dials after the email sequence runs.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
