import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // DRUFF-14: same-origin Monaco assets copied from the pinned `monaco-editor` dependency by
    // scripts/copy-monaco-assets.mjs — generated, git-ignored, never hand-authored.
    "public/monaco/**",
  ]),
]);

export default eslintConfig;
