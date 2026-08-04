import { describe, expect, it, vi } from "vitest";
import { EXAMPLE_GRAPH } from "@/lib/pipeline-graph/__fixtures__/example-graph";
import { openDanderGraph, saveDanderGraph } from "@/lib/persistence/dander-graph-client";

const REVISION = "a".repeat(64);

/** Minimal fake `fetch` — no real socket, per `steering/02-engineering.md`'s "no network in unit
 *  tests, mock the Dander API". */
function fakeFetch(response: { status: number; body?: unknown; etag?: string }): typeof fetch {
  return vi.fn(async () => {
    const headers = new Headers();
    if (response.etag) headers.set("ETag", `"${response.etag}"`);
    return new Response(response.body === undefined ? null : JSON.stringify(response.body), {
      status: response.status,
      headers,
    });
  }) as unknown as typeof fetch;
}

describe("openDanderGraph", () => {
  it("returns the parsed graph and revision on success", async () => {
    const fetchImpl = fakeFetch({ status: 200, body: EXAMPLE_GRAPH, etag: REVISION });

    const result = await openDanderGraph("http://127.0.0.1:8765", fetchImpl);

    expect(result).toEqual({ ok: true, graph: EXAMPLE_GRAPH, revision: REVISION });
  });

  it("reports a network failure when the bridge is unreachable", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("connection refused");
    }) as unknown as typeof fetch;

    const result = await openDanderGraph("http://127.0.0.1:8765", fetchImpl);

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ kind: "network" });
  });

  it("reports validation failure when the response body fails Druff's schema", async () => {
    const fetchImpl = fakeFetch({ status: 200, body: { nodes: "not-a-graph" }, etag: REVISION });

    const result = await openDanderGraph("http://127.0.0.1:8765", fetchImpl);

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ kind: "validation" });
  });

  it("reports network failure when the success response has no ETag", async () => {
    const fetchImpl = fakeFetch({ status: 200, body: EXAMPLE_GRAPH });

    const result = await openDanderGraph("http://127.0.0.1:8765", fetchImpl);

    expect(result).toEqual({
      ok: false,
      kind: "network",
      error: "Dander graph bridge response had no ETag.",
    });
  });
});

describe("saveDanderGraph", () => {
  it("sends the graph as JSON with an If-Match header carrying the expected revision", async () => {
    const fetchImpl = fakeFetch({ status: 200, body: EXAMPLE_GRAPH, etag: "b".repeat(64) });

    await saveDanderGraph(EXAMPLE_GRAPH, REVISION, "http://127.0.0.1:8765", fetchImpl);

    expect(fetchImpl).toHaveBeenCalledWith(
      "http://127.0.0.1:8765/v1/graph",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "If-Match": `"${REVISION}"`,
        }),
        body: JSON.stringify(EXAMPLE_GRAPH),
      }),
    );
  });

  it("surfaces a 412 as a conflict, naming the stale-revision reason", async () => {
    const fetchImpl = fakeFetch({
      status: 412,
      body: { error: "The graph changed after Druff opened it. Reload before saving again." },
    });

    const result = await saveDanderGraph(
      EXAMPLE_GRAPH,
      REVISION,
      "http://127.0.0.1:8765",
      fetchImpl,
    );

    expect(result).toEqual({
      ok: false,
      kind: "conflict",
      error: "The graph changed after Druff opened it. Reload before saving again.",
    });
  });

  it("surfaces a 422 as a validation failure, carrying Dander's per-field details", async () => {
    const fetchImpl = fakeFetch({
      status: 422,
      body: {
        error: "Graph does not match Dander's PipelineGraph contract.",
        details: [{ location: "nodes.0.type", message: "Field required", type: "missing" }],
      },
    });

    const result = await saveDanderGraph(
      EXAMPLE_GRAPH,
      REVISION,
      "http://127.0.0.1:8765",
      fetchImpl,
    );

    expect(result).toEqual({
      ok: false,
      kind: "validation",
      error: "Graph does not match Dander's PipelineGraph contract.",
      details: [{ location: "nodes.0.type", message: "Field required", type: "missing" }],
    });
  });

  it("defaults to DEFAULT_DANDER_GRAPH_URL when no baseUrl is given", async () => {
    const fetchImpl = fakeFetch({ status: 200, body: EXAMPLE_GRAPH, etag: REVISION });

    await saveDanderGraph(EXAMPLE_GRAPH, REVISION, undefined, fetchImpl);

    expect(fetchImpl).toHaveBeenCalledWith("http://127.0.0.1:8765/v1/graph", expect.anything());
  });
});
