import { describe, expect, it } from "vitest";
import { canvasToGraph, graphToCanvas } from "@/lib/pipeline-graph/canvas-convert";
import { decodeGraph, encodeGraph } from "@/lib/pipeline-graph/serialize";
import { PipelineGraphSchema, type PipelineGraph } from "@/lib/pipeline-graph/schema";

/**
 * DRUFF-17 AC4: a target node's `config.writer` (Dander's `WriterConfig`) survives
 * canvas -> graph -> YAML/JSON -> graph -> canvas unchanged, proving this ticket needed no change
 * to `schema.ts`/the converters — `PipelineNodeSchema.config` is already an opaque
 * `z.record(z.string(), z.unknown())` passthrough (see this ticket's Design, "Round-trip needs no
 * schema.ts change"), modeled on `http-request-round-trip.test.ts` (DRUFF-12). Fixture values are
 * benign identifiers only (`analytics`, `dim_customer`, `customer_id`, `updated_at`) — no
 * real/sensitive data, per `steering/02-engineering.md`.
 */
const WRITER_BEARING_GRAPH = PipelineGraphSchema.parse({
  name: "writer-config-round-trip",
  nodes: [
    {
      id: "n1",
      type: "source",
      name: "Extract customers",
      config: {},
      fields: [],
    },
    {
      id: "n2",
      type: "target",
      name: "Load customers",
      config: {
        writer: {
          write_mode: "incremental",
          destination: {
            project: "my-project",
            dataset: "analytics",
            table: "dim_customer",
            business_key: ["customer_id"],
          },
          cursor_field: "updated_at",
          partitioning: {
            field: null,
            granularity: "day",
            require_partition_filter: false,
          },
          clustering: ["region", "segment"],
        },
      },
      fields: [],
    },
  ],
  edges: [{ from: "n1", to: "n2", metadata: {}, mappings: [] }],
});

describe("config.writer round trip (DRUFF-17 AC4)", () => {
  it("graph -> canvas -> graph is the identity on the graph", () => {
    const { nodes, edges } = graphToCanvas(WRITER_BEARING_GRAPH);

    expect(canvasToGraph(nodes, edges, WRITER_BEARING_GRAPH.name)).toEqual(WRITER_BEARING_GRAPH);
  });

  it.each(["yaml", "json"] as const)(
    "canvas -> graph -> %s -> graph -> canvas survives with config.writer unchanged",
    (format) => {
      const { nodes: originalNodes, edges: originalEdges } = graphToCanvas(WRITER_BEARING_GRAPH);

      const graph = canvasToGraph(originalNodes, originalEdges, WRITER_BEARING_GRAPH.name);
      const text = encodeGraph(graph, format);
      const decoded = decodeGraph(text, format);
      const { nodes: finalNodes, edges: finalEdges } = graphToCanvas(decoded);

      expect(decoded).toEqual(WRITER_BEARING_GRAPH);
      expect(finalNodes[1]?.data.config).toEqual(WRITER_BEARING_GRAPH.nodes[1]?.config);
      expect(finalEdges).toEqual(originalEdges);
    },
  );

  it("a writer-less target node's config has no `writer` key at all, unaffected by this ticket", () => {
    const bareGraph: PipelineGraph = {
      name: "writer-less-target",
      nodes: [
        { id: "n1", type: "target", name: "Plain target", config: { table: "raw" }, fields: [] },
      ],
      edges: [],
    };

    const { nodes, edges } = graphToCanvas(bareGraph);
    const graph = canvasToGraph(nodes, edges, bareGraph.name);

    expect(graph.nodes[0]?.config).not.toHaveProperty("writer");
    expect(graph).toEqual(bareGraph);
  });
});
