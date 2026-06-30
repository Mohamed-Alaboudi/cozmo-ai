# Cozmo AI — full redesign edit pass (2026-06-30)

Source of edits: user's line-by-line image notes. Decisions already locked:
- Phone → **full cortex layout** (centered logo + heading + form, drop chat transcript).
- Phone fields = **phone + email**; heading **"Call Cozmo's AI agent"** (italic accent line 2), Cozmo font (not serif).
- HubSpot demo link opens in a **new tab** on every Book-a-demo / Talk-to-us / Email-to-schedule CTA.
  `https://meetings.hubspot.com/alok-k?utm_source=website&utm_medium=cta&utm_campaign=demo&utm_content=talk-to-us&uuid=9f0102e2-ea92-48c2-af80-7d9a0cee941f`
- Contact info changed **everywhere** (single source of truth): email → `alok.k@cozmox.ai`, phone → `734 292 0276`.
- Create real **/privacy** and **/terms** pages, link in footer.

Two page systems share `components/marketing/sections.tsx`:
- **Segment pages** (Homeowners/Contractors/Carriers) render from `lib/content/{segment}.ts` → imgs #7–#34.
- **Main/home page** renders from `lib/content/home.ts` → imgs #35–#45.
Editing `sections.tsx` hits ALL pages at once = "apply to all of them". Per-page copy lives in content files.

---

## A. Global config / plumbing (do first)

1. **`lib/site.ts`** — single source of truth:
   - `email: "alok.k@cozmox.ai"`, `emailHref: "mailto:alok.k@cozmox.ai"`.
   - `demoPhone: "734 292 0276"`, `demoPhoneHref: "tel:+17342920276"`.
   - Add `demoUrl: "<hubspot link>"` constant.
   - Add `privacyHref: "/privacy"`, `termsHref: "/terms"`.

2. **CTA wiring** — point every "Book a demo" / "Talk to us" / "Email to schedule" at `SITE.demoUrl`, `target="_blank" rel="noopener noreferrer"`:
   - `nav.tsx` (desktop + mobile "Book a demo") [img #35].
   - `sections.tsx` Hero button [img #6], DemoSection card.
   - `calendly-section.tsx` "Email to schedule" → HubSpot link [img #33-area "Grab time"].
   - `LinkButton` already renders `<Link>`; for external + new tab use `<a href target>` or Link with target.

## B. Phone redesign — `PhoneStage` in `sections.tsx`  [imgs #1/#2/#5]

Replace the live-call-transcript `PhoneStage` body with the **cortex PhoneMockup** structure
(ref: `/Users/moea/cortex-ai/landing-page/components/PhoneMockup.tsx`), adapted to Cozmo:
- Keep `PhoneFrame` dark device (it already matches cortex bezel/status bar).
- Screen content: centered circular **Cozmo brand icon** (`/brand/cozmo-icon.png`) in a glass card.
- Eyebrow "INTERACTIVE DEMO" (accent, mono-ish, tracked).
- Heading: `Call Cozmo's` / italic-accent `AI agent`.
- Fields: **phone (+1 prefix)** then **email**, then orange **CALL ME** button (reuse accent button styling).
- Fine print line under button.
- **Drop**: the `scene.badge`/`callerMeta`/transcript bubbles + "Have Cozmo call you" header.
- New form component `components/voice/phone-call-form.tsx` (phone+email) posting to `/api/call-me`
  (extend route to accept optional `email`); keep graceful fallback.
- `PhoneScene` type + all `phone:` content blocks become unused by the phone but leave types intact
  (or trim later). Hero still receives `scene` — make it optional / ignore.

## C. Hero edits (segment + home)  [imgs #6, #8, #11→#12, #36, #37]

In `Hero` (`sections.tsx`):
3. **One button** [#6]: remove the secondary "Hear it live" button; keep single "Book a demo" → HubSpot.
4. **Remove background image** [#8]: drop the grayscale `image` photo + brackets behind the phone;
   center the phone in its column. Remove `image=` props from all 4 page files.
5. **Home hero copy** [#12, #36]: set `home.hero.h1` + `sub` to the user's pasted copy:
   - h1: "Better customer experience delivered by AI workforce"
   - sub: "AI agents that never miss a phone call, answer text across any channel, and update your CRM so your team can focus on the work they signed up for."
   - (Homeowners #11 also points to this — apply same h1/sub to homeowners hero, and carriers/contractors per "apply same to all". CONFIRM tone per-segment during build; may keep segment-specific nouns.)

## D. StatStrip  [imgs #9, #13, #14, #15, #16, #17, #21]

6. **Coverage marquee** [#16] "make 1,2 long lines instead of three": the marquee is one scrolling row;
   the "three" likely = the 3-up stat grid. **Make the stats sit 4-up side-by-side** [#21 "make these 1,2,3,4 all side by side"] → change StatStrip grid to a single row (`grid-cols-4` / flex nowrap on desktop), not 3 stacked.
7. **Remove sub-label "small text"** [#13, #14] — drop `stat.sub` lines if they read as clutter (the
   "Holidays and storm nights included" etc.) OR keep value+label only. RESOLVE on render.
8. **Remove the heavy top rule** [#15, #17] — the `border-t-2 border-ink` above each stat; reduce to
   hairline or remove. "reduce the width" [#15] → constrain stat column width.

## E. Capabilities / HowItWorks / Problem  [imgs #19, #20, #22, #23, #25, #26, #27]

9. Center + tidy the resolution line [#19 "put this centered and make it look nicer"] — the ProblemSection
   resolution arrow row; center it, improve type.
10. "one line" [#20, #27] — force specific headings/sub to a single line (reduce text / nowrap).
11. "remove this" [#22, #26, #32] — remove specific elements identified on render (likely stray
    sub-labels, an icon, or a divider). RESOLVE on render with screenshots.
12. "fix formatting" [#23, #25, #38] — spacing/centering fixes on render.

## F. Reorder: FAQ after demo  [img #28]

13. In every page file, move `<Faq>` to render **after** `<DemoSection>` (the "Hear Cozmo…" section).
    Currently Faq precedes DemoSection.

## G. DemoSection → "just phone + book button"  [img #29]

14. Per #29 "change this to literally just the phone for them to call and button to book a demo":
    simplify DemoSection to (a) the phone CTA / "or dial 734 292 0276" and (b) one "Book a demo" button →
    HubSpot. Remove the two-column Calendly/"Grab time with us" card [#30/#31 "remove this"], or replace
    with the single book button. CONFIRM exact layout on render.

## H. Footer  [imgs #33, #34, #43, #44]

15. Contact block → `alok.k@cozmox.ai` + `734 292 0276` (flows from `lib/site.ts`).
16. Add **Privacy Policy** + **Terms** links [#34] (new column or under Company).
17. "remove this" [#43/#44 footer ghost wordmark / consent] — likely remove the giant faint "Cozmo"
    ghost wordmark and/or trim. RESOLVE on render.

## I. New pages

18. `app/(marketing)/privacy/page.tsx` + `app/(marketing)/terms/page.tsx` — simple branded boilerplate,
    use existing `Section`/`Container`/prose. Metadata titles.

## J. Verify (REQUIRED — "actually look at the website")

19. `npm run build` + `npm run typecheck` must pass.
20. `next dev`, screenshot all 4 pages (home, homeowners, contractors, carriers) + /privacy + /terms at
    1440px via Playwright; resolve every "fix this / remove this / one line" against the render; iterate
    until clean. Use the `/design` `visual-design-loop` + `impeccable-review` skills.
21. Commit to a feature branch, push, redeploy to Vercel, confirm live.

## Open items to resolve ON RENDER (not guessable up front)
#13/#14 which "small text", #15 width amount, #22/#26/#32 exact "this", #23/#25/#38 what "fixed" means,
#29/#30/#31 final DemoSection shape, #43/#44 footer trim. All are visual — screenshot-driven.
