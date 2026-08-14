import { PipelineGraphSchema, type GraphLayout, type PipelineGraph } from "@/lib/pipeline-graph";
import { localNetworkRequest } from "@/lib/local-network-request";
import type { HostedControlFetch } from "@/features/hosted-control/authorized-fetch";
import {
  ApiErrorEnvelopeSchema,
  GraphCreateRequestSchema,
  GraphPageResponseSchema,
  GraphResourceResponseSchema,
  ProjectListResponseSchema,
  type GraphPageResponse,
} from "@/lib/dander-contracts";

/** On-disk envelope version. Bump when the stored shape changes incompatibly; `load()` treats any
 * other version as absent rather than attempting a migration (none is needed yet). */
const ENVELOPE_VERSION = 1;

/** Namespaced, versioned localStorage key (`druff.graph.v1`) — deliberately distinct from a plain
 * `"graph"` key so a version bump can land as a new key without an explicit migration step. */
const STORAGE_KEY = "druff.graph.v1";

/**
 * The full local snapshot of a graph: the pure Dander `PipelineGraph` (DRUFF-4) plus the
 * app-only `positions` sidecar (`GraphLayout`, keyed by node id) that Dander's graph format has no
 * room for. Kept as two fields rather than smuggling positions into the graph itself, so the
 * shared-with-Dander contract stays clean (see DRUFF-4's `canvas-convert.ts`).
 */
export type GraphSnapshot = {
  graph: PipelineGraph;
  positions: GraphLayout;
};

/** A canonical graph opened from Dander and the exact HTTP revision required for its next save. */
export type GraphDocument = {
  graph: PipelineGraph;
  revision: string;
  address?: GraphAddress;
  contentSha256?: string;
};

export type GraphAddress = {
  project: string;
  graph: string;
};

export type GraphSummary = GraphPageResponse["items"][number];

export type GraphPage = {
  items: GraphSummary[];
  nextCursor: string | null;
};

/**
 * Async persistence seam for canonical graphs. Dander's local API is the authority: implementations
 * return a revision on open and require that revision on save so a browser cannot overwrite a file
 * that changed elsewhere.
 */
export interface GraphPersistence {
  load(address?: GraphAddress): Promise<GraphDocument>;
  save(graph: PipelineGraph, revision: string, address?: GraphAddress): Promise<GraphDocument>;
}

/** The collection operations available only from Dander's hosted project/graph API. */
export interface ManagedGraphPersistence extends GraphPersistence {
  readonly mode: "collection";
  listProjects(): Promise<string[]>;
  listGraphs(project: string, cursor?: string | null): Promise<GraphPage>;
  create(address: GraphAddress, graph: PipelineGraph): Promise<GraphDocument>;
  delete(address: GraphAddress, revision: string): Promise<void>;
}

export class GraphPersistenceError extends Error {
  readonly conflict: boolean;

  constructor(message: string, options: { conflict?: boolean } = {}) {
    super(message);
    this.name = "GraphPersistenceError";
    this.conflict = options.conflict ?? false;
  }
}

type FetchGraph = typeof fetch;

const PAGE_SIZE = 50;

type PendingMutation = {
  fingerprint: string;
  idempotencyKey: string;
};

/** Generated-contract client for Dander's provider-neutral hosted graph collection. */
export class HostedGraphPersistence implements ManagedGraphPersistence {
  readonly mode = "collection" as const;
  private readonly request: HostedControlFetch;
  private readonly pendingCreates = new Map<string, PendingMutation>();
  private readonly pendingDeletes = new Map<string, PendingMutation>();

  constructor(request: HostedControlFetch) {
    this.request = request;
  }

  async listProjects(): Promise<string[]> {
    const response = await this.request("/v1/projects", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    await requireStatus(response, 200, "list hosted projects");
    const result = ProjectListResponseSchema.safeParse(await hostedJson(response, "project list"));
    if (!result.success) throw incompatibleHostedResponse("project list");
    return result.data.projects.map((project) => project.id);
  }

  async listGraphs(project: string, cursor: string | null = null): Promise<GraphPage> {
    const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
    if (cursor !== null) query.set("cursor", cursor);
    const response = await this.request(
      `/v1/projects/${encodeURIComponent(project)}/graphs?${query.toString()}`,
      { method: "GET", headers: { Accept: "application/json" } },
    );
    await requireStatus(response, 200, "list hosted graphs");
    const result = GraphPageResponseSchema.safeParse(await hostedJson(response, "graph page"));
    if (!result.success) throw incompatibleHostedResponse("graph page");
    return { items: [...result.data.items], nextCursor: result.data.next_cursor ?? null };
  }

  async load(address?: GraphAddress): Promise<GraphDocument> {
    const target = requireAddress(address);
    const response = await this.request(graphPath(target), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    await requireStatus(response, 200, "open the hosted graph");
    return readHostedDocument(response, target);
  }

  async create(address: GraphAddress, graph: PipelineGraph): Promise<GraphDocument> {
    const parsedBody = GraphCreateRequestSchema.safeParse({
      graph: address.graph,
      document: graph,
    });
    if (!parsedBody.success) throw incompatibleHostedResponse("graph create request");
    const body = parsedBody.data;
    const serialized = JSON.stringify(body);
    const mutation = this.mutationFor(this.pendingCreates, address, serialized);
    let response: Response;
    try {
      response = await this.request(collectionPath(address.project), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Idempotency-Key": mutation.idempotencyKey,
        },
        body: serialized,
      });
    } catch (error) {
      // The request may have reached Dander. Retain the key for an identical explicit retry.
      throw error;
    }
    if (response.status !== 201) {
      if (response.status >= 400 && response.status < 500) {
        this.pendingCreates.delete(addressKey(address));
      }
      throw await hostedError(response, "Dander could not create the hosted graph.");
    }
    const document = await readHostedDocument(response, address);
    this.pendingCreates.delete(addressKey(address));
    return document;
  }

  async save(
    graph: PipelineGraph,
    revision: string,
    address?: GraphAddress,
  ): Promise<GraphDocument> {
    const target = requireAddress(address);
    const response = await this.request(graphPath(target), {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "If-Match": revision,
      },
      body: JSON.stringify(graph),
    });
    if (response.status !== 200) {
      throw await hostedMutationError(response, "Dander could not save the hosted graph.");
    }
    return readHostedDocument(response, target);
  }

  async delete(address: GraphAddress, revision: string): Promise<void> {
    const fingerprint = revision;
    const mutation = this.mutationFor(this.pendingDeletes, address, fingerprint);
    let response: Response;
    try {
      response = await this.request(graphPath(address), {
        method: "DELETE",
        headers: {
          "If-Match": revision,
          "Idempotency-Key": mutation.idempotencyKey,
        },
      });
    } catch (error) {
      // A lost response is ambiguous. Reuse this key if the operator retries the same deletion.
      throw error;
    }
    if (response.status !== 204) {
      if (response.status >= 400 && response.status < 500) {
        this.pendingDeletes.delete(addressKey(address));
      }
      throw await hostedMutationError(response, "Dander could not delete the hosted graph.");
    }
    // A successful delete is bodyless by contract; never attempt to parse it.
    this.pendingDeletes.delete(addressKey(address));
  }

  private mutationFor(
    pending: Map<string, PendingMutation>,
    address: GraphAddress,
    fingerprint: string,
  ): PendingMutation {
    const key = addressKey(address);
    const existing = pending.get(key);
    if (existing?.fingerprint === fingerprint) return existing;
    const next = { fingerprint, idempotencyKey: `druff-${crypto.randomUUID()}` };
    pending.set(key, next);
    return next;
  }
}

export function isManagedGraphPersistence(
  persistence: GraphPersistence,
): persistence is ManagedGraphPersistence {
  return "mode" in persistence && persistence.mode === "collection";
}

/** HTTP persistence backed by `dander graph serve --file ...`. */
export class DanderApiGraphPersistence implements GraphPersistence {
  private readonly endpoint: string;
  private readonly fetchGraph: FetchGraph;

  constructor(
    baseUrl = "http://127.0.0.1:8765",
    fetchGraph: FetchGraph = globalThis.fetch.bind(globalThis),
  ) {
    this.endpoint = `${baseUrl.replace(/\/$/, "")}/v1/graph`;
    this.fetchGraph = fetchGraph;
  }

  async load(): Promise<GraphDocument> {
    const response = await this.fetchGraph(
      this.endpoint,
      localNetworkRequest({
        method: "GET",
        headers: { Accept: "application/json" },
      }),
    );
    return this.readDocument(response);
  }

  async save(graph: PipelineGraph, revision: string): Promise<GraphDocument> {
    const response = await this.fetchGraph(
      this.endpoint,
      localNetworkRequest({
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "If-Match": revision,
        },
        body: JSON.stringify(graph),
      }),
    );
    return this.readDocument(response);
  }

  private async readDocument(response: Response): Promise<GraphDocument> {
    if (!response.ok) {
      const message = await responseError(response);
      throw new GraphPersistenceError(message, { conflict: response.status === 412 });
    }
    const revision = response.headers.get("ETag");
    if (!revision) {
      throw new GraphPersistenceError("Dander did not return a graph revision (ETag).", {
        conflict: false,
      });
    }
    const result = PipelineGraphSchema.safeParse(await response.json());
    if (!result.success) {
      throw new GraphPersistenceError(
        "Dander returned a graph this Druff version cannot preserve. Upgrade Druff before editing.",
        { conflict: false },
      );
    }
    return { graph: result.data, revision };
  }
}

/**
 * `localStorage`-backed `GraphPersistence`. Takes a `Storage` explicitly (defaulting to
 * `window.localStorage`) so unit tests inject a Map-backed fake with no real DOM/browser storage
 * involved (`steering/languages/typescript.md`: dependency-inject so logic is testable without a
 * real environment dependency).
 *
 * `load()` never logs the stored `graph`/`positions` values themselves — only the failure reason
 * and shape (parse error message, envelope version, node/edge counts where available) — so a
 * corrupt blob can't leak node `config` (which may carry connector parameters) into the console
 * (`steering/01-security.md`).
 */
export class LocalStorageGraphPersistence {
  private readonly storage: Storage;

  constructor(storage: Storage = window.localStorage) {
    this.storage = storage;
  }

  save(snapshot: GraphSnapshot): void {
    const envelope = {
      version: ENVELOPE_VERSION,
      graph: snapshot.graph,
      positions: snapshot.positions,
    };
    // Intentionally uncaught: quota/disabled-storage failures must surface loudly, not vanish.
    this.storage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  }

  load(): GraphSnapshot | null {
    let raw: string | null;
    try {
      raw = this.storage.getItem(STORAGE_KEY);
    } catch (cause) {
      console.warn(
        "[druff] localStorage unavailable while loading the saved graph:",
        describeError(cause),
      );
      return null;
    }
    if (raw == null) return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (cause) {
      console.warn("[druff] saved graph blob is not valid JSON:", describeError(cause));
      return null;
    }

    if (!isPlainObject(parsed)) {
      console.warn("[druff] saved graph blob has an unexpected shape (expected an object).");
      return null;
    }
    if (parsed.version !== ENVELOPE_VERSION) {
      console.warn(
        `[druff] saved graph envelope version ${JSON.stringify(parsed.version)} does not match ` +
          `the expected version ${ENVELOPE_VERSION}; discarding.`,
      );
      return null;
    }

    const result = PipelineGraphSchema.safeParse(parsed.graph);
    if (!result.success) {
      const nodeCount =
        isPlainObject(parsed.graph) && Array.isArray(parsed.graph.nodes)
          ? parsed.graph.nodes.length
          : "unknown";
      console.warn(
        `[druff] saved graph failed schema validation (node count: ${nodeCount}):`,
        result.error.message,
      );
      return null;
    }

    return {
      graph: result.data,
      positions: isGraphLayout(parsed.positions) ? parsed.positions : {},
    };
  }

  clear(): void {
    this.storage.removeItem(STORAGE_KEY);
  }
}

// Deliberately no eagerly-constructed default instance here: Next.js evaluates a `'use client'`
// module's top level during SSR too (not just in the browser), and the constructor's default
// parameter (`window.localStorage`) would throw there. Call sites construct
// `new LocalStorageGraphPersistence()` themselves, inside a `useEffect`/event handler — i.e. only
// where it's guaranteed to actually run client-side (`steering/languages/typescript.md`: no side
// effects at module scope).

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isGraphLayout(value: unknown): value is GraphLayout {
  if (!isPlainObject(value)) return false;
  return Object.values(value).every(
    (position) =>
      isPlainObject(position) && typeof position.x === "number" && typeof position.y === "number",
  );
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function responseError(response: Response): Promise<string> {
  try {
    const payload: unknown = await response.json();
    if (isPlainObject(payload) && typeof payload.error === "string") return payload.error;
  } catch {
    // Fall through to the status-only message. Never echo a raw response body.
  }
  return `Dander graph request failed (${response.status} ${response.statusText}).`;
}

function requireAddress(address: GraphAddress | undefined): GraphAddress {
  if (address) return address;
  throw new GraphPersistenceError("Choose a hosted graph before opening or saving.");
}

function collectionPath(project: string): string {
  return `/v1/projects/${encodeURIComponent(project)}/graphs`;
}

function graphPath(address: GraphAddress): string {
  return `${collectionPath(address.project)}/${encodeURIComponent(address.graph)}`;
}

function addressKey(address: GraphAddress): string {
  return `${address.project}\u0000${address.graph}`;
}

async function requireStatus(response: Response, status: number, operation: string): Promise<void> {
  if (response.status === status) return;
  throw await hostedError(response, `Dander could not ${operation}.`);
}

async function readHostedDocument(
  response: Response,
  address: GraphAddress,
): Promise<GraphDocument> {
  const revision = response.headers.get("ETag");
  if (!revision) {
    throw new GraphPersistenceError("Dander did not return an opaque graph revision (ETag).");
  }
  const resource = GraphResourceResponseSchema.safeParse(
    await hostedJson(response, "graph resource"),
  );
  if (!resource.success) throw incompatibleHostedResponse("graph resource");
  if (resource.data.project !== address.project || resource.data.graph !== address.graph) {
    throw new GraphPersistenceError(
      "Dander returned a different hosted graph than Druff requested.",
    );
  }
  const graph = PipelineGraphSchema.safeParse(resource.data.document);
  if (!graph.success) throw incompatibleHostedResponse("canonical graph document");
  return {
    graph: graph.data,
    revision,
    address,
    contentSha256: resource.data.content_sha256,
  };
}

async function hostedMutationError(response: Response, fallback: string): Promise<Error> {
  const parsed = await parsedHostedError(response, fallback);
  const conflict =
    (response.status === 409 || response.status === 412) && parsed.code === "graph_conflict";
  return new GraphPersistenceError(parsed.message, { conflict });
}

async function hostedError(response: Response, fallback: string): Promise<Error> {
  const parsed = await parsedHostedError(response, fallback);
  return new GraphPersistenceError(parsed.message);
}

async function parsedHostedError(
  response: Response,
  fallback: string,
): Promise<{ code: string | null; message: string }> {
  try {
    const parsed = ApiErrorEnvelopeSchema.safeParse(await response.json());
    if (parsed.success) {
      return {
        code: parsed.data.error.code,
        message: `${parsed.data.error.message} Correlation ID: ${parsed.data.error.correlation_id}.`,
      };
    }
  } catch {
    // Never expose a raw response body or provider payload.
  }
  return { code: null, message: `${fallback} (${response.status} ${response.statusText}).` };
}

function incompatibleHostedResponse(label: string): GraphPersistenceError {
  return new GraphPersistenceError(
    `Dander returned a ${label} this Druff version cannot preserve. Upgrade the incompatible application.`,
  );
}

async function hostedJson(response: Response, label: string): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw incompatibleHostedResponse(label);
  }
}
