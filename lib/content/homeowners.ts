import type { SegmentContent } from "@/lib/content/types";

export const homeowners: SegmentContent = {
  slug: "homeowners",
  nav: "Homeowners",

  card: {
    tagline: "Every policyholder call answered, even at 2am.",
    blurb:
      "Cozmo picks up when a pipe bursts or a tree falls. It files the first notice of loss, books the adjuster, and answers coverage questions in your agency's voice, 24/7.",
    icon: "Home",
    bullets: [
      "Files FNOL while the caller is still on the line",
      "Books adjusters and inspections on the spot",
      "Answers coverage, COI, and payment questions 24/7",
    ],
  },

  hero: {
    eyebrow: "Homeowners insurance",
    h1: "A burst pipe at midnight, and someone picks up.",
    sub: "Cozmo answers every policyholder call for your homeowners book, around the clock. It takes the first notice of loss, books the adjuster, and answers coverage questions in your agency's voice.",
    heroStat: {
      value: "< 2 rings",
      label: "Average answer, day or night",
      sub: "No queue, no voicemail",
    },
    phone: {
      badge: "Live call · FNOL",
      caller: "(248) 555-0162",
      callerMeta: "Policyholder · burst pipe",
      agentLabel: "Cozmo · Claims intake",
      timer: "01:24",
      transcript: [
        {
          speaker: "caller",
          text: "Water's coming through the kitchen ceiling and I can't find the shutoff.",
        },
        {
          speaker: "cozmo",
          text: "I've filed your claim and booked an adjuster for 8am tomorrow.",
          highlight: "booked an adjuster for 8am tomorrow",
        },
      ],
    },
  },

  stats: [
    {
      value: "24/7",
      label: "Live claim intake",
      sub: "Holidays and storm nights included",
    },
    {
      value: "30+",
      label: "Languages spoken",
      sub: "Policyholders heard in their own",
    },
    {
      value: "SOC 2",
      label: "Type II infrastructure",
      sub: "Encrypted in transit and at rest",
    },
  ],

  problem: {
    eyebrow: "The after-hours gap",
    title: "Home losses keep their own schedule. Your phone line doesn't.",
    pains: [
      {
        icon: "Voicemail",
        title: "After-hours calls hit voicemail",
        body: "Pipes burst on Saturday nights. When the only option is a recording, the policyholder calls the number on a competitor's billboard instead.",
      },
      {
        icon: "Headphones",
        title: "Routine calls bury the team",
        body: "Proof of insurance, payments, claim status. The same questions all day pull producers off the work that grows the book.",
      },
      {
        icon: "Clock3",
        title: "Slow first notice makes losses worse",
        body: "Every hour between a burst pipe and a filed claim is another hour of water spreading. A late FNOL means bigger repairs and a bigger payout.",
      },
    ],
    resolution:
      "Cozmo answers all of it on the first ring, turning a midnight panic call into a filed claim with the adjuster already booked.",
  },

  capabilities: {
    eyebrow: "What Cozmo handles",
    title: "Every homeowner call, taken end to end",
    sub: "From a panicked call about water on the floor to a routine coverage question, Cozmo takes the whole call and finishes the work.",
    items: [
      {
        icon: "ClipboardCheck",
        title: "First notice of loss, filed live",
        body: "Cozmo collects the peril, date, location, and policy number, then files a clean FNOL in your management system before the call ends.",
      },
      {
        icon: "CalendarCheck",
        title: "Adjusters booked on the call",
        body: "It checks real availability, locks an inspection time while the policyholder is on the line, and texts the confirmation.",
      },
      {
        icon: "Umbrella",
        title: "Coverage questions, answered plainly",
        body: "Deductibles, water backup, wind and hail. Cozmo reads from your guidance and explains coverage in language a homeowner understands.",
      },
      {
        icon: "FileText",
        title: "Proof of insurance on demand",
        body: "When a mortgage company needs evidence of coverage, Cozmo confirms the policy and sends the COI without pulling in a producer.",
      },
    ],
  },

  steps: {
    eyebrow: "How it works",
    title: "From first ring to filed claim",
    items: [
      {
        n: "01",
        title: "Wire it to your stack",
        body: "Point your after-hours line, or your whole queue, at Cozmo. It loads your policies, coverage guidance, and scheduling rules from the systems you run.",
      },
      {
        n: "02",
        title: "Cozmo answers in your name",
        body: "A policyholder calls. Cozmo picks up in your agency's name, verifies the caller, and sorts a claim from a coverage question or a payment.",
      },
      {
        n: "03",
        title: "It does the work",
        body: "Cozmo files the FNOL, books the adjuster, or sends the COI, then writes every detail back to your management system.",
      },
      {
        n: "04",
        title: "Escalate with full context",
        body: "Anything that needs a person routes to the right desk with a transcript and summary attached, so nobody starts from zero.",
      },
    ],
  },

  integrations: {
    eyebrow: "Integrations",
    title: "It writes back to the systems you already run",
    sub: "Cozmo logs the claim, the notes, and the documents where your team works, from the management system to the rater to the phone.",
    items: [
      { name: "Applied Epic", category: "Agency management" },
      { name: "Vertafore AMS360", category: "Agency management" },
      { name: "HawkSoft", category: "Agency management" },
      { name: "QQ Catalyst", category: "Agency management" },
      { name: "EZLynx", category: "Management and rating" },
      { name: "Twilio", category: "Telephony" },
    ],
  },

  proof: {
    quote:
      "Saturday storm nights used to leave us forty voicemails deep by Monday. Now the claims are filed and the adjusters booked before anyone walks in. My producers spend the week selling, not catching up.",
    name: "Dana Whitfield",
    role: "Principal",
    org: "independent personal-lines agency",
    stat: {
      value: "24/7",
      label: "Claims answered, no new hires",
    },
  },

  faqs: [
    {
      q: "Can Cozmo actually file a first notice of loss, or just take a message?",
      a: "It files the claim. Cozmo collects the peril, date, location, and policy details, writes a structured FNOL into your management system, and triggers your claim workflow. A message is the fallback, not the default.",
    },
    {
      q: "What happens on a call Cozmo can't handle?",
      a: "It hands off. Anything outside its scope, or any caller who asks for a person, routes to the right desk with a transcript and summary attached. The policyholder never repeats themselves.",
    },
    {
      q: "How does it know our coverage and scheduling rules?",
      a: "You load them. Cozmo reads the policy data, coverage guidance, and adjuster availability in the systems you already run, so its answers match your book, not a generic script.",
    },
    {
      q: "Is policyholder data secure?",
      a: "Yes. Calls run on SOC 2 Type II infrastructure with encryption in transit and at rest, and Cozmo only touches the systems you connect.",
    },
  ],

  cta: {
    eyebrow: "See it live",
    title: "Hear Cozmo take a claim call",
    sub: "Enter your number and Cozmo calls you, takes a sample first notice of loss, and books a mock inspection on the spot. Or grab time to map it to your management system.",
  },
};
