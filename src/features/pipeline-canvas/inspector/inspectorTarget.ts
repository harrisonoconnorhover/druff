import type { Edge, Node } from "@xyflow/react";
import type { PipelineEdgeData, PipelineNodeData } from "@/lib/pipeline-graph";

/**
 * The discriminated result of resolving the canvas's current selection to "what the inspector
 * should show" (DRUFF-8). Pure and store-free by design: `resolveInspectorTarget` is fed the two
 * already-derived selections (`selectSelectedNode`/`selectSelectedEdge`) rather than reading the
 * store itself, so the node-vs-edge precedence rule is unit-testable with plain fixtures.
 */
export type InspectorTarget =
  | { kind: "node"; node: Node<PipelineNodeData> }
  | { kind: "edge"; edge: Edge<PipelineEdgeData> }
  | { kind: "none" };

/**
 * Resolves the inspector's target from the store's two independent single-selection derivations.
 * With normal React Flow single-click selection a node and an edge are never simultaneously
 * selected, but the resolution is made total regardless: exactly one of the two present maps to
 * that one; anything else (both zero, or — the deliberately-chosen tie-break — both present at
 * once) resolves to `"none"` rather than silently privileging one kind of selection.
 */
export function resolveInspectorTarget(
  node: Node<PipelineNodeData> | null,
  edge: Edge<PipelineEdgeData> | null,
): InspectorTarget {
  if (node && !edge) return { kind: "node", node };
  if (edge && !node) return { kind: "edge", edge };
  return { kind: "none" };
}

/** A node id resolved to a display-friendly `{ id, name }` pair for an edge endpoint. */
export type EdgeEndpoint = { id: string; name: string };

/**
 * Resolves an edge's `source`/`target` ids to `{ id, name }` display pairs against the current
 * canvas nodes, so `EdgeInspector` (and DRUFF-9/10's field-source dropdowns, which reuse this) can
 * show a human name rather than a raw id. Falls back to the raw id as the name when it doesn't
 * resolve against any current node (e.g. a dangling edge left after a node removed out of band),
 * so this stays total rather than throwing on an unresolved endpoint.
 */
export function edgeEndpointNames(
  edge: Edge<PipelineEdgeData>,
  nodes: Node<PipelineNodeData>[],
): { from: EdgeEndpoint; to: EdgeEndpoint } {
  return {
    from: resolveEndpoint(edge.source, nodes),
    to: resolveEndpoint(edge.target, nodes),
  };
}

function resolveEndpoint(id: string, nodes: Node<PipelineNodeData>[]): EdgeEndpoint {
  const node = nodes.find((n) => n.id === id);
  return { id, name: node?.data.name ?? id };
}
