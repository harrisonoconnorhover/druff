import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import test from "node:test";
import { digestBytes, inspectOciArtifact, promoteExactIndex } from "./oci-artifact.mjs";

const IMAGE_MANIFEST = "application/vnd.oci.image.manifest.v1+json";
const IMAGE_INDEX = "application/vnd.oci.image.index.v1+json";
const JSON_CONFIG = "application/vnd.oci.image.config.v1+json";
const GZIP_LAYER = "application/vnd.oci.image.layer.v1.tar+gzip";
const IN_TOTO = "application/vnd.in-toto+json";
const REVISION = "a".repeat(40);
const EPOCH = 1_700_000_000;

function json(value) {
  return Buffer.from(JSON.stringify(value));
}

function descriptor(bytes, mediaType, extra = {}) {
  return { mediaType, digest: digestBytes(bytes), size: bytes.byteLength, ...extra };
}

function staticLayer() {
  const body = json({
    schema: "io.druff.static-artifact/v1",
    bundle_sha256: "b".repeat(64),
    source_revision: REVISION,
    source_date_epoch: EPOCH,
  });
  const header = Buffer.alloc(512);
  header.write("app/druff-artifact.json", 0, "utf8");
  header.write("00000000644\0", 100, "ascii");
  header.write(`${body.byteLength.toString(8).padStart(11, "0")}\0`, 124, "ascii");
  header[156] = 48;
  const padding = Buffer.alloc(Math.ceil(body.byteLength / 512) * 512 - body.byteLength);
  return gzipSync(Buffer.concat([header, body, padding, Buffer.alloc(1_024)]));
}

function fixture({ armUser = "65532:65532", armSbom = true } = {}) {
  const manifests = new Map();
  const blobs = new Map();
  const layer = staticLayer();
  const layerDescriptor = descriptor(layer, GZIP_LAYER);
  blobs.set(layerDescriptor.digest, layer);
  const platformDescriptors = new Map();

  for (const [platform, architecture, user] of [
    ["linux/amd64", "amd64", "65532:65532"],
    ["linux/arm64", "arm64", armUser],
  ]) {
    const config = json({ architecture, os: "linux", config: { User: user } });
    const configDescriptor = descriptor(config, JSON_CONFIG);
    blobs.set(configDescriptor.digest, config);
    const manifest = json({
      schemaVersion: 2,
      mediaType: IMAGE_MANIFEST,
      config: configDescriptor,
      layers: [layerDescriptor],
    });
    const runnable = descriptor(manifest, IMAGE_MANIFEST, {
      platform: { os: "linux", architecture },
    });
    manifests.set(runnable.digest, {
      body: manifest,
      digest: runnable.digest,
      mediaType: IMAGE_MANIFEST,
    });
    platformDescriptors.set(platform, runnable);
  }

  const attestationDescriptors = [];
  for (const platform of ["linux/amd64", "linux/arm64"]) {
    const subjectDigest = platformDescriptors.get(platform).digest;
    const predicates = ["https://slsa.dev/provenance/v0.2"];
    if (platform !== "linux/arm64" || armSbom) predicates.push("https://spdx.dev/Document");
    const layers = predicates.map((predicateType) => {
      const statement = json({
        _type: "https://in-toto.io/Statement/v0.1",
        subject: [{ name: "_", digest: { sha256: subjectDigest.slice(7) } }],
        predicateType,
        predicate: {},
      });
      const layer = descriptor(statement, IN_TOTO);
      blobs.set(layer.digest, statement);
      return layer;
    });
    const emptyConfig = json({});
    const emptyConfigDescriptor = descriptor(emptyConfig, JSON_CONFIG);
    blobs.set(emptyConfigDescriptor.digest, emptyConfig);
    const attestation = json({
      schemaVersion: 2,
      mediaType: IMAGE_MANIFEST,
      config: emptyConfigDescriptor,
      layers,
    });
    const attestationDescriptor = descriptor(attestation, IMAGE_MANIFEST, {
      platform: { os: "unknown", architecture: "unknown" },
      annotations: {
        "vnd.docker.reference.digest": subjectDigest,
        "vnd.docker.reference.type": "attestation-manifest",
      },
    });
    manifests.set(attestationDescriptor.digest, {
      body: attestation,
      digest: attestationDescriptor.digest,
      mediaType: IMAGE_MANIFEST,
    });
    attestationDescriptors.push(attestationDescriptor);
  }

  const index = json({
    schemaVersion: 2,
    mediaType: IMAGE_INDEX,
    manifests: [...platformDescriptors.values(), ...attestationDescriptors],
  });
  const indexResult = { body: index, digest: digestBytes(index), mediaType: IMAGE_INDEX };
  manifests.set("source", indexResult);
  manifests.set(indexResult.digest, indexResult);
  manifests.set("repeat", manifests.get(platformDescriptors.get("linux/amd64").digest));

  return {
    indexResult,
    platformDescriptors,
    manifests,
    blobs,
    readManifest: async (reference) => {
      const result = manifests.get(reference);
      if (!result) throw new Error(`missing synthetic manifest ${reference}`);
      return result;
    },
    readBlob: async (digest) => {
      const result = blobs.get(digest);
      if (!result) throw new Error(`missing synthetic blob ${digest}`);
      return result;
    },
  };
}

test("OCI inspection binds both platforms, attestations, user, and repeat static layer", async () => {
  const value = fixture();
  const record = await inspectOciArtifact({
    sourceReference: "source",
    repeatReference: "repeat",
    expectedRevision: REVISION,
    expectedEpoch: EPOCH,
    readManifest: value.readManifest,
    readBlob: value.readBlob,
  });

  assert.equal(record.source_index_digest, value.indexResult.digest);
  assert.deepEqual(Object.keys(record.platform_manifests), ["linux/amd64", "linux/arm64"]);
  assert.equal(record.static_bundle_sha256, "b".repeat(64));
  assert.equal(record.reproducible_static_layer, true);
});

test("OCI inspection rejects a missing platform, wrong runtime user, or missing associated SBOM", async () => {
  const missing = fixture();
  const document = JSON.parse(missing.indexResult.body);
  document.manifests = document.manifests.filter(
    (entry) => !(entry.platform?.os === "linux" && entry.platform?.architecture === "arm64"),
  );
  const body = json(document);
  missing.manifests.set("source", { body, digest: digestBytes(body), mediaType: IMAGE_INDEX });
  await assert.rejects(
    inspectOciArtifact({
      sourceReference: "source",
      repeatReference: "repeat",
      expectedRevision: REVISION,
      expectedEpoch: EPOCH,
      readManifest: missing.readManifest,
      readBlob: missing.readBlob,
    }),
    /missing linux\/arm64/,
  );

  for (const [options, pattern] of [
    [{ armUser: "root" }, /UID\/GID/],
    [{ armSbom: false }, /missing an associated SPDX/],
  ]) {
    const value = fixture(options);
    await assert.rejects(
      inspectOciArtifact({
        sourceReference: "source",
        repeatReference: "repeat",
        expectedRevision: REVISION,
        expectedEpoch: EPOCH,
        readManifest: value.readManifest,
        readBlob: value.readBlob,
      }),
      pattern,
    );
  }
});

test("OCI promotion copies the exact index bytes and rejects registry rewriting", async () => {
  const value = fixture();
  let destination = null;
  const readManifest = async (reference) =>
    reference === "promoted" ? destination : value.readManifest(reference);
  const writeManifest = async (_tag, body) => {
    destination = {
      body: Buffer.from(body),
      digest: digestBytes(body),
      mediaType: IMAGE_INDEX,
    };
    return destination.digest;
  };
  const record = await promoteExactIndex({
    sourceDigest: value.indexResult.digest,
    destinationTag: "promoted",
    readManifest,
    writeManifest,
  });
  assert.equal(record.copied_without_rebuild, true);
  assert.equal(record.destination_index_digest, value.indexResult.digest);

  await assert.rejects(
    promoteExactIndex({
      sourceDigest: value.indexResult.digest,
      destinationTag: "changed",
      readManifest: value.readManifest,
      writeManifest: async () => `sha256:${"f".repeat(64)}`,
    }),
    /changed the promoted OCI index digest/,
  );
});
