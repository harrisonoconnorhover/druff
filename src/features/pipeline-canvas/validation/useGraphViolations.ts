import { useMemo } from "react";
import { canvasToGraph, validateFieldWiring } from "@/lib/pipeline-graph";
import { useGraphStore } from "@/lib/graph-store";
import {
  attributeViolations,
  mergeViolationIndexes,
  type ViolationIndex,
} from "@/features/pipeline-canvas/validation/attributeViolations";

/**
 * The store→graph→validate→attribute pipeline (DRUFF-16), memoized so it recomputes only when the
 * store's `nodes`/`edges` references change. Zustand hands back new array references on every
 * mutation (`onNodesChange`/`onEdgesChange`/`updateNodeData`/`updateEdgeData`/…), so any edit to a
 * node, edge, field, mapping, or join re-runs validation on the next render (AC1) — this hook adds
 * no state of its own, it's a pure derivation of the current canvas graph.
 */
export function useGraphViolations(remote?: ViolationIndex): ViolationIndex {
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);

  return useMemo(() => {
    const graph = canvasToGraph(nodes, edges);
    const violations = validateFieldWiring(graph);
    const local = attributeViolations(violations, edges);
    return remote ? mergeViolationIndexes(local, remote) : local;
  }, [nodes, edges, remote]);
}
