import Cta from "@/components/Cta";
import HeroFormCard from "@/components/HeroFormCard";
import WordCycler from "@/components/WordCycler";
import { hero } from "@/config";
import styles from "./Hero.module.css";

/**
 * Band 1.
 *
 * Tint ground — the page's one cool moment — easing to cream at the foot so it
 * hands off without a seam. Headline left, product card right.
 *
 * Both lines are the SAME typeface, weight and size — Outfit 700, straight
 * from .u-display. The cycling word had been set in Instrument Serif italic
 * to distinguish it; two faces in one headline read as a mismatch rather than
 * as a hierarchy, so the distinction is now carried by treatment instead:
 * line 1 gets the logo's rose-to-plum gradient and line 2 is solid --ink.
 *
 * Same letterforms, different material. That is the one place the gradient
 * appears besides the logo artwork itself.
 *
 * ---------------------------------------------------------------------------
 * THIS IS A SERVER COMPONENT AND IT HAS NO LOAD TIMELINE. Both facts are the
 * fix for a real bug, not a simplification.
 *
 * The previous version wrapped line 2 in MaskText, and `[data-mask-word]` is
 * parked at `translateY(108%)` by CSS so a masked rise cannot flash before it
 * animates. Only the hero's own load timeline un-parked it. When that timeline
 * did not reach line 2, the product's name was invisible in its own hero and
 * the page showed nothing but a cycling adjective.
 *
 * The self-building hero sequence is deferred, so rather than patch the
 * timeline, line 2 is now plain text with no mask, no gate and nothing to
 * un-park. The hero paints complete and correct with the bundle absent, with
 * JavaScript off, and under reduced motion, and the only thing that moves in
 * it is the word cycler.
 *
 * Deleted with the timeline: the hero card parallax, and a hardcoded eyebrow
 * string that was never in config.ts.
 * ---------------------------------------------------------------------------
 */
export default function Hero() {
  return (
    <section id="hero" data-tone="tint" className={styles.hero}>
      <div className={`u-wrap ${styles.inner}`}>
        <div className={styles.copy}>
          <h1 className={`u-display u-h1 ${styles.headline}`}>
            <span className={styles.line1}>
              <WordCycler />
            </span>
            <span className={styles.line2}>{hero.line2}</span>
          </h1>

          <p className={`u-lead ${styles.subhead}`}>{hero.subhead}</p>

          <div className={styles.action}>
            <Cta />
          </div>
        </div>

        <div className={styles.cardSlot}>
          <HeroFormCard />
        </div>
      </div>
    </section>
  );
}
