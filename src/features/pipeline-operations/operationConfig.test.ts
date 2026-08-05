import { describe, expect, it } from "vitest";
import {
  createOperation,
  moveOperation,
  readOperationConfig,
  writeOperationConfig,
} from "@/features/pipeline-operations/operationConfig";
import { PipelineGraphSchema, canvasToGraph, graphToCanvas } from "@/lib/pipeline-graph";

describe("canonical pipeline operation config", () => {
  it("reads ordered Dander operations and preserves metadata", () => {
    const config = {
      sql: "select name from source",
      operations: [
        { kind: "trim_whitespace", params: { field: "name" }, metadata: { owner: "data" } },
        { kind: "filter_rows", params: { conditions: [{ field: "name", op: "is_not_null" }] } },
      ],
    };

    expect(readOperationConfig(config)).toEqual({
      operations: [
        { kind: "trim_whitespace", params: { field: "name" }, metadata: { owner: "data" } },
        {
          kind: "filter_rows",
          params: { conditions: [{ field: "name", op: "is_not_null" }], logic: "all" },
          metadata: {},
        },
      ],
      error: null,
    });
  });

  it("writes only operations and keeps sibling transform config", () => {
    expect(
      writeOperationConfig({ sql: "select * from source", engine: "sql" }, [
        createOperation("truncate_string", "name"),
      ]),
    ).toEqual({
      sql: "select * from source",
      engine: "sql",
      operations: [
        {
          kind: "truncate_string",
          params: { field: "name", max_length: 255 },
          metadata: {},
        },
      ],
    });
  });

  it("refuses to reinterpret unknown/newer operations", () => {
    const result = readOperationConfig({
      operations: [{ kind: "write_back", params: { destination: "provider" } }],
    });

    expect(result.operations).toBeNull();
    expect(result.error).toMatch(/cannot safely edit/i);
  });

  it("preserves exact order when moving operations", () => {
    const first = createOperation("trim_whitespace", "name");
    const second = createOperation("default_value", "name");
    expect(moveOperation([first, second], 1, 0)).toEqual([second, first]);
  });

  it("round-trips canonical operations through the canvas without a second graph schema", () => {
    const graph = PipelineGraphSchema.parse({
      name: "operation-round-trip",
      nodes: [
        {
          id: "normalize",
          type: "transform",
          name: "Normalize",
          config: {
            sql: "select name from source",
            operations: [{ kind: "trim_whitespace", params: { field: "name" }, metadata: {} }],
          },
          fields: [{ name: "name", type: "STRING" }],
        },
      ],
      edges: [],
    });
    const canvas = graphToCanvas(graph);

    expect(canvasToGraph(canvas.nodes, canvas.edges, graph.name, graph.trigger)).toEqual(graph);
  });
});
