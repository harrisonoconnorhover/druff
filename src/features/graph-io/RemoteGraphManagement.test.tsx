import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RemoteGraphDialog } from "@/features/graph-io/RemoteGraphDialog";
import { GraphToolbar } from "@/features/graph-io/GraphToolbar";
import type { GraphPersistenceControls } from "@/features/graph-io/useGraphPersistence";

function controls(overrides: Partial<GraphPersistenceControls> = {}): GraphPersistenceControls {
  return {
    status: "disconnected",
    error: null,
    revision: null,
    address: null,
    contentSha256: null,
    attached: false,
    managed: true,
    projects: ["demo-project"],
    graphs: [
      {
        project: "demo-project",
        graph: "alpha-graph",
        content_sha256: "a".repeat(64),
        created_at: "2026-08-14T00:00:00Z",
        updated_at: "2026-08-14T00:00:00Z",
      },
    ],
    nextCursor: "cursor-2",
    browsing: false,
    browseError: null,
    loadProjects: vi.fn(async () => ["demo-project"]),
    loadGraphs: vi.fn(async () => undefined),
    create: vi.fn(async () => undefined),
    open: vi.fn(async () => undefined),
    reload: vi.fn(async () => undefined),
    save: vi.fn(async () => undefined),
    delete: vi.fn(async () => undefined),
    detach: vi.fn(),
    ...overrides,
  };
}

describe("remote graph management UI", () => {
  it("browses pages, opens a graph, and creates the detached draft under a portable id", async () => {
    const user = userEvent.setup();
    const persistence = controls();
    render(<RemoteGraphDialog persistence={persistence} />);

    await user.click(screen.getByRole("button", { name: "Browse hosted graphs" }));
    expect(persistence.loadProjects).toHaveBeenCalledOnce();
    expect(await screen.findByText("alpha-graph")).toBeInTheDocument();
    expect(persistence.loadGraphs).toHaveBeenCalledWith("demo-project");

    await user.click(screen.getByRole("button", { name: "Load more" }));
    expect(persistence.loadGraphs).toHaveBeenCalledWith("demo-project", true);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(persistence.open).toHaveBeenCalledWith({
      project: "demo-project",
      graph: "alpha-graph",
    });

    await user.click(screen.getByRole("button", { name: "Browse hosted graphs" }));
    await user.type(screen.getByLabelText("Create from current local draft"), "new-graph");
    await user.click(screen.getByRole("button", { name: "Create" }));
    expect(persistence.create).toHaveBeenCalledWith("demo-project", "new-graph");
  });

  it("requires delete confirmation and exposes a separate reload path for conflicts", async () => {
    const user = userEvent.setup();
    const persistence = controls({
      status: "conflict",
      attached: true,
      revision: '"opaque-revision"',
      address: { project: "demo-project", graph: "alpha-graph" },
      contentSha256: "b".repeat(64),
    });
    render(<GraphToolbar viewMode="canvas" onViewModeChange={vi.fn()} persistence={persistence} />);

    expect(screen.getByText(/opaque revision:/i)).toBeInTheDocument();
    expect(screen.getByText(/content sha-256:/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /reload hosted version/i }));
    expect(persistence.reload).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByText("Delete hosted graph?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete hosted graph" }));
    expect(persistence.delete).toHaveBeenCalledOnce();
  });

  it("fails closed for save and delete when the hosted role lacks mutation capabilities", () => {
    const persistence = controls({
      status: "clean",
      attached: true,
      revision: '"opaque-revision"',
      address: { project: "demo-project", graph: "alpha-graph" },
    });
    render(
      <GraphToolbar
        viewMode="canvas"
        onViewModeChange={vi.fn()}
        persistence={persistence}
        canEditHosted={false}
        canDeleteHosted={false}
      />,
    );

    expect(screen.getByRole("button", { name: "Save hosted graph" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
    expect(persistence.save).not.toHaveBeenCalled();
    expect(persistence.delete).not.toHaveBeenCalled();
  });

  it("disables hosted create when graph.edit is not advertised", async () => {
    const user = userEvent.setup();
    const persistence = controls();
    render(<RemoteGraphDialog persistence={persistence} canCreate={false} />);

    await user.click(screen.getByRole("button", { name: "Browse hosted graphs" }));
    await user.type(screen.getByLabelText("Create from current local draft"), "new-graph");
    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
    expect(screen.getByText(/does not advertise graph.edit/i)).toBeVisible();
  });
});
