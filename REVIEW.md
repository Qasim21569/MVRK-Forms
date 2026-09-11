# MVRK Forms kit — review, 10 Sept 2026

Reviewed: `CLAUDE.md`, `BRIEF.md`, `config.ts`, `globals.css`, `motion.ts`,
`smoothScroll.ts`, the wireframe deck, the brand sheet, and the full WhatsApp
history with Vuk.

Verdict: the kit is strong. Copy transcription is byte-perfect, the palette
matches the brand sheet exactly, the motion vocabulary is sound, and the
locked/yours split is the right shape for this client. Three things are
missing that came out of WhatsApp and never made it into the docs, and about
a dozen smaller things are worth fixing before Claude Code touches anything.

---

## A. Blockers — things in WhatsApp that the kit does not know about

### A1. One video, not four. RESOLVED 10/09/26.

Vuk had committed to four (15/07/26 and 27/08/26), which is why this was
raised. Scope is now **one demo video**, with more possibly following later.

That changes the design answer, not just the count. `BRIEF.md` §4 says pick one
layout for the three-up items and use it across all four bands so they read as
a set. Putting a video inside one band and not the other three breaks the set,
and it buries the single strongest asset on the page inside a feature row.

**Decision: the video gets its own band, directly after the hero.**

- The four feature bands stay uniform and untouched. The set rule survives.
- The one real product visual gets full width and full weight. `BRIEF.md` §10
  Q6 is right that one real screenshot does more than all the type and icons
  put together — so do not bury it.
- When videos two through four arrive they extend that section rather than
  forcing a re-layout of the bands.

**Copy problem:** there is no heading string for this section, and rule 1 says
strings come from config or you stop and ask. Do not invent one. Ship the
section as video-only with no heading — framed, captioned by nothing, sitting
between the hero and Creative Design. If Vuk wants a line above it, he can send
one and it goes in config.

```ts
/** The single product demo. Its own band, between Hero and Creative Design. */
export const demo = {
  /** null until the file lands. Renders a designed poster placeholder. */
  src: null as string | null,      // "/media/forms-demo.mp4"
  webm: null as string | null,
  poster: "/media/forms-demo-poster.jpg",
  /** Alt text. This is the only product visual on the page. */
  alt: "Building a form in MVRK Forms inside Salesforce",
} as const;
```

Build the `null` state as a designed poster placeholder, not an empty div, and
make sure the layout does not reflow when the real file lands.

**02/07/26 Vuk: "It's a desktop only app, it's not fit mobile."** The capture
will be a wide desktop screen recording. Reserve 16:9. Frame it in browser
chrome. Muted autoplay on IntersectionObserver, paused offscreen, poster
always, `preload="metadata"`, MP4 H.264 plus WebM. His 03/07/26 sample was
2.15 MB, which is a fine target to hold him to.

### A2. Waitlist form. CONFIRMED 10/09/26. Google Apps Script backend.

This collides with three things currently written down, all of which need
correcting:

- `BRIEF.md` §2 "no email capture unless Vuk asks for it" — he asked.
- `BRIEF.md` §10 Q3 asks whether Coming Soon should capture email — answered.
- `CLAUDE.md` rule 2 "buttons are inert" — still true for the install CTA, but
  one button on the page now does something. Rule 2 must be scoped to the
  install CTA or Claude Code will strip the submit handler.

#### Fields

From Vuk's annotated screenshot of `ssb.mvrk.ca/free-book`, which he sent as
the model. He crossed out the button label only and left everything else.

| Field | Type | Required | Notes |
|---|---|---|---|
| First Name | text | yes | Two separate name fields in his reference |
| Last Name | text | yes | |
| Email | email | yes | |
| Consent | checkbox | yes | Submit stays disabled until checked |

Note the mismatch: on 04/09/26 he said *"Just name and email"*, but the form he
then pointed at has **First Name and Last Name as two fields**. Following the
screenshot, since that is the more recent and more specific instruction. Worth
one line of confirmation, it is not worth blocking on.

#### Copy

The checkbox and note copy on his screenshot are still the free-book strings
("send the Blueprint", "the book plus future Salesforce Solopreneurship
insights", "releasing updated version of the book"). He only annotated the
button. So take the checkbox line from what he actually wrote for Forms on
04/09/26, and the button from the screenshot:

```ts
export const waitlist = {
  consent:
    "Yes, notify me via email when the trial is available. I agree to the " +
    "Privacy Policy and consent to receive future emails from MVRK.",
  /** TODO: last sentence still references "the book". Confirm with Vuk. */
  note:
    "Note: I hate spam as much as you do. I will only email when I have " +
    "something important to share.",
  submit: "Email Me When Available",
  privacyHref: "https://www.mvrk.ca/privacy-policy",
  /** Rendered inside the consent line as a link. */
  privacyLabel: "Privacy Policy",
} as const;
```

**One copy item still open.** His note line ends "Like releasing updated
version of the book." That is free-book residue. Proposed fix is to simply cut
that last sentence, as above. Get a yes from him rather than shipping either
version silently.

#### Backend: Google Apps Script

Same pattern as the other MVRK sites. Four things will bite, in roughly this
order:

1. **CORS preflight.** An Apps Script web app does not handle `OPTIONS`. If you
   `fetch` with `Content-Type: application/json` the browser sends a preflight,
   gets nothing back, and the request fails with a CORS error that looks like a
   deploy problem but is not. Send a **simple request** instead: either
   `URLSearchParams` (`application/x-www-form-urlencoded`) or a JSON string with
   `Content-Type: text/plain;charset=utf-8` parsed in `doPost` with
   `JSON.parse(e.postData.contents)`. Both avoid preflight entirely.
2. **Deployment settings.** Deploy as a Web App, "Execute as: Me", "Who has
   access: Anyone". Anything else returns a Google login page instead of your
   handler. Every code change needs a **new deployment version**; editing the
   script without redeploying silently keeps serving the old code.
3. **The redirect.** `doPost` returns a 302 to `script.googleusercontent.com`.
   `fetch` follows it, which is fine for a simple request. Do not use
   `mode: "no-cors"` as a workaround — the request succeeds but the response is
   opaque, so you cannot tell a real failure from a success and the user gets a
   confirmation for a submission that never landed.
4. **No rate limiting, and the endpoint is public.** The URL ships in the client
   bundle; that is unavoidable and acceptable, but it means anyone can post to
   it. No CAPTCHA was asked for on this site (that was the Zapier page), so
   defend cheaply: a honeypot field hidden from users and screen readers, plus
   a minimum time-to-submit check (reject anything under ~2 seconds). Validate
   email server-side in the script too, not just in the browser.

Endpoint goes in an env var, not in `config.ts`:

```ts
// .env.local, and set in the build environment
NEXT_PUBLIC_WAITLIST_ENDPOINT=https://script.google.com/macros/s/…/exec
```

`config.ts` is the file Vuk edits directly. Keep a URL he might break out of it.

#### States

Three, all needed, all easy to forget in a static export where there is no
server to fall back on:

- **Submitting** — button disabled, label changes, no double-submit.
- **Success** — replace the form with a confirmation, do not just toast it.
- **Failure** — a real message plus `vuk@mvrk.ca` as a fallback. If Apps Script
  is down the visitor otherwise has no way to reach anyone.

Keyboard reachable, visible focus ring, real `<label>` elements, and
`aria-describedby` linking the note text to the checkbox.

This does **not** break the static export. The page stays fully static; the
form posts client-side to Google.

### A3. The site lives at `mvrk.ca/forms`. CONFIRMED 10/09/26.

> **06/09/26 Vuk:** `https://www.mvrk.ca/forms`

And the precedent is exact: on 17/08/26 you shipped `https://mvrk.ca/zapier/`
as static files onto Bluehost, and on 20/07/26 he explicitly rejected a
subdomain ("Ok then definitely MVRK.ca/zapier").

Consequences the kit does not mention anywhere:

- `config.site.url` says `https://mvrkforms.com`. Wrong. Should be
  `https://www.mvrk.ca/forms`.
- Neither `CLAUDE.md` nor `BRIEF.md` mentions `output: 'export'` at all,
  despite the whole deploy model depending on it.
- Serving a Next export from a **subpath** needs `basePath` and `assetPrefix`
  set at build time. If you skip this, every CSS file, font and JS chunk
  resolves to `mvrk.ca/_next/...` instead of `mvrk.ca/forms/_next/...` and the
  page loads unstyled. This is the single most likely way the Sept 14 deploy
  goes wrong.

```ts
// next.config.ts — set this on day one, not on deploy day
const config = {
  output: "export",
  basePath: "/forms",
  assetPrefix: "/forms",
  trailingSlash: true,          // Bluehost/Apache serves /forms/ as a directory
  images: { unoptimized: true }, // next/image cannot optimise in a static export
};
export default config;
```

Then reference brand assets as `` `${basePath}/brand/...` `` or import them,
never as bare `/brand/...` strings. `config.brand.*` currently holds bare
absolute paths, which will 404 under a basePath. Fix those to relative or
route them through a helper.

---

## B. Schedule and scope reality

- **27/08/26 Qasim → Vuk:** "you'd mentioned wanting it live before Sept 14."
- **06/09/26 Vuk:** "But tomorrow you said you will have something, right?"
  → you said Tuesday.
- **09/09/26 Vuk:** "Hey pal I know you're struggling. Any progress?"

`BRIEF.md` §9 budgets six working days. Today is the 10th. That is not six
days, and the waitlist form adds work that was not in the six. Dropping from
four videos to one gives some of it back.

The honest move is to tell him what lands by the 14th and what does not,
rather than let the 14th arrive silently. A defensible split:

- **By 14 Sept:** full page live at `mvrk.ca/forms` — hero and cycler, the
  twelve icons, four feature bands, waitlist form wired to Apps Script,
  footer, responsive, reduced motion. Demo band present, showing a poster
  placeholder.
- **After:** his video dropped in, the intro curtain, Lighthouse polish.

Phase order changes slightly from `BRIEF.md` §9: the waitlist form is a new
phase and it should land **before** the icons, not after. It is the only
thing on the page that can fail in production, it depends on a Google
deployment you do not control, and twelve hand-drawn icons are the most
compressible item on the list if the 14th gets tight.

That framing also protects the preloader, which is the thing he will actually
rave about (07/08/26: *"I fucking love the load that was a classic genius
qasim decision"*) and which should not be rushed into a half-version.

---

## C. Findings in the files

### C1. `config.ts`

| # | Finding | Severity |
|---|---|---|
| 1 | **The 46 words match the wireframe byte for byte.** Verified all 46, all 12 feature titles and all 12 subtitles against the deck. Zero drift. | ✅ |
| 2 | `dwellMs: 1600` contradicts Vuk. **02/07/26 Vuk: "I think even 1.5 second may be too long."** Drop to ~1200 and let him tune it in config, which is exactly what the config file is for. At 1600ms the full 46-word loop is 74 seconds; nobody ever sees it. At 1200 it is 55s and each "Free" lands every ~4.8s instead of 6.4s. | High |
| 3 | Subhead is `"100% Salesforce Native Forms. Free Forever!"`. The wireframe says `"100% Salesforce Native Forms,Free Forever!"` — comma, no space. You fixed his typo, which breaks your own rule 1. It is the right fix; just get him to confirm it so the rule stays intact. | Medium |
| 4 | `site.url` is `mvrkforms.com`. See A3. | High |
| 5 | No waitlist copy. See A2. | High |
| 6 | No `demo` export for the one product video. See A1. | High |
| 7 | `site.tagline` and `footer.tagline` are the same string declared twice. Make footer reference site, or they will drift the first time he edits one. | Low |
| 8 | `"FTW"` is the only all-caps entry and the only one whose tail is not lowercase. If the cycler pins the leading `F` and animates only the tail (a nice effect, and the reference video may show it), FTW needs a special case. Test it early. | Medium |
| 9 | Longest word is **"Frictionless"** at 12 characters. At the `clamp(44px, 9vw, 128px)` floor on a 320px viewport that is roughly the full screen width. If the container is width-stable to the longest word, the hero is sized by Frictionless on every viewport. Test 320px before anything else in Phase 2. | Medium |
| 10 | `brand.*` paths are bare absolute (`/brand/...`) and will 404 under `basePath`. | Medium |
| 11 | Missing: privacy policy URL, and the eventual install destination. **02/07/26 Vuk: "button to install (will eventually lead to the official Salesforce app exchange listing)."** It is AppExchange, not Shopify. Add `cta.futureHref: null` with that comment so the launch swap is genuinely one line. | Low |

### C2. `globals.css`

| # | Finding | Severity |
|---|---|---|
| 1 | **`[data-fx] { opacity: 0 }` with no JS fallback.** If the GSAP chunk fails, is blocked, or a reveal trigger never fires, every revealed element on the page is permanently invisible. Static-export marketing pages get opened on bad connections and locked-down corporate networks, which is exactly Vuk's audience. Fail open: put a `js` class on `<html>` from a tiny inline head script and scope the rule to `html.js [data-fx]`. Same philosophy as the preloader's `skip` default. | **High** |
| 2 | **Gradient text contrast.** `--rose` `#E0778F` against the `--tint` `#CCEEF3` hero is ~2.4:1, and ~2.8:1 against `--paper`. WCAG large-text AA needs 3:1. The rose end of the headline gradient fails on both surfaces. Do not change the brand hexes; add a derived token the way `--plum-deep` and `--rose-soft` already exist: `--rose-ink: #C4566E` (~3.5:1 on tint), used only where rose carries type. Rose stays `#E0778F` for the CTA fill and icon accents. | **High** |
| 3 | `--slate` `#617F95` on `--paper` is **4.05:1**. That fails AA for 17px body text, and `[data-tone="light"]` sets `--band-fg-2: var(--slate)` — so every feature subtitle on the light bands fails. BRIEF §4 explicitly asks for AA on subtitles. Use `--grey` (6.3:1) or `--ink` at reduced weight instead. | **High** |
| 4 | The `@font-face` block is still a TODO comment, so `--font-rader` and `--font-montreal` do not exist yet. Also decide which mechanism: the comment says copy a raw `@font-face` block from mvrk-orbit, but `@theme inline` and `layout.tsx` imply `next/font/local`. Pick one. Going through `next/font/local` gets you automatic preload and a `size-adjust` fallback, which matters for the "no layout shift" line in your Definition of Done. | High |
| 5 | Ship **woff2**, not `.ttf`. A `.ttf` is typically 2–4x the bytes of the same face as woff2, on a page whose whole pitch is that it feels fast. | Medium |
| 6 | `@theme inline` defines `--font-display` / `--font-sans` / `--font-mono`, but `.u-display`, `.u-body` and `.u-label` all reach past them to `var(--font-rader)` etc. Two sources of truth for the same thing. Use the theme tokens in the primitives. | Low |
| 7 | ~~Licensing.~~ **Resolved 10/09/26.** PP Rader and Neue Montreal are already licensed and cleared with Vuk. Use them as-is. Ignore `BRIEF.md` §5's licensing note and §10's implied question. | ✅ |
| 8 | `::selection` is white on `--rose`, ~2.6:1. Use `--plum` as the selection background. | Low |
| 9 | `body { overflow-x: hidden }` silently breaks `position: sticky` on any ancestor chain. If the nav is sticky, this is where it will mysteriously not stick. Prefer fixing the overflowing child. | Low |
| 10 | `--sf-cyan` is reserved by rule 4 but nothing on this page marks Salesforce. Either use it once (the word "Salesforce" in line 2, or a Salesforce cloud glyph in the nav) or accept it as a dead token carried for palette parity. Deliberate either way, not accidental. | Low |

### C3. `motion.ts`

Clean. Two notes and one thing worth stating because it is right and someone
will "fix" it later:

- `EASE = "power4.out"` and `EASE_CSS = cubic-bezier(0.22, 1, 0.36, 1)` **are**
  the same curve — GSAP's `power4` is quintic, and `(0.22, 1, 0.36, 1)` is the
  standard easeOutQuint bezier. Correct as written. Put that in a comment so
  nobody re-derives it.
- Add `gsap.defaults({ ease: EASE, duration: DUR_ENTER })` in this file. Right
  now every call site has to remember to pass them, which is how drift starts.
- `prefersReducedMotion()` reads the media query once per call and never
  listens for changes. Fine for this page; just do not cache the result at
  module scope.

### C4. `smoothScroll.ts`

The Lenis/GSAP ticker marriage is correct: `instance.raf(time * 1000)` handles
the seconds→ms conversion right, `lagSmoothing(0)` is the documented pairing,
and not creating Lenis at all under reduced motion is better than creating it
and disabling it. Three real bugs:

1. **The `load` listener can never fire.** If this initialises after the window
   `load` event has already fired — which happens on a warm cache, and will
   happen every time once the preloader delays mounting — `ScrollTrigger.refresh()`
   never runs and every trigger position is computed against pre-image layout.

   ```ts
   if (document.readyState === "complete") ScrollTrigger.refresh();
   else window.addEventListener("load", refresh);
   ```

2. **No refresh on font load.** PP Rader is a heavy display face at up to 128px.
   When it swaps in, every heading below it moves and all ScrollTrigger start
   positions go stale. Add `document.fonts.ready.then(() => ScrollTrigger.refresh())`.
   This is also half of your "no layout shift" DoD item.

3. Cleanup does not restore `gsap.ticker.lagSmoothing(1000, 33)`. Harmless on a
   single-page site, sloppy in a file you intend to carry to the next project.

`scrollToY` is currently exported and unused. Keep it if the nav CTA will ever
scroll to the waitlist form, which it now probably should. Otherwise delete it.

### C5. `CLAUDE.md`

Genuinely good. The "one permitted reference" section is the right response to
the stale-sibling-folder failure from the Zapier build. Fixes:

1. **`node_modules/next/dist/docs/` does not exist** in the published Next
   package. Claude Code will go looking, not find it, and then guess. Replace
   with: "If unsure about a Next 16 API, say so and ask, or check
   nextjs.org/docs. Do not guess."
2. Rule 2 needs scoping — the waitlist submit button is not inert.
3. Nothing in the file mentions `output: 'export'` or `basePath: '/forms'`.
   That is the deploy model. It belongs in the rules.
4. No rule about the no-JS `[data-fx]` failure mode.
5. No mention of the preloader.
6. Add a contrast floor to the Definition of Done. You already ask for keyboard
   reach and focus rings; AA contrast is the same class of thing and you have
   two live violations.

A revised `CLAUDE.md` is in this output folder.

---

## D. Still open after the 10/09 decisions

Five things, none of them blocking Phase 1.

### D1. Coming Soon buttons scroll to the waitlist. DECIDED 10/09/26.

The wireframe says *"For now the buttons wont go anywhere just say Coming
Soon"*, written before the waitlist existed. Label stays "Coming Soon", but
every install button now eases down to the form. Changes no copy and turns
three dead buttons into a funnel.

Route it through `scrollToY()` in `lib/smoothScroll.ts`, never
`window.scrollTo`, or it fights Lenis. This is also why `scrollToY` stops being
dead code (see C4).

Mention it to him in passing rather than asking, since it contradicts a line he
wrote. One sentence, framed as done.

### D2. One name field or two?

04/09 he said "just name and email". His annotated screenshot has First Name
and Last Name. Building two, per the screenshot. See A2.

### D3. The note line still mentions "the book"

Proposed cut is in A2. Needs a yes.

### D4. Metadata and OG

Nothing in the kit covers this and it is a Phase 6 item that gets forgotten.

- `metadataBase` must account for the basePath: `new URL("https://www.mvrk.ca/forms")`.
- OG image derived from the "f" mark, 1200x630, and referenced through the
  basePath, not as a bare `/og.png`.
- Favicon from the icon submark.
- `site.description` in config is already good copy for the meta description.
- Test the OG card against a real scraper after deploy. A subpath deploy is
  exactly where OG image paths quietly 404.

### D5. `--sf-cyan` and `--grey`

Both are carried in the palette and neither has a job yet. `BRIEF.md` §10 Q5
asks Vuk about the grey. Do not ask him. He gave you latitude on everything
outside the locked list, and two unused tokens is a decision you make, not a
question you send. Use them deliberately or accept them as parity carry-overs.

---

## E. Draft message to Vuk

Batched, options not open questions, per his style. Send before you start
Phase 1 so nothing blocks.

> Hey, before I go heads-down on the Forms site, few quick ones:
>
> 1. **Logos** — need the SVGs from the brand sheet (icon, wordmark, primary
>    lockup, monotone, both submarks). SVG not PNG, I'm animating the mark.
>    This is the one thing that actually blocks me.
> 2. **The video** — I'm giving it its own section right under the hero rather
>    than tucking it inside one of the four feature blocks, so it gets proper
>    weight and the four blocks stay matching. Building it with a placeholder
>    for now, drops straight in when you send it.
> 3. **Two small copy things on the form:** the note ends with "Like releasing
>    updated version of the book" which is from the free-book page. Want me to
>    just cut that last sentence? And you said name + email, but the form you
>    sent has First Name and Last Name separately. Going with two fields unless
>    you say otherwise.
> 4. **The Coming Soon buttons** — I've made them scroll down to the waitlist
>    form. Same label, they still don't install anything, just gives people
>    somewhere to go when they click. Shout if you'd rather they did nothing.
> 5. **Word speed** — you said 1.5s might be too long, so I've got it at 1.2s
>    per word. It's one number in the config file, so tell me faster or slower
>    once you see it live.
>
> Also, heads up on fonts: PP Rader and Neue Montreal are both paid faces. We
> got away with it on the Zapier page since that was basically a pitch asset,
> but this one's a public product site so it's worth either buying the licence
> or me swapping to a free equivalent that looks close. Your call, no rush,
> just flagging it before launch rather than after.

Deliberately not asked: the grey `#5E5E5E` question from BRIEF §10 Q5 and the
`--sf-cyan` question. Both are yours to decide. He gave you latitude; use it.
