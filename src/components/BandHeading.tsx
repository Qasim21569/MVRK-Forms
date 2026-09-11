import MaskText from "./MaskText";
import styles from "./BandHeading.module.css";

/**
 * The heading for a feature band. Identical in all four.
 *
 * THE NUMBERED EYEBROW IS REMOVED, at the client's direction. It was the mono
 * label above each heading — 01 BUILD, 02 THINK, 03 SHARE, 04 COLLECT — with
 * the number derived from the band's position in `config.bands`.
 *
 * `eyebrow` stays in config.ts untouched; nothing reads it now. It is Vuk's
 * copy to keep, and the band still knows its own order from the config array
 * if the labels are ever wanted back.
 *
 * The block keeps its `[data-fx-heading]` hook and stays one trigger for the
 * whole thing, driving the one effect that remains: the heading rising line by
 * line from under a mask.
 */
export default function BandHeading({ heading }: { heading: string }) {
  return (
    <div className={styles.block} data-fx-heading>
      <h2 className={`u-display u-h2 ${styles.heading}`}>
        <MaskText text={heading} />
      </h2>
    </div>
  );
}
