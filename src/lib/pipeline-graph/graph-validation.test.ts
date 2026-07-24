import { describe, expect, it } from "vitest";
import { validateFieldWiring, validateStructure } from "@/lib/pipeline-graph/graph-validation";
import type { PipelineEdge, PipelineGraph, PipelineNode } from "@/lib/pipeline-graph/schema";
import { EXAMPLE_GRAPH } from "@/lib/pipeline-graph/__fixtures__/example-graph";

// Small builders for hand-authored, non-sensitive fixture graphs — fake ids/field names only,
// per steering/02-engineering.md ("fixtures carry no real/sensitive data").

function node(id: string, fields: PipelineNode["fields"] = []): PipelineNode {
  return { id, type: "source", name: id, config: {}, fields };
}

function edge(from: string, to: string, overrides: Partial<PipelineEdge> = {}): PipelineEdge {
  return { from, to, metadata: {}, mappings: [], ...overrides };
}

function graph(nodes: PipelineNode[], edges: PipelineEdge[]): PipelineGraph {
  return { name: "test-graph", nodes, edges };
}

describe("validateStructure", () => {
  it("returns [] for a structurally sound graph (EXAMPLE_GRAPH)", () => {
    expect(validateStructure(EXAMPLE_GRAPH)).toEqual([]);
  });

  it("reports a duplicate-node-id violation, one per repeated occurrence", () => {
    const g = graph([node("a"), node("b"), node("a"), node("a")], []);
    const violations = validateStructure(g);
    expect(violations).toEqual([
      { kind: "duplicate-node-id", nodeId: "a" },
      { kind: "duplicate-node-id", nodeId: "a" },
    ]);
  });

  it("reports two distinct duplicate ids, both within phase 1", () => {
    const g = graph([node("a"), node("b"), node("a"), node("b")], []);
    const violations = validateStructure(g);
    expect(violations).toEqual([
      { kind: "duplicate-node-id", nodeId: "a" },
      { kind: "duplicate-node-id", nodeId: "b" },
    ]);
  });

  it("reports a dangling-edge violation with missingId for a missing `from`", () => {
    const g = graph([node("b")], [edge("missing", "b")]);
    expect(validateStructure(g)).toEqual([
      {
        kind: "dangling-edge",
        edge: { from: "missing", to: "b", edgeIndex: 0 },
        missingId: "missing",
      },
    ]);
  });

  it("reports a dangling-edge violation with missingId for a missing `to`", () => {
    const g = graph([node("a")], [edge("a", "missing")]);
    expect(validateStructure(g)).toEqual([
      {
        kind: "dangling-edge",
        edge: { from: "a", to: "missing", edgeIndex: 0 },
        missingId: "missing",
      },
    ]);
  });

  it("does not falsely evaluate a cycle when an edge is dangling", () => {
    // a -> a via a dangling second edge; must not report graph-cycle.
    const g = graph([node("a")], [edge("a", "missing")]);
    const violations = validateStructure(g);
    expect(violations.some((v) => v.kind === "graph-cycle")).toBe(false);
  });

  it("reports a self-loop violation, never a graph-cycle, for an edge whose from === to", () => {
    const g = graph([node("a"), node("b")], [edge("a", "a"), edge("a", "b")]);
    const violations = validateStructure(g);
    expect(violations).toEqual([
      { kind: "self-loop", nodeId: "a", edge: { from: "a", to: "a", edgeIndex: 0 } },
    ]);
    expect(violations.some((v) => v.kind === "graph-cycle")).toBe(false);
  });

  it("reports a graph-cycle violation with the start node repeated at the end", () => {
    const g = graph(
      [node("a"), node("b"), node("c")],
      [edge("a", "b"), edge("b", "c"), edge("c", "a")],
    );
    expect(validateStructure(g)).toEqual([{ kind: "graph-cycle", cycle: ["a", "b", "c", "a"] }]);
  });

  it("is deterministic across repeated calls on the same cyclic graph", () => {
    const g = graph(
      [node("a"), node("b"), node("c")],
      [edge("a", "b"), edge("b", "c"), edge("c", "a")],
    );
    expect(validateStructure(g)).toEqual(validateStructure(g));
  });
});

describe("validateFieldWiring", () => {
  it("returns [] for a fully field-wired graph (EXAMPLE_GRAPH)", () => {
    expect(validateFieldWiring(EXAMPLE_GRAPH)).toEqual([]);
  });

  it("reports a duplicate-field-name violation", () => {
    const g = graph(
      [
        node("a", [
          { name: "f", type: "STRING", nullable: true, description: null, metadata: {} },
          { name: "f", type: "STRING", nullable: true, description: null, metadata: {} },
        ]),
      ],
      [],
    );
    expect(validateFieldWiring(g)).toEqual([
      { kind: "duplicate-field-name", nodeId: "a", fieldName: "f" },
    ]);
  });

  it("reports unknown-field-reference for an unresolved mapping source", () => {
    const g = graph(
      [
        node("a", [{ name: "y", type: "STRING", nullable: true, description: null, metadata: {} }]),
        node("b", [{ name: "y", type: "STRING", nullable: true, description: null, metadata: {} }]),
      ],
      [
        edge("a", "b", {
          mappings: [{ source: "x", target: "y", transformation: null, metadata: {} }],
        }),
      ],
    );
    expect(validateFieldWiring(g)).toEqual([
      {
        kind: "unknown-field-reference",
        nodeId: "a",
        fieldName: "x",
        edge: { from: "a", to: "b", edgeIndex: 0 },
        referenceKind: "mapping_source",
      },
    ]);
  });

  it("does not flag a mapping with source: null (a derived field)", () => {
    const g = graph(
      [
        node("a"),
        node("b", [{ name: "y", type: "STRING", nullable: true, description: null, metadata: {} }]),
      ],
      [
        edge("a", "b", {
          mappings: [
            {
              source: null,
              target: "y",
              transformation: {
                kind: "constant",
                expression: null,
                constant: 1,
                inputs: [],
                metadata: {},
              },
              metadata: {},
            },
          ],
        }),
      ],
    );
    expect(validateFieldWiring(g)).toEqual([]);
  });

  it("reports unknown-field-reference for an unresolved mapping target", () => {
    const g = graph(
      [
        node("a", [{ name: "x", type: "STRING", nullable: true, description: null, metadata: {} }]),
        node("b"),
      ],
      [
        edge("a", "b", {
          mappings: [{ source: "x", target: "y", transformation: null, metadata: {} }],
        }),
      ],
    );
    expect(validateFieldWiring(g)).toEqual([
      {
        kind: "unknown-field-reference",
        nodeId: "b",
        fieldName: "y",
        edge: { from: "a", to: "b", edgeIndex: 0 },
        referenceKind: "mapping_target",
      },
    ]);
  });

  it("reports unknown-field-reference for an unresolved transformation input", () => {
    const g = graph(
      [
        node("a", [{ name: "x", type: "STRING", nullable: true, description: null, metadata: {} }]),
        node("b", [{ name: "y", type: "STRING", nullable: true, description: null, metadata: {} }]),
      ],
      [
        edge("a", "b", {
          mappings: [
            {
              source: null,
              target: "y",
              transformation: {
                kind: "expression",
                expression: "UPPER(missing_input)",
                constant: null,
                inputs: ["missing_input"],
                metadata: {},
              },
              metadata: {},
            },
          ],
        }),
      ],
    );
    expect(validateFieldWiring(g)).toEqual([
      {
        kind: "unknown-field-reference",
        nodeId: "a",
        fieldName: "missing_input",
        edge: { from: "a", to: "b", edgeIndex: 0 },
        referenceKind: "transformation_input",
      },
    ]);
  });

  it("reports join-key-field for an unresolved join_left with the right keyIndex", () => {
    const g = graph(
      [
        node("a", [
          { name: "id", type: "STRING", nullable: true, description: null, metadata: {} },
        ]),
        node("b", [
          { name: "id", type: "STRING", nullable: true, description: null, metadata: {} },
        ]),
      ],
      [
        edge("a", "b", {
          join: {
            type: "inner",
            keys: [
              { left: "id", right: "id" },
              { left: "missing_left", right: "id" },
            ],
            metadata: {},
          },
        }),
      ],
    );
    expect(validateFieldWiring(g)).toEqual([
      {
        kind: "join-key-field",
        nodeId: "a",
        fieldName: "missing_left",
        edge: { from: "a", to: "b", edgeIndex: 0 },
        referenceKind: "join_left",
        keyIndex: 1,
      },
    ]);
  });

  it("reports join-key-field for an unresolved join_right with the right keyIndex", () => {
    const g = graph(
      [
        node("a", [
          { name: "id", type: "STRING", nullable: true, description: null, metadata: {} },
        ]),
        node("b", [
          { name: "id", type: "STRING", nullable: true, description: null, metadata: {} },
        ]),
      ],
      [
        edge("a", "b", {
          join: {
            type: "inner",
            keys: [{ left: "id", right: "missing_right" }],
            metadata: {},
          },
        }),
      ],
    );
    expect(validateFieldWiring(g)).toEqual([
      {
        kind: "join-key-field",
        nodeId: "b",
        fieldName: "missing_right",
        edge: { from: "a", to: "b", edgeIndex: 0 },
        referenceKind: "join_right",
        keyIndex: 0,
      },
    ]);
  });

  it("surfaces only the structural violation when both a structural and field-wiring fault are present", () => {
    // Self-loop (structural) on node "a", plus an unresolvable mapping target on the same edge
    // (field-wiring). Field-wiring must not run at all.
    const g = graph(
      [node("a")],
      [
        edge("a", "a", {
          mappings: [
            { source: null, target: "does_not_exist", transformation: null, metadata: {} },
          ],
        }),
      ],
    );
    expect(validateFieldWiring(g)).toEqual([
      { kind: "self-loop", nodeId: "a", edge: { from: "a", to: "a", edgeIndex: 0 } },
    ]);
  });
});

describe("security invariant: no sensitive payload ever reaches a violation", () => {
  it("keeps sensitive-looking config/metadata/expression/constant values out of every violation", () => {
    const SENTINEL_CONFIG = "SENTINEL_CONFIG_VALUE";
    const SENTINEL_METADATA = "SENTINEL_METADATA_VALUE";
    const SENTINEL_EXPRESSION = "SENTINEL_EXPRESSION_VALUE";
    const SENTINEL_CONSTANT = "SENTINEL_CONSTANT_VALUE";

    const sensitiveNode: PipelineNode = {
      id: "a",
      type: "source",
      name: "a",
      config: { secret: SENTINEL_CONFIG },
      fields: [
        {
          name: "f",
          type: "STRING",
          nullable: true,
          description: null,
          metadata: { note: SENTINEL_METADATA },
        },
        {
          name: "f",
          type: "STRING",
          nullable: true,
          description: null,
          metadata: { note: SENTINEL_METADATA },
        },
      ],
    };
    const otherNode: PipelineNode = { id: "b", type: "target", name: "b", config: {}, fields: [] };

    const sensitiveEdge: PipelineEdge = {
      from: "a",
      to: "b",
      metadata: { note: SENTINEL_METADATA },
      mappings: [
        {
          source: "missing_source",
          target: "missing_target",
          transformation: {
            kind: "expression",
            expression: SENTINEL_EXPRESSION,
            constant: SENTINEL_CONSTANT,
            inputs: ["missing_input"],
            metadata: { note: SENTINEL_METADATA },
          },
          metadata: { note: SENTINEL_METADATA },
        },
      ],
      join: {
        type: "inner",
        keys: [{ left: "missing_left", right: "missing_right" }],
        metadata: { note: SENTINEL_METADATA },
      },
    };

    const g = graph([sensitiveNode, otherNode], [sensitiveEdge]);
    const violations = validateFieldWiring(g);

    expect(violations.length).toBeGreaterThan(0);
    const serialized = JSON.stringify(violations);
    expect(serialized).not.toContain(SENTINEL_CONFIG);
    expect(serialized).not.toContain(SENTINEL_METADATA);
    expect(serialized).not.toContain(SENTINEL_EXPRESSION);
    expect(serialized).not.toContain(SENTINEL_CONSTANT);
  });
});
