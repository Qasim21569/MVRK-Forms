import { cta } from "@/config";
import CtaButton from "./CtaButton";

/** The id the whole page funnels into. Also set on the waitlist <section>. */
export const WAITLIST_ID = "waitlist";

/**
 * The one button on the page.
 *
 * It renders `cta.label` — "Coming Soon" — and it installs nothing. The
 * product is pre-launch, so instead of a dead click it eases the page down to
 * the waitlist form. Same label, three dead buttons turned into a funnel.
 *
 * At launch this becomes `cta.futureLabel` pointing at `cta.futureHref` (the
 * AppExchange listing). Both already exist in config; do not wire the href now.
 *
 * The magnetism is deleted. A button that drifts away from the pointer is a
 * button that is harder to click, and it was the only elastic ease on the
 * page for no gain. Hover is now the fill rising from below, in CSS — see
 * CtaButton.module.css.
 *
 * This wrapper is a server component; only the click handler needs the client.
 */
export default function Cta({
  variant = "page",
  className,
}: {
  variant?: "nav" | "page";
  className?: string;
}) {
  return (
    <CtaButton variant={variant} className={className} label={cta.label} />
  );
}
