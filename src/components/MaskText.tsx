import styles from "./MaskText.module.css";

/**
 * Text split into per-word mask boxes, ready for a line-by-line rise.
 *
 * Split by word, then grouped into LINES at animation time by measured
 * `offsetTop` — see the `[data-fx-heading]` handler in ScrollFxProvider.
 * Words on the same line share a delay, so it reads as a line rising, not as
 * words popping. Character stagger on a 76px display face looks like a
 * tutorial; that is why this splits on spaces and nothing finer.
 *
 * The spans render identically on the server and the client, and with no
 * transform applied they are visually indistinguishable from plain text. So a
 * visitor with no JavaScript gets a normal heading and there is no hydration
 * risk from restructuring the DOM after mount.
 *
 * The mask is `clip-path`, not `overflow: hidden`, for two reasons:
 * `overflow` on an inline-block moves its baseline to the bottom margin edge
 * and knocks the whole line out of alignment, and the clip has to sit BELOW
 * the descenders on "Design" and "Sharing" rather than through them.
 */
export default function MaskText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <span className={className} data-mask>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          {i > 0 ? " " : null}
          <span className={styles.word} data-mask-word>
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}
