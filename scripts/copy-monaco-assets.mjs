#!/usr/bin/env node
/**
 * Copies Monaco Editor's pre-built AMD bundle (`monaco-editor/min/vs`) into `public/monaco/vs` so
 * `MonacoCodeEditor` (DRUFF-14) can point `@monaco-editor/react`'s loader at a same-origin path
 * (`/monaco/vs`) instead of its default jsDelivr CDN loader — required by DRUFF-14's AC5 ("no
 * disallowed external host at runtime") and `steering/01-security.md` rule 4 (self-hosted, no
 * third party phoning home at runtime for a pinned, lockfile-tracked dependency).
 *
 * Run before `dev`/`build` (wired into `package.json`'s `dev`/`build` scripts) rather than as this
 * package's own `postinstall` — steering flags install-time scripts of *dependencies* as a
 * supply-chain vector; this is our own build step copying our own pinned dependency's static
 * assets, invoked explicitly, not implicitly at install time.
 *
 * `public/monaco/` is git-ignored (generated output, ~20MB) — this script regenerates it from
 * `node_modules`, so nothing here needs to be committed.
 */
import { createRequire } from "node:module";
import { existsSync, cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const repoRoot = dirname(fileURLToPath(import.meta.url)) + "/..";

function resolveMonacoVsDir() {
  // `monaco-editor`'s package.json declares no `"./package.json"` export subpath, so resolve its
  // main entry point instead (the `"require"` condition of its `"."` export map resolves to
  // `min/vs/index.js`) and walk up to the `min/vs` directory that entry lives in.
  const monacoEntry = require.resolve("monaco-editor");
  return dirname(monacoEntry);
}

function main() {
  const sourceDir = resolveMonacoVsDir();
  const destDir = join(repoRoot, "public", "monaco", "vs");

  if (!existsSync(sourceDir)) {
    // Fails loud rather than silently proceeding without assets (steering/02-engineering.md) —
    // MonacoCodeEditor's own runtime fallback (a plain textarea) only degrades gracefully at
    // *render* time when the loader can't reach `/monaco/vs`; a missing source at build time is a
    // dependency-install problem worth surfacing immediately instead.
    console.error(`[copy-monaco-assets] monaco-editor's min/vs not found at ${sourceDir}`);
    process.exit(1);
  }

  mkdirSync(destDir, { recursive: true });
  cpSync(sourceDir, destDir, { recursive: true });
  console.log(`[copy-monaco-assets] copied ${sourceDir} -> ${destDir}`);
}

main();
