import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GraphEditor } from "@/features/graph-io/GraphEditor";
import { useHostedControl } from "@/features/hosted-control/HostedControlProvider";
import { useGraphPersistence } from "@/features/graph-io/useGraphPersistence";
import { useGraphOperations } from "@/features/graph-operations/useGraphOperations";

vi.mock("@/features/hosted-control/HostedControlProvider", () => ({
  useHostedControl: vi.fn(),
}));
vi.mock("@/features/graph-io/useGraphPersistence", () => ({
  useGraphPersistence: vi.fn(),
}));
vi.mock("@/features/graph-operations/useGraphOperations", () => ({
  useGraphOperations: vi.fn(() => ({ status: null })),
}));
vi.mock("@/features/graph-io/GraphToolbar", () => ({
  GraphToolbar: () => <div>graph toolbar</div>,
}));
vi.mock("@/features/graph-operations/GraphOperationsBar", () => ({
  GraphOperationsBar: () => <div>legacy loopback operations</div>,
}));
vi.mock("@/features/pipeline-canvas/PipelineCanvas", () => ({
  PipelineCanvas: () => <div>pipeline canvas</div>,
}));
vi.mock("@/features/graph-io/SourceView", () => ({ SourceView: () => <div>source</div> }));

const request = vi.fn();
const controls = {
  status: "disconnected",
  error: null,
  revision: null,
  address: null,
  contentSha256: null,
  attached: false,
  managed: true,
  projects: [],
  graphs: [],
  nextCursor: null,
  browsing: false,
  browseError: null,
  loadProjects: vi.fn(async () => []),
  loadGraphs: vi.fn(),
  create: vi.fn(),
  open: vi.fn(),
  reload: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
  detach: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useGraphPersistence).mockReturnValue(controls as never);
});

describe("GraphEditor control mode", () => {
  it("never constructs or exposes the legacy loopback operations path in hosted mode", () => {
    const browserFetch = vi.spyOn(globalThis, "fetch");
    vi.mocked(useHostedControl).mockReturnValue({
      mode: "hosted",
      request,
      capabilities: {
        api_version: "v1",
        dander_version: "0.9.0rc19",
        contract: { id: "io.dander.control.contracts/v1", sha256: "a".repeat(64) },
        compatibility: { minimum_druff_contract: "1.0.0", maximum_druff_contract: "1.x" },
        limits: { max_graph_bytes: 1, max_log_records: 1, max_page_size: 1 },
        operations: ["graph.read", "graph.edit", "graph.validate"],
      },
      hasCapability: (capability: string) =>
        ["graph.read", "graph.edit", "graph.validate"].includes(capability),
    } as never);

    render(<GraphEditor />);

    expect(screen.getByText("Hosted Dander")).toBeInTheDocument();
    expect(screen.queryByText("legacy loopback operations")).not.toBeInTheDocument();
    expect(useGraphOperations).not.toHaveBeenCalled();
    expect(browserFetch).not.toHaveBeenCalled();
    browserFetch.mockRestore();
  });

  it("keeps the existing served-file operations path in loopback mode", () => {
    vi.mocked(useHostedControl).mockReturnValue({
      mode: "loopback",
      request,
      capabilities: null,
      hasCapability: () => false,
    } as never);

    render(<GraphEditor />);

    expect(screen.getByText("legacy loopback operations")).toBeInTheDocument();
    expect(screen.getByText(/explicitly served graph file/i)).toBeInTheDocument();
    expect(useGraphOperations).toHaveBeenCalled();
  });
});
