import { PipelineGraphSchema, type GraphLayout, type PipelineGraph } from "@/lib/pipeline-graph";
import { localNetworkRequest } from "@/lib/local-network-request";

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
};

/**
 * Async persistence seam for canonical graphs. Dander's local API is the authority: implementations
 * return a revision on open and require that revision on save so a browser cannot overwrite a file
 * that changed elsewhere.
 */
export interface GraphPersistence {
  load(): Promise<GraphDocument>;
  save(graph: PipelineGraph, revision: string): Promise<GraphDocument>;
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
