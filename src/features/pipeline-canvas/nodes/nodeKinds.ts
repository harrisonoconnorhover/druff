import { Database, Wand2, Upload, Zap } from "lucide-react";
import type { ComponentType } from "react";
import type { PipelineNodeKind } from "@/lib/pipeline-graph";

/**
 * The four draggable node kinds the palette (DRUFF-2) and `PipelineNode` both understand. Re-
 * exported from `@/lib/pipeline-graph` — DRUFF-4 moved its canonical definition to that leaf
 * contract layer so it's shared with the canvas ⇄ graph converters without this feature module
 * owning a type the data layer also depends on.
 */
export type { PipelineNodeKind };

/**
 * Per-kind visual + copy config, centralized so `PipelineNode` (rendering) and `NodePalette`
 * (the draggable list) share one source of truth instead of duplicating icon/accent/label data.
 * Adding a future kind is a one-row change here.
 */
export type NodeKindConfig = {
  /** Palette display name, e.g. "Source". */
  label: string;
  /** Label given to a freshly-dropped node of this kind, e.g. "New source". */
  defaultLabel: string;
  icon: ComponentType<{ className?: string }>;
  /** Tailwind class for the node's left accent border. */
  accent: string;
};

export const NODE_KINDS: Record<PipelineNodeKind, NodeKindConfig> = {
  source: {
    label: "Source",
    defaultLabel: "New source",
    icon: Database,
    accent: "border-l-blue-500",
  },
  transform: {
    label: "Transform",
    defaultLabel: "New transform",
    icon: Wand2,
    accent: "border-l-amber-500",
  },
  write: {
    label: "Write",
    defaultLabel: "New write",
    icon: Upload,
    accent: "border-l-emerald-500",
  },
  trigger: {
    label: "Trigger",
    defaultLabel: "New trigger",
    icon: Zap,
    accent: "border-l-violet-500",
  },
};

/** Ordered list of kinds, derived from `NODE_KINDS` so the palette and this stay in lockstep. */
export const PIPELINE_NODE_KINDS = Object.keys(NODE_KINDS) as PipelineNodeKind[];

/**
 * Narrows an arbitrary string (e.g. a `dataTransfer` payload) to a known `PipelineNodeKind`, so a
 * drop of unrecognized/foreign drag data is safely ignored rather than creating a malformed node.
 */
export function isPipelineNodeKind(value: unknown): value is PipelineNodeKind {
  return typeof value === "string" && value in NODE_KINDS;
}
