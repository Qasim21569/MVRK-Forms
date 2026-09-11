"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { hero } from "@/config";
import { onIntroRelease } from "@/lib/intro";
import {
  DUR_ENTER,
  DUR_MICRO,
  EASE_EXIT,
  EASE_MASK,
  gsap,
  prefersReducedMotion,
} from "@/lib/motion";
import styles from "./WordCycler.module.css";

/**
 * Line 1 of the hero, and the page's signature.
 *
 * 46 words in the exact order in config.ts, looping. "Free" recurs eleven
 * times as the anchor, roughly every fourth word — that repetition IS the
 * pitch, so nothing here dedupes, shuffles or reorders.
 *
 * THIS IS THE ONLY THING ON THE PAGE THAT MOVES FOREVER.
 *
 * The word is the SAME face, weight and size as the line under it — Outfit
 * 700, from .u-display. It used to be set in Instrument Serif italic to tell
 * the two lines apart, and two typefaces inside one headline read as a
 * mismatch rather than as a hierarchy.
 *
 * So the distinction is treatment, not type: the word carries the logo's
 * rose-to-plum gradient and the line below it is solid --ink. Same
 * letterforms, different material.
 *
 * A sheen used to sweep across each word as it arrived. It is gone — at 132px
 * it read as a gimmick rather than as craft.
 *
 * MOTION.md section 4:
 *   dwell   1600ms
 *   exit    yPercent 0 → -110, DUR_MICRO, power2.in
 *   enter   yPercent 110 → 0, DUR_ENTER, expo.out
 *   overlap next word starts 0.10s BEFORE the previous finishes exiting
 *   mask    overflow: hidden, height locked to one line
 *   width   NOT built. See the block below.
 *
 * ---------------------------------------------------------------------------
 * LINE 2 NEVER MOVES, AND NOTHING ANIMATES TO KEEP IT STILL.
 *
 * MOTION.md asks for the slot's width to be measured per word and tweened
 * between cached values. That is not built, deliberately: it animates a
 * layout-affecting property every 1.6 seconds for as long as the page is
 * open, which relaid out the hero on a loop and was the one permanent source
 * of jank on a page that is otherwise completely settled.
 *
 * And it was solving a problem this layout does not have. Line 1 and line 2
 * are separate blocks, both left-aligned, so line 2's position never depended
 * on the slot's width. The slot is simply full width, the words are absolutely
 * positioned at left: 0, and the mask clips vertically only. Geometry rules
 * the wobble out; no measurement, no cache, no resize rebuild, no tween.
 * ---------------------------------------------------------------------------
 *
 * Two states, and the STATIC one is what the server renders:
 *
 *   static   hero.staticWord ("Fast"), in normal flow. What you get with
 *            JavaScript off, with the bundle in flight, and under
 *            prefers-reduced-motion — where it never cycles at all.
 *   cycling  upgraded to on mount.
 *
 * Screen readers get "Fast Forms For Salesforce" once, not 46 announcements.
 */
export default function WordCycler() {
  const [cycling, setCycling] = useState(false);
  const wordsRef = useRef<HTMLSpanElement[]>([]);

  useGSAP(
    () => {
      // Under reduced motion we simply never leave the static state.
      if (prefersReducedMotion()) return;

      const els = wordsRef.current.filter(Boolean);
      if (els.length !== hero.words.length) return;

      setCycling(true);

      const dwell = hero.dwellMs / 1000;
      const n = els.length;

      gsap.set(els, { opacity: 0, yPercent: 110 });
      gsap.set(els[0], { opacity: 1, yPercent: 0 });

      const tl = gsap.timeline({
        repeat: -1,
        /*
         * Built paused and started on the intro's release.
         *
         * config.ts puts "Free" at index 0 deliberately — the whole gag is
         * that the headline keeps saying the product is free. Start this on
         * mount and by the time the curtain lifts it is several words deep,
         * so the first thing the visitor ever sees is "Fearless" rather than
         * the anchor word. Paused, then played from 0, guarantees the reveal
         * lands on "Free".
         */
        paused: true,
        // The first word holds for this long instead of a full dwell, so the
        // cycler picks up while the hero still has the visitor's attention.
        // Without a delay the first transition fires at t=0 and word one is
        // never seen.
        delay: hero.firstSwapMs / 1000,
      });

      els.forEach((el, i) => {
        const at = i * dwell;
        const next = (i + 1) % n;

        tl.to(
          el,
          { yPercent: -110, opacity: 0, duration: DUR_MICRO, ease: EASE_EXIT },
          at,
        ).fromTo(
          els[next],
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: DUR_ENTER, ease: EASE_MASK },
          // Overlap: the incoming word starts 0.10s before the outgoing one
          // has finished leaving. Without it the slot is briefly empty and
          // the line reads as a flicker rather than a swap.
          at + DUR_MICRO - 0.1,
        );
      });

      // Hold the timeline open for the last word's full dwell, or the loop
      // restarts the instant its entrance finishes.
      tl.set({}, {}, n * dwell);

      const off = onIntroRelease(() => tl.play(0));

      // useGSAP's context kills the timeline on unmount; this only has to
      // drop the listener if the component goes away mid-curtain.
      return off;
    },
    { dependencies: [] },
  );

  return (
    <span className={styles.line1} data-mode={cycling ? "cycling" : "static"}>
      <span className={styles.slot}>
        {/* In normal flow. Visible until JS upgrades the slot; after that it
            is the invisible spacer that locks the slot to one line's height. */}
        <span className={styles.spacer} aria-hidden={cycling || undefined}>
          {hero.staticWord}
        </span>

        <span className={styles.stack} aria-hidden="true">
          {hero.words.map((word, i) => (
            <span
              key={`${word}-${i}`}
              className={styles.word}
              ref={(el) => {
                if (el) wordsRef.current[i] = el;
              }}
            >
              {word}
            </span>
          ))}
        </span>
      </span>

      {/* Keeps the accessible name of the headline stable while the visible
          word changes every 1.6 seconds. */}
      {cycling ? <span className="u-sr">{hero.staticWord}</span> : null}
    </span>
  );
}
