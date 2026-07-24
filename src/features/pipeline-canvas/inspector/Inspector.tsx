"use client";

import { EdgeInspector } from "@/features/pipeline-canvas/inspector/EdgeInspector";
import { NodeInspector } from "@/features/pipeline-canvas/inspector/NodeInspector";
import { resolveInspectorTarget } from "@/features/pipeline-canvas/inspector/inspectorTarget";
import { selectSelectedEdge, selectSelectedNode, useGraphStore } from "@/lib/graph-store";

/**
 * The always-mounted inspector shell (DRUFF-8): the one fixed-width `<aside>` sibling of the
 * canvas, replacing `NodeInspector`'s former self-owned `<aside>` (DRUFF-3). Reads both single-
 * selection derivations (`selectSelectedNode`/`selectSelectedEdge`) and resolves them via the pure
 * `resolveInspectorTarget`, then swaps in exactly one body: `NodeInspector`, `EdgeInspector`, or a
 * shared empty state.
 *
 * The `<aside>` itself never unmounts — only its inner content swaps — so switching between a node
 * selection, an edge selection, and no selection never reflows the canvas layout (DRUFF-3's
 * no-reflow invariant, now shared by both node and edge selection).
 */
export function Inspector() {
  const node = useGraphStore(selectSelectedNode);
  const edge = useGraphStore(selectSelectedEdge);
  const target = resolveInspectorTarget(node, edge);

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l bg-muted/30">
      {target.kind === "node" && <NodeInspector node={target.node} />}
      {target.kind === "edge" && <EdgeInspector edge={target.edge} />}
      {target.kind === "none" && (
        <p className="p-4 text-sm text-muted-foreground">Select a node or edge to inspect it.</p>
      )}
    </aside>
  );
}
