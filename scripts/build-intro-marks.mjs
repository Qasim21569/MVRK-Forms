/**
 * Prepare the intro curtain's two marks.
 *
 *   npm run intro:marks
 *
 * ===========================================================================
 * WHY THE TWO MARKS ARE HANDLED DIFFERENTLY.
 *
 * PRELOADER.md is emphatic that the intro's artwork must be in the document,
 * never a late-arriving <img>: the curtain runs on fixed timers that do not
 * wait for assets, so artwork that loses the race animates a beautifully
 * choreographed sequence over an empty stage. That bug shipped once already.
 *
 * The same doc says to open the files before planning anything, because
 * BRAHMA's "logo.svg" was two base64 PNGs with no vector paths in it. That is
 * exactly what `public/preload/*.svg` are — 110KB and 97KB of base64 PNG in
 * an <svg><image> wrapper, zero paths between them.
 *
 * Inlining both verbatim is 280KB of base64 in the HTML of every page load.
 * Even re-encoded, the wordmark is ~37KB because it is very wide on a desktop
 * lockup. So the split is by DEADLINE, not by preference:
 *
 *   ICON      needed at 140ms. Inlined as a data URI. Zero requests, present
 *             on the first frame, cannot lose any race.
 *   WORDMARK  not needed until 1140ms. Written as a same-origin file and
 *             preloaded from <head>, so it gets a full second of head start
 *             on a request the browser is told about before anything else.
 *             Worst case it arrives a frame late inside its own mask.
 *
 * WebP, not PNG: these are smooth gradients with an alpha channel, which is
 * the case PNG is worst at and WebP is best at — about a third of the bytes
 * at a quality nobody can pick out.
 *
 * If Vuk ever sends real vector artwork, delete all of this and inline the
 * paths — then the masked-centreline draw in PRELOADER.md section 4 becomes
 * possible and the icon can genuinely draw itself rather than being swept.
 * ===========================================================================
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// The two source files live OUTSIDE public/ deliberately: they are 282KB of
// base64 PNG between them, and everything under public/ is copied verbatim
// into the export and deployed. Only the derived wordmark.webp ships.
const SRC = join(ROOT, "brand-source", "preload");
const OUT = join(ROOT, "src", "components", "intro");

/*
 * Sized against Intro.module.css, where the lockup is `min(90vw, 1180px)`
 * wide. The icon takes 20% of that (236px at the cap) and the wordmark 78.4%
 * (926px). These are a little over 1x those — ample for soft gradient artwork
 * that is on screen for four seconds.
 */
const ICON_WIDTH = 320;
const WORDMARK_WIDTH = 1000;

/** The plum the outline is recoloured to. The delivered outline art is black,
 *  and there is no black in this palette (CLAUDE.md rule 3). */
const PLUM = { r: 0x81, g: 0x4d, b: 0x71 };

/** Pull the base64 payload out of the <image href="data:image/png;base64,…">. */
function extractPng(name) {
  const svg = readFileSync(join(SRC, name), "utf8");
  const m = svg.match(/href="data:image\/png;base64,([^"]+)"/);
  if (!m) {
    throw new Error(
      `${name}: no base64 PNG found. If this is real vector art now, delete ` +
        `this script and inline the paths instead.`,
    );
  }
  return Buffer.from(m[1], "base64");
}

mkdirSync(OUT, { recursive: true });

/* --- Icon, colour: inlined --------------------------------------------- */
const icon = await sharp(extractPng("icon-preload.svg"))
  .resize({ width: ICON_WIDTH, withoutEnlargement: true })
  .webp({ quality: 86, alphaQuality: 100, effort: 6 })
  .toBuffer();
const iconMeta = await sharp(icon).metadata();

/* --- Icon, outline: inlined too ----------------------------------------
 * This is what makes the icon look CONSTRUCTED rather than merely revealed:
 * the outline is built first, then the colour floods into it.
 *
 * PRELOADER.md section 4 wants that done as a stroked centreline inside a
 * mask, animating stroke-dashoffset. That needs vector geometry, and there is
 * none — the preload files are base64 PNGs, and the Inkscape asset sheet's
 * paths are wrapped in Inkscape mesh gradients that browsers do not paint.
 *
 * So it is done the way that same section names as the alternative: "done
 * with opacity on both sides instead of colour". The brand pack already ships
 * a real outline drawing of the mark, so the outline is genuine artwork
 * rather than a traced silhouette — which is the thing section 4 warns
 * against, because tracing a thick ribbon's outline reads as a wire being
 * bent rather than a letter being drawn.
 *
 * Recoloured to --plum through its own alpha: the delivered file is black and
 * there is no black in this palette.
 */
const outlineSrc = join(ROOT, "brand-source", "FORMS-assets", "icon", "forms-icon-outline-black.png");
const { data: oData, info: oInfo } = await sharp(outlineSrc)
  .resize({ width: ICON_WIDTH, withoutEnlargement: true })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const oAlpha = Buffer.alloc(oInfo.width * oInfo.height);
for (let i = 0; i < oAlpha.length; i += 1) {
  oAlpha[i] = oData[i * oInfo.channels + 3];
}
const outline = await sharp({
  create: { width: oInfo.width, height: oInfo.height, channels: 3, background: PLUM },
})
  .joinChannel(oAlpha, { raw: { width: oInfo.width, height: oInfo.height, channels: 1 } })
  .webp({ quality: 90, alphaQuality: 100, effort: 6 })
  .toBuffer();
const outlineMeta = await sharp(outline).metadata();

/* --- Wordmark: a file, preloaded --------------------------------------- */
const word = await sharp(extractPng("wordmark-preload.svg"))
  .resize({ width: WORDMARK_WIDTH, withoutEnlargement: true })
  .webp({ quality: 80, alphaQuality: 90, effort: 6 })
  .toBuffer();
const wordMeta = await sharp(word).metadata();
writeFileSync(join(ROOT, "public", "preload", "wordmark.webp"), word);

writeFileSync(
  join(OUT, "marks.generated.ts"),
  `/**
 * GENERATED by scripts/build-intro-marks.mjs. Do not edit by hand.
 *
 * The icon is a data URI so it is present on the first frame — it is on
 * screen at 140ms and the curtain's timers do not wait for assets.
 *
 * The wordmark is a same-origin file, preloaded from <head>, because it is
 * not needed until 1140ms and inlining it would put ~50KB of base64 into
 * every page's HTML. Route it through asset(): a bare path 404s under
 * basePath. See the script's header for the full reasoning.
 */

/** ${iconMeta.width}x${iconMeta.height}, ${(icon.length / 1024).toFixed(1)}KB WebP, inlined. The gradient artwork. */
export const ICON_SRC =
  "data:image/webp;base64,${icon.toString("base64")}";
export const ICON_W = ${iconMeta.width};
export const ICON_H = ${iconMeta.height};

/**
 * ${outlineMeta.width}x${outlineMeta.height}, ${(outline.length / 1024).toFixed(1)}KB WebP, inlined.
 *
 * The mark's real outline drawing from the brand pack, recoloured from the
 * delivered black to --plum. The intro builds this first and then floods the
 * gradient artwork above into it, so the icon reads as constructed.
 */
export const ICON_OUTLINE_SRC =
  "data:image/webp;base64,${outline.toString("base64")}";

/** ${wordMeta.width}x${wordMeta.height}, ${(word.length / 1024).toFixed(1)}KB WebP. MUST go through asset(). */
export const WORDMARK_PATH = "/preload/wordmark.webp";
export const WORDMARK_W = ${wordMeta.width};
export const WORDMARK_H = ${wordMeta.height};

/**
 * The lockup's proportions, MEASURED off the real primary logo artwork
 * (brand-source/FORMS-assets/logo/forms-logo-color-2.png) rather than guessed:
 *
 *   icon ink      591 x 591, top-aligned at y=0
 *   wordmark ink  2316 x 780, y=0..779
 *   gutter        46px
 *
 * So the wordmark's box is 1.32x the icon's, the two align at the TOP — "BY
 * MVRK" hangs below the icon's baseline — and the gap is 7.8% of the icon.
 * The previous version had the wordmark at 0.4x and vertically centred, which
 * is exactly why it read as far too small next to the mark.
 */
export const WORDMARK_TO_ICON = 1.32;
export const GAP_TO_ICON = 0.078;
`,
);

console.log(
  `icon      ${iconMeta.width}x${iconMeta.height}  ${(icon.length / 1024).toFixed(1)}KB  ` +
    `inlined (${((icon.length * 4) / 3 / 1024).toFixed(1)}KB as base64)`,
);
console.log(
  `outline   ${outlineMeta.width}x${outlineMeta.height}  ${(outline.length / 1024).toFixed(1)}KB  ` +
    `inlined (${((outline.length * 4) / 3 / 1024).toFixed(1)}KB as base64), recoloured to --plum`,
);
console.log(
  `wordmark  ${wordMeta.width}x${wordMeta.height}  ${(word.length / 1024).toFixed(1)}KB  ` +
    `-> public/preload/wordmark.webp`,
);
console.log("wrote src/components/intro/marks.generated.ts");
