import type { HomeContent } from "@/lib/content/types";

/**
 * Home / umbrella page copy. Positions Cozmo as the AI phone agent for
 * insurance across all three audiences (homeowners, contractors, carriers).
 * Rendered by the data-driven sections in components/marketing/sections.tsx.
 */
export const home: HomeContent = {
  hero: {
    eyebrow: "The AI phone agent for insurance",
    h1: "Better customer experience delivered by AI workforce",
    sub: "AI agents that never miss a phone call, answer text across any channel, and update your CRM so your team can focus on the work they signed up for.",
    heroStat: {
      value: "24/7",
      label: "Always answering",
      sub: "First notice of loss to policy questions",
    },
    phone: {
      badge: "Live call · FNOL",
      caller: "(313) 555-0181",
      callerMeta: "Policyholder · water damage",
      agentLabel: "Cozmo · Claims intake",
      timer: "01:12",
      transcript: [
        {
          speaker: "caller",
          text: "There's water coming through my kitchen ceiling.",
        },
        {
          speaker: "cozmo",
          text: "I'm sorry to hear that. I'm opening your claim now and can book an adjuster today.",
          highlight: "opening your claim now",
        },
      ],
    },
  },

  stats: [
    {
      value: "< 2 rings",
      label: "Typical pickup",
      sub: "Even at night or mid-storm",
    },
    {
      value: "30+",
      label: "Languages spoken",
      sub: "Matched to the caller automatically",
    },
    {
      value: "100%",
      label: "Calls answered and logged",
      sub: "Written to your system of record",
    },
  ],

  problem: {
    eyebrow: "The problem",
    title: "The phone rings at the worst moment, and too often no one picks up.",
    pains: [
      {
        icon: "Voicemail",
        title: "Calls go unanswered",
        body: "Your team is on other lines or out in the field. The call rolls to voicemail, and the policyholder dials the next number on their list.",
      },
      {
        icon: "Clock",
        title: "Hold times bleed callers",
        body: "Queues and hold music wear callers down. A call abandoned during a claim is a customer you may never see again.",
      },
      {
        icon: "CloudRain",
        title: "After hours and storm surges",
        body: "Losses do not keep business hours. When a storm hits, call volume outruns any phone tree or night crew, right when callers need answers most.",
      },
    ],
    resolution:
      "Cozmo answers all of them, on the first ring, at any hour or volume, in your brand's voice.",
  },

  segments: {
    eyebrow: "Who it's for",
    title: "Built for every side of the claim.",
    sub: "Homeowners insurers, restoration contractors, and carriers run different systems and field different calls. Pick the one that fits.",
  },

  steps: {
    eyebrow: "How it works",
    title: "Four steps from ring to resolution.",
    items: [
      {
        n: "01",
        title: "A call comes in",
        body: "Calls route to Cozmo through the numbers and telephony you already use, including Twilio. Callers dial the same line, and nothing about your setup changes.",
      },
      {
        n: "02",
        title: "Cozmo answers in your voice",
        body: "It greets the caller by your agency or carrier name and listens. It understands first notice of loss, claim status, scheduling, and policy questions.",
      },
      {
        n: "03",
        title: "It acts in your systems",
        body: "Cozmo opens the claim, books the adjuster, pulls policy details, and logs the call in the systems your team already uses, like Guidewire and Applied Epic.",
      },
      {
        n: "04",
        title: "A clean handoff to a human",
        body: "When a call needs a person, Cozmo transfers it with the transcript attached, so your team picks up mid-thread instead of starting over.",
      },
    ],
  },

  capabilities: {
    eyebrow: "What Cozmo does",
    title: "A full claims desk on every line.",
    sub: "Trained on insurance calls, not a generic script, so it carries the whole conversation.",
    items: [
      {
        icon: "FileText",
        title: "First notice of loss",
        body: "Captures a new claim the moment it is reported, with loss type, date, and location, and opens the file while the caller is still on the line.",
      },
      {
        icon: "Activity",
        title: "Claim status updates",
        body: "Looks up a claim by number or policy, reads back where it stands, and explains the next step in plain language.",
      },
      {
        icon: "CalendarCheck",
        title: "Scheduling and dispatch",
        body: "Books adjuster visits and inspections against live availability, then sends the confirmation.",
      },
      {
        icon: "Umbrella",
        title: "Policy questions",
        body: "Answers coverage and billing questions from your policy data, and knows when a question needs a licensed person.",
      },
    ],
  },

  integrations: {
    eyebrow: "Integrations",
    title: "Wired into the systems you already run.",
    sub: "Cozmo reads and writes where your team works, so calls become records without anyone re-keying them.",
    items: [
      { name: "Twilio", category: "Telephony" },
      { name: "Guidewire ClaimCenter", category: "Claims core" },
      { name: "Applied Epic", category: "Agency management" },
      { name: "JobNimbus", category: "Contractor CRM" },
      { name: "Xactimate", category: "Claims estimating" },
      { name: "Verisk", category: "Claims data" },
    ],
  },

  security: {
    eyebrow: "Security and compliance",
    title: "Built for regulated phone work.",
    sub: "Insurance calls carry sensitive data and strict rules. Cozmo is built for both.",
    items: [
      {
        icon: "ShieldCheck",
        title: "SOC 2 Type II",
        body: "Audited controls for security and confidentiality, with call data encrypted in transit and at rest.",
      },
      {
        icon: "ClipboardCheck",
        title: "TCPA-aware calling",
        body: "Outbound calls and callbacks respect consent, calling windows, and do-not-call rules, with consent logged on the record.",
      },
      {
        icon: "Mic",
        title: "Recording and PII redaction",
        body: "Calls are recorded and transcribed, with card and policy numbers redacted from the logs automatically.",
      },
      {
        icon: "Lock",
        title: "SSO and role-based access",
        body: "SAML single sign-on, plus role-based permissions so staff see only the calls and records their job requires.",
      },
    ],
  },

  proof: {
    quote:
      "Storm season used to mean a voicemail box of first notices we could not reach until Monday. Now every call is answered the moment it lands, and my team walks in to claims already opened and adjusters booked.",
    name: "Dana Whitfield",
    role: "VP, Claims Operations",
    org: "Regional P&C carrier",
    stat: {
      value: "24/7",
      label: "Covered through CAT season",
      sub: "Without adding night staff",
    },
  },

  faqs: [
    {
      q: "Will callers know they are talking to AI?",
      a: "Cozmo introduces itself as a virtual agent and speaks in your brand's voice. The moment a caller asks for a person, or the call needs one, it transfers to your team with full context.",
    },
    {
      q: "What happens when a call needs a human?",
      a: "Cozmo hands off live. It transfers the caller to the right person or queue with the transcript and caller details attached, so no one has to repeat themselves.",
    },
    {
      q: "How does Cozmo connect to our claims and agency systems?",
      a: "Through direct integrations with platforms like Guidewire, Applied Epic, and JobNimbus. Cozmo reads policy and claim data and writes calls, claims, and appointments back to your system of record.",
    },
    {
      q: "Is it compliant with calling and privacy rules?",
      a: "Cozmo is SOC 2 Type II, records and transcribes calls with sensitive details redacted, and respects TCPA consent and calling windows on outbound contact. Access is controlled with SSO and roles.",
    },
  ],

  demo: {
    eyebrow: "See it live",
    title: "Hear Cozmo answer a real call.",
    sub: "Have it call your phone now, or book 20 minutes to watch it handle first notice of loss, scheduling, and a clean handoff.",
  },
};
