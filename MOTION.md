# MVRK Forms: motion spec

`DESIGN-DIRECTION.md` section 8 lists **what** moves. This file is **how it
feels**, with the numbers. Every value here is buildable as written. If a value
is not here, take it from `lib/motion.ts`. If it is in neither, ask.

Constants, unchanged, carried from `mvrk-orbit`:

```
EASE          "power4.out"
EASE_CSS      cubic-bezier(0.22, 1, 0.36, 1)
DUR_ENTER     0.7
DUR_MICRO     0.25
STAGGER       0.07
TRAVEL        22   (px)
SCROLL_START  "top 82%"
```

---

## 1. The feel, in one paragraph

**Weighted, not floaty. Quick, not snappy.** A Salesforce admin should feel the
page is well built, not that it is showing off. Every entrance is short and
lands hard on the out-curve, so motion reads as confident rather than gentle.
Nothing bounces except one CTA. Nothing loops except the word cycler. The page
should feel like it settles, and then stays settled, so the only thing asking
for attention is the copy.

The register to aim for is Linear or Vercel, not an awwwards showreel.

---

## 2. Scroll feel

### Lenis config

```ts
new Lenis({
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1.6,
})
```

Driven off the GSAP ticker, one heartbeat, exactly as `smoothScroll.ts` already
does it. Nothing else imports Lenis.

### How to know it is right

- One wheel click moves roughly 100 to 120px and comes to rest in **under
  400ms**.
- When you stop scrolling, the page stops. If it keeps gliding for another
  half second, `duration` is too high. That drift is the single most common way
  smooth scroll makes a site feel cheap.
- Trackpad and mouse wheel should feel like the same page. If the trackpad
  feels slippery, drop `wheelMultiplier` before touching `duration`.
- Anchor scrolls to the waitlist take **1.2s**, through `scrollToY()`, never
  `window.scrollTo`.

### Mobile

Lenis stays on, `touchMultiplier: 1.6`. If it fights native momentum on iOS at
all, turn smooth scroll off below 768px entirely. Native scroll that feels
right beats smoothed scroll that feels laggy.

---

## 3. The load sequence

No curtain, no preloader. The page paints complete, then the hero performs.
Rule 9 still governs: this is decoration on top of a page that already reads.

| t (ms) | What |
|---|---|
| 0 | First paint. Cream and tint grounds, nav, layout final. No CLS after this point |
| ~120 | `document.fonts.ready` resolves. Hero timeline starts. If fonts take longer than 600ms, start anyway |
| 120 | Hero line 1: word slot rises from under its mask, `yPercent 108 → 0`, `1.0s`, `expo.out` |
| 200 | Hero line 2: same mask rise, two lines, `STAGGER` 0.08 between them |
| 480 | Subhead: opacity 0→1, `y TRAVEL → 0`, `DUR_ENTER`, `expo.out` |
| 600 | Eyebrow and CTA: same, `STAGGER` apart |
| 700 | Hero form card: opacity 0→1, `y 28 → 0`, `scale 0.985 → 1`, `0.9s` |
| ~1400 | Word cycler begins its first swap |
| 1500 | Settled. Nothing else moves until the visitor scrolls |

Total to settled is under 1.5s. If it runs past 2s it reads as slow, and this
is a page whose whole pitch is that the product feels fast.

**The hero is not on a ScrollTrigger.** It is a plain timeline on mount. This
is defect 2 in `DIAGNOSIS.md` and it is why.

---

## 4. The word cycler

The signature. It has to be visible, and it has to not wobble the line below it.

| Property | Value |
|---|---|
| Dwell per word | 1600ms |
| Exit | `yPercent 0 → -110`, `DUR_MICRO` (0.25s), `power2.in` |
| Enter | `yPercent 110 → 0`, `DUR_ENTER` (0.7s), `expo.out` |
| Overlap | next word starts entering 0.10s **before** the previous finishes exiting |
| Width | measured px tween on the slot, 0.4s, `power2.inOut`, runs with the swap |
| Mask | `overflow: hidden` on the slot, height locked to one line |

**Line 2 must never move.** Measure each word's width offscreen once on mount,
cache it, and tween the slot's width between cached values. If line 2 shifts by
even 2px per swap the whole hero reads as broken.

Order is the 46 words in `config.ts`, in sequence, then loop. Never shuffle:
"Free" recurring every fourth word is the pitch.

Reduced motion: render `hero.staticWord` ("Fast"), no cycling, no mask.

---

## 5. Scroll-triggered motion, per section

All entrances use `once: true`. All use `fromTo` with
`immediateRender: false`. None of them owns the initial visibility of content
that is above the fold.

### The org boundary

The page's one big device.

```
trigger:  the feature sequence wrapper (bands 01 to 04)
start:    "top top+=80"
end:      "bottom bottom-=80"
pin:      the frame element only, NOT the content
pinSpacing: false
```

- The frame is a hairline at `--plum` on cream, `rgba(246,240,230,0.28)` where
  it crosses a plum band.
- The label `YOUR SALESFORCE ORG` fades in over the first **300px** of the
  sequence, opacity 0 → 1, and holds.
- The closing label fades in over the last 300px.
- On release, the frame does not animate out. It simply ends.

Reduced motion and below 768px: render the frame unpinned, as a static border
on the sequence wrapper. It still reads.

### Band heading, all four

1. Eyebrow number rolls: two digits, each in its own mask, `yPercent 100 → 0`,
   `DUR_ENTER`, `STAGGER` 0.05 between digits.
2. Eyebrow label fades at +0.1s.
3. Heading, line by line, mask rise `yPercent 108 → 0`, `DUR_ENTER`,
   `STAGGER` 0.08, at +0.15s.

Trigger `SCROLL_START` ("top 82%") on the heading block.

Split the heading by line, not by character. Character stagger on a 68px
display face looks like a tutorial.

### Icon draw-on, all twelve

```
stroke-dasharray:  path length
stroke-dashoffset: path length → 0
duration:          0.8
ease:              expo.out
delay:             0.15 after the item enters
stagger:           STAGGER between items in the band
```

Measure `getTotalLength()` per path on mount. Multi-path icons draw their paths
together, not sequentially: sequential path draws take too long and start
looking like a loading spinner.

Reduced motion: icons render complete, `stroke-dashoffset: 0`, no animation.

### 01 BUILD, cards

Three cards, `opacity 0 → 1`, `y TRAVEL → 0`, `scale 0.985 → 1`, `DUR_ENTER`,
`STAGGER` between them. Shadow does not animate.

### 02 THINK, connector

The vertical connector line is the one **scrubbed** element on the page.

```
scrollTrigger: { trigger: band, start: "top 70%", end: "bottom 60%", scrub: 0.6 }
scaleY: 0 → 1, transformOrigin: "top center"
```

`scrub: 0.6` not `true`: a smoothed scrub feels connected, a raw one feels
twitchy. The three items still enter normally, on their own `once` triggers,
staggered.

### 03 SHARE, pinned column

```
trigger:  the band
start:    "top top+=120"
end:      "bottom bottom-=120"
pin:      the left column
pinSpacing: false
```

Items in the right column enter on their own triggers as they arrive. Disable
the pin below 1024px and let both columns stack and scroll normally.

### 04 COLLECT, rows

Rows enter `opacity 0 → 1`, `y TRAVEL → 0`, `DUR_ENTER`, `STAGGER`. The
hairline above each row draws `scaleX 0 → 1` from the left, `DUR_ENTER * 1.5`,
starting with its row.

### Hero form card parallax

```
scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1 }
yPercent: 0 → -6
```

About 40px of travel across the hero. Any more and it detaches from the layout.

### Magnetic CTA

```
radius:    90px from the button centre
strength:  0.35 of pointer delta
max:       12px in any direction
tween:     gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" })
release:   back to 0, 0.5s, elastic.out(1, 0.55)
```

The only elastic ease on the page. Pointer only: skip entirely on touch and
under reduced motion.

---

## 6. Pacing across the whole scroll

Motion density is not constant. The page should breathe.

| Region | Density | Why |
|---|---|---|
| Hero | high | it has to earn the next eight seconds |
| Demo strip | almost none | it is a placeholder, do not dress it up |
| 01 BUILD | medium | cards, icons, heading |
| 02 THINK | **highest after the hero** | the connector scrub is the band's whole idea |
| 03 SHARE | medium, but *held* | the pin makes it feel slower on purpose |
| 04 COLLECT | low | rows and rules only. The page is tightening toward the close |
| Waitlist | almost none | the form is the action, nothing should compete with it |
| Footer | none | let the page land |

The shape is: loud, quiet, build, peak, hold, tighten, stop. If every band has
the same motion density the scroll feels flat even when each individual effect
is good. That is what happened in v1.

---

## 7. Performance rules

- **Animate `transform` and `opacity` only.** The word cycler's width tween is
  the single exception, and it runs on one small element.
- `will-change` is set by GSAP on the tween and cleared via
  `clearProps: "willChange,transform"`. Never set it in CSS on a static rule.
- **At most two scrubbed triggers active at once.** Currently there are two:
  the connector and the hero card, and they never overlap.
- The grain overlay is a static tiled SVG, `pointer-events: none`. It never
  animates.
- Plum band vignettes are static gradients. Do not scroll-link them.
- `ScrollTrigger.refresh()` after `document.fonts.ready` and after Lenis is
  running. Not on the next frame.
- Target: no long task over 50ms during scroll. Check in Performance, not by
  feel.

---

## 8. Reduced motion, per effect

`prefers-reduced-motion: reduce` is not a degraded page. It is a complete,
good-looking, static page. Build it first, look at it deliberately, then layer
motion on.

| Effect | Reduced-motion behaviour |
|---|---|
| Word cycler | static `hero.staticWord` |
| Hero load timeline | not run. Everything renders in place |
| Line and heading masks | rendered complete |
| Icon draw-on | rendered complete |
| Org boundary pin | static border, unpinned |
| Connector | rendered at full height |
| Column pin | not pinned, normal flow |
| Number roll | static |
| Magnetic CTA | no magnetism, hover colour only |
| Parallax | none |
| Lenis | not created. Native scroll |
| Grain | stays. It is not motion |

---

## 9. How to tell it is wrong

Check each of these before calling motion done.

- **The page keeps gliding after you stop scrolling.** Lenis `duration` too
  high.
- **Line 2 of the hero jumps sideways on every word swap.** Width is not being
  tweened between measured values.
- **Something re-animates when you scroll back up.** A missing `once: true`.
- **An element fades in when it is already fully on screen.** `start` is too
  late. `SCROLL_START` is "top 82%" for a reason.
- **Items in a row appear at visibly different times.** The stagger is on the
  wrong element, or each item got its own trigger instead of the row.
- **The connector snaps rather than draws.** `scrub: true` instead of
  `scrub: 0.6`.
- **Anything at `opacity: 0` after a full wheel scroll.** Defect 2. The
  failsafe is missing.
- **Headings are in Helvetica.** Defect 1. Nothing else matters until this is
  fixed.
