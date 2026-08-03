import { create, type StateCreator } from "zustand";
import {
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import type { PipelineNodeData, PipelineEdgeData } from "@/lib/pipeline-graph";

/**
 * Single source of truth for the canvas graph (nodes + edges). Owns exactly two things: the
 * React Flow wiring callbacks (so pan/zoom/drag/connect/redraw behave identically to the plain
 * `useNodesState`/`useEdgesState` hooks they replace) and the higher-level graph mutations the
 * palette (DRUFF-2), inspector (DRUFF-3), and save/load (DRUFF-5) tickets need. No rendering, no
 * palette/inspector-specific state — see DRUFF-1's design for the full rationale.
 */
export type GraphState = {
  /** Name carried into local draft export/source view; preserved across import and autosave. */
  graphName: string;
  nodes: Node<PipelineNodeData>[];
  edges: Edge<PipelineEdgeData>[];
  /** Applies React Flow's own node changes (select/drag/dimension/remove/…) via `applyNodeChanges`. */
  onNodesChange: (changes: NodeChange<Node<PipelineNodeData>>[]) => void;
  /** Applies React Flow's own edge changes via `applyEdgeChanges`. */
  onEdgesChange: (changes: EdgeChange<Edge<PipelineEdgeData>>[]) => void;
  /** Adds a new edge for a completed connection via `addEdge`. */
  onConnect: (connection: Connection) => void;
  /** Appends an already-constructed node. Node construction (kind + drop position) is DRUFF-2's job. */
  addNode: (node: Node<PipelineNodeData>) => void;
  /** Shallow-merges `patch` into the target node's `data`, replacing the node so React Flow re-renders. */
  updateNodeData: (id: string, patch: Partial<PipelineNodeData>) => void;
  /** Removes a node and prunes any edge touching it, so a removal never leaves a dangling edge. */
  removeNode: (id: string) => void;
  /**
   * Shallow-merges `patch` into the target edge's `data` (creating it if absent, since a bare/seed
   * edge carries none), replacing the edge so React Flow re-renders. Edge analogue of
   * `updateNodeData` — DRUFF-9 (mappings) and DRUFF-10 (join) write through this, never through
   * inspector-local state, so an edit can never drift from the canvas.
   */
  updateEdgeData: (id: string, patch: Partial<PipelineEdgeData>) => void;
  /**
   * Replaces the entire nodes/edges set in one shot. Added for DRUFF-5's hydration/import paths
   * (localStorage load, file import): both are a wholesale replacement of the canvas, not an
   * incremental edit, so this bypasses React Flow's `applyNodeChanges`/`applyEdgeChanges`
   * pipeline entirely rather than synthesizing a change list for it.
   */
  setGraph: (
    nodes: Node<PipelineNodeData>[],
    edges: Edge<PipelineEdgeData>[],
    graphName?: string,
  ) => void;
};

/**
 * Placeholder graph proving the canvas end-to-end (drag, pan/zoom, redraw an edge) — not a real
 * pipeline. A current hosted Dander project can replace it through the one-way manifest preview.
 */
export const SEED_GRAPH: {
  name: string;
  nodes: Node<PipelineNodeData>[];
  edges: Edge<PipelineEdgeData>[];
} = {
  name: "druff-placeholder",
  nodes: [
    {
      id: "1",
      type: "pipelineNode",
      position: { x: 0, y: 80 },
      data: { name: "Greenhouse", type: "source", kind: "source" },
    },
    {
      id: "2",
      type: "pipelineNode",
      position: { x: 280, y: 80 },
      data: { name: "Normalize fields", type: "transform", kind: "transform" },
    },
    {
      id: "3",
      type: "pipelineNode",
      position: { x: 560, y: 80 },
      data: { name: "BigQuery (SCD1)", type: "target", kind: "write" },
    },
  ],
  edges: [
    { id: "e1-2", source: "1", target: "2", type: "pipelineEdge" },
    { id: "e2-3", source: "2", target: "3", type: "pipelineEdge" },
  ],
};

/**
 * Builds the Zustand initializer for the graph store from a seed graph. A plain factory (rather
 * than a module-level singleton) so tests can bind a fresh, isolated vanilla store per test via
 * `createStore(createGraphState(fixture))` with no shared mutable state and no DOM/React needed.
 */
export function createGraphState(seed: {
  name?: string;
  nodes: Node<PipelineNodeData>[];
  edges: Edge<PipelineEdgeData>[];
}): StateCreator<GraphState> {
  return (set, get) => ({
    graphName: seed.name ?? "untitled-pipeline",
    nodes: seed.nodes,
    edges: seed.edges,

    onNodesChange: (changes) => {
      set({ nodes: applyNodeChanges(changes, get().nodes) });
    },

    onEdgesChange: (changes) => {
      set({ edges: applyEdgeChanges(changes, get().edges) });
    },

    onConnect: (connection) => {
      set({ edges: addEdge(connection, get().edges) });
    },

    addNode: (node) => {
      set({ nodes: [...get().nodes, node] });
    },

    updateNodeData: (id, patch) => {
      set({
        nodes: get().nodes.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, ...patch } } : node,
        ),
      });
    },

    removeNode: (id) => {
      set({
        nodes: get().nodes.filter((node) => node.id !== id),
        edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id),
      });
    },

    updateEdgeData: (id, patch) => {
      set({
        edges: get().edges.map((edge) =>
          edge.id === id ? { ...edge, data: { ...(edge.data ?? {}), ...patch } } : edge,
        ),
      });
    },

    setGraph: (nodes, edges, graphName) => {
      set((state) => ({
        nodes,
        edges,
        graphName: graphName ?? state.graphName,
      }));
    },
  });
}

/** The app-wide graph store, seeded with the placeholder graph. */
export const useGraphStore = create<GraphState>(createGraphState(SEED_GRAPH));

/**
 * Selector for the node inspector (DRUFF-3): the sole selected node, or `null` when zero or more
 * than one node is selected. Selection itself isn't tracked separately anywhere — React Flow
 * writes it into `node.selected` via `onNodesChange` → `applyNodeChanges`, so deriving from
 * `nodes` here (rather than adding a `selectedNodeId` field) keeps exactly one source of truth and
 * makes a multi-select unrepresentable as "the" selected node rather than a state to reconcile.
 */
export function selectSelectedNode(state: GraphState): Node<PipelineNodeData> | null {
  const selected = state.nodes.filter((node) => node.selected);
  return selected.length === 1 ? selected[0] : null;
}

/**
 * Selector for the edge inspector (DRUFF-8): the sole selected edge, or `null` when zero or more
 * than one edge is selected. Mirrors `selectSelectedNode` exactly — selection lives on
 * `edge.selected` (React Flow writes it via `onEdgesChange` → `applyEdgeChanges`), so this derives
 * from `edges` rather than adding a `selectedEdgeId` field, keeping exactly one source of truth.
 */
export function selectSelectedEdge(state: GraphState): Edge<PipelineEdgeData> | null {
  const selected = state.edges.filter((edge) => edge.selected);
  return selected.length === 1 ? selected[0] : null;
}
