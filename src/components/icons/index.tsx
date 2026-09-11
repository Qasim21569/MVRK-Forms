import type { IconName } from "@/config";

/**
 * The twelve feature icons.
 *
 * ONE SET, ONE STYLE. All twelve are drawn on the same 24px grid, all
 * stroke-only, all `currentColor`, all inheriting the same stroke width, cap
 * and join from `.u-icon` in globals.css — so a change to the set is one
 * declaration, not twelve. No fills anywhere, no mixed libraries, nothing
 * that reads as an emoji. The client asked for this explicitly:
 *
 *   "All icons we select should have clear style parity with each other and I
 *    don't want them looking emoji like. We can do better than that."
 *
 * Judge them at 24px, together, on /icons — not at 200px where anything looks
 * fine. CLAUDE.md rule 5 defines the bail-out to Phosphor duotone if the set
 * fails there.
 *
 * The three round ones — palette, gear, magnifier — are the set's weak point,
 * because a circle at 24px is a circle. They are pulled apart deliberately:
 * the palette keeps a flat notch and a ring of holes, the gear's outline is
 * broken by spokes, and the magnifier's ring is smaller, sits high-left, and
 * carries a heavy handle.
 */

type Props = { className?: string };

const svg = (children: React.ReactNode, className?: string) => (
  <svg
    className={`u-icon ${className ?? ""}`}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

/* --- Creative Design ------------------------------------------------ */

/** Computer mouse. Tall capsule; nothing else in the set is this narrow. */
export const MouseIcon = ({ className }: Props) =>
  svg(
    <>
      <rect x="6.75" y="2.25" width="10.5" height="19.5" rx="5.25" />
      <path d="M12 6.25v3.5" />
    </>,
    className,
  );

/** Speech bubble. Wide rounded rect with a tail bottom-left. */
export const SpeechBubbleIcon = ({ className }: Props) =>
  svg(
    <>
      <path d="M4 8.25A3.25 3.25 0 0 1 7.25 5h9.5A3.25 3.25 0 0 1 20 8.25v5.5A3.25 3.25 0 0 1 16.75 17H11l-4.1 3.1a.5.5 0 0 1-.8-.4V17h-.2A2 2 0 0 1 4 15z" />
      <path d="M8.75 11h6.5" />
    </>,
    className,
  );

/** Painter's palette. Flat notch on the right, ring of holes, thumb hole. */
export const PaletteIcon = ({ className }: Props) =>
  svg(
    <>
      <path d="M12 3.1a8.9 8.9 0 0 0 0 17.8c1.28 0 2-.79 2-1.77 0-1.44 1.02-2.23 2.4-2.23h2.05A3.55 3.55 0 0 0 22 13.3C21.55 7.6 17.3 3.1 12 3.1Z" />
      <path d="M7.4 12.6h.01M9.1 8.6h.01M13.2 7.1h.01M17.1 9.6h.01" />
    </>,
    className,
  );

/* --- Intelligent Automation ----------------------------------------- */

/** Decision flow chart. Diamond splitting to two nodes. */
export const FlowChartIcon = ({ className }: Props) =>
  svg(
    <>
      <path d="M12 2.4 15.6 6 12 9.6 8.4 6z" />
      <path d="M12 9.6v2.15M6.3 14.6v-1.35a1.5 1.5 0 0 1 1.5-1.5h8.4a1.5 1.5 0 0 1 1.5 1.5v1.35" />
      <rect x="3.3" y="14.6" width="6" height="6" rx="1.5" />
      <rect x="14.7" y="14.6" width="6" height="6" rx="1.5" />
    </>,
    className,
  );

/** Gear. Broken outline: eight spokes around a small hub. */
export const GearIcon = ({ className }: Props) =>
  svg(
    <>
      <circle cx="12" cy="12" r="3.3" />
      <path d="M12 2.6v3.1M12 18.3v3.1M21.4 12h-3.1M5.7 12H2.6M18.65 5.35l-2.2 2.2M7.55 16.45l-2.2 2.2M18.65 18.65l-2.2-2.2M7.55 7.55l-2.2-2.2" />
    </>,
    className,
  );

/** Chain link. Two capsules on the same diagonal. */
export const ChainLinkIcon = ({ className }: Props) =>
  svg(
    <>
      <path d="M9.6 14.4 14.4 9.6" />
      <path d="M8.5 10.8 6.6 12.7a3.75 3.75 0 0 0 5.3 5.3l1.9-1.9" />
      <path d="M15.5 13.2l1.9-1.9a3.75 3.75 0 0 0-5.3-5.3l-1.9 1.9" />
    </>,
    className,
  );

/* --- Secure Sharing -------------------------------------------------- */

/** Cloud. The only lobed silhouette in the set. */
export const CloudIcon = ({ className }: Props) =>
  svg(
    <path d="M7.4 19.4a4.65 4.65 0 0 1-.7-9.25 6.15 6.15 0 0 1 11.55.9A4.05 4.05 0 0 1 17.4 19.4z" />,
    className,
  );

/** Checked checkbox. Square with a tick. */
export const CheckboxIcon = ({ className }: Props) =>
  svg(
    <>
      <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4.2" />
      <path d="M8.2 12.15 10.9 14.85 15.9 9.3" />
    </>,
    className,
  );

/** Right arrow. */
export const ArrowRightIcon = ({ className }: Props) =>
  svg(
    <>
      <path d="M3.6 12h16.2" />
      <path d="M13.9 5.9 20 12l-6.1 6.1" />
    </>,
    className,
  );

/* --- Clean Data ------------------------------------------------------ */

/** Magnifying glass. Small ring, high-left, heavy handle. */
export const MagnifierIcon = ({ className }: Props) =>
  svg(
    <>
      <circle cx="10.4" cy="10.4" r="6.1" />
      <path d="M14.85 14.85 20.6 20.6" />
    </>,
    className,
  );

/** Funnel. The only downward-tapering silhouette. */
export const FunnelIcon = ({ className }: Props) =>
  svg(
    <path d="M3.4 5.35a1 1 0 0 1 1-1.35h15.2a1 1 0 0 1 1 1.35L14.4 13v6.35a1 1 0 0 1-1.45.9l-2.4-1.2a1 1 0 0 1-.55-.9V13z" />,
    className,
  );

/** Data tray. Wide box with the notch cut into its lip. */
export const TrayIcon = ({ className }: Props) =>
  svg(
    <>
      <path d="M3.4 13.4h4.15l1.3 2.35h6.3l1.3-2.35h4.15" />
      <path d="M3.4 13.4 6 5.6a1.9 1.9 0 0 1 1.8-1.3h8.4A1.9 1.9 0 0 1 18 5.6l2.6 7.8v4.6a2.1 2.1 0 0 1-2.1 2.1H5.5a2.1 2.1 0 0 1-2.1-2.1z" />
    </>,
    className,
  );

/* --- Lookup ---------------------------------------------------------- */

const SET: Record<IconName, (p: Props) => React.ReactElement> = {
  mouse: MouseIcon,
  "speech-bubble": SpeechBubbleIcon,
  palette: PaletteIcon,
  "flow-chart": FlowChartIcon,
  gear: GearIcon,
  "chain-link": ChainLinkIcon,
  cloud: CloudIcon,
  checkbox: CheckboxIcon,
  "arrow-right": ArrowRightIcon,
  magnifier: MagnifierIcon,
  funnel: FunnelIcon,
  tray: TrayIcon,
};

/** Every icon on the page, in the order they appear in config.bands. */
export const ICON_ORDER: readonly IconName[] = [
  "mouse",
  "speech-bubble",
  "palette",
  "flow-chart",
  "gear",
  "chain-link",
  "cloud",
  "checkbox",
  "arrow-right",
  "magnifier",
  "funnel",
  "tray",
];

export function Icon({ name, className }: { name: IconName } & Props) {
  const Glyph = SET[name];
  return <Glyph className={className} />;
}
