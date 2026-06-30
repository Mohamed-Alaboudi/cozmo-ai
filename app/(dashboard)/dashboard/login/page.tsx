import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/ui/logo";
import { LoginForm } from "@/components/dashboard/login-form";
import { isAuthed } from "@/lib/dashboard/auth";

export const metadata: Metadata = {
  title: "Sign in · Cozmo CRM",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await isAuthed()) redirect("/dashboard");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-5 py-16">
      {/* subtle warm wash, kept faint per the brand's restraint */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 size-[520px] -translate-x-1/2 -translate-y-1/3 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(217,106,44,0.10), transparent 65%)" }}
      />

      <div className="relative z-[1] w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <Wordmark />
          <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.22em] text-accent-text">
            CRM · Outbound engine
          </p>
          <h1 className="mt-3 font-disp text-[26px] font-semibold tracking-[-0.02em] text-ink">
            Sign in to the dashboard
          </h1>
          <p className="mt-2 max-w-[34ch] text-[14px] leading-[1.5] text-gray">
            The live view of Cozmo&rsquo;s outbound funnel — scraping, personalization,
            sends and call follow-ups.
          </p>
        </div>

        <div className="rounded-card border border-line bg-paper p-6 shadow-[0_30px_70px_-40px_rgba(11,11,12,0.4)]">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-[12px] text-gray-2">
          Cozmo AI · demo environment
        </p>
      </div>
    </main>
  );
}
