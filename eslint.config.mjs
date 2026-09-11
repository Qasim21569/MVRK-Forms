import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/**
 * eslint-config-next 16 ships native flat configs, so they are spread in
 * directly. Do not route these through @eslint/eslintrc's FlatCompat — the
 * shareable config is already flat and compat chokes on it.
 */
const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // Deliberate. This is a static export with `images: { unoptimized: true }`,
      // so next/image buys nothing, and `asset()` is the one path guaranteed to
      // carry the /forms basePath onto a plain string src. CLAUDE.md rule 10.
      "@next/next/no-img-element": "off",
    },
  },
  { ignores: [".next/**", "out/**", "node_modules/**", "scripts/**"] },
];

export default eslintConfig;
