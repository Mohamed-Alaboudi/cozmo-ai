import type { ReactNode } from "react";
import { Nav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/footer";
import { SmoothScroll } from "@/components/marketing/smooth-scroll";

export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SmoothScroll>
      <div className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
