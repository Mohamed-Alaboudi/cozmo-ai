"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { SITE } from "@/lib/site";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * The "have Cozmo call you" form that lives on the dark phone screen
 * Dark-screen styling, orange CALL ME button.
 */
export function PhoneCallMe() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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
        body: JSON.stringify({ phone, name, honeypot: "" }),
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
        className="rounded-[12px] border border-accent/40 bg-accent/15 px-4 py-4 text-center"
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

  const inputCls =
    "h-12 w-full rounded-[10px] border border-white/14 bg-white/[0.05] px-3.5 text-[15px] text-white placeholder:text-white/35 transition-colors focus:border-accent focus:outline-none focus:[box-shadow:0_0_0_3px_rgba(217,106,44,0.25)]";

  return (
    <form onSubmit={submit} noValidate className="space-y-2.5">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="First name"
        aria-label="First name"
        autoComplete="given-name"
        className={inputCls}
      />
      <input
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        inputMode="tel"
        maxLength={16}
        placeholder="+1 (248) 555-0150"
        aria-label="Your mobile number"
        className={`${inputCls} tabular`}
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-accent text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-accent-hi disabled:opacity-60"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Connecting
          </>
        ) : (
          "Call me"
        )}
      </button>
      {status === "error" ? (
        <p role="alert" className="text-center text-[12px] text-[#f0a08f]">
          {error}
        </p>
      ) : (
        <p className="text-center text-[12px] text-white/45">
          or dial{" "}
          <a href={SITE.demoPhoneHref} className="text-white/70 hover:text-white">
            {SITE.demoPhone}
          </a>
        </p>
      )}
    </form>
  );
}
