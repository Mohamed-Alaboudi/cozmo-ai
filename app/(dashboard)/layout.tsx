import type { ReactNode } from "react";
import type { Metadata } from "next";

/**
 * Route-group boundary for the CRM dashboard. Intentionally thin — it does NOT
 * pull in the marketing Nav/Footer/SmoothScroll. The gated chrome (sidebar +
 * topbar) lives in `dashboard/(app)/layout.tsx`; the login page sits outside
 * that segment so it stays ungated.
 */
export const metadata: Metadata = {
  title: { default: "Cozmo CRM", template: "%s · Cozmo CRM" },
  robots: { index: false, follow: false },
};

export default function DashboardGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
