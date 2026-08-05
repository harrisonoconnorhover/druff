import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Node } from "@xyflow/react";
import { PIPELINE_OPERATION_CONFIG_CATEGORY } from "@/features/pipeline-operations/PipelineOperationConfigCategory";
import {
  clearOperationCatalog,
  setOperationCatalog,
} from "@/features/pipeline-operations/catalog-store";
import type { PipelineNodeData } from "@/lib/pipeline-graph";

const { Editor } = PIPELINE_OPERATION_CONFIG_CATEGORY;

function fixtureNode(config: Record<string, unknown> = {}): Node<PipelineNodeData> {
  return {
    id: "normalize-accounts",
    type: "pipelineNode",
    position: { x: 0, y: 0 },
    data: {
      name: "Normalize accounts",
      type: "transform",
      kind: "transform",
      config,
      fields: [
        { name: "name", type: "STRING", nullable: true, description: null, metadata: {} },
        { name: "status", type: "STRING", nullable: true, description: null, metadata: {} },
      ],
    },
  };
}

beforeEach(() => {
  clearOperationCatalog();
  setOperationCatalog([
    {
      kind: "trim_whitespace",
      display_name: "Trim whitespace",
      description: "Remove leading and trailing whitespace.",
      parameters: [{ name: "field", display_name: "Field", control: "field", required: true }],
    },
    {
      kind: "filter_rows",
      display_name: "Filter rows",
      description: "Keep matching rows.",
      parameters: [
        {
          name: "conditions",
          display_name: "Conditions",
          control: "conditions",
          required: true,
          operators: ["eq", "is_not_null"],
        },
      ],
    },
  ]);
});

describe("PipelineOperationConfigCategory", () => {
  it("co-matches only transform nodes", () => {
    expect(PIPELINE_OPERATION_CONFIG_CATEGORY.matches(fixtureNode())).toBe(true);
    expect(
      PIPELINE_OPERATION_CONFIG_CATEGORY.matches({
        ...fixtureNode(),
        data: { name: "Source", type: "source", kind: "source" },
      }),
    ).toBe(false);
  });

  it("adds an advertised operation under canonical config.operations", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();
    render(
      <Editor
        node={fixtureNode({ sql: "select * from source" })}
        onConfigChange={onConfigChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onConfigChange).toHaveBeenLastCalledWith({
      sql: "select * from source",
      operations: [{ kind: "trim_whitespace", params: { field: "name" }, metadata: {} }],
    });
  });

  it("renders, reorders, and removes existing ordered operations", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();
    render(
      <Editor
        node={fixtureNode({
          operations: [
            { kind: "trim_whitespace", params: { field: "name" } },
            {
              kind: "filter_rows",
              params: { conditions: [{ field: "status", op: "is_not_null" }] },
            },
          ],
        })}
        onConfigChange={onConfigChange}
      />,
    );

    await user.click(screen.getAllByRole("button", { name: "Move operation down" })[0]);
    expect(onConfigChange).toHaveBeenLastCalledWith({
      operations: [
        {
          kind: "filter_rows",
          params: { conditions: [{ field: "status", op: "is_not_null" }], logic: "all" },
          metadata: {},
        },
        { kind: "trim_whitespace", params: { field: "name" }, metadata: {} },
      ],
    });

    await user.click(screen.getAllByRole("button", { name: "Remove operation" })[0]);
    expect(onConfigChange).toHaveBeenLastCalledWith({
      operations: [{ kind: "trim_whitespace", params: { field: "name" }, metadata: {} }],
    });
  });

  it("shows invalid/newer config read-only instead of overwriting it", () => {
    const onConfigChange = vi.fn();
    render(
      <Editor
        node={fixtureNode({ operations: [{ kind: "sql_hook", params: { sql: "select 1" } }] })}
        onConfigChange={onConfigChange}
      />,
    );

    expect(screen.getByText(/cannot safely edit/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add" })).not.toBeInTheDocument();
    expect(onConfigChange).not.toHaveBeenCalled();
  });

  it("keeps a valid operation read-only when the connected runtime does not advertise it", () => {
    clearOperationCatalog();
    const onConfigChange = vi.fn();
    render(
      <Editor
        node={fixtureNode({
          operations: [{ kind: "trim_whitespace", params: { field: "name" } }],
        })}
        onConfigChange={onConfigChange}
      />,
    );

    expect(screen.getByText(/does not advertise every saved operation/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove operation" })).not.toBeInTheDocument();
    expect(onConfigChange).not.toHaveBeenCalled();
  });
});
