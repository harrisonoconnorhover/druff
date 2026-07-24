import { describe, expect, it } from "vitest";
import type { Edge, Node } from "@xyflow/react";
import {
  edgeEndpointNames,
  resolveInspectorTarget,
} from "@/features/pipeline-canvas/inspector/inspectorTarget";
import type { PipelineEdgeData, PipelineNodeData } from "@/lib/pipeline-graph";

// Fixture nodes/edges only — no real/sensitive data, per steering/02-engineering.md.
const NODE_A: Node<PipelineNodeData> = {
  id: "a",
  type: "pipelineNode",
  position: { x: 0, y: 0 },
  data: { name: "Source A", type: "source", kind: "source" },
};
const NODE_B: Node<PipelineNodeData> = {
  id: "b",
  type: "pipelineNode",
  position: { x: 200, y: 0 },
  data: { name: "Write B", type: "target", kind: "write" },
};
const EDGE_AB: Edge<PipelineEdgeData> = { id: "e-a-b", source: "a", target: "b" };

describe("resolveInspectorTarget", () => {
  it("resolves to the node when exactly one node and no edge is selected", () => {
    expect(resolveInspectorTarget(NODE_A, null)).toEqual({ kind: "node", node: NODE_A });
  });

  it("resolves to the edge when exactly one edge and no node is selected", () => {
    expect(resolveInspectorTarget(null, EDGE_AB)).toEqual({ kind: "edge", edge: EDGE_AB });
  });

  it("resolves to none when nothing is selected", () => {
    expect(resolveInspectorTarget(null, null)).toEqual({ kind: "none" });
  });

  it("resolves to none when a node and an edge are both selected (ambiguity tie-break)", () => {
    expect(resolveInspectorTarget(NODE_A, EDGE_AB)).toEqual({ kind: "none" });
  });
});

describe("edgeEndpointNames", () => {
  it("resolves both endpoints to their node names", () => {
    expect(edgeEndpointNames(EDGE_AB, [NODE_A, NODE_B])).toEqual({
      from: { id: "a", name: "Source A" },
      to: { id: "b", name: "Write B" },
    });
  });

  it("falls back to the raw id when an endpoint doesn't resolve against any current node", () => {
    const danglingEdge: Edge<PipelineEdgeData> = { id: "e-a-z", source: "a", target: "z" };

    expect(edgeEndpointNames(danglingEdge, [NODE_A, NODE_B])).toEqual({
      from: { id: "a", name: "Source A" },
      to: { id: "z", name: "z" },
    });
  });
});
