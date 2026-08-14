"use client";

import { useCallback, type DragEvent } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { PipelineNode } from "@/features/pipeline-canvas/nodes/PipelineNode";
import { PipelineEdge } from "@/features/pipeline-canvas/edges/PipelineEdge";
import { createNode } from "@/features/pipeline-canvas/nodes/createNode";
import {
  NodePalette,
  DND_MIME,
  parsePaletteDragPayload,
} from "@/features/pipeline-canvas/NodePalette";
import { useGraphStore } from "@/lib/graph-store";
import { useGraphViolations } from "@/features/pipeline-canvas/validation/useGraphViolations";
import { ViolationProvider } from "@/features/pipeline-canvas/validation/ViolationContext";
import type { ViolationIndex } from "@/features/pipeline-canvas/validation/attributeViolations";

const nodeTypes = { pipelineNode: PipelineNode };
const edgeTypes = { pipelineEdge: PipelineEdge };
// Every edge on the canvas renders as `PipelineEdge` (DRUFF-16) — a default React Flow edge
// can't host a violation marker — so a freshly-drawn connection (which carries no `type` of its
// own) is defaulted to it here. Imported/seeded edges get the same `type` explicitly, in
// `graphEdgeToCanvasEdge` and `SEED_GRAPH`.
const defaultEdgeOptions = { type: "pipelineEdge" };

function Canvas({ remoteViolations }: { remoteViolations?: ViolationIndex }) {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const onNodesChange = useGraphStore((s) => s.onNodesChange);
  const onEdgesChange = useGraphStore((s) => s.onEdgesChange);
  const onConnect = useGraphStore((s) => s.onConnect);
  const addNode = useGraphStore((s) => s.addNode);
  const { screenToFlowPosition } = useReactFlow();
  const violations = useGraphViolations(remoteViolations);

  // Required for `onDrop` to fire at all — the HTML5 DnD spec drops the event unless the drag
  // target's `dragover` calls `preventDefault()`.
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const payload = parsePaletteDragPayload(event.dataTransfer.getData(DND_MIME));
      if (!payload) return;

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addNode(createNode(payload.kind, position, crypto.randomUUID(), payload.connectorId));
    },
    [addNode, screenToFlowPosition],
  );

  return (
    <ViolationProvider value={violations}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </ViolationProvider>
  );
}

/**
 * The pipeline-graph canvas: a node palette sidebar plus the React Flow surface (drag, pan/zoom,
 * connect, and drag-to-add nodes from the palette). Wrap once per canvas instance.
 */
export function PipelineCanvas({ remoteViolations }: { remoteViolations?: ViolationIndex }) {
  return (
    <div className="flex h-full w-full">
      <NodePalette />
      {/* `ReactFlowProvider` is context-only (no DOM node) — this wrapper gives the ReactFlow
          canvas, which sizes itself to 100%/100% of its parent, a definite flex-basis to fill. */}
      <div className="min-w-0 flex-1">
        <ReactFlowProvider>
          <Canvas remoteViolations={remoteViolations} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
