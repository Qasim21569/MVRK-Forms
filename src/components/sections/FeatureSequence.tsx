import { bands, org } from "@/config";
import FeatureBand from "./FeatureBand";
import styles from "./FeatureSequence.module.css";

/**
 * Bands 01 to 04, bracketed by the org boundary.
 *
 * The four bands are not four features, they are one form's life: Build,
 * Think, Share, Collect, in the order the client wrote them.
 *
 * ---------------------------------------------------------------------------
 * THE ORG BOUNDARY, rebuilt. The product's real pitch is not "we have a form
 * builder", it is that the data never leaves Salesforce — so every step of the
 * form's life visibly happens inside the org.
 *
 * The previous version was a sticky rounded rectangle at 58% plum, inset from
 * the gutters, holding for the whole sequence. On screen it read as an
 * accident: a faint rounded box you noticed and then dismissed.
 *
 * It is now two full-width 1px --plum rules, one opening and one closing, with
 * the mono label sitting on the opening rule. Both rules sit on a cream strip,
 * because the closing one lands after a plum band and a plum hairline on plum
 * is invisible. It reads as a bracket: you go in here, you come out here.
 *
 * There is no sticky, no pin, no ScrollTrigger and no JavaScript. This is a
 * server component. The page's one memorable device is now present for a
 * visitor whose bundle never arrives, which is the point of rule 9, and there
 * is nothing left in it that can strand or misfire.
 *
 * The closing label from MOTION.md is not built. There is no second string for
 * it, and repeating YOUR SALESFORCE ORG at the foot reads as a duplication
 * bug. A previous pass had invented "still inside your org" for it; that is
 * gone, because rule 1 says you ask rather than invent.
 * ---------------------------------------------------------------------------
 */
export default function FeatureSequence() {
  return (
    <div className={styles.sequence}>
      {/*
        aria-hidden on the rules, not the label: the label is the only part
        that carries meaning, and it is a real claim about the product.
      */}
      <div className={styles.bracket} data-edge="open">
        <span className={styles.rule} aria-hidden="true" />
        {org.label ? (
          <span className={`u-label ${styles.label}`}>{org.label}</span>
        ) : null}
      </div>

      {bands.map((band, i) => (
        <FeatureBand key={band.id} band={band} index={i} />
      ))}

      <div className={styles.bracket} data-edge="close">
        <span className={styles.rule} aria-hidden="true" />
      </div>
    </div>
  );
}
