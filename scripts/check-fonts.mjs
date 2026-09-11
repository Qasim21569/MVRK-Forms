/**
 * Guard against defect 1, which has now been introduced four separate times,
 * each time a different way.
 *
 *   npm run check:fonts
 *
 * The symptom is always identical and always invisible in review: every
 * heading renders in the browser's system sans while the real faces either go
 * unused or 404, and next/font's size-adjusted metric fallback means the text
 * still occupies roughly the right space, so it does not look obviously
 * broken. You only catch it by reading a computed style.
 *
 * The four ways it has happened:
 *
 *   1. Aliases declared inside `@theme inline`. Tailwind v4 deliberately does
 *      not emit those custom properties, so var(--font-display) resolved to
 *      the empty string.
 *   2. A hand-written @font-face pointing at `/fonts/*.ttf` — a bare absolute
 *      path, which 404s under basePath, for files that are not in this repo.
 *   3. `--font-display` aliased to "grotesk", a face this project has never
 *      loaded.
 *   4. A SECOND `:root` block added lower in globals.css, overriding the
 *      correct aliases by cascade order.
 *
 * So this checks the shape of the file rather than any one of those:
 * exactly one declaration per alias, no @font-face at all, and no reference
 * to a family that does not exist here.
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CSS = "src/app/globals.css";
const LAYOUT = "src/app/layout.tsx";

const css = readFileSync(join(ROOT, CSS), "utf8");
const layout = readFileSync(join(ROOT, LAYOUT), "utf8");

/** Strip comments so the explanatory prose does not trip the checks. */
const code = css.replace(/\/\*[\s\S]*?\*\//g, "");

const errors = [];

/* --- 1. No @font-face, ever. Everything goes through next/font. --------- */
if (/@font-face/.test(code)) {
  errors.push(
    `${CSS}: contains @font-face. Every face must go through next/font in ` +
      `${LAYOUT} — a hand-written src url() is a bare path and 404s under basePath.`,
  );
}

/* --- 2. Aliases declared exactly once, and never in @theme ------------- */
for (const alias of ["--font-display", "--font-body", "--font-label"]) {
  const declarations = [...code.matchAll(new RegExp(`${alias}\\s*:`, "g"))];
  if (declarations.length === 0) {
    errors.push(`${CSS}: ${alias} is never declared.`);
  } else if (declarations.length > 1) {
    errors.push(
      `${CSS}: ${alias} declared ${declarations.length} times. The later one ` +
        `wins by cascade and that is how this broke the fourth time.`,
    );
  }
}

const theme = code.match(/@theme[^{]*\{[\s\S]*?\n\}/);
if (theme && /--font-/.test(theme[0])) {
  errors.push(
    `${CSS}: a --font-* alias is inside @theme. Tailwind v4 does not emit ` +
      `those custom properties; the alias resolves to the empty string.`,
  );
}

/* --- 3. No dead families ----------------------------------------------- */
const DEAD = ["grotesk", "nmontreal", "rader", "PPRader", "FoundersGrotesk"];
for (const name of DEAD) {
  if (new RegExp(name, "i").test(code)) {
    errors.push(
      `${CSS}: references "${name}", which is not a face this project loads.`,
    );
  }
}

/* --- 4. Every variable an alias points at is actually published -------- */
const declared = new Set(
  [...layout.matchAll(/variable:\s*"(--font-[\w-]+)"/g)].map((m) => m[1]),
);
for (const m of code.matchAll(/--font-(?:display|body|label)\s*:\s*var\((--font-[\w-]+)\)/g)) {
  if (!declared.has(m[1])) {
    errors.push(
      `${CSS}: aliased to var(${m[1]}), but ${LAYOUT} declares no next/font ` +
        `with that variable. Published: ${[...declared].join(", ") || "none"}.`,
    );
  }
}

/* --- 5. The variables must be on <html>, not <body> -------------------- */
if (!/<html[\s\S]{0,400}?className=\{`\$\{/.test(layout)) {
  errors.push(
    `${LAYOUT}: the next/font className variables are not on <html>. The ` +
      `aliases are declared in :root, and a custom property is substituted ` +
      `on the element its declaration applies to — one level down on <body> ` +
      `and var(--font-outfit) resolves to nothing.`,
  );
}

if (errors.length) {
  console.error(`font setup is broken:\n  ${errors.join("\n  ")}`);
  process.exit(1);
}

console.log(
  `font setup is sound — ${[...declared].join(", ")} published on <html>, ` +
    `aliased once each in :root, no @font-face anywhere.`,
);
