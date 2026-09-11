# CLAUDE.md — MVRK Forms

Read `BRIEF.md` once before writing any code. This file is the rules.

**This kit is the only source of truth.** Do not read, copy from, or inherit
anything from `mvrk-zapier`, `mvrk-zapier-D`, `mvrk-zapier-F`, or any other
folder on this machine. The one exception is named below.

---

## What this is

A single scrollable marketing page for **MVRK Forms**, a 100% Salesforce-native
forms product by MVRK. Client is Vuk Stajic. The site is pre-launch: the product
is not shippable yet, so the install button says "Coming Soon" and goes nowhere.

Next.js 16 App Router, TypeScript, Tailwind v4, GSAP, Lenis.
**Static export, deployed to a subpath: `https://www.mvrk.ca/forms`.**

---

## Hard rules

1. **Copy is law.** Every string comes from `src/config.ts`, byte-identical.
   It was transcribed from the client's wireframe annotations. Never rewrite,
   improve, shorten, or "polish" it. Never hardcode a string in a component.
   If a section needs words that aren't in config, stop and ask.

2. **The install CTAs do not install anything. They scroll to the waitlist.**
   Every install button renders `cta.label` ("Coming Soon"), is a `<button>`
   with no `href` and no navigation, and on click eases the page to the
   waitlist section through `scrollToY()` in `lib/smoothScroll.ts`. Never
   `window.scrollTo` directly, or it will fight Lenis.

   The label does not change. `cta.futureLabel` ("Install For Free") exists in
   config for the flip at launch, which will point at the Salesforce AppExchange
   listing. Do not wire that href now.

   **The waitlist form's own submit is the only real action on the page.** See
   rule 12.

3. **Palette is exact.** Hex values in `globals.css` only. **There is no black
   in this palette.** The darkest value is `--ink` `#4B5B71`. Never use `#000`,
   `black`, or a neutral grey that isn't `--grey` `#5E5E5E`.

   Derived tokens (`--plum-deep`, `--rose-soft`, `--rose-ink`) may be added to
   `:root` when contrast requires it. The six brand hexes themselves never change.

   **How the two halves of the palette are used.** Plum and rose come from the
   Forms brand sheet; tint, turquoise, teal, slate and ink come from the MVRK
   parent. Warm carries meaning, cool carries structure. They never compete
   inside the same element.

   - **Plum is a surface, not an accent.** Bands 3 and 5 are **full-bleed solid
     plum**, flat, no gradient, high contrast against the paper bands either
     side. Plum appears almost nowhere else. Scattered small purple accents are
     the exact AI-slop tell the client pushed back on.
   - **Rose is the action colour and nothing else.** CTA fill at full strength.
     Not headings, not borders, not underlines.
   - **The rose-to-plum gradient appears exactly twice:** hero line 2, and the
     logo mark. It is the logo's own gradient. Nowhere else, ever.
   - **All text is `--ink`, `--grey` or `--paper`.** Never body copy in plum.
     Gradient display type uses `--rose-ink`, not `--rose`, for contrast.
   - **Icons on plum bands are `--tint`**, not `rose-soft`. Warm on warm goes
     mushy and only reaches 3.8:1; tint on plum is 5.4:1 and is the one place
     the cool palette earns its keep.
   - **`--turquoise` and `--teal` have no job on this page.** Carried for
     parity. Do not reach for them.
   - Depth stays under about a 6% delta. If you can see it as a gradient, it is
     too much. The plum bands get none at all.

4. **Salesforce cyan `#01A0E1` is reserved.** It marks Salesforce and nothing
   else. Do not use it as a general accent.

5. **Icons: one set, style parity, never emoji-like.** The client called this
   out explicitly. All twelve are stroke-based, drawn on the same 24px grid at
   the same stroke width, in the same corner style. Draw them as inline SVG in
   `src/components/icons/`. Do not mix sets, do not use emoji, do not use a
   filled icon next to an outlined one.

   **Custom-drawn is the plan, with a defined bail-out.** Draw all twelve, then
   put them on a scratch page **at 24px, together, in one row**, before any of
   them touch a band. Judge them there, not at 200px where everything looks
   fine. The set fails if any of these is true:

   - Two icons read as the same silhouette at 24px.
   - Any one of them needs a different stroke width or corner radius to work.
   - The flow-chart, funnel or data-tray glyph is unreadable at 24px. Those
     three are the hard ones and they are where a custom set usually breaks.

   If it fails, do not iterate a fourth time. Swap the whole set to **Phosphor
   duotone**, one weight, restyled into `--band-icon` with rounded caps and
   joins. All twelve from that one library, never a mix. Losing a day polishing
   icons is the worst possible trade against the 14 Sept date.

6. **The word cycler is the only thing on the page that moves forever.**
   Everything else enters once and settles. This mirrors the orbit rule from
   the Zapier page and it is what stops the page reading as busy.

   The intro curtain is exempt: it plays once per session and is gone.

7. **Motion vocabulary comes from `src/lib/motion.ts`.** `EASE`, `DUR_ENTER`,
   `DUR_MICRO`, `STAGGER`, `TRAVEL`, `SCROLL_START`. These values are carried
   verbatim from `mvrk-orbit` so the two MVRK properties move the same way.
   Tune there, never per component.

8. **Guard every animation with `prefersReducedMotion()`.** The word cycler
   falls back to the static word `hero.staticWord`. The intro curtain never
   plays at all.

9. **Fail open, never fail closed.** Nothing that hides content may depend on
   JavaScript arriving. `[data-fx] { opacity: 0 }` is scoped to `html.js`,
   set by an inline head script. The intro curtain's SSR default is `skip`.
   If a bundle never loads, the page must still be readable.

10. **The build is a static export served from `/forms`.** `next.config.ts`
    sets `output: "export"`, `basePath: "/forms"`, `assetPrefix: "/forms"`,
    `trailingSlash: true`, `images: { unoptimized: true }`. Never reference an
    asset as a bare absolute path like `/brand/icon.svg` — it will 404 under
    the basePath. Import it, or route it through a basePath-aware helper.

11. **One product video, in its own band, directly after the hero.** Not four,
    and not inside a feature band. The four feature bands stay uniform. The
    demo band has no heading, because no heading copy exists and rule 1 says
    you stop and ask rather than invent one.

    The file is not delivered yet. Build against `demo.src === null` and make
    that state a designed poster placeholder, not an empty div. The layout must
    not reflow when the real file lands. 16:9 desktop capture, framed in
    browser chrome. MP4 H.264 plus WebM, poster always, `preload="metadata"`,
    muted autoplay on IntersectionObserver, paused when offscreen, static
    poster under reduced motion.

12. **The waitlist form is the only thing on the page that talks to a server.**
    First name, last name, email, and a required consent checkbox. Submit is
    disabled until the box is checked. It posts client-side to a Google Apps
    Script web app; the page itself stays a static export.

    - Endpoint comes from `process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT`, never
      from `config.ts`. Vuk edits config directly and must not be able to break
      the endpoint.
    - **Send a simple request or CORS will fail.** Apps Script does not answer
      `OPTIONS`. Use `URLSearchParams`, or a JSON string with
      `Content-Type: text/plain;charset=utf-8`. Never
      `application/json`. Never `mode: "no-cors"` — the response goes opaque and
      you cannot distinguish success from failure.
    - Honeypot field plus a minimum time-to-submit check. There is no CAPTCHA
      on this page and no rate limiting on the endpoint.
    - Three states, all required: submitting, success (replace the form, do not
      just toast), and failure (real message plus `vuk@mvrk.ca` as a fallback).
    - Real `<label>` elements, visible focus rings, `aria-describedby` linking
      the note text to the checkbox.

---

## The one permitted reference

`C:\Users\qasim\Claude\Projects\BRAHMA Group Website Development\mvrk-orbit`

Read it **only** for: the `@font-face` block and font files, `lib/motion.ts`,
`lib/smoothScroll.ts`, and the `ScrollFxProvider` `data-fx` reveal pattern.

Do not copy its components, its sections, its colours, or its layout. That page
is a dark-accented integration story; this one is a light product page. They
share a type system and a motion vocabulary, nothing else.

---

## Code conventions

- `"use client"` only where state, effects, or events are actually needed.
- `useGSAP()` from `@gsap/react`, never raw `useEffect` + `gsap.context()`.
- `gsap.registerPlugin` is called once, in `lib/motion.ts`. Never in a component.
- Tailwind for layout and spacing. CSS custom properties for colour and type.
  Long GSAP-driven class strings in Tailwind become unreadable fast.
- Section components live in `src/components/sections/`, one per section,
  named after the section in `BRIEF.md`.
- `FeatureBand.tsx` is **one** component driven by config, rendered four times.
  Do not write four near-identical section files.
- Band order on the page is: Nav, Hero, Demo, Creative Design, Intelligent
  Automation, Secure Sharing, Clean Data, Waitlist, Footer.
- No `any`. No `@ts-ignore`.
- Next.js 16 has breaking changes from 15. If you are not certain about a Next
  API, say so and ask, or check nextjs.org/docs. **Do not guess, and do not go
  looking for docs inside `node_modules` — they are not shipped there.**

---

## Definition of done, every section

- Works at 320px, 768px, 1280px, 1920px.
- Keyboard reachable, visible focus ring.
- Correct under `prefers-reduced-motion: reduce`.
- Correct with JavaScript disabled: content visible, nothing permanently hidden.
- Text contrast is at least 4.5:1 for body, 3:1 for display, on the actual
  background it sits on. Check it, do not assume it.
- No layout shift on load.
- No console errors or warnings.
- Every string matches `config.ts` exactly.
- Radius, spacing and shadow match the rest of the page. The section did not
  invent its own system.
- Nothing on screen exists only to fill space.
