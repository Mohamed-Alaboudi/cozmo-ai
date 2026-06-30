"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/app/(dashboard)/dashboard/login/actions";

/** Sign out of the dashboard — posts the logout Server Action. */
export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="inline-grid size-9 place-items-center rounded-full border border-line text-gray transition-colors hover:border-ink/30 hover:text-ink"
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut className="size-4" aria-hidden="true" />
      </button>
    </form>
  );
}
