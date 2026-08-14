#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const expectedHeaders = JSON.parse(
  readFileSync(join(repoRoot, "artifact", "static-security-headers.json"), "utf8"),
);
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

function endpoint(baseUrl, path) {
  const url = new URL(path, baseUrl);
  if (!/^https?:$/.test(url.protocol) || url.username || url.password) {
    throw new Error("Static server URL must be credential-free HTTP(S)");
  }
  return url;
}

async function request(
  baseUrl,
  path,
  expectedStatus = 200,
  expectedCache = expectedHeaders["cache-control"],
) {
  const response = await fetch(endpoint(baseUrl, path), {
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (response.status !== expectedStatus) {
    throw new Error(`Static server returned ${response.status} for ${path}`);
  }
  for (const [name, expected] of Object.entries(expectedHeaders)) {
    const expectedValue = name === "cache-control" ? expectedCache : expected;
    const actual = response.headers.get(name);
    if (actual !== expectedValue) {
      throw new Error(`Static server returned an invalid ${name} header for ${path}`);
    }
  }
  return response;
}

export async function verifyStaticServer(baseUrl) {
  const root = await request(baseUrl, "/");
  if (!root.headers.get("content-type")?.startsWith("text/html")) {
    throw new Error("Static server root is not HTML");
  }
  await root.arrayBuffer();

  for (const route of [
    "/auth/callback?code=synthetic-code&state=synthetic-state",
    "/signed-out?state=synthetic-state",
  ]) {
    const response = await request(baseUrl, route);
    if (!response.headers.get("content-type")?.startsWith("text/html")) {
      throw new Error(`Static callback route is not HTML: ${route.split("?")[0]}`);
    }
    await response.arrayBuffer();
  }

  const missingBootstrap = await request(baseUrl, "/bootstrap.json", 404);
  await missingBootstrap.arrayBuffer();

  for (const path of ["/healthz", "/readyz"]) {
    const response = await request(baseUrl, path);
    if ((await response.text()) !== "ok\n") {
      throw new Error(`Static server returned an invalid probe body for ${path}`);
    }
  }

  const manifestResponse = await request(baseUrl, "/druff-artifact.json");
  const manifest = await manifestResponse.json();
  if (
    manifest?.schema !== "io.druff.static-artifact/v1" ||
    !/^[0-9a-f]{64}$/.test(manifest.bundle_sha256) ||
    !Array.isArray(manifest.files)
  ) {
    throw new Error("Static server returned an invalid artifact manifest");
  }
  const immutable = manifest.files.find(
    (file) => typeof file?.path === "string" && file.path.startsWith("_next/static/"),
  );
  if (!immutable) throw new Error("Static artifact has no immutable Next asset");
  const asset = await request(baseUrl, `/${immutable.path}`, 200, IMMUTABLE_CACHE);
  if (asset.headers.get("cache-control") !== IMMUTABLE_CACHE) {
    throw new Error("Hashed Next asset is missing immutable caching");
  }
  await asset.arrayBuffer();

  return {
    schema: "io.druff.static-server-verification/v1",
    bundle_sha256: manifest.bundle_sha256,
    callbacks: true,
    probes: true,
    security_headers: true,
    cache_rules: true,
  };
}

function parseBaseUrl(argv) {
  if (argv.length !== 2 || argv[0] !== "--base-url") {
    throw new Error("Usage: verify-static-server.mjs --base-url URL");
  }
  return argv[1];
}

async function main() {
  const result = await verifyStaticServer(parseBaseUrl(process.argv.slice(2)));
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(
      `Static server verification failed: ${error instanceof Error ? error.message : "unknown error"}\n`,
    );
    process.exitCode = 1;
  });
}
