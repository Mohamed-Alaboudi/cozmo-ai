"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type LucideIcon,
  LayoutDashboard,
  Users,
  Send,
  PhoneCall,
  Menu,
  X,
  ArrowUpRight,
} from "lucide-react";
import { Wordmark } from "@/components/ui/logo";
import { cn } from "@/lib/cn";

const EASE = "cubic-bezier(.16,1,.3,1)";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/contacts", label: "Contacts", icon: Users },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Send },
  { href: "/dashboard/calls", label: "Calls", icon: PhoneCall },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Dashboard">
      {NAV.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] font-medium transition-colors",
              active ? "text-accent-text" : "text-ink/75 hover:bg-ink/[0.035] hover:text-ink",
            )}
            style={active ? { backgroundColor: "rgba(217,106,44,0.07)" } : undefined}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-accent transition-transform duration-300",
                active ? "scale-y-100" : "scale-y-0",
              )}
              style={{ transitionTimingFunction: EASE }}
            />
            <Icon
              className={cn("size-[18px] shrink-0", active ? "text-accent-text" : "text-gray")}
              aria-hidden="true"
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-auto border-t border-line pt-4">
      <Link
        href="/"
        className="flex items-center justify-between rounded-[10px] px-3 py-2 text-[13px] text-gray transition-colors hover:bg-ink/[0.035] hover:text-ink"
      >
        View marketing site
        <ArrowUpRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

/** Desktop fixed sidebar rail. */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line bg-paper px-4 py-6 lg:flex">
      <div className="px-2 pb-6">
        <Wordmark />
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-2">
          CRM · Outbound
        </p>
      </div>
      <NavList />
      <SidebarFooter />
    </aside>
  );
}

/** Mobile hamburger trigger + slide-over sheet (placed in the topbar). */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-grid size-9 place-items-center rounded-full border border-line text-ink lg:hidden"
      >
        <Menu className="size-4" aria-hidden="true" />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-[80] lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "absolute inset-0 bg-ink/30 backdrop-blur-[2px] transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          className="absolute left-0 top-0 flex h-full w-[270px] max-w-[80vw] flex-col border-r border-line bg-paper px-4 py-6 shadow-[0_24px_60px_-20px_rgba(11,11,12,0.5)]"
          style={{
            transform: open ? "translateX(0)" : "translateX(-104%)",
            transition: `transform .42s ${EASE}`,
          }}
        >
          <div className="flex items-center justify-between px-2 pb-6">
            <Wordmark />
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="inline-grid size-8 place-items-center rounded-full border border-line text-ink"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <NavList onNavigate={() => setOpen(false)} />
          <SidebarFooter />
        </aside>
      </div>
    </>
  );
}
