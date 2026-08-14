#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveBuildProvenance } from "./build-provenance.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const provenance = resolveBuildProvenance();
const environment = {
  ...process.env,
  DRUFF_SOURCE_REVISION: provenance.source_revision,
  SOURCE_DATE_EPOCH: String(provenance.source_date_epoch),
};

for (const [executable, args] of [
  [process.execPath, [join(repoRoot, "scripts", "copy-monaco-assets.mjs")]],
  [process.execPath, [join(repoRoot, "node_modules", "next", "dist", "bin", "next"), "build"]],
  [
    process.execPath,
    [join(repoRoot, "scripts", "static-artifact.mjs"), "--root", join(repoRoot, "out")],
  ],
]) {
  execFileSync(executable, args, { cwd: repoRoot, env: environment, stdio: "inherit" });
}
