import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Edge, Node } from "@xyflow/react";
import { EdgeInspector } from "@/features/pipeline-canvas/inspector/EdgeInspector";
import { useGraphStore } from "@/lib/graph-store";
import type { PipelineEdgeData, PipelineNodeData } from "@/lib/pipeline-graph";

// Fixture nodes/edges only — no real/sensitive data, per steering/02-engineering.md.
const NODE_A: Node<PipelineNodeData> = {
  id: "a",
  type: "pipelineNode",
  position: { x: 0, y: 0 },
  data: {
    name: "Source A",
    type: "source",
    kind: "source",
    fields: [{ name: "id", type: "STRING", nullable: false, description: null, metadata: {} }],
  },
};
const NODE_B: Node<PipelineNodeData> = {
  id: "b",
  type: "pipelineNode",
  position: { x: 200, y: 0 },
  data: {
    name: "Write B",
    type: "target",
    kind: "write",
    fields: [{ name: "id", type: "STRING", nullable: false, description: null, metadata: {} }],
  },
};
const EDGE_AB: Edge<PipelineEdgeData> = { id: "e-a-b", source: "a", target: "b" };
// Edge with existing data — already-authored fixture-only mapping, no real field values.
const EDGE_WITH_DATA: Edge<PipelineEdgeData> = {
  id: "e-a-b-mapped",
  source: "a",
  target: "b",
  data: {
    mappings: [{ source: "id", target: "id", transformation: null, metadata: {} }],
    join: { type: "left", keys: [{ left: "id", right: "id" }], metadata: {} },
  },
};

// `EdgeInspector` binds to the app-wide store singleton to resolve endpoint names (same seam
// `NodeInspector` uses for `updateNodeData`), so each test seeds that singleton's `nodes` and
// restores the original state afterward.
const initialState = useGraphStore.getState();

beforeEach(() => {
  useGraphStore.setState({ nodes: [NODE_A, NODE_B], edges: [] });
});

afterEach(() => {
  useGraphStore.setState(initialState, true);
});

describe("EdgeInspector", () => {
  it("shows the edge's source and target node names", () => {
    render(<EdgeInspector edge={EDGE_AB} />);

    expect(screen.getByText(/Source A/)).toBeInTheDocument();
    expect(screen.getByText(/Write B/)).toBeInTheDocument();
  });

  it("distinguishes an edge selection from a node selection via a Connection header", () => {
    render(<EdgeInspector edge={EDGE_AB} />);

    expect(screen.getByText("Connection")).toBeInTheDocument();
  });

  it("shows an empty Mappings list and a join-less 'Add join' Join section when the edge carries no data", () => {
    render(<EdgeInspector edge={EDGE_AB} />);

    expect(screen.getByRole("group", { name: "Mappings" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Join" })).toBeInTheDocument();
    // Mappings (DRUFF-9) and Join (DRUFF-10) both now render real editing UI.
    expect(screen.getByText("No field mappings yet.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add join" })).toBeInTheDocument();
  });

  it("renders the edge's existing mapping and join in their respective sections", () => {
    render(<EdgeInspector edge={EDGE_WITH_DATA} />);

    expect(screen.getByRole("combobox", { name: "Target field" })).toHaveValue("id");
    expect(screen.getByRole("combobox", { name: "Join type" })).toHaveValue("left");
    expect(screen.getByRole("combobox", { name: "Left field" })).toHaveValue("id");
    expect(screen.getByRole("combobox", { name: "Right field" })).toHaveValue("id");
  });
});
