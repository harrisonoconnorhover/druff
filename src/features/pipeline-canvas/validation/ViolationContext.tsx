"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Violation } from "@/lib/pipeline-graph";
import type { ViolationIndex } from "@/features/pipeline-canvas/validation/attributeViolations";

export type { ViolationIndex };

/** Stable empty result for an id absent from the index, so a clean node/edge never allocates a
 * new array reference per render. */
const NO_VIOLATIONS: Violation[] = [];

const EMPTY_INDEX: ViolationIndex = { byNodeId: {}, byEdgeId: {} };

const ViolationIndexContext = createContext<ViolationIndex>(EMPTY_INDEX);

/**
 * Publishes the canvas's current `ViolationIndex` (DRUFF-16's `useGraphViolations`) to every
 * custom node/edge rendered inside `<ReactFlow>`. The index lives only in context — never written
 * into `PipelineNodeData`/`PipelineEdgeData` — so those Dander-contract-mirroring shapes stay free
 * of transient, derived UI state (matching how `kind` is the only UI-derived field ever allowed on
 * node data).
 */
export function ViolationProvider({
  value,
  children,
}: {
  value: ViolationIndex;
  children: ReactNode;
}) {
  return <ViolationIndexContext.Provider value={value}>{children}</ViolationIndexContext.Provider>;
}

/** A node's own violations (`[]` when clean, e.g. outside any `ViolationProvider`). */
export function useNodeViolations(nodeId: string): Violation[] {
  const index = useContext(ViolationIndexContext);
  return index.byNodeId[nodeId] ?? NO_VIOLATIONS;
}

/** An edge's own violations (`[]` when clean, e.g. outside any `ViolationProvider`). */
export function useEdgeViolations(edgeId: string): Violation[] {
  const index = useContext(ViolationIndexContext);
  return index.byEdgeId[edgeId] ?? NO_VIOLATIONS;
}
