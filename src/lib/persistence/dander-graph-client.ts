import { PipelineGraphSchema, type PipelineGraph } from "@/lib/pipeline-graph";

/**
 * Client for Dander's local graph-document bridge (`dander.pipeline.graph_service`, started via
 * `dander graph serve --file ...`): a loopback-only HTTP API exposing exactly one operator-selected
 * graph file to Druff, with optimistic-concurrency saves. See
 * `../dander/src/dander/pipeline/README.md`, "Local visual-editor write-back".
 *
 * This resolves the "Contract with Dander" TODO in `steering/00-project-overview.md`: Dander
 * remains the parsing/validation/serialization authority (this client re-validates its own
 * responses with `PipelineGraphSchema` rather than trusting a bare cast — `steering/languages/
 * typescript.md`'s "parse, don't cast" — but never re-implements Dander's semantic checks).
 *
 * Deliberately **not** an implementation of `GraphPersistence` (`graph-persistence.ts`): that
 * interface is synchronous, fire-and-forget, autosave-shaped (localStorage). Dander's bridge is the
 * opposite by design — "explicit open/save, revision conflict protection" (its own module
 * docstring) — so it gets its own explicit, async, conflict-aware call shape instead of being
 * squeezed into the autosave seam.
 */

const GRAPH_PATH = "/v1/graph";

/** Default bridge origin — matches `create_graph_server`'s own default (`127.0.0.1:8765`). */
export const DEFAULT_DANDER_GRAPH_URL = "http://127.0.0.1:8765";

export type DanderGraphErrorDetail = { location: string; message: string; type: string };

export type DanderGraphSuccess = {
  ok: true;
  graph: PipelineGraph;
  /** Opaque revision token (Dander's SHA-256 ETag, unquoted) — pass back to `saveDanderGraph` as
   *  `expectedRevision` for the next save. */
  revision: string;
};

export type DanderGraphFailure = {
  ok: false;
  /** `"conflict"` — the graph changed since this revision was read; reload before saving again.
   *  `"validation"` — the graph failed Dander's Pydantic/semantic contract.
   *  `"network"` — the bridge is unreachable, not running, or returned something unexpected. */
  kind: "conflict" | "validation" | "network";
  error: string;
  details?: DanderGraphErrorDetail[];
};

export type DanderGraphResult = DanderGraphSuccess | DanderGraphFailure;

/**
 * Fetches the graph the bridge was started with. `baseUrl` defaults to
 * `DEFAULT_DANDER_GRAPH_URL`; `fetchImpl` is injectable so tests exercise this against a fake
 * `fetch`, never a real socket (`steering/02-engineering.md`: no network in unit tests).
 */
export async function openDanderGraph(
  baseUrl: string = DEFAULT_DANDER_GRAPH_URL,
  fetchImpl: typeof fetch = fetch,
): Promise<DanderGraphResult> {
  let response: Response;
  try {
    response = await fetchImpl(`${baseUrl}${GRAPH_PATH}`, { method: "GET" });
  } catch (cause) {
    return { ok: false, kind: "network", error: describeNetworkError(cause) };
  }
  return handleGraphResponse(response);
}

/**
 * Saves `graph` if `expectedRevision` (from the last `openDanderGraph`/`saveDanderGraph` call) is
 * still current. On success, returns the new revision to use for the *next* save — a save is not
 * chainable with a stale revision, matching the bridge's optimistic-concurrency contract.
 */
export async function saveDanderGraph(
  graph: PipelineGraph,
  expectedRevision: string,
  baseUrl: string = DEFAULT_DANDER_GRAPH_URL,
  fetchImpl: typeof fetch = fetch,
): Promise<DanderGraphResult> {
  let response: Response;
  try {
    response = await fetchImpl(`${baseUrl}${GRAPH_PATH}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "If-Match": `"${expectedRevision}"`,
      },
      body: JSON.stringify(graph),
    });
  } catch (cause) {
    return { ok: false, kind: "network", error: describeNetworkError(cause) };
  }
  return handleGraphResponse(response);
}

async function handleGraphResponse(response: Response): Promise<DanderGraphResult> {
  if (response.status === 412 || response.status === 428) {
    const body = await readJsonBody(response);
    return {
      ok: false,
      kind: "conflict",
      error: errorMessage(body) ?? "The graph changed. Reload before saving again.",
    };
  }

  if (!response.ok) {
    const body = await readJsonBody(response);
    return {
      ok: false,
      kind: response.status === 422 ? "validation" : "network",
      error: errorMessage(body) ?? `Dander graph bridge returned ${response.status}.`,
      details: detailsOf(body),
    };
  }

  const body = await readJsonBody(response);
  if (body === undefined) {
    return { ok: false, kind: "network", error: "Dander graph bridge returned an invalid body." };
  }

  const revision = stripETagQuotes(response.headers.get("ETag"));
  if (revision === null) {
    return { ok: false, kind: "network", error: "Dander graph bridge response had no ETag." };
  }

  const parsed = PipelineGraphSchema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      kind: "validation",
      error: "Dander returned a graph Druff's schema doesn't recognize.",
      details: parsed.error.issues.map((issue) => ({
        location: issue.path.join("."),
        message: issue.message,
        type: issue.code,
      })),
    };
  }

  return { ok: true, graph: parsed.data, revision };
}

async function readJsonBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function errorMessage(body: unknown): string | null {
  if (typeof body === "object" && body !== null && "error" in body) {
    const value = (body as Record<string, unknown>).error;
    return typeof value === "string" ? value : null;
  }
  return null;
}

function detailsOf(body: unknown): DanderGraphErrorDetail[] | undefined {
  if (typeof body !== "object" || body === null || !("details" in body)) return undefined;
  const value = (body as Record<string, unknown>).details;
  if (!Array.isArray(value)) return undefined;
  return value.filter(
    (entry): entry is DanderGraphErrorDetail =>
      typeof entry === "object" &&
      entry !== null &&
      typeof entry.location === "string" &&
      typeof entry.message === "string" &&
      typeof entry.type === "string",
  );
}

function stripETagQuotes(value: string | null): string | null {
  if (value === null || value.length < 3 || !value.startsWith('"') || !value.endsWith('"')) {
    return null;
  }
  return value.slice(1, -1);
}

function describeNetworkError(cause: unknown): string {
  const detail = cause instanceof Error ? cause.message : String(cause);
  return `Could not reach the Dander graph bridge: ${detail}`;
}
