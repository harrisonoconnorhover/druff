import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Node } from "@xyflow/react";
import { NodeInspector } from "@/features/pipeline-canvas/inspector/NodeInspector";
import { useGraphStore } from "@/lib/graph-store";
import type { PipelineNodeData } from "@/lib/pipeline-graph";

// Fixture nodes only — no real/sensitive data, per steering/02-engineering.md.
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
  data: { name: "Write B", type: "target", kind: "write", config: { region: "us-east1" } },
  selected: false,
};
// Fixture connector node — fixture-only config value, no real secret (steering/01-security.md).
const GREENHOUSE_NODE: Node<PipelineNodeData> = {
  id: "c",
  type: "pipelineNode",
  position: { x: 400, y: 0 },
  data: {
    name: "New source",
    type: "connector.greenhouse",
    kind: "source",
    connectorId: "greenhouse",
    config: { harvest_api_key_ref: "", base_url: "", on_behalf_of: "" },
  },
  selected: false,
};

const EMPTY_STATE_TEXT = /select a single node to view and edit its properties/i;

// `NodeInspector` binds directly to the app-wide store singleton (same seam `PipelineCanvas`
// uses), so each test seeds that singleton's `nodes` and restores the original state afterward
// rather than injecting a fresh store instance.
const initialState = useGraphStore.getState();

beforeEach(() => {
  useGraphStore.setState({ nodes: [NODE_A, NODE_B], edges: [] });
});

afterEach(() => {
  useGraphStore.setState(initialState, true);
});

describe("NodeInspector", () => {
  it("renders the empty state when no node is selected", () => {
    render(<NodeInspector />);

    expect(screen.getByText(EMPTY_STATE_TEXT)).toBeInTheDocument();
  });

  it("renders the empty state when more than one node is selected", () => {
    useGraphStore.setState({
      nodes: [
        { ...NODE_A, selected: true },
        { ...NODE_B, selected: true },
      ],
    });

    render(<NodeInspector />);

    expect(screen.getByText(EMPTY_STATE_TEXT)).toBeInTheDocument();
  });

  it("binds the name field to the selected node and hides it once deselected", () => {
    useGraphStore.setState({ nodes: [{ ...NODE_A, selected: true }, NODE_B] });
    const { rerender } = render(<NodeInspector />);

    expect(screen.getByLabelText("Name")).toHaveValue("Source A");

    useGraphStore.setState({ nodes: [{ ...NODE_A, selected: false }, NODE_B] });
    rerender(<NodeInspector />);

    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    expect(screen.getByText(EMPTY_STATE_TEXT)).toBeInTheDocument();
  });

  it("editing the name field updates the node's name in the store live", async () => {
    const user = userEvent.setup();
    useGraphStore.setState({ nodes: [{ ...NODE_A, selected: true }, NODE_B] });
    render(<NodeInspector />);

    await user.type(screen.getByLabelText("Name"), "!");

    expect(useGraphStore.getState().nodes.find((n) => n.id === "a")?.data.name).toBe("Source A!");
  });

  it("shows the selected node's existing config values", () => {
    useGraphStore.setState({ nodes: [NODE_A, { ...NODE_B, selected: true }] });

    render(<NodeInspector />);

    expect(screen.getByDisplayValue("region")).toBeInTheDocument();
    expect(screen.getByDisplayValue("us-east1")).toBeInTheDocument();
  });

  it("editing a config value persists the change to the node's config in the store", async () => {
    const user = userEvent.setup();
    useGraphStore.setState({ nodes: [NODE_A, { ...NODE_B, selected: true }] });
    render(<NodeInspector />);

    const valueInput = screen.getByDisplayValue("us-east1");
    await user.clear(valueInput);
    await user.type(valueInput, "us-west1");

    expect(useGraphStore.getState().nodes.find((n) => n.id === "b")?.data.config).toEqual({
      region: "us-west1",
    });
  });

  it("adding a config field and typing a key persists a new config entry", async () => {
    const user = userEvent.setup();
    useGraphStore.setState({ nodes: [{ ...NODE_A, selected: true }, NODE_B] });
    render(<NodeInspector />);

    await user.click(screen.getByRole("button", { name: /add field/i }));
    await user.type(screen.getByLabelText("Config key"), "apiKey");

    expect(useGraphStore.getState().nodes.find((n) => n.id === "a")?.data.config).toEqual({
      apiKey: "",
    });
  });

  it("removing a config field clears it from the node's config in the store", async () => {
    const user = userEvent.setup();
    useGraphStore.setState({ nodes: [NODE_A, { ...NODE_B, selected: true }] });
    render(<NodeInspector />);

    await user.click(screen.getByRole("button", { name: /remove field/i }));

    expect(useGraphStore.getState().nodes.find((n) => n.id === "b")?.data.config).toEqual({});
  });

  it("renders the descriptor-driven connector form (not the generic editor) for a connector node", () => {
    useGraphStore.setState({ nodes: [NODE_A, { ...GREENHOUSE_NODE, selected: true }] });

    render(<NodeInspector />);

    expect(screen.getByLabelText(/harvest api key reference/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/base url/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Config key")).not.toBeInTheDocument();
  });

  it("surfaces the required-field error for a connector node's blank required field", () => {
    useGraphStore.setState({ nodes: [NODE_A, { ...GREENHOUSE_NODE, selected: true }] });

    render(<NodeInspector />);

    expect(screen.getByText(/harvest api key reference is required/i)).toBeInTheDocument();
  });

  it("editing a connector field persists the change to the node's config in the store", async () => {
    const user = userEvent.setup();
    useGraphStore.setState({ nodes: [NODE_A, { ...GREENHOUSE_NODE, selected: true }] });
    render(<NodeInspector />);

    await user.type(screen.getByLabelText(/harvest api key reference/i), "my-greenhouse-key-ref");

    expect(useGraphStore.getState().nodes.find((n) => n.id === "c")?.data.config).toEqual({
      harvest_api_key_ref: "my-greenhouse-key-ref",
      base_url: "",
      on_behalf_of: "",
    });
  });
});
