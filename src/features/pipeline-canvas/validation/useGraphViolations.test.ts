import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { Edge, Node } from "@xyflow/react";
import { useGraphViolations } from "@/features/pipeline-canvas/validation/useGraphViolations";
import { useGraphStore } from "@/lib/graph-store";
import type { PipelineEdgeData, PipelineNodeData } from "@/lib/pipeline-graph";

// Fixture nodes/edges only — no real/sensitive data, per steering/02-engineering.md.
const NODE_A: Node<PipelineNodeData> = {
  id: "a",
  type: "pipelineNode",
  position: { x: 0, y: 0 },
  data: { name: "Source A", type: "source", kind: "source", fields: [] },
};
const NODE_B: Node<PipelineNodeData> = {
  id: "b",
  type: "pipelineNode",
  position: { x: 200, y: 0 },
  data: { name: "Write B", type: "target", kind: "write", fields: [] },
};
const CLEAN_EDGE: Edge<PipelineEdgeData> = { id: "a->b#0", source: "a", target: "b" };

// `useGraphViolations` binds to the app-wide store singleton (same seam `EdgeInspector` uses), so
// each test seeds that singleton and restores the original state afterward.
const initialState = useGraphStore.getState();

beforeEach(() => {
  useGraphStore.setState({ nodes: [NODE_A, NODE_B], edges: [CLEAN_EDGE] });
});

afterEach(() => {
  useGraphStore.setState(initialState, true);
});

describe("useGraphViolations", () => {
  it("returns an empty index for a clean graph", () => {
    const { result } = renderHook(() => useGraphViolations());

    expect(result.current).toEqual({ byNodeId: {}, byEdgeId: {} });
  });

  it("recomputes when the store's nodes/edges change (AC1)", () => {
    const { result } = renderHook(() => useGraphViolations());
    expect(result.current.byNodeId).toEqual({});

    act(() => {
      // Introduce a duplicate node id — a structural violation `useGraphViolations` should now
      // surface without remounting the hook.
      useGraphStore.setState({
        nodes: [NODE_A, { ...NODE_B, id: "a" }],
        edges: [],
      });
    });

    expect(result.current.byNodeId.a).toBeDefined();
    expect(result.current.byNodeId.a).toHaveLength(1);
    expect(result.current.byNodeId.a[0]).toEqual({ kind: "duplicate-node-id", nodeId: "a" });
  });

  it("memoizes the result when nodes/edges references are unchanged across renders", () => {
    const { result, rerender } = renderHook(() => useGraphViolations());
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});
