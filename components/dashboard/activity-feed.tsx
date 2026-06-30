import {
  type LucideIcon,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Mail,
  MailCheck,
  MailOpen,
  PhoneCall,
  PhoneOutgoing,
  Reply,
  Search,
  Sparkles,
} from "lucide-react";
import type { Activity } from "@/lib/db/client";
import { relativeTime } from "@/lib/dashboard/data";

/**
 * Vertical activity timeline (server). Each row: a type-colored glyph, the
 * summary, the account it belongs to, and a relative timestamp. Connected by a
 * hairline rail so it reads as one feed.
 */

const TYPE_META: Record<string, { icon: LucideIcon; color: string }> = {
  scraped: { icon: Search, color: "#5f5f66" },
  enriched: { icon: Sparkles, color: "#5f5f66" },
  personalized: { icon: Bot, color: "#b3531d" },
  queued: { icon: Mail, color: "#3a5aa0" },
  sent: { icon: MailCheck, color: "#0b0b0c" },
  opened: { icon: MailOpen, color: "#b3531d" },
  replied: { icon: Reply, color: "#3c7a43" },
  call_triggered: { icon: PhoneOutgoing, color: "#b3531d" },
  call_completed: { icon: PhoneCall, color: "#3c7a43" },
  demo_booked: { icon: CalendarCheck, color: "#3c7a43" },
};

function meta(type: string) {
  return TYPE_META[type] ?? { icon: CheckCircle2, color: "#5f5f66" };
}

export function ActivityFeed({
  activity,
  accountNames,
}: {
  activity: Activity[];
  accountNames: Map<string, string>;
}) {
  return (
    <ol className="relative">
      {/* connecting rail */}
      <span
        aria-hidden="true"
        className="absolute bottom-3 left-[15px] top-3 w-px bg-line"
      />
      {activity.map((a) => {
        const { icon: Icon, color } = meta(a.type);
        const account = a.account_id ? accountNames.get(a.account_id) : null;
        return (
          <li key={a.id} className="relative flex gap-3.5 pb-5 last:pb-0">
            <span
              className="relative z-[1] mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border bg-paper"
              style={{ borderColor: "var(--color-line)", color }}
            >
              <Icon className="size-[15px]" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] leading-[1.45] text-ink">{a.summary ?? a.type}</p>
              <p className="mt-0.5 flex items-center gap-2 text-[12px] text-gray">
                {account ? (
                  <span className="truncate font-medium text-gray">{account}</span>
                ) : null}
                {account ? <span className="text-gray-2">·</span> : null}
                <span className="tabular shrink-0 text-gray-2">
                  {relativeTime(a.created_at)}
                </span>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
