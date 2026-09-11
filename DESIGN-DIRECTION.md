# MVRK Forms: design direction v2

This replaces the design half of the old `BRIEF.md`. Content, section order and
copy are unchanged and still locked. Everything about how the page looks and
moves is new.

Read `DIAGNOSIS.md` first. Two of the three defects there are why the current
build looks the way it does, and no amount of design work survives them.

---

## 1. The problem with v1, in one line

The page is a **catalogue**. Heading, hairline, three columns, four times.
A catalogue cannot tell a story, and a story is what a single-scroll product
page has to be.

---

## 2. The story spine

The client's own section order is already a lifecycle. Nobody noticed, because
the four bands were built as four equal boxes.

```
  Creative Design       →  you build the form
  Intelligent Automation →  the form thinks
  Secure Sharing        →  the form goes out
  Clean Data            →  the answers come home
```

**Build. Think. Share. Collect.** That is one form's life, start to finish, and
it is the order the client wrote. So the page follows a single form from
creation to response, and the visitor is carried, not shown a menu.

Two consequences, both concrete:

- **Each band gets a numbered eyebrow**: `01 BUILD`, `02 THINK`, `03 SHARE`,
  `04 COLLECT`, in mono, above the existing heading. Numbers are earned here
  because this genuinely is a sequence. This is the only new text on the page,
  it is a label rather than copy, and it needs one line of sign-off from Vuk.
- **Each band gets its own rhythm.** Same system, four compositions. Details in
  section 6.

---

## 3. The one big idea: it never leaves the org

The product's actual pitch is not "we have a form builder". It is **the data
never leaves Salesforce.** No external service, no third-party host, no export
step. That is the whole reason an admin would pick this over Jotform.

Nothing in the current page says it visually.

**The move.** A thin boundary frame, one hairline, with a mono label in the top
left reading `YOUR SALESFORCE ORG`. It appears as the story spine begins, and
every one of the four bands happens *inside* it. It pins at the top of the
sequence, stays while all four bands scroll through, and releases at the end.

Why it works:
- It is true. It is the product's actual differentiator.
- It costs one `position: sticky` element and a `ScrollTrigger` pin.
- It gives the whole middle of the page a spine, which is exactly what is
  missing.
- It is the page's one memorable device, the way the orbit was on the Zapier
  page. One idea, executed properly, beats five effects.

The label is a device, not copy. If Vuk wants it gone, the frame still works
unlabelled.

---

## 4. Palette v2: warm ground, cool accent

Your call, and the right one. The cold near-white was fighting the plum.

### The change

`--paper` `#F5FBFB` (cool near-white) stops being the light band ground. It is
replaced by cream. The cyan stays, but it is now a *note*, not the ground: it
belongs to the hero and nowhere else.

| Token | Hex | Role |
|---|---|---|
| `--cream` | `#F6F0E6` | **the light band ground.** New. Warm, low chroma |
| `--paper` | `#FBF8F3` | raised surfaces: cards, the form, the browser frame |
| `--tint` | `#CCEEF3` | hero ground only. The page's one cool moment |
| `--plum` | `#814D71` | band ground for 02 and 04. Locked brand hex |
| `--plum-deep` | `#5E3852` | vignette and depth inside plum bands |
| `--rose` | `#E0778F` | logo artwork and CTA shadow. Locked brand hex |
| `--rose-cta` | `#BC4E66` | CTA fill. Derived, for 4.75:1 with white |
| `--rose-ink` | `#C4566E` | rose carrying type. Derived |
| `--ink` | `#4B5B71` | all body and display type on light. Darkest value |
| `--grey` | `#5E5E5E` | secondary type where ink reads too blue |

`--turquoise`, `--teal` and `--sf-cyan` remain carried and unused.

### Contrast, measured

Every pair the page actually uses, computed, not estimated:

| Pair | Ratio | Verdict |
|---|---|---|
| ink on cream | 6.11 | passes body |
| grey on cream | 5.72 | passes body |
| plum on cream | 5.73 | passes body |
| rose-ink on cream | 3.78 | large text only |
| cream on plum | 5.73 | passes body |
| tint on plum | 5.29 | passes body |
| cream on plum-deep | 8.56 | passes body |
| white on rose-cta | 4.75 | passes body |
| ink on tint | 5.63 | passes body |

Cream is a straight upgrade: ink on cream is 6.11 against 6.0-ish on the old
cool paper, and the warm ground makes plum look chosen rather than arbitrary.

### The one rule that keeps it from going muddy

**Warm carries the page. Cool marks Salesforce-adjacent moments.** Cream and
plum are the world. Cyan appears in the hero, and as `--band-icon` on plum
bands, and nowhere else. If cyan starts showing up as a general accent, the
warm/cool tension collapses and it goes back to looking arbitrary.

### Grain

The cream ground takes a very faint grain overlay: a tiled SVG feTurbulence at
about 3% opacity, `mix-blend-mode: multiply`, `pointer-events: none`. It is the
cheapest way to stop a large flat ground reading as a browser default, and it
is invisible as an effect, which is the point.

---

## 5. Type

Faces are unchanged and correct. They are simply not being applied. Fix per
`DIAGNOSIS.md` defect 1, then use them properly.

| Role | Face | Notes |
|---|---|---|
| Display | **PP Rader Bold** | every heading, the hero, the numbers |
| Body | **Neue Montreal** | 17px floor |
| Label | **JetBrains Mono** | eyebrows, the org label, the numbers' unit |

### Scale

The current scale is fine in the abstract and wrong in use: hero at 128px with
a 17px subhead capped at ~28 characters is a cliff, not a hierarchy.

```
hero        clamp(52px, 8.5vw, 132px)   PP Rader Bold, -0.03em, lh 0.92
band h2     clamp(38px, 5vw, 76px)      PP Rader Bold, -0.02em, lh 0.98
item h3     clamp(21px, 1.8vw, 26px)    PP Rader Bold
lead        clamp(19px, 1.6vw, 24px)    Neue Montreal, max 42ch
body        17px                        Neue Montreal, max 36ch
eyebrow     12px                        JetBrains Mono, 0.18em, uppercase
```

**Fix the subhead width.** `100% Salesforce Native Forms. Free Forever!` must
sit on one line at desktop. It is the sentence the whole product rests on, and
it currently breaks after "Free".

**Fix the gradient.** `--rose-ink` to `--plum` across a 600px line at 96deg
barely moves, so it reads flat. Either steepen it to about 140deg, or narrow
the span so the shift is visible across the actual text width. Check it
rendered, not in the token.

---

## 6. Four rhythms, one system

Drop "one layout for all four". Keep one *system*: same type scale, same
spacing scale, same icon treatment, same eyebrow. Vary the composition. This is
what makes a scroll feel authored instead of generated.

Still one `FeatureBand` component. Add a `rhythm` field to each band in
`config.ts` and branch the layout on it.

### 01 BUILD — cream

Heading left, items as three cards on `--paper` with real elevation
(`--shadow-md`). The one band that uses cards, because building is the tactile
step. Icons at 40px, top-left of each card.

### 02 THINK — plum

Heading right-aligned. Items in a **vertical stagger**, each indented further
than the last, joined by a thin connector line that draws downward as you
scroll. It is the logic band, so it should look like a flow. Icons at 40px in
`--tint`.

### 03 SHARE — cream

Split: heading and eyebrow pinned in a left column while the three items scroll
past in the right column. The one moment of pinning inside a band, and it reads
as "one thing, three destinations", which is what sharing is.

### 04 COLLECT — plum

Items as a **stacked list**, full width, divided by hairlines, each row being
icon, title, subtitle laid out horizontally. It should look like a table of
responses, because that is what the band is about. Densest band, and it lands
just before the waitlist, so the page tightens as it closes.

### What stays identical across all four

Eyebrow position and style, heading face and scale, icon stroke and size, the
band's vertical padding, the entrance timing, the order icon then title then
subtitle. The variation is in arrangement only. If a band invents its own type
scale or spacing, it has gone too far.

---

## 7. The hero needs a subject

Currently: a headline, a wrapped line, a button, and 300px of empty tint.

Add the product. A single **form card** on `--paper`, floating right of the
headline at desktop, rotated about 2 degrees, with `--shadow-lg`: a title row,
three field rows, a rose submit button. Built in CSS, no image needed, no new
copy. It gives the eye a subject, it shows what the product makes, and it
survives the real screenshot landing later because it can simply be replaced.

At mobile it sits below the CTA, straightened, cropped.

**Move the demo band.** 800px of empty browser chrome directly under the hero
is the largest void on the page in the worst position. Until the real video
exists, either drop the band and reinstate it when the file lands, or shrink it
to a 16:9 strip with a designed "coming soon" state that does not pretend to be
a video player. Do not leave a full-height empty frame as the second thing a
visitor sees.

---

## 8. Motion inventory

"No effects" was the complaint. Here is the full list, in priority order. Every
one is cheap, and none of them is decoration.

| # | Effect | Where | Why it earns its place |
|---|---|---|---|
| 1 | Word cycler | hero line 1 | already spec'd, the signature. Must actually be visible |
| 2 | Line-2 mask rise | hero | the gradient line rises from behind a mask on load |
| 3 | Icon draw-on | all 12 items | `stroke-dashoffset` 0 to full on enter. Directly answers "no effects" and costs nothing |
| 4 | Heading mask reveal | 4 band headings | line-by-line rise under a mask, not a fade |
| 5 | Org boundary pin | the whole feature sequence | the page's one big idea, section 3 |
| 6 | Number roll | 4 eyebrows | `01` to `04` roll up on enter |
| 7 | Connector draw | band 02 | the flow line draws downward on scroll |
| 8 | Column pin | band 03 | heading holds while items pass |
| 9 | Magnetic CTA | all CTAs | pointer delta into `gsap.quickTo`, elastic |
| 10 | Grain | cream grounds | static, 3%, invisible as an effect |
| 11 | Card parallax | hero form card | about 40px of travel across the hero |

### Rules that still hold

- **Three durations, two eases**, from `lib/motion.ts`. Unchanged.
- **Everything enters once and settles.** The cycler is the only forever loop.
- **`prefers-reduced-motion` kills all of it**, and the page must be complete
  and good-looking with every animation off. Check that view deliberately.
- **Nothing that hides content may depend on JavaScript arriving.** See
  `DIAGNOSIS.md` defect 2. This rule was already written and was still violated,
  so this time: build the reduced-motion, no-JS view first, confirm it reads,
  then layer motion on top.

---

## 9. Reference

`D:\Dev\MVRKxZapier reference 1` has the collection. For this page
specifically:

| Reference | Path | Take |
|---|---|---|
| Elementis | `elementis-site` | band rhythm variation, how a scroll stays interesting without new ideas |
| Otis Valen | `otis-valen-next` | type scale, the confidence of large display against small body |
| Ochi | `ochi.design-UI-Clone` | eyebrow and heading relationship, section entrances |
| Axel Vanhessche | `Axel-Vanhessche` | SVG mask reveals, the heading mask in effect 4 |
| Viditor | `Viditor_landing_page` | product-card-in-hero, closest to section 7 |
| mvrk-orbit | `mvrk-orbit` | **the only permitted code reference.** Fonts, `lib/motion.ts`, `lib/smoothScroll.ts`, the `data-fx` pattern |

Take technique, never art direction. Nothing on this page should be
identifiable as a specific reference.

---

## 10. What is locked, and what is yours

### Locked

Copy, byte-identical from `config.ts`. Section order. The six brand hexes.
Every CTA saying "Coming Soon" and scrolling to the waitlist. Icon style parity.
The three faces. The motion constants.

### Yours, and the point of this document is that you use it

Composition inside every band. The four rhythms in section 6. Spacing scale.
Radius and shadow. How the org boundary is drawn. How the icons are drawn and
how they animate. The hero form card. Grain, depth and texture within the
palette. Hover and focus states. Section transitions.

**Make real choices and commit.** The previous build hedged on every one of
these and the result is what prompted this rewrite. A page where every decision
was made confidently reads better than one that avoided deciding.

### Still avoid

Purple gradients as decoration, glassmorphism with no purpose, floating blobs,
emoji icons, mixed icon sets, isometric illustrations, symmetrical
low-contrast template layouts. And the opposite over-correction: thick borders,
hard zero-blur offset shadows, square corners everywhere.

The gradient rule is unchanged and matters more now that the ground is warm:
**rose-to-plum appears exactly twice**, hero line 2 and the logo artwork.

---

## 11. Order of work

| Phase | What |
|---|---|
| 0 | The three defects in `DIAGNOSIS.md`. Nothing else until fonts render and nothing is stranded |
| 1 | Palette v2, cream ground, grain, type scale |
| 2 | Hero: form card, subhead width, gradient angle, mask rise |
| 3 | The org boundary and the four eyebrows |
| 4 | The four rhythms |
| 5 | Icon draw-on, heading masks, connector, number roll, magnetic CTA |
| 6 | Reduced-motion and no-JS pass, then contrast, then 320px, then Lighthouse |

Phase 0 is not optional and is roughly an hour.

---

## 12. For Vuk

Two things need a yes before phase 3:

1. **Cream instead of white.** The MVRK parent palette says the base is a cool
   near-white. This moves the light bands to a warm cream while keeping every
   brand hex untouched. It is a visible change and he should see it, not find it.
2. **The four eyebrows.** `01 BUILD`, `02 THINK`, `03 SHARE`, `04 COLLECT` is
   the only new text on the page. One line of sign-off.
