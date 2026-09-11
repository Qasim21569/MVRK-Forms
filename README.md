# MVRK Forms

Single scrollable marketing page for MVRK Forms. Next.js 16 App Router,
TypeScript, Tailwind v4, GSAP, Lenis.

**Static export, served from a subpath: `https://www.mvrk.ca/forms`.**

Rules live in `CLAUDE.md`. Context lives in `BRIEF.md`. Where either disagrees
with `REVIEW.md` sections A and C, REVIEW wins — those corrections are already
applied here.

---

## Run it

```bash
npm install
npm run dev     # http://localhost:3000/forms/
npm run build   # static export into out/
npm run lint
```

The dev URL includes `/forms` because `basePath` is set. That is not a bug and
it must not be removed — see below.

## Deploy

`npm run build` writes `out/`. Upload the contents of `out/` to the `forms/`
directory on Bluehost, the same way `mvrk.ca/zapier` shipped in August.

Before building for production, set the waitlist endpoint:

```
NEXT_PUBLIC_WAITLIST_ENDPOINT=https://script.google.com/macros/s/…/exec
```

While that is unset the form runs in **preview mode**: it validates, shows all
three states, and sends nothing. It logs a warning to the console every time.

To sanity-check a build, confirm the export references `/forms/_next/`:

```bash
grep -o '/forms/_next/[^"]*' out/index.html | head
```

If you ever see a bare `/_next/`, `basePath` has been lost and the deployed
page will load unstyled.

## Regenerating assets

Both scripts are one-offs; their output is committed.

```bash
npm run fonts   # .ttf -> woff2 into src/fonts/  (needs the mvrk-orbit checkout)
npm run brand   # brand-source/FORMS-assets/* -> web-sized public/brand/* + og.png
```

Vuk's delivered artwork lives in `brand-source/`, deliberately **not** under
`public/`: it is print scale (up to 3005px, 711KB a file) and everything under
`public/` is copied verbatim into the export and deployed. Only the derived
files in `public/brand/` ship.

`npm run fonts` reads the licensed originals out of the mvrk-orbit repo at the
path hard-coded in `scripts/build-fonts.mjs`. If that checkout moves, edit the
path. Nothing in the normal build depends on either script.

## Where things are

```
src/
  config.ts                  every word on the page. Vuk edits this file.
  app/
    layout.tsx               fonts, metadata, the html.js boot script
    page.tsx                 the band order
    globals.css              palette, tones, type scale, surface language
    icons/page.tsx           the rule-5 scratch page, at 24px. noindex.
  lib/
    motion.ts                EASE, DUR_*, STAGGER, TRAVEL, SCROLL_START
    smoothScroll.ts          the one Lenis instance, scrollToY / scrollToId
    asset.ts                 basePath-aware asset paths
  components/
    Nav.tsx  Cta.tsx  WordCycler.tsx  ScrollFxProvider.tsx
    icons/index.tsx          the twelve, one grid, one stroke
    sections/                Hero, Demo, FeatureBand, Waitlist, Footer
```

## Things that are load-bearing

- **`basePath` / `assetPrefix`.** Every asset string goes through `asset()`.
  A bare `/brand/x.png` 404s in production.
- **`html.js [data-fx]`.** Reveals are hidden only when JS is confirmed. If the
  bundle never lands, nothing is hidden.
- **`scrollToY()`.** The only thing allowed to move the scroll position. A bare
  `window.scrollTo` fights Lenis.
- **The word cycler is the only thing that moves forever.** Everything else
  enters once, `once: true`.
- **Copy comes from `config.ts`, byte-identical.** No strings in components.

## Still open

- `waitlist.note` still ends with free-book residue in Vuk's original; the
  proposed cut is already applied and needs a yes.
- The waitlist success / submitting / error strings in `config.ts` were written
  here, not transcribed — no source strings exist and all three states are
  required. They are marked in the file and should be read and overwritten.
- `demo.src` is `null`. The band renders a designed poster placeholder in a
  16:9 box that is already the exact size the capture will be.
- The intro curtain (`PRELOADER.md`) is deliberately not built.
