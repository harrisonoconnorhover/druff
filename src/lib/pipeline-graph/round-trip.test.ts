import { describe, expect, it } from "vitest";
import { canvasToGraph, extractLayout, graphToCanvas } from "@/lib/pipeline-graph/canvas-convert";
import { EXAMPLE_GRAPH } from "@/lib/pipeline-graph/__fixtures__/example-graph";
import { decodeGraph, encodeGraph } from "@/lib/pipeline-graph/serialize";

/**
 * End-to-end chain the AC calls out explicitly: canvas -> graph -> YAML/JSON -> graph -> canvas.
 * Everything under test is pure, so no rendering/store/network is involved.
 */
describe("canvas <-> graph <-> YAML/JSON round trip", () => {
  it("graph -> canvas -> graph is the identity on the graph (positions irrelevant)", () => {
    const { nodes, edges } = graphToCanvas(EXAMPLE_GRAPH);

    const roundTripped = canvasToGraph(nodes, edges, EXAMPLE_GRAPH.name);

    expect(roundTripped).toEqual(EXAMPLE_GRAPH);
  });

  it.each(["yaml", "json"] as const)(
    "canvas -> graph -> %s -> graph -> canvas is the identity on the canvas, positions included",
    (format) => {
      const layout = {
        crm_contacts: { x: 0, y: 0 },
        warehouse_customers: { x: 300, y: 0 },
        notify_slack: { x: 600, y: 120 },
      };
      const { nodes: originalNodes, edges: originalEdges } = graphToCanvas(EXAMPLE_GRAPH, layout);

      const graph = canvasToGraph(originalNodes, originalEdges, EXAMPLE_GRAPH.name);
      const text = encodeGraph(graph, format);
      const decoded = decodeGraph(text, format);
      const restoredLayout = extractLayout(originalNodes);
      const { nodes: finalNodes, edges: finalEdges } = graphToCanvas(decoded, restoredLayout);

      expect(finalNodes).toEqual(originalNodes);
      expect(finalEdges).toEqual(originalEdges);
    },
  );

  it("a bare graph with no layout sidecar still produces a stable, total canvas", () => {
    const { nodes } = graphToCanvas(EXAMPLE_GRAPH);

    // Every node gets a definite, distinct position — import never leaves a node un-placed.
    const positions = nodes.map((node) => `${node.position.x},${node.position.y}`);
    expect(new Set(positions).size).toBe(nodes.length);
  });
});
