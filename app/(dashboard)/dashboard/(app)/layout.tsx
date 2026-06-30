import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Radio } from "lucide-react";
import { Sidebar, MobileNav } from "@/components/dashboard/sidebar";
import { StatusPill } from "@/components/dashboard/status-pill";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { isAuthed } from "@/lib/dashboard/auth";

/**
 * Gated dashboard chrome: left sidebar + topbar. Server component — it checks
 * the shared-secret cookie and redirects unauthenticated requests to the login
 * page (which lives OUTSIDE this `(app)` segment, so there's no redirect loop).
 */
export default async function DashboardAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!(await isAuthed())) {
    redirect("/dashboard/login");
  }

  return (
    <div className="flex min-h-screen bg-paper-2/40">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-50 flex h-[60px] items-center gap-3 border-b border-line bg-paper/85 px-4 backdrop-blur-md sm:px-6">
          <MobileNav />
          <div className="flex items-baseline gap-2.5">
            <span className="font-disp text-[16px] font-semibold tracking-[-0.01em] text-ink">
              Cozmo CRM
            </span>
            <span className="hidden text-[12px] text-gray-2 sm:inline">
              AI outbound engine
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <StatusPill tone="good">
              <Radio className="size-3" aria-hidden="true" />
              Live engine
            </StatusPill>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 px-4 py-7 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1320px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
