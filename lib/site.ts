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
  email: "hello@hellocozmo.ai",
  emailHref: "mailto:hello@hellocozmo.ai",
  // 555-01xx is reserved for fiction, a safe placeholder for the demo line.
  demoPhone: "(248) 555-0162",
  demoPhoneHref: "tel:+12485550162",
  calendlyUrl: process.env.NEXT_PUBLIC_CALENDLY_URL ?? "",
} as const;

export const NAV_LINKS = [
  { href: "/homeowners", label: "Homeowners" },
  { href: "/contractors", label: "Contractors" },
  { href: "/carriers", label: "Carriers" },
] as const;
