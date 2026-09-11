# MVRK Forms — intro curtain spec

Adapted from the BRAHMA intro-curtain extract. This is a different logo on a
different kind of page, so about a third of that document ports unchanged, a
third changes numbers, and a third has to be rethought. The parts that change
are called out.

**Status: blocked on the real logo SVG.** Do not trace the mark out of the
brand sheet PDF. Build the whole state machine, the curtain, the wordmark wipe
and the timing system against a placeholder `<path>`, and drop the real
geometry in when Vuk sends the files. Everything except §4 works without it.

---

## 0. Why we are doing this at all

Vuk saw the Zapier page's loader on 07/08/26 and said *"I fucking love the
load that was a classic genius qasim decision."* He also said, of that 2.8s
version, *"It's the perfect speed... but too fast not too slow."*

So: **2.8 seconds is this client's calibrated number**, and his stated bias is
toward faster. The BRAHMA curtain is 8 seconds. Do not port that. Eight
seconds is right for a luxury investment group where the wait is the product;
it is wrong for a SaaS product page whose entire pitch is that it is fast.

**Target total: 2600ms.** Skippable, once per session, never under reduced
motion.

Build it **last**, after the page works. It is blocked on assets, it unblocks
nothing, and a rushed half-version is worse than none. It is also the single
highest-return-per-hour thing on the list once the page is done, which is why
it should not get squeezed by the Sept 14 date.

---

## 1. What ports unchanged

These are the load-bearing decisions from the BRAHMA doc. Copy them exactly,
do not re-litigate them:

- **SSR default is `data-intro="skip"`**, flipped to `"play"` by an inline
  blocking script in `<head>` before first paint. Fail open. If the script
  throws, is stripped, or JS is off, the page renders with no curtain rather
  than being permanently covered by one that can never lift.
- **Outer `try/catch` ends in `skip`.** Every failure path leaves a visible page.
- **Inline `<script>` in `<head>`, never external.** An external src is a
  network request and a network request can lose the race against a fixed timer.
- **Inline SVG for the mark, never `<img>` or `next/image`.** This is the
  mistake that made BRAHMA's loader intermittently animate to an empty stage.
  The timer does not wait for assets; the only fix is for the geometry to be
  in the HTML document on the first frame.
- **`sessionStorage`, not `localStorage`.** Once per session. A visitor coming
  back next week sees the brand moment again; someone reloading today does not.
- **Scroll lock as a separate attribute** (`data-intro-lock`) from the state
  value, so it can be released independently.
- **Idempotent `release()` / `finish()`.** The skip path calls both.
- **Any `pointerdown` or `keydown` skips**, into a fast exit.
- **`aria-hidden="true"` on the whole curtain.** It is decorative.
- **No GSAP, no Framer, no React for the animation itself.** All motion is CSS
  `@keyframes` gated on the `data-intro` attribute. The script decides *whether
  and when*; CSS decides *what it looks like*. They communicate through one
  attribute. That is what makes it independent of hydration.

Storage key for this project: `mvrkforms:intro-played`.

---

## 2. What changes: the timing system

BRAHMA's four-file agreement (`globals.css` delays, `tR`, `tD`, `FAILSAFE_MS`)
is the right pattern. Same discipline, new numbers.

```
   0 →  200   curtain fill is already opaque, nothing visible yet
 120 → 1220   the "f" mark draws
 900 → 1500   the mark floods with the brand gradient
1250 → 1750   FORMS wordmark wipes up behind a mask
1500 → 1900   "BY MVRK" fades in
1600 → 2200   the rule draws left to right  ← ends exactly at the lift
2200 → 2600   curtain lifts, edge flattens
```

Two joins carried from BRAHMA, both worth keeping:

- **The rule ends at exactly the moment the lift starts.** It resolves into the
  exit rather than stopping and leaving a pause.
- **Beats overlap on purpose.** The flood starts at 900 while the draw runs to
  1220; the wordmark starts at 1250 as the flood resolves at 1500. A hard gap
  between two beats reads as two separate animations. The overlap is what makes
  each one a handoff.

Values that must agree, in three places:

| Where | Value |
|---|---|
| `globals.css` | every `animation-delay` above |
| `layout.tsx` | `tR = 2200` — must equal the lift's delay |
| `layout.tsx` | `tD = 2600` — must equal lift delay + lift duration |

Change one, change all three. The BRAHMA doc suggests a 20-line script that
parses the CSS and asserts the joins line up. Worth it here too, and note its
warning: a minifier rewrites `300ms` as `.3s`, so parse the source, not the
build output.

Skip exit: `data-intro="exit"` runs a 400ms lift with no delay, and
`setTimeout(finish, 410)` — the 10ms margin so the CSS lands before the
element is hidden.

---

## 3. What changes: the surface

BRAHMA lifts a dark curtain. This page has **no black** (`CLAUDE.md` rule 3),
and its hero background is `--tint` `#CCEEF3`.

- `.intro-fill` background: **`--paper` `#F5FBFB`**. Matches the white cards
  the logo sits on in the brand sheet, and gives the gradient mark its cleanest
  ground.
- The lift reveals a `--tint` hero, so there is a small tonal step at the
  moment of the lift. That reads as a reveal, not a glitch. Do not make the
  curtain `--tint` to hide it — the gradient mark's contrast on tint is already
  marginal (see `REVIEW.md` C2.2).
- **Edge sag: shallower than BRAHMA's.** Their `Q50 40` on a `0 0 100 20`
  viewBox is a deep, theatrical drape. Use `M0 0 H100 Q50 22 0 0 Z` and
  `height: 6vh`. Same trick, lighter register.
- Keep `scaleY(1) → scaleY(0)` on `transform-origin: top center` with
  `preserveAspectRatio="none"`. Do **not** morph the `d` — that needs JS and
  forces geometry recalc every frame.
- The lift and the edge flatten must share duration, easing and delay to the
  millisecond. Desync them by 50ms and the skirt visibly detaches.

Easing: use `--ease` `cubic-bezier(0.22, 1, 0.36, 1)`, the same curve the rest
of the page moves on, for the lift, the flood and the wordmark. The one
exception is the rule — see §5.

---

## 4. What has to be rethought: drawing a chunky ribbon mark

**This is the part of the BRAHMA doc that does not port, and the part most
likely to eat a day if you discover it inside Claude Code.**

BRAHMA's mark is twelve relatively thin shapes. `pathLength="1"` +
`stroke-dasharray: 1` + animating `stroke-dashoffset` traces each shape's
outline, and because the shapes are thin, tracing the outline reads as drawing
the shape.

The FORMS "f" is a **single thick ribbon** that loops through itself. If you
dash-offset its outline, you will not draw an "f" — you will trace its
silhouette, running up one edge of the ribbon, around the terminal, and back
down the other edge. It looks like a wire being bent, not like a letter being
written. It is a very recognisable wrong-looking effect.

### The fix: mask the fill with a stroked centreline

1. Ask Vuk (or draw yourself, in Figma/Illustrator) a **centreline path** — a
   single open path running down the spine of the ribbon, in the direction a
   person would draw the letter. No fill, no thickness of its own.
2. Put that path in a `<mask>`, stroked at a width comfortably wider than the
   ribbon's thickest point, with `stroke-linecap: round`.
3. Fill the real mark with the gradient and apply the mask.
4. Animate the mask path's `stroke-dashoffset` from 1 to 0.

The gradient ribbon then appears along its own spine, in draw order, at full
thickness. This is how self-drawing thick logos are actually done.

```html
<svg class="intro-mark" viewBox="0 0 120 120" aria-hidden="true">
  <defs>
    <!-- userSpaceOnUse so the gradient does not re-map per element -->
    <linearGradient id="forms-grad" gradientUnits="userSpaceOnUse"
                    x1="10" y1="110" x2="110" y2="10">
      <stop offset="0"   stop-color="#E0778F"/>
      <stop offset="1"   stop-color="#814D71"/>
    </linearGradient>

    <mask id="forms-draw" maskUnits="userSpaceOnUse">
      <path class="intro-mark-spine"
            d="M …centreline of the ribbon, in draw order… "
            pathLength="1"
            fill="none" stroke="#fff" stroke-width="34"
            stroke-linecap="round" stroke-linejoin="round"/>
    </mask>
  </defs>

  <path class="intro-mark-fill"
        d="M …the real ribbon outline from Vuk's SVG… "
        fill="url(#forms-grad)"
        mask="url(#forms-draw)"/>
</svg>
```

```css
.intro-mark-spine {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: intro-draw 1100ms cubic-bezier(0.4, 0, 0.25, 1) 120ms both;
}
@keyframes intro-draw { to { stroke-dashoffset: 0; } }
```

`pathLength="1"` still earns its place: it lets one CSS rule drive the draw
whatever the real geometry is, so nobody has to call `getTotalLength()` or
hardcode a length that silently desyncs the moment the artwork is edited.

### Gradients cannot be animated the way BRAHMA animates colour

BRAHMA passes each shape's colour in as a `--mark` custom property and animates
`fill: transparent → var(--mark)`. That works because those are solid colours.

**A paint server is not interpolatable in CSS.** You cannot animate
`fill: transparent → url(#forms-grad)`. The animation will either snap or do
nothing, and it is not obvious from looking at the code.

Fix: keep `fill="url(#forms-grad)"` on the element permanently and animate
**`fill-opacity`** instead.

```css
.intro-mark-fill { fill-opacity: 0; animation: intro-flood 600ms var(--ease) 900ms both; }
@keyframes intro-flood { to { fill-opacity: 1; } }
```

If you want the BRAHMA "the line becomes the shape" read — a stroked outline
that hands off to a fill — give the spine mask a brief `stroke-opacity` fade at
the same moment. Same idea, done with opacity on both sides instead of colour.

### Other SVG gotchas that do port

- **`transform-box: fill-box`** on anything inside the SVG you rotate or scale.
  Without it a percentage `transform-origin` resolves against the whole SVG
  viewport and the element swings in from off-centre like a hinge. Easiest
  thing in this whole spec to get wrong.
- **Translate values inside an SVG are in user units, not screen pixels.** On a
  `0 0 120 120` viewBox, `translateY(-6px)` is 5% of the height, and it scales
  with the mark automatically at any rendered size.
- **Scope the draw rule with a child combinator** (`.intro-mark > path`) so it
  cannot reach into a `<defs>` or a group.
- **Check what the SVG actually contains before assuming.** BRAHMA's "logo.svg"
  turned out to be a 5.47 MB file that was two base64 PNGs with zero vector
  paths in it. When Vuk's files land, open them in a text editor before
  planning anything.

### The BRAHMA "subject + object" split does not apply

Their mark is a lotus enclosed by a ring **with a key at its centre**, and the
two halves mean different things to the client — so the lotus is *drawn* and
the key *arrives*. Two verbs for two ideas.

The FORMS mark has no such split. It is one continuous gesture. Forcing a
second act onto it would be inventing meaning that is not in the artwork.

Your three beats are the lockup's own structure instead: **mark draws →
wordmark wipes → "by MVRK" settles.** That is the brand hierarchy — the product
resolving into its parent. It is a real idea and it is enough.

---

## 5. The rest of the stage

- **Wordmark** — mask wipe-up. Parent with `overflow: hidden`, child starting
  at `translateY(112%)`. The 112% rather than 100% clears descenders and any
  `padding-bottom` on the mask. FORMS is all caps with no descenders, so 106%
  is enough — but keep the padding note in mind if you set it in live type.
- **"BY MVRK"** — plain opacity fade, 400ms. It is a subordinate mark; do not
  give it its own motion idea.
- **The rule** — a 1px bar, `transform: scaleX(0) → 1`, `transform-origin: left`.
  Two rules learned the hard way on BRAHMA:
  - **Near-linear easing**, `cubic-bezier(0.4, 0, 0.25, 1)`. Ease it out and a
    progress line looks like it is stalling. This is the one element that does
    **not** use `--ease`.
  - **One line event only.** An earlier BRAHMA version drew a hairline and then
    ran a solid fill along the same path; on screen it read as the line loading
    twice.
- **Container settle** — `scale(0.94) → 1` over the full sequence, so the lockup
  drifts forward while assembling. 6% is enough. It stops the whole thing
  feeling like a sticker being built in a flat plane.

Skip the subtitle. BRAHMA's per-word staggered subtitle exists to fill seconds
3–6 of an 8-second sequence. In 2.6 seconds there is nothing to fill.

---

## 6. Integration with this page specifically

Three things the BRAHMA doc does not cover because that project's stack differs.

### 6.1 Lenis must not run under the curtain

`initSmoothScroll()` mounts on hydration, which is well before the curtain
lifts. Lenis reading wheel events while the page is covered means the user
scrolls the hero out of frame behind the curtain and the reveal lands mid-page.

`html[data-intro-lock] { overflow: hidden }` mostly contains this, but the
clean fix is to gate the mount:

```tsx
// SmoothScroll.tsx
useEffect(() => {
  if (document.documentElement.hasAttribute("data-intro-released")) {
    return initSmoothScroll();
  }
  let teardown: (() => void) | undefined;
  const onRelease = () => { teardown = initSmoothScroll(); };
  document.addEventListener("mvrkforms:intro-release", onRelease, { once: true });
  return () => {
    document.removeEventListener("mvrkforms:intro-release", onRelease);
    teardown?.();
  };
}, []);
```

Note the **attribute check before the listener**. That is BRAHMA's
`introAlreadySettled()` insight and it is the detail worth copying: a component
that mounts after the event fired resolves immediately instead of hanging.
Event-only coordination has a race; the attribute is the durable record.

Also: BRAHMA shipped `introGate.ts` with `heroReady()`, `introMode()` and
`introAlreadySettled()` exported and **zero consumers** — the events fired into
the void. Either wire the gate up as above or leave it out. Do not port it
dormant.

### 6.2 ScrollTrigger must refresh when the curtain lifts

The whole page laid out under a scroll lock, and the display font may have
swapped in during the sequence. Every trigger start position is stale.

```ts
document.addEventListener("mvrkforms:intro-release", () => ScrollTrigger.refresh(), { once: true });
```

This is the same class of bug as the two `smoothScroll.ts` refresh gaps in
`REVIEW.md` C4. Fix all three together.

### 6.3 The hero cycler should not start under the curtain

The word cycler is an infinite `setInterval`/timeline. If it starts on mount,
by the time the curtain lifts it is eight words deep and the first thing the
visitor sees is "Fearless" rather than **"Free"**.

That matters more than it sounds. `config.ts` puts "Free" at index 0
deliberately — the whole gag is that the headline keeps saying the product is
free. The first frame after the reveal should be the anchor word.

Start the cycler on `mvrkforms:intro-release`, from index 0, with the same
attribute-first check as 6.1.

### 6.4 basePath

Any asset the curtain references must respect `basePath: '/forms'`. Since the
mark is inline SVG and the fonts come through `next/font`, there should be
nothing to reference — which is another argument for inlining.

---

## 7. Honest limitation, stated once

This is a **fixed-duration performance, not a loading indicator.** The rule
that looks like a progress bar is measuring nothing; it is a 600ms `scaleX`.
On a fast connection the page has been ready for two seconds. On a slow one it
may still be loading when the curtain lifts.

That is an accepted trade on a small marketing page, and at 2.6s the cost is
low. But know you are making it.

There is also an LCP consideration: Chrome does not do occlusion testing, so an
opaque overlay does not by itself invalidate the hero's paint — but any large
**text** inside the curtain is itself an LCP candidate. Keep the wordmark as
inline SVG rather than live type, and check the Lighthouse LCP element after
you wire it up rather than assuming.

---

## 8. Porting checklist

**Keep as-is from BRAHMA**

- [ ] SSR default `data-intro="skip"`, flipped to `play` by the boot script
- [ ] Outer `try/catch` → `skip`
- [ ] Inline boot script in `<head>`, never external
- [ ] Inline SVG mark, never `<img>`/`<Image>`
- [ ] `pathLength="1"`, rule scoped with the child combinator
- [ ] `transform-box: fill-box` on anything transformed inside the SVG
- [ ] Scroll lock as a separate attribute from the state value
- [ ] `sessionStorage`, reduced-motion check, click-to-skip
- [ ] Idempotent `release()` / `finish()`
- [ ] Attribute-first coordination, not event-only

**Changed for FORMS**

- [ ] Total 2600ms, not 8000ms. `tR = 2200`, `tD = 2600`
- [ ] Curtain fill `--paper`, edge sag `Q50 22` at `6vh`
- [ ] Masked-centreline draw, not outline dash-offset (§4)
- [ ] `fill-opacity` for the gradient flood, not animated `fill` (§4)
- [ ] Three beats — mark, wordmark, "by MVRK" — no key act, no subtitle
- [ ] Storage key `mvrkforms:intro-played`
- [ ] Lenis, ScrollTrigger and the word cycler all gated on release (§6)

**Blocked**

- [ ] Real mark geometry from Vuk's SVG
- [ ] Centreline spine path, drawn from that geometry
- [ ] Gradient stop coordinates sampled from the real logo, not guessed
