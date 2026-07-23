"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { NODE_KINDS } from "@/features/pipeline-canvas/nodes/nodeKinds";
import { getConnector } from "@/features/connector-library/registry";
import type { PipelineNodeData, PipelineNodeKind } from "@/lib/pipeline-graph";

// Re-exported for existing consumers; canonical definitions live in `@/lib/pipeline-graph`
// (DRUFF-4) so the converter and the canvas feature share one source of truth.
export type { PipelineNodeData, PipelineNodeKind };

/**
 * The shared visual shell for every pipeline-graph node kind (source/transform/write/trigger, …).
 * Handles are always rendered on left/right — the graph is left-to-right by convention.
 *
 * A node whose `data.connectorId` (DRUFF-6) resolves to a registered pre-made connector swaps in
 * that connector's icon and shows its name (e.g. "Greenhouse") in place of the generic kind label,
 * so it's visually identifiable as that connector rather than a plain source node. The accent color
 * still comes from `kind` — a connector is always a specific kind, never a kind of its own.
 */
export function PipelineNode({ data, selected }: NodeProps & { data: PipelineNodeData }) {
  const { icon: KindIcon, accent } = NODE_KINDS[data.kind];
  const connector = data.connectorId ? getConnector(data.connectorId) : undefined;
  const Icon = connector?.icon ?? KindIcon;

  return (
    <div
      className={cn(
        "min-w-[180px] rounded-md border border-l-4 bg-card px-3 py-2 shadow-sm",
        accent,
        selected && "ring-2 ring-ring",
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-muted-foreground" />
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">{data.name}</span>
      </div>
      <span className="text-xs text-muted-foreground capitalize">
        {connector?.name ?? data.kind}
      </span>
      <Handle type="source" position={Position.Right} className="!bg-muted-foreground" />
    </div>
  );
}
