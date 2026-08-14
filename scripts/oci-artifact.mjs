#!/usr/bin/env node

import { createHash } from "node:crypto";
import { renameSync, rmSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { pathToFileURL } from "node:url";

const DIGEST = /^sha256:[0-9a-f]{64}$/;
const HEX_DIGEST = /^[0-9a-f]{64}$/;
const REPOSITORY = /^(?:[a-z0-9]+(?:[._-][a-z0-9]+)*\/)*[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
const TAG = /^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$/;
const REQUIRED_PLATFORMS = ["linux/amd64", "linux/arm64"];
const MAX_MANIFEST_BYTES = 8 * 1024 * 1024;
const MAX_BLOB_BYTES = 128 * 1024 * 1024;
const MAX_UNCOMPRESSED_LAYER_BYTES = 256 * 1024 * 1024;
const STATIC_MANIFEST_PATH = "app/druff-artifact.json";

export function digestBytes(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function parseJson(bytes, label) {
  try {
    return JSON.parse(Buffer.from(bytes).toString("utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON`, { cause: error });
  }
}

function validDescriptor(value, label) {
  if (
    !value ||
    typeof value !== "object" ||
    typeof value.mediaType !== "string" ||
    typeof value.digest !== "string" ||
    !DIGEST.test(value.digest) ||
    !Number.isSafeInteger(value.size) ||
    value.size < 0
  ) {
    throw new Error(`${label} has an invalid OCI descriptor`);
  }
  return value;
}

function platformKey(descriptor) {
  const platform = descriptor.platform;
  if (!platform || typeof platform.os !== "string" || typeof platform.architecture !== "string") {
    return null;
  }
  const base = `${platform.os}/${platform.architecture}`;
  return typeof platform.variant === "string" && platform.variant
    ? `${base}/${platform.variant}`
    : base;
}

function requiredPlatform(descriptor) {
  const key = platformKey(descriptor);
  return REQUIRED_PLATFORMS.find((required) => key === required || key?.startsWith(`${required}/`));
}

function parseIndex(result, label) {
  if (digestBytes(result.body) !== result.digest || !DIGEST.test(result.digest)) {
    throw new Error(`${label} digest does not match its exact bytes`);
  }
  const document = parseJson(result.body, label);
  if (!Array.isArray(document.manifests)) {
    throw new Error(`${label} is not an OCI multi-platform index`);
  }
  const descriptors = document.manifests.map((descriptor, index) =>
    validDescriptor(descriptor, `${label} manifest ${index}`),
  );
  const platforms = new Map();
  for (const descriptor of descriptors) {
    const required = requiredPlatform(descriptor);
    if (!required) continue;
    if (platforms.has(required)) throw new Error(`${label} repeats ${required}`);
    platforms.set(required, descriptor);
  }
  for (const platform of REQUIRED_PLATFORMS) {
    if (!platforms.has(platform)) throw new Error(`${label} is missing ${platform}`);
  }
  return { document, descriptors, platforms };
}

function parseImageManifest(result, label) {
  if (digestBytes(result.body) !== result.digest || !DIGEST.test(result.digest)) {
    throw new Error(`${label} digest does not match its exact bytes`);
  }
  const document = parseJson(result.body, label);
  validDescriptor(document.config, `${label} config`);
  if (!Array.isArray(document.layers) || document.layers.length === 0) {
    throw new Error(`${label} has no image layers`);
  }
  return {
    ...document,
    layers: document.layers.map((layer, index) =>
      validDescriptor(layer, `${label} layer ${index}`),
    ),
  };
}

function tarString(bytes, start, length) {
  const end = bytes.indexOf(0, start);
  const boundary = end === -1 || end > start + length ? start + length : end;
  return bytes.subarray(start, boundary).toString("utf8");
}

function tarSize(bytes, offset) {
  const value = tarString(bytes, offset, 12).trim();
  if (!/^[0-7]*$/.test(value)) throw new Error("Static asset layer has an invalid tar size");
  return value ? Number.parseInt(value, 8) : 0;
}

function staticManifestFromLayer(bytes, mediaType) {
  let archive;
  if (mediaType.includes("+gzip") || (bytes[0] === 0x1f && bytes[1] === 0x8b)) {
    archive = gunzipSync(bytes, { maxOutputLength: MAX_UNCOMPRESSED_LAYER_BYTES });
  } else if (mediaType.includes("+zstd")) {
    throw new Error("Static asset layer uses unsupported zstd compression");
  } else {
    archive = Buffer.from(bytes);
  }
  if (archive.byteLength > MAX_UNCOMPRESSED_LAYER_BYTES) {
    throw new Error("Static asset layer expands beyond the verification bound");
  }
  for (let offset = 0; offset + 512 <= archive.byteLength;) {
    const header = archive.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const name = tarString(header, 0, 100);
    const prefix = tarString(header, 345, 155);
    const path = prefix ? `${prefix}/${name}` : name;
    const size = tarSize(header, 124);
    const type = header[156];
    const bodyStart = offset + 512;
    const bodyEnd = bodyStart + size;
    if (bodyEnd > archive.byteLength) throw new Error("Static asset layer tar is truncated");
    if ((type === 0 || type === 48) && path.replace(/^\.\//, "") === STATIC_MANIFEST_PATH) {
      return parseJson(archive.subarray(bodyStart, bodyEnd), "embedded static manifest");
    }
    offset = bodyStart + Math.ceil(size / 512) * 512;
  }
  return null;
}

function hasSubject(statement, manifestDigest) {
  const expected = manifestDigest.slice("sha256:".length);
  return (
    Array.isArray(statement?.subject) &&
    statement.subject.some((subject) => subject?.digest?.sha256 === expected)
  );
}

async function verifyAttestations({ descriptors, platforms, readManifest, readBlob }) {
  const predicates = new Map(REQUIRED_PLATFORMS.map((platform) => [platform, new Set()]));
  const digestToPlatform = new Map(
    [...platforms.entries()].map(([platform, descriptor]) => [descriptor.digest, platform]),
  );

  for (const descriptor of descriptors) {
    if (requiredPlatform(descriptor)) continue;
    if (descriptor.annotations?.["vnd.docker.reference.type"] !== "attestation-manifest") {
      continue;
    }
    const subjectDigest = descriptor.annotations?.["vnd.docker.reference.digest"];
    const platform = digestToPlatform.get(subjectDigest);
    if (!platform) throw new Error("Attestation is not associated with a runnable manifest");
    const manifest = parseImageManifest(
      await readManifest(descriptor.digest),
      `${platform} attestation manifest`,
    );
    for (const layer of manifest.layers) {
      const statement = parseJson(await readBlob(layer.digest), `${platform} attestation`);
      if (!hasSubject(statement, subjectDigest)) {
        throw new Error(`${platform} attestation subject does not match its runnable manifest`);
      }
      if (typeof statement.predicateType === "string") {
        predicates.get(platform).add(statement.predicateType);
      }
    }
  }

  for (const platform of REQUIRED_PLATFORMS) {
    const actual = predicates.get(platform);
    if (!actual.has("https://spdx.dev/Document")) {
      throw new Error(`${platform} is missing an associated SPDX SBOM attestation`);
    }
    if (![...actual].some((predicate) => predicate.startsWith("https://slsa.dev/provenance/"))) {
      throw new Error(`${platform} is missing an associated SLSA provenance attestation`);
    }
  }
  return Object.fromEntries(
    REQUIRED_PLATFORMS.map((platform) => [platform, [...predicates.get(platform)].sort()]),
  );
}

async function inspectRunnable(platforms, readManifest, readBlob) {
  const inspected = new Map();
  for (const platform of REQUIRED_PLATFORMS) {
    const descriptor = platforms.get(platform);
    const manifest = parseImageManifest(
      await readManifest(descriptor.digest),
      `${platform} runnable manifest`,
    );
    const config = parseJson(await readBlob(manifest.config.digest), `${platform} image config`);
    if (config?.config?.User !== "65532:65532") {
      throw new Error(`${platform} image is not configured as UID/GID 65532:65532`);
    }
    inspected.set(platform, { descriptor, manifest });
  }
  return inspected;
}

async function sharedStaticLayer(inspected, readBlob) {
  const [amd64, arm64] = REQUIRED_PLATFORMS.map((platform) => inspected.get(platform));
  const armLayers = new Set(arm64.manifest.layers.map((layer) => layer.digest));
  const shared = amd64.manifest.layers.filter((layer) => armLayers.has(layer.digest));
  const matches = [];
  for (const layer of shared) {
    const manifest = staticManifestFromLayer(await readBlob(layer.digest), layer.mediaType);
    if (manifest) matches.push({ layer, manifest });
  }
  if (matches.length !== 1) {
    throw new Error("Runnable manifests do not share one exact static asset layer");
  }
  const [{ layer, manifest }] = matches;
  if (
    manifest?.schema !== "io.druff.static-artifact/v1" ||
    !HEX_DIGEST.test(manifest.bundle_sha256)
  ) {
    throw new Error("Shared static asset layer contains an invalid bundle manifest");
  }
  return { layer_digest: layer.digest, manifest };
}

async function repeatStaticLayer(repeat, sourceLayerDigest, readManifest) {
  const document = parseJson(repeat.body, "repeat image reference");
  let runnable = repeat;
  if (Array.isArray(document.manifests)) {
    const parsed = parseIndex(repeat, "repeat image index");
    runnable = await readManifest(parsed.platforms.get("linux/amd64").digest);
  }
  const manifest = parseImageManifest(runnable, "repeat linux/amd64 manifest");
  if (!manifest.layers.some((layer) => layer.digest === sourceLayerDigest)) {
    throw new Error("Clean repeat build produced a different static asset layer");
  }
  return runnable.digest;
}

export async function inspectOciArtifact({
  sourceReference,
  repeatReference,
  expectedRevision,
  expectedEpoch,
  readManifest,
  readBlob,
}) {
  const source = await readManifest(sourceReference);
  const { descriptors, platforms } = parseIndex(source, "source image index");
  const inspected = await inspectRunnable(platforms, readManifest, readBlob);
  const staticLayer = await sharedStaticLayer(inspected, readBlob);
  if (staticLayer.manifest.source_revision !== expectedRevision) {
    throw new Error("Static bundle revision does not match the reviewed source");
  }
  if (staticLayer.manifest.source_date_epoch !== expectedEpoch) {
    throw new Error("Static bundle epoch does not match the reviewed source");
  }
  const attestations = await verifyAttestations({
    descriptors,
    platforms,
    readManifest,
    readBlob,
  });
  const repeat = await readManifest(repeatReference);
  const repeatManifestDigest = await repeatStaticLayer(
    repeat,
    staticLayer.layer_digest,
    readManifest,
  );
  return {
    schema: "io.druff.oci-artifact-verification/v1",
    source_index_digest: source.digest,
    platform_manifests: Object.fromEntries(
      REQUIRED_PLATFORMS.map((platform) => [platform, platforms.get(platform).digest]),
    ),
    static_layer_digest: staticLayer.layer_digest,
    static_bundle_sha256: staticLayer.manifest.bundle_sha256,
    source_revision: expectedRevision,
    source_date_epoch: expectedEpoch,
    repeat_manifest_digest: repeatManifestDigest,
    attestations,
    reproducible_static_layer: true,
  };
}

export async function promoteExactIndex({
  sourceDigest,
  destinationTag,
  readManifest,
  writeManifest,
}) {
  if (!DIGEST.test(sourceDigest) || !TAG.test(destinationTag)) {
    throw new Error("OCI promotion references are invalid");
  }
  const source = await readManifest(sourceDigest);
  const parsed = parseIndex(source, "promotion source index");
  const writtenDigest = await writeManifest(destinationTag, source.body, source.mediaType);
  if (writtenDigest !== source.digest) {
    throw new Error("Registry changed the promoted OCI index digest");
  }
  const destination = await readManifest(destinationTag);
  if (
    destination.digest !== source.digest ||
    !Buffer.from(destination.body).equals(Buffer.from(source.body))
  ) {
    throw new Error("Promoted OCI index bytes differ from the source");
  }
  return {
    schema: "io.druff.oci-promotion-verification/v1",
    source_index_digest: source.digest,
    destination_index_digest: destination.digest,
    descriptor_digests: parsed.descriptors.map((descriptor) => descriptor.digest),
    copied_without_rebuild: true,
  };
}

function validateLocalRegistry(value) {
  const url = new URL(value);
  if (
    url.protocol !== "http:" ||
    !["127.0.0.1", "localhost"].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.pathname !== "/" && url.pathname !== "")
  ) {
    throw new Error("OCI artifact verification is restricted to a credential-free local registry");
  }
  return url.origin;
}

async function boundedBody(response, maximum, label) {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maximum) {
    throw new Error(`${label} exceeds its response bound`);
  }
  const body = Buffer.from(await response.arrayBuffer());
  if (body.byteLength > maximum) throw new Error(`${label} exceeds its response bound`);
  return body;
}

function registryClient(registry, repository) {
  const origin = validateLocalRegistry(registry);
  if (!REPOSITORY.test(repository)) throw new Error("OCI repository name is invalid");
  const base = `${origin}/v2/${repository}`;
  const accept = [
    "application/vnd.oci.image.index.v1+json",
    "application/vnd.docker.distribution.manifest.list.v2+json",
    "application/vnd.oci.image.manifest.v1+json",
    "application/vnd.docker.distribution.manifest.v2+json",
  ].join(", ");

  return {
    async readManifest(reference) {
      if (!DIGEST.test(reference) && !TAG.test(reference)) {
        throw new Error("OCI manifest reference is invalid");
      }
      const response = await fetch(`${base}/manifests/${reference}`, {
        headers: { Accept: accept },
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) throw new Error("Local registry could not read an OCI manifest");
      const body = await boundedBody(response, MAX_MANIFEST_BYTES, "OCI manifest");
      const digest = response.headers.get("docker-content-digest") || digestBytes(body);
      return {
        body,
        digest,
        mediaType: response.headers.get("content-type")?.split(";", 1)[0] || "",
      };
    },
    async readBlob(digest) {
      if (!DIGEST.test(digest)) throw new Error("OCI blob digest is invalid");
      const response = await fetch(`${base}/blobs/${digest}`, {
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) throw new Error("Local registry could not read an OCI blob");
      return boundedBody(response, MAX_BLOB_BYTES, "OCI blob");
    },
    async writeManifest(tag, body, mediaType) {
      if (!TAG.test(tag)) throw new Error("OCI destination tag is invalid");
      const response = await fetch(`${base}/manifests/${tag}`, {
        method: "PUT",
        headers: { "Content-Type": mediaType },
        body,
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) throw new Error("Local registry could not write the promoted OCI index");
      return response.headers.get("docker-content-digest") || "";
    },
  };
}

function writeRecord(path, document) {
  const temporary = `${path}.tmp`;
  try {
    writeFileSync(temporary, `${JSON.stringify(document, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });
    renameSync(temporary, path);
  } finally {
    rmSync(temporary, { force: true });
  }
}

function argumentsMap(argv) {
  const command = argv.shift();
  const values = {};
  while (argv.length > 0) {
    const key = argv.shift();
    const value = argv.shift();
    if (!key?.startsWith("--") || value === undefined) throw new Error("Invalid OCI arguments");
    values[key.slice(2)] = value;
  }
  return { command, values };
}

async function main() {
  const { command, values } = argumentsMap(process.argv.slice(2));
  const client = registryClient(values.registry, values.repository);
  let record;
  if (command === "inspect") {
    if (!/^[0-9a-f]{40}([0-9a-f]{24})?$/.test(values["expected-revision"] || "")) {
      throw new Error("Expected source revision must be a full Git object ID");
    }
    const epoch = Number(values["expected-epoch"]);
    if (!Number.isSafeInteger(epoch) || epoch < 0) throw new Error("Expected epoch is invalid");
    record = await inspectOciArtifact({
      sourceReference: values["source-tag"],
      repeatReference: values["repeat-tag"],
      expectedRevision: values["expected-revision"],
      expectedEpoch: epoch,
      readManifest: client.readManifest,
      readBlob: client.readBlob,
    });
  } else if (command === "promote") {
    record = await promoteExactIndex({
      sourceDigest: values["source-digest"],
      destinationTag: values["destination-tag"],
      readManifest: client.readManifest,
      writeManifest: client.writeManifest,
    });
  } else {
    throw new Error("OCI command must be inspect or promote");
  }
  if (!values.record) throw new Error("OCI verification requires --record");
  writeRecord(values.record, record);
  process.stdout.write(`${JSON.stringify(record)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(
      `OCI artifact verification failed: ${error instanceof Error ? error.message : "unknown error"}\n`,
    );
    process.exitCode = 1;
  });
}
