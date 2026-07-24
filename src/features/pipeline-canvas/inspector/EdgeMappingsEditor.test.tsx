import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Edge, Node } from "@xyflow/react";
import { EdgeMappingsEditor } from "@/features/pipeline-canvas/inspector/EdgeMappingsEditor";
import { useGraphStore } from "@/lib/graph-store";
import type { PipelineEdgeData, PipelineNodeData } from "@/lib/pipeline-graph";

/**
 * Test-only stand-in for `EdgeInspector`'s live subscription — same rationale as
 * `LiveNodeInspector` in `NodeInspector.test.tsx`: `EdgeMappingsEditor` is a pure prop-driven
 * component that relies on its caller re-rendering it with a fresh `edge` on every store write
 * (exactly what `EdgeInspector` does by reading the store-derived selected edge). Multi-step
 * interactions below (add, then edit the newly-added row) need that same live-subscription
 * behavior rather than a single static prop, or a later step would compute its patch against a
 * stale `mappings` array.
 */
function LiveEdgeMappingsEditor({ id }: { id: string }) {
  const edge = useGraphStore((state) => state.edges.find((e) => e.id === id));
  if (!edge) return null;
  return <EdgeMappingsEditor edge={edge} />;
}

// Fixture nodes/edges only — no real/sensitive data, per steering/02-engineering.md.
const SOURCE_NODE: Node<PipelineNodeData> = {
  id: "src",
  type: "pipelineNode",
  position: { x: 0, y: 0 },
  data: {
    name: "Source",
    type: "source",
    kind: "source",
    fields: [
      { name: "contact_id", type: "STRING", nullable: false, description: null, metadata: {} },
      { name: "full_name", type: "STRING", nullable: true, description: null, metadata: {} },
    ],
  },
};
const TARGET_NODE: Node<PipelineNodeData> = {
  id: "tgt",
  type: "pipelineNode",
  position: { x: 200, y: 0 },
  data: {
    name: "Target",
    type: "target",
    kind: "write",
    fields: [
      { name: "customer_id", type: "STRING", nullable: false, description: null, metadata: {} },
      { name: "display_name", type: "STRING", nullable: true, description: null, metadata: {} },
    ],
  },
};

const EMPTY_EDGE: Edge<PipelineEdgeData> = {
  id: "e1",
  source: "src",
  target: "tgt",
  data: { mappings: [] },
};

// `EdgeMappingsEditor` writes through the app-wide store singleton's `updateEdgeData` (same seam
// `NodeInspector`/`EdgeInspector` use), so each test seeds that singleton and restores it afterward.
const initialState = useGraphStore.getState();

beforeEach(() => {
  useGraphStore.setState({ nodes: [SOURCE_NODE, TARGET_NODE], edges: [EMPTY_EDGE] });
});

afterEach(() => {
  useGraphStore.setState(initialState, true);
});

function currentMappings() {
  return useGraphStore.getState().edges.find((e) => e.id === "e1")?.data?.mappings;
}

describe("EdgeMappingsEditor", () => {
  it("shows an empty state when the edge has no mappings", () => {
    render(<LiveEdgeMappingsEditor id="e1" />);
    expect(screen.getByText("No field mappings yet.")).toBeInTheDocument();
  });

  it("adding a mapping persists a blank, derived, direct mapping to the store", async () => {
    const user = userEvent.setup();
    render(<LiveEdgeMappingsEditor id="e1" />);

    await user.click(screen.getByRole("button", { name: "Add mapping" }));

    expect(currentMappings()).toEqual([
      { source: null, target: "", transformation: null, metadata: {} },
    ]);
  });

  it("picking a target and source field persists both to the store", async () => {
    const user = userEvent.setup();
    render(<LiveEdgeMappingsEditor id="e1" />);
    await user.click(screen.getByRole("button", { name: "Add mapping" }));

    await user.selectOptions(screen.getByRole("combobox", { name: "Target field" }), "customer_id");
    await user.selectOptions(screen.getByRole("combobox", { name: "Source field" }), "contact_id");

    expect(currentMappings()?.[0]).toMatchObject({ target: "customer_id", source: "contact_id" });
  });

  it("the source picker's derived option sets source back to null", async () => {
    const user = userEvent.setup();
    render(<LiveEdgeMappingsEditor id="e1" />);
    await user.click(screen.getByRole("button", { name: "Add mapping" }));
    await user.selectOptions(screen.getByRole("combobox", { name: "Source field" }), "contact_id");

    const derivedOption = screen.getByRole("option", { name: "(derived — no source)" });
    await user.selectOptions(screen.getByRole("combobox", { name: "Source field" }), derivedOption);

    expect(currentMappings()?.[0].source).toBeNull();
  });

  it("switching kind to expression and typing stores the expression text verbatim", async () => {
    const user = userEvent.setup();
    render(<LiveEdgeMappingsEditor id="e1" />);
    await user.click(screen.getByRole("button", { name: "Add mapping" }));

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Transformation kind" }),
      "expression",
    );
    await user.type(screen.getByRole("textbox", { name: "Expression" }), "UPPER(full_name)");

    expect(currentMappings()?.[0].transformation).toMatchObject({
      kind: "expression",
      expression: "UPPER(full_name)",
      constant: null,
    });
  });

  it("switching kind to constant produces an explicit null constant, distinct from a direct mapping's null transformation", async () => {
    const user = userEvent.setup();
    render(<LiveEdgeMappingsEditor id="e1" />);
    await user.click(screen.getByRole("button", { name: "Add mapping" }));

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Transformation kind" }),
      "constant",
    );

    expect(currentMappings()?.[0].transformation).toEqual({
      kind: "constant",
      expression: null,
      constant: null,
      inputs: [],
      metadata: {},
    });
  });

  it("choosing the number constant type and typing a value stores a coerced number literal", async () => {
    const user = userEvent.setup();
    render(<LiveEdgeMappingsEditor id="e1" />);
    await user.click(screen.getByRole("button", { name: "Add mapping" }));
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Transformation kind" }),
      "constant",
    );
    await user.selectOptions(screen.getByRole("combobox", { name: "Constant type" }), "number");

    const numberInput = screen.getByRole("spinbutton", { name: "Constant value" });
    await user.clear(numberInput);
    await user.type(numberInput, "42");

    expect(currentMappings()?.[0].transformation?.constant).toBe(42);
  });

  it("switching back to direct clears the transformation to null", async () => {
    const user = userEvent.setup();
    render(<LiveEdgeMappingsEditor id="e1" />);
    await user.click(screen.getByRole("button", { name: "Add mapping" }));
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Transformation kind" }),
      "expression",
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Transformation kind" }),
      "direct",
    );

    expect(currentMappings()?.[0].transformation).toBeNull();
  });

  it("removing a mapping persists the shortened list", async () => {
    const user = userEvent.setup();
    render(<LiveEdgeMappingsEditor id="e1" />);
    await user.click(screen.getByRole("button", { name: "Add mapping" }));

    await user.click(screen.getByRole("button", { name: "Remove mapping" }));

    expect(currentMappings()).toEqual([]);
  });

  it("reordering two mappings persists the swapped order", async () => {
    const user = userEvent.setup();
    render(<LiveEdgeMappingsEditor id="e1" />);
    await user.click(screen.getByRole("button", { name: "Add mapping" }));
    await user.click(screen.getByRole("button", { name: "Add mapping" }));
    await user.selectOptions(
      screen.getAllByRole("combobox", { name: "Target field" })[0],
      "customer_id",
    );
    await user.selectOptions(
      screen.getAllByRole("combobox", { name: "Target field" })[1],
      "display_name",
    );

    await user.click(screen.getAllByRole("button", { name: "Move mapping down" })[0]);

    expect(currentMappings()?.map((mapping) => mapping.target)).toEqual([
      "display_name",
      "customer_id",
    ]);
  });

  it("renders an inline error for a derived mapping with no transformation", async () => {
    const user = userEvent.setup();
    render(<LiveEdgeMappingsEditor id="e1" />);
    await user.click(screen.getByRole("button", { name: "Add mapping" }));

    expect(
      screen.getByText("A derived mapping (no source) needs an expression or constant."),
    ).toBeInTheDocument();
  });

  it("clears the inline error once a source is picked", async () => {
    const user = userEvent.setup();
    render(<LiveEdgeMappingsEditor id="e1" />);
    await user.click(screen.getByRole("button", { name: "Add mapping" }));
    await user.selectOptions(screen.getByRole("combobox", { name: "Source field" }), "contact_id");

    expect(
      screen.queryByText("A derived mapping (no source) needs an expression or constant."),
    ).not.toBeInTheDocument();
  });

  it("disables the target picker with a hint when the target node has no declared fields", async () => {
    const user = userEvent.setup();
    useGraphStore.setState({
      nodes: [SOURCE_NODE, { ...TARGET_NODE, data: { ...TARGET_NODE.data, fields: [] } }],
      edges: [EMPTY_EDGE],
    });
    render(<LiveEdgeMappingsEditor id="e1" />);
    await user.click(screen.getByRole("button", { name: "Add mapping" }));

    expect(screen.getByRole("combobox", { name: "Target field" })).toBeDisabled();
    expect(screen.getByText("Declare fields on the target node first")).toBeInTheDocument();
  });
});
