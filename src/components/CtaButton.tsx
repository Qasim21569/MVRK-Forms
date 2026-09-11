"use client";

import { scrollToId } from "@/lib/smoothScroll";
import { WAITLIST_ID } from "./Cta";
import styles from "./CtaButton.module.css";

/**
 * The interactive half of the CTA. Client only because of the click handler —
 * the label comes down as a prop from the server component, so config.ts stays
 * the single source of the string.
 *
 * The scroll goes through scrollToY() in lib/smoothScroll.ts. Never
 * window.scrollTo: Lenis keeps animating toward its own target and drags the
 * page straight back.
 *
 * `.fillLabel` is the label a second time, sitting inside the rising fill.
 * That is how the hover works without animating a colour: one label rides up
 * and out, its duplicate rides up into place behind it, and the two are
 * always in the same position so nothing jumps. `aria-hidden` on the copy so
 * the button has one accessible name, not two.
 */
export default function CtaButton({
  variant,
  className,
  label,
}: {
  variant: "nav" | "page";
  className?: string;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`${styles.cta} ${styles[variant]} ${className ?? ""}`}
      // Clear the fixed nav so the form's first field is not tucked under it.
      onClick={() => scrollToId(WAITLIST_ID, 96)}
    >
      <span className={styles.fill} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
      <span className={styles.fillLabel} aria-hidden="true">
        {label}
      </span>
    </button>
  );
}
