# CLAUDE.md — MVRK Forms (v2)

Read `DIAGNOSIS.md` then `DESIGN-DIRECTION.md` before writing any code.
This file is the rules. It supersedes the previous CLAUDE.md entirely.

**This kit is the only source of truth.** Do not read, copy from, or inherit
from `mvrk-zapier`, `mvrk-zapier-D`, `mvrk-zapier-F`, or the previous
`BRIEF.md`. The one exception is named below.

---

## What this is

A single scrollable marketing page for **MVRK Forms**, a 100% Salesforce-native
forms product by MVRK. Client is Vuk Stajic. Pre-launch: the install CTAs say
"Coming Soon" and scroll to the waitlist.

Next.js 16 App Router, TypeScript, Tailwind v4, GSAP, Lenis.
Static export, deployed to a subpath: `https://www.mvrk.ca/forms`.

**The page tells one story: a single form's life.** Build, Think, Share,
Collect. It is not a feature catalogue. `DESIGN-DIRECTION.md` section 2.

---

## Start here: three defects, before anything else

Full evidence in `DIAGNOSIS.md`. Summary:

1. **Fonts are declared and never applied.** `@theme inline` does not emit its
   custom properties, so `var(--font-display)` resolves to empty and every
   heading renders in the system sans. Move the aliases to a real `:root`
   block. **Verify by reading computed `font-family` on an `h1` in devtools.**
   It must contain `rader`.
2. **The reveal system strands nine elements at `opacity: 0` permanently**,
   including the whole hero and the waitlist form, on ordinary wheel scroll.
   Use `fromTo` with `immediateRender: false`, keep hero content off
   ScrollTrigger entirely, and add a load-plus-one-second failsafe that forces
   any still-hidden `[data-fx]` visible.
3. **A 404 on `/forms/icon.png` every load.** Route it through the
   basePath-aware helper.

Do not start design work until all three are fixed and verified in a browser.

---

## Hard rules

1. **Copy is law.** Every string comes from `src/config.ts`, byte-identical,
   transcribed from the client's wireframe. Never rewrite, shorten or polish
   it. Never hardcode a string in a component. If a section needs words that
   are not in config, stop and ask.

   One exception, already approved in principle and pending one line from Vuk:
   the four numbered eyebrows `01 BUILD`, `02 THINK`, `03 SHARE`,
   `04 COLLECT`. They are labels, not copy. Nothing else gets added.

2. **The install CTAs do not install anything. They scroll to the waitlist.**
   Every install button renders `cta.label`, is a `<button>` with no `href`,
   and eases to the waitlist through `scrollToY()` in `lib/smoothScroll.ts`.
   Never `window.scrollTo` directly, it fights Lenis. `cta.futureLabel` exists
   for the flip at launch; do not wire it now.

3. **Palette.** The six brand hexes never change. Derived tokens may be added
   to `:root` when contrast requires it. **There is no black.** `--ink`
   `#4B5B71` is the floor. Never `#000`, never `black`, never a neutral grey
   that is not `--grey` `#5E5E5E`.

   **Warm carries the page, cool marks the Salesforce-adjacent.** Cream and
   plum are the world. Cyan lives in the hero and as `--band-icon` on plum
   bands, and nowhere else. Rose is the action colour and nothing else: CTA
   fill, never headings, never borders, never underlines. The rose-to-plum
   gradient appears **exactly twice**: hero line 2, and the logo artwork.
   All type is `--ink`, `--grey`, `--cream` or `--paper`.

   Full table with measured contrast ratios: `DESIGN-DIRECTION.md` section 4.

4. **Salesforce cyan `#01A0E1` is reserved.** It marks Salesforce and nothing
   else. `--turquoise` and `--teal` are carried for parity and have no job.

5. **Icons: one set, style parity, never emoji-like.** All twelve stroke-based,
   one 24px grid, one stroke width, one corner style, drawn as inline SVG in
   `src/components/icons/`. Render them at 40px, not 24px: at 24px inside a
   52px chip they read as UI affordances rather than illustration.

   Custom-drawn is the plan. Put all twelve on the scratch page together at
   final size before any of them touch a band. The set fails if two read as the
   same silhouette, or if any one needs a different stroke width to work, or if
   flow-chart, funnel or data-tray is unreadable. On failure, swap the whole set
   to Phosphor duotone, one weight, restyled. Do not iterate a fourth time.

6. **Vary the composition, hold the system.** The four bands each get their own
   rhythm (`DESIGN-DIRECTION.md` section 6). What stays identical across all
   four: eyebrow style, heading face and scale, icon stroke and size, band
   padding, entrance timing, and the icon-title-subtitle order. What varies:
   arrangement only. A band that invents its own type scale or spacing has gone
   too far.

   This rule replaces v1's "one layout for all four". That rule is what made
   the page a catalogue.

7. **Depth is allowed and wanted.** Plum bands take an inset vignette toward
   `--plum-deep`. Cream grounds take a 3% grain overlay. Cards take
   `--shadow-md`. What is still banned is decorative gradient: depth that reads
   as a gradient band is too much, and rose-to-plum stays at its two permitted
   places.

   This rule replaces v1's "plum bands are flat, no gradient, no depth".

8. **Motion vocabulary comes from `src/lib/motion.ts`.** `EASE`, `DUR_ENTER`,
   `DUR_MICRO`, `STAGGER`, `TRAVEL`, `SCROLL_START`, carried verbatim from
   `mvrk-orbit`. Tune there, never per component. Three durations, two eases.

   Everything enters once and settles; the word cycler is the only forever
   loop. But "settles" does not mean "is static": the eleven effects in
   `DESIGN-DIRECTION.md` section 8 are the expected baseline, not extras.

9. **Fail open, never fail closed.** Nothing that hides content may depend on
   JavaScript arriving. This rule existed in v1 and was still violated, so this
   time the order is: **build the no-JS, reduced-motion view first, confirm it
   reads and looks good, then layer motion on top.** Not the reverse.

10. **Guard every animation with `prefersReducedMotion()`.** The word cycler
    falls back to `hero.staticWord`. The org boundary renders unpinned. The
    page must be complete and good-looking with all motion off, and you must
    look at that view deliberately before calling a section done.

11. **Static export served from `/forms`.** `output: "export"`,
    `basePath: "/forms"`, `assetPrefix: "/forms"`, `trailingSlash: true`,
    `images: { unoptimized: true }`. Never reference an asset as a bare
    absolute path like `/brand/icon.svg`: it 404s under the basePath. Import
    it, or route it through the basePath-aware helper.

12. **One product video, in its own band.** Not four, not inside a feature
    band. No heading, because no heading copy exists and rule 1 says you ask
    rather than invent.

    The file is not delivered. **Until it is, do not ship a full-height empty
    browser frame directly under the hero.** Either drop the band and reinstate
    it when the file lands, or reduce it to a 16:9 strip with a designed
    coming-soon state. When the file arrives: MP4 H.264 plus WebM, poster
    always, `preload="metadata"`, muted autoplay on IntersectionObserver,
    paused offscreen, static poster under reduced motion.

13. **The waitlist form is the only thing that talks to a server.** First name,
    last name, email, required consent checkbox. Submit disabled until checked.
    Posts client-side to a Google Apps Script web app; the page stays a static
    export.

    - Endpoint from `process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT`, never from
      `config.ts`. Vuk edits config and must not be able to break the endpoint.
    - **Send a simple request or CORS fails.** Apps Script does not answer
      `OPTIONS`. Use `URLSearchParams`, or a JSON string with
      `Content-Type: text/plain;charset=utf-8`. Never `application/json`.
      Never `mode: "no-cors"`: the response goes opaque and you cannot tell
      success from failure.
    - Honeypot field plus a minimum time-to-submit check. No CAPTCHA, no rate
      limiting on the endpoint.
    - Three states, all required: submitting, success (replace the form, not a
      toast), failure (real message plus `vuk@mvrk.ca`).
    - Real `<label>` elements, visible focus rings, `aria-describedby` linking
      the note to the checkbox.

---

## The one permitted code reference

`D:\Dev\MVRKxZapier reference 1\mvrk-orbit`

Read it **only** for: the font setup, `lib/motion.ts`, `lib/smoothScroll.ts`,
and the `ScrollFxProvider` `data-fx` pattern. Do not copy its components,
sections, colours or layout.

The design references in `D:\Dev\MVRKxZapier reference 1` (`elementis-site`,
`otis-valen-next`, `ochi.design-UI-Clone`, `Axel-Vanhessche`,
`Viditor_landing_page`, `awwwards-collection`) are for **technique only**.
Mapped to specific uses in `DESIGN-DIRECTION.md` section 9. Nothing on this
page should be identifiable as a specific reference.

---

## Code conventions

- `"use client"` only where state, effects or events are actually needed.
- `useGSAP()` from `@gsap/react`, never raw `useEffect` plus `gsap.context()`.
- `gsap.registerPlugin` once, in `lib/motion.ts`. Never in a component.
- Tailwind for layout and spacing. CSS custom properties for colour and type.
  **Do not put type or colour aliases in `@theme inline`.** That is defect 1.
- Section components in `src/components/sections/`, one per section.
- `FeatureBand.tsx` stays **one** component driven by config. Add a `rhythm`
  field to each band and branch the composition on it. Do not write four files.
- Band order: Nav, Hero, Demo, Creative Design, Intelligent Automation,
  Secure Sharing, Clean Data, Waitlist, Footer.
- No `any`. No `@ts-ignore`.
- Next.js 16 differs from 15. If you are not certain about a Next API, say so
  and ask, or check nextjs.org/docs. Do not guess, and do not look for docs
  inside `node_modules`: they are not shipped there.

---

## Definition of done, every section

- Renders in **PP Rader and Neue Montreal**, verified in devtools computed
  styles, not by eye.
- **Nothing stranded at `opacity: 0`** after a real wheel scroll top to bottom.
- Complete and good-looking with **JavaScript disabled**.
- Complete and good-looking under **`prefers-reduced-motion: reduce`**. Look at
  it deliberately.
- Works at 320, 768, 1280, 1920.
- Keyboard reachable, visible focus ring.
- Text contrast at least 4.5:1 body, 3:1 display, **measured on the actual
  background it sits on**.
- No layout shift on load. No console errors, no 404s.
- Every string matches `config.ts` exactly.
- Spacing, radius and shadow come from the shared system. The band varied its
  arrangement, not its system.
- Nothing on screen exists only to fill space.
