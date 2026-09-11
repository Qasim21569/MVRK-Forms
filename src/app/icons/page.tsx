import type { Metadata } from "next";
import { ICON_ORDER, Icon } from "@/components/icons";
import styles from "./page.module.css";

/**
 * The scratch page from CLAUDE.md rule 5.
 *
 * All twelve icons, together, AT 24px, in one row — which is the only size
 * that tells you anything. At 200px every icon looks fine; 24px is where a
 * custom set actually breaks. The bail-out criteria:
 *
 *   - two icons read as the same silhouette
 *   - any one of them needs a different stroke width or corner radius to work
 *   - the flow-chart, funnel or data-tray glyph is unreadable
 *
 * Any of those and the whole set swaps to Phosphor duotone, one weight, all
 * twelve from that one library. Not a fourth iteration.
 *
 * Shown on each of the three grounds they actually sit on, because --band-icon
 * changes underneath them, plus one oversized row for spotting drawing errors.
 */
export const metadata: Metadata = {
  title: "Icon set",
  robots: { index: false, follow: false },
};

const TONES = ["light", "plum", "ink"] as const;

export default function IconsPage() {
  return (
    <main>
      {TONES.map((tone) => (
        <section key={tone} data-tone={tone} className={styles.band}>
          <p className={`u-label ${styles.caption}`}>{tone} — 24px</p>
          <div className={styles.row}>
            {ICON_ORDER.map((name) => (
              <Icon key={name} name={name} />
            ))}
          </div>
        </section>
      ))}

      <section data-tone="light" className={styles.band}>
        <p className={`u-label ${styles.caption}`}>
          light — 96px, drawing errors only
        </p>
        <div className={styles.big}>
          {ICON_ORDER.map((name) => (
            <span key={name} className={styles.cell}>
              <Icon name={name} />
              <span className={`u-label ${styles.name}`}>{name}</span>
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
