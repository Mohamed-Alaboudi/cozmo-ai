/**
 * Single source of truth for site-wide constants.
 * Swap these and the whole site updates.
 */
export const SITE = {
  name: "Cozmo",
  legalName: "Cozmo AI",
  tagline: "AI phone agents for insurance",
  description:
    "Cozmo answers every insurance call: first notice of loss, claim status, scheduling, and policy questions, 24/7, in your brand's voice, wired into the systems you already run.",
  email: "alok.k@cozmox.ai",
  emailHref: "mailto:alok.k@cozmox.ai",
  demoPhone: "734 292 0276",
  demoPhoneHref: "tel:+17342920276",
  // HubSpot meeting scheduler — every "Book a demo" / "Talk to us" CTA opens this.
  demoUrl:
    "https://meetings.hubspot.com/alok-k?utm_source=website&utm_medium=cta&utm_campaign=demo&utm_content=talk-to-us&uuid=9f0102e2-ea92-48c2-af80-7d9a0cee941f",
  privacyHref: "/privacy",
  termsHref: "/terms",
  calendlyUrl: process.env.NEXT_PUBLIC_CALENDLY_URL ?? "",
} as const;

export const NAV_LINKS = [
  { href: "/homeowners", label: "Homeowners" },
  { href: "/contractors", label: "Contractors" },
  { href: "/carriers", label: "Carriers" },
] as const;
