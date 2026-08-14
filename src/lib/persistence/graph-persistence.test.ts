import { describe, expect, it, vi } from "vitest";
import { EXAMPLE_GRAPH } from "@/lib/pipeline-graph/__fixtures__/example-graph";
import {
  DanderApiGraphPersistence,
  GraphPersistenceError,
  HostedGraphPersistence,
  LocalStorageGraphPersistence,
  type GraphSnapshot,
} from "@/lib/persistence/graph-persistence";
import type { HostedControlFetch } from "@/features/hosted-control/authorized-fetch";

const STORAGE_KEY = "druff.graph.v1";

/** Minimal Map-backed `Storage` fake — no real DOM/browser storage, per this file's design seam. */
function createFakeStorage(overrides: Partial<Storage> = {}): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
    ...overrides,
  } as Storage;
}

const FIXTURE_SNAPSHOT: GraphSnapshot = {
  graph: EXAMPLE_GRAPH,
  positions: { crm_contacts: { x: 0, y: 80 }, warehouse_customers: { x: 280, y: 80 } },
};

describe("LocalStorageGraphPersistence", () => {
  it("round-trips a saved snapshot through load()", () => {
    const storage = createFakeStorage();
    const persistence = new LocalStorageGraphPersistence(storage);

    persistence.save(FIXTURE_SNAPSHOT);

    expect(persistence.load()).toEqual(FIXTURE_SNAPSHOT);
  });

  it("returns null when nothing has been saved", () => {
    const persistence = new LocalStorageGraphPersistence(createFakeStorage());
    expect(persistence.load()).toBeNull();
  });

  it("returns null (and does not throw) for an unparseable JSON blob", () => {
    const storage = createFakeStorage();
    storage.setItem(STORAGE_KEY, "{not json");
    const persistence = new LocalStorageGraphPersistence(storage);

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(persistence.load()).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("returns null for a mismatched envelope version", () => {
    const storage = createFakeStorage();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 999, graph: FIXTURE_SNAPSHOT.graph, positions: {} }),
    );
    const persistence = new LocalStorageGraphPersistence(storage);

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(persistence.load()).toBeNull();
    warn.mockRestore();
  });

  it("returns null for a schema-invalid graph without throwing", () => {
    const storage = createFakeStorage();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, graph: { nodes: "not-an-array" }, positions: {} }),
    );
    const persistence = new LocalStorageGraphPersistence(storage);

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(persistence.load()).toBeNull();
    warn.mockRestore();
  });

  it("falls back to an empty positions sidecar when positions is malformed", () => {
    const storage = createFakeStorage();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, graph: FIXTURE_SNAPSHOT.graph, positions: "nonsense" }),
    );
    const persistence = new LocalStorageGraphPersistence(storage);

    expect(persistence.load()).toEqual({ graph: FIXTURE_SNAPSHOT.graph, positions: {} });
  });

  it("propagates a genuine environment failure (e.g. quota) on save rather than swallowing it", () => {
    const storage = createFakeStorage({
      setItem: () => {
        throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
      },
    });
    const persistence = new LocalStorageGraphPersistence(storage);

    expect(() => persistence.save(FIXTURE_SNAPSHOT)).toThrow();
  });

  it("clear() removes the stored snapshot so a subsequent load() returns null", () => {
    const storage = createFakeStorage();
    const persistence = new LocalStorageGraphPersistence(storage);
    persistence.save(FIXTURE_SNAPSHOT);

    persistence.clear();

    expect(persistence.load()).toBeNull();
  });

  it("never logs the underlying graph/positions values on a corrupt blob (no sensitive-data leak)", () => {
    const storage = createFakeStorage();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        graph: { nodes: "not-an-array", secretLookingValue: "sk-should-not-appear" },
        positions: {},
      }),
    );
    const persistence = new LocalStorageGraphPersistence(storage);

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    persistence.load();
    const loggedText = warn.mock.calls.flat().join(" ");
    expect(loggedText).not.toContain("sk-should-not-appear");
    warn.mockRestore();
  });
});

describe("DanderApiGraphPersistence", () => {
  it("opens a validated graph and retains Dander's quoted ETag revision", async () => {
    const fetchGraph = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(EXAMPLE_GRAPH), {
        status: 200,
        headers: { "Content-Type": "application/json", ETag: '"revision-1"' },
      }),
    );
    const persistence = new DanderApiGraphPersistence("http://127.0.0.1:8765/", fetchGraph);

    await expect(persistence.load()).resolves.toEqual({
      graph: EXAMPLE_GRAPH,
      revision: '"revision-1"',
    });
    expect(fetchGraph).toHaveBeenCalledWith("http://127.0.0.1:8765/v1/graph", {
      method: "GET",
      headers: { Accept: "application/json" },
      targetAddressSpace: "loopback",
    });
  });

  it("saves JSON conditionally with the exact loaded revision", async () => {
    const fetchGraph = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(EXAMPLE_GRAPH), {
        status: 200,
        headers: { "Content-Type": "application/json", ETag: '"revision-2"' },
      }),
    );
    const persistence = new DanderApiGraphPersistence("http://127.0.0.1:8765", fetchGraph);

    await expect(persistence.save(EXAMPLE_GRAPH, '"revision-1"')).resolves.toEqual({
      graph: EXAMPLE_GRAPH,
      revision: '"revision-2"',
    });
    expect(fetchGraph).toHaveBeenCalledWith(
      "http://127.0.0.1:8765/v1/graph",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({ "If-Match": '"revision-1"' }),
        body: JSON.stringify(EXAMPLE_GRAPH),
        targetAddressSpace: "loopback",
      }),
    );
  });

  it("surfaces a stale revision as a typed conflict", async () => {
    const fetchGraph = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ error: "The graph changed elsewhere." }), {
        status: 412,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const persistence = new DanderApiGraphPersistence("http://127.0.0.1:8765", fetchGraph);

    const failure = await persistence.save(EXAMPLE_GRAPH, '"stale"').catch((error) => error);

    expect(failure).toBeInstanceOf(GraphPersistenceError);
    expect(failure).toMatchObject({ conflict: true, message: "The graph changed elsewhere." });
  });

  it("fails loud rather than stripping an unsupported graph response", async () => {
    const fetchGraph = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ...EXAMPLE_GRAPH, future_contract: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ETag: '"revision-1"' },
      }),
    );
    const persistence = new DanderApiGraphPersistence("http://127.0.0.1:8765", fetchGraph);

    await expect(persistence.load()).rejects.toThrow(/cannot preserve/i);
  });
});

const ADDRESS = { project: "demo-project", graph: "alpha-graph" };
const CONTENT_SHA = "a".repeat(64);

function hostedResource(graph = EXAMPLE_GRAPH) {
  return {
    project: ADDRESS.project,
    graph: ADDRESS.graph,
    document: graph,
    content_sha256: CONTENT_SHA,
    created_at: "2026-08-14T00:00:00Z",
    updated_at: "2026-08-14T00:00:00Z",
  };
}

function apiError(code: string, message: string) {
  return {
    error: { code, message, correlation_id: "corr-123", details: [] },
  };
}

describe("HostedGraphPersistence", () => {
  it("lists generated-contract projects and paginated document-free graph summaries", async () => {
    const request = vi
      .fn<HostedControlFetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ projects: [{ id: "demo-project" }] }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [
              {
                project: "demo-project",
                graph: "alpha-graph",
                content_sha256: CONTENT_SHA,
                created_at: "2026-08-14T00:00:00Z",
                updated_at: "2026-08-14T00:00:00Z",
              },
            ],
            next_cursor: "opaque cursor/+",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [], next_cursor: null }), { status: 200 }),
      );
    const persistence = new HostedGraphPersistence(request);

    await expect(persistence.listProjects()).resolves.toEqual(["demo-project"]);
    await expect(persistence.listGraphs("demo-project")).resolves.toMatchObject({
      items: [expect.objectContaining({ graph: "alpha-graph" })],
      nextCursor: "opaque cursor/+",
    });
    await persistence.listGraphs("demo-project", "opaque cursor/+");

    expect(request.mock.calls[2]?.[0]).toBe(
      "/v1/projects/demo-project/graphs?limit=50&cursor=opaque+cursor%2F%2B",
    );
  });

  it("opens and conditionally saves one generated graph while keeping ETag and content identity separate", async () => {
    const request = vi
      .fn<HostedControlFetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(hostedResource()), {
          status: 200,
          headers: { ETag: '"revision-1"' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ...hostedResource(), content_sha256: "b".repeat(64) }), {
          status: 200,
          headers: { ETag: '"revision-2"' },
        }),
      );
    const persistence = new HostedGraphPersistence(request);

    await expect(persistence.load(ADDRESS)).resolves.toMatchObject({
      address: ADDRESS,
      revision: '"revision-1"',
      contentSha256: CONTENT_SHA,
      graph: EXAMPLE_GRAPH,
    });
    await persistence.save(EXAMPLE_GRAPH, '"revision-1"', ADDRESS);

    expect(request.mock.calls[1]?.[1]).toEqual(
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({ "If-Match": '"revision-1"' }),
        body: JSON.stringify(EXAMPLE_GRAPH),
      }),
    );
  });

  it("reuses a create idempotency key after an ambiguous lost response", async () => {
    let serviceAttempt = 0;
    const request = vi.fn<HostedControlFetch>(async () => {
      serviceAttempt += 1;
      if (serviceAttempt === 1) throw new TypeError("response lost after service restart");
      return new Response(JSON.stringify(hostedResource()), {
        status: 201,
        headers: { ETag: '"revision-1"' },
      });
    });
    const persistence = new HostedGraphPersistence(request);

    await expect(persistence.create(ADDRESS, EXAMPLE_GRAPH)).rejects.toThrow(/response lost/);
    await expect(persistence.create(ADDRESS, EXAMPLE_GRAPH)).resolves.toMatchObject({
      revision: '"revision-1"',
    });

    const firstKey = new Headers(request.mock.calls[0]?.[1]?.headers).get("Idempotency-Key");
    const retryKey = new Headers(request.mock.calls[1]?.[1]?.headers).get("Idempotency-Key");
    expect(firstKey).toMatch(/^druff-/);
    expect(retryKey).toBe(firstKey);
  });

  it("does not misclassify a create-name collision as a reloadable revision conflict", async () => {
    const request = vi.fn<HostedControlFetch>().mockResolvedValue(
      new Response(JSON.stringify(apiError("graph_exists", "That graph already exists.")), {
        status: 409,
      }),
    );
    const persistence = new HostedGraphPersistence(request);

    const failure = await persistence.create(ADDRESS, EXAMPLE_GRAPH).catch((error) => error);

    expect(failure).toBeInstanceOf(GraphPersistenceError);
    expect(failure).toMatchObject({ conflict: false });
    expect(failure.message).toBe("That graph already exists. Correlation ID: corr-123.");
  });

  it("maps only a conditional update graph_conflict to the reload path", async () => {
    const request = vi.fn<HostedControlFetch>().mockResolvedValue(
      new Response(JSON.stringify(apiError("graph_conflict", "The revision changed.")), {
        status: 409,
      }),
    );
    const persistence = new HostedGraphPersistence(request);

    const failure = await persistence
      .save(EXAMPLE_GRAPH, '"stale"', ADDRESS)
      .catch((error) => error);

    expect(failure).toMatchObject({ conflict: true });
  });

  it("reuses a delete key after an ambiguous failure and accepts only the bodyless 204", async () => {
    const request = vi
      .fn<HostedControlFetch>()
      .mockRejectedValueOnce(new TypeError("response lost"))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const persistence = new HostedGraphPersistence(request);

    await expect(persistence.delete(ADDRESS, '"revision-2"')).rejects.toThrow(/response lost/);
    await expect(persistence.delete(ADDRESS, '"revision-2"')).resolves.toBeUndefined();

    const firstKey = new Headers(request.mock.calls[0]?.[1]?.headers).get("Idempotency-Key");
    const retryKey = new Headers(request.mock.calls[1]?.[1]?.headers).get("Idempotency-Key");
    expect(retryKey).toBe(firstKey);
  });

  it("never exposes an unstructured provider response body", async () => {
    const request = vi
      .fn<HostedControlFetch>()
      .mockResolvedValue(
        new Response("provider-secret-looking-payload", { status: 502, statusText: "Bad Gateway" }),
      );
    const persistence = new HostedGraphPersistence(request);

    await expect(persistence.listProjects()).rejects.toThrow(
      "Dander could not list hosted projects. (502 Bad Gateway).",
    );
    await expect(persistence.listProjects()).rejects.not.toThrow(/provider-secret/);
  });
});
