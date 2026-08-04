import { describe, expect, it } from "vitest";
import type { Edge, Node } from "@xyflow/react";
import {
  canvasToGraph,
  computeDefaultLayout,
  extractLayout,
  graphToCanvas,
} from "@/lib/pipeline-graph/canvas-convert";
import type { PipelineNodeData } from "@/lib/pipeline-graph/canvas-types";
import type { PipelineGraph } from "@/lib/pipeline-graph/schema";
import { GREENHOUSE_CONNECTOR } from "@/features/connector-library/descriptors/greenhouse";

// Fixture nodes/edges — no real/sensitive data, per steering/02-engineering.md.
const SOURCE_NODE: Node<PipelineNodeData> = {
  id: "src",
  type: "pipelineNode",
  position: { x: 10, y: 20 },
  data: {
    name: "Source",
    type: "source",
    kind: "source",
    config: { endpoint: "/x" },
    fields: [{ name: "id", type: "STRING", nullable: false, description: null, metadata: {} }],
  },
};
const TARGET_NODE: Node<PipelineNodeData> = {
  id: "tgt",
  type: "pipelineNode",
  position: { x: 300, y: 20 },
  data: { name: "Target", type: "target", kind: "write" },
};
const EDGE: Edge = {
  id: "e1",
  source: "src",
  target: "tgt",
  data: {
    mappings: [{ source: "id", target: "id", transformation: null, metadata: {} }],
    metadata: {},
  },
};

describe("canvasToGraph", () => {
  it("maps every field per the design's canvas <-> graph table", () => {
    const graph = canvasToGraph([SOURCE_NODE, TARGET_NODE], [EDGE], "test-graph");

    expect(graph).toEqual<PipelineGraph>({
      name: "test-graph",
      nodes: [
        {
          id: "src",
          type: "source",
          name: "Source",
          config: { endpoint: "/x" },
          fields: [
            { name: "id", type: "STRING", nullable: false, description: null, metadata: {} },
          ],
          visual: { position: { x: 10, y: 20 }, color: null, icon: null },
        },
        {
          id: "tgt",
          type: "target",
          name: "Target",
          config: {},
          fields: [],
          visual: { position: { x: 300, y: 20 }, color: null, icon: null },
        },
      ],
      edges: [
        {
          from: "src",
          to: "tgt",
          metadata: {},
          mappings: [{ source: "id", target: "id", transformation: null, metadata: {} }],
        },
      ],
    });
  });

  it("defaults to a placeholder name when none is given", () => {
    const graph = canvasToGraph([], []);
    expect(graph.name).toBe("untitled-pipeline");
  });

  it("writes canonical visual.position but drops React Flow-only state", () => {
    const draggedNode = { ...SOURCE_NODE, selected: true, dragging: true };

    const graph = canvasToGraph([draggedNode], [], "g");

    expect(graph.nodes[0]?.visual?.position).toEqual({ x: 10, y: 20 });
    expect(JSON.stringify(graph)).not.toMatch(/"selected"|"dragging"/);
  });

  it("writes a connector node's registry danderType as the graph type, not its data.type", () => {
    // Fixture-only config value (a secret *reference*, never a real key), per 01-security.md.
    const connectorNode: Node<PipelineNodeData> = {
      id: "gh",
      type: "pipelineNode",
      position: { x: 0, y: 0 },
      data: {
        name: "New source",
        type: "source", // stale/creation-time default — must not win over the connector mapping
        kind: "source",
        connectorId: "greenhouse",
        config: { harvest_api_key_ref: "my-greenhouse-key-ref" },
      },
    };

    const graph = canvasToGraph([connectorNode], [], "g");

    expect(graph.nodes[0].type).toBe(GREENHOUSE_CONNECTOR.danderType);
  });

  it("falls back to data.type when a node's connectorId doesn't resolve to a registered connector", () => {
    const staleConnectorNode: Node<PipelineNodeData> = {
      id: "stale",
      type: "pipelineNode",
      position: { x: 0, y: 0 },
      data: { name: "N", type: "source", kind: "source", connectorId: "not-a-real-connector" },
    };

    const graph = canvasToGraph([staleConnectorNode], [], "g");

    expect(graph.nodes[0].type).toBe("source");
  });

  it("defaults edge metadata/mappings/join for an edge with no `data`", () => {
    const bareEdge: Edge = { id: "e2", source: "src", target: "tgt" };

    const graph = canvasToGraph([], [bareEdge], "g");

    expect(graph.edges[0]).toEqual({
      from: "src",
      to: "tgt",
      metadata: {},
      mappings: [],
      join: undefined,
    });
  });
});

describe("graphToCanvas", () => {
  it("derives kind from type via TYPE_TO_KIND, falling back for an unknown token", () => {
    const graph: PipelineGraph = {
      name: "g",
      nodes: [
        { id: "a", type: "source", name: "A", config: {}, fields: [] },
        { id: "b", type: "target", name: "B", config: {}, fields: [] },
        { id: "c", type: "something-unknown", name: "C", config: {}, fields: [] },
      ],
      edges: [],
    };

    const { nodes } = graphToCanvas(graph);

    expect(nodes.map((node) => node.data.kind)).toEqual(["source", "write", "transform"]);
  });

  it("re-derives connectorId from a graph node's type matching a registered connector", () => {
    const graph: PipelineGraph = {
      name: "g",
      nodes: [
        {
          id: "gh",
          type: GREENHOUSE_CONNECTOR.danderType,
          name: "Greenhouse",
          config: {},
          fields: [],
        },
        { id: "plain", type: "source", name: "Plain", config: {}, fields: [] },
      ],
      edges: [],
    };

    const { nodes } = graphToCanvas(graph);

    expect(nodes.find((n) => n.id === "gh")?.data.connectorId).toBe(GREENHOUSE_CONNECTOR.id);
    expect(nodes.find((n) => n.id === "plain")?.data.connectorId).toBeUndefined();
    // Regression guard (DRUFF-6 review addendum): a recognized connector's declared `kind` must
    // win over `kindForType`, which would otherwise miss `danderType` (not a `TYPE_TO_KIND` key)
    // and silently reload the node as `DEFAULT_NODE_KIND` ("transform") instead of "source".
    expect(nodes.find((n) => n.id === "gh")?.data.kind).toBe(GREENHOUSE_CONNECTOR.kind);
  });

  it("re-applies a supplied layout by node id", () => {
    const graph: PipelineGraph = {
      name: "g",
      nodes: [{ id: "a", type: "source", name: "A", config: {}, fields: [] }],
      edges: [],
    };

    const { nodes } = graphToCanvas(graph, { a: { x: 42, y: 99 } });

    expect(nodes[0].position).toEqual({ x: 42, y: 99 });
  });

  it("falls back to a deterministic left-to-right placement for a node absent from the layout", () => {
    const graph: PipelineGraph = {
      name: "g",
      nodes: [
        { id: "a", type: "source", name: "A", config: {}, fields: [] },
        { id: "b", type: "target", name: "B", config: {}, fields: [] },
      ],
      edges: [],
    };

    const { nodes } = graphToCanvas(graph);

    expect(nodes[0].position.x).toBeLessThan(nodes[1].position.x);
    expect(nodes[0].position).toEqual(computeDefaultLayout(graph).a);
  });

  it("builds canvas edges carrying mappings/join/metadata through from the graph edge", () => {
    const graph: PipelineGraph = {
      name: "g",
      nodes: [],
      edges: [
        {
          from: "a",
          to: "b",
          metadata: { note: "lineage" },
          mappings: [{ source: "x", target: "y", transformation: null, metadata: {} }],
          join: { type: "inner", keys: [{ left: "x", right: "y" }], metadata: {} },
        },
      ],
    };

    const { edges } = graphToCanvas(graph);

    expect(edges).toEqual([
      {
        id: "a->b#0",
        source: "a",
        target: "b",
        type: "pipelineEdge",
        data: {
          mappings: [{ source: "x", target: "y", transformation: null, metadata: {} }],
          join: { type: "inner", keys: [{ left: "x", right: "y" }], metadata: {} },
          metadata: { note: "lineage" },
        },
      },
    ]);
  });
});

describe("extractLayout", () => {
  it("captures each node's current position keyed by id", () => {
    expect(extractLayout([SOURCE_NODE, TARGET_NODE])).toEqual({
      src: { x: 10, y: 20 },
      tgt: { x: 300, y: 20 },
    });
  });
});
