# MVRK Forms: hero, scroll and mobile

Additive. `DESIGN-DIRECTION.md` and `MOTION.md` still stand. This adds the new
hero, the scroll effects sourced from the reference collection, and the mobile
spec, which is now the primary target.

**Approved by Vuk:** cream ground, and the four numbered eyebrows.

---

## 1. Mobile is the design, desktop is the adaptation

**80% of traffic is mobile.** Build every section at 390 first, get it right,
then widen. The mobile artboard on the canvas is the entry board for that
reason.

### Hard mobile rules

| Rule | Why |
|---|---|
| **No pins below 1024px.** The org boundary becomes a static border, band 03 stops pinning | Pinning fights the iOS address bar resize. It is the most common way a mobile scroll feels broken |
| **One scrubbed element only:** band 02's connector | Drop the hero parallax and the band-edge curve scrub entirely on mobile |
| **`100dvh`, never `100vh`** | The hero must not jump when the address bar collapses |
| **Hero card crops off the right edge** | A shrunk card looks like a thumbnail. A cropped one reads as a real object continuing off-screen, and field sizes stay legible |
| **Sticky bottom CTA bar** | Slides in once the hero leaves, hides at the waitlist. On a page whose only action is the waitlist, this is the conversion decision |
| **Every tap target ≥ 44px** | Form fields 46px, checkbox 22px inside a 44px hit area, buttons 52px |
| **Hero type floors at 40px:** `clamp(40px, 11vw, 132px)` | 52px overflows at 320px in PP Rader |
| **Subset the fonts** | PP Rader Bold is ~100KB. Latin subset only. Drop Rader Regular if nothing renders in it |
| **Test on a real mid-range Android** | Not desktop throttling. If the hero build sequence stutters there, ship a static assembled card on mobile |

### Mobile section order

Unchanged from desktop. Nav, Hero, Demo strip, org boundary opens, 01, 02, 03,
04, org boundary closes, Waitlist, Footer. Nothing gets hidden on mobile.

---

## 2. The new hero: the form builds itself

**Option A. Recommended. Build this one.**

The product is a drag-and-drop form builder. So the hero builds a form in front
of you, before the visitor reads a word about it. That is what every modern SaaS
hero worth copying does: show the thing working, do not describe it.

### The sequence, four beats, ~2.5s

| t | Beat | Detail |
|---|---|---|
| 0.0s | Card lands | Card fades in with the headline, `opacity 0→1`, `y 28→0`, `scale 0.985→1`, `0.9s`. Title row only, empty body |
| 0.4s → 1.2s | Fields drop | Each field enters from above, `y -18 → 0`, `DUR_ENTER`, stagger `0.18`. Border is dashed `--rose-cta` while landing, settles to solid `--line` |
| 1.4s → 2.1s | One drag | A cursor glyph grabs one field and moves it up a slot. The displaced field shifts down. This single gesture is the whole product |
| 2.3s | Arms and holds | Submit button fills `--rose-cta`, the badge flips from "building" to "live". Nothing moves again |

### Rules

- **DOM nodes with transforms only.** No canvas, no WebGL, no video file.
  Crisp at every DPR, works on a mid-range Android, costs nothing to load.
- **It plays once.** The word cycler stays the page's only forever loop, per
  CLAUDE.md rule 8. Do not loop the build.
- Runs on the hero's load timeline, **not** a ScrollTrigger.
- Under `prefers-reduced-motion`: render the finished card, no sequence.
- On mobile: same sequence, card cropped at the right edge. If it stutters on
  real hardware, render the finished card statically and move on. It is not
  worth a day.

### Option B, the safer one

Three slow vertical columns of field-type chips drifting behind the headline at
different speeds, tinted well back. Says "over 20 question types" without a
sentence.

Cheaper and safer: three CSS loops, no choreography, nothing to get wrong on a
slow phone. Weaker: it decorates rather than demonstrates, and it is a second
forever loop competing with the word cycler.

**Take B only if A proves fiddly on real mobile hardware.** Do not build both.

---

## 3. Scroll effects, sourced

Every one points at a folder already on the machine, under
`D:\Dev\MVRKxZapier reference 1\awwwards-collection`. Read the real
implementation rather than inventing one. Take the technique, never the art
direction.

| Effect | Where it lands | Folder |
|---|---|---|
| Pinned scroll storytelling | the org boundary, band 03's column pin | `05-hidden-gems/basement-scrollytelling` |
| Parallax columns | band 01's three cards, each offset differently | `06-saas-modern/olivier-cards-parallax` |
| Grid expand on scroll | band 04's rows widening as they enter | `06-saas-modern/codrops-columns-rows` |
| **SVG mask reveal** | **the plum band edges** | `05-hidden-gems/axel-svg-mask-scroll` |
| Scroll-velocity link | nav shrink, 1.5° skew on band transitions | `01-awwwards-clones/rejouice-agency` |
| Kinetic typography | word cycler, the four heading masks | `05-hidden-gems/codrops-kinetic-type` |
| Lenis reference wiring | the page's whole scroll feel | `06-saas-modern/olivier-parallax-lenis` |
| Register and restraint | nav behaviour, spacing, how little to do | `06-saas-modern/vercel-homepage-clone`, `framer-website-clone`, `stripe-navbar-framer` |

### The one worth spending time on

**Plum bands arrive on a curve, not a rectangle.**

Bands 02 and 04 are currently hard-edged blocks, which is why the page reads as
three stripes. Give each plum band a shallow SVG curve on its top edge, and
flatten that curve as the band enters, driven by scroll.

```
one <path>, one d attribute tweened between two values
scrub: 0.8
desktop only — static straight edge on mobile
```

Costs almost nothing and it is the single biggest change to how the page feels
while scrolling.

### Density down the page

Unchanged from `MOTION.md` section 6, and worth repeating because it is what v1
got wrong: **loud, quiet, build, peak, hold, tighten, stop.** The hero is loud,
the demo strip is nearly silent, 01 builds, 02 peaks, 03 holds via the pin, 04
tightens, the waitlist and footer stop. Equal motion density everywhere reads as
flat even when each effect is good.

---

## 4. What this changes in the build order

Insert into the phases in `PROMPTS.md`:

- **Phase 2** now includes the hero build sequence, and is built at 390 first.
- **Phase 4** gains the plum band SVG curve.
- **New phase 4.5:** the sticky mobile CTA bar.
- **Phase 6** gains a real-device pass, not just viewport resizing.
