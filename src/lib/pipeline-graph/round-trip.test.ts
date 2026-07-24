import { describe, expect, it } from "vitest";
import { canvasToGraph, extractLayout, graphToCanvas } from "@/lib/pipeline-graph/canvas-convert";
import { EXAMPLE_GRAPH } from "@/lib/pipeline-graph/__fixtures__/example-graph";
import { decodeGraph, encodeGraph } from "@/lib/pipeline-graph/serialize";
import type { PipelineGraph } from "@/lib/pipeline-graph/schema";

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

  // DRUFF-7 AC5: every `NodeField` key round-trips through canvas -> graph -> YAML/JSON -> graph
  // -> canvas unchanged, against the *existing* model (this ticket's Design found no schema/
  // serializer change was needed — see `canvas-types.ts`/`schema.ts`/`canvas-convert.ts`).
  const FULLY_POPULATED_FIELDS_GRAPH: PipelineGraph = {
    name: "field-schema-round-trip",
    nodes: [
      {
        id: "n1",
        type: "source",
        name: "Fixture source",
        config: {},
        fields: [
          {
            name: "email",
            type: "STRING",
            nullable: false,
            description: "Fixture field description.",
            // Fixture-only tag, not a real value (steering/01-security.md).
            metadata: { sensitivity: "pii" },
          },
        ],
      },
    ],
    edges: [],
  };

  it.each(["yaml", "json"] as const)(
    "a node's fully-populated NodeField (name/type/nullable=false/description/metadata) round-trips over %s",
    (format) => {
      const { nodes, edges } = graphToCanvas(FULLY_POPULATED_FIELDS_GRAPH);

      const graph = canvasToGraph(nodes, edges, FULLY_POPULATED_FIELDS_GRAPH.name);
      const text = encodeGraph(graph, format);
      const decoded = decodeGraph(text, format);

      expect(decoded).toEqual(FULLY_POPULATED_FIELDS_GRAPH);
    },
  );

  // DRUFF-9 AC6: a mapping's `constant` transformation — including an explicit `constant: null`,
  // distinguishable from a `direct` mapping's `transformation: null` — round-trips through
  // canvas -> graph -> YAML/JSON -> graph -> canvas unchanged. `EXAMPLE_GRAPH` above already
  // exercises an `expression` transformation with `inputs`; this fixture locks the `constant` half
  // of the on-disk keys (`transformation.kind`/`constant`) this ticket's Design calls out.
  const CONSTANT_MAPPING_GRAPH: PipelineGraph = {
    name: "constant-mapping-round-trip",
    nodes: [
      {
        id: "n1",
        type: "source",
        name: "Fixture source",
        config: {},
        fields: [{ name: "id", type: "STRING", nullable: false, description: null, metadata: {} }],
      },
      {
        id: "n2",
        type: "target",
        name: "Fixture target",
        config: {},
        fields: [
          { name: "id", type: "STRING", nullable: false, description: null, metadata: {} },
          { name: "status", type: "STRING", nullable: true, description: null, metadata: {} },
          { name: "notes", type: "STRING", nullable: true, description: null, metadata: {} },
        ],
      },
    ],
    edges: [
      {
        from: "n1",
        to: "n2",
        metadata: {},
        mappings: [
          { source: "id", target: "id", transformation: null, metadata: {} },
          {
            source: null,
            target: "status",
            transformation: {
              kind: "constant",
              expression: null,
              constant: "active",
              inputs: [],
              metadata: {},
            },
            metadata: {},
          },
          {
            // A derived mapping deriving an explicit `null` — distinct from `status` above (a
            // real constant value) and from `id`'s `direct` mapping (`transformation: null`,
            // no constant at all).
            source: null,
            target: "notes",
            transformation: {
              kind: "constant",
              expression: null,
              constant: null,
              inputs: [],
              metadata: {},
            },
            metadata: {},
          },
        ],
      },
    ],
  };

  it.each(["yaml", "json"] as const)(
    "a mapping's constant transformation, including an explicit null constant, round-trips over %s",
    (format) => {
      const { nodes, edges } = graphToCanvas(CONSTANT_MAPPING_GRAPH);

      const graph = canvasToGraph(nodes, edges, CONSTANT_MAPPING_GRAPH.name);
      const text = encodeGraph(graph, format);
      const decoded = decodeGraph(text, format);

      expect(decoded).toEqual(CONSTANT_MAPPING_GRAPH);
    },
  );

  // DRUFF-13 AC3: a trigger node's `config.trigger` (opaque record data DRUFF-4's `PipelineNodeSchema`
  // already carries losslessly via its `config: z.record(...)` field) round-trips through
  // canvas -> graph -> YAML/JSON -> graph -> canvas unchanged, with no schema change needed.
  const TRIGGER_CONFIG_GRAPH: PipelineGraph = {
    name: "trigger-config-round-trip",
    nodes: [
      {
        id: "n1",
        type: "trigger",
        name: "Fixture trigger",
        config: { trigger: { kind: "schedule", cron: "0 * * * *" } },
        fields: [],
      },
    ],
    edges: [],
  };

  it.each(["yaml", "json"] as const)(
    "a trigger node's config.trigger round-trips over %s",
    (format) => {
      const { nodes, edges } = graphToCanvas(TRIGGER_CONFIG_GRAPH);

      const graph = canvasToGraph(nodes, edges, TRIGGER_CONFIG_GRAPH.name);
      const text = encodeGraph(graph, format);
      const decoded = decodeGraph(text, format);

      expect(decoded).toEqual(TRIGGER_CONFIG_GRAPH);
    },
  );
});
