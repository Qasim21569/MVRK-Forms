/**
 * The intro curtain's timing system, and the gate the rest of the page waits on.
 *
 * ===========================================================================
 * THESE NUMBERS EXIST IN TWO PLACES AND MUST AGREE.
 *
 * Here, and as `animation-delay` / `animation-duration` in Intro.module.css.
 * `npm run intro:check` parses both files and fails if a join has drifted, so
 * change a number here and run it. It parses the SOURCE, not the build output:
 * a minifier rewrites `300ms` as `.3s` and the check would read the wrong file.
 *
 * Two joins are deliberate and worth not "tidying":
 *
 *   The rule finishes exactly as the punchline starts, and the punchline
 *   finishes well before the lift, so the sequence resolves into its exit
 *   rather than stopping and leaving a pause.
 *
 *   Beats OVERLAP. The wordmark starts at 1140 while the icon's sweep runs to
 *   1240; the punchline starts at 1960 as the rule lands at 2100. A hard gap
 *   between two beats reads as two separate animations — the overlap is what
 *   makes each one a handoff.
 * ===========================================================================
 *
 * ON TOTAL DURATION, because this is the one number worth arguing about.
 *
 * 4520ms. The brief said "like 4–5 seconds", and this sits inside that:
 *
 *   PRELOADER.md records Vuk's own calibration. He saw the Zapier loader at
 *   2.8s and said "It's the perfect speed... but too fast not too slow" —
 *   so 2.8s is this client's measured number and his stated bias is toward
 *   faster. 4520ms buys the extra beats the brief asked for (the
 *   wordmark handoff and the punchline) plus a 1.2s reveal rather than a
 *   0.8s one.
 *
 *   Anything approaching 45 seconds would not be a brand moment, it would be
 *   a broken page. Read literally that is 17x Vuk's number, on a product page
 *   whose entire pitch is that the thing feels fast, and a visitor would
 *   assume the site had hung and close the tab long before the reveal.
 *
 * LIFT_AT is the hold; raise it and everything downstream follows.
 */

/* --- The beats, in ms from the start of the sequence ------------------- */

/**
 * Beat 1a — the icon's OUTLINE is built.
 *
 * A conic mask sweeps around the mark, so the outline appears along the loop
 * it is drawn on. The mark is one continuous ribbon, which is why an angular
 * reveal reads as construction rather than as a wipe.
 */
export const ICON_AT = 140;
export const ICON_MS = 1000;

/**
 * Beat 1b — the colour floods into the outline it just built.
 *
 * Starts at 940, while the sweep still has 200ms to run, so the last of the
 * outline is still arriving as the first of the colour lands. The outline
 * fades out across the same window: the real mark has no outline, so leaving
 * it would double every edge.
 *
 * This is "the line becomes the shape", which is the read PRELOADER.md
 * section 4 is after.
 */
export const FLOOD_AT = 940;
export const FLOOD_MS = 620;

/** Beat 2 — the wordmark wipes in and the lockup re-centres as it does. */
export const WORDMARK_AT = 1400;
export const WORDMARK_MS = 820;

/**
 * Beat 3 — the punchline, site.tagline, rises under a mask.
 *
 * A hairline used to draw between the lockup and this, as beat 3. It is gone:
 * it was a progress bar that measured nothing, and at the lockup's current
 * size it cut the composition in half.
 */
export const PUNCH_AT = 2120;
export const PUNCH_MS = 520;

/** The container settle runs across the whole assembly and ends with it. */
export const SETTLE_MS = PUNCH_AT + PUNCH_MS;

/* --- The reveal -------------------------------------------------------- */

/**
 * The curtain leaves.
 *
 * 1200ms, and it TRANSLATES rather than scaling. That is the difference
 * between a curved hem that keeps its shape as it rises and one that flattens
 * out as it goes — a scaleY squashes the drape into a straight line on the
 * way up, which is the opposite of the reference.
 *
 * Long and eased at both ends on purpose. A large object leaving quickly
 * reads as a cut; the same object leaving over 1.2s on an in-out curve reads
 * as a reveal. This is the "smoother" the brief asked for.
 */
export const LIFT_AT = 3320;
export const LIFT_MS = 1200;

/**
 * The lockup leaves faster than the curtain, so the sheet outruns it upward
 * and the two move at visibly different speeds. One plane is not enough to
 * feel like depth; two is.
 */
export const CONTENT_OUT_MS = 760;

/**
 * The page beneath fades up across the whole lift, so the site ARRIVES rather
 * than being uncovered.
 *
 * Opacity only, and that is deliberate rather than lazy: a scale or a
 * translate on the page wrapper changes every element's measured position,
 * and ScrollTrigger.refresh() fires mid-lift — it would measure a transformed
 * layout and compute every trigger start against geometry that is about to
 * stop existing.
 */
export const PAGE_IN_MS = LIFT_MS;

/** Total, and the two values the boot script schedules against. */
export const TOTAL_MS = LIFT_AT + LIFT_MS;

/**
 * When the page below is cut loose. Deliberately MID-LIFT, at 55% of it, so
 * the hero is already free while the curtain is still moving — the reveal
 * opens into a page that is arriving, not one found already settled.
 */
export const RELEASE_MS = LIFT_AT + Math.round(LIFT_MS * 0.55);

/** The shortened lift used when a visitor skips. */
export const EXIT_MS = 400;

/* --- Coordination ------------------------------------------------------ */

export const INTRO_RELEASE_EVENT = "mvrkforms:intro-release";
export const INTRO_STORAGE_KEY = "mvrkforms:intro-played";

/**
 * Run `cb` once the curtain has released the page, or immediately if there is
 * no curtain to wait for.
 *
 * ATTRIBUTE FIRST, then the listener. A component that mounts after the
 * release event has already fired must resolve immediately rather than wait
 * forever for an event that is never coming again — the attribute is the
 * durable record and the event is only the notification. Event-only
 * coordination has a race, and it is the race that leaves a page with smooth
 * scroll permanently disabled.
 *
 * Returns its own cleanup.
 */
export function onIntroRelease(cb: () => void): () => void {
  if (typeof document === "undefined") return () => {};

  const root = document.documentElement;
  const playing =
    root.getAttribute("data-intro") === "play" &&
    !root.hasAttribute("data-intro-released");

  // No curtain, already released, or the boot script never ran at all.
  if (!playing) {
    cb();
    return () => {};
  }

  document.addEventListener(INTRO_RELEASE_EVENT, cb, { once: true });
  return () => document.removeEventListener(INTRO_RELEASE_EVENT, cb);
}
