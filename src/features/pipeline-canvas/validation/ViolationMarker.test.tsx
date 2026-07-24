import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ViolationMarker } from "@/features/pipeline-canvas/validation/ViolationMarker";
import type { Violation } from "@/lib/pipeline-graph";

// Fixture-only ids/field names, no real/sensitive data (steering/02-engineering.md).
const VIOLATION_A: Violation = { kind: "duplicate-node-id", nodeId: "crm_source" };
const VIOLATION_B: Violation = {
  kind: "unknown-field-reference",
  nodeId: "crm_source",
  fieldName: "email",
  edge: { from: "crm_source", to: "warehouse", edgeIndex: 0 },
  referenceKind: "mapping_source",
};

describe("ViolationMarker", () => {
  it("renders nothing for a clean (empty) violation list", () => {
    const { container } = render(
      <TooltipProvider>
        <ViolationMarker violations={[]} />
      </TooltipProvider>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the violation count", () => {
    render(
      <TooltipProvider>
        <ViolationMarker violations={[VIOLATION_A, VIOLATION_B]} />
      </TooltipProvider>,
    );

    expect(screen.getByRole("button", { name: "2 validation issues" })).toBeInTheDocument();
  });

  it("lists every violation's message on hover, for multiple violations", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <ViolationMarker violations={[VIOLATION_A, VIOLATION_B]} />
      </TooltipProvider>,
    );

    await user.hover(screen.getByRole("button", { name: "2 validation issues" }));

    expect(
      await screen.findByText('Node id "crm_source" is used by more than one node.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Field "email" is not declared on node "crm_source" (mapping source).'),
    ).toBeInTheDocument();
  });
});
