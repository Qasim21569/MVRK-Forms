import type { NextConfig } from "next";

/**
 * The site is a STATIC EXPORT served from a subpath: https://www.mvrk.ca/forms
 *
 * Same shape as mvrk.ca/zapier, shipped onto Bluehost in August. Without
 * `basePath` + `assetPrefix` every chunk, font and stylesheet resolves to
 * `mvrk.ca/_next/...` instead of `mvrk.ca/forms/_next/...` and the page loads
 * unstyled. See REVIEW.md A3.
 *
 * BASE_PATH is also published as NEXT_PUBLIC_BASE_PATH so `lib/asset.ts` can
 * prefix runtime asset strings (the `brand.*` paths Vuk edits in config.ts)
 * from the same single source of truth. Never write a bare `/brand/x.png`.
 */
const BASE_PATH = "/forms";

const nextConfig: NextConfig = {
  output: "export",
  basePath: BASE_PATH,
  assetPrefix: BASE_PATH,
  // Apache on Bluehost serves /forms/ as a directory; emit index.html per route.
  trailingSlash: true,
  // next/image cannot optimise in a static export.
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
};

export default nextConfig;
