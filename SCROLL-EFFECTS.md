# Scroll effects for MVRK Forms: sources and prompts

---

## First, squaring this with BUILD-5H.md

Two turns ago I told you to delete effects. Now you are asking for more. Both
are right, and the distinction is real:

**Decorative effects** are the ones I cut: a connector line that draws, a number
that rolls, a magnetic button, an SVG band curve. They do not change how the
page reads, they were rendering broken, and the layouts they required created
the empty halves in band 02. Adding more of those makes a page busier, not
better.

**Structural effects** are what you are actually describing: sticky sections,
parallax, sections changing as you scroll. These change how the whole page
*behaves*, not how one element decorates itself. They are what makes a site feel
built rather than assembled, and this page has none of them.

So: BUILD-5H hours 1 to 3 still stand exactly as written. Fonts, hero, one band
layout, crisper surfaces. **This document replaces hour 4.** Do the foundation
first. A sticky stacking sequence in the wrong typeface still looks wrong.

---

## Where scroll effects come from

### 1. Your own collection, already on disk

`D:\Dev\MVRKxZapier reference 1\awwwards-collection`

It has an index at `AI-REFERENCE.md` with a **Scroll Experiences** table. The
relevant folders:

| Technique | Folder |
|---|---|
| Pinned scroll storytelling | `05-hidden-gems/basement-scrollytelling` |
| Parallax columns, Lenis + GSAP | `06-saas-modern/olivier-cards-parallax` |
| Pure Lenis reference wiring | `06-saas-modern/olivier-parallax-lenis` |
| Grid expand on scroll | `06-saas-modern/codrops-scroll-layout`, `codrops-columns-rows` |
| Scroll velocity into skew | `01-awwwards-clones/rejouice-agency` |
| SVG mask reveal on scroll | `05-hidden-gems/axel-svg-mask-scroll` |
| Kinetic type on scroll | `05-hidden-gems/codrops-scroll-text`, `codrops-kinetic-type` |
| Horizontal scroll section | `01-awwwards-clones/awwwards-horizontal-scroll` |
| Cinematic scroll | `05-hidden-gems/codrops-cinematic-scroll` |
| The register to copy | `06-saas-modern/vercel-homepage-clone`, `framer-website-clone` |

This is the best source you have, because Claude Code can read the actual
implementation instead of inventing one.

### 2. The four bookmarks worth having

- **[GSAP ScrollTrigger Showcase on CodePen](https://codepen.io/collection/DkvGzg)** — GSAP's own curated collection. Every pen is forkable and correct. Start here.
- **[GSAP Scroll collection](https://codepen.io/collection/bNPYOw)** — the wider set, same quality bar.
- **[Codrops](https://tympanus.net/codrops/)** — the `scroll` and `webgl` tags. Fifteen years of demos with source. Most effects on award sites started here.
- **[Olivier Larose](https://blog.olivierlarose.com/tutorials)** — Next.js + GSAP + Lenis specifically, one repo per tutorial. Closest to your stack of anything on this list.

### 3. The two specific pens for what you described

- **[GSAP Stacking Cards](https://codepen.io/GreenSock/pen/MWmVwpX)** — the official one. This is the "sections changing" effect.
- **[Sticky sections with GSAP](https://webflow.com/made-in-webflow/website/sticky-sections-gsap)** — same pattern, different framing.

### 4. Still live from earlier in this chat

The Awwwards Rebuild Kit artifact, with the 17-row effect map: "you saw this on
an award site, here is what it is really built with."

---

## The six that fit this page

Ranked by impact per hour of work. **Build 1 and 2 and stop.** They are 80% of
the difference and they are both low-risk, well-documented patterns.

| # | Effect | Impact | Risk | Time |
|---|---|---|---|---|
| 1 | Scroll-driven background morph | very high | low | 40 min |
| 2 | Sticky stacking bands | very high | low | 60 min |
| 3 | Hero handoff | high | medium | 30 min |
| 4 | Card parallax | medium | low | 20 min |
| 5 | Scroll progress line | low | very low | 10 min |
| 6 | Velocity skew | low | medium | 20 min |

---

### 1. Scroll-driven background morph

**This is the single best fix for your page.** Right now the four bands are hard
rectangles of cream and plum, which is why it reads as three flat stripes. If
the page background itself transitions between them, the bands stop being blocks
and become one continuous surface.

One fixed full-viewport div behind everything. Its background colour is a single
scrubbed tween driven by page scroll, hitting cream, plum, cream, plum, ink at
the section boundaries. The bands themselves go transparent.

```
Add a scroll-driven background morph.

- One fixed, full-viewport div at z-index 0, behind all content.
- Its backgroundColor is driven by a single ScrollTrigger with scrub: 0.5,
  keyed to the section boundaries: --cream, --plum, --cream, --plum, --ink.
- The four feature bands and the footer become background: transparent. They
  keep their own padding and text colours.
- Text colour on each band still switches via the existing data-tone blocks.
  Give the switch a 0.3s transition so it does not snap at the crossover.
- Under prefers-reduced-motion, render static per-section backgrounds exactly
  as they are now.

Read 06-saas-modern/olivier-parallax-lenis for how the Lenis and ScrollTrigger
wiring should look. Do not add a second Lenis instance.
```

---

### 2. Sticky stacking bands

This is the "sections changing" you described. Each feature band sticks to the
viewport while the next one slides up and covers it. Four separate blocks become
one continuous sequence.

```
Make the four feature bands a sticky stack.

- Each band gets position: sticky, top: 0, min-height: 100svh, and its own
  z-index ascending 1 to 4 so later bands cover earlier ones.
- As each band is covered, scale it to 0.96 and drop opacity to 0.5 on a
  ScrollTrigger with scrub: 0.6, so the one underneath visibly recedes.
- Every band needs an opaque background for this to work. If effect 1 is
  already built, give each band its own opaque fill here and drop the morph
  for the band range only.
- Radius 20px on the top corners of bands 02, 03 and 04 so the covering edge
  reads deliberately.
- Disable the whole thing below 1024px: bands stack and scroll normally on
  mobile. Sticky stacking fights the iOS address bar.
- Under prefers-reduced-motion, normal flow.

Reference: codepen.io/GreenSock/pen/MWmVwpX and
05-hidden-gems/basement-scrollytelling.
```

**Note:** effects 1 and 2 overlap. Pick one for the band range. Stacking is more
dramatic; the morph is safer and helps the hero and waitlist too. If you only
have time for one, take the morph.

---

### 3. Hero handoff

The hero pins briefly while the first band slides over it, and the hero form
card scales down and fades as it goes.

```
Add a hero handoff.

- Pin the hero for about 40% of its own height, pinSpacing: false.
- As the pin runs, the hero form card scales 1 to 0.92 and drops to opacity
  0.4, scrub: 0.8. The headline stays put.
- The demo strip slides up over the pinned hero.
- Desktop only, 1024px and up. No pin on mobile.
```

---

### 4. Card parallax

Cheap depth. The three cards in each band move at slightly different speeds.

```
Add parallax to the three cards in each feature band.

- Card 1 yPercent 0 to -8, card 2 0 to -14, card 3 0 to -5, scrub: 1,
  triggered on the band.
- Keep the travel small. Anything past about 40px of movement detaches the
  cards from the layout and looks broken.
- Desktop only.

Read 06-saas-modern/olivier-cards-parallax.
```

---

### 5. Scroll progress line

Two-pixel plum line across the top, fills as you scroll. Ten minutes, and it
quietly signals "this page was made by someone who cares".

```
Add a scroll progress indicator: a 2px bar fixed at the top of the viewport,
--plum, scaleX 0 to 1 with transformOrigin left, driven by document scroll
progress with scrub: true. Above the nav in z-index. Hidden under
prefers-reduced-motion.
```

---

### 6. Velocity skew

Content skews by a degree or two based on scroll speed, settling when you stop.
Very current, and easy to overdo.

```
Add scroll-velocity skew.

- Read Lenis velocity, map it to skewY, clamp at 1.5 degrees maximum.
- Apply to the feature band wrapper only, never to the nav, the hero or the
  waitlist form.
- gsap.quickTo with duration 0.4, ease power3.out, so it settles rather than
  snapping back.
- Desktop only. Off under reduced motion.

Read 01-awwwards-clones/rejouice-agency.
```

If it is noticeable as an effect, the clamp is too high. Drop to 1 degree.

---

## Order for the session

```
Hour 1    BUILD-5H hour 1   fonts, hero headline, card overflow
Hour 2    BUILD-5H hour 2   kill the four rhythms, one band layout
Hour 3    BUILD-5H hour 3   crisper surfaces
Hour 4    effect 1, then effect 2      ← this document
Hour 5    effects 3 to 5 if time, then mobile and ship
```

**Do not start hour 4 until hour 1 reports a computed font-family containing
`rader`.** A sticky stacking sequence in Helvetica still looks like Helvetica.

---

## The rule that keeps this from going wrong again

Every effect here changes **how sections relate to each other**. None of them
decorates a single element.

Before adding anything not on this list, ask: does it change how the page
behaves, or does it just make one thing move? If it is the second, skip it. That
question is the difference between the version of this page that stands out and
the version that has a connector line rendering as disconnected dots.
