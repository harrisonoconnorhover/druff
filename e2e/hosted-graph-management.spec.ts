import { expect, test, type Page, type Route } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { createServer, type Server } from "node:https";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import {
  DANDER_CONTRACT_BUNDLE_ID,
  DANDER_CONTRACT_BUNDLE_SHA256,
} from "../src/generated/dander-contracts/metadata";

let druffOrigin = "";
const ISSUER = "https://identity.example.test/tenant";
const API_ORIGIN = "https://control.example.test";
const PROJECT = "demo-project";

test.use({ ignoreHTTPSErrors: true });

let httpsProxy: Awaited<ReturnType<typeof startDruffHttpsProxy>>;
test.beforeEach(async () => {
  httpsProxy = await startDruffHttpsProxy();
});
test.afterEach(async () => {
  await httpsProxy.close();
});

type StoredGraph = {
  graph: string;
  document: Record<string, unknown>;
  revision: string;
  contentSha: string;
  createdAt: string;
  updatedAt: string;
};

type DurableControlState = {
  records: Map<string, StoredGraph>;
  creates: Map<string, StoredGraph>;
  deletes: Set<string>;
  revision: number;
  loseNextCreate: boolean;
  loseNextDelete: boolean;
};

function graphDocument(name: string, nodeName: string) {
  return {
    name,
    nodes: [
      {
        id: "source",
        type: "source",
        name: nodeName,
        visual: { position: { x: 20, y: 40 }, color: "green", icon: "database" },
      },
    ],
    edges: [],
  };
}

function nextRecord(
  durable: DurableControlState,
  graph: string,
  document: Record<string, unknown>,
  createdAt = "2026-08-14T10:00:00Z",
): StoredGraph {
  durable.revision += 1;
  return {
    graph,
    document,
    revision: `"revision-${durable.revision}"`,
    contentSha: durable.revision.toString(16).padStart(64, "0"),
    createdAt,
    updatedAt: `2026-08-14T10:00:${String(durable.revision).padStart(2, "0")}Z`,
  };
}

function resource(record: StoredGraph) {
  return {
    project: PROJECT,
    graph: record.graph,
    document: record.document,
    content_sha256: record.contentSha,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

function errorEnvelope(code: string, message: string) {
  return { error: { code, message, correlation_id: "e2e-correlation", details: [] } };
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": druffOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Authorization, Content-Type, If-Match, Idempotency-Key, X-Correlation-ID",
    "Access-Control-Expose-Headers": "ETag, X-Correlation-ID",
    "Content-Type": "application/json",
  };
}

async function startDruffHttpsProxy(): Promise<{ close(): Promise<void> }> {
  const exportRoot = resolve(process.cwd(), "out");
  if (!existsSync(join(exportRoot, "index.html"))) {
    throw new Error("Hosted Playwright acceptance requires a fresh `pnpm build` static export.");
  }
  const directory = mkdtempSync(join(tmpdir(), "druff-hosted-e2e-"));
  const keyPath = join(directory, "localhost-key.pem");
  const certificatePath = join(directory, "localhost.pem");
  execFileSync(
    "openssl",
    [
      "req",
      "-x509",
      "-newkey",
      "rsa:2048",
      "-nodes",
      "-keyout",
      keyPath,
      "-out",
      certificatePath,
      "-days",
      "1",
      "-subj",
      "/CN=localhost",
      "-addext",
      "subjectAltName=DNS:localhost,IP:127.0.0.1",
    ],
    { stdio: "ignore" },
  );
  const server: Server = createServer(
    { key: readFileSync(keyPath), cert: readFileSync(certificatePath) },
    (incoming, outgoing) => {
      if (incoming.url === "/bootstrap.json") {
        const body = JSON.stringify({
          schema_version: 1,
          api_url: API_ORIGIN,
          issuer: ISSUER,
          public_client_id: "druff-public-client",
          api_audience: `${API_ORIGIN}/api`,
          redirect_uri: `${druffOrigin}/auth/callback`,
          logout_uri: `${druffOrigin}/signed-out`,
          contract: { id: DANDER_CONTRACT_BUNDLE_ID, sha256: DANDER_CONTRACT_BUNDLE_SHA256 },
          compatibility: { minimum_druff_contract: "1.0.0", maximum_druff_contract: "1.x" },
        });
        outgoing.writeHead(200, {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          "Cache-Control": "no-store",
        });
        outgoing.end(body);
        return;
      }
      const url = new URL(incoming.url ?? "/", "https://localhost");
      let relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
      const rscRequest = incoming.headers.rsc === "1" || url.searchParams.has("_rsc");
      if (relative === "") relative = rscRequest ? "index.txt" : "index.html";
      else if (rscRequest && !extname(relative)) relative = `${relative}.txt`;
      let filePath = resolve(exportRoot, relative);
      if (!extname(filePath) && existsSync(`${filePath}.html`)) filePath = `${filePath}.html`;
      if (
        !filePath.startsWith(`${exportRoot}/`) ||
        !existsSync(filePath) ||
        !statSync(filePath).isFile()
      ) {
        outgoing.writeHead(404);
        outgoing.end();
        return;
      }
      outgoing.writeHead(200, {
        "Content-Type": contentType(filePath),
        "Content-Length": statSync(filePath).size,
        "Cache-Control": "no-store",
      });
      createReadStream(filePath).pipe(outgoing);
    },
  );
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  if (address === null || typeof address === "string") throw new Error("HTTPS proxy did not bind.");
  druffOrigin = `https://localhost:${address.port}`;
  return {
    async close() {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

function contentType(path: string): string {
  switch (extname(path)) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".woff2":
      return "font/woff2";
    case ".ico":
      return "image/x-icon";
    default:
      return "application/octet-stream";
  }
}

function json(route: Route, status: number, body: unknown, headers: Record<string, string> = {}) {
  return route.fulfill({
    status,
    headers: { ...corsHeaders(), ...headers },
    body: JSON.stringify(body),
  });
}

function createControlService(durable: DurableControlState) {
  return async (route: Route): Promise<void> => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders() });
      return;
    }
    if (request.headers().authorization !== "Bearer e2e-access-token") {
      await json(route, 401, errorEnvelope("authentication_required", "Sign in again."));
      return;
    }
    if (url.pathname === "/v1/projects" && request.method() === "GET") {
      await json(route, 200, { projects: [{ id: PROJECT }] });
      return;
    }
    if (url.pathname === `/v1/projects/${PROJECT}/graphs` && request.method() === "GET") {
      const records = [...durable.records.values()].sort((left, right) =>
        left.graph.localeCompare(right.graph),
      );
      const start = url.searchParams.get("cursor") === "page-2" ? 1 : 0;
      const selected = records.slice(start, start + 1);
      await json(route, 200, {
        items: selected.map((record) => ({
          project: PROJECT,
          graph: record.graph,
          content_sha256: record.contentSha,
          created_at: record.createdAt,
          updated_at: record.updatedAt,
        })),
        next_cursor: start + 1 < records.length ? "page-2" : null,
      });
      return;
    }
    if (url.pathname === `/v1/projects/${PROJECT}/graphs` && request.method() === "POST") {
      const key = request.headers()["idempotency-key"]!;
      const replay = durable.creates.get(key);
      if (replay) {
        await json(route, 201, resource(replay), { ETag: replay.revision });
        return;
      }
      const body = JSON.parse(request.postData() ?? "{}") as {
        graph: string;
        document: Record<string, unknown>;
      };
      if (durable.records.has(body.graph)) {
        await json(route, 409, errorEnvelope("graph_exists", "That graph already exists."));
        return;
      }
      const created = nextRecord(durable, body.graph, body.document);
      durable.records.set(body.graph, created);
      durable.creates.set(key, created);
      if (durable.loseNextCreate) {
        durable.loseNextCreate = false;
        await route.abort("connectionrefused");
        return;
      }
      await json(route, 201, resource(created), { ETag: created.revision });
      return;
    }

    const match = /^\/v1\/projects\/demo-project\/graphs\/([^/]+)$/.exec(url.pathname);
    if (match) {
      const graph = decodeURIComponent(match[1]!);
      const current = durable.records.get(graph);
      if (request.method() === "GET") {
        if (!current) {
          await json(route, 404, errorEnvelope("graph_not_found", "The graph does not exist."));
          return;
        }
        await json(route, 200, resource(current), { ETag: current.revision });
        return;
      }
      if (request.method() === "PUT") {
        if (!current || request.headers()["if-match"] !== current.revision) {
          await json(route, 409, errorEnvelope("graph_conflict", "The graph revision changed."));
          return;
        }
        const updated = nextRecord(
          durable,
          graph,
          JSON.parse(request.postData() ?? "{}") as Record<string, unknown>,
          current.createdAt,
        );
        durable.records.set(graph, updated);
        await json(route, 200, resource(updated), { ETag: updated.revision });
        return;
      }
      if (request.method() === "DELETE") {
        const key = request.headers()["idempotency-key"]!;
        if (durable.deletes.has(key)) {
          await route.fulfill({ status: 204, headers: corsHeaders() });
          return;
        }
        if (!current || request.headers()["if-match"] !== current.revision) {
          await json(route, 409, errorEnvelope("graph_conflict", "The graph revision changed."));
          return;
        }
        durable.records.delete(graph);
        durable.deletes.add(key);
        if (durable.loseNextDelete) {
          durable.loseNextDelete = false;
          await route.abort("connectionrefused");
          return;
        }
        await route.fulfill({ status: 204, headers: corsHeaders() });
        return;
      }
    }
    await json(route, 404, errorEnvelope("not_found", "Synthetic route missing."));
  };
}

function unsignedIdToken(nonce: string): string {
  const encoded = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  return `${encoded({ alg: "none", typ: "JWT" })}.${encoded({
    iss: ISSUER,
    aud: "druff-public-client",
    sub: "e2e-person",
    nonce,
    iat: now,
    exp: now + 3600,
  })}.`;
}

async function installHostedRoutes(page: Page, durable: DurableControlState) {
  let nonce = "";
  let service = createControlService(durable);
  const restart = () => {
    service = createControlService(durable);
  };

  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.href === `${ISSUER}/.well-known/openid-configuration`) {
      await json(route, 200, {
        issuer: ISSUER,
        authorization_endpoint: `${ISSUER}/authorize`,
        token_endpoint: `${ISSUER}/token`,
        jwks_uri: `${ISSUER}/jwks`,
      });
      return;
    }
    if (url.href.startsWith(`${ISSUER}/authorize?`)) {
      nonce = url.searchParams.get("nonce") ?? "";
      const state = url.searchParams.get("state")!;
      const redirect = url.searchParams.get("redirect_uri")!;
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `<script>location.replace(${JSON.stringify(`${redirect}?code=e2e-code&state=${encodeURIComponent(state)}`)})</script>`,
      });
      return;
    }
    if (url.href === `${ISSUER}/token`) {
      await json(route, 200, {
        access_token: "e2e-access-token",
        token_type: "Bearer",
        expires_in: 3600,
        id_token: unsignedIdToken(nonce),
      });
      return;
    }
    if (url.origin === API_ORIGIN) {
      await service(route);
      return;
    }
    await route.continue();
  });
  return restart;
}

async function signIn(page: Page, browserEvents: string[]) {
  await page.getByRole("button", { name: "Sign in" }).first().click();
  await expect(page.getByText("Hosted session", { exact: true }))
    .toBeVisible()
    .catch(async () => {
      throw new Error(
        `Hosted sign-in failed at ${page.url()}:\n${browserEvents.join("\n")}\n${await page.locator("body").innerText()}`,
      );
    });
}

test("manages hosted graphs safely across conflicts, ambiguous retries, and service restart", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const browserEvents: string[] = [];
  page.on("console", (message) =>
    browserEvents.push(`console ${message.type()}: ${message.text()}`),
  );
  page.on("requestfailed", (request) =>
    browserEvents.push(
      `failed ${request.method()} ${request.url()}: ${request.failure()?.errorText}`,
    ),
  );
  page.on("request", (request) => {
    if (
      request.url().includes("bootstrap.json") ||
      request.url().startsWith(ISSUER) ||
      request.url().startsWith(API_ORIGIN) ||
      (request.url().startsWith(druffOrigin) &&
        (request.url().includes("_rsc") || request.url().endsWith(".txt")))
    ) {
      browserEvents.push(`request ${request.method()} ${request.url()}`);
    }
  });
  page.on("response", (response) => {
    if (response.url().includes("bootstrap.json")) {
      browserEvents.push(`response ${response.status()} ${response.url()}`);
    }
  });
  const durable: DurableControlState = {
    records: new Map(),
    creates: new Map(),
    deletes: new Set(),
    revision: 0,
    loseNextCreate: false,
    loseNextDelete: false,
  };
  const alpha = nextRecord(durable, "alpha-graph", graphDocument("alpha-pipeline", "Source"));
  const beta = nextRecord(durable, "beta-graph", graphDocument("beta-pipeline", "Beta source"));
  durable.records.set(alpha.graph, alpha);
  durable.records.set(beta.graph, beta);
  const restartService = await installHostedRoutes(page, durable);

  await page.goto(`${druffOrigin}/`);
  await expect(page.getByRole("button", { name: "Sign in" }).first())
    .toBeVisible({ timeout: 8_000 })
    .catch(() => {
      throw new Error(`Hosted bootstrap did not settle:\n${browserEvents.join("\n")}`);
    });
  await signIn(page, browserEvents);
  await page.getByRole("button", { name: "Browse hosted graphs" }).click();
  await expect(page.getByText("alpha-graph", { exact: true })).toBeVisible();
  await expect(page.getByText("beta-graph", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Load more" }).click();
  await expect(page.getByText("beta-graph", { exact: true })).toBeVisible();
  await page
    .getByRole("listitem")
    .filter({ hasText: "alpha-graph" })
    .getByRole("button", { name: "Open" })
    .click();

  const source = page.locator(".react-flow__node", { hasText: "Source" });
  await source.click();
  await page.getByLabel("Name", { exact: true }).fill("Client edit");
  await page.getByRole("button", { name: "Save hosted graph" }).click();
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();

  const serverRecord = durable.records.get("alpha-graph")!;
  durable.records.set(
    "alpha-graph",
    nextRecord(
      durable,
      "alpha-graph",
      graphDocument("alpha-pipeline", "Server edit"),
      serverRecord.createdAt,
    ),
  );
  await page.locator(".react-flow__node", { hasText: "Client edit" }).click();
  await page.getByLabel("Name", { exact: true }).fill("Conflicting client edit");
  await page.getByRole("button", { name: "Save hosted graph" }).click();
  await expect(page.getByText("File changed elsewhere — reopen", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reload hosted version" }).click();
  await expect(page.locator(".react-flow__node", { hasText: "Server edit" })).toBeVisible();

  durable.loseNextDelete = true;
  await page.getByRole("button", { name: "Delete" }).click();
  const confirmation = page.getByRole("dialog", { name: "Delete hosted graph?" });
  await confirmation.getByRole("button", { name: "Delete hosted graph" }).click();
  await expect(confirmation.getByRole("button", { name: "Delete hosted graph" })).toBeVisible();
  restartService();
  await confirmation.getByRole("button", { name: "Delete hosted graph" }).click();
  await expect(page.getByText("Local draft", { exact: true })).toBeVisible();
  await expect(page.locator(".react-flow__node", { hasText: "Server edit" })).toBeVisible();

  durable.loseNextCreate = true;
  await page.getByRole("button", { name: "Browse hosted graphs" }).click();
  await page.getByLabel("Create from current local draft").fill("restart-graph");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByText(/could not reach/i)).toBeVisible();
  restartService();
  await page.getByRole("button", { name: "Browse hosted graphs" }).click();
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();

  restartService();
  await page.reload();
  await signIn(page, browserEvents);
  await page.getByRole("button", { name: "Browse hosted graphs" }).click();
  await page.getByRole("button", { name: "Load more" }).click();
  await page
    .getByRole("listitem")
    .filter({ hasText: "restart-graph" })
    .getByRole("button", { name: "Open" })
    .click();
  await expect(page.locator(".react-flow__node", { hasText: "Server edit" })).toBeVisible();
  await expect(page.getByLabel("Hosted graph identity")).toContainText(
    "demo-project/restart-graph",
  );
});
