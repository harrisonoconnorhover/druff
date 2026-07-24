import { describe, expect, it } from "vitest";
import type { Edge } from "@xyflow/react";
import { attributeViolations } from "@/features/pipeline-canvas/validation/attributeViolations";
import type { PipelineEdgeData, Violation } from "@/lib/pipeline-graph";

// Fixture-only canvas edges: ids/endpoints only, no real/sensitive data (steering/02-engineering.md).
const EDGE_AB: Edge<PipelineEdgeData> = { id: "a->b#0", source: "a", target: "b" };
const EDGE_BC: Edge<PipelineEdgeData> = { id: "b->c#0", source: "b", target: "c" };
const EDGE_AB_PARALLEL: Edge<PipelineEdgeData> = { id: "a->b#1", source: "a", target: "b" };

describe("attributeViolations", () => {
  it("returns an empty index for a clean graph (no violations)", () => {
    expect(attributeViolations([], [EDGE_AB])).toEqual({ byNodeId: {}, byEdgeId: {} });
  });

  it("attributes a duplicate-node-id violation to the node only", () => {
    const violation: Violation = { kind: "duplicate-node-id", nodeId: "a" };

    const index = attributeViolations([violation], [EDGE_AB]);

    expect(index.byNodeId).toEqual({ a: [violation] });
    expect(index.byEdgeId).toEqual({});
  });

  it("attributes a dangling-edge violation to the edge only (the missing id is not a canvas node)", () => {
    const violation: Violation = {
      kind: "dangling-edge",
      edge: { from: "a", to: "ghost", edgeIndex: 0 },
      missingId: "ghost",
    };
    const edge: Edge<PipelineEdgeData> = { id: "a->ghost#0", source: "a", target: "ghost" };

    const index = attributeViolations([violation], [edge]);

    expect(index.byNodeId).toEqual({});
    expect(index.byEdgeId).toEqual({ "a->ghost#0": [violation] });
  });

  it("attributes a self-loop violation to both the node and the edge", () => {
    const selfEdge: Edge<PipelineEdgeData> = { id: "a->a#0", source: "a", target: "a" };
    const violation: Violation = {
      kind: "self-loop",
      nodeId: "a",
      edge: { from: "a", to: "a", edgeIndex: 0 },
    };

    const index = attributeViolations([violation], [selfEdge]);

    expect(index.byNodeId).toEqual({ a: [violation] });
    expect(index.byEdgeId).toEqual({ "a->a#0": [violation] });
  });

  it("attributes both node id and edge for unknown-field-reference (AC2's node-or-edge, satisfied on both)", () => {
    const violation: Violation = {
      kind: "unknown-field-reference",
      nodeId: "a",
      fieldName: "email",
      edge: { from: "a", to: "b", edgeIndex: 0 },
      referenceKind: "mapping_source",
    };

    const index = attributeViolations([violation], [EDGE_AB]);

    expect(index.byNodeId).toEqual({ a: [violation] });
    expect(index.byEdgeId).toEqual({ "a->b#0": [violation] });
  });

  it("attributes join-key-field the same way, keyed by nodeId and edge", () => {
    const violation: Violation = {
      kind: "join-key-field",
      nodeId: "b",
      fieldName: "customer_id",
      edge: { from: "a", to: "b", edgeIndex: 0 },
      referenceKind: "join_right",
      keyIndex: 0,
    };

    const index = attributeViolations([violation], [EDGE_AB]);

    expect(index.byNodeId).toEqual({ b: [violation] });
    expect(index.byEdgeId).toEqual({ "a->b#0": [violation] });
  });

  it("attributes duplicate-field-name to the node only", () => {
    const violation: Violation = { kind: "duplicate-field-name", nodeId: "a", fieldName: "id" };

    const index = attributeViolations([violation], [EDGE_AB]);

    expect(index.byNodeId).toEqual({ a: [violation] });
    expect(index.byEdgeId).toEqual({});
  });

  it("fans a graph-cycle violation to every participating node and the consecutive-pair edges (AC4)", () => {
    const violation: Violation = { kind: "graph-cycle", cycle: ["a", "b", "c", "a"] };
    const EDGE_CA: Edge<PipelineEdgeData> = { id: "c->a#0", source: "c", target: "a" };
    const unrelatedEdge: Edge<PipelineEdgeData> = { id: "a->c#0", source: "a", target: "c" };

    const index = attributeViolations([violation], [EDGE_AB, EDGE_BC, EDGE_CA, unrelatedEdge]);

    expect(index.byNodeId).toEqual({ a: [violation], b: [violation], c: [violation] });
    expect(Object.keys(index.byEdgeId).sort()).toEqual(["a->b#0", "b->c#0", "c->a#0"]);
    // The unrelated a->c edge connects two cycle nodes but isn't itself part of the cycle path.
    expect(index.byEdgeId["a->c#0"]).toBeUndefined();
  });

  it("collects multiple violations for the same node/edge, preserving order", () => {
    const dup: Violation = { kind: "duplicate-field-name", nodeId: "a", fieldName: "id" };
    const unknown: Violation = {
      kind: "unknown-field-reference",
      nodeId: "a",
      fieldName: "email",
      edge: { from: "a", to: "b", edgeIndex: 0 },
      referenceKind: "mapping_source",
    };

    const index = attributeViolations([dup, unknown], [EDGE_AB]);

    expect(index.byNodeId.a).toEqual([dup, unknown]);
  });

  it("resolves an EdgeRef by index, disambiguating parallel edges between the same two nodes", () => {
    const violation: Violation = {
      kind: "unknown-field-reference",
      nodeId: "b",
      fieldName: "x",
      edge: { from: "a", to: "b", edgeIndex: 1 },
      referenceKind: "mapping_target",
    };

    const index = attributeViolations([violation], [EDGE_AB, EDGE_AB_PARALLEL]);

    expect(index.byEdgeId).toEqual({ "a->b#1": [violation] });
    expect(index.byEdgeId["a->b#0"]).toBeUndefined();
  });

  it("falls back to endpoint matching when the index is out of range", () => {
    const violation: Violation = {
      kind: "unknown-field-reference",
      nodeId: "b",
      fieldName: "x",
      edge: { from: "a", to: "b", edgeIndex: 99 },
      referenceKind: "mapping_target",
    };

    const index = attributeViolations([violation], [EDGE_AB]);

    expect(index.byEdgeId).toEqual({ "a->b#0": [violation] });
  });
});
