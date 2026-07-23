"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Database, Wand2, Upload } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

export type PipelineNodeKind = "source" | "transform" | "write";

export type PipelineNodeData = {
  label: string;
  kind: PipelineNodeKind;
};

const KIND_STYLE: Record<
  PipelineNodeKind,
  { icon: ComponentType<{ className?: string }>; accent: string }
> = {
  source: { icon: Database, accent: "border-l-blue-500" },
  transform: { icon: Wand2, accent: "border-l-amber-500" },
  write: { icon: Upload, accent: "border-l-emerald-500" },
};

/**
 * The shared visual shell for every pipeline-graph node kind (source/transform/write, …).
 * Handles are always rendered on left/right — the graph is left-to-right by convention.
 */
export function PipelineNode({ data, selected }: NodeProps & { data: PipelineNodeData }) {
  const { icon: Icon, accent } = KIND_STYLE[data.kind];

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
        <span className="text-sm font-medium">{data.label}</span>
      </div>
      <span className="text-xs text-muted-foreground capitalize">{data.kind}</span>
      <Handle type="source" position={Position.Right} className="!bg-muted-foreground" />
    </div>
  );
}
