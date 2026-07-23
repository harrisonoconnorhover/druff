import { PipelineGraphSchema, type GraphLayout, type PipelineGraph } from "@/lib/pipeline-graph";

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

/**
 * The persistence seam (`steering/02-engineering.md`: depend on abstractions, not a concrete
 * store). Today's only implementation is `LocalStorageGraphPersistence`; a future Dander-backed or
 * filesystem-backed store plugs in here without any caller (`useGraphPersistence`, `GraphToolbar`)
 * changing.
 */
export interface GraphPersistence {
  /** Persists `snapshot` as the current local graph. Environment failures (quota exceeded,
   * localStorage disabled/private mode) are allowed to throw — a save failure is a real condition
   * the caller should surface loudly, never swallow. */
  save(snapshot: GraphSnapshot): void;
  /** Returns the last-saved snapshot, or `null` if there is none, it's unparseable, it's a
   * different envelope version, or its `graph` fails DRUFF-4's schema. Every one of those cases
   * degrades to `null` (caller falls back to the seed graph) rather than throwing, since a
   * corrupt/stale local blob must never crash the editor. */
  load(): GraphSnapshot | null;
  /** Removes the stored snapshot entirely. */
  clear(): void;
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
export class LocalStorageGraphPersistence implements GraphPersistence {
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
