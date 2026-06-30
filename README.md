# Cozmo — AI phone agents for insurance

Marketing site for **Cozmo**, an AI phone agent built for the insurance
industry. An umbrella home page plus three audience landing pages —
**Homeowners**, **Contractors**, and **Carriers** — each a full page with its
own hero, proof, integrations, and demo.

## Highlights

- Positioning for insurance call work: first notice of loss, claim status,
  scheduling, policy questions, after-hours and catastrophe-surge overflow.
- Interactive hero: a live-call phone mockup with a working "have Cozmo call
  you" form, backed by a provider-agnostic `/api/call-me` endpoint.
- Book-a-demo via Calendly, with a graceful fallback when no URL is set.
- Light editorial design system: Space Grotesk + Inter, a single restrained
  accent, near-grayscale photography, and one dark cinematic band.
- Accessible and fast: server components by default, reduced-motion support,
  static-rendered marketing pages.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript (strict)
- Tailwind CSS v4 (CSS-first design tokens)
- lucide-react · react-calendly · Lenis (smooth scroll)

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

Production: `npm run build && npm start`. Typecheck: `npm run typecheck`.

## Configuration (optional)

Copy `.env.example` to `.env.local`:

- `VOICE_API_KEY`, `VOICE_AGENT_ID`, `VOICE_AGENT_PHONE_ID` — wire a live
  "Cozmo calls you" demo to any voice provider. Without them, the call form
  still works and gracefully tells the visitor to dial the line.
- `NEXT_PUBLIC_CALENDLY_URL` — embed a real Calendly scheduler. Without it the
  demo section shows an email fallback.

## Structure

```
app/(marketing)/       home + homeowners / contractors / carriers
app/api/call-me/       provider-agnostic "call me" endpoint
components/marketing/   nav, footer, section vocabulary, Calendly
components/voice/        phone hero kit + call form
components/ui/           design-system primitives
lib/content/            per-audience copy (typed content model)
```
