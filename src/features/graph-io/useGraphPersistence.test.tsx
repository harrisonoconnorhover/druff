import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGraphPersistence } from "@/features/graph-io/useGraphPersistence";
import type { ConnectorDiscovery } from "@/features/connector-library/discovery";
import type {
  PluginCatalogConnector,
  PluginCatalogDiscovery,
} from "@/features/connector-library/catalog";
import {
  clearPluginCatalog,
  getPluginCatalogSnapshot,
} from "@/features/connector-library/catalog-store";
import { clearDiscoveredConnectors, getConnector } from "@/features/connector-library/registry";
import type {
  OperationCatalogDiscovery,
  OperationDescriptor,
} from "@/features/pipeline-operations/catalog";
import {
  clearOperationCatalog,
  getOperationCatalogSnapshot,
} from "@/features/pipeline-operations/catalog-store";
import { SEED_GRAPH, useGraphStore } from "@/lib/graph-store";
import { PipelineGraphSchema, graphToCanvas } from "@/lib/pipeline-graph";
import {
  GraphPersistenceError,
  type GraphPersistence,
  type ManagedGraphPersistence,
} from "@/lib/persistence/graph-persistence";

const GRAPH = PipelineGraphSchema.parse({
  name: "served-graph",
  nodes: [
    {
      id: "source",
      type: "source",
      name: "Source",
      visual: { position: { x: 1, y: 2 }, color: "green", icon: "database" },
    },
  ],
  edges: [],
});

beforeEach(() => {
  clearDiscoveredConnectors();
  clearPluginCatalog();
  clearOperationCatalog();
  useGraphStore.getState().setGraph(SEED_GRAPH.nodes, SEED_GRAPH.edges, SEED_GRAPH.name);
});

describe("useGraphPersistence", () => {
  it("discovers connectors before classifying the opened graph", async () => {
    const salesforceGraph = PipelineGraphSchema.parse({
      name: "salesforce-graph",
      nodes: [
        {
          id: "accounts",
          type: "source",
          name: "Salesforce Accounts",
          config: { connector: "salesforce", endpoint: "accounts" },
        },
      ],
      edges: [],
    });
    const persistence: GraphPersistence = {
      load: vi.fn(async () => ({ graph: salesforceGraph, revision: '"revision-1"' })),
      save: vi.fn(async (graph) => ({ graph, revision: '"revision-2"' })),
    };
    const connectorDiscovery: ConnectorDiscovery = {
      load: vi.fn(async () => [
        {
          id: "salesforce",
          name: "Salesforce",
          kind: "source" as const,
          danderType: "source",
          danderConnector: "salesforce",
          fields: [],
          plugin: { distribution: "dander-connector-salesforce", version: "0.1.0rc1" },
        },
      ]),
    };
    const { result } = renderHook(() => useGraphPersistence({ persistence, connectorDiscovery }));

    await act(async () => result.current.open());

    expect(getConnector("salesforce")?.plugin?.version).toBe("0.1.0rc1");
    expect(useGraphStore.getState().nodes[0].data.connectorId).toBe("salesforce");
  });

  it("loads the curated package catalog alongside connector discovery", async () => {
    const persistence: GraphPersistence = {
      load: vi.fn(async () => ({ graph: GRAPH, revision: '"revision-1"' })),
      save: vi.fn(async (graph) => ({ graph, revision: '"revision-2"' })),
    };
    const catalogEntry: PluginCatalogConnector = {
      id: "salesforce",
      display_name: "Salesforce",
      description: "Bulk API Accounts ingestion.",
      distribution: "dander-connector-salesforce",
      version: "0.1.1",
      dander_specifier: ">=0.4.0,<0.6",
      compatible: true,
      support_status: "first-party-alpha",
      validation_status: "provider-validated",
      documentation_url: "https://example.test/docs/salesforce",
      pypi_url: "https://example.test/pypi/salesforce",
      repository_url: "https://example.test/repository/salesforce",
      installed: true,
      installed_version: "0.1.1",
    };
    const pluginCatalogDiscovery: PluginCatalogDiscovery = {
      load: vi.fn(async () => [catalogEntry]),
    };
    const { result } = renderHook(() =>
      useGraphPersistence({ persistence, pluginCatalogDiscovery }),
    );

    await act(async () => result.current.open());

    expect(getPluginCatalogSnapshot()).toEqual([catalogEntry]);
    expect(result.current.status).toBe("clean");
  });

  it("loads runtime-supported operations without changing the graph schema", async () => {
    const persistence: GraphPersistence = {
      load: vi.fn(async () => ({ graph: GRAPH, revision: '"revision-1"' })),
      save: vi.fn(async (graph) => ({ graph, revision: '"revision-2"' })),
    };
    const operationCatalogDiscovery: OperationCatalogDiscovery = {
      load: vi.fn(async (): Promise<OperationDescriptor[]> => [
        {
          kind: "trim_whitespace",
          display_name: "Trim whitespace",
          description: "Remove surrounding whitespace.",
          parameters: [{ name: "field", display_name: "Field", control: "field", required: true }],
        },
      ]),
    };
    const { result } = renderHook(() =>
      useGraphPersistence({ persistence, operationCatalogDiscovery }),
    );

    await act(async () => result.current.open());

    expect(getOperationCatalogSnapshot().map((operation) => operation.kind)).toEqual([
      "trim_whitespace",
    ]);
    expect(result.current.status).toBe("clean");
  });

  it("opens canonically when connector discovery is unavailable", async () => {
    const persistence: GraphPersistence = {
      load: vi.fn(async () => ({ graph: GRAPH, revision: '"revision-1"' })),
      save: vi.fn(async (graph) => ({ graph, revision: '"revision-2"' })),
    };
    const connectorDiscovery: ConnectorDiscovery = {
      load: vi.fn(async () => {
        throw new Error("catalog unavailable");
      }),
    };
    const pluginCatalogDiscovery: PluginCatalogDiscovery = {
      load: vi.fn(async () => {
        throw new Error("catalog unavailable");
      }),
    };
    const operationCatalogDiscovery: OperationCatalogDiscovery = {
      load: vi.fn(async () => {
        throw new Error("catalog unavailable");
      }),
    };
    const { result } = renderHook(() =>
      useGraphPersistence({
        persistence,
        connectorDiscovery,
        pluginCatalogDiscovery,
        operationCatalogDiscovery,
      }),
    );

    await act(async () => result.current.open());

    expect(result.current.status).toBe("clean");
    expect(getConnector("greenhouse")).toBeDefined();
    expect(getPluginCatalogSnapshot()).toEqual([]);
    expect(getOperationCatalogSnapshot()).toEqual([]);
  });

  it("opens explicitly, marks edits dirty, and conditionally saves the current graph", async () => {
    const persistence: GraphPersistence = {
      load: vi.fn(async () => ({ graph: GRAPH, revision: '"revision-1"' })),
      save: vi.fn(async (graph) => ({ graph, revision: '"revision-2"' })),
    };
    const { result } = renderHook(() => useGraphPersistence({ persistence }));

    await act(async () => result.current.open());
    expect(result.current.status).toBe("clean");
    expect(result.current.attached).toBe(true);
    expect(result.current.revision).toBe('"revision-1"');
    expect(useGraphStore.getState().graphName).toBe("served-graph");

    act(() =>
      useGraphStore.getState().onNodesChange([{ id: "source", type: "select", selected: true }]),
    );
    expect(result.current.status).toBe("clean");

    act(() => useGraphStore.getState().updateNodeData("source", { name: "Renamed source" }));
    expect(result.current.status).toBe("dirty");

    await act(async () => result.current.save());
    expect(persistence.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "served-graph",
        nodes: [expect.objectContaining({ name: "Renamed source" })],
      }),
      '"revision-1"',
    );
    expect(result.current.status).toBe("clean");
    expect(result.current.revision).toBe('"revision-2"');
  });

  it("surfaces revision conflicts and never reports the graph as saved", async () => {
    const persistence: GraphPersistence = {
      load: vi.fn(async () => ({ graph: GRAPH, revision: '"revision-1"' })),
      save: vi.fn(async () => {
        throw new GraphPersistenceError("The graph changed elsewhere.", { conflict: true });
      }),
    };
    const { result } = renderHook(() => useGraphPersistence({ persistence }));
    await act(async () => result.current.open());
    act(() => useGraphStore.getState().updateNodeData("source", { name: "Dirty" }));

    await act(async () => result.current.save());

    expect(result.current.status).toBe("conflict");
    expect(result.current.error).toMatch(/changed elsewhere/i);
  });

  it("detaches a local import so it cannot overwrite the served graph", async () => {
    const persistence: GraphPersistence = {
      load: vi.fn(async () => ({ graph: GRAPH, revision: '"revision-1"' })),
      save: vi.fn(async (graph) => ({ graph, revision: '"revision-2"' })),
    };
    const { result } = renderHook(() => useGraphPersistence({ persistence }));
    await act(async () => result.current.open());
    const local = PipelineGraphSchema.parse({ name: "local", nodes: [], edges: [] });
    const restored = graphToCanvas(local);

    act(() => {
      result.current.detach();
      useGraphStore.getState().setGraph(restored.nodes, restored.edges, local.name);
    });
    await act(async () => result.current.save());

    expect(persistence.save).not.toHaveBeenCalled();
    expect(result.current.status).toBe("error");
    expect(result.current.attached).toBe(false);
    expect(result.current.revision).toBeNull();
    expect(result.current.error).toMatch(/open a graph/i);
  });

  it("loads hosted projects and appends graph pages through the collection persistence seam", async () => {
    const managed: ManagedGraphPersistence = {
      mode: "collection",
      listProjects: vi.fn(async () => ["demo-project"]),
      listGraphs: vi
        .fn()
        .mockResolvedValueOnce({
          items: [
            {
              project: "demo-project",
              graph: "alpha",
              content_sha256: "a".repeat(64),
              created_at: "now",
              updated_at: "now",
            },
          ],
          nextCursor: "cursor-2",
        })
        .mockResolvedValueOnce({
          items: [
            {
              project: "demo-project",
              graph: "beta",
              content_sha256: "b".repeat(64),
              created_at: "now",
              updated_at: "now",
            },
          ],
          nextCursor: null,
        }),
      load: vi.fn(async () => ({ graph: GRAPH, revision: '"revision-1"' })),
      save: vi.fn(async (graph) => ({ graph, revision: '"revision-2"' })),
      create: vi.fn(async () => ({ graph: GRAPH, revision: '"revision-1"' })),
      delete: vi.fn(async () => undefined),
    };
    const { result } = renderHook(() => useGraphPersistence({ persistence: managed }));

    await act(async () => result.current.loadProjects());
    await act(async () => result.current.loadGraphs("demo-project"));
    await act(async () => result.current.loadGraphs("demo-project", true));

    expect(result.current.projects).toEqual(["demo-project"]);
    expect(result.current.graphs.map((graph) => graph.graph)).toEqual(["alpha", "beta"]);
    expect(managed.listGraphs).toHaveBeenNthCalledWith(2, "demo-project", "cursor-2");
  });

  it("creates a hosted graph from a detached draft and deletes it without clearing the canvas", async () => {
    const address = { project: "demo-project", graph: "created-graph" };
    const managed: ManagedGraphPersistence = {
      mode: "collection",
      listProjects: vi.fn(async () => [address.project]),
      listGraphs: vi.fn(async () => ({ items: [], nextCursor: null })),
      load: vi.fn(async () => ({ graph: GRAPH, revision: '"revision-1"', address })),
      save: vi.fn(async (graph) => ({ graph, revision: '"revision-2"', address })),
      create: vi.fn(async (_address, graph) => ({
        graph,
        revision: '"revision-1"',
        address,
        contentSha256: "c".repeat(64),
      })),
      delete: vi.fn(async () => undefined),
    };
    const { result } = renderHook(() => useGraphPersistence({ persistence: managed }));

    await act(async () => result.current.create(address.project, address.graph));
    expect(result.current).toMatchObject({
      status: "clean",
      attached: true,
      address,
      contentSha256: "c".repeat(64),
    });
    act(() => useGraphStore.getState().updateNodeData("1", { name: "Detached after delete" }));
    await act(async () => result.current.delete());

    expect(managed.delete).toHaveBeenCalledWith(address, '"revision-1"');
    expect(result.current.status).toBe("disconnected");
    expect(result.current.attached).toBe(false);
    expect(useGraphStore.getState().nodes[0]?.data.name).toBe("Detached after delete");
  });

  it("shows a hosted save conflict and reloads the canonical graph explicitly", async () => {
    const address = { project: "demo-project", graph: "alpha" };
    const remote = PipelineGraphSchema.parse({ ...GRAPH, name: "reloaded-graph" });
    const managed: ManagedGraphPersistence = {
      mode: "collection",
      listProjects: vi.fn(async () => [address.project]),
      listGraphs: vi.fn(async () => ({ items: [], nextCursor: null })),
      load: vi
        .fn()
        .mockResolvedValueOnce({ graph: GRAPH, revision: '"revision-1"', address })
        .mockResolvedValueOnce({
          graph: remote,
          revision: '"revision-2"',
          address,
          contentSha256: "d".repeat(64),
        }),
      save: vi.fn(async () => {
        throw new GraphPersistenceError("The revision changed.", { conflict: true });
      }),
      create: vi.fn(async () => ({ graph: GRAPH, revision: '"revision-1"', address })),
      delete: vi.fn(async () => undefined),
    };
    const { result } = renderHook(() => useGraphPersistence({ persistence: managed }));
    await act(async () => result.current.open(address));
    act(() => useGraphStore.getState().updateNodeData("source", { name: "Dirty local edit" }));

    await act(async () => result.current.save());
    expect(result.current.status).toBe("conflict");
    await act(async () => result.current.reload());

    expect(result.current.status).toBe("clean");
    expect(result.current.revision).toBe('"revision-2"');
    expect(useGraphStore.getState().graphName).toBe("reloaded-graph");
  });

  it("keeps an edit made during a hosted save dirty against the returned revision", async () => {
    const address = { project: "demo-project", graph: "alpha" };
    let resolveSave!: (document: {
      graph: typeof GRAPH;
      revision: string;
      address: typeof address;
    }) => void;
    const saveResult = new Promise<{
      graph: typeof GRAPH;
      revision: string;
      address: typeof address;
    }>((resolve) => {
      resolveSave = resolve;
    });
    const managed: ManagedGraphPersistence = {
      mode: "collection",
      listProjects: vi.fn(async () => [address.project]),
      listGraphs: vi.fn(async () => ({ items: [], nextCursor: null })),
      load: vi.fn(async () => ({ graph: GRAPH, revision: '"revision-1"', address })),
      save: vi.fn(async () => saveResult),
      create: vi.fn(async () => ({ graph: GRAPH, revision: '"revision-1"', address })),
      delete: vi.fn(async () => undefined),
    };
    const { result } = renderHook(() => useGraphPersistence({ persistence: managed }));
    await act(async () => result.current.open(address));
    act(() => useGraphStore.getState().updateNodeData("source", { name: "Saved snapshot" }));

    let saving!: Promise<void>;
    act(() => {
      saving = result.current.save();
    });
    act(() => useGraphStore.getState().updateNodeData("source", { name: "Newer local edit" }));
    resolveSave({
      graph: PipelineGraphSchema.parse({
        ...GRAPH,
        nodes: [{ ...GRAPH.nodes[0], name: "Saved snapshot" }],
      }),
      revision: '"revision-2"',
      address,
    });
    await act(async () => saving);

    expect(result.current.status).toBe("dirty");
    expect(result.current.revision).toBe('"revision-2"');
    expect(useGraphStore.getState().nodes[0]?.data.name).toBe("Newer local edit");
  });

  it("keeps an edit made during hosted create dirty against the returned revision", async () => {
    const address = { project: "demo-project", graph: "created-graph" };
    let resolveCreate!: (document: {
      graph: typeof GRAPH;
      revision: string;
      address: typeof address;
      contentSha256: string;
    }) => void;
    const createResult = new Promise<{
      graph: typeof GRAPH;
      revision: string;
      address: typeof address;
      contentSha256: string;
    }>((resolve) => {
      resolveCreate = resolve;
    });
    let submittedGraph!: typeof GRAPH;
    const managed: ManagedGraphPersistence = {
      mode: "collection",
      listProjects: vi.fn(async () => [address.project]),
      listGraphs: vi.fn(async () => ({ items: [], nextCursor: null })),
      load: vi.fn(async () => ({ graph: GRAPH, revision: '"revision-1"', address })),
      save: vi.fn(async (graph) => ({ graph, revision: '"revision-2"', address })),
      create: vi.fn(async (_address, graph) => {
        submittedGraph = graph;
        return createResult;
      }),
      delete: vi.fn(async () => undefined),
    };
    const { result } = renderHook(() => useGraphPersistence({ persistence: managed }));

    let creating!: Promise<void>;
    act(() => {
      creating = result.current.create(address.project, address.graph);
    });
    act(() => useGraphStore.getState().updateNodeData("1", { name: "Newer local edit" }));
    resolveCreate({
      graph: submittedGraph,
      revision: '"revision-1"',
      address,
      contentSha256: "e".repeat(64),
    });
    await act(async () => creating);

    expect(result.current).toMatchObject({
      status: "dirty",
      attached: true,
      revision: '"revision-1"',
      address,
      contentSha256: "e".repeat(64),
    });
    expect(useGraphStore.getState().nodes[0]?.data.name).toBe("Newer local edit");
  });
});
