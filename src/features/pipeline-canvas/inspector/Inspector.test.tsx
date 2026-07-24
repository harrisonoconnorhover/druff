import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Edge, Node } from "@xyflow/react";
import { Inspector } from "@/features/pipeline-canvas/inspector/Inspector";
import { useGraphStore } from "@/lib/graph-store";
import type { PipelineEdgeData, PipelineNodeData } from "@/lib/pipeline-graph";

// Fixture nodes/edges only — no real/sensitive data, per steering/02-engineering.md.
const NODE_A: Node<PipelineNodeData> = {
  id: "a",
  type: "pipelineNode",
  position: { x: 0, y: 0 },
  data: { name: "Source A", type: "source", kind: "source" },
  selected: false,
};
const NODE_B: Node<PipelineNodeData> = {
  id: "b",
  type: "pipelineNode",
  position: { x: 200, y: 0 },
  data: { name: "Write B", type: "target", kind: "write" },
  selected: false,
};
const EDGE_AB: Edge<PipelineEdgeData> = {
  id: "e-a-b",
  source: "a",
  target: "b",
  selected: false,
};

const EMPTY_STATE_TEXT = /select a node or edge to inspect it/i;

// `Inspector` binds directly to the app-wide store singleton (same seam `PipelineCanvas` uses),
// so each test seeds that singleton's `nodes`/`edges` and restores the original state afterward.
const initialState = useGraphStore.getState();

beforeEach(() => {
  useGraphStore.setState({ nodes: [NODE_A, NODE_B], edges: [EDGE_AB] });
});

afterEach(() => {
  useGraphStore.setState(initialState, true);
});

describe("Inspector", () => {
  it("renders the empty state when nothing is selected", () => {
    render(<Inspector />);

    expect(screen.getByText(EMPTY_STATE_TEXT)).toBeInTheDocument();
  });

  it("renders the node body when exactly one node is selected", () => {
    useGraphStore.setState({ nodes: [{ ...NODE_A, selected: true }, NODE_B] });

    render(<Inspector />);

    expect(screen.getByLabelText("Name")).toHaveValue("Source A");
    expect(screen.queryByText("Connection")).not.toBeInTheDocument();
  });

  it("renders the edge body when exactly one edge is selected", () => {
    useGraphStore.setState({ edges: [{ ...EDGE_AB, selected: true }] });

    render(<Inspector />);

    expect(screen.getByText("Connection")).toBeInTheDocument();
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it("renders the empty state when more than one node is selected", () => {
    useGraphStore.setState({
      nodes: [
        { ...NODE_A, selected: true },
        { ...NODE_B, selected: true },
      ],
    });

    render(<Inspector />);

    expect(screen.getByText(EMPTY_STATE_TEXT)).toBeInTheDocument();
  });

  it("renders the empty state when more than one edge is selected", () => {
    useGraphStore.setState({
      edges: [
        { ...EDGE_AB, selected: true },
        { id: "e-b-a", source: "b", target: "a", selected: true },
      ],
    });

    render(<Inspector />);

    expect(screen.getByText(EMPTY_STATE_TEXT)).toBeInTheDocument();
  });

  it("empties/clears once a selected node is deselected, with no layout reflow (same aside stays mounted)", () => {
    useGraphStore.setState({ nodes: [{ ...NODE_A, selected: true }, NODE_B] });
    const { rerender } = render(<Inspector />);

    expect(screen.getByLabelText("Name")).toHaveValue("Source A");

    useGraphStore.setState({ nodes: [{ ...NODE_A, selected: false }, NODE_B] });
    rerender(<Inspector />);

    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    expect(screen.getByText(EMPTY_STATE_TEXT)).toBeInTheDocument();
  });
});
