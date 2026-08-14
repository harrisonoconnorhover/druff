import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import {
  createStaticArtifactManifest,
  verifyStaticArtifactManifest,
  writeStaticArtifactManifest,
} from "./static-artifact.mjs";

const METADATA = {
  version: "0.1.0",
  source_revision: "a".repeat(40),
  source_date_epoch: 1_700_000_000,
  dander_contract_id: "io.dander.control.contracts/v1",
  dander_contract_sha256: "b".repeat(64),
};

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "druff-static-artifact-"));
  mkdirSync(join(root, "nested"));
  writeFileSync(join(root, "index.html"), "<main>Druff</main>\n");
  writeFileSync(join(root, "nested", "asset.js"), "export const safe = true;\n");
  return root;
}

test("static manifest is sorted, repeatable, and content-addressed", () => {
  const root = fixture();
  try {
    const first = writeStaticArtifactManifest(root, METADATA);
    const firstBytes = readFileSync(join(root, "druff-artifact.json"), "utf8");
    const second = writeStaticArtifactManifest(root, METADATA);
    assert.equal(readFileSync(join(root, "druff-artifact.json"), "utf8"), firstBytes);
    assert.deepEqual(second, first);
    assert.deepEqual(
      first.files.map((file) => file.path),
      ["index.html", "nested/asset.js"],
    );

    writeFileSync(join(root, "nested", "asset.js"), "export const safe = false;\n");
    assert.notEqual(
      createStaticArtifactManifest(root, METADATA).bundle_sha256,
      first.bundle_sha256,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("static manifest check rejects changed exported content", () => {
  const root = fixture();
  try {
    writeStaticArtifactManifest(root, METADATA);
    assert.equal(verifyStaticArtifactManifest(root).schema, "io.druff.static-artifact/v1");
    writeFileSync(join(root, "index.html"), "changed\n");
    assert.throws(() => verifyStaticArtifactManifest(root), /does not match/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("static manifest refuses symbolic links", () => {
  const root = fixture();
  try {
    symlinkSync(join(root, "index.html"), join(root, "linked.html"));
    assert.throws(() => createStaticArtifactManifest(root, METADATA), /symbolic link/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Caddyfile carries the exact committed security policy and static routes", () => {
  const root = resolve(import.meta.dirname, "..");
  const headers = JSON.parse(
    readFileSync(join(root, "artifact", "static-security-headers.json"), "utf8"),
  );
  const caddyfile = readFileSync(join(root, "Caddyfile"), "utf8");
  for (const value of Object.values(headers)) {
    assert.ok(caddyfile.includes(`"${value}"`), `Caddyfile is missing header value ${value}`);
  }
  assert.match(caddyfile, /@immutable path \/_next\/static\/\*/);
  assert.match(caddyfile, /try_files \{path\}\.html \{path\}/);
});
