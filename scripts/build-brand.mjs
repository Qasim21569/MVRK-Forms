/**
 * Derive web-sized brand assets from Vuk's delivered artwork.
 *
 * The delivered files are print-scale PNGs (up to 3005px wide, 711KB). Shipping
 * those into a nav bar is 2MB of logo on a page whose pitch is that it feels
 * fast, and `images: { unoptimized: true }` means next/image will not resize
 * them for us. So we resize once, here, and commit the results.
 *
 * Also mints the plum-tinted outline mark used as the demo poster placeholder:
 * the delivered outline artwork is literally black, and there is no black in
 * this palette (CLAUDE.md rule 3). We recolour it through its own alpha.
 *
 *   npm run brand
 */
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// Vuk's delivered originals live OUTSIDE public/ on purpose: they are print
// scale (up to 3005px, 711KB each) and anything under public/ is copied
// verbatim into the export and deployed. This directory is source material.
const SRC = join(ROOT, "brand-source", "FORMS-assets");
const OUT = join(ROOT, "public", "brand");
mkdirSync(OUT, { recursive: true });

const PLUM = { r: 0x81, g: 0x4d, b: 0x71 };
const TINT = { r: 0xcc, g: 0xee, b: 0xf3 };

/**
 * Resize preserving aspect, keep the alpha channel, write a compact PNG.
 * No `palette: true` — these are smooth two-stop gradients and 8-bit
 * quantisation bands them visibly at nav scale.
 */
const shrink = (from, to, width) =>
  sharp(join(SRC, from))
    .resize({ width, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, to));

/** Repaint monochrome artwork in a palette colour, driven by its own alpha. */
async function recolour(from, to, width, rgb) {
  // Resize FIRST, then read dimensions off the resized pixels: sharp's
  // metadata() reports the source image, not the pipeline output.
  const { data, info } = await sharp(join(SRC, from))
    .resize({ width, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h, channels } = info;
  const alpha = Buffer.alloc(w * h);
  for (let i = 0; i < alpha.length; i += 1) alpha[i] = data[i * channels + 3];

  await sharp({ create: { width: w, height: h, channels: 3, background: rgb } })
    .joinChannel(alpha, { raw: { width: w, height: h, channels: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, to));
}

await Promise.all([
  // Nav lockup, light surfaces. -2 is the flat gradient artwork with no drop
  // shadow; the shadowed primary would fight the page's own depth language.
  shrink("logo/forms-logo-color-2.png", "lockup-color.png", 720),
  // Footer lockup, on --ink.
  shrink("logo/forms-logo-white.png", "lockup-white.png", 720),
  shrink("icon/forms-icon-color.png", "icon-color.png", 160),
  recolour("icon/forms-icon-outline-black.png", "mark-outline-plum.png", 512, PLUM),
]);

// OG card, 1200x630. Tint ground, colour lockup centred, referenced through
// the basePath — a subpath deploy is exactly where OG images quietly 404.
const lockup = await sharp(join(SRC, "logo/forms-logo-color-2.png"))
  .resize({ width: 760 })
  .toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: TINT } })
  .composite([{ input: lockup, gravity: "centre" }])
  .png({ compressionLevel: 9 })
  .toFile(join(OUT, "og.png"));

console.log("brand assets written to public/brand/");
