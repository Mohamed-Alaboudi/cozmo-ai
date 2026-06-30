"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { Input, Label } from "@/components/ui/field";
import { login, type LoginState } from "@/app/(dashboard)/dashboard/login/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-5 text-[14px] font-semibold text-paper transition-colors hover:bg-ink-2 disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Unlocking…
        </>
      ) : (
        <>
          Enter dashboard
          <ArrowRight className="size-4" aria-hidden="true" />
        </>
      )}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="password">Access password</Label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-2"
            aria-hidden="true"
          />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            placeholder="••••••••••"
            className="pl-10"
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "login-error" : undefined}
          />
        </div>
      </div>

      <SubmitButton />

      {state.error ? (
        <p id="login-error" role="alert" className="text-[13px] text-bad">
          {state.error}
        </p>
      ) : (
        <p className="text-[12.5px] leading-[1.45] text-gray-2">
          Demo access is shared-secret only. Ask your Cozmo contact for the password.
        </p>
      )}
    </form>
  );
}
