"use client";

import { useEffect } from "react";
import {
  DUR_ENTER,
  EASE_MASK,
  SCROLL_START,
  STAGGER,
  TRAVEL,
  ScrollTrigger,
  gsap,
  prefersReducedMotion,
} from "@/lib/motion";
import { initSmoothScroll } from "@/lib/smoothScroll";
import { onIntroRelease } from "@/lib/intro";

/**
 * The page's scroll choreography, and the single Lenis mount.
 *
 * ---------------------------------------------------------------------------
 * TWO EFFECTS LIVE HERE, AND THAT IS THE WHOLE FILE.
 *
 *   data-fx / data-fx-stagger   item entrance: fade + 22px rise, once
 *   data-fx-heading             band heading rising line by line under a mask
 *
 * The other three of the page's five motions need no scroll position and are
 * not here: the word cycler (WordCycler.tsx), the CTA hover fill (CSS), and
 * the nav shrink (Nav.tsx).
 *
 * Deleted, on purpose, after looking at the built page:
 *
 *   the connector draw      it rendered as disconnected dots and stray
 *                           hairlines, and the band layout it required left
 *                           half of band 02 empty
 *   the number roll         motion nobody notices on a 12px label, and it
 *                           needed a CSS park that could strand the digits
 *   the magnetic CTA        a button that drifts away from the pointer is a
 *                           button that is harder to click
 *   the hero card parallax  the hero is 88vh; there was nowhere to travel
 *   the icon draw-on        twelve simultaneous stroke animations for a
 *                           quarter-second each. Not what was missing
 *   the hairline draws      only the deleted rhythms used them
 *
 * Modern is not many. Linear and Vercel run about three motions each; what
 * makes them read as expensive is confident type and tight spacing, and no
 * number of scroll effects substitutes for either. This file was 14KB.
 * ---------------------------------------------------------------------------
 *
 * What is kept and still load-bearing, from the defect-2 fix:
 *
 *  1. `fromTo` with `immediateRender: false`, never `gsap.from`. `from`
 *     applies the hidden state the instant the tween is created, so a trigger
 *     that never fires leaves the element hidden forever.
 *  2. Nothing above the fold is here at all. The hero is a server component
 *     with no timeline; its visibility is owned by no scroll position.
 *  3. The geometric failsafe below.
 *  4. `ScrollTrigger.refresh()` after `document.fonts.ready` and after Lenis
 *     is up, never on the next frame.
 *
 * Everything enters ONCE and settles. `once: true`, never a toggle.
 */

/** First sweep, once the page has finished loading. */
const FAILSAFE_MS = 1000;

/**
 * How long an element is allowed to sit hidden while it is DUE before the
 * failsafe steps in.
 *
 * This number is the whole fix for the scroll flicker. It has to be longer
 * than the slowest legitimate entrance, or the failsafe interrupts animations
 * it was only ever meant to rescue. The slowest is a staggered three-item
 * row: DUR_ENTER 0.7s + 2 x STAGGER 0.07s = 0.84s. 1400ms leaves real headroom
 * without letting a genuinely stuck element sit there noticeably.
 */
const GRACE_MS = 1400;

export default function ScrollFxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  /*
   * Lenis, gated on the intro curtain releasing the page.
   *
   * Declared FIRST on purpose. React runs effects in declaration order, so
   * Lenis is set up before the reveal effect below ever calls
   * ScrollTrigger.refresh(). That ordering is half of defect 2's fix.
   *
   * The gate matters because this mounts on hydration, which is well before
   * the curtain lifts. Lenis reading wheel events under an opaque sheet means
   * the visitor scrolls the hero out of frame while they cannot see it, and
   * the reveal opens onto the middle of the page.
   *
   * `onIntroRelease` checks the attribute before it adds a listener, so a
   * mount that happens after the release has already fired resolves
   * immediately instead of waiting for an event that is never coming again.
   */
  useEffect(() => {
    let teardown: (() => void) | undefined;
    const off = onIntroRelease(() => {
      teardown = initSmoothScroll();
    });
    return () => {
      off();
      teardown?.();
    };
  }, []);

  /*
   * The failsafe.
   *
   * Its own effect, importing nothing from GSAP and depending on neither
   * Lenis nor the reveal effect having run. If the animation layer throws on
   * line one, this still fires.
   *
   * ------------------------------------------------------------------------
   * THIS USED TO BE THE FLICKER.
   *
   * The previous version rescued anything whose top had passed 60% of the
   * viewport and whose opacity was still under 0.99 — which is also an exact
   * description of an element that is HALFWAY THROUGH ITS ENTRANCE. On a
   * quick scroll the throttled sweep would land mid-tween, snap the element
   * to opacity 1 and clear its transform, and GSAP would carry on writing
   * transform to an element the failsafe had just reset. On a staggered row
   * the later children were still at opacity 0, so the whole row popped at
   * once instead of stepping. That was the flicker, and it was mine.
   *
   * The fix is to distinguish "hidden and animating" from "hidden and stuck",
   * and the only honest discriminator is TIME. So an element has to be DUE,
   * and stay due and hidden for GRACE_MS, before anything touches it. A
   * working entrance finishes inside 0.84s and is never seen by this code.
   *
   * "Due" now means "past the trigger point", the same "top 82%" the
   * entrances use, rather than an arbitrary 60% — so the clock starts when
   * the tween should have started, not a third of a viewport later.
   * ------------------------------------------------------------------------
   *
   * Two kinds of hiding to undo: opacity, for the [data-fx] reveals, and
   * transform, for the masked heading words, where opacity stays at 1 and the
   * word is parked a line below its own clip.
   */
  useEffect(() => {
    let timer = 0;
    let throttle = 0;
    let recheck = 0;

    const SELECTOR = "[data-fx], [data-mask-word]";
    /** When each element first became due. Weak, so nothing is retained. */
    const dueSince = new WeakMap<Element, number>();

    const rescue = () => {
      const now = performance.now();
      const vh = window.innerHeight;
      let pending = false;

      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        const rect = el.getBoundingClientRect();

        // Same threshold the entrances trigger on, so the grace period starts
        // when the tween should have.
        const due = rect.top <= vh * 0.82 && rect.bottom > 0;
        if (!due) {
          dueSince.delete(el);
          return;
        }

        const cs = getComputedStyle(el);
        const hidden =
          parseFloat(cs.opacity) < 0.99 || cs.transform !== "none";
        if (!hidden) {
          dueSince.delete(el);
          return;
        }

        const since = dueSince.get(el);
        if (since === undefined) {
          dueSince.set(el, now);
          pending = true;
          return;
        }
        if (now - since < GRACE_MS) {
          pending = true;
          return;
        }

        // Due, hidden, and has been for longer than any real entrance takes.
        if (parseFloat(cs.opacity) < 0.99) el.style.opacity = "1";
        if (cs.transform !== "none") el.style.transform = "none";
        dueSince.delete(el);
      });

      // Something is inside its grace period. Look again after it expires,
      // in case the visitor has stopped scrolling and no scroll event is
      // coming to re-arm this.
      window.clearTimeout(recheck);
      if (pending) recheck = window.setTimeout(rescue, GRACE_MS + 100);
    };

    const onScroll = () => {
      if (throttle) return;
      throttle = window.setTimeout(() => {
        throttle = 0;
        rescue();
      }, 250);
    };

    const arm = () => {
      timer = window.setTimeout(rescue, FAILSAFE_MS);
      window.addEventListener("scroll", onScroll, { passive: true });
    };

    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(throttle);
      window.clearTimeout(recheck);
      window.removeEventListener("load", arm);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    // Nothing is hidden under reduced motion: the CSS override in globals.css
    // forces everything back to opacity 1 and transform none, so bailing here
    // leaves a complete, static page.
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      /* --- Item entrances --------------------------------------------- */
      gsap.utils.toArray<HTMLElement>("[data-fx]").forEach((el) => {
        const delay = parseFloat(el.dataset.fxDelay || "0");
        const staggered = el.dataset.fxStagger !== undefined;
        const targets = staggered ? Array.from(el.children) : [el];

        // A staggered container animates its children, so the container has
        // to come out from under the CSS opacity:0 first.
        if (staggered) gsap.set(el, { opacity: 1 });

        gsap.fromTo(
          targets,
          { opacity: 0, y: TRAVEL },
          {
            opacity: 1,
            y: 0,
            duration: DUR_ENTER,
            delay,
            stagger: staggered ? STAGGER : 0,
            // Never write the "from" state at creation time. This one flag is
            // the difference between a missed animation and a blank page.
            immediateRender: false,
            clearProps: "willChange,transform",
            scrollTrigger: { trigger: el, start: SCROLL_START, once: true },
          },
        );
      });

      /* --- Band headings ---------------------------------------------- *
       * The heading is split by word in the markup and grouped into LINES
       * here, from measured offsetTop. Words sharing a line share a delay,
       * so it reads as a line rising rather than words popping. Character
       * stagger on a 76px display face looks like a tutorial.
       * ---------------------------------------------------------------- */
      gsap.utils.toArray<HTMLElement>("[data-fx-heading]").forEach((block) => {
        const words = Array.from(
          block.querySelectorAll<HTMLElement>("[data-mask-word]"),
        );
        if (!words.length) return;

        // Rounded to 2px so sub-pixel baseline differences between glyphs
        // cannot split one line into two.
        const tops: number[] = [];
        const lineOf = words.map((word) => {
          const top = Math.round(word.offsetTop / 2) * 2;
          let line = tops.indexOf(top);
          if (line === -1) {
            tops.push(top);
            line = tops.length - 1;
          }
          return line;
        });

        words.forEach((word, i) => {
          gsap.fromTo(
            word,
            { yPercent: 108 },
            {
              yPercent: 0,
              duration: DUR_ENTER,
              ease: EASE_MASK,
              delay: lineOf[i] * 0.08,
              immediateRender: false,
              clearProps: "willChange,transform",
              scrollTrigger: {
                trigger: block,
                start: SCROLL_START,
                once: true,
              },
            },
          );
        });
      });
    });

    /*
     * Refresh at the right time, and only then. Fonts land late (PP Rader is
     * a heavy display face set at up to 132px) and every start position below
     * a heading goes stale when it swaps in. Lenis has to be running first or
     * ScrollTrigger measures against a scroll position nobody is driving yet.
     */
    let alive = true;

    /*
     * NEVER MEASURE WHILE THE INTRO HOLDS THE SCROLL LOCK.
     *
     * `html[data-intro-lock] { overflow: hidden }` makes the document
     * unscrollable. ScrollTrigger then computes maxScroll as 0 and every
     * trigger's start collapses to the top of the page — so a heading three
     * screens down is "already past its start" and its reveal is resolved
     * against a layout that does not exist yet.
     *
     * That was the bug behind the band headings sitting out of position on
     * load and snapping into place a few seconds later: the mask words stay
     * parked at translateY(108%) until their trigger fires properly, and the
     * only thing that eventually fixed the positions was a later refresh.
     *
     * So a refresh that lands during the lock is skipped. Nothing is lost:
     * the release handler below always refreshes once the lock is gone, and
     * that is the first measurement that can be correct anyway.
     */
    const refresh = () => {
      if (!alive) return;
      if (document.documentElement.hasAttribute("data-intro-lock")) return;
      ScrollTrigger.refresh();
    };

    const fonts = document.fonts?.ready ?? Promise.resolve();
    // 600ms cap: if the faces are slow, refresh anyway rather than leaving
    // every trigger unmeasured behind a promise that has not settled.
    Promise.race([fonts, new Promise((r) => setTimeout(r, 600))]).then(() => {
      requestAnimationFrame(refresh);
    });

    if (document.readyState === "complete") refresh();
    else window.addEventListener("load", refresh, { once: true });

    /*
     * And again when the curtain releases the page — which is also the moment
     * the scroll lock comes off, so this is the first refresh that can
     * measure a scrollable document. Any refresh deferred by the lock above
     * is replayed here.
     *
     * The whole page laid itself out under that lock and the display face may
     * have swapped in during the sequence, so every start position needs
     * recomputing regardless.
     */
    const offIntro = onIntroRelease(() => {
      // The lock is removed in the same function that fires this event, but
      // not necessarily before the listener runs, so give the attribute a
      // frame to actually be gone before measuring.
      requestAnimationFrame(refresh);
    });

    return () => {
      alive = false;
      offIntro();
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  return <>{children}</>;
}
