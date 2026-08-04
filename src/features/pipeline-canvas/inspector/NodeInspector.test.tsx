import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Node } from "@xyflow/react";
import { NodeInspector } from "@/features/pipeline-canvas/inspector/NodeInspector";
import { useGraphStore } from "@/lib/graph-store";
import { canvasToGraph, type PipelineNodeData } from "@/lib/pipeline-graph";

/**
 * Test-only stand-in for `Inspector`'s live subscription: `NodeInspector` is a pure prop-driven
 * body (DRUFF-8) that relies on its caller re-rendering it with a fresh `node` prop on every store
 * change (exactly what `Inspector` does via `selectSelectedNode`). A handful of tests below drive a
 * fully-controlled child (`ConnectorConfigForm`, which — unlike `NodeConfigEditor` — keeps no local
 * row state) through multiple keystrokes, so they need that same live-subscription behavior rather
 * than a single static prop, or each keystroke would compute its patch against a stale `config`.
 */
function LiveNodeInspector({ id }: { id: string }) {
  const node = useGraphStore((state) => state.nodes.find((n) => n.id === id));
  if (!node) return null;
  return <NodeInspector node={node} />;
}

// Fixture nodes only — no real/sensitive data, per steering/02-engineering.md.
const NODE_A: Node<PipelineNodeData> = {
  id: "a",
  type: "pipelineNode",
  position: { x: 0, y: 0 },
  data: { name: "Source A", type: "source", kind: "source" },
  selected: false,
};
// A node no registered category matches, exercising the generic key/value editor. After
// DRUFF-12/13/14/17, every registered category's predicate matches *some* kind (HTTP/custom-code
// off a connectorId-less `source`, trigger off `trigger`, connector off a resolvable
// `connectorId`, writer off `write`) — the one real case still left for the generic fallback
// (AC2, `configCategories.test.ts`'s "unknown connectorId source" case) is a `source`-kind node
// that *does* carry a `connectorId`, but one that doesn't resolve in the connector registry: the
// connector category excludes it (unresolvable), and HTTP/custom-code both exclude any node
// carrying a `connectorId` at all, resolvable or not.
const GENERIC_NODE: Node<PipelineNodeData> = {
  id: "b",
  type: "pipelineNode",
  position: { x: 200, y: 0 },
  data: {
    name: "Unknown connector B",
    type: "source",
    kind: "source",
    connectorId: "not-a-real-connector",
    config: { region: "us-east1", retries: 3, nested: { keep: true } },
  },
  selected: false,
};
// Same generic-fallback shape as `GENERIC_NODE`, with no starting config.
const GENERIC_NODE_EMPTY: Node<PipelineNodeData> = {
  id: "e",
  type: "pipelineNode",
  position: { x: 800, y: 0 },
  data: {
    name: "Unknown connector E",
    type: "source",
    kind: "source",
    connectorId: "not-a-real-connector",
  },
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
    config: {
      harvest_api_key_ref: "",
      base_url: "",
      on_behalf_of: "",
      nested: { keep: true },
    },
  },
  selected: false,
};
// Fixture node with declared fields — labels/tokens only, no real field values (steering/01-security.md).
const NODE_WITH_FIELDS: Node<PipelineNodeData> = {
  id: "d",
  type: "pipelineNode",
  position: { x: 600, y: 0 },
  data: {
    name: "Contacts",
    type: "source",
    kind: "source",
    fields: [
      { name: "id", type: "INT64", nullable: false, description: null, metadata: {} },
      {
        name: "email",
        type: "STRING",
        nullable: true,
        description: "Contact email",
        metadata: { sensitivity: "pii", lineage: { system: "crm" } },
      },
    ],
  },
  selected: false,
};

// `NodeInspector` is a pure prop-driven body (DRUFF-8) — it no longer reads the selection itself,
// but `updateNodeData` still writes through the app-wide store singleton (same seam `PipelineCanvas`
// uses), so each test seeds that singleton's `nodes` and restores the original state afterward. The
// empty-state and multi-select-empties-the-panel assertions now live in `Inspector.test.tsx`, which
// owns that selection-routing behavior.
const initialState = useGraphStore.getState();

beforeEach(() => {
  useGraphStore.setState({ nodes: [NODE_A, GENERIC_NODE, GENERIC_NODE_EMPTY], edges: [] });
});

afterEach(() => {
  useGraphStore.setState(initialState, true);
});

describe("NodeInspector", () => {
  it("binds the name field to the given node", () => {
    render(<NodeInspector node={NODE_A} />);

    expect(screen.getByLabelText("Name")).toHaveValue("Source A");
  });

  it("editing the name field updates the node's name in the store live", async () => {
    const user = userEvent.setup();
    render(<NodeInspector node={NODE_A} />);

    await user.type(screen.getByLabelText("Name"), "!");

    expect(useGraphStore.getState().nodes.find((n) => n.id === "a")?.data.name).toBe("Source A!");
  });

  it("shows the given node's existing config values", () => {
    render(<NodeInspector node={GENERIC_NODE} />);

    expect(screen.getByDisplayValue("region")).toBeInTheDocument();
    expect(screen.getByDisplayValue("us-east1")).toBeInTheDocument();
  });

  it("editing a config value persists the change to the node's config in the store", async () => {
    const user = userEvent.setup();
    render(<NodeInspector node={GENERIC_NODE} />);

    const valueInput = screen.getByDisplayValue("us-east1");
    await user.clear(valueInput);
    await user.type(valueInput, "us-west1");

    expect(useGraphStore.getState().nodes.find((n) => n.id === "b")?.data.config).toEqual({
      region: "us-west1",
      retries: 3,
      nested: { keep: true },
    });

    const state = useGraphStore.getState();
    expect(canvasToGraph(state.nodes, state.edges).nodes[1]?.config).toEqual({
      region: "us-west1",
      retries: 3,
      nested: { keep: true },
    });
  });

  it("adding a config field and typing a key persists a new config entry", async () => {
    const user = userEvent.setup();
    render(<NodeInspector node={GENERIC_NODE_EMPTY} />);

    const configSection = screen.getByRole("group", { name: "Config" });
    await user.click(within(configSection).getByRole("button", { name: /add field/i }));
    await user.type(screen.getByLabelText("Config key"), "apiKey");

    expect(useGraphStore.getState().nodes.find((n) => n.id === "e")?.data.config).toEqual({
      apiKey: "",
    });
  });

  it("removing a config field clears it from the node's config in the store", async () => {
    const user = userEvent.setup();
    render(<NodeInspector node={GENERIC_NODE} />);

    await user.click(screen.getByRole("button", { name: /remove field/i }));

    expect(useGraphStore.getState().nodes.find((n) => n.id === "b")?.data.config).toEqual({
      retries: 3,
      nested: { keep: true },
    });
  });

  it("renders the descriptor-driven connector form (not the generic editor) for a connector node", () => {
    useGraphStore.setState({ nodes: [NODE_A, GREENHOUSE_NODE] });
    render(<LiveNodeInspector id="c" />);

    expect(screen.getByLabelText(/harvest api key reference/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/base url/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Config key")).not.toBeInTheDocument();
  });

  it("surfaces the required-field error for a connector node's blank required field", () => {
    useGraphStore.setState({ nodes: [NODE_A, GREENHOUSE_NODE] });
    render(<LiveNodeInspector id="c" />);

    expect(screen.getByText(/harvest api key reference is required/i)).toBeInTheDocument();
  });

  it("editing a connector field persists the change to the node's config in the store", async () => {
    const user = userEvent.setup();
    useGraphStore.setState({ nodes: [NODE_A, GREENHOUSE_NODE] });
    render(<LiveNodeInspector id="c" />);

    await user.type(screen.getByLabelText(/harvest api key reference/i), "my-greenhouse-key-ref");

    expect(useGraphStore.getState().nodes.find((n) => n.id === "c")?.data.config).toEqual({
      harvest_api_key_ref: "my-greenhouse-key-ref",
      base_url: "",
      on_behalf_of: "",
      nested: { keep: true },
    });
  });

  it("renders the HTTP/API settings category (not the generic editor) for a plain source node (DRUFF-12)", () => {
    render(<NodeInspector node={NODE_A} />);

    expect(screen.getByLabelText("Method")).toBeInTheDocument();
    expect(screen.getByLabelText(/base url/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add header/i })).toBeInTheDocument();
    expect(screen.queryByLabelText("Config key")).not.toBeInTheDocument();
  });

  it("editing the HTTP category's endpoint field persists to the node's config in the store", async () => {
    const user = userEvent.setup();
    render(<NodeInspector node={NODE_A} />);

    await user.type(screen.getByLabelText(/base url/i), "/candidates");

    expect(useGraphStore.getState().nodes.find((n) => n.id === "a")?.data.config).toEqual({
      endpoint: "/candidates",
    });
  });

  describe("Fields section", () => {
    it("lists the given node's declared fields in order", () => {
      useGraphStore.setState({ nodes: [NODE_A, NODE_WITH_FIELDS] });
      render(<NodeInspector node={NODE_WITH_FIELDS} />);

      const names = screen.getAllByLabelText("Field name") as HTMLInputElement[];
      expect(names.map((input) => input.value)).toEqual(["id", "email"]);
    });

    it("shows the metadata-tags-only helper text", () => {
      useGraphStore.setState({ nodes: [NODE_A, NODE_WITH_FIELDS] });
      render(<NodeInspector node={NODE_WITH_FIELDS} />);

      expect(
        screen.getAllByText(/tags\/labels only.*never a real field value or sample data/i)[0],
      ).toBeInTheDocument();
    });

    it("adding a field persists a new blank field to the node's fields in the store", async () => {
      const user = userEvent.setup();
      render(<NodeInspector node={NODE_A} />);

      const fieldsSection = screen.getByRole("group", { name: "Fields" });
      await user.click(within(fieldsSection).getByRole("button", { name: /add field/i }));

      expect(useGraphStore.getState().nodes.find((n) => n.id === "a")?.data.fields).toEqual([
        { name: "", type: "", nullable: true, description: null, metadata: {} },
      ]);
    });

    it("editing a field's name persists to the store", async () => {
      const user = userEvent.setup();
      useGraphStore.setState({ nodes: [NODE_A, NODE_WITH_FIELDS] });
      render(<NodeInspector node={NODE_WITH_FIELDS} />);

      const nameInputs = screen.getAllByLabelText("Field name");
      await user.type(nameInputs[0], "!");

      expect(useGraphStore.getState().nodes.find((n) => n.id === "d")?.data.fields?.[0].name).toBe(
        "id!",
      );
    });

    it("toggling nullable persists to the store", async () => {
      const user = userEvent.setup();
      useGraphStore.setState({ nodes: [NODE_A, NODE_WITH_FIELDS] });
      render(<NodeInspector node={NODE_WITH_FIELDS} />);

      const nullableToggles = screen.getAllByLabelText("Nullable");
      await user.click(nullableToggles[0]);

      expect(
        useGraphStore.getState().nodes.find((n) => n.id === "d")?.data.fields?.[0].nullable,
      ).toBe(true);
    });

    it("removing a field persists to the store", async () => {
      const user = userEvent.setup();
      useGraphStore.setState({ nodes: [NODE_A, NODE_WITH_FIELDS] });
      render(<NodeInspector node={NODE_WITH_FIELDS} />);

      const removeButtons = screen.getAllByRole("button", { name: "Remove field" });
      await user.click(removeButtons[0]);

      const fields = useGraphStore.getState().nodes.find((n) => n.id === "d")?.data.fields;
      expect(fields).toHaveLength(1);
      expect(fields?.[0].name).toBe("email");
    });

    it("moving a field down then up persists the reordered fields to the store", async () => {
      const user = userEvent.setup();
      useGraphStore.setState({ nodes: [NODE_A, NODE_WITH_FIELDS] });
      render(<NodeInspector node={NODE_WITH_FIELDS} />);

      await user.click(screen.getAllByRole("button", { name: /move field down/i })[0]);

      expect(
        useGraphStore
          .getState()
          .nodes.find((n) => n.id === "d")
          ?.data.fields?.map((f) => f.name),
      ).toEqual(["email", "id"]);

      await user.click(screen.getAllByRole("button", { name: /move field up/i })[1]);

      expect(
        useGraphStore
          .getState()
          .nodes.find((n) => n.id === "d")
          ?.data.fields?.map((f) => f.name),
      ).toEqual(["id", "email"]);
    });

    it("editing a metadata tag key/value persists to the field's metadata in the store", async () => {
      const user = userEvent.setup();
      useGraphStore.setState({ nodes: [NODE_A, NODE_WITH_FIELDS] });
      render(<NodeInspector node={NODE_WITH_FIELDS} />);

      const tagValueInputs = screen.getAllByLabelText("Metadata tag value") as HTMLInputElement[];
      await user.clear(tagValueInputs[0]);
      await user.type(tagValueInputs[0], "restricted");

      expect(
        useGraphStore.getState().nodes.find((n) => n.id === "d")?.data.fields?.[1].metadata,
      ).toEqual({ sensitivity: "restricted", lineage: { system: "crm" } });
    });

    it("adding a metadata tag and typing a key/value persists a new tag to the field's metadata", async () => {
      const user = userEvent.setup();
      // Start from a node with no declared fields yet, so "Add field" seeds exactly one field
      // with empty metadata — avoiding any ambiguity from a second, pre-existing field/tag row.
      render(<NodeInspector node={NODE_A} />);

      const fieldsSection = screen.getByRole("group", { name: "Fields" });
      await user.click(within(fieldsSection).getByRole("button", { name: /add field/i }));
      await user.click(within(fieldsSection).getByRole("button", { name: /add tag/i }));

      // Regression for the FAIL: before the fix, this blank tag row vanished on the next render,
      // so these inputs wouldn't exist at all.
      const keyInput = within(fieldsSection).getByLabelText("Metadata tag key");
      const valueInput = within(fieldsSection).getByLabelText("Metadata tag value");

      await user.type(keyInput, "owner");
      await user.type(valueInput, "data-eng");

      expect(
        useGraphStore.getState().nodes.find((n) => n.id === "a")?.data.fields?.[0].metadata,
      ).toEqual({ owner: "data-eng" });
    });
  });
});
