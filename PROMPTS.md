# Claude Code prompts for MVRK Forms v2

Paste these one at a time, in order. **One phase per session.** Do not batch
them, and do not move on until the check at the end of each passes.

Before you start: rename `CLAUDE.v2.md` to `CLAUDE.md`, replacing the old one.

---

## Session opener

Paste this first, once, at the start of every new session.

```
Read CLAUDE.md, DIAGNOSIS.md, DESIGN-DIRECTION.md, MOTION.md and
HOMEPAGE-V3.md before doing anything. They supersede the old BRIEF.md
entirely; ignore it.

Vuk has approved the cream ground and the four numbered eyebrows. Mobile is
the primary target: 80% of traffic. Build every section at 390 first, then
widen.

Summarise back to me in under 12 lines: the story spine, what the org boundary
is, what the new hero does, what changed in the palette, and the three defects.
Do not write any code until I reply.
```

That check costs one turn and catches the failure mode from last time, which
was inheriting the wrong docs.

---

## Phase 0 · The three defects

```
Phase 0 only. Fix the three defects in DIAGNOSIS.md. No design work.

1. Fonts are declared and never applied. Move --font-display / --font-sans out
   of @theme inline into a real :root block, and consume the next/font
   variables directly. Then VERIFY: open the page and read the computed
   font-family on an h1. It must contain "rader". Report the exact string back
   to me. Do not tell me it looks right; read the computed value.

2. The reveal system strands nine elements at opacity 0 permanently on an
   ordinary wheel scroll, including the whole hero and the waitlist form.
   - Take hero content off ScrollTrigger entirely and put it on a plain load
     timeline per MOTION.md section 3.
   - Switch every reveal from gsap.from to gsap.fromTo with
     immediateRender: false.
   - Add a failsafe: one second after load, force any element still at
     opacity 0 to visible.
   - Move ScrollTrigger.refresh() to after document.fonts.ready and after
     Lenis is running.

3. Fix the 404 on /forms/icon.png by routing it through the basePath-aware
   helper.

Then verify: load the page, scroll top to bottom with the wheel, and report how
many [data-fx] elements are still below opacity 0.99. It must be zero.
```

**Do not proceed until it reports zero and reports a font-family containing
`rader`.**

---

## Phase 1 · Palette and type

```
Phase 1. Palette v2 and the type scale, per DESIGN-DIRECTION.md sections 4 and 5.

- Add --cream #F6F0E6 as the light band ground. --paper becomes #FBF8F3 for
  cards and raised surfaces only. --tint stays #CCEEF3 but is now hero-only.
- Add --plum-deep #5E3852.
- Apply the type scale in section 5. Fix two specific things: the subhead
  "100% Salesforce Native Forms. Free Forever!" must sit on ONE line at
  desktop, and the hero gradient must be visibly a gradient across the actual
  text width (steepen the angle to about 140deg or narrow the span, then look
  at it rendered).
- Add the grain overlay: tiled SVG feTurbulence, ~3% opacity, multiply,
  pointer-events none, on cream grounds only.

Do not change any of the six brand hexes. Do not touch layout yet.
```

---

## Phase 2 · Hero, mobile first

```
Phase 2. The hero, per HOMEPAGE-V3.md section 2 and MOTION.md sections 3 and 4.

BUILD AT 390 FIRST. Get mobile right, then widen to desktop.

- Build the self-building form card, option A. Four beats, the exact timings in
  HOMEPAGE-V3.md section 2: card lands, fields drop with 0.18 stagger, a cursor
  drags one field up a slot, submit arms and it holds. DOM transforms only, no
  canvas, no video. It plays ONCE.
- On mobile the card crops off the right edge rather than shrinking. Use 100dvh,
  never 100vh.
- Build the load timeline exactly as MOTION.md section 3 specifies.
- Rebuild the word cycler per MOTION.md section 4. Measure each word's width
  once on mount, cache it, tween the slot width between cached values. Line 2
  must not shift by even 2px on a swap. Show me you have handled this.
- Hero type floors at 40px: clamp(40px, 11vw, 132px).
- Reduce the demo band to a 16:9 strip with a designed coming-soon state.

Check at 320, 390 and 1440, and with prefers-reduced-motion: reduce, before you
finish. If the build sequence stutters on real mobile hardware, tell me and we
ship a static assembled card instead. Do not spend a day on it.
```

## Phase 3 · Org boundary and eyebrows

```
Phase 3. The page's one big idea, per DESIGN-DIRECTION.md section 3 and
MOTION.md section 5.

- Wrap bands 01 to 04 in a sequence wrapper.
- Add the org boundary: a hairline frame with a mono label reading
  YOUR SALESFORCE ORG, pinned across the whole sequence with the exact
  ScrollTrigger config in MOTION.md section 5. Pin the FRAME, not the content.
  pinSpacing: false.
- Add the four numbered eyebrows: 01 BUILD, 02 THINK, 03 SHARE, 04 COLLECT.
  Add a `rhythm` and `eyebrow` field to each band in config.ts.
- Below 768px and under reduced motion, render the frame as a static unpinned
  border.
```

---

## Phase 4 · The four rhythms

```
Phase 4. The four band compositions, per DESIGN-DIRECTION.md section 6.

FeatureBand.tsx stays ONE component. Branch the composition on the `rhythm`
field. Do not write four section files.

01 BUILD, cream: three elevated cards on --paper, icons 40px top-left.
02 THINK, plum: heading right-aligned, items in a vertical stagger, each
   indented further, joined by a connector line.
03 SHARE, cream: left column pinned, three items scroll past in the right.
04 COLLECT, plum: full-width stacked rows divided by hairlines, icon / title /
   subtitle laid out horizontally.

What stays identical across all four: eyebrow style, heading face and scale,
icon stroke and size, band padding, entrance timing, icon-title-subtitle order.
Only the arrangement varies. Plum bands get the --plum-deep vignette.

Also add the plum band SVG curve from HOMEPAGE-V3.md section 3: bands 02 and 04
arrive on a shallow curve that flattens as the band enters. One path, one d
attribute, scrub 0.8, desktop only, straight edge on mobile. Read
05-hidden-gems/axel-svg-mask-scroll for the technique.

Every band at 390 first, then widen. No pins below 1024px.
```

---

## Phase 4.5 · Sticky mobile CTA

```
Phase 4.5. The sticky bottom CTA bar on mobile, per HOMEPAGE-V3.md section 1.

- Slides in once the hero has scrolled out, hides again when the waitlist
  enters the viewport.
- Pill shape, --ink at 95% opacity, one line of text plus a rose Join button.
- Tap target at least 44px. Respects safe-area-inset-bottom.
- Below 1024px only. Never on desktop.
- Under reduced motion it appears without sliding.
```

---

## Phase 5 · Motion

```
Phase 5. Everything in MOTION.md section 5 that is not already built, plus
section 6 pacing.

- Icon draw-on for all twelve, stroke-dashoffset, with the exact values in
  MOTION.md. Measure getTotalLength() on mount. Multi-path icons draw together,
  not sequentially.
- Band heading mask reveals, line by line, not character by character.
- Number roll on the four eyebrows.
- Band 02 connector, scrub: 0.6, not true.
- Band 03 column pin.
- Magnetic CTA with the exact values in MOTION.md. Pointer only.
- Hero card parallax, yPercent 0 to -6, scrub 1. Desktop only.
- Band 01 card parallax, each card offset differently. Read
  06-saas-modern/olivier-cards-parallax.
- Nav shrink linked to scroll velocity. Read 01-awwwards-clones/rejouice-agency.

Every effect in HOMEPAGE-V3.md section 3 names a folder in the collection. Read
the real implementation before writing your own.

Then go through MOTION.md section 9 item by item and tell me the result of each
check. Not "looks good": the actual result.
```

---

## Phase 6 · Ship

```
Phase 6. Polish pass against the Definition of Done in CLAUDE.md.

Report, as measured values not opinions:
- Computed font-family on an h1 and on a body paragraph.
- Count of [data-fx] elements still hidden after a full wheel scroll.
- Screenshots at 320, 390, 768, 1280, 1920.
- A pass on a real mid-range Android, not desktop throttling. Report what
  stutters.
- Font payload after subsetting, in KB.
- The page with JavaScript disabled.
- The page under prefers-reduced-motion: reduce.
- Contrast ratios for every text-on-background pair the page actually uses,
  computed, against the real background.
- Lighthouse mobile numbers, before you fix anything.
- Console: zero errors, zero 404s.

Then fix what fails, and report again.
```

---

## Two things blocked on Vuk

Neither blocks phases 0 to 2. Both block phase 3.

1. **Cream instead of white.** The MVRK parent palette says the base is a cool
   near-white. This moves the light bands to a warm cream. Brand hexes
   untouched. He should see it rather than find it.
2. **The four eyebrows.** `01 BUILD`, `02 THINK`, `03 SHARE`, `04 COLLECT` is
   the only new text on the page. One line of sign-off.

Ask both in one message, with the design canvas link attached, and give him the
option to say "fine" to both.
