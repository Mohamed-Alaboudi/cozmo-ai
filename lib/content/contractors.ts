import type { SegmentContent } from "@/lib/content/types";

/**
 * Segment: property RESTORATION / ROOFING / water-mitigation contractors.
 * Cozmo answers every inbound lead 24/7, qualifies the loss, books the
 * inspection onto the crew calendar, and coordinates supplement and status
 * with adjusters. It captures the after-hours storm calls competitors send
 * to voicemail.
 */
export const contractors: SegmentContent = {
  slug: "contractors",
  nav: "Contractors",

  card: {
    tagline: "Answer every storm call. Book every inspection.",
    blurb:
      "When hail drops forty calls on your phone at once, Cozmo answers all of them, scopes the damage, and books inspections on your crew calendar. The after-hours leads competitors miss become your jobs.",
    icon: "HardHat",
    bullets: [
      "Answers the 2am water call competitors send to voicemail",
      "Qualifies the loss and books the inspection on the call",
      "Routes each booking to your crew calendar by territory",
    ],
  },

  hero: {
    eyebrow: "Restoration · Roofing · Water mitigation",
    h1: "When the storm hits, every call gets answered",
    sub: "A hailstorm drops forty calls on your phone in ten minutes. Cozmo answers every one, qualifies the loss, and books the inspection while competitors' lines ring out.",
    heroStat: {
      value: "40+",
      label: "Calls answered at once",
      sub: "No busy signal in a hailstorm",
    },
    phone: {
      badge: "Live call · Hail damage",
      caller: "(248) 555-0193",
      callerMeta: "Homeowner · roof leak after hail",
      agentLabel: "Cozmo · Inspection booking",
      timer: "00:47",
      transcript: [
        {
          speaker: "caller",
          text: "My roof started leaking after that hail. Can someone come look?",
        },
        {
          speaker: "cozmo",
          text: "I can get a crew out tomorrow at 9. You're booked, and I'll text the confirmation now.",
          highlight: "get a crew out tomorrow at 9",
        },
      ],
    },
  },

  stats: [
    {
      value: "24/7",
      label: "After-hours and storm coverage",
      sub: "Nights and weekends",
    },
    {
      value: "< 2 rings",
      label: "Average answer speed",
      sub: "Even when calls come in waves",
    },
    {
      value: "0",
      label: "Leads lost to voicemail",
      sub: "Every call qualified and logged",
    },
  ],

  problem: {
    eyebrow: "Where the jobs leak out",
    title: "In restoration, the job goes to whoever picks up first",
    pains: [
      {
        icon: "Voicemail",
        title: "After-hours calls go to voicemail",
        body: "Water does not wait for business hours. The midnight pipe burst dials the next number on the list when yours rings out. By Monday the job is signed with someone else.",
      },
      {
        icon: "CloudRain",
        title: "Storm surges bury your phone",
        body: "One hailstorm sends a hundred homeowners to the phones at once. Your office holds three lines. The other ninety-seven hear a busy signal and dial a competitor.",
      },
      {
        icon: "Workflow",
        title: "Follow-up falls through the cracks",
        body: "Crews are on roofs, not at desks. Homeowners wait on callbacks and adjusters wait on supplements. Deals stall in the gap between the call and the callback.",
      },
    ],
    resolution:
      "Cozmo answers the moment it rings, qualifies the loss, and books the inspection, so the lead that comes in at midnight is on the crew calendar by sunrise.",
  },

  capabilities: {
    eyebrow: "What Cozmo does",
    title: "Built for the way storm work actually comes in",
    sub: "From the first emergency call to the final supplement, Cozmo runs the phone so your crews can run the jobs.",
    items: [
      {
        icon: "PhoneIncoming",
        title: "Answers every inbound lead",
        body: "Ad calls, referrals, and emergency lines get picked up live, in your company's name, by the second ring. No menu, no voicemail.",
      },
      {
        icon: "ClipboardCheck",
        title: "Qualifies the loss on the call",
        body: "Cozmo asks what your estimator would: cause of loss, roof or interior, standing water, square footage, carrier. The lead reaches your crew already scoped, not as a blank callback.",
      },
      {
        icon: "CalendarCheck",
        title: "Books inspections on the crew calendar",
        body: "Cozmo reads crew availability and drops the inspection into an open slot, routed by territory. The homeowner gets a time on the call and a text confirmation, no phone tag.",
      },
      {
        icon: "Zap",
        title: "Holds the line through storm surges",
        body: "When hail fills the phones, Cozmo answers every line at once. A hundred simultaneous calls each get a real conversation and a booked slot, while a front office stalls at line three.",
      },
    ],
  },

  steps: {
    eyebrow: "How it works",
    title: "Live on your lines in days, not months",
    items: [
      {
        n: "01",
        title: "Point your lines at Cozmo",
        body: "Forward your main number, after-hours line, and storm overflow to Cozmo. Calls keep landing on the number homeowners already have.",
      },
      {
        n: "02",
        title: "Teach it your trade and territory",
        body: "Cozmo learns your services, pricing guardrails, crew calendar, and the questions you ask on every loss. It speaks in your company's voice, not a generic script.",
      },
      {
        n: "03",
        title: "It answers, qualifies, and books",
        body: "Every call gets picked up live. Cozmo scopes the damage, books the inspection, texts the homeowner a confirmation, and logs it to your CRM.",
      },
      {
        n: "04",
        title: "You wake up to booked jobs",
        body: "Crews start the day with a full calendar and scoped leads. You see every call and booking Cozmo handled overnight.",
      },
    ],
  },

  integrations: {
    eyebrow: "Integrations",
    title: "Wired into the tools your crews already run",
    sub: "Cozmo logs every call and booking where your team already works.",
    items: [
      { name: "JobNimbus", category: "Restoration & roofing CRM" },
      { name: "AccuLynx", category: "Roofing contractor CRM" },
      { name: "ServiceTitan", category: "Field service management" },
      { name: "CompanyCam", category: "Jobsite photo documentation" },
      { name: "Xactimate", category: "Estimating & claims" },
      { name: "Encircle", category: "Water-mitigation field documentation" },
    ],
  },

  proof: {
    quote:
      "We used to lose every call that came in after five. Last hailstorm, Cozmo booked thirty-eight inspections overnight while the crew slept. A second intake team that never clocks out.",
    name: "Ray Whitfield",
    role: "Owner",
    org: "Midwest restoration & roofing firm",
    stat: {
      value: "38",
      label: "Inspections booked in one storm night",
    },
  },

  faqs: [
    {
      q: "What happens when a storm sends fifty calls at once?",
      a: "Cozmo answers all of them at once, with no queue and no busy signal. Each homeowner gets a real conversation and an inspection booked into an open crew slot.",
    },
    {
      q: "Can it book onto our existing crew calendar?",
      a: "Yes. Cozmo reads your availability, routes inspections by territory into open slots, and texts the homeowner a confirmation. It writes the appointment back to JobNimbus, AccuLynx, or ServiceTitan so your team sees it where they work.",
    },
    {
      q: "Does it sound like a robot reading a script?",
      a: "No. Cozmo speaks naturally, in your company's name, and follows the conversation. Most homeowners cannot tell, and anyone who asks is told plainly they are speaking with your AI assistant.",
    },
    {
      q: "Will it handle the insurance side, like supplements and status?",
      a: "Cozmo takes the status calls your crews cannot answer from a roof: when the crew is coming, where the supplement stands, whether the carrier approved. It answers from your job records and logs each call. It informs homeowners and adjusters; it does not negotiate claims or bind coverage.",
    },
  ],

  cta: {
    eyebrow: "Hear it answer",
    title: "Put Cozmo on your storm lines",
    sub: "Book a demo and we will walk through your intake and your busiest storm scenario. Or call the demo line now and hear Cozmo handle a hail-damage call.",
  },
};
