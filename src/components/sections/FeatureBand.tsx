import BandHeading from "@/components/BandHeading";
import { Icon } from "@/components/icons";
import type { FeatureBand as Band } from "@/config";
import styles from "./FeatureBand.module.css";

/**
 * Bands 01 to 04. ONE component, ONE composition, rendered four times.
 *
 * ---------------------------------------------------------------------------
 * The four per-band "rhythms" are deleted, and this is the single biggest
 * improvement in the pass.
 *
 * They were: cards, a vertical stagger on a drawn connector, a pinned split
 * column, and full-width rows. On screen that produced band 02 with its
 * heading top-right and its items bottom-left and half the band empty; a
 * connector that rendered as disconnected dots and stray hairlines; and a pin
 * that had to be defeated at every breakpoint. Band 01 — eyebrow, big
 * left-aligned heading, three items in a row beneath — was the only one that
 * worked, so it is now the only one there is.
 *
 * Four different compositions was me being clever. More ideas made it worse.
 *
 * The bands now differ in exactly two ways, and nothing else:
 *
 *   ground    cream or plum, alternating, from `band.tone`
 *   items     on cream they sit in cards on --paper
 *             on plum they have no card, just a hairline above each
 *
 * That is enough. The eyebrow, the heading scale, the icon size, the band
 * padding, the entrance and the icon → title → subtitle order are identical in
 * all four, which is what makes them read as one page.
 * ---------------------------------------------------------------------------
 */
export default function FeatureBand({ band }: { band: Band }) {
  return (
    <section id={band.id} data-tone={band.tone} className={styles.band}>
      <div className={`u-wrap u-section ${styles.inner}`}>
        <BandHeading heading={band.heading} />

        {/* One trigger, children staggered. Three items in a row that each
            had their own trigger would arrive at visibly different times. */}
        <ul className={styles.items} data-fx data-fx-stagger>
          {band.items.map((item) => (
            <li key={item.title} className={styles.item}>
              <span className={styles.rule} aria-hidden="true" />
              <span className={styles.icon}>
                <Icon name={item.icon} />
              </span>
              <h3 className={`u-display u-h3 ${styles.title}`}>{item.title}</h3>
              <p className={`u-body ${styles.subtitle}`}>{item.subtitle}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
