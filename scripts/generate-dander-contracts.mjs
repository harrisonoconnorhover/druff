#!/usr/bin/env node

import { createHash } from "node:crypto";
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import Ajv2020 from "ajv/dist/2020.js";
import standaloneCode from "ajv/dist/standalone/index.js";
import { compile } from "json-schema-to-typescript";
import { format, resolveConfig } from "prettier";

const DANDER_PACKAGE = "dander-platform";
const DANDER_VERSION = "0.9.0rc18";
const WHEEL_FILENAME = "dander_platform-0.9.0rc18-py3-none-any.whl";
const WHEEL_SHA256 = "4500b32451c02b6331a337b6d38eb96cc49a29838b6e3ea5a2b87b9daf85406c";
const BUNDLE_ID = "io.dander.control.contracts/v1";
const BUNDLE_SHA256 = "344ef5ff2d685d5bedf7a1ddb119a42a6de08d90f285dc0a981e79c55452c1ed";
const BUNDLE_PATH = join("dander", "control", "contracts", "v1");

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const committedOutput = join(repoRoot, "src", "generated", "dander-contracts");
const prettierConfig = resolveConfig(join(repoRoot, "package.json"));

const roots = [
  ["api-error", "ApiErrorEnvelope", "validateApiError"],
  ["capabilities", "CapabilitiesResponse", "validateCapabilities"],
  ["connector-catalog", "ConnectorCatalogResponse", "validateConnectorCatalog"],
  ["deployment-preview", "DeploymentPreviewResponse", "validateDeploymentPreview"],
  ["graph-validation", "GraphValidationResponse", "validateGraphValidation"],
  ["log-page", "LogPageResponse", "validateLogPage"],
  ["mutation-result", "MutationResult", "validateMutationResult"],
  ["operation-catalog", "OperationCatalogResponse", "validateOperationCatalog"],
  ["pipeline-graph", "PipelineGraphDocument", "validatePipelineGraph"],
  ["plugin-catalog", "PluginCatalogResponse", "validatePluginCatalog"],
  ["run-request", "RunRequest", "validateRunRequest"],
  ["run-status", "RunStatusResponse", "validateRunStatus"],
];

const pipelineDefinitions = [
  ["GraphNodeDocument", "validatePipelineNode"],
  ["NodeFieldDocument", "validateNodeField"],
  ["FieldTestDocument", "validateFieldTest"],
  ["CursorStrategyDocument", "validateCursorStrategy"],
  ["PositionDocument", "validatePosition"],
  ["NodeVisualDocument", "validateNodeVisual"],
  ["TransformationDocument", "validateTransformation"],
  ["FieldMappingDocument", "validateFieldMapping"],
  ["JoinKeyPairDocument", "validateJoinKeyPair"],
  ["JoinDocument", "validateJoin"],
  ["EdgeDocument", "validatePipelineEdge"],
  ["TriggerDocument", "validateTrigger"],
  ["DestinationDocument", "validateDestination"],
  ["PartitioningDocument", "validatePartitioning"],
  ["WriterDocument", "validateWriter"],
];

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function fail(message) {
  throw new Error(`[generate-dander-contracts] ${message}`);
}

async function fetchPublishedWheel(destination) {
  const metadataUrl = `https://pypi.org/pypi/${DANDER_PACKAGE}/${DANDER_VERSION}/json`;
  const metadataResponse = await fetch(metadataUrl);
  if (!metadataResponse.ok) {
    fail(
      `PyPI metadata request failed (${metadataResponse.status} ${metadataResponse.statusText})`,
    );
  }
  const metadata = await metadataResponse.json();
  const wheel = metadata.urls?.find(
    (file) => file.filename === WHEEL_FILENAME && file.packagetype === "bdist_wheel",
  );
  if (!wheel) fail(`PyPI release does not contain ${WHEEL_FILENAME}`);
  if (wheel.digests?.sha256 !== WHEEL_SHA256) {
    fail(`PyPI metadata reports an unexpected wheel digest for ${WHEEL_FILENAME}`);
  }

  const wheelResponse = await fetch(wheel.url);
  if (!wheelResponse.ok) {
    fail(`wheel download failed (${wheelResponse.status} ${wheelResponse.statusText})`);
  }
  const content = Buffer.from(await wheelResponse.arrayBuffer());
  if (sha256(content) !== WHEEL_SHA256) fail("downloaded wheel digest does not match the pin");
  await writeFile(destination, content);
}

async function listFiles(directory) {
  const files = [];
  async function visit(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) files.push(path);
    }
  }
  await visit(directory);
  return files.sort();
}

function safeBundleRelativePath(value) {
  if (typeof value !== "string" || value.length === 0) fail("manifest contains an empty path");
  const normalized = value.split("/").join(sep);
  if (normalized.startsWith(sep) || normalized.split(sep).includes("..")) {
    fail(`manifest contains an unsafe path: ${value}`);
  }
  return normalized;
}

async function verifyBundle(bundleDirectory) {
  const manifestContent = await readFile(join(bundleDirectory, "manifest.json"));
  const manifest = JSON.parse(manifestContent.toString("utf8"));
  if (manifest.bundle_id !== BUNDLE_ID) fail(`unexpected bundle id: ${manifest.bundle_id}`);
  if (manifest.bundle_sha256 !== BUNDLE_SHA256)
    fail("manifest bundle digest does not match the pin");

  const digest = createHash("sha256");
  const expectedFiles = new Set(["manifest.json"]);
  for (const entry of [...manifest.files].sort((left, right) =>
    left.path.localeCompare(right.path),
  )) {
    const relativePath = safeBundleRelativePath(entry.path);
    expectedFiles.add(entry.path);
    const content = await readFile(join(bundleDirectory, relativePath));
    if (sha256(content) !== entry.sha256) fail(`manifest digest mismatch for ${entry.path}`);
    digest.update(entry.path, "utf8");
    digest.update("\0", "utf8");
    digest.update(content);
  }
  if (digest.digest("hex") !== BUNDLE_SHA256) fail("computed bundle digest does not match the pin");

  const actualFiles = new Set(
    (await listFiles(bundleDirectory)).map((path) =>
      relative(bundleDirectory, path).split(sep).join("/"),
    ),
  );
  if (
    actualFiles.size !== expectedFiles.size ||
    [...actualFiles].some((path) => !expectedFiles.has(path))
  ) {
    fail("published bundle files differ from the signed manifest inventory");
  }
  return manifest;
}

async function writeFormatted(path, content, parser = "typescript") {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, await format(content, { ...(await prettierConfig), parser }));
}

async function copyBundle(bundleDirectory, outputDirectory) {
  for (const source of await listFiles(bundleDirectory)) {
    const target = join(outputDirectory, "bundle", relative(bundleDirectory, source));
    await mkdir(dirname(target), { recursive: true });
    await copyFile(source, target);
  }
}

async function generateTypes(bundleDirectory, outputDirectory) {
  const bannerComment = [
    "/**",
    ` * Generated from ${DANDER_PACKAGE}==${DANDER_VERSION} (${WHEEL_FILENAME}).`,
    ` * Wheel SHA256: ${WHEEL_SHA256}`,
    ` * Contract bundle: ${BUNDLE_ID} (${BUNDLE_SHA256})`,
    " * Do not edit by hand; run `pnpm contracts:generate`.",
    " */",
  ].join("\n");

  for (const [contractName, rootType] of roots) {
    const schema = JSON.parse(
      await readFile(join(bundleDirectory, "schemas", `${contractName}.schema.json`), "utf8"),
    );
    const source = await compile(schema, rootType, {
      bannerComment,
      cwd: bundleDirectory,
      declareExternallyReferenced: true,
      enableConstEnums: false,
      format: false,
      strictIndexSignatures: true,
      unreachableDefinitions: true,
      unknownAny: true,
    });
    await writeFormatted(join(outputDirectory, "types", `${contractName}.ts`), source);
  }
}

async function generateValidators(bundleDirectory, outputDirectory) {
  const ajv = new Ajv2020({
    allErrors: true,
    code: { esm: true, lines: true, source: true },
    coerceTypes: false,
    removeAdditional: false,
    strict: true,
    strictRequired: false,
    useDefaults: false,
    validateFormats: false,
  });
  ajv.addKeyword({ keyword: "x-dander-canonical-name", schemaType: "string", valid: true });
  const schemas = new Map();
  for (const [contractName] of roots) {
    const schema = JSON.parse(
      await readFile(join(bundleDirectory, "schemas", `${contractName}.schema.json`), "utf8"),
    );
    schemas.set(contractName, schema);
    ajv.addSchema(schema);
  }

  const validators = {};
  for (const [contractName, , validatorName] of roots) {
    const schema = schemas.get(contractName);
    const validator = ajv.getSchema(schema.$id);
    if (!validator) fail(`Ajv did not register ${contractName}`);
    validators[validatorName] = schema.$id;
  }

  const pipelineSchema = schemas.get("pipeline-graph");
  for (const [definitionName, validatorName] of pipelineDefinitions) {
    const id = `urn:druff:generated:${definitionName}`;
    ajv.compile({
      $id: id,
      $ref: `${pipelineSchema.$id}#/$defs/${definitionName}`,
    });
    validators[validatorName] = id;
  }

  const source = [
    `// Generated from ${DANDER_PACKAGE}==${DANDER_VERSION}; do not edit.`,
    `// Contract bundle ${BUNDLE_ID} (${BUNDLE_SHA256}).`,
    standaloneCode(ajv, validators),
  ].join("\n");
  await writeFormatted(join(outputDirectory, "validators.js"), source, "babel");

  const declarationLines = [
    'import type { ValidateFunction } from "ajv";',
    ...roots.map(
      ([contractName, rootType]) => `import type { ${rootType} } from "./types/${contractName}";`,
    ),
    `import type { ${pipelineDefinitions.map(([name]) => name).join(", ")} } from "./types/pipeline-graph";`,
    "",
    ...roots.map(
      ([, rootType, validatorName]) =>
        `export const ${validatorName}: ValidateFunction<${rootType}>;`,
    ),
    ...pipelineDefinitions.map(
      ([definitionName, validatorName]) =>
        `export const ${validatorName}: ValidateFunction<${definitionName}>;`,
    ),
  ];
  await writeFormatted(join(outputDirectory, "validators.d.ts"), declarationLines.join("\n"));
}

async function generateMetadata(outputDirectory) {
  const source = `
    /** Generated from the exact published Dander wheel; do not edit by hand. */
    export const DANDER_CONTRACT_PACKAGE = ${JSON.stringify(DANDER_PACKAGE)} as const;
    export const DANDER_CONTRACT_PACKAGE_VERSION = ${JSON.stringify(DANDER_VERSION)} as const;
    export const DANDER_CONTRACT_WHEEL = ${JSON.stringify(WHEEL_FILENAME)} as const;
    export const DANDER_CONTRACT_WHEEL_SHA256 = ${JSON.stringify(WHEEL_SHA256)} as const;
    export const DANDER_CONTRACT_BUNDLE_ID = ${JSON.stringify(BUNDLE_ID)} as const;
    export const DANDER_CONTRACT_BUNDLE_SHA256 = ${JSON.stringify(BUNDLE_SHA256)} as const;
  `;
  await writeFormatted(join(outputDirectory, "metadata.ts"), source);
}

async function generate(outputDirectory, workingDirectory) {
  await mkdir(workingDirectory, { recursive: true });
  const wheelPath = join(workingDirectory, WHEEL_FILENAME);
  const extracted = join(workingDirectory, "wheel");
  await fetchPublishedWheel(wheelPath);
  await mkdir(extracted, { recursive: true });
  const unzip = spawnSync("unzip", ["-q", wheelPath, "-d", extracted], { encoding: "utf8" });
  if (unzip.status !== 0) fail(`could not unpack wheel: ${unzip.stderr || unzip.stdout}`);

  const bundleDirectory = join(extracted, BUNDLE_PATH);
  await verifyBundle(bundleDirectory);
  await rm(outputDirectory, { force: true, recursive: true });
  await mkdir(outputDirectory, { recursive: true });
  await copyBundle(bundleDirectory, outputDirectory);
  await generateTypes(bundleDirectory, outputDirectory);
  await generateValidators(bundleDirectory, outputDirectory);
  await generateMetadata(outputDirectory);
}

async function compareDirectories(expected, actual) {
  const expectedFiles = (await listFiles(expected)).map((path) => relative(expected, path));
  const actualFiles = (await listFiles(actual)).map((path) => relative(actual, path));
  const paths = [...new Set([...expectedFiles, ...actualFiles])].sort();
  const differences = [];
  for (const path of paths) {
    let expectedContent;
    let actualContent;
    try {
      expectedContent = await readFile(join(expected, path));
    } catch {
      differences.push(`${path} (missing from generated output)`);
      continue;
    }
    try {
      actualContent = await readFile(join(actual, path));
    } catch {
      differences.push(`${path} (missing from committed output)`);
      continue;
    }
    if (!expectedContent.equals(actualContent)) differences.push(path);
  }
  return differences;
}

async function main() {
  const check = process.argv.slice(2).includes("--check");
  const unknownArguments = process.argv.slice(2).filter((argument) => argument !== "--check");
  if (unknownArguments.length > 0) fail(`unknown arguments: ${unknownArguments.join(", ")}`);

  const workingDirectory = await mkdtemp(join(tmpdir(), "druff-contracts-"));
  try {
    if (check) {
      const generated = join(workingDirectory, "generated");
      await generate(generated, join(workingDirectory, "work"));
      const differences = await compareDirectories(generated, committedOutput);
      if (differences.length > 0) {
        fail(`generated contract drift:\n${differences.map((path) => `  - ${path}`).join("\n")}`);
      }
      console.log(`[generate-dander-contracts] ${basename(committedOutput)} is current`);
    } else {
      const generationWork = join(workingDirectory, "work");
      await mkdir(generationWork, { recursive: true });
      await generate(committedOutput, generationWork);
      console.log(`[generate-dander-contracts] wrote ${relative(repoRoot, committedOutput)}`);
    }
  } finally {
    await rm(workingDirectory, { force: true, recursive: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
