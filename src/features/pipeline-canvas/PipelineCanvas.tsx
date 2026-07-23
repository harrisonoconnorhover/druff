"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { PipelineNode, type PipelineNodeData } from "@/features/pipeline-canvas/nodes/PipelineNode";

const nodeTypes = { pipelineNode: PipelineNode };

// Placeholder graph proving the canvas end-to-end (drag, pan/zoom, redraw an edge) — not a real
// pipeline. Real graphs will come from Dander's pipeline-graph contract once that's wired up.
const initialNodes: Node<PipelineNodeData>[] = [
  {
    id: "1",
    type: "pipelineNode",
    position: { x: 0, y: 80 },
    data: { label: "Greenhouse", kind: "source" },
  },
  {
    id: "2",
    type: "pipelineNode",
    position: { x: 280, y: 80 },
    data: { label: "Normalize fields", kind: "transform" },
  },
  {
    id: "3",
    type: "pipelineNode",
    position: { x: 560, y: 80 },
    data: { label: "BigQuery (SCD1)", kind: "write" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
];

function Canvas() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((current) => addEdge(connection, current)),
    [setEdges],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
    >
      <Background />
      <Controls />
      <MiniMap pannable zoomable />
    </ReactFlow>
  );
}

/** The pipeline-graph canvas: drag, pan/zoom, and connect nodes. Wrap once per canvas instance. */
export function PipelineCanvas() {
  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
    </div>
  );
}
