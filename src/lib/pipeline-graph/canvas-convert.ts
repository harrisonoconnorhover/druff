import type { Edge, Node } from "@xyflow/react";
import type {
  PipelineEdge,
  PipelineGraph,
  PipelineNode as GraphNode,
} from "@/lib/pipeline-graph/schema";
import {
  kindForType,
  type GraphLayout,
  type PipelineNodeData,
  type PipelineEdgeData,
} from "@/lib/pipeline-graph/canvas-types";
import { getConnector, getConnectorByDanderType } from "@/features/connector-library/registry";

/** Placeholder graph name used when a caller doesn't supply one (the canvas store doesn't track a
 * graph-level name yet — see this file's module doc comment). */
const DEFAULT_GRAPH_NAME = "untitled-pipeline";

/** Horizontal spacing (px) between deterministically-placed fallback nodes — matches the seed
 * graph's original node spacing (`src/lib/graph-store.ts`). */
const FALLBACK_LAYOUT_SPACING_X = 280;
const FALLBACK_LAYOUT_Y = 80;

/**
 * Canvas ⇄ graph converters — the data-layer seam between the canvas store's React Flow
 * `Node`/`Edge` (DRUFF-1) and Dander's on-disk `PipelineGraph`. Pure functions, no React, no store
 * access, no network, so DRUFF-5 can compose them and tests can exercise them end-to-end without
 * rendering.
 *
 * **Positions & app-only fields (deliberate, documented).** Dander's graph shape has no position
 * field, and the "Contract with Dander" stays clean only if layout never gets smuggled into a
 * node's `config`/`metadata`. So `canvasToGraph` drops `position`, `selected`, `dragging`, and
 * every other React-Flow-only field; the on-disk graph is layout-free. Layout is instead an
 * app-only sidecar (`GraphLayout`) that `extractLayout` pulls out and a caller (DRUFF-5) persists
 * alongside the graph. `graphToCanvas(graph, layout?)` re-applies a supplied layout; a node absent
 * from it (e.g. a bare Dander graph imported with no Druff sidecar) falls back to a deterministic
 * left-to-right placement by graph node order, so import is total and stable. This makes both
 * round trips well-defined:
 * - `canvasToGraph ∘ graphToCanvas` = identity on the **graph** (positions irrelevant).
 * - `graphToCanvas(canvasToGraph(nodes, edges), extractLayout(nodes))` = identity on the
 *   **canvas**, positions included.
 */

/**
 * Turns the canvas store's live nodes/edges into a Dander `PipelineGraph`.
 *
 * `name` defaults to a placeholder: the canvas store (DRUFF-1) doesn't track a graph-level name
 * yet (out of scope for this ticket — flagged for product/DRUFF-5), and `PipelineGraph.name` is
 * required, so a caller that does have a name (e.g. DRUFF-5's save flow) can pass one explicitly.
 */
export function canvasToGraph(
  nodes: Node<PipelineNodeData>[],
  edges: Edge<PipelineEdgeData>[],
  name: string = DEFAULT_GRAPH_NAME,
): PipelineGraph {
  return {
    name,
    nodes: nodes.map(nodeToGraphNode),
    edges: edges.map(edgeToGraphEdge),
  };
}

function nodeToGraphNode(node: Node<PipelineNodeData>): GraphNode {
  // A connector node (DRUFF-6) writes its registry-resolved `danderType` as the graph `type`,
  // rather than `data.type` directly — `data.type` seeded a plain kind-default token at creation
  // time (`createNode`) and is never the source of truth once a `connectorId` is set. Falls back
  // to `data.type` if the id doesn't resolve (e.g. a stale/unregistered connector id), so a node
  // never silently loses its type on save.
  const connector = node.data.connectorId ? getConnector(node.data.connectorId) : undefined;
  return {
    id: node.id,
    type: connector?.danderType ?? node.data.type,
    name: node.data.name,
    config: node.data.config ?? {},
    fields: node.data.fields ?? [],
  };
}

function edgeToGraphEdge(edge: Edge<PipelineEdgeData>): PipelineEdge {
  // `edge.data` is in-memory canvas state Druff itself populated, not a Dander-contract boundary,
  // so reading it against the typed `PipelineEdgeData` shape is sufficient here; Zod parsing
  // happens where text actually crosses the contract (`serialize.ts`).
  const data = edge.data;
  return {
    from: edge.source,
    to: edge.target,
    metadata: data?.metadata ?? {},
    mappings: data?.mappings ?? [],
    join: data?.join,
  };
}

/**
 * Loads a `PipelineGraph` into canvas nodes/edges. `layout` supplies a known position per node id
 * (typically DRUFF-5's persisted sidecar); any node it doesn't cover falls back to a deterministic
 * left-to-right placement (`computeDefaultLayout`) so every node gets a definite position.
 */
export function graphToCanvas(
  graph: PipelineGraph,
  layout?: GraphLayout,
): { nodes: Node<PipelineNodeData>[]; edges: Edge<PipelineEdgeData>[] } {
  const fallbackLayout = computeDefaultLayout(graph);
  return {
    nodes: graph.nodes.map((node) => graphNodeToCanvasNode(node, layout, fallbackLayout)),
    edges: graph.edges.map(graphEdgeToCanvasEdge),
  };
}

function graphNodeToCanvasNode(
  node: GraphNode,
  layout: GraphLayout | undefined,
  fallbackLayout: GraphLayout,
): Node<PipelineNodeData> {
  const position = layout?.[node.id] ?? fallbackLayout[node.id];
  // Inverse of `nodeToGraphNode`'s connector mapping: a `type` matching a registered connector's
  // `danderType` re-derives `connectorId`, so a saved Greenhouse node is recognized as one again on
  // load (round-trips through `canvasToGraph`/`graphToCanvas`, not just a fresh drag-drop).
  const connector = getConnectorByDanderType(node.type);
  return {
    id: node.id,
    type: "pipelineNode",
    position,
    data: {
      name: node.name,
      type: node.type,
      // A connector's `danderType` is never a key in `TYPE_TO_KIND` (it's Dander's on-disk
      // connector-type string, not one of the generic kind-default tokens), so `kindForType`
      // alone would always miss it and fall back to `DEFAULT_NODE_KIND` ("transform") — silently
      // corrupting a recognized connector's kind on every reload. A resolved connector's own
      // declared `kind` is authoritative; `kindForType` only runs for a node `type` that doesn't
      // match any registered connector.
      kind: connector?.kind ?? kindForType(node.type),
      ...(connector && { connectorId: connector.id }),
      config: node.config,
      fields: node.fields,
    },
  };
}

function graphEdgeToCanvasEdge(edge: PipelineEdge, index: number): Edge<PipelineEdgeData> {
  return {
    // Dander's `Edge` has no id of its own; this scheme is deterministic across repeat imports of
    // the same graph (stable for a localStorage/reload round trip) and disambiguates parallel
    // edges between the same two nodes via the array index.
    id: `${edge.from}->${edge.to}#${index}`,
    source: edge.from,
    target: edge.to,
    // Every imported edge renders via the validation-aware custom edge (DRUFF-16) so a dangling/
    // wiring fault on an imported graph is visibly flagged, not just on a freshly-drawn connection.
    type: "pipelineEdge",
    data: {
      mappings: edge.mappings,
      join: edge.join,
      metadata: edge.metadata,
    },
  };
}

/**
 * Deterministic left-to-right fallback layout, keyed by each node's position in `graph.nodes` —
 * used by `graphToCanvas` for any node absent from a supplied `layout` (or when none is supplied
 * at all, e.g. a bare Dander graph imported with no Druff sidecar), so loading a graph is total
 * and never depends on layout information that may not exist.
 */
export function computeDefaultLayout(graph: PipelineGraph): GraphLayout {
  const layout: GraphLayout = {};
  graph.nodes.forEach((node, index) => {
    layout[node.id] = { x: index * FALLBACK_LAYOUT_SPACING_X, y: FALLBACK_LAYOUT_Y };
  });
  return layout;
}

/**
 * Pulls the current position of every canvas node into a `GraphLayout` sidecar, so a caller
 * (DRUFF-5's localStorage persistence) can restore exact positions across a
 * `canvasToGraph`/`graphToCanvas` round trip without the graph itself ever carrying layout.
 */
export function extractLayout(nodes: Node<PipelineNodeData>[]): GraphLayout {
  const layout: GraphLayout = {};
  for (const node of nodes) {
    layout[node.id] = { x: node.position.x, y: node.position.y };
  }
  return layout;
}
