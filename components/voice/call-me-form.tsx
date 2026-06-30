"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, Loader2, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { SITE } from "@/lib/site";

type Status = "idle" | "submitting" | "success" | "error";

/** Full "have Cozmo call me" form for light-page CTA cards. */
export function CallMeForm({ compact = false }: { compact?: boolean }) {
  const nameId = useId();
  const phoneId = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const digits = phone.replace(/\D/g, "");
    const ten =
      digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
    if (ten.length !== 10) {
      setError("Enter a 10-digit US number.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/call-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, honeypot }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? `Something went wrong. Dial ${SITE.demoPhone}.`);
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError(`Couldn't reach the line. Dial ${SITE.demoPhone}.`);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-card border border-accent/30 bg-accent/[0.06] p-5"
      >
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent-text" />
        <div>
          <p className="font-medium text-ink">Calling you now. Pick up!</p>
          <p className="mt-1 text-[14px] text-gray">
            Cozmo is dialing {phone}. Ask it anything a policyholder would.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {/* honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="company_website">Company website</label>
        <input
          id="company_website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {!compact && (
        <div>
          <Label htmlFor={nameId}>Name (optional)</Label>
          <Input
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jordan Rivera"
            autoComplete="name"
          />
        </div>
      )}

      <div>
        <Label htmlFor={phoneId}>Mobile number</Label>
        <Input
          id={phoneId}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          inputMode="tel"
          maxLength={16}
          placeholder="(248) 555-0150"
          className="tabular"
          autoComplete="tel"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={status === "submitting"}
        className="w-full"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Connecting…
          </>
        ) : (
          <>
            <PhoneCall className="size-4" /> Have Cozmo call me
          </>
        )}
      </Button>

      {status === "error" ? (
        <p role="alert" className="text-[13px] text-bad">
          {error}
        </p>
      ) : (
        <p className="text-[13px] text-gray">
          By submitting you agree to a one-time AI demo call. Standard rates
          apply.
        </p>
      )}
    </form>
  );
}
