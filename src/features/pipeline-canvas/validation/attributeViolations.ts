import type { Edge } from "@xyflow/react";
import type { EdgeRef, PipelineEdgeData, Violation } from "@/lib/pipeline-graph";
import type { GraphValidationResponse } from "@/lib/dander-contracts";

export type RemoteValidationIssue = {
  kind: "dander-validation";
  location: string;
  message: string;
  issueType: string;
};

export type CanvasValidationIssue = Violation | RemoteValidationIssue;

/**
 * Per-canvas-element violation buckets (DRUFF-16). Keys are canvas node ids / canvas edge ids; an
 * id absent from a map has no violations, so a clean graph produces `{ byNodeId: {}, byEdgeId: {} }`
 * and every node/edge renders with no marker (AC5).
 */
export type ViolationIndex = {
  byNodeId: Record<string, CanvasValidationIssue[]>;
  byEdgeId: Record<string, CanvasValidationIssue[]>;
};

export type AttributedRemoteValidation = {
  index: ViolationIndex;
  general: RemoteValidationIssue[];
};

/** Which canvas node ids and canvas edges a single violation references. */
type ViolationRefs = { nodeIds: string[]; edges: EdgeRef[] };

/**
 * Extracts the node ids / edge refs a single `Violation` carries. This does not decide *which*
 * surface (node vs. edge) a violation kind belongs to — that's DRUFF-15's tagging, per this
 * ticket's Design ("config-driven, not a hardcoded kind→surface switch"). It only reads the ids
 * each variant already carries, which necessarily differs by discriminant shape (a `graph-cycle`
 * carries a node path and no edge refs at all; most field-wiring kinds carry exactly one node id
 * and one edge). `dangling-edge`'s `missingId` names a node id that, by definition, doesn't exist
 * on the canvas, so it contributes no node id — only the edge is flagged.
 */
function violationRefs(violation: Violation): ViolationRefs {
  switch (violation.kind) {
    case "duplicate-node-id":
      return { nodeIds: [violation.nodeId], edges: [] };
    case "dangling-edge":
      return { nodeIds: [], edges: [violation.edge] };
    case "self-loop":
      return { nodeIds: [violation.nodeId], edges: [violation.edge] };
    case "graph-cycle":
      // `cycle` repeats the start node at the end (["a", "b", "a"]) — dedupe for the node bucket.
      return { nodeIds: [...new Set(violation.cycle)], edges: [] };
    case "duplicate-field-name":
      return { nodeIds: [violation.nodeId], edges: [] };
    case "unknown-field-reference":
    case "join-key-field":
      return { nodeIds: [violation.nodeId], edges: [violation.edge] };
  }
}

/**
 * Resolves a `graph-cycle` violation's node path to the canvas edges that actually form the
 * cycle: the edge (or edges, for a parallel connection) between each consecutive pair in `cycle`.
 * Reading consecutive pairs off the path — rather than "any edge whose endpoints are both in the
 * cycle's node set" — avoids flagging an unrelated edge that happens to connect two nodes that are
 * both part of the cycle but isn't itself one of the cycle's edges.
 */
function cycleEdges(cycle: string[], edges: Edge<PipelineEdgeData>[]): Edge<PipelineEdgeData>[] {
  const participating: Edge<PipelineEdgeData>[] = [];
  for (let i = 0; i < cycle.length - 1; i += 1) {
    const from = cycle[i];
    const to = cycle[i + 1];
    for (const edge of edges) {
      if (edge.source === from && edge.target === to) {
        participating.push(edge);
      }
    }
  }
  return participating;
}

/**
 * Resolves an `EdgeRef` to the canvas edge it names. `canvasToGraph` maps canvas `edges` to
 * `graph.edges` in order, so `edgeIndex` is normally an exact back-reference to `edges[edgeIndex]`;
 * this is verified against the ref's own `from`/`to` and falls back to an endpoint scan (matching
 * every canvas edge with the same `source`/`target` — a safe over-approximation for a parallel
 * edge) if the index is out of range or the endpoints have drifted.
 */
function resolveEdgeRef(ref: EdgeRef, edges: Edge<PipelineEdgeData>[]): Edge<PipelineEdgeData>[] {
  const byIndex = edges[ref.edgeIndex];
  if (byIndex && byIndex.source === ref.from && byIndex.target === ref.to) {
    return [byIndex];
  }
  return edges.filter((edge) => edge.source === ref.from && edge.target === ref.to);
}

/**
 * Fans each violation onto the canvas elements it references — a node with a violation appears in
 * `byNodeId`, an edge with a violation appears in `byEdgeId`, and a violation referencing both
 * (e.g. an unknown field reference) appears in both, satisfying "shown on the offending node **or**
 * edge" (AC2) without collapsing a multi-element fault (a cycle, AC4) into one arbitrary element.
 * Order within a bucket preserves validator order (structural before field-wiring), so the
 * first-listed message is the most fundamental fault.
 */
export function attributeViolations(
  violations: Violation[],
  edges: Edge<PipelineEdgeData>[],
): ViolationIndex {
  const byNodeId: Record<string, Violation[]> = {};
  const byEdgeId: Record<string, Violation[]> = {};

  const addNode = (nodeId: string, violation: Violation) => {
    (byNodeId[nodeId] ??= []).push(violation);
  };
  const addEdge = (edge: Edge<PipelineEdgeData>, violation: Violation) => {
    (byEdgeId[edge.id] ??= []).push(violation);
  };

  for (const violation of violations) {
    const refs = violationRefs(violation);
    for (const nodeId of refs.nodeIds) {
      addNode(nodeId, violation);
    }
    for (const edgeRef of refs.edges) {
      for (const edge of resolveEdgeRef(edgeRef, edges)) {
        addEdge(edge, violation);
      }
    }
    if (violation.kind === "graph-cycle") {
      for (const edge of cycleEdges(violation.cycle, edges)) {
        addEdge(edge, violation);
      }
    }
  }

  return { byNodeId, byEdgeId };
}

/** Best-effort projection of Dander's stable `nodes.<index>` / `edges.<index>` locations. */
export function attributeRemoteValidationIssues(
  issues: NonNullable<GraphValidationResponse["issues"]>,
  nodes: ReadonlyArray<{ id: string }>,
  edges: ReadonlyArray<{ id: string }>,
): AttributedRemoteValidation {
  const index: ViolationIndex = { byNodeId: {}, byEdgeId: {} };
  const general: RemoteValidationIssue[] = [];

  for (const issue of issues) {
    const remote: RemoteValidationIssue = {
      kind: "dander-validation",
      location: issue.location,
      message: issue.message,
      issueType: issue.type,
    };
    const match = /^(nodes|edges)\.(\d+)(?:\.|$)/.exec(issue.location);
    const position = match ? Number(match[2]) : Number.NaN;
    if (match?.[1] === "nodes" && nodes[position]) {
      (index.byNodeId[nodes[position].id] ??= []).push(remote);
    } else if (match?.[1] === "edges" && edges[position]) {
      (index.byEdgeId[edges[position].id] ??= []).push(remote);
    } else {
      general.push(remote);
    }
  }
  return { index, general };
}

export function mergeViolationIndexes(
  local: ViolationIndex,
  remote: ViolationIndex,
): ViolationIndex {
  const merge = (
    left: Record<string, CanvasValidationIssue[]>,
    right: Record<string, CanvasValidationIssue[]>,
  ): Record<string, CanvasValidationIssue[]> => {
    const result: Record<string, CanvasValidationIssue[]> = { ...left };
    for (const [id, issues] of Object.entries(right)) {
      result[id] = [...(result[id] ?? []), ...issues];
    }
    return result;
  };
  return {
    byNodeId: merge(local.byNodeId, remote.byNodeId),
    byEdgeId: merge(local.byEdgeId, remote.byEdgeId),
  };
}
