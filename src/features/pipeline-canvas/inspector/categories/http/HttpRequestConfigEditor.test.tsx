import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Node } from "@xyflow/react";
import { HttpRequestConfigEditor } from "@/features/pipeline-canvas/inspector/categories/http/HttpRequestConfigEditor";
import type { PipelineNodeData } from "@/lib/pipeline-graph";

// Fixture node + fixture-only values — no real/sensitive data, per steering/02-engineering.md.
function fixtureNode(config?: Record<string, unknown>): Node<PipelineNodeData> {
  return {
    id: "n1",
    type: "pipelineNode",
    position: { x: 0, y: 0 },
    data: { name: "Fixture source", type: "source", kind: "source", config },
    selected: false,
  };
}

describe("HttpRequestConfigEditor", () => {
  it("renders method/endpoint/body controls and no headers for a config-less node", () => {
    render(<HttpRequestConfigEditor node={fixtureNode()} onConfigChange={vi.fn()} />);

    expect(screen.getByLabelText("Method")).toHaveValue("GET");
    expect(screen.getByLabelText(/base url/i)).toHaveValue("");
    expect(screen.getByLabelText(/^body$/i)).toHaveValue("");
    expect(screen.getByText("No headers yet.")).toBeInTheDocument();
  });

  it("shows the node's existing method/endpoint/header/body values", () => {
    const node = fixtureNode({
      endpoint: "/candidates",
      request: {
        method: "POST",
        headers: { Authorization: "secret:demo_key" },
        body: "query { candidates }",
      },
    });

    render(<HttpRequestConfigEditor node={node} onConfigChange={vi.fn()} />);

    expect(screen.getByLabelText("Method")).toHaveValue("POST");
    expect(screen.getByLabelText(/base url/i)).toHaveValue("/candidates");
    expect(screen.getByLabelText("Header name")).toHaveValue("Authorization");
    expect(screen.getByLabelText("Header value")).toHaveValue("secret:demo_key");
    expect(screen.getByLabelText(/^body$/i)).toHaveValue("query { candidates }");
  });

  it("changing the method calls onConfigChange with the new method", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();
    render(<HttpRequestConfigEditor node={fixtureNode()} onConfigChange={onConfigChange} />);

    await user.selectOptions(screen.getByLabelText("Method"), "POST");

    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({ request: expect.objectContaining({ method: "POST" }) }),
    );
  });

  it("editing the endpoint calls onConfigChange with the updated config", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();
    render(<HttpRequestConfigEditor node={fixtureNode()} onConfigChange={onConfigChange} />);

    await user.type(screen.getByLabelText(/base url/i), "/x");

    expect(onConfigChange).toHaveBeenLastCalledWith({ endpoint: "/x" });
  });

  it("adding a header row then naming it persists a new header entry", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();
    render(<HttpRequestConfigEditor node={fixtureNode()} onConfigChange={onConfigChange} />);

    await user.click(screen.getByRole("button", { name: /add header/i }));
    await user.type(screen.getByLabelText("Header name"), "Content-Type");
    await user.type(screen.getByLabelText("Header value"), "application/json");

    expect(onConfigChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          headers: { "Content-Type": "application/json" },
        }),
      }),
    );
  });

  it("removing a header row clears it from the written config", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();
    const node = fixtureNode({ request: { headers: { "Content-Type": "application/json" } } });
    render(<HttpRequestConfigEditor node={node} onConfigChange={onConfigChange} />);

    await user.click(screen.getByRole("button", { name: /remove header/i }));

    // No headers, GET, no body -> fully default -> `request` omitted entirely.
    expect(onConfigChange).toHaveBeenLastCalledWith({});
  });

  it("reordering two headers writes them back in the new order", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();
    const node = fixtureNode({
      request: {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      },
    });
    render(<HttpRequestConfigEditor node={node} onConfigChange={onConfigChange} />);

    await user.click(screen.getAllByRole("button", { name: /move header down/i })[0]);

    const lastCall = onConfigChange.mock.calls.at(-1)?.[0];
    expect(Object.keys(lastCall.request.headers)).toEqual(["Accept", "Content-Type"]);
  });

  it("editing the body calls onConfigChange with the authored text", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();
    render(<HttpRequestConfigEditor node={fixtureNode()} onConfigChange={onConfigChange} />);

    await user.type(screen.getByLabelText(/^body$/i), "hi");

    expect(onConfigChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ request: expect.objectContaining({ body: "hi" }) }),
    );
  });

  it("shows an inline error for a sensitive header holding a literal value", async () => {
    const user = userEvent.setup();
    const node = fixtureNode({ request: { headers: { Authorization: "" } } });
    render(<HttpRequestConfigEditor node={node} onConfigChange={vi.fn()} />);

    await user.type(screen.getByLabelText("Header value"), "Bearer fake_demo_token_123");

    expect(screen.getByText(/sensitive header/i)).toBeInTheDocument();
  });

  it("shows the body credential-shape warning for a suspicious literal", async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();
    render(<HttpRequestConfigEditor node={fixtureNode()} onConfigChange={onConfigChange} />);

    await user.type(screen.getByLabelText(/^body$/i), "sk_fake1234567890");

    expect(screen.getByText(/inline credential/i)).toBeInTheDocument();
  });
});
