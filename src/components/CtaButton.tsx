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
 * ---------------------------------------------------------------------------
 * THE RISING PLUM FILL AND ITS DUPLICATE LABEL ARE GONE. They were two bugs
 * wearing one effect.
 *
 * The fill was a --plum panel that slid up over the rose on hover, so the
 * button changed colour — which is the thing that was not wanted.
 *
 * The duplicate label was parked at `translate: 0 120%`, and 120% is of the
 * LABEL's own height, not the button's. At 17px/1.55 the label box is ~26px
 * and the page button is 52px tall, so the copy waited 31px down inside a
 * 52px box and about 8px of it sat visible below the real label. That is the
 * clipped second "Coming Soon" under every button. `overflow: hidden` could
 * not save it because the duplicate never left the button's own box.
 *
 * The button is now one label on one colour, and hover is a lift rather than
 * a repaint.
 * ---------------------------------------------------------------------------
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
      {label}
    </button>
  );
}
