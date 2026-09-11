# MVRK Forms: what is actually wrong

I built the static export from `out/`, served it, and drove it in a real
browser at 1440 and 390. This is what came back. Fix the three defects before
touching design, because two of them are the reason the page looks the way it
does.

---

## Defect 1: none of the fonts are applied. This is the big one.

**PP Rader and Neue Montreal are downloaded on every page load and then never
used.** Every heading, every paragraph, the hero, all of it renders in the
browser's default sans.

Measured in the browser:

```
h1 computed font-family:
  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", ...

var(--font-display) resolved on <h1>:  ""   (empty string)
var(--font-rader)   resolved on <h1>:  "rader", "rader Fallback"   (fine)

woff2 files actually requested:
  PPRader_Bold, PPRader_Regular, NeueMontreal_Regular   (all four fetched)
```

### Root cause

`globals.css` declares the faces inside `@theme inline`:

```css
@theme inline {
  --font-display: var(--font-rader), ui-sans-serif, system-ui, sans-serif;
  --font-sans:    var(--font-montreal), ui-sans-serif, system-ui, sans-serif;
}
```

Then hand-written CSS consumes them:

```css
.u-display { font-family: var(--font-display); }
body       { font-family: var(--font-sans); }
```

In Tailwind v4, **`@theme inline` deliberately does not emit those custom
properties to `:root`.** That is what `inline` means: the value is inlined into
generated utility classes and the variable itself is never published. So
`var(--font-display)` resolves to nothing, `font-family` becomes invalid at
computed-value time, and the element falls back to the inherited default.

`--font-rader` itself is fine. It is set on `<body>` by next/font exactly as
intended. The break is one layer up, in the indirection.

### Fix

Stop routing through `@theme inline` for type. Declare the aliases in a real
`:root` block and consume the next/font variables directly:

```css
:root {
  --font-display: var(--font-rader), Georgia, "Times New Roman", serif;
  --font-body:    var(--font-montreal), ui-sans-serif, system-ui, sans-serif;
  --font-label:   var(--font-jb), ui-monospace, monospace;
}
```

Keep a `@theme` block only if you want Tailwind utilities like `font-display`,
and if you do, use plain `@theme`, not `@theme inline`.

**Verify it, do not assume it.** After the fix, open devtools and read the
computed `font-family` on an `h1`. It must contain `rader`. A visual check is
not enough: the metric fallback next/font generates is size-adjusted to match,
so wrong-font text still occupies roughly the right space.

> This one bug is most of why the page reads as generic. PP Rader is a
> distinctive display face. Rendered in Helvetica, there is no brand left on
> the page except the logo image.

---

## Defect 2: the reveal system strands content permanently

On an ordinary wheel scroll from top to bottom, **nine elements never become
visible.** They sit at `opacity: 0` forever:

| Element | Content |
|---|---|
| `h1` | the entire hero headline and word cycler |
| `p` | `100% Salesforce Native Forms. Free Forever!` |
| `div` | the hero CTA |
| `div` | the demo frame |
| `h2` | Creative Design |
| `h2` | Intelligent Automation |
| `h2` | Secure Sharing |
| `h2` | Clean Data |
| `div` | the entire waitlist form |

A visitor with JavaScript enabled currently lands on a blank cyan hero, scrolls
past four unlabelled feature bands, and finds no signup form. Only the footer
and the feature items themselves render.

### Root cause

`ScrollFxProvider` creates `gsap.from(...)` tweens with
`scrollTrigger: { once: true }` inside a `gsap.context`, then calls
`ScrollTrigger.refresh()` in a single `requestAnimationFrame`. `gsap.from`
applies the hidden state immediately on creation. The triggers for elements
already in the viewport, and the ones the user later scrolls past, are not
firing: the refresh races Lenis's initialisation, and ScrollTrigger never
receives a scroll position it acts on.

Combined with rule 9's `html.js` gate, the result is the exact opposite of
"fail open": JavaScript arrives, hides everything, and then fails to
un-hide it.

### Fix, in order of importance

1. **Never let a reveal own the initial visibility of hero content.** The
   headline, subhead and CTA are above the fold. Animate them on a plain
   timeline at load, not on a ScrollTrigger.
2. **Use `fromTo` with `immediateRender: false`,** not `from`. It cannot strand
   an element in the "from" state.
3. **Add a failsafe.** After `load` plus one second, force any element still at
   `opacity: 0` to visible. Three lines, and it converts a total content
   blackout into a missed animation.
4. **Refresh at the right time.** Call `ScrollTrigger.refresh()` after
   `document.fonts.ready` and after Lenis is running, not on the next frame.

---

## Defect 3: a 404 on every page load

```
404  /forms/icon.png?icon.44t701z2trl6h.png
```

Minor, but it is a red console entry on a page whose whole pitch is that it
feels well made. The metadata icon reference is not going through the
basePath-aware helper.

---

## What is NOT a defect, and is a design problem

With everything forced visible, the page reads as flat for reasons the code got
right and the brief got wrong. Honest note: the constraints that produced this
came from the kit I wrote. They were written to stop a previous build going
brutalist, and they overshot into forbidding craft.

| Rule as written | What it produced |
|---|---|
| "plum bands are full-bleed solid, flat, no gradient, no depth" | three flat rectangles, no depth anywhere |
| "one layout for all four so they read as a set" | the same three-column row four times, nothing rewards scrolling |
| "the word cycler is the only thing that moves forever" | a completely static page, since the cycler is invisible too |
| "there is no black, `--paper` is a cool near-white" | a cold, clinical ground that fights the warm plum |
| icons at 24px in 52px chips | the icons read as UI affordances, not as illustration |

Specific observations from the render:

- The hero is a headline, one wrapped line, one button, then roughly 300px of
  empty tint. Nothing in it is the product.
- The subhead is capped narrow enough that `Free Forever!` wraps to its own
  line, which kills the line that carries the whole pitch.
- The `--rose-ink` to `--plum` gradient at 96deg across that width shifts so
  little that "Forms For Salesforce" reads as one flat dusty pink.
- The demo band is 800px of empty browser chrome with a faint watermark,
  directly under the hero, which is the worst position for the largest empty
  element on the page.
- The four bands have no eyebrow, no number, no varying rhythm, and identical
  spacing, so the scroll has no sense of progress.

`DESIGN-DIRECTION.md` is the answer to this half.
