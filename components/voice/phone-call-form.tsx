"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { ChevronDown, Loader2, PhoneCall } from "lucide-react";
import { SITE } from "@/lib/site";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Cortex-style call form for the dark phone screen: a +1 phone field and an
 * email field above an accent CALL ME button. Posts to /api/call-me (email is
 * optional lead context). Mirrors the validation in the old phone-call-me form.
 */
export function PhoneCallForm() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ phone, email, honeypot: "" }),
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
        className="rounded-2xl border border-accent/40 bg-accent/15 px-4 py-4 text-center"
      >
        <span className="mx-auto mb-2 flex size-2.5 items-center justify-center">
          <span className="absolute inline-flex size-2.5 animate-ping rounded-full bg-accent opacity-70" />
          <span className="relative inline-flex size-2.5 rounded-full bg-accent-hi" />
        </span>
        <p className="text-[14px] font-medium text-white">
          Calling you now. Pick up!
        </p>
      </div>
    );
  }

  const fieldCls =
    "flex items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 transition-colors focus-within:border-accent focus-within:bg-white/[0.06]";
  const inputCls =
    "w-full bg-transparent text-[15px] font-medium text-white outline-none placeholder:text-white/35";

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      {/* phone with +1 prefix */}
      <div className={fieldCls}>
        <span className="mr-3 flex shrink-0 select-none items-center gap-1 border-r border-white/10 pr-3 text-[12px] font-semibold text-white/55">
          +1
          <ChevronDown className="size-3 text-white/35" aria-hidden="true" />
        </span>
        <input
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          inputMode="tel"
          maxLength={16}
          placeholder="Phone number"
          aria-label="Your mobile number"
          className={`${inputCls} tabular`}
        />
      </div>

      {/* email */}
      <div className={fieldCls}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          aria-label="Your email address"
          autoComplete="email"
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl bg-accent text-[13px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-accent-hi disabled:opacity-60"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Calling…
          </>
        ) : (
          <>
            <PhoneCall className="size-4" /> Call me
          </>
        )}
      </button>

      {status === "error" ? (
        <p role="alert" className="text-center text-[12px] text-[#f0a08f]">
          {error}
        </p>
      ) : (
        <p className="text-center text-[11px] leading-relaxed text-white/40">
          By clicking Call me you agree to receive a one-time AI demo call.
          Standard rates apply.
        </p>
      )}
    </form>
  );
}
