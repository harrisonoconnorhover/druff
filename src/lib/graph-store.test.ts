import { describe, expect, it } from "vitest";
import { createStore } from "zustand/vanilla";
import type { Node } from "@xyflow/react";
import { createGraphState, type GraphState } from "@/lib/graph-store";
import type { PipelineNodeData } from "@/lib/pipeline-graph";

// Fixture graph — no real/sensitive data, per steering/02-engineering.md. Two connected nodes so
// removeNode's edge-pruning has an incident edge to prune.
function makeStore() {
  const fixture = {
    nodes: [
      {
        id: "a",
        type: "pipelineNode",
        position: { x: 0, y: 0 },
        data: { name: "Source A", type: "source", kind: "source" as const },
      },
      {
        id: "b",
        type: "pipelineNode",
        position: { x: 200, y: 0 },
        data: { name: "Write B", type: "target", kind: "write" as const },
      },
    ],
    edges: [{ id: "e-a-b", source: "a", target: "b" }],
  };
  return createStore<GraphState>(createGraphState(fixture));
}

describe("graph-store", () => {
  it("addNode appends the given node", () => {
    const store = makeStore();
    const newNode: Node<PipelineNodeData> = {
      id: "c",
      type: "pipelineNode",
      position: { x: 400, y: 0 },
      data: { name: "Transform C", type: "transform", kind: "transform" },
    };

    store.getState().addNode(newNode);

    const { nodes } = store.getState();
    expect(nodes).toHaveLength(3);
    expect(nodes.at(-1)).toEqual(newNode);
  });

  it("updateNodeData shallow-merges the patch into the target node's data", () => {
    const store = makeStore();

    store.getState().updateNodeData("a", { name: "Renamed Source" });

    const nodeA = store.getState().nodes.find((n) => n.id === "a");
    expect(nodeA?.data).toEqual({ name: "Renamed Source", type: "source", kind: "source" });
    // Other nodes are untouched.
    const nodeB = store.getState().nodes.find((n) => n.id === "b");
    expect(nodeB?.data.name).toBe("Write B");
  });

  it("removeNode removes the node and prunes any edge touching it", () => {
    const store = makeStore();

    store.getState().removeNode("a");

    const { nodes, edges } = store.getState();
    expect(nodes.map((n) => n.id)).toEqual(["b"]);
    expect(edges).toHaveLength(0);
  });

  it("removeNode leaves unrelated edges intact", () => {
    const store = makeStore();
    store.getState().addNode({
      id: "c",
      type: "pipelineNode",
      position: { x: 400, y: 0 },
      data: { name: "Transform C", type: "transform", kind: "transform" },
    });
    store.setState({
      edges: [...store.getState().edges, { id: "e-b-c", source: "b", target: "c" }],
    });

    store.getState().removeNode("a");

    expect(store.getState().edges).toEqual([{ id: "e-b-c", source: "b", target: "c" }]);
  });

  it("onConnect adds an edge for a completed connection", () => {
    const store = makeStore();
    store.getState().addNode({
      id: "c",
      type: "pipelineNode",
      position: { x: 400, y: 0 },
      data: { name: "Transform C", type: "transform", kind: "transform" },
    });

    store.getState().onConnect({
      source: "a",
      target: "c",
      sourceHandle: null,
      targetHandle: null,
    });

    // The fixture already has one a->b edge; onConnect adds a distinct a->c edge.
    expect(store.getState().edges).toHaveLength(2);
    const added = store.getState().edges.find((e) => e.id !== "e-a-b");
    expect(added).toMatchObject({ source: "a", target: "c" });
  });

  it("onNodesChange applies a remove change via applyNodeChanges", () => {
    const store = makeStore();

    store.getState().onNodesChange([{ type: "remove", id: "b" }]);

    expect(store.getState().nodes.map((n) => n.id)).toEqual(["a"]);
  });

  it("onEdgesChange applies a remove change via applyEdgeChanges", () => {
    const store = makeStore();

    store.getState().onEdgesChange([{ type: "remove", id: "e-a-b" }]);

    expect(store.getState().edges).toEqual([]);
  });

  it("setGraph wholesale-replaces nodes and edges (DRUFF-5 hydration/import)", () => {
    const store = makeStore();
    const nextNodes: Node<PipelineNodeData>[] = [
      {
        id: "z",
        type: "pipelineNode",
        position: { x: 10, y: 10 },
        data: { name: "Imported Source", type: "source", kind: "source" },
      },
    ];
    const nextEdges = [{ id: "e-z", source: "z", target: "z" }];

    store.getState().setGraph(nextNodes, nextEdges);

    expect(store.getState().nodes).toEqual(nextNodes);
    expect(store.getState().edges).toEqual(nextEdges);
  });
});
