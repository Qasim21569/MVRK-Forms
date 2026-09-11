# MVRK Forms — Build Brief

Single scrollable marketing page. Pre-launch. Client: Vuk Stajic, MVRK.
Prepared September 2026.

---

## 1. Context

**The product.** MVRK Forms is a forms builder that lives entirely inside
Salesforce. No external service, no data leaving the org, free forever. It is
branded "FORMS by MVRK", a sub-brand of the parent consultancy.

**The relationship.** Qasim has built for Vuk before: mvrk.ca, a client portal,
and the Salesforce-Zapier page at mvrk.ca/zapier. Vuk gives this a small slice
of his week, so batch questions with specific options rather than open-ended
asks. He responds well to a decision framed as A or B.

**What we already know works with this client**, carried from the Zapier build:

- Copy locked verbatim in a typed config file, so he can edit content without
  a developer.
- A short list of locked constraints, and explicit latitude everywhere else.
- One signature motion that runs forever, everything else entering once.
- A single unambiguous kit. On the last project Claude Code repeatedly
  inherited from a stale sibling folder and dragged a rejected brutalist style
  back in across several passes. That is the failure mode to avoid here.

**Where it differs from the Zapier page.** That page was a dense integration
story for enterprise salespeople. This is a light, fast product page for
Salesforce admins. Fewer ideas, more air, one clear action.

---

## 2. The aim

A Salesforce admin lands, and inside ten seconds understands three things:

1. This is a forms builder that runs natively inside Salesforce.
2. It is free.
3. It is not available yet, and they want it when it is.

The page has one job beyond that: **look good enough that MVRK's competence is
not in question.** Vuk will judge it the way he judged the Zapier page, on
whether it reads as studio work.

**Not aims.** No blog, no pricing table, no docs, no signup flow. The product
does not exist publicly yet.

**Email capture is now in scope.** On 04/09/26 Vuk asked for a waitlist form,
and on 10/09/26 sent an annotated reference for it. Full spec in `REVIEW.md`
section A2.

---

## 3. Locked vs yours

This split is deliberate. Do not blur it.

### Locked, do not drift

- Every string, byte-identical from `src/config.ts`.
- The palette hex values, and the usage system in `CLAUDE.md` rule 3.
- Section order: Nav, Hero, Demo, Creative Design, Intelligent Automation,
  Secure Sharing, Clean Data, Waitlist, Footer.
- The alternating light / plum band rhythm from the wireframe. Plum bands are
  **full-bleed solid**, flat, no gradient.
- Every install CTA says "Coming Soon", installs nothing, and scrolls to the
  waitlist form.
- Icon style parity, stroke-based, never emoji-like.
- The type system, inherited from `mvrk-orbit`.
- The motion constants in `lib/motion.ts`.

### Yours, make real choices and commit

Layout and composition inside each band, the grid for the three-up feature
rows, spacing scale, radius, shadow and depth language, section rhythm and
padding, how the icons are drawn, hover and focus states, micro-interactions,
how the hero word transition actually animates, background texture and
gradient treatment within the palette.

Vuk explicitly allows backgrounds to be "a bit more dynamic than flat".
Gradients, tints, texture and depth are all fair game inside the palette.

**Avoid**: the generic AI landing page tells (purple gradients, purposeless
glassmorphism, floating blobs, emoji icons, mixed icon sets, isometric
illustrations, symmetrical low-contrast template layouts). Also avoid the
over-correction into neo-brutalism (thick borders, hard zero-blur offset
shadows, square corners everywhere). That was tried on the Zapier project, it
fought the palette, and Vuk never approved it. These are soft, cool, friendly
colours and they want a surface language to match.

---

## 4. Page spec

Six bands. All copy below is in `config.ts`. It is reproduced here so you can
see the shape, not so you can retype it.

### Band 0 — Nav

Sticky or fixed, your call. Logo left (`FORMS by MVRK` primary lockup), single
CTA right, pill-shaped, rose fill. Nothing else. No nav links: there is nowhere
to go.

### Band 1 — Hero

Background `--tint` `#CCEEF3`, or a gradient that stays inside tint and paper.

Headline is two lines:

```
[CYCLING WORD]
Forms For Salesforce
```

Line 1 is a single word that cycles through 46 entries. Line 2 is static, set
in a rose-to-plum gradient.

**The cycler is the page's signature.** 46 words, in the exact order in
`config.ts`. "Free" recurs eleven times as an anchor, roughly every fourth
word, which is the point: the product is free and the headline keeps saying so
without a single hard sell. The list runs Free, Fantastic, Funky, Flawless,
Free, Fancy, Fun, Fresh, Free, Fluid, and so on, ending on Frontline, then
loops.

Transition style is yours. It should feel light and quick, not a slot machine.
Suggested default if nothing better presents itself: mask the word, previous
word exits up while the next enters from below, `DUR_MICRO` on the exit,
`DUR_ENTER` on the entrance, roughly 1.6s dwell per word. Width should animate
smoothly so line 2 never jumps.

Under reduced motion, render `hero.staticWord` ("Fast") and never cycle.

Subhead: `100% Salesforce Native Forms. Free Forever!`

CTA below, same button as nav.

> Vuk's note on the wireframe says "PLAY VIDEO HERE TO SEE TEXT TRANSITION".
> He recorded a reference for the transition. If Qasim has that video, match
> it and ignore the suggested default above.

### Band 1.5 — Demo

Added 10/09/26. Scope moved from four videos to one, and it gets its own band
rather than sitting inside a feature section: the four bands stay uniform, and
the only real product visual on the page gets full weight instead of being
buried in a feature row.

Background `--paper`. **No heading.** No heading copy exists and rule 1 says
stop and ask rather than invent one. Video only, framed in browser chrome,
16:9 desktop capture.

The file is not delivered. `demo.src` is `null` and the band renders a designed
poster placeholder. Layout must not reflow when the real file lands. Details in
`REVIEW.md` A1.

### Bands 2 to 5 — the four feature sections

Identical structure, alternating background:

| Band | Heading | Background |
|---|---|---|
| 2 | Creative Design | light (`--paper`) |
| 3 | Intelligent Automation | plum (`--plum`) |
| 4 | Secure Sharing | light (`--paper`) |
| 5 | Clean Data | plum (`--plum`) |

Each has a section heading and three items. Each item is icon, title, subtitle.

On plum bands, text goes to `--paper` and **icons to `--tint`**, not
`--rose-soft`. Warm on warm goes mushy and only reaches 3.8:1; tint on plum is
5.4:1. Do not drop subtitle opacity below 0.85.

On light bands, subtitle text is `--grey`, not `--slate`. `--slate` on
`--paper` is 4.05:1 and fails AA. See `REVIEW.md` C2.3.

The wireframe shows these as a vertical list of three rows with the icon in a
rounded square to the left. That is one option, not a requirement. A three-up
grid, an offset stagger, or a horizontal rhythm are all open. Pick one and use
it for all four bands so they read as a set.

**The twelve icons**, in order:

Creative Design: computer mouse, speech bubble, painter's palette.
Intelligent Automation: decision flow chart, gear, chain link.
Secure Sharing: cloud, checked checkbox, right arrow.
Clean Data: magnifying glass, funnel, data tray.

The client's exact words: *"All icons we select should have clear style parity
with each other and I don't want them looking emoji like. We can do better than
that."* Draw them. One grid, one stroke width, one corner radius, one join
style.

### Band 5.5 — Waitlist

Added 10/09/26. Background `--paper`. Every "Coming Soon" button on the page
scrolls here.

First name, last name, email, required consent checkbox, submit reading
"Email Me When Available". Posts to a Google Apps Script web app. The page
stays a fully static export.

Full spec, exact copy, the four Apps Script gotchas and the three required
states are in `REVIEW.md` section A2. Read it before writing this band; the
CORS behaviour in particular will look like a deploy bug and is not one.

### Band 6 — Footer

Background `--ink` `#4B5B71`.

Logo, then the line `100% Native. 100% Free. Built for Salesforce.`, then the
CTA, then `© 2026 MVRK Inc. All rights reserved.`

Centred in the wireframe. Keep it quiet, let the page land.

---

## 5. Brand

### Palette

Three values come from the MVRK Forms brand sheet. The rest are inherited from
the MVRK parent palette, already locked on the Zapier project, so the two
properties sit in the same world.

| Token | Hex | Source | Use |
|---|---|---|---|
| `--plum` | `#814D71` | Forms sheet | Band backgrounds 3 and 5, headline weight, logo monotone |
| `--rose` | `#E0778F` | Forms sheet | CTA fill, icon accents on plum, gradient start |
| `--grey` | `#5E5E5E` | Forms sheet | Neutral text where ink is too blue |
| `--paper` | `#F5FBFB` | MVRK parent | Base surface on light bands. Cool near-white, not cream |
| `--tint` | `#CCEEF3` | MVRK parent | Hero background, soft fills |
| `--turquoise` | `#61D0DE` | MVRK parent | Available, use sparingly |
| `--teal` | `#3EACB7` | MVRK parent | Available, use sparingly |
| `--slate` | `#617F95` | MVRK parent | Secondary text on light |
| `--ink` | `#4B5B71` | MVRK parent | Footer background, primary text on light. Darkest value in the system |
| `--white` | `#FFFFFF` | MVRK parent | Cards, logo lockup grounds |
| `--sf-cyan` | `#01A0E1` | Salesforce | Reserved. Marks Salesforce only |

**There is no black.** `--ink` is the floor.

The headline gradient runs `--rose` to `--plum`, matching the logo's own
gradient. That is the one place a gradient is not decoration.

### Typography

Carried from `mvrk-orbit` so MVRK Forms and mvrk.ca/zapier are visibly the same
family of work.

| Role | Face | Source | Weights |
|---|---|---|---|
| Display | **PP Rader** | self-hosted `.ttf`, copy `public/fonts/rader/` from mvrk-orbit | Regular, Medium, Bold, plus italics |
| Body | **Neue Montreal** | self-hosted `.ttf`, `public/fonts/NeueMontreal-Regular.ttf` | Regular |
| Labels | **JetBrains Mono** | `next/font/google`, `--font-jb` | 400, 500 |

Copy the `@font-face` block out of `mvrk-orbit`'s `globals.css` rather than
rewriting it.

The wireframe's headings are set in a rounded geometric placeholder because it
was mocked in PowerPoint. **That placeholder is not binding.** PP Rader is the
face.

Body size floor 17px, matching mvrk-orbit. Fluid display sizes via `clamp`.
Suggested hero `clamp(44px, 9vw, 128px)`, section headings
`clamp(40px, 5.5vw, 72px)`. Adjust to taste, but set a scale and stay on it.

> **Licensing: closed, 10/09/26.** PP Rader and Neue Montreal are licensed and
> already cleared with Vuk. Use them as-is. Do not raise it, do not propose
> free substitutes.

Convert the `.ttf` files to **woff2** before shipping. A `.ttf` is typically
two to four times the bytes of the same face as woff2, on a page whose entire
pitch is that it feels fast. Wire them through `next/font/local` rather than a
hand-written `@font-face` block, so you get automatic preload and a
`size-adjust` fallback — which is half of the "no layout shift" line in the
Definition of Done.

---

## 6. Motion

Constants live in `src/lib/motion.ts`, carried verbatim from mvrk-orbit:

```
EASE        power4.out
EASE_CSS    cubic-bezier(0.22, 1, 0.36, 1)
DUR_ENTER   0.7
DUR_MICRO   0.25
STAGGER     0.07
TRAVEL      22px
SCROLL_START "top 82%"
```

Rules:

1. **The word cycler is the only thing that moves forever.** Everything else
   enters once and settles.
2. **Reveals fire once.** `ScrollTrigger` with `once: true`. Re-animating on
   scroll-back is the clearest tell of a tutorial build.
3. `TRAVEL` is 22px on purpose. Long fade-ups on every element are the most
   common way a page reads as amateur.
4. Smooth scroll via `lib/smoothScroll.ts`, one Lenis instance driven off the
   GSAP ticker. Nothing else imports Lenis.
5. Under `prefers-reduced-motion`, Lenis is never created and the cycler shows
   the static word.
6. No WebGL. This page does not need it.

---

## 7. Assets

Pending from Vuk. His note: *"The logo and shit will be provided soon!"*

| Asset | Status | Path convention |
|---|---|---|
| Primary lockup (FORMS + icon + "by MVRK") | pending | `public/brand/forms-primary.svg` |
| Icon only | pending | `public/brand/forms-icon.svg` |
| Wordmark | pending | `public/brand/forms-wordmark.svg` |
| Monotone lockup | pending | `public/brand/forms-mono.svg` |
| Submarks, solid and outline | pending | `public/brand/forms-submark-*.svg` |
| Favicon and OG image | derive from the icon | `public/` , referenced through basePath |
| Hero transition reference video | Qasim has it | not shipped |
| **Product demo video** (one, not four) | pending from Vuk | `public/media/forms-demo.mp4` + `.webm` + poster |

Until they land, render the wordmark as live type in PP Rader with the rose to
plum gradient. Do not trace the logo from the PDF. Build the layout so the
lockup swaps in without reflow.

---

## 8. Setup

```bash
npx create-next-app@latest mvrk-forms \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-npm

cd mvrk-forms
npm i gsap @gsap/react lenis
```

Then drop in from `starter/`:

```
starter/src/config.ts             every word on the page, typed
starter/src/app/globals.css       tokens, type scale, reduced motion
starter/src/lib/motion.ts         motion vocabulary
starter/src/lib/smoothScroll.ts   Lenis + GSAP ticker
```

Then copy the font files out of mvrk-orbit, convert to woff2, and wire them
through `next/font/local`.

**`next.config.ts` is not optional.** The site is a static export served from
`https://www.mvrk.ca/forms`, the same way `mvrk.ca/zapier` was shipped in
August. Get this right on day one, not on deploy day:

```ts
const config = {
  output: "export",
  basePath: "/forms",
  assetPrefix: "/forms",
  trailingSlash: true,
  images: { unoptimized: true },
};
export default config;
```

Never reference an asset as a bare absolute path (`/brand/icon.svg`). It will
404 under the basePath. Import it, or route it through a basePath-aware helper.
The `brand.*` paths currently in `config.ts` need this treatment.

Target structure:

```
mvrk-forms/
├─ CLAUDE.md
├─ BRIEF.md
├─ public/brand/            logo files when they arrive
├─ public/fonts/            PP Rader, Neue Montreal
└─ src/
   ├─ app/
   │  ├─ layout.tsx         fonts, metadata, SmoothScroll
   │  ├─ page.tsx           composes the six bands
   │  └─ globals.css
   ├─ components/
   │  ├─ Nav.tsx
   │  ├─ Cta.tsx            the one button, scrolls to the waitlist
   │  ├─ WordCycler.tsx
   │  ├─ icons/             twelve inline SVGs, one style
   │  └─ sections/
   │     ├─ Hero.tsx  Demo.tsx  FeatureBand.tsx  Waitlist.tsx  Footer.tsx
   └─ lib/
      ├─ motion.ts
      └─ smoothScroll.ts
```

`FeatureBand.tsx` is one component driven by config, rendered four times. Do
not write four near-identical section files.

---

## 9. Build order

Revised 10/09/26. Target is live before **14 Sept**, which is four days, not
six. The order below is not the original one: the waitlist form moved ahead of
the icons.

| Phase | What | Days |
|---|---|---|
| 1 | Foundation: repo, `next.config` with basePath, fonts, tokens, layout shell, Lenis + GSAP, Nav, Cta, empty bands | 1 |
| 2 | Hero and the word cycler. Get this right, it is the page | 1 |
| 3 | Waitlist band + Apps Script wiring, end to end, tested with a real submission | 0.5 |
| 4 | `FeatureBand` and the four bands from config, without icons | 0.5 |
| 5 | The twelve icons. Timeboxed, see the bail-out in `CLAUDE.md` rule 5 | 1 |
| 6 | Demo band, footer, reveals, hover states | 0.5 |
| 7 | Responsive down to 320, reduced motion, Lighthouse, metadata and OG, deploy | 1 |

**Why the form moved up.** It is the only thing on the page that can fail in
production, and it depends on a Google deployment you do not control. Find that
out on day two, not on the 14th.

**Why the icons moved down.** Twelve hand-drawn icons are the most compressible
item on the list. Bands built with placeholder glyphs still demo fine; a broken
form does not. `CLAUDE.md` rule 5 defines exactly when to abandon the custom set
and swap to Phosphor duotone. Honour that gate.

The intro curtain (`PRELOADER.md`) is **not** in this list. It is blocked on
Vuk's logo SVGs and it unblocks nothing. Build it after launch.

### Kickoff prompts for Claude Code

One phase per session. Do not batch. Every session starts with: *read
CLAUDE.md, BRIEF.md, and REVIEW.md sections A and C. Where they disagree,
REVIEW.md wins.*

**Phase 1**
> Foundation only. `next.config.ts` with `output: "export"`, `basePath: "/forms"`,
> `assetPrefix: "/forms"`, `trailingSlash: true`, `images: { unoptimized: true }`.
> `layout.tsx` with PP Rader, Neue Montreal and JetBrains Mono via
> `next/font/local` (font files from mvrk-orbit, converted to woff2). Inline head
> script setting `class="js"` on `<html>`, and scope `[data-fx]` to `html.js`.
> Add `--rose-ink: #C4566E`, fix the two contrast failures in REVIEW.md C2, and
> move `--band-icon: var(--tint)` onto `[data-tone="plum"]`. SmoothScroll mounted
> with both ScrollTrigger refresh fixes from REVIEW.md C4. Nav and the shared Cta
> button, which calls `scrollToY()` at the waitlist. `page.tsx` with eight empty
> placeholder bands in order, correct `data-tone` and background on each.
> Then run `npm run build` and verify the output references `/forms/_next/`,
> not `/_next/`. Report before I review.

**Phase 2**
> Hero and WordCycler per band 1. 46 words from config in exact order, "Free"
> recurring as the anchor. Line 2 static in the rose-to-plum gradient using
> `--rose-ink` for the light end, and it must not shift when the word above
> changes width. Use `DUR_MICRO` / `DUR_ENTER` from lib/motion.ts. Under
> `prefers-reduced-motion` render `hero.staticWord` and never cycle.
> Test "Frictionless" (the longest word) at 320px before anything else, and
> check "FTW" specifically since it is the only all-caps entry.

**Phase 3**
> Waitlist band per band 5.5 and the full spec in REVIEW.md A2. First name,
> last name, email, required consent checkbox, submit disabled until checked.
> Post to `process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT` as a simple request —
> `URLSearchParams` or `text/plain`, never `application/json`, never
> `mode: "no-cors"`. Honeypot plus minimum time-to-submit. All three states:
> submitting, success (replace the form), failure (message plus vuk@mvrk.ca).
> I will deploy the Apps Script; give me the `doPost` handler to paste.

**Phase 4**
> `FeatureBand.tsx` as one config-driven component, rendered four times.
> Alternating paper and full-bleed solid plum per the table in BRIEF.md §4.
> Flat plum, no gradient. Pick one layout for the three-up items and use it
> across all four. Placeholder squares where the icons go.

**Phase 5**
> Draw the twelve icons as inline SVG in `src/components/icons/`. One 24px
> grid, one stroke width, one corner radius, one join style. Stroke-based,
> `currentColor`, no fills. Then render all twelve together on a scratch page
> **at 24px in a single row** and show me, before any of them go into a band.
> Apply the bail-out criteria in CLAUDE.md rule 5 honestly.

**Phase 6**
> Demo band per band 1.5 (no heading, poster placeholder, `demo.src === null`),
> footer per band 6, then scroll reveals across the page using the motion
> tokens with `once: true`, and hover states on the CTA. Keep it quiet.

**Phase 7**
> Polish pass. Check every band against the Definition of Done in CLAUDE.md at
> 320, 768, 1280, 1920. Verify reduced motion and the JS-disabled case. Run
> Lighthouse and report the numbers before fixing anything. Add metadata with
> `metadataBase` accounting for the basePath, an OG image and a favicon from
> the "f" mark.

---

## 10. Open with Vuk

Only three things are still open. Everything else in the original §10 was
answered between 02/07/26 and 10/09/26; see `REVIEW.md` sections A and D.

1. **Logo files.** The only genuine blocker. All five SVG variants from the
   brand sheet. Needed for the nav lockup, the footer, the favicon and OG
   image, and for the intro curtain later.
2. **The waitlist note line.** It still ends "Like releasing updated version of
   the book", which is residue from the free-book page. Proposed fix is to cut
   that sentence. Needs a yes.
3. **One name field or two.** He said "name and email" on 04/09; the form he
   sent as a reference has First Name and Last Name. Building two.

Told, not asked: the Coming Soon buttons now scroll to the waitlist, the demo
video gets its own band, and the word dwell is 1.2s.

Decided without him, correctly: the grey `#5E5E5E` and `--sf-cyan` questions.
He gave latitude on everything outside the locked list. Two unused tokens is a
decision you make, not a question you send.
