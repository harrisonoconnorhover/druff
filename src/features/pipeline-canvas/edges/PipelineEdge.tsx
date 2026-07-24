"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";
import { useEdgeViolations } from "@/features/pipeline-canvas/validation/ViolationContext";
import { ViolationMarker } from "@/features/pipeline-canvas/validation/ViolationMarker";
import type { PipelineEdgeData } from "@/lib/pipeline-graph";

/**
 * The canvas's only edge type (DRUFF-16). A default React Flow edge can't host a marker, so this
 * reproduces the default bezier visuals via `BaseEdge`/`getBezierPath` and adds a
 * validation-aware accent: a destructive-colored stroke plus a `ViolationMarker` at the path
 * midpoint whenever `useEdgeViolations` reports this edge id is flagged (AC2). Every canvas edge
 * is routed to this type — via `<ReactFlow defaultEdgeOptions>`, `graphEdgeToCanvasEdge`
 * (DRUFF-4), and `SEED_GRAPH` (DRUFF-1) — so both freshly-connected and imported edges surface
 * violations identically.
 */
export function PipelineEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
}: EdgeProps<Edge<PipelineEdgeData>>) {
  const violations = useEdgeViolations(id);
  const flagged = violations.length > 0;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={flagged ? { ...style, stroke: "var(--destructive)", strokeWidth: 2 } : style}
      />
      {flagged && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
          >
            <ViolationMarker violations={violations} />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
