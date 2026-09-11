# MVRK Forms: the 5-hour plan

I built the current source, served it, and drove it at 1440 and 390. This plan
is written against what is actually on screen right now, not against the docs.

**Read this instead of PROMPTS.md.** The phases in PROMPTS.md are roughly six
days of work and they are the reason the page looks the way it does. This is
the cut-down version that fits the window.

---

## First, the honest bit

The previous plan overshot. Four different band rhythms, an org boundary pin,
a self-building hero, eleven effects, SVG band curves. That was me being clever,
and the result on screen is a page with **50% empty plum bands, a broken
connector line, and a missing product name in the hero.** More ideas made it
worse, not better.

Modern in 2026 does not mean more effects. Linear, Vercel and Framer run about
three motions each. What makes them read as expensive is **confident type,
tight spacing, one accent, and nothing loose.** Right now this page has loose
compositions and the wrong typeface, and no amount of scroll effects fixes that.

So the plan is mostly **subtraction**.

---

## What is genuinely working, keep it

- The reveal defect is **fixed**. Zero stranded elements after a full wheel
  scroll. That was the worst bug and it is gone.
- Cream ground is in and it is the right call. The page is warmer.
- The four eyebrows are in and they read well.
- The hero form card is a good idea and mostly built.
- The demo strip is correctly reduced, no longer a full-height void.
- Band 01 (`Creative Design`) is **the one composition that works.** Eyebrow,
  big heading, three cards beneath, full width used. Remember this.

---

## What is on screen and wrong

| # | Problem | Severity |
|---|---|---|
| 1 | **The fonts are still not applied.** Third variation of the same bug | critical |
| 2 | **"Forms For Salesforce" is missing from the hero.** Only the cycling word renders | critical |
| 3 | Band 02 is **half empty**: heading top-right, items bottom-left, a void in between | high |
| 4 | The band 02 connector renders as **disconnected dots and stray hairlines** | high |
| 5 | Hero has ~300px of dead space between headline and subhead | high |
| 6 | The Submit button in the hero card **overflows its container** | medium |
| 7 | Radii, shadows and pastel cream together read as **friendly template**, not studio | medium |
| 8 | The org boundary frame is a barely-visible rounded rectangle that reads as an accident | medium |

### Detail on #1, because it keeps coming back

`globals.css` now has a hand-written `@font-face` block, copied from
`mvrk-orbit`, pointing at:

```
/fonts/rader/PPRader-Bold.ttf
/fonts/FoundersGrotesk-Semibold.ttf
/fonts/NeueMontreal-Regular.ttf
```

All three problems at once:

1. **Bare absolute paths.** Under `basePath: "/forms"` they resolve to
   `mvrk.ca/fonts/...` and 404. CLAUDE.md rule 11 forbids exactly this.
2. **Those files do not exist in this project.** The real fonts are woff2 in
   `src/fonts/`, loaded by next/font.
3. **It fights next/font**, which is already declaring `rader` correctly.

Measured on the live build: `h1` computes to
`grotesk, ui-sans-serif, system-ui, sans-serif`, and the network log shows
404s for both `.ttf` files. The h1 renders in the system sans.

---

## The 5 hours

Timeboxed. If an hour runs over, cut the last item in it and move on.

### Hour 1 · The two critical fixes, and nothing else

**0:00 to 0:20 — Fonts, finally**

```
Delete the entire hand-written @font-face block from globals.css. All of it.
It points at /fonts/... which 404s under basePath and those files do not exist
in this project.

next/font already declares rader and montreal correctly from src/fonts/*.woff2.
Use only that. --font-display and --font-body must resolve to the next/font
variables, declared in a real :root block, never in @theme inline.

Then VERIFY and report both:
  1. computed font-family on an h1 — it must contain "rader"
  2. the network tab shows a PPRader woff2 loading with status 200
  3. zero 404s in the console

Do not tell me it looks right. Report the two values.
```

**0:20 to 0:45 — The hero headline**

"Forms For Salesforce" is not rendering. Only the cycling word shows. The
product name is missing from its own hero.

```
Fix the hero headline. Line 1 is the cycling word, line 2 is the static
"Forms For Salesforce" in the rose-to-plum gradient. Right now line 2 does not
render at all.

Then close the hero's dead space: headline, subhead and CTA should sit as one
tight block. There are currently ~300px of empty gradient between the headline
and the subhead. Target hero height: about 88vh on desktop, 100dvh on mobile.
```

**0:45 to 1:00 — The card overflow**

The Submit button inside the hero form card breaks out of its container.
Fifteen minutes, box-sizing or a padding mismatch.

> **Stop at the end of hour 1 and look at the page.** Correct type plus a
> complete hero is most of the perceived quality gain in the whole plan.

---

### Hour 2 · Kill the four rhythms

This is the biggest single improvement and it is a deletion.

The four different band compositions produced band 02 with an empty right half
and band 04 with a different problem. **Band 01's layout is the one that works.
Apply it to all four.**

```
Remove the per-band `rhythm` branching from FeatureBand.tsx. All four bands use
one composition, the one band 01 currently uses:

  eyebrow (01 BUILD)
  heading, large, left-aligned, full width
  three items in a row beneath, equal columns, tight

Differences between bands are now ONLY:
  - background: cream or plum
  - on cream, items sit in cards on --paper
  - on plum, items have no card, just icon / title / subtitle with a hairline
    above each

Delete the connector line in band 02 entirely. It renders as disconnected dots
and stray hairlines, and the layout it required is what created the empty half.

Delete the band 03 column pin. Same layout as the others now.
```

That removes three problems and about 200 lines of code.

---

### Hour 3 · Make it look modern rather than friendly

Right now it is cream, big radii, soft shadows, pastel. That combination is the
generic friendly-SaaS template. These are the specific dials.

```
Surface language pass. Exact values:

- Radii: cards 26px -> 12px. Inputs 12px -> 8px. Only the CTA stays a pill.
  Large soft radii plus pastel is the single strongest "template" signal.
- Shadows: halve every one of them. --shadow-md and --shadow-lg drop to about
  60% opacity and 70% blur. Everything currently floats.
- Section padding: reduce by ~25%. The page is 5900px tall and mostly air.
- Body copy max-width: 34ch, not 44ch. Short measures read as designed.
- Heading line-height: 0.95, letter-spacing -0.03em. Tighter than now.
- Icons: 40px, no soft chip behind them. Either bare, or a 1px hairline square
  at 8px radius. The soft blob is the friendly signal again.
- The org boundary: either make it a real 1px --plum line the full width with
  the mono label sitting on it, or delete it. Right now it is a faint rounded
  rectangle that reads as an accident. If in doubt, delete it: it is not
  load-bearing.
```

**One aesthetic rule for the whole pass:** if a change makes the page *softer*,
it is wrong. Every dial here goes toward crisper.

---

### Hour 4 · Five effects, delete the rest

Modern does not mean many. Ship these five, cut everything else.

| Keep | Where | Notes |
|---|---|---|
| 1. Word cycler | hero line 1 | already built, needs line 2 back |
| 2. Heading mask reveal | 4 band headings | `MaskText.tsx` exists, use it |
| 3. Item stagger | all 12 items | fade + 22px rise, `STAGGER` 0.07, `once: true` |
| 4. CTA fill on hover | every CTA | fill rises from below, `DUR_MICRO` |
| 5. Nav shrink | on scroll past hero | height and padding only |

```
Delete from ScrollFxProvider.tsx:
  the connector draw, the number roll, the magnetic CTA, the hero card
  parallax, the band edge curves, and the icon draw-on if it is not already
  clean.

ScrollFxProvider is 14KB. It should be under 5KB when this is done.

Keep: three durations, two eases, once:true everywhere, the reduced-motion
guard, and the load-timeout failsafe. Those all work.
```

Icon draw-on is the one optional extra. If hour 4 has 20 minutes left, add it.
If not, skip it. It is not what is missing.

---

### Hour 5 · Mobile and ship

80% of traffic. Do this properly or the other four hours do not matter.

```
Mobile pass at 390 and 320.

- No pins anywhere below 1024px. Verify none are left after hour 2.
- 100dvh on the hero, never 100vh.
- Hero form card crops off the right edge rather than shrinking. A shrunk card
  looks like a thumbnail.
- Hero type floor: clamp(40px, 11vw, 132px).
- All tap targets at least 44px. Form fields 46px.
- The three-up item rows stack to one column below 860px.

Then report, as measured values:
  - computed font-family on an h1 and a body paragraph
  - count of [data-fx] still hidden after a full wheel scroll (must be 0)
  - console errors and 404s (must be 0)
  - page height at 1440 (target: under 5000px, currently 5938)
  - screenshots at 320, 390, 1440
  - the page under prefers-reduced-motion
```

If time runs out, the sticky mobile CTA bar is the thing to drop. It is a nice
win but it is not why the page looks wrong.

---

## What is explicitly cancelled

So there is no ambiguity when reading the older docs:

- The four band rhythms. **Cancelled.** One layout.
- The band 02 connector. **Cancelled.**
- The band 03 column pin. **Cancelled.**
- The plum band SVG curves. **Cancelled.**
- The number roll, magnetic CTA, hero parallax. **Cancelled.**
- The self-building hero sequence. **Deferred.** The card can stay static. It
  is a good idea and it is not what is broken.
- The org boundary. **Your call**, per hour 3. Delete it unless you make it
  properly visible.

`DESIGN-DIRECTION.md` sections 4 and 5 (palette, type) still stand.
`MOTION.md` sections 1, 2, 3, 4 and 7 still stand. Ignore its section 5 list
beyond the five effects above.

---

## The one sentence to hold onto

**The page does not need more effects. It needs the right typeface, a complete
hero, one band layout, and crisper surfaces.** Everything in this plan is
either a fix or a deletion, except five effects, and four of those are already
built.
