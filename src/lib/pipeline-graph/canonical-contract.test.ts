import { describe, expect, it } from "vitest";
import {
  canvasToGraph,
  decodeGraph,
  encodeGraph,
  graphToCanvas,
  PipelineGraphSchema,
} from "@/lib/pipeline-graph";

/** Fully populated against Dander 0.2.0rc4's current PipelineGraph model. */
const CURRENT_DANDER_GRAPH = PipelineGraphSchema.parse({
  name: "current-contract",
  trigger: {
    kind: "schedule",
    cron: "0 6 * * *",
    depends_on: [],
    event: null,
    metadata: { owner: "data" },
  },
  nodes: [
    {
      id: "source",
      type: "source",
      name: "CRM source",
      config: { connector: "greenhouse", extra_setting: { preserved: true } },
      fields: [
        {
          name: "id",
          type: "STRING",
          cast_to: "INT64",
          nullable: false,
          description: "Synthetic identifier",
          tests: [{ kind: "not_null", values: [], to: null, field: null, metadata: {} }],
          metadata: { classification: "internal" },
        },
        {
          name: "updated_at",
          type: "TIMESTAMP",
          cast_to: null,
          nullable: true,
          description: null,
          tests: [],
          metadata: {},
        },
      ],
      trigger: { kind: "manual", cron: null, event: "refresh", depends_on: [], metadata: {} },
      cursor: { field: "updated_at", kind: "timestamp", params: {}, metadata: {} },
      visual: { position: { x: 10, y: 20 }, color: "#123456", icon: "building" },
    },
    {
      id: "target",
      type: "target",
      name: "Warehouse target",
      config: {
        writer: {
          write_mode: "scd1",
          destination: {
            project: "fixture-project",
            dataset: "raw",
            table: "contacts",
            business_key: ["id"],
          },
          cursor_field: null,
          partitioning: null,
          clustering: [],
          max_batch_rows: 2500,
          schema_evolution: "additive",
          transport: "storage_write",
        },
      },
      fields: [
        {
          name: "id",
          type: "INT64",
          cast_to: null,
          nullable: false,
          description: null,
          tests: [{ kind: "unique", values: [], to: null, field: null, metadata: {} }],
          metadata: {},
        },
      ],
      trigger: null,
      cursor: null,
      visual: { position: { x: 320, y: 20 }, color: "blue", icon: "database" },
    },
  ],
  edges: [
    {
      from: "source",
      to: "target",
      metadata: { purpose: "load" },
      mappings: [
        {
          source: "id",
          target: "id",
          transformation: {
            kind: "custom_code",
            expression: null,
            constant: null,
            function: "transforms.normalize_id",
            arguments: { radix: 10 },
            inputs: ["id"],
            metadata: { reviewed: true },
          },
          metadata: {},
        },
      ],
      join: null,
    },
  ],
});

describe("current Dander PipelineGraph contract", () => {
  it("patches a canvas move without dropping any other canonical field", () => {
    const { nodes, edges, trigger } = graphToCanvas(CURRENT_DANDER_GRAPH);
    const moved = nodes.map((node) =>
      node.id === "source" ? { ...node, position: { x: 99, y: 101 } } : node,
    );

    const saved = canvasToGraph(moved, edges, CURRENT_DANDER_GRAPH.name, trigger);
    const expected = structuredClone(CURRENT_DANDER_GRAPH);
    expected.nodes[0]!.visual!.position = { x: 99, y: 101 };

    expect(saved).toEqual(expected);
    expect(saved.nodes[0]?.visual).toMatchObject({ color: "#123456", icon: "building" });
    expect(saved.nodes[0]?.cursor).toEqual(CURRENT_DANDER_GRAPH.nodes[0]?.cursor);
    expect(saved.nodes[0]?.fields[0]?.tests).toEqual(
      CURRENT_DANDER_GRAPH.nodes[0]?.fields[0]?.tests,
    );
    expect(saved.nodes[1]?.config).toEqual(CURRENT_DANDER_GRAPH.nodes[1]?.config);
    expect(saved.trigger).toEqual(CURRENT_DANDER_GRAPH.trigger);
  });

  it("keeps a graph with untouched fallback layout model-equivalent", () => {
    const withoutVisual = PipelineGraphSchema.parse({
      name: "no-layout",
      nodes: [{ id: "one", type: "source", name: "One" }],
      edges: [],
    });
    const { nodes, edges, trigger } = graphToCanvas(withoutVisual);

    expect(canvasToGraph(nodes, edges, withoutVisual.name, trigger)).toEqual(withoutVisual);
  });

  it.each(["yaml", "json"] as const)(
    "keeps the graph-level trigger in %s serialization",
    (format) => {
      expect(decodeGraph(encodeGraph(CURRENT_DANDER_GRAPH, format), format)).toEqual(
        CURRENT_DANDER_GRAPH,
      );
    },
  );
});
