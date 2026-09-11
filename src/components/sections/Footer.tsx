import Cta from "@/components/Cta";
import { brand, footer } from "@/config";
import { asset } from "@/lib/asset";
import styles from "./Footer.module.css";

/**
 * Band 6. --ink ground, centred, quiet. The page lands here; nothing on it
 * should ask for attention that the waitlist form above did not already get.
 *
 * The lockup is the white artwork, not the gradient one: the gradient's rose
 * end is 2.37:1 on --ink and would go muddy.
 */
export default function Footer() {
  return (
    <footer data-tone="ink" className={styles.footer}>
      <div className={`u-wrap ${styles.inner}`} data-fx data-fx-stagger>
        <img
          className={styles.lockup}
          src={asset(brand.lockupWhite)}
          alt={brand.alt}
          width={720}
          height={190}
          loading="lazy"
        />
        <p className={styles.tagline}>{footer.tagline}</p>
        <div>
          <Cta />
        </div>
        <p className={styles.copyright}>{footer.copyright}</p>
      </div>
    </footer>
  );
}
