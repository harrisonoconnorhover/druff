import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Node } from "@xyflow/react";
import { CUSTOM_CODE_CONFIG_CATEGORY } from "@/features/pipeline-canvas/inspector/categories/CustomCodeConfigCategory";
import type { PipelineNodeData } from "@/lib/pipeline-graph";
import type { MonacoCodeEditorProps } from "@/features/pipeline-canvas/inspector/categories/MonacoCodeEditor";

// Mocked for the same reason as CustomCodeConfigEditor.test.tsx: jsdom can't run real Monaco.
vi.mock("@/features/pipeline-canvas/inspector/categories/MonacoCodeEditor", () => ({
  MonacoCodeEditor: ({ language, value, onChange }: MonacoCodeEditorProps) => (
    <textarea
      aria-label={`${language} code`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

const { Editor: CustomCodeCategoryEditor } = CUSTOM_CODE_CONFIG_CATEGORY;

// Fixture node + fixture-only values — no real/sensitive data, per steering/02-engineering.md.
function fixtureNode(data: Partial<PipelineNodeData> = {}): Node<PipelineNodeData> {
  return {
    id: "n1",
    type: "pipelineNode",
    position: { x: 0, y: 0 },
    data: { name: "Fixture node", type: "source", kind: "source", ...data },
    selected: false,
  };
}

describe("CUSTOM_CODE_CONFIG_CATEGORY.matches", () => {
  it("matches a transform-kind node (SQL)", () => {
    expect(
      CUSTOM_CODE_CONFIG_CATEGORY.matches(fixtureNode({ kind: "transform", type: "transform" })),
    ).toBe(true);
  });

  it("matches a source-kind node with no connectorId (Python, custom API connector)", () => {
    expect(CUSTOM_CODE_CONFIG_CATEGORY.matches(fixtureNode({ kind: "source" }))).toBe(true);
  });

  it("does not match a source-kind node that carries a connectorId (pre-made connector)", () => {
    expect(
      CUSTOM_CODE_CONFIG_CATEGORY.matches(
        fixtureNode({ kind: "source", connectorId: "greenhouse" }),
      ),
    ).toBe(false);
  });

  it("does not match write or trigger kinds", () => {
    expect(
      CUSTOM_CODE_CONFIG_CATEGORY.matches(fixtureNode({ kind: "write", type: "target" })),
    ).toBe(false);
    expect(
      CUSTOM_CODE_CONFIG_CATEGORY.matches(fixtureNode({ kind: "trigger", type: "trigger" })),
    ).toBe(false);
  });
});

describe("CustomCodeCategoryEditor", () => {
  it("renders the resolved-language code widget bound to the node's config", async () => {
    const node = fixtureNode({
      kind: "transform",
      type: "transform",
      config: { code: "SELECT 1" },
    });

    render(<CustomCodeCategoryEditor node={node} onConfigChange={vi.fn()} />);

    expect(await screen.findByLabelText("sql code")).toHaveValue("SELECT 1");
  });

  it("propagates an edit through onConfigChange", async () => {
    const onConfigChange = vi.fn();
    const node = fixtureNode({ kind: "source", config: undefined });

    render(<CustomCodeCategoryEditor node={node} onConfigChange={onConfigChange} />);

    expect(await screen.findByLabelText("python code")).toHaveValue("");
  });
});
