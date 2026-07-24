import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PipelineNode } from "@/features/pipeline-canvas/nodes/PipelineNode";
import {
  ViolationProvider,
  type ViolationIndex,
} from "@/features/pipeline-canvas/validation/ViolationContext";
import type { PipelineNodeData } from "@/lib/pipeline-graph";

// Fixture-only ids/names, no real/sensitive data (steering/02-engineering.md).
const NODE_DATA: PipelineNodeData = {
  name: "Extract CRM Contacts",
  type: "source",
  kind: "source",
};

function renderNode(id: string, data: PipelineNodeData, violationIndex: ViolationIndex) {
  return render(
    <TooltipProvider>
      <ReactFlowProvider>
        <ViolationProvider value={violationIndex}>
          <PipelineNode
            id={id}
            data={data}
            selected={false}
            type="pipelineNode"
            dragging={false}
            zIndex={0}
            selectable
            deletable
            draggable
            isConnectable
            positionAbsoluteX={0}
            positionAbsoluteY={0}
          />
        </ViolationProvider>
      </ReactFlowProvider>
    </TooltipProvider>,
  );
}

describe("PipelineNode", () => {
  it("renders with no violation marker when its id has no violations", () => {
    renderNode("crm_source", NODE_DATA, { byNodeId: {}, byEdgeId: {} });

    expect(screen.getByText("Extract CRM Contacts")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /validation/ })).not.toBeInTheDocument();
  });

  it("flags the node and shows a count badge when its id has violations", () => {
    renderNode("crm_source", NODE_DATA, {
      byNodeId: {
        crm_source: [
          { kind: "duplicate-field-name", nodeId: "crm_source", fieldName: "email" },
          {
            kind: "unknown-field-reference",
            nodeId: "crm_source",
            fieldName: "id",
            edge: { from: "crm_source", to: "warehouse", edgeIndex: 0 },
            referenceKind: "mapping_source",
          },
        ],
      },
      byEdgeId: {},
    });

    expect(screen.getByRole("button", { name: "2 validation issues" })).toBeInTheDocument();
  });

  it("does not flag a node whose id is absent from the index, even when other nodes are flagged", () => {
    renderNode("crm_source", NODE_DATA, {
      byNodeId: { some_other_node: [{ kind: "duplicate-node-id", nodeId: "some_other_node" }] },
      byEdgeId: {},
    });

    expect(screen.queryByRole("button", { name: /validation/ })).not.toBeInTheDocument();
  });
});
