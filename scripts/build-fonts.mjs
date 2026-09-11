/**
 * Convert the licensed .ttf faces to woff2 and drop them in src/fonts/.
 *
 * Run once; the woff2 files are committed. Source .ttf files are the licensed
 * originals carried from mvrk-orbit (the one permitted reference).
 *
 * A .ttf is 2-4x the bytes of the same face as woff2, on a page whose whole
 * pitch is that it feels fast. See BRIEF.md section 5 / REVIEW.md C2.5.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ttf2woff2 from "ttf2woff2";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ORBIT =
  "C:/Users/qasim/Claude/Projects/BRAHMA Group Website Development/mvrk-orbit/public/fonts";
const OUT = join(ROOT, "src", "fonts");

// Only the faces the page actually sets. Rader Medium and the four italics are
// deliberately not shipped: next/font preloads every declared face, and
// preloading ~200KB of type nothing renders in would undercut the whole pitch.
const FACES = [
  ["rader/PPRader-Regular.ttf", "PPRader-Regular.woff2"],
  ["rader/PPRader-Bold.ttf", "PPRader-Bold.woff2"],
  ["NeueMontreal-Regular.ttf", "NeueMontreal-Regular.woff2"],
];

mkdirSync(OUT, { recursive: true });

for (const [src, out] of FACES) {
  const from = join(ORBIT, src);
  if (!existsSync(from)) {
    console.error(`MISSING SOURCE: ${from}`);
    process.exitCode = 1;
    continue;
  }
  const ttf = readFileSync(from);
  const woff2 = Buffer.from(ttf2woff2(ttf));
  writeFileSync(join(OUT, out), woff2);
  const pct = Math.round((1 - woff2.length / ttf.length) * 100);
  console.log(
    `${out.padEnd(30)} ${(ttf.length / 1024).toFixed(0)}KB ttf -> ${(
      woff2.length / 1024
    ).toFixed(0)}KB woff2  (-${pct}%)`,
  );
}
