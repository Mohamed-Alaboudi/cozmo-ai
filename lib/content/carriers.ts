import type { SegmentContent } from "@/lib/content/types";

export const carriers: SegmentContent = {
  slug: "carriers",
  nav: "Carriers",
  card: {
    tagline: "Absorb the CAT surge without staffing for it.",
    blurb:
      "Cozmo files the FNOL, fields status checks, and routes complex losses to adjusters with context. The queue holds through a 10x storm spike.",
    icon: "Building2",
    bullets: [
      "FNOL filed in three minutes, written into your core",
      "Status checks deflected so adjusters work real losses",
      "10x CAT surge absorbed, no temp staffing",
    ],
  },
  hero: {
    eyebrow: "For carriers and TPAs",
    h1: "When catastrophe hits, every call still gets answered.",
    sub: "Cozmo files first notice of loss in three minutes, deflects status checks, and routes only complex losses to an adjuster.",
    heroStat: {
      value: "10x",
      label: "CAT call surge Cozmo absorbs",
      sub: "no temp staffing, no busy signal",
    },
    phone: {
      badge: "Live call · CAT FNOL",
      caller: "(305) 555-0173",
      callerMeta: "Policyholder · hurricane, roof loss",
      agentLabel: "Cozmo · Claims intake",
      timer: "02:41",
      transcript: [
        {
          speaker: "caller",
          text: "Half my roof is gone. How do I start a claim?",
        },
        {
          speaker: "cozmo",
          text: "I'm filing your FNOL now. You'll have a claim number before we hang up.",
          highlight: "a claim number before we hang up",
        },
      ],
    },
  },
  stats: [
    {
      value: "3 min",
      label: "From the call to a filed FNOL",
      sub: "claim number on the line",
    },
    {
      value: "24/7",
      label: "Every line answered, every shift",
      sub: "storm night or quiet Sunday",
    },
    {
      value: "30+",
      label: "Languages spoken on intake",
      sub: "heard in their own words",
    },
  ],
  problem: {
    eyebrow: "The CAT problem",
    title: "The day of the storm is the day the phones break.",
    pains: [
      {
        icon: "CloudRain",
        title: "CAT day buries the queue",
        body: "A single storm spikes call volume 10x in an hour. Real losses wait on hold behind everyone checking a status.",
      },
      {
        icon: "Headphones",
        title: "Adjusters drown in status checks",
        body: "Most calls are 'where is my check' or 'did you get my photos.' Adjusters recite claim numbers instead of working real losses.",
      },
      {
        icon: "Users",
        title: "You cannot staff for the spike",
        body: "Catastrophe volume arrives in days, not quarters. Seasonal reps are slow to hire and gone by next season.",
      },
    ],
    resolution:
      "Cozmo answers on the first ring, files the FNOL, deflects status checks, and hands adjusters only the calls that need a human.",
  },
  capabilities: {
    eyebrow: "Capabilities",
    title: "Every call a claims org actually gets.",
    sub: "FNOL, status, and the CAT surge, answered in your voice and written into your core systems.",
    items: [
      {
        icon: "FileText",
        title: "First notice of loss, filed live",
        body: "Cozmo collects loss details, coverage, and photos by text, then writes a structured FNOL into ClaimCenter or Duck Creek before the call ends.",
      },
      {
        icon: "RefreshCw",
        title: "Status calls answered, not queued",
        body: "Cozmo reads claim status, payment timing, and next steps from the core in plain language. Most never reach an adjuster.",
      },
      {
        icon: "Activity",
        title: "CAT surge absorbed automatically",
        body: "When a storm spikes volume 10x, Cozmo answers every line at once. No busy signals, no temp call center.",
      },
      {
        icon: "UserCheck",
        title: "Complex and emotional calls routed with context",
        body: "On a total loss, an injury, or a distressed caller, Cozmo warm-transfers to an adjuster with the transcript and claim on screen.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From your core systems to live in weeks.",
    items: [
      {
        n: "01",
        title: "Wire into your core",
        body: "Cozmo connects to ClaimCenter, PolicyCenter, or Duck Creek through their APIs, reading claim status and writing FNOL.",
      },
      {
        n: "02",
        title: "Train the voice and the rules",
        body: "We script intake, coverage logic, and the triggers that route a call to a human, tuned to your lines of business.",
      },
      {
        n: "03",
        title: "Go live on a single queue",
        body: "Start with FNOL or status on one line. Cozmo answers and files while your team watches every transcript.",
      },
      {
        n: "04",
        title: "Scale to the surge",
        body: "Roll Cozmo across lines to hold the CAT spike. Capacity is elastic, so a 10x day costs nothing extra.",
      },
    ],
  },
  integrations: {
    eyebrow: "Integrations",
    title: "Wired into the systems your claims org already runs.",
    sub: "Cozmo reads and writes through the core platforms your adjusters already use.",
    items: [
      { name: "Guidewire ClaimCenter", category: "Claims management" },
      { name: "Guidewire PolicyCenter", category: "Policy administration" },
      { name: "Duck Creek", category: "Core suite, P&C" },
      { name: "Sapiens", category: "Core insurance platform" },
      { name: "Origami Risk", category: "Risk and claims, RMIS" },
      { name: "Snapsheet", category: "Virtual claims and payments" },
    ],
  },
  proof: {
    quote:
      "The storm used to mean busy signals and borrowed temps. Now the FNOLs are filed before my adjusters log in, freeing them for real losses.",
    name: "Dana Whitfield",
    role: "VP, Claims Operations",
    org: "regional P&C carrier",
    stat: {
      value: "0",
      label: "Seasonal reps hired last storm season",
    },
  },
  faqs: [
    {
      q: "How does Cozmo decide when to bring in a human adjuster?",
      a: "You set the triggers. Injuries, suspected fraud, total losses, large exposures, or a distressed caller route to a licensed adjuster, warm-transferred with the transcript, claim, and sentiment.",
    },
    {
      q: "Can it actually write a FNOL into ClaimCenter?",
      a: "Yes. Cozmo captures loss facts, coverage, and photos by text, then writes a structured FNOL through your core system's API. The claim number issues on the call.",
    },
    {
      q: "What happens to call quality when volume spikes 10x?",
      a: "Nothing changes. Cozmo answers every line in parallel, so a CAT day sounds like a quiet Tuesday, with no queue to overflow.",
    },
    {
      q: "Is policyholder data handled to carrier standards?",
      a: "Cozmo runs on SOC 2 Type II controls, encrypts data in transit and at rest, and follows TCPA consent on outbound calls. Data stays in systems you authorize.",
    },
  ],
  cta: {
    eyebrow: "See it before the next storm",
    title: "Put Cozmo on your hardest call day.",
    sub: "Book a working demo and we will run your CAT scenario: FNOL filed, status deflected, complex losses routed. Or call the demo line and hear Cozmo take a claim.",
  },
};
