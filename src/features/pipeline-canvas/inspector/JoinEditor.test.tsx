import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JoinEditor } from "@/features/pipeline-canvas/inspector/JoinEditor";
import type { JoinSpec, NodeField } from "@/lib/pipeline-graph/schema";

// Fixture-only fields/joins — synthetic names, no real/sensitive data (steering/02-engineering.md).
const LEFT_FIELDS: NodeField[] = [
  { name: "account_id", type: "STRING", nullable: false, description: null, metadata: {} },
  { name: "region", type: "STRING", nullable: true, description: null, metadata: {} },
];
const RIGHT_FIELDS: NodeField[] = [
  { name: "account_id", type: "STRING", nullable: false, description: null, metadata: {} },
  { name: "region_code", type: "STRING", nullable: true, description: null, metadata: {} },
];

/** Controlled test harness — `JoinEditor` takes no store/state of its own, so the test drives it
 * the same way `EdgeInspector` would: re-rendering with whatever `onChange` last produced. */
function Harness({ initial }: { initial: JoinSpec | undefined }) {
  const [join, setJoin] = useState<JoinSpec | undefined>(initial);
  return (
    <JoinEditor
      join={join}
      leftFields={LEFT_FIELDS}
      rightFields={RIGHT_FIELDS}
      onChange={setJoin}
    />
  );
}

describe("JoinEditor", () => {
  it("shows an 'Add join' button when the edge is join-less", () => {
    render(<Harness initial={undefined} />);
    expect(screen.getByRole("button", { name: "Add join" })).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Join type" })).not.toBeInTheDocument();
  });

  it("clicking 'Add join' seeds a valid-by-construction inner join with one blank pair", async () => {
    const user = userEvent.setup();
    render(<Harness initial={undefined} />);

    await user.click(screen.getByRole("button", { name: "Add join" }));

    expect(screen.getByRole("combobox", { name: "Join type" })).toHaveValue("inner");
    expect(screen.getAllByRole("combobox", { name: "Left field" })).toHaveLength(1);
    expect(screen.getAllByRole("combobox", { name: "Right field" })).toHaveLength(1);
  });

  it("the remove control on the sole remaining pair is disabled with an actionable message", async () => {
    const user = userEvent.setup();
    render(<Harness initial={undefined} />);
    await user.click(screen.getByRole("button", { name: "Add join" }));

    expect(screen.getByRole("button", { name: "Remove key pair" })).toBeDisabled();
    expect(screen.getByText(/needs at least one key pair.*use "Remove join"/i)).toBeInTheDocument();
  });

  it("adding a second pair enables removal of either pair", async () => {
    const user = userEvent.setup();
    render(<Harness initial={undefined} />);
    await user.click(screen.getByRole("button", { name: "Add join" }));

    await user.click(screen.getByRole("button", { name: "Add key pair" }));

    const removeButtons = screen.getAllByRole("button", { name: "Remove key pair" });
    expect(removeButtons).toHaveLength(2);
    expect(removeButtons[0]).toBeEnabled();
    expect(removeButtons[1]).toBeEnabled();
  });

  it("picking left/right fields on a pair updates the spec", async () => {
    const user = userEvent.setup();
    render(<Harness initial={undefined} />);
    await user.click(screen.getByRole("button", { name: "Add join" }));

    await user.selectOptions(screen.getByRole("combobox", { name: "Left field" }), "account_id");
    await user.selectOptions(screen.getByRole("combobox", { name: "Right field" }), "region_code");

    // Selections persisted back through onChange -> re-render.
    expect(screen.getByRole("combobox", { name: "Left field" })).toHaveValue("account_id");
    expect(screen.getByRole("combobox", { name: "Right field" })).toHaveValue("region_code");
  });

  it("changing the join type persists the new type", async () => {
    const user = userEvent.setup();
    render(<Harness initial={undefined} />);
    await user.click(screen.getByRole("button", { name: "Add join" }));

    await user.selectOptions(screen.getByRole("combobox", { name: "Join type" }), "full");

    expect(screen.getByRole("combobox", { name: "Join type" })).toHaveValue("full");
  });

  it("reordering pairs with the down control swaps them", async () => {
    const user = userEvent.setup();
    render(<Harness initial={undefined} />);
    await user.click(screen.getByRole("button", { name: "Add join" }));
    await user.click(screen.getByRole("button", { name: "Add key pair" }));
    await user.selectOptions(
      screen.getAllByRole("combobox", { name: "Left field" })[0],
      "account_id",
    );
    await user.selectOptions(screen.getAllByRole("combobox", { name: "Left field" })[1], "region");

    await user.click(screen.getAllByRole("button", { name: "Move key pair down" })[0]);

    const leftSelects = screen.getAllByRole("combobox", { name: "Left field" });
    expect(leftSelects[0]).toHaveValue("region");
    expect(leftSelects[1]).toHaveValue("account_id");
  });

  it("removing down to one pair re-disables the remaining pair's remove control", async () => {
    const user = userEvent.setup();
    render(<Harness initial={undefined} />);
    await user.click(screen.getByRole("button", { name: "Add join" }));
    await user.click(screen.getByRole("button", { name: "Add key pair" }));

    await user.click(screen.getAllByRole("button", { name: "Remove key pair" })[0]);

    expect(screen.getByRole("button", { name: "Remove key pair" })).toBeDisabled();
  });

  it("'Remove join' removes the join entirely (join-less, not null)", async () => {
    const user = userEvent.setup();
    render(<Harness initial={undefined} />);
    await user.click(screen.getByRole("button", { name: "Add join" }));

    await user.click(screen.getByRole("button", { name: "Remove join" }));

    expect(screen.getByRole("button", { name: "Add join" })).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Join type" })).not.toBeInTheDocument();
  });

  it("shows a blank-field advisory per pair without blocking rendering", async () => {
    const user = userEvent.setup();
    render(<Harness initial={undefined} />);
    await user.click(screen.getByRole("button", { name: "Add join" }));

    expect(screen.getAllByText("Choose a field.")).toHaveLength(2);
  });

  it("clears the left advisory once a left field is picked", async () => {
    const user = userEvent.setup();
    render(<Harness initial={undefined} />);
    await user.click(screen.getByRole("button", { name: "Add join" }));

    await user.selectOptions(screen.getByRole("combobox", { name: "Left field" }), "account_id");

    expect(screen.getAllByText("Choose a field.")).toHaveLength(1);
  });

  it("preserves an out-of-vocabulary stored value as a distinct, selected option", () => {
    const importedJoin: JoinSpec = {
      type: "inner",
      keys: [{ left: "legacy_field", right: "account_id" }],
      metadata: {},
    };
    render(
      <JoinEditor
        join={importedJoin}
        leftFields={LEFT_FIELDS}
        rightFields={RIGHT_FIELDS}
        onChange={() => {}}
      />,
    );

    const leftSelect = screen.getByRole("combobox", { name: "Left field" });
    expect(leftSelect).toHaveValue("legacy_field");
    expect(
      screen.getByRole("option", { name: "legacy_field (not a declared field)" }),
    ).toBeInTheDocument();
  });

  it("shows a hint pointing at declaring fields when a side has none declared, but still renders a stored value", () => {
    const importedJoin: JoinSpec = {
      type: "inner",
      keys: [{ left: "legacy_field", right: "account_id" }],
      metadata: {},
    };
    render(
      <JoinEditor
        join={importedJoin}
        leftFields={[]}
        rightFields={RIGHT_FIELDS}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText("Declare fields on the source node first.")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Left field" })).toHaveValue("legacy_field");
  });
});
