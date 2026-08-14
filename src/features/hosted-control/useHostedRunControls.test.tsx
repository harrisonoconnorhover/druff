import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import capabilitiesFixture from "@/generated/dander-contracts/bundle/fixtures/capabilities.json";
import logsFixture from "@/generated/dander-contracts/bundle/fixtures/log-page.json";
import {
  DANDER_CONTRACT_BUNDLE_ID,
  DANDER_CONTRACT_BUNDLE_SHA256,
} from "@/generated/dander-contracts/metadata";
import { HostedControlOperationError } from "@/features/hosted-control/control-api";
import {
  useHostedRunControls,
  type HostedRunClient,
} from "@/features/hosted-control/useHostedRunControls";
import {
  CapabilitiesResponseSchema,
  LogPageResponseSchema,
  type MutationResult,
  type RunStatusResponse,
} from "@/lib/dander-contracts";

const ADDRESS = { project: "demo-project", graph: "alpha-graph" };
const REVISION = '"opaque-etag"';
const CAPABILITIES = CapabilitiesResponseSchema.parse({
  ...capabilitiesFixture,
  contract: {
    id: DANDER_CONTRACT_BUNDLE_ID,
    sha256: DANDER_CONTRACT_BUNDLE_SHA256,
  },
  operations: ["graph.read", "run.start", "run.read", "run.logs", "run.cancel", "run.replay"],
});

function run(
  state: RunStatusResponse["state"],
  overrides: Partial<RunStatusResponse> = {},
): RunStatusResponse {
  return { run_id: "run-one", state, ...overrides };
}

function client(overrides: Partial<HostedRunClient> = {}): HostedRunClient {
  return {
    startRun: vi.fn(async () => run("queued", { can_cancel: true })),
    getRun: vi.fn(async () => run("succeeded", { can_replay: true, logs_available: true })),
    logs: vi.fn(async () => LogPageResponseSchema.parse(logsFixture)),
    cancelRun: vi.fn(async (runId: string): Promise<MutationResult> => ({
      operation: "cancel",
      accepted: true,
      run_id: runId,
      resulting_run_id: null,
      state: "canceling",
    })),
    replayRun: vi.fn(async (runId: string): Promise<MutationResult> => ({
      operation: "replay",
      accepted: true,
      run_id: runId,
      resulting_run_id: "run-two",
      state: "queued",
    })),
    ...overrides,
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("useHostedRunControls", () => {
  it("starts, polls every two seconds, loads one bounded page, and follows replay", async () => {
    vi.useFakeTimers();
    const getRun = vi
      .fn()
      .mockResolvedValueOnce(run("running", { can_cancel: true, logs_available: true }))
      .mockResolvedValueOnce(run("succeeded", { can_replay: true, logs_available: true }));
    const api = client({ getRun });
    const { result } = renderHook(() =>
      useHostedRunControls({
        client: api,
        capabilities: CAPABILITIES,
        address: ADDRESS,
        revision: REVISION,
        graphIsClean: true,
      }),
    );

    await act(async () => result.current.start());
    expect(result.current.run).toMatchObject({ run_id: "run-one", state: "queued" });
    expect(result.current.polling).toBe(true);

    await act(async () => vi.advanceTimersByTimeAsync(2_000));
    expect(result.current.run?.state).toBe("running");
    await act(async () => vi.advanceTimersByTimeAsync(2_000));
    expect(result.current.run?.state).toBe("succeeded");
    expect(result.current.polling).toBe(false);

    await act(async () => result.current.loadLogs());
    expect(api.logs).toHaveBeenCalledWith("run-one", 100);
    expect(result.current.logs?.records).toHaveLength(1);

    await act(async () => result.current.replay());
    expect(result.current.run).toEqual({ run_id: "run-two", state: "queued" });
    expect(result.current.acknowledgement).toMatch(/acknowledged replay/i);
  });

  it("reschedules polling after a temporary reachability failure", async () => {
    vi.useFakeTimers();
    const getRun = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("temporary outage"))
      .mockResolvedValueOnce(run("succeeded"));
    const api = client({
      startRun: vi.fn(async () => run("running")),
      getRun,
    });
    const { result } = renderHook(() =>
      useHostedRunControls({
        client: api,
        capabilities: CAPABILITIES,
        address: ADDRESS,
        revision: REVISION,
        graphIsClean: true,
      }),
    );

    await act(async () => result.current.start());
    await act(async () => vi.advanceTimersByTimeAsync(2_000));
    expect(result.current.error).toMatch(/could not be reached/i);
    expect(result.current.polling).toBe(true);

    await act(async () => vi.advanceTimersByTimeAsync(2_000));
    expect(getRun).toHaveBeenCalledTimes(2);
    expect(result.current.run?.state).toBe("succeeded");
    expect(result.current.error).toBeNull();
  });

  it("keeps tracking an externally started run when the canvas changes in flight", async () => {
    let resolveStart!: (value: RunStatusResponse) => void;
    const pending = new Promise<RunStatusResponse>((resolve) => {
      resolveStart = resolve;
    });
    const api = client({ startRun: vi.fn(async () => pending) });
    const { result, rerender } = renderHook(
      ({ address, clean }) =>
        useHostedRunControls({
          client: api,
          capabilities: CAPABILITIES,
          address,
          revision: REVISION,
          graphIsClean: clean,
          pollIntervalMs: 60_000,
        }),
      { initialProps: { address: ADDRESS, clean: true } },
    );

    let starting!: Promise<void>;
    act(() => {
      starting = result.current.start();
    });
    rerender({ address: { project: "demo-project", graph: "other-graph" }, clean: false });
    resolveStart(run("queued"));
    await act(async () => starting);

    expect(result.current.run?.run_id).toBe("run-one");
    expect(result.current.origin).toEqual({ address: ADDRESS, revision: REVISION });
  });

  it("disables conflicting mutations while cancellation is pending", async () => {
    let resolveCancel!: (value: {
      operation: "cancel";
      accepted: boolean;
      run_id: string;
      resulting_run_id: null;
      state: "canceling";
    }) => void;
    const pending = new Promise<{
      operation: "cancel";
      accepted: boolean;
      run_id: string;
      resulting_run_id: null;
      state: "canceling";
    }>((resolve) => {
      resolveCancel = resolve;
    });
    const api = client({
      startRun: vi.fn(async () =>
        run("running", { can_cancel: true, can_replay: true, logs_available: true }),
      ),
      cancelRun: vi.fn(async () => pending),
    });
    const { result } = renderHook(() =>
      useHostedRunControls({
        client: api,
        capabilities: CAPABILITIES,
        address: ADDRESS,
        revision: REVISION,
        graphIsClean: true,
        pollIntervalMs: 60_000,
      }),
    );
    await act(async () => result.current.start());

    let canceling!: Promise<void>;
    act(() => {
      canceling = result.current.cancel();
    });
    expect(result.current.pending).toBe("cancel");
    expect(result.current.canCancel).toBe(false);
    expect(result.current.canReplay).toBe(false);

    resolveCancel({
      operation: "cancel",
      accepted: true,
      run_id: "run-one",
      resulting_run_id: null,
      state: "canceling",
    });
    await act(async () => canceling);
    expect(result.current.acknowledgement).toMatch(/acknowledged cancellation/i);
  });

  it("ignores an in-flight stale poll after cancellation begins", async () => {
    vi.useFakeTimers();
    let resolvePoll!: (value: RunStatusResponse) => void;
    const pendingPoll = new Promise<RunStatusResponse>((resolve) => {
      resolvePoll = resolve;
    });
    const api = client({
      startRun: vi.fn(async () => run("running", { can_cancel: true })),
      getRun: vi.fn(async () => pendingPoll),
    });
    const { result } = renderHook(() =>
      useHostedRunControls({
        client: api,
        capabilities: CAPABILITIES,
        address: ADDRESS,
        revision: REVISION,
        graphIsClean: true,
      }),
    );

    await act(async () => result.current.start());
    await act(async () => vi.advanceTimersByTimeAsync(2_000));
    expect(api.getRun).toHaveBeenCalledTimes(1);

    await act(async () => result.current.cancel());
    expect(result.current.run).toMatchObject({ state: "canceling", can_cancel: false });

    await act(async () => {
      resolvePoll(run("running", { can_cancel: true }));
      await pendingPoll;
    });
    expect(result.current.run).toMatchObject({ state: "canceling", can_cancel: false });
    expect(result.current.canCancel).toBe(false);
  });

  it("excludes run mutations while a bounded log read is in flight", async () => {
    const logPage = LogPageResponseSchema.parse(logsFixture);
    let resolveLogs!: (value: typeof logPage) => void;
    const pendingLogs = new Promise<typeof logPage>((resolve) => {
      resolveLogs = resolve;
    });
    const replayRun = vi.fn(async (runId: string): Promise<MutationResult> => ({
      operation: "replay",
      accepted: true,
      run_id: runId,
      resulting_run_id: "run-two",
      state: "queued",
    }));
    const api = client({
      startRun: vi.fn(async () => run("succeeded", { can_replay: true, logs_available: true })),
      logs: vi.fn(async () => pendingLogs),
      replayRun,
    });
    const { result } = renderHook(() =>
      useHostedRunControls({
        client: api,
        capabilities: CAPABILITIES,
        address: ADDRESS,
        revision: REVISION,
        graphIsClean: true,
      }),
    );
    await act(async () => result.current.start());

    let loading!: Promise<void>;
    act(() => {
      loading = result.current.loadLogs();
    });
    expect(result.current.logsPending).toBe(true);
    expect(result.current.canReplay).toBe(false);
    expect(result.current.canStart).toBe(false);

    await act(async () => result.current.replay());
    expect(replayRun).not.toHaveBeenCalled();

    resolveLogs(logPage);
    await act(async () => loading);
    expect(result.current.logsPending).toBe(false);
    expect(result.current.logs?.records).toHaveLength(1);
  });

  it("surfaces unauthorized mutations and pauses incompatible status polling", async () => {
    vi.useFakeTimers();
    const unauthorized = new HostedControlOperationError(
      "This identity is not allowed. Correlation ID: corr-auth.",
    );
    const api = client({
      startRun: vi.fn(async () => run("running", { can_cancel: true })),
      cancelRun: vi.fn(async () => {
        throw unauthorized;
      }),
      getRun: vi.fn(async () => {
        throw new HostedControlOperationError("The hosted session expired safely.");
      }),
    });
    const { result } = renderHook(() =>
      useHostedRunControls({
        client: api,
        capabilities: CAPABILITIES,
        address: ADDRESS,
        revision: REVISION,
        graphIsClean: true,
      }),
    );
    await act(async () => result.current.start());
    await act(async () => result.current.cancel());
    expect(result.current.error).toMatch(/not allowed/i);
    expect(result.current.pending).toBeNull();

    await act(async () => vi.advanceTimersByTimeAsync(2_000));
    expect(result.current.pollingPaused).toBe(true);
    expect(result.current.error).toMatch(/session expired/i);
  });

  it("fails closed when run status capability is absent", async () => {
    const api = client();
    const { result } = renderHook(() =>
      useHostedRunControls({
        client: api,
        capabilities: { ...CAPABILITIES, operations: ["graph.read", "run.start"] },
        address: ADDRESS,
        revision: REVISION,
        graphIsClean: true,
      }),
    );

    expect(result.current.canStart).toBe(false);
    await act(async () => result.current.start());
    expect(api.startRun).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/run.start and run.read access/i);
  });
});
