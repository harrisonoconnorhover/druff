import type { PipelineGraph } from "@/lib/pipeline-graph/schema";
import type { EdgeRef, Violation } from "@/lib/pipeline-graph/violations";

/**
 * Pure structural + field-wiring validation over a Druff `PipelineGraph`, ported from Dander's
 * `graph_ops.py`/`errors.py` (`../dander/src/dander/pipeline/graph_ops.py`). No React, no store
 * access, no network — a pure function of a graph, exactly like the Dander reference.
 *
 * **Collect, don't raise-on-first.** Dander raises the first error found and stops, because it's
 * a hard gate before execution. Druff needs a live inline surface (DRUFF-16) that flags every
 * offending node/edge at once, so these functions **return `Violation[]`** instead of throwing.
 * This is the one deliberate divergence from Dander, and it's safe only because the phase gates
 * below reproduce Dander's fixed check order and preconditions exactly — a later phase never runs
 * until every phase it depends on is clean.
 *
 * **Structure only, by construction.** Per `steering/01-security.md` and Dander's own `errors.py`
 * rule, every violation carries graph structure only: node ids, edge endpoint ids, field names,
 * a join-key index, a reference-kind discriminant. This module reads exclusively `node.id`,
 * `node.fields[].name`, `edge.from`/`edge.to`, `mapping.source`/`mapping.target`,
 * `transformation.inputs`, and `join.keys[].left`/`.right` — never `node.config`, any
 * `metadata`, a field value, or a transformation's `expression`/`constant` payload.
 */

type Color = "white" | "grey" | "black";

/**
 * Node id -> ids it has outgoing edges to, in edge-insertion order (mirrors Dander's
 * `AdjacencyIndex`). Assumes node ids are unique and every edge endpoint is a known node id —
 * i.e. built only after Phase 1 (`checkDuplicateNodeIds`/`checkDanglingEdges`) is clean.
 */
function buildAdjacency(graph: PipelineGraph): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();
  for (const node of graph.nodes) {
    adjacency.set(node.id, []);
  }
  for (const edge of graph.edges) {
    adjacency.get(edge.from)?.push(edge.to);
  }
  return adjacency;
}

/**
 * Deterministic three-colour (white/grey/black) DFS cycle search, a direct port of Dander's
 * `_dfs_topological_order`'s cycle branch. Visits nodes and their successors in insertion order.
 * Returns the first cycle found as a node-id path with the start node repeated at the end (e.g.
 * `["a", "b", "a"]`), or `null` if the graph is acyclic. Only cycle detection is ported —
 * topological ordering itself is not needed by this ticket.
 */
function firstCycle(nodeIds: string[], adjacency: Map<string, string[]>): string[] | null {
  const color = new Map<string, Color>(nodeIds.map((id) => [id, "white"]));
  const stackPath: string[] = [];

  function visit(nodeId: string): string[] | null {
    color.set(nodeId, "grey");
    stackPath.push(nodeId);
    for (const neighbor of adjacency.get(nodeId) ?? []) {
      const neighborColor = color.get(neighbor);
      if (neighborColor === "white") {
        const found = visit(neighbor);
        if (found) {
          return found;
        }
      } else if (neighborColor === "grey") {
        const cycleStart = stackPath.indexOf(neighbor);
        return [...stackPath.slice(cycleStart), neighbor];
      }
      // black neighbours are already fully processed; nothing to do.
    }
    stackPath.pop();
    color.set(nodeId, "black");
    return null;
  }

  for (const nodeId of nodeIds) {
    if (color.get(nodeId) === "white") {
      const found = visit(nodeId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/** Phase 1 collector: a `duplicate-node-id` violation for every node id that repeats. */
function checkDuplicateNodeIds(graph: PipelineGraph): Violation[] {
  const violations: Violation[] = [];
  const seen = new Set<string>();
  for (const node of graph.nodes) {
    if (seen.has(node.id)) {
      violations.push({ kind: "duplicate-node-id", nodeId: node.id });
    } else {
      seen.add(node.id);
    }
  }
  return violations;
}

/**
 * Phase 1 collector: a `dangling-edge` violation for every edge endpoint (`from` and/or `to`)
 * that is not a known node id. An edge with both endpoints missing yields two violations, one
 * per missing side.
 */
function checkDanglingEdges(graph: PipelineGraph): Violation[] {
  const violations: Violation[] = [];
  const nodeIds = new Set(graph.nodes.map((node) => node.id));
  graph.edges.forEach((edge, edgeIndex) => {
    const edgeRef: EdgeRef = { from: edge.from, to: edge.to, edgeIndex };
    if (!nodeIds.has(edge.from)) {
      violations.push({ kind: "dangling-edge", edge: edgeRef, missingId: edge.from });
    }
    if (!nodeIds.has(edge.to)) {
      violations.push({ kind: "dangling-edge", edge: edgeRef, missingId: edge.to });
    }
  });
  return violations;
}

/** Phase 1 collector: a `self-loop` violation for every edge whose `from` equals its `to`. */
function checkSelfLoops(graph: PipelineGraph): Violation[] {
  const violations: Violation[] = [];
  graph.edges.forEach((edge, edgeIndex) => {
    if (edge.from === edge.to) {
      violations.push({
        kind: "self-loop",
        nodeId: edge.from,
        edge: { from: edge.from, to: edge.to, edgeIndex },
      });
    }
  });
  return violations;
}

/**
 * Phase 2 collector: at most one `graph-cycle` violation (the first cycle found, matching
 * Dander's single raise). Assumes Phase 1 is clean — a dangling endpoint would key-miss, a
 * duplicate id would collapse, and a self-loop would mis-report as a trivial cycle, which is
 * exactly why this only runs behind a clean Phase 1.
 */
function checkAcyclic(graph: PipelineGraph): Violation[] {
  const adjacency = buildAdjacency(graph);
  const nodeIds = graph.nodes.map((node) => node.id);
  const cycle = firstCycle(nodeIds, adjacency);
  return cycle ? [{ kind: "graph-cycle", cycle }] : [];
}

/**
 * Structural checks only (Dander's `validate`): Phase 1 (duplicate node id -> dangling edge ->
 * self-loop), then, only if Phase 1 is clean, Phase 2 (cycle detection). Returns every structural
 * violation found, in that fixed order; an empty array means the graph is structurally sound.
 */
export function validateStructure(graph: PipelineGraph): Violation[] {
  const phase1 = [
    ...checkDuplicateNodeIds(graph),
    ...checkDanglingEdges(graph),
    ...checkSelfLoops(graph),
  ];
  if (phase1.length > 0) {
    return phase1;
  }
  return checkAcyclic(graph);
}

/**
 * Node id -> declared field names, for field-wiring resolution (mirrors Dander's `_FieldIndex`).
 * Must be built **after** `checkDuplicateFieldNames` has run — a `Set` would otherwise silently
 * collapse a node's duplicate field names, masking the very condition that check catches.
 */
function buildFieldIndex(graph: PipelineGraph): {
  has: (nodeId: string, fieldName: string) => boolean;
} {
  const fieldsByNode = new Map<string, Set<string>>();
  for (const node of graph.nodes) {
    fieldsByNode.set(node.id, new Set(node.fields.map((field) => field.name)));
  }
  return {
    has: (nodeId, fieldName) => fieldsByNode.get(nodeId)?.has(fieldName) ?? false,
  };
}

/**
 * Phase 3 collector: a `duplicate-field-name` violation for every field name that repeats within
 * a single node's declared `fields`. Runs before `buildFieldIndex` for the reason documented
 * there.
 */
function checkDuplicateFieldNames(graph: PipelineGraph): Violation[] {
  const violations: Violation[] = [];
  for (const node of graph.nodes) {
    const seen = new Set<string>();
    for (const field of node.fields) {
      if (seen.has(field.name)) {
        violations.push({ kind: "duplicate-field-name", nodeId: node.id, fieldName: field.name });
      } else {
        seen.add(field.name);
      }
    }
  }
  return violations;
}

/**
 * Phase 3 collector: an `unknown-field-reference` violation for every `FieldMapping` whose
 * `source` (when not `null` — a derived field has no single source) fails to resolve on the
 * edge's `from` node, or whose `target` fails to resolve on the edge's `to` node.
 */
function checkMappingFields(
  graph: PipelineGraph,
  index: { has: (nodeId: string, fieldName: string) => boolean },
): Violation[] {
  const violations: Violation[] = [];
  graph.edges.forEach((edge, edgeIndex) => {
    const edgeRef: EdgeRef = { from: edge.from, to: edge.to, edgeIndex };
    for (const mapping of edge.mappings) {
      if (mapping.source !== null && !index.has(edge.from, mapping.source)) {
        violations.push({
          kind: "unknown-field-reference",
          nodeId: edge.from,
          fieldName: mapping.source,
          edge: edgeRef,
          referenceKind: "mapping_source",
        });
      }
      if (!index.has(edge.to, mapping.target)) {
        violations.push({
          kind: "unknown-field-reference",
          nodeId: edge.to,
          fieldName: mapping.target,
          edge: edgeRef,
          referenceKind: "mapping_target",
        });
      }
    }
  });
  return violations;
}

/**
 * Phase 3 collector: an `unknown-field-reference` violation for every `Transformation.inputs`
 * entry that fails to resolve on the edge's `from` node. A mapping with no `transformation`
 * contributes nothing.
 */
function checkTransformationFields(
  graph: PipelineGraph,
  index: { has: (nodeId: string, fieldName: string) => boolean },
): Violation[] {
  const violations: Violation[] = [];
  graph.edges.forEach((edge, edgeIndex) => {
    const edgeRef: EdgeRef = { from: edge.from, to: edge.to, edgeIndex };
    for (const mapping of edge.mappings) {
      if (mapping.transformation === null) {
        continue;
      }
      for (const inputField of mapping.transformation.inputs) {
        if (!index.has(edge.from, inputField)) {
          violations.push({
            kind: "unknown-field-reference",
            nodeId: edge.from,
            fieldName: inputField,
            edge: edgeRef,
            referenceKind: "transformation_input",
          });
        }
      }
    }
  });
  return violations;
}

/**
 * Phase 3 collector: a `join-key-field` violation for every `JoinKeyPair` whose `left` fails to
 * resolve on the edge's `from` node, or whose `right` fails to resolve on the edge's `to` node.
 * An edge with no `join` contributes nothing.
 */
function checkJoinFields(
  graph: PipelineGraph,
  index: { has: (nodeId: string, fieldName: string) => boolean },
): Violation[] {
  const violations: Violation[] = [];
  graph.edges.forEach((edge, edgeIndex) => {
    if (edge.join === undefined) {
      return;
    }
    const edgeRef: EdgeRef = { from: edge.from, to: edge.to, edgeIndex };
    edge.join.keys.forEach((keyPair, keyIndex) => {
      if (!index.has(edge.from, keyPair.left)) {
        violations.push({
          kind: "join-key-field",
          nodeId: edge.from,
          fieldName: keyPair.left,
          edge: edgeRef,
          referenceKind: "join_left",
          keyIndex,
        });
      }
      if (!index.has(edge.to, keyPair.right)) {
        violations.push({
          kind: "join-key-field",
          nodeId: edge.to,
          fieldName: keyPair.right,
          edge: edgeRef,
          referenceKind: "join_right",
          keyIndex,
        });
      }
    });
  });
  return violations;
}

/**
 * Full validation (Dander's `validate_field_wiring`): runs `validateStructure` first and, only if
 * it returns no violations, runs the field-wiring phase (duplicate field name -> mapping
 * source/target -> transformation inputs -> join key left/right, Dander's fixed order). On a
 * graph with a structural fault, returns exactly the structural violations — field-wiring is not
 * evaluated — which is the cross-tier ordering guarantee: a graph with both a structural and a
 * field-wiring fault surfaces only the structural one. This is the entry point DRUFF-16 calls.
 */
export function validateFieldWiring(graph: PipelineGraph): Violation[] {
  const structuralViolations = validateStructure(graph);
  if (structuralViolations.length > 0) {
    return structuralViolations;
  }

  const duplicateFieldNameViolations = checkDuplicateFieldNames(graph);
  const index = buildFieldIndex(graph);
  return [
    ...duplicateFieldNameViolations,
    ...checkMappingFields(graph, index),
    ...checkTransformationFields(graph, index),
    ...checkJoinFields(graph, index),
  ];
}
