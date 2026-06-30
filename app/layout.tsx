import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cozmo-insurance.example.com"),
  title: {
    default: "Cozmo AI phone agents for insurance",
    template: "%s · Cozmo",
  },
  description: SITE.description,
  applicationName: "Cozmo",
  icons: { icon: "/brand/cozmo-icon.png", apple: "/brand/cozmo-icon.png" },
  openGraph: {
    type: "website",
    title: "Cozmo AI phone agents for insurance",
    description: SITE.description,
    siteName: "Cozmo",
    images: ["/brand/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cozmo AI phone agents for insurance",
    description: SITE.description,
    images: ["/brand/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
