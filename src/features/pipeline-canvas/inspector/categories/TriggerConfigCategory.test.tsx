import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Node } from "@xyflow/react";
import { TRIGGER_CONFIG_CATEGORY } from "@/features/pipeline-canvas/inspector/categories/TriggerConfigCategory";
import type { PipelineNodeData } from "@/lib/pipeline-graph";

const { Editor: TriggerConfigEditor } = TRIGGER_CONFIG_CATEGORY;

// Fixture node + fixture-only values — no real/sensitive data, per steering/02-engineering.md.
function fixtureNode(config?: Record<string, unknown>): Node<PipelineNodeData> {
  return {
    id: "n1",
    type: "pipelineNode",
    position: { x: 0, y: 0 },
    data: { name: "Fixture trigger", type: "trigger", kind: "trigger", config },
    selected: false,
  };
}

describe("TriggerConfigCategory registration", () => {
  it("matches a trigger-kind node and no other kind", () => {
    expect(TRIGGER_CONFIG_CATEGORY.matches(fixtureNode())).toBe(true);
    expect(
      TRIGGER_CONFIG_CATEGORY.matches({
        ...fixtureNode(),
        data: { name: "Fixture source", type: "source", kind: "source" },
      }),
    ).toBe(false);
  });
});

describe("TriggerConfigEditor", () => {
  it("defaults to the Schedule mode's cron field for a config-less trigger node", () => {
    render(<TriggerConfigEditor node={fixtureNode()} onConfigChange={vi.fn()} />);

    expect(screen.getByRole("tab", { name: "Schedule", selected: true })).toBeInTheDocument();
    expect(screen.getByLabelText(/cron expression/i)).toHaveValue("");
  });

  it("renders an existing schedule trigger's cron value", () => {
    const node = fixtureNode({ trigger: { kind: "schedule", cron: "0 * * * *" } });
    render(<TriggerConfigEditor node={node} onConfigChange={vi.fn()} />);

    expect(screen.getByLabelText(/cron expression/i)).toHaveValue("0 * * * *");
  });

  it("renders an existing manual (webhook/event) trigger on its own tab", () => {
    const node = fixtureNode({ trigger: { kind: "manual", event: "candidate.created" } });
    render(<TriggerConfigEditor node={node} onConfigChange={vi.fn()} />);

    expect(
      screen.getByRole("tab", { name: "Webhook / event", selected: true }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/event name/i)).toHaveValue("candidate.created");
  });

  it("typing a cron expression calls onConfigChange with a clean schedule payload", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();
    render(<TriggerConfigEditor node={fixtureNode()} onConfigChange={onConfigChange} />);

    await user.type(screen.getByLabelText(/cron expression/i), "0 0 * * *");

    expect(onConfigChange).toHaveBeenLastCalledWith({
      trigger: { kind: "schedule", cron: "0 0 * * *" },
    });
  });

  it("shows an actionable inline message for a blank cron on schedule mode", async () => {
    const user = userEvent.setup();
    const node = fixtureNode({ trigger: { kind: "schedule", cron: "x" } });
    render(<TriggerConfigEditor node={node} onConfigChange={vi.fn()} />);

    await user.clear(screen.getByLabelText(/cron expression/i));

    expect(screen.getByText(/cron expression is required/i)).toBeInTheDocument();
  });

  it("switching from schedule to webhook/event mode drops the stale cron", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();
    const node = fixtureNode({ trigger: { kind: "schedule", cron: "0 * * * *" } });
    render(<TriggerConfigEditor node={node} onConfigChange={onConfigChange} />);

    await user.click(screen.getByRole("tab", { name: "Webhook / event" }));

    expect(onConfigChange).toHaveBeenLastCalledWith({ trigger: { kind: "manual" } });
  });

  it("switching to Upstream dependency mode and adding a dependency writes it", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();
    render(<TriggerConfigEditor node={fixtureNode()} onConfigChange={onConfigChange} />);

    await user.click(screen.getByRole("tab", { name: "Upstream dependency" }));
    await user.click(screen.getByRole("button", { name: /add dependency/i }));
    await user.type(screen.getByLabelText("Depends on 1"), "upstream-a");

    expect(onConfigChange).toHaveBeenLastCalledWith({
      trigger: { kind: "dependency", depends_on: ["upstream-a"] },
    });
  });

  it("shows an actionable inline message for an empty dependency list", async () => {
    const user = userEvent.setup();
    render(<TriggerConfigEditor node={fixtureNode()} onConfigChange={vi.fn()} />);

    await user.click(screen.getByRole("tab", { name: "Upstream dependency" }));

    expect(screen.getByText(/at least one upstream dependency is required/i)).toBeInTheDocument();
  });
});
