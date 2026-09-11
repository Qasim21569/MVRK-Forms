/**
 * basePath-aware asset paths.
 *
 * The site is a static export served from https://www.mvrk.ca/forms. A bare
 * `/brand/lockup-color.png` resolves to `mvrk.ca/brand/...` and 404s; it needs
 * `mvrk.ca/forms/brand/...`. Next rewrites paths inside `next/image` and inside
 * imported modules, but NOT plain strings — and `config.brand.*` is plain
 * strings on purpose, because Vuk edits that file.
 *
 * So: every runtime asset string goes through here. CLAUDE.md rule 10.
 *
 * NEXT_PUBLIC_BASE_PATH is published by next.config.ts from the same constant
 * that sets `basePath`, so the two can never drift apart.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  if (/^(https?:)?\/\//.test(path)) return path;
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}
