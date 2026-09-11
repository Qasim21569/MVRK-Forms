import { bands } from "@/config";
import FeatureBand from "./FeatureBand";
import styles from "./FeatureSequence.module.css";

/**
 * Bands 01 to 04.
 *
 * The four bands are not four features, they are one form's life: Build,
 * Think, Share, Collect, in the order the client wrote them.
 *
 * ---------------------------------------------------------------------------
 * THE ORG BOUNDARY IS REMOVED, at the client's direction.
 *
 * It was two full-width 1px --plum rules on cream strips, opening and closing
 * the sequence, with the mono YOUR SALESFORCE ORG label sitting on the opening
 * rule like a fieldset legend. The intent was to show that every step of the
 * form's life happens inside the org.
 *
 * Both rules go, not just the labelled one. The device only ever read as a
 * bracket — you go in here, you come out here — so a closing rule left on its
 * own is a stray hairline across the page with nothing to close.
 *
 * `org` stays in config.ts untouched. Nothing reads it now, but it is Vuk's
 * copy to keep, and deleting a string from config to satisfy a layout change
 * is backwards.
 * ---------------------------------------------------------------------------
 */
export default function FeatureSequence() {
  return (
    <div className={styles.sequence}>
      {bands.map((band) => (
        <FeatureBand key={band.id} band={band} />
      ))}
    </div>
  );
}
