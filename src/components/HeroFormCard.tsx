import { heroCard } from "@/config";
import styles from "./HeroFormCard.module.css";

/**
 * The hero's subject.
 *
 * ---------------------------------------------------------------------------
 * It is no longer a bare form card. It is a form INSIDE A SALESFORCE APP
 * WINDOW, and that change is the whole point of this pass.
 *
 * The page's actual pitch is that the data never leaves Salesforce, and until
 * now that claim was made only in words. A floating form card said "we make
 * forms", which any of a dozen competitors could say. A form sitting inside an
 * app chrome — cloud mark, object tab, record header — says "this runs where
 * your data already lives", which is the one thing only this product can say.
 *
 * That is also the single legitimate use of --sf-cyan on the page. Rule 4
 * reserves it to mark Salesforce and nothing else; a Salesforce cloud glyph is
 * exactly that, and it resolves the token from "carried but unused" to
 * "used once, deliberately".
 *
 * Two planes: a blank paper card offset behind, tilted the other way, and the
 * window in front. The back plane carries no content, so it invents no copy —
 * it is there to say "there are more of these" and to give the hero some
 * depth without a third colour or a bigger shadow.
 * ---------------------------------------------------------------------------
 *
 * Built entirely in CSS and one inline SVG, so there is no asset to wait on
 * and nothing to reflow. When the real product screenshot lands it replaces
 * the window's body and the chrome stays.
 *
 * The labels come from `config.heroCard`, not from here: they are the labels
 * inside a picture of a form rather than page copy, but rule 1 still says a
 * component never holds a string, and Vuk should be able to see what the
 * mockup claims.
 *
 * `aria-hidden`: it is a picture of an app, not an app. Announcing three fake
 * fields and a fake submit button would be worse than announcing nothing, and
 * the real form is one scroll away.
 */
export default function HeroFormCard() {
  return (
    <div className={styles.stack} aria-hidden="true">
      {/* Back plane. Deliberately empty. */}
      <div className={styles.behind} />

      <div className={styles.window}>
        <div className={styles.chrome}>
          {/* The Salesforce cloud. The one place --sf-cyan is used. */}
          <svg className={styles.cloud} viewBox="0 0 24 16" aria-hidden="true">
            <path d="M9.6 3.1a4.2 4.2 0 0 1 6.5.7 3.6 3.6 0 0 1 4.6 3.4 3.6 3.6 0 0 1-3.7 3.5H7.1a3.9 3.9 0 0 1-.5-7.7 4.2 4.2 0 0 1 3-.9z" />
          </svg>

          <span className={styles.tab}>{heroCard.title}</span>

          <span className={styles.status}>{heroCard.badge}</span>
        </div>

        <div className={styles.body}>
          {heroCard.fields.map((label, i) => (
            <div key={label || i} className={styles.field}>
              <span className={styles.fieldLabel}>{label}</span>
              <span className={styles.input} />
            </div>
          ))}

          <span className={styles.submit}>{heroCard.submit}</span>
        </div>
      </div>
    </div>
  );
}
