import { describe, expect, it } from "vitest";
import { canvasToGraph, graphToCanvas } from "@/lib/pipeline-graph/canvas-convert";
import { decodeGraph, encodeGraph } from "@/lib/pipeline-graph/serialize";
import type { PipelineGraph } from "@/lib/pipeline-graph/schema";

/**
 * DRUFF-12 AC5: a source node's `config.request` (Dander's `RequestSpec`, sibling
 * `config.endpoint`) survives canvas -> graph -> YAML/JSON -> graph -> canvas unchanged, proving
 * this ticket needed no change to `schema.ts`/the converters — `PipelineNodeSchema.config` is
 * already an opaque `z.record(z.string(), z.unknown())` passthrough (see this ticket's Design,
 * "Round-trip needs no DRUFF-4 schema change"). Fixture values are synthetic references only
 * (`secret:demo_source_key`, `field:updated_since`, …) — no real/sensitive data, per
 * `steering/02-engineering.md`.
 */
const REQUEST_BEARING_GRAPH: PipelineGraph = {
  name: "http-request-round-trip",
  nodes: [
    {
      id: "n1",
      type: "source",
      name: "Extract candidates",
      config: {
        endpoint: "/candidates",
        request: {
          method: "POST",
          headers: {
            Authorization: "secret:demo_source_key",
            "Content-Type": "application/json",
          },
          query_params: { since: "field:updated_since" },
          body: {
            query: "field:graphql_query",
            variables: { candidate_id: "field:candidate_id" },
          },
        },
      },
      fields: [],
    },
    {
      id: "n2",
      type: "target",
      name: "Load candidates",
      config: { table: "candidates" },
      fields: [],
    },
  ],
  edges: [{ from: "n1", to: "n2", metadata: {}, mappings: [] }],
};

describe("config.request round trip (DRUFF-12 AC5)", () => {
  it("graph -> canvas -> graph is the identity on the graph", () => {
    const { nodes, edges } = graphToCanvas(REQUEST_BEARING_GRAPH);

    expect(canvasToGraph(nodes, edges, REQUEST_BEARING_GRAPH.name)).toEqual(REQUEST_BEARING_GRAPH);
  });

  it.each(["yaml", "json"] as const)(
    "canvas -> graph -> %s -> graph -> canvas survives with config.request unchanged",
    (format) => {
      const { nodes: originalNodes, edges: originalEdges } = graphToCanvas(REQUEST_BEARING_GRAPH);

      const graph = canvasToGraph(originalNodes, originalEdges, REQUEST_BEARING_GRAPH.name);
      const text = encodeGraph(graph, format);
      const decoded = decodeGraph(text, format);
      const { nodes: finalNodes, edges: finalEdges } = graphToCanvas(decoded);

      expect(decoded).toEqual(REQUEST_BEARING_GRAPH);
      expect(finalNodes[0]?.data.config).toEqual(REQUEST_BEARING_GRAPH.nodes[0]?.config);
      expect(finalEdges).toEqual(originalEdges);
    },
  );

  it("a spec-less source node's config has no `request` key at all, unaffected by this ticket", () => {
    const bareGraph: PipelineGraph = {
      name: "spec-less-source",
      nodes: [
        { id: "n1", type: "source", name: "Plain source", config: { endpoint: "/x" }, fields: [] },
      ],
      edges: [],
    };

    const { nodes, edges } = graphToCanvas(bareGraph);
    const graph = canvasToGraph(nodes, edges, bareGraph.name);

    expect(graph.nodes[0]?.config).not.toHaveProperty("request");
    expect(graph).toEqual(bareGraph);
  });
});
