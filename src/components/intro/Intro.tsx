import ReactDOM from "react-dom";
import { site } from "@/config";
import { asset } from "@/lib/asset";
import {
  GAP_TO_ICON,
  ICON_H,
  ICON_OUTLINE_SRC,
  ICON_SRC,
  ICON_W,
  WORDMARK_H,
  WORDMARK_PATH,
  WORDMARK_TO_ICON,
  WORDMARK_W,
} from "./marks.generated";
import styles from "./Intro.module.css";

/**
 * The intro curtain.
 *
 * MARKUP ONLY. Every frame of motion is CSS `@keyframes` gated on the
 * `data-intro` attribute on <html>, and the whole state machine is the inline
 * boot script in layout.tsx. The script decides WHETHER and WHEN; the CSS
 * decides what it looks like; they communicate through one attribute.
 *
 * That split is the entire reason this works. It renders on the server, needs
 * no hydration, and cannot sit frozen waiting for React — which is exactly how
 * the first version of this on another project broke: the sheet appeared at
 * first paint and then nothing could move or dismiss it until the bundle had
 * downloaded and hydrated. No GSAP, no Framer, no React state.
 *
 * ---------------------------------------------------------------------------
 * THE SEQUENCE — four beats and a reveal.
 *
 *   1. The icon is CONSTRUCTED. Its outline is built first, revealed by a
 *      conic mask sweeping around the loop the mark is drawn on, and then the
 *      gradient artwork floods into the outline while the outline itself
 *      fades away. "The line becomes the shape" — the read PRELOADER.md
 *      section 4 is after, done with opacity on both sides because there is
 *      no vector geometry to stroke. See the CSS for the full note.
 *   2. The wordmark wipes in to its right, left to right behind a clip, with
 *      the artwork sliding slightly inside the clip as it goes. The whole
 *      lockup translates left at the same time, so the icon settles from
 *      optically-centred to its final position — a pure transform, so
 *      nothing reflows.
 *   3. The punchline rises from under a mask. It is `site.tagline` — already
 *      in config, already the line the footer uses. No new copy was invented.
 *
 *   A hairline used to draw between the lockup and the punchline. Removed: it
 *   was doing the job of a progress bar without measuring anything, and with
 *   the lockup this size it just cut the composition in half.
 *
 *   Then the reveal: the sheet TRANSLATES up on a deep curved hem while the
 *   lockup leaves faster than it does and the page beneath fades up. Three
 *   speeds, so it reads as depth rather than as one panel sliding.
 * ---------------------------------------------------------------------------
 *
 * THE LOCKUP'S PROPORTIONS ARE MEASURED, NOT CHOSEN. `WORDMARK_TO_ICON` and
 * `GAP_TO_ICON` come out of the real primary logo artwork — see the comment
 * on them in marks.generated.ts. The wordmark's box is 1.32x the icon's and
 * the two align at the TOP, because "BY MVRK" hangs below the icon's
 * baseline. Getting that wrong is why the wordmark read as far too small.
 *
 * `aria-hidden` on the whole thing: it is decorative, it is gone in under
 * four and a half seconds, and the tagline it shows is also in the footer as
 * real content.
 */
export default function Intro() {
  /*
   * The wordmark is on screen at 1140ms and the curtain's timers do not wait
   * for assets, so the browser is told about it as early as possible.
   *
   * ReactDOM.preload rather than a <link> in JSX: React hoists a rel=preload
   * link into <head> AND renders it where it was written, so writing it by
   * hand emitted the tag twice. This is the API for it, and it dedupes.
   *
   * Through asset(), because a bare /preload/... 404s under basePath.
   */
  ReactDOM.preload(asset(WORDMARK_PATH), {
    as: "image",
    type: "image/webp",
    fetchPriority: "high",
  });

  return (
    <div className={styles.curtain} aria-hidden="true">
      {/*
        Fill and hem live in ONE translated element, stacked in normal flow,
        so the sheet's own height is viewport + hem and `translateY(-100%)`
        clears both exactly. The hem therefore TRAVELS with its curve intact
        instead of being squashed flat by a scaleY, and there are no two
        animations to desync — which is the failure PRELOADER.md section 3
        warns about, where 50ms of drift detaches the skirt.
      */}
      <div className={styles.sheet}>
        <div className={styles.fill} />
        <svg
          className={styles.hem}
          viewBox="0 0 100 20"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 0 H100 Q50 40 0 0 Z" />
        </svg>
      </div>

      {/*
        data-intro-clock: the boot script listens for `animationstart` here to
        learn the exact moment the CSS timeline begins, and starts its own
        timers from that instant. This element carries `intro-settle`, which
        is the one animation with a 0ms delay — animationstart fires after a
        delay elapses, so hooking anything else would report late.
      */}
      <div className={styles.stage} data-intro-clock>
        <div className={styles.content}>
          <div
            className={styles.lockup}
            style={
              {
                "--wm-scale": WORDMARK_TO_ICON,
                "--gap-scale": GAP_TO_ICON,
                "--wm-ratio": WORDMARK_W / WORDMARK_H,
              } as React.CSSProperties
            }
          >
            {/*
              The icon is a data URI, not a file: its bytes are in the HTML
              document, so there is no request that could lose the race
              against a timer that fires at 140ms. That is the actual reason
              PRELOADER.md says "inline SVG, never <img>" — and the source
              files are base64 PNGs with zero vector paths, so there is no
              geometry to inline instead.
            */}
            <span className={styles.iconWrap}>
              {/* Built first, then faded out as the colour lands. */}
              <img
                className={styles.iconOutline}
                src={ICON_OUTLINE_SRC}
                width={ICON_W}
                height={ICON_H}
                alt=""
                decoding="sync"
              />
              {/* Floods in on top of the outline it was built into. */}
              <img
                className={styles.icon}
                src={ICON_SRC}
                width={ICON_W}
                height={ICON_H}
                alt=""
                decoding="sync"
              />
            </span>

            {/*
              The wordmark is a same-origin file, preloaded above. It is not
              needed until 1140ms, so it gets a second of head start, and
              inlining it would put ~50KB of base64 into every page's HTML.
            */}
            <span className={styles.wordmarkWrap}>
              <span className={styles.wordmarkClip}>
                <img
                  className={styles.wordmark}
                  src={asset(WORDMARK_PATH)}
                  width={WORDMARK_W}
                  height={WORDMARK_H}
                  alt=""
                  decoding="sync"
                />
              </span>
            </span>
          </div>

          <span className={styles.punchWrap}>
            <span className={styles.punch}>{site.tagline}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
