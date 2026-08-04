import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGraphPersistence } from "@/features/graph-io/useGraphPersistence";
import { SEED_GRAPH, useGraphStore } from "@/lib/graph-store";
import { PipelineGraphSchema, graphToCanvas } from "@/lib/pipeline-graph";
import { GraphPersistenceError, type GraphPersistence } from "@/lib/persistence/graph-persistence";

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
  useGraphStore.getState().setGraph(SEED_GRAPH.nodes, SEED_GRAPH.edges, SEED_GRAPH.name);
});

describe("useGraphPersistence", () => {
  it("opens explicitly, marks edits dirty, and conditionally saves the current graph", async () => {
    const persistence: GraphPersistence = {
      load: vi.fn(async () => ({ graph: GRAPH, revision: '"revision-1"' })),
      save: vi.fn(async (graph) => ({ graph, revision: '"revision-2"' })),
    };
    const { result } = renderHook(() => useGraphPersistence({ persistence }));

    await act(async () => result.current.open());
    expect(result.current.status).toBe("clean");
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
    expect(result.current.error).toMatch(/open a graph/i);
  });
});
