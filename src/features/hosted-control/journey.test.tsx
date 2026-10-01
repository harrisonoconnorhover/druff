import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import changeFixture from "@/generated/dander-contracts/bundle/fixtures/graph-change-preview.json";
import repairFixture from "@/generated/dander-contracts/bundle/fixtures/graph-repair-preview.json";
import capabilitiesFixture from "@/generated/dander-contracts/bundle/fixtures/capabilities.json";
import explanationFixture from "@/generated/dander-contracts/bundle/fixtures/run-explanation.json";
import {
  CapabilitiesResponseSchema,
  GraphChangePreviewResponseSchema,
  GraphRepairPreviewResponseSchema,
  RunExplanationResponseSchema,
} from "@/lib/dander-contracts";
import { useGraphChangePreview } from "@/features/hosted-control/useGraphChangePreview";
import { DateRepairPanel } from "@/features/hosted-control/DateRepairPanel";
import { GraphChangeReview } from "@/features/hosted-control/GraphChangeReview";
import { RunOutcome } from "@/features/hosted-control/RunOutcome";
import type { HostedRunControls } from "@/features/hosted-control/useHostedRunControls";
import type { GraphPersistenceControls } from "@/features/graph-io/useGraphPersistence";
import { useGraphStore } from "@/lib/graph-store";

const preview = GraphChangePreviewResponseSchema.parse(changeFixture);
const repair = GraphRepairPreviewResponseSchema.parse(repairFixture);
const capabilities = CapabilitiesResponseSchema.parse({
  ...capabilitiesFixture,
  operations: [
    "graph.read",
    "graph.edit",
    "graph.change-preview",
    "graph.repair-preview",
    "run.read",
    "run.start",
    "run.repair",
    "run.explain",
  ],
});
function persistence(overrides: Partial<GraphPersistenceControls> = {}): GraphPersistenceControls {
  return {
    status: "dirty",
    error: null,
    revision: '"v1"',
    address: { project: "demo", graph: "pipeline" },
    contentSha256: preview.baseline_content_sha256,
    attached: true,
    managed: true,
    projects: [],
    graphs: [],
    nextCursor: null,
    browsing: false,
    browseError: null,
    loadProjects: vi.fn(async () => []),
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
function runs(overrides: Partial<HostedRunControls> = {}): HostedRunControls {
  return {
    pending: null,
    logsPending: false,
    pollingPaused: false,
    error: null,
    conflict: false,
    acknowledgement: null,
    run: null,
    origin: null,
    logs: null,
    polling: false,
    canStart: true,
    canStartRepair: true,
    canCancel: false,
    canReplay: false,
    canLoadLogs: false,
    start: vi.fn(async () => undefined),
    cancel: vi.fn(async () => undefined),
    replay: vi.fn(async () => undefined),
    loadLogs: vi.fn(async () => undefined),
    refresh: vi.fn(async () => undefined),
    ...overrides,
  };
}
beforeEach(() => {
  useGraphStore.getState().setGraph([], [], "draft");
});

describe("reviewed graph identity", () => {
  it("requires the reviewed candidate's saved hash and invalidates later edits", async () => {
    const saved = persistence();
    const client = { previewChanges: vi.fn(async () => preview) };
    const { result, rerender } = renderHook(
      ({ state }) => useGraphChangePreview({ client, persistence: state, capabilities }),
      { initialProps: { state: saved } },
    );
    await act(async () => result.current.previewChanges());
    expect(result.current.canSave).toBe(true);
    expect(result.current.reviewedSaved).toBe(false);
    await act(async () => result.current.saveReviewed());
    expect(saved.save).toHaveBeenCalledOnce();
    rerender({
      state: {
        ...saved,
        revision: '"v2"',
        contentSha256: preview.candidate_content_sha256,
        status: "clean",
      },
    });
    expect(result.current.reviewedSaved).toBe(true);
    act(() => useGraphStore.getState().setGraph([], [], "new edit"));
    expect(result.current.isReviewedNow()).toBe(false);
    rerender({
      state: {
        ...saved,
        revision: '"v2"',
        contentSha256: preview.candidate_content_sha256,
        status: "dirty",
      },
    });
    expect(result.current.preview).toBeNull();
    expect(result.current.reviewedSaved).toBe(false);
  });

  it("discards a preview arriving after the draft changes, and a wrong baseline", async () => {
    let resolve!: (value: typeof preview) => void;
    const client = {
      previewChanges: vi.fn(
        () =>
          new Promise<typeof preview>((done) => {
            resolve = done;
          }),
      ),
    };
    const { result } = renderHook(() =>
      useGraphChangePreview({ client, persistence: persistence(), capabilities }),
    );
    let request!: Promise<void>;
    act(() => {
      request = result.current.previewChanges();
    });
    act(() => useGraphStore.getState().setGraph([], [], "edited while waiting"));
    await act(async () => {
      resolve(preview);
      await request;
    });
    expect(result.current.preview).toBeNull();
    client.previewChanges.mockResolvedValueOnce({
      ...preview,
      baseline_content_sha256: "f".repeat(64),
    });
    await act(async () => result.current.previewChanges());
    expect(result.current.error).toMatch(/different saved graph/);
  });
});

describe("date repair", () => {
  it("submits exactly the reviewed window and invalidates it after a date edit", async () => {
    const client = { previewRepair: vi.fn(async () => repair) };
    const controls = runs();
    render(
      <DateRepairPanel
        client={client}
        persistence={persistence({ status: "clean", contentSha256: repair.graph_content_sha256 })}
        controls={controls}
        canPreview
      />,
    );
    fireEvent.click(screen.getByText("Repair selected output dates"));
    fireEvent.change(screen.getByLabelText(/First date/), { target: { value: "2026-09-01" } });
    fireEvent.change(screen.getByLabelText(/End date/), { target: { value: "2026-09-03" } });
    fireEvent.click(screen.getByRole("button", { name: "Preview date repair" }));
    const start = await screen.findByRole("button", { name: "Start reviewed repair" });
    fireEvent.click(start);
    expect(controls.start).toHaveBeenCalledWith({ window: repair.window, environment: "gcp" });
    fireEvent.change(screen.getByLabelText(/End date/), { target: { value: "2026-09-04" } });
    expect(screen.queryByRole("button", { name: "Start reviewed repair" })).not.toBeInTheDocument();
    expect(controls.start).toHaveBeenCalledOnce();
  });

  it("requires an advertised environment and never offers repair for an unsaved graph", async () => {
    const client = { previewRepair: vi.fn(async () => ({ ...repair, environments: [] })) };
    const props = {
      client,
      persistence: persistence({ status: "clean", contentSha256: repair.graph_content_sha256 }),
      controls: runs(),
      canPreview: true,
    };
    const { rerender } = render(<DateRepairPanel {...props} />);
    fireEvent.click(screen.getByText("Repair selected output dates"));
    fireEvent.change(screen.getByLabelText(/First date/), { target: { value: "2026-09-01" } });
    fireEvent.change(screen.getByLabelText(/End date/), { target: { value: "2026-09-03" } });
    fireEvent.click(screen.getByRole("button", { name: "Preview date repair" }));
    expect(await screen.findByRole("button", { name: "Start reviewed repair" })).toBeDisabled();
    rerender(
      <DateRepairPanel {...props} persistence={{ ...props.persistence, status: "dirty" }} />,
    );
    expect(screen.queryByRole("button", { name: "Start reviewed repair" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Preview date repair" })).toBeDisabled();
  });
});

it("shows unknown measurements and the real explanation instead of invented zeros", async () => {
  const explanation = RunExplanationResponseSchema.parse(explanationFixture);
  const client = { explainRun: vi.fn(async () => explanation) };
  render(
    <RunOutcome
      client={client}
      controls={runs({
        run: {
          run_id: explanation.run_id,
          state: "succeeded",
          extracted: undefined,
          affected: undefined,
        },
      })}
      canExplain
    />,
  );
  expect(screen.getByText(/Extracted: Unknown · Affected: Unknown/)).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText(explanation.summary)).toBeInTheDocument());
  expect(client.explainRun).toHaveBeenCalledWith(explanation.run_id);
});

it("keeps server-default counters unknown when no result document was recorded", async () => {
  const explanation = {
    ...RunExplanationResponseSchema.parse(explanationFixture),
    results_available: false,
  };
  render(
    <RunOutcome
      client={{ explainRun: vi.fn(async () => explanation) }}
      controls={runs({
        run: {
          run_id: explanation.run_id,
          state: "succeeded",
          extracted: 0,
          affected: 0,
          models: 0,
          result_schema: null,
        },
      })}
      canExplain
    />,
  );
  await waitFor(() => expect(screen.getByText(explanation.summary)).toBeInTheDocument());
  expect(
    screen.getByText(/Extracted: Unknown · Affected: Unknown · Models: Unknown/),
  ).toBeInTheDocument();
});

it("discards an explanation that arrives after the recorded run status changes", async () => {
  const base = RunExplanationResponseSchema.parse(explanationFixture);
  let finishOld!: (value: typeof base) => void;
  let finishNew!: (value: typeof base) => void;
  const client = {
    explainRun: vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<typeof base>((resolve) => {
            finishOld = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise<typeof base>((resolve) => {
            finishNew = resolve;
          }),
      ),
  };
  const { rerender } = render(
    <RunOutcome
      client={client}
      controls={runs({ run: { run_id: base.run_id, state: "running" } })}
      canExplain
    />,
  );
  rerender(
    <RunOutcome
      client={client}
      controls={runs({ run: { run_id: base.run_id, state: "succeeded" } })}
      canExplain
    />,
  );
  await act(async () =>
    finishOld({ ...base, state: "running", summary: "Old running explanation" }),
  );
  expect(screen.queryByText("Old running explanation")).not.toBeInTheDocument();
  expect(screen.getByText("Run succeeded")).toBeInTheDocument();
  await act(async () =>
    finishNew({ ...base, state: "succeeded", summary: "Current completed explanation" }),
  );
  expect(screen.getByText("Current completed explanation")).toBeInTheDocument();
});

it("shows every producer-reported output effect, including unchanged outputs a full run writes", () => {
  render(<GraphChangeReview preview={preview} />);
  expect(
    screen.getByText(
      `A full run writes all ${preview.run_output_ids.length} configured outputs. Saving alone does not change warehouse data.`,
    ),
  ).toBeInTheDocument();
  for (const output of preview.outputs) {
    expect(screen.getByText(output.name)).toBeInTheDocument();
    expect(screen.getByText(output.effect)).toBeInTheDocument();
  }
  expect(screen.getByText(/Rows and cost: unknown/)).toBeInTheDocument();
});
