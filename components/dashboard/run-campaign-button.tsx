"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, FastForward, Loader2, Check, TriangleAlert } from "lucide-react";

/**
 * Dashboard control to run an outbound campaign against the dry-run pipeline.
 *
 * Posts to /api/outbound/run-campaign — that route is gated by the dashboard
 * session cookie (sent automatically by the browser), so no secret is embedded
 * here. Two actions:
 *   - primary "Run campaign": send_drafts when drafts exist, else advance.
 *   - secondary "Advance sequence": always the simulated step progression.
 *
 * On success it shows an inline result chip and calls router.refresh() so the
 * server-rendered per-step counts re-fetch and reflect the new statuses.
 *
 * Styling mirrors components/dashboard/status-pill.tsx: the marketing CSS
 * declares an unlayered `* { border-color: var(--color-line) }`, so any
 * non-default border color is applied via inline style to win the cascade.
 */

type Action = "advance" | "send_drafts";

type RunResult = {
  ok: boolean;
  sent?: number;
  opened?: number;
  replied?: number;
  message?: string;
};

const RESULT_TONE = {
  ok: { bg: "rgba(60,122,67,0.09)", fg: "#3c7a43", border: "rgba(60,122,67,0.26)" },
  err: { bg: "rgba(196,90,79,0.10)", fg: "#b14a40", border: "rgba(196,90,79,0.28)" },
} as const;

export function RunCampaignButton({
  campaignId,
  hasDrafts,
}: {
  campaignId: string;
  hasDrafts: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<Action | null>(null);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  async function run(action: Action) {
    if (busy) return;
    setBusy(action);
    setResult(null);
    try {
      const res = await fetch("/api/outbound/run-campaign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ campaignId, action }),
      });
      const data = (await res.json().catch(() => ({}))) as RunResult;
      if (!res.ok || !data.ok) {
        setResult({
          ok: false,
          text: data.message ?? (res.status === 401 ? "Session expired, sign in again." : "Run failed."),
        });
        return;
      }
      setResult({ ok: true, text: data.message ?? "Done." });
      // Re-fetch the server component so the per-step counts update.
      startTransition(() => router.refresh());
    } catch {
      setResult({ ok: false, text: "Network error, try again." });
    } finally {
      setBusy(null);
    }
  }

  // Primary action: send drafts if any exist, otherwise advance the sequence.
  const primaryAction: Action = hasDrafts ? "send_drafts" : "advance";
  const primaryLabel = hasDrafts ? "Run campaign" : "Run campaign";
  const running = busy !== null || pending;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {result ? (
        <span
          role="status"
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-[3px] text-[12px] font-medium leading-none"
          style={{
            backgroundColor: RESULT_TONE[result.ok ? "ok" : "err"].bg,
            color: RESULT_TONE[result.ok ? "ok" : "err"].fg,
            borderColor: RESULT_TONE[result.ok ? "ok" : "err"].border,
          }}
        >
          {result.ok ? (
            <Check className="size-3" aria-hidden="true" />
          ) : (
            <TriangleAlert className="size-3" aria-hidden="true" />
          )}
          {result.text}
        </span>
      ) : null}

      <button
        type="button"
        onClick={() => run(primaryAction)}
        disabled={running}
        className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-[5px] text-[12.5px] font-semibold text-paper transition-colors hover:bg-ink-2 disabled:cursor-not-allowed disabled:opacity-60"
        title={hasDrafts ? "Send draft emails (dry-run)" : "Advance the sequence (dry-run)"}
      >
        {busy === primaryAction ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Play className="size-3.5" aria-hidden="true" />
        )}
        {primaryLabel}
      </button>

      <button
        type="button"
        onClick={() => run("advance")}
        disabled={running}
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-[5px] text-[12.5px] font-semibold text-gray transition-colors hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
        title="Move sent → opened → replied (dry-run simulation)"
      >
        {busy === "advance" ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <FastForward className="size-3.5" aria-hidden="true" />
        )}
        Advance sequence
      </button>
    </div>
  );
}
