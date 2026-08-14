#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { requireExplicitBuildProvenance } from "./build-provenance.mjs";

export const STATIC_ARTIFACT_SCHEMA = "io.druff.static-artifact/v1";
export const STATIC_ARTIFACT_FILENAME = "druff-artifact.json";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function artifactFiles(root) {
  const files = [];

  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const absolute = join(directory, entry.name);
      const path = relative(root, absolute).split(sep).join("/");
      if (path === STATIC_ARTIFACT_FILENAME) continue;
      const status = lstatSync(absolute);
      if (status.isSymbolicLink()) {
        throw new Error(`Static artifact cannot contain symbolic link ${path}`);
      }
      if (status.isDirectory()) {
        visit(absolute);
        continue;
      }
      if (!status.isFile()) {
        throw new Error(`Static artifact cannot contain special file ${path}`);
      }
      const body = readFileSync(absolute);
      files.push({ path, size: body.byteLength, sha256: sha256(body) });
    }
  }

  visit(root);
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

function bundleDigest(files) {
  return sha256(files.map((file) => `${file.path}\0${file.size}\0${file.sha256}\n`).join(""));
}

function validateMetadata(metadata) {
  if (
    typeof metadata.source_revision !== "string" ||
    (metadata.source_revision !== "unrecorded" &&
      !/^[0-9a-f]{40}([0-9a-f]{24})?$/.test(metadata.source_revision))
  ) {
    throw new Error("Static artifact source revision must be a full Git object ID");
  }
  if (!Number.isSafeInteger(metadata.source_date_epoch) || metadata.source_date_epoch < 0) {
    throw new Error("Static artifact source epoch must be a non-negative integer");
  }
  if (
    typeof metadata.version !== "string" ||
    !metadata.version ||
    typeof metadata.dander_contract_id !== "string" ||
    !metadata.dander_contract_id
  ) {
    throw new Error("Static artifact metadata is incomplete");
  }
  if (
    typeof metadata.dander_contract_sha256 !== "string" ||
    !/^[0-9a-f]{64}$/.test(metadata.dander_contract_sha256)
  ) {
    throw new Error("Static artifact Dander contract digest must be SHA-256");
  }
}

export function createStaticArtifactManifest(root, metadata) {
  validateMetadata(metadata);
  const files = artifactFiles(root);
  return {
    schema: STATIC_ARTIFACT_SCHEMA,
    artifact: "druff-static",
    version: metadata.version,
    source_revision: metadata.source_revision,
    source_date_epoch: metadata.source_date_epoch,
    dander_contract: {
      id: metadata.dander_contract_id,
      sha256: metadata.dander_contract_sha256,
    },
    bundle_sha256: bundleDigest(files),
    files,
  };
}

function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function normalizeTimestamps(root, epoch) {
  const timestamp = new Date(epoch * 1_000);
  const paths = [];

  function collect(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = join(directory, entry.name);
      const status = lstatSync(absolute);
      if (status.isSymbolicLink()) {
        throw new Error("Static artifact timestamp normalization refused a symbolic link");
      }
      if (status.isDirectory()) collect(absolute);
      paths.push(absolute);
    }
  }

  collect(root);
  for (const path of paths) utimesSync(path, timestamp, timestamp);
  utimesSync(root, timestamp, timestamp);
}

export function writeStaticArtifactManifest(root, metadata) {
  const manifest = createStaticArtifactManifest(root, metadata);
  const output = join(root, STATIC_ARTIFACT_FILENAME);
  const temporary = `${output}.tmp`;
  try {
    writeFileSync(temporary, canonicalJson(manifest), { encoding: "utf8", mode: 0o644 });
    renameSync(temporary, output);
    normalizeTimestamps(root, metadata.source_date_epoch);
  } finally {
    rmSync(temporary, { force: true });
  }
  return manifest;
}

export function verifyStaticArtifactManifest(root) {
  const path = join(root, STATIC_ARTIFACT_FILENAME);
  let actual;
  try {
    actual = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error("Static artifact manifest is missing or invalid", { cause: error });
  }
  if (actual?.schema !== STATIC_ARTIFACT_SCHEMA || actual?.artifact !== "druff-static") {
    throw new Error("Static artifact manifest has an unsupported schema");
  }
  const expected = createStaticArtifactManifest(root, {
    version: actual.version,
    source_revision: actual.source_revision,
    source_date_epoch: actual.source_date_epoch,
    dander_contract_id: actual.dander_contract?.id,
    dander_contract_sha256: actual.dander_contract?.sha256,
  });
  if (canonicalJson(actual) !== canonicalJson(expected)) {
    throw new Error("Static artifact manifest does not match the exported files");
  }
  return expected;
}

function repositoryMetadata() {
  const packageDocument = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
  const contract = JSON.parse(
    readFileSync(join(repoRoot, "src/generated/dander-contracts/bundle/manifest.json"), "utf8"),
  );
  const provenance = requireExplicitBuildProvenance();
  return {
    version: packageDocument.version,
    ...provenance,
    dander_contract_id: contract.bundle_id,
    dander_contract_sha256: contract.bundle_sha256,
  };
}

function parseArguments(argv) {
  let root = join(repoRoot, "out");
  let check = false;
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--check") {
      check = true;
    } else if (argv[index] === "--root" && argv[index + 1]) {
      root = resolve(argv[++index]);
    } else {
      throw new Error(`Unknown static-artifact argument ${argv[index]}`);
    }
  }
  return { root, check };
}

function main() {
  const { root, check } = parseArguments(process.argv.slice(2));
  mkdirSync(root, { recursive: true });
  const manifest = check
    ? verifyStaticArtifactManifest(root)
    : writeStaticArtifactManifest(root, repositoryMetadata());
  process.stdout.write(
    `${JSON.stringify({ schema: manifest.schema, bundle_sha256: manifest.bundle_sha256, files: manifest.files.length })}\n`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    process.stderr.write(
      `Static artifact verification failed: ${error instanceof Error ? error.message : "unknown error"}\n`,
    );
    process.exitCode = 1;
  }
}
