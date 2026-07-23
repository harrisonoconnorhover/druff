import { describe, expect, it } from "vitest";
import {
  JoinSpecSchema,
  PipelineEdgeSchema,
  PipelineGraphSchema,
  PipelineNodeSchema,
  TransformationSchema,
} from "@/lib/pipeline-graph/schema";

describe("PipelineNodeSchema", () => {
  it("applies Dander's documented defaults for unset config/fields", () => {
    expect(PipelineNodeSchema.parse({ id: "n1", type: "source", name: "N1" })).toEqual({
      id: "n1",
      type: "source",
      name: "N1",
      config: {},
      fields: [],
    });
  });

  it("accepts `params` as an input alias for `config` and normalizes it", () => {
    const node = PipelineNodeSchema.parse({
      id: "n1",
      type: "source",
      name: "N1",
      params: { endpoint: "/x" },
    });

    expect(node.config).toEqual({ endpoint: "/x" });
    expect(node).not.toHaveProperty("params");
  });

  it("prefers an explicit `config` over `params` when both are present", () => {
    const node = PipelineNodeSchema.parse({
      id: "n1",
      type: "source",
      name: "N1",
      config: { a: 1 },
      params: { b: 2 },
    });

    expect(node.config).toEqual({ a: 1 });
  });

  it("throws on a missing required field", () => {
    expect(() => PipelineNodeSchema.parse({ type: "source", name: "N1" })).toThrow();
  });

  it("applies NodeField defaults (nullable/description/metadata)", () => {
    const node = PipelineNodeSchema.parse({
      id: "n1",
      type: "source",
      name: "N1",
      fields: [{ name: "f1", type: "STRING" }],
    });

    expect(node.fields).toEqual([
      { name: "f1", type: "STRING", nullable: true, description: null, metadata: {} },
    ]);
  });
});

describe("TransformationSchema", () => {
  it("defaults to kind 'direct' with no expression/constant", () => {
    expect(TransformationSchema.parse({})).toEqual({
      kind: "direct",
      expression: null,
      constant: null,
      inputs: [],
      metadata: {},
    });
  });

  it("throws on an out-of-set kind", () => {
    expect(() => TransformationSchema.parse({ kind: "bogus" })).toThrow();
  });
});

describe("JoinSpecSchema", () => {
  it("requires at least one key pair", () => {
    expect(() => JoinSpecSchema.parse({ type: "inner", keys: [] })).toThrow();
  });

  it("throws on an out-of-set join type", () => {
    expect(() =>
      JoinSpecSchema.parse({ type: "bogus", keys: [{ left: "a", right: "b" }] }),
    ).toThrow();
  });
});

describe("PipelineEdgeSchema", () => {
  it("normalizes an absent `join` to undefined, never null", () => {
    const edge = PipelineEdgeSchema.parse({ from: "a", to: "b" });
    expect(edge.join).toBeUndefined();
    expect(edge).not.toHaveProperty("join", null);
  });

  it("normalizes an explicit `join: null` to undefined too", () => {
    const edge = PipelineEdgeSchema.parse({ from: "a", to: "b", join: null });
    expect(edge.join).toBeUndefined();
  });

  it("defaults mappings/metadata for a bare edge", () => {
    const edge = PipelineEdgeSchema.parse({ from: "a", to: "b" });
    expect(edge.mappings).toEqual([]);
    expect(edge.metadata).toEqual({});
  });
});

describe("PipelineGraphSchema", () => {
  it("defaults nodes/edges to empty arrays", () => {
    expect(PipelineGraphSchema.parse({ name: "g" })).toEqual({ name: "g", nodes: [], edges: [] });
  });

  it("throws a structured error on malformed input", () => {
    expect(() => PipelineGraphSchema.parse({ name: "g", nodes: "not-an-array" })).toThrow();
  });

  it("throws when required `name` is missing", () => {
    expect(() => PipelineGraphSchema.parse({})).toThrow();
  });
});
