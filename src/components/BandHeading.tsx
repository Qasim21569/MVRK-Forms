import MaskText from "./MaskText";
import styles from "./BandHeading.module.css";

/**
 * The eyebrow and heading for a feature band. Identical in all four.
 *
 * The number roll is deleted — two digits each in their own mask, staggered,
 * was motion nobody would notice on a 12px label, and it needed a CSS park
 * that could strand the digits if its trigger missed. The number is static
 * now. It is still derived from position, so renumbering the sequence is
 * reordering `config.bands` and nothing else.
 *
 * One trigger for the whole block, on `[data-fx-heading]`, driving the one
 * effect that stayed: the heading rising line by line from under a mask.
 * If the eyebrow and the heading each had their own ScrollTrigger they would
 * arrive at visibly different times.
 */
export default function BandHeading({
  index,
  eyebrow,
  heading,
}: {
  index: number;
  eyebrow: string;
  heading: string;
}) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <div className={styles.block} data-fx-heading>
      <p className={`u-label ${styles.eyebrow}`}>
        {/* Decorative: read out as part of the label the number would just be
            noise before every heading. */}
        <span className={styles.number} aria-hidden="true">
          {number}
        </span>
        <span className={styles.label}>{eyebrow}</span>
      </p>

      <h2 className={`u-display u-h2 ${styles.heading}`}>
        <MaskText text={heading} />
      </h2>
    </div>
  );
}
