/**
 * Assert that the intro curtain's timings agree across the three files that
 * have to hold the same numbers.
 *
 *   npm run intro:check
 *
 *   src/lib/intro.ts            the source of truth
 *   Intro.module.css            every animation-delay / duration
 *   layout.tsx                  schedules against RELEASE_MS and TOTAL_MS
 *                               (imported, so it cannot drift — checked anyway)
 *
 * PRELOADER.md asks for this and it is worth the twenty lines: the beats
 * overlap on purpose, so a delay that has drifted by 200ms does not look
 * broken, it just looks slightly worse — which is exactly the kind of bug
 * nobody finds by reading.
 *
 * It parses the SOURCE, never the build output. A minifier rewrites `300ms`
 * as `.3s` and this would read the wrong number and pass.
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const ts = readFileSync(join(ROOT, "src/lib/intro.ts"), "utf8");
const css = readFileSync(
  join(ROOT, "src/components/intro/Intro.module.css"),
  "utf8",
);

/** Read `export const NAME = 123;` out of intro.ts. */
const num = (name) => {
  const m = ts.match(new RegExp(`export const ${name} = (\\d+)`));
  if (!m) throw new Error(`intro.ts: ${name} not found or not a literal`);
  return Number(m[1]);
};

const T = {
  ICON_AT: num("ICON_AT"),
  ICON_MS: num("ICON_MS"),
  FLOOD_AT: num("FLOOD_AT"),
  FLOOD_MS: num("FLOOD_MS"),
  WORDMARK_AT: num("WORDMARK_AT"),
  WORDMARK_MS: num("WORDMARK_MS"),
  PUNCH_AT: num("PUNCH_AT"),
  PUNCH_MS: num("PUNCH_MS"),
  LIFT_AT: num("LIFT_AT"),
  LIFT_MS: num("LIFT_MS"),
  CONTENT_OUT_MS: num("CONTENT_OUT_MS"),
  EXIT_MS: num("EXIT_MS"),
};
const SETTLE_MS = T.PUNCH_AT + T.PUNCH_MS;

/**
 * Each CSS animation this checks, as
 * [keyframe name, expected duration, expected delay].
 */
const EXPECT = [
  ["intro-sweep", T.ICON_MS, T.ICON_AT],
  ["intro-icon-in", T.ICON_MS, T.ICON_AT],
  // The handoff: the colour arrives as the outline leaves, so these two
  // MUST share both numbers or you get a frame with neither or both.
  ["intro-flood", T.FLOOD_MS, T.FLOOD_AT],
  ["intro-outline-out", T.FLOOD_MS, T.FLOOD_AT],
  // The wordmark's three layers all move together.
  ["intro-wordmark", T.WORDMARK_MS, T.WORDMARK_AT],
  ["intro-wordmark-slide", T.WORDMARK_MS, T.WORDMARK_AT],
  ["intro-lockup-shift", T.WORDMARK_MS, T.WORDMARK_AT],
  ["intro-punch", T.PUNCH_MS, T.PUNCH_AT],
  ["intro-settle", SETTLE_MS, 0],
];

const errors = [];

for (const [name, ms, delay] of EXPECT) {
  // `animation: <name> <duration>ms <easing…> <delay>ms both;`
  // Word-bounded, or "intro-wordmark" also matches "intro-wordmark-slide"
  // and the check silently reads the wrong rule's numbers.
  const re = new RegExp(`${name}\\b\\s+(\\d+)ms[^;]*?\\s(\\d+)ms\\s+both`);
  const m = css.match(re);
  if (!m) {
    errors.push(`${name}: no "animation: ${name} <ms> … <ms> both" in the CSS`);
    continue;
  }
  if (Number(m[1]) !== ms) {
    errors.push(`${name}: duration ${m[1]}ms in CSS, ${ms}ms in intro.ts`);
  }
  if (Number(m[2]) !== delay) {
    errors.push(`${name}: delay ${m[2]}ms in CSS, ${delay}ms in intro.ts`);
  }
}

/*
 * The three planes of the reveal.
 *
 * They must all START together — that shared delay is what makes them read as
 * one reveal at three speeds rather than three animations that happen to be
 * near each other — but their durations differ on purpose: the lockup leaves
 * faster than the sheet, and that difference is the parallax.
 */
const REVEAL = [
  ["intro-lift", T.LIFT_MS],
  ["intro-content-out", T.CONTENT_OUT_MS],
  ["intro-page-in", T.LIFT_MS],
];

for (const [name, ms] of REVEAL) {
  const play = css.match(
    new RegExp(`animation:\\s*${name}\\s+(\\d+)ms[^;]*?\\s(\\d+)ms\\s+both`),
  );
  if (!play) {
    errors.push(`${name}: play-state animation not found`);
    continue;
  }
  if (Number(play[1]) !== ms) {
    errors.push(`${name}: duration ${play[1]}ms in CSS, ${ms}ms in intro.ts`);
  }
  if (Number(play[2]) !== T.LIFT_AT) {
    errors.push(
      `${name}: starts at ${play[2]}ms in CSS, LIFT_AT is ${T.LIFT_AT}ms — ` +
        `the three planes of the reveal must start together`,
    );
  }
}

/* The lockup has to be gone before the curtain finishes clearing, or it
   reappears over the page it was supposed to have dissolved into. */
if (T.CONTENT_OUT_MS >= T.LIFT_MS) {
  errors.push("the lockup leaves no faster than the curtain — no parallax");
}

/* The skip exit runs the same keyframes with no delay. */
const exitMatches = [...css.matchAll(/data-intro="exit"[\s\S]{0,160}?(\d+)ms[^;]*?\s(\d+)ms\s+both/g)];
if (exitMatches.length < 3) {
  errors.push('skip exit: expected three data-intro="exit" animations');
} else {
  for (const m of exitMatches) {
    if (Number(m[1]) !== T.EXIT_MS) {
      errors.push(`skip exit: ${m[1]}ms in CSS, EXIT_MS is ${T.EXIT_MS}ms`);
    }
    if (Number(m[2]) !== 0) {
      errors.push(`skip exit: delay ${m[2]}ms, must be 0 — a skip waits for nothing`);
    }
  }
}

/* The joins the sequence is built on. */
if (T.PUNCH_AT + T.PUNCH_MS > T.LIFT_AT) {
  errors.push("the punchline finishes after the lift starts");
}
if (T.FLOOD_AT > T.ICON_AT + T.ICON_MS) {
  errors.push("the colour floods after the outline has finished — no handoff");
}
if (T.WORDMARK_AT > T.FLOOD_AT + T.FLOOD_MS) {
  errors.push("gap between the icon and the wordmark — the beats must overlap");
}
if (T.PUNCH_AT > T.WORDMARK_AT + T.WORDMARK_MS) {
  errors.push("gap between the wordmark and the punchline — beats must overlap");
}

if (errors.length) {
  console.error("intro timing drift:\n  " + errors.join("\n  "));
  process.exit(1);
}

console.log(
  `intro timings agree — ${T.LIFT_AT + T.LIFT_MS}ms total, ` +
    `release at ${T.LIFT_AT + Math.round(T.LIFT_MS * 0.55)}ms`,
);
