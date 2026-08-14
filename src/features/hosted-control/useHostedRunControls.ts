"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  HostedControlApiClient,
  HostedControlOperationError,
  type HostedCapability,
} from "@/features/hosted-control/control-api";
import type {
  CapabilitiesResponse,
  LogPageResponse,
  RunStatusResponse,
} from "@/lib/dander-contracts";
import type { GraphAddress } from "@/lib/persistence/graph-persistence";

type PendingMutation = "start" | "cancel" | "replay" | null;

export type HostedRunOrigin = {
  address: GraphAddress;
  revision: string;
};

type RunView = {
  pending: PendingMutation;
  logsPending: boolean;
  pollingPaused: boolean;
  error: string | null;
  conflict: boolean;
  acknowledgement: string | null;
  run: RunStatusResponse | null;
  origin: HostedRunOrigin | null;
  logs: LogPageResponse | null;
};

export type HostedRunControls = RunView & {
  polling: boolean;
  canStart: boolean;
  canCancel: boolean;
  canReplay: boolean;
  canLoadLogs: boolean;
  start(): Promise<void>;
  cancel(): Promise<void>;
  replay(): Promise<void>;
  loadLogs(): Promise<void>;
};

export type HostedRunClient = Pick<
  HostedControlApiClient,
  "startRun" | "getRun" | "logs" | "cancelRun" | "replayRun"
>;

const ACTIVE_STATES = new Set<RunStatusResponse["state"]>([
  "queued",
  "running",
  "canceling",
  "retrying",
]);
const DEFAULT_POLL_INTERVAL_MS = 2_000;
const MAX_PRESENTED_LOG_RECORDS = 100;

const EMPTY_VIEW: RunView = {
  pending: null,
  logsPending: false,
  pollingPaused: false,
  error: null,
  conflict: false,
  acknowledgement: null,
  run: null,
  origin: null,
  logs: null,
};

export function useHostedRunControls({
  client,
  capabilities,
  address,
  revision,
  graphIsClean,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
}: {
  client: HostedRunClient | null;
  capabilities: CapabilitiesResponse | null;
  address: GraphAddress | null;
  revision: string | null;
  graphIsClean: boolean;
  pollIntervalMs?: number;
}): HostedRunControls {
  const [view, setView] = useState<RunView>(EMPTY_VIEW);
  const has = useCallback(
    (capability: HostedCapability): boolean =>
      capabilities?.operations.includes(capability) ?? false,
    [capabilities],
  );
  const activeRun = view.run !== null && ACTIVE_STATES.has(view.run.state);
  const canReadRun = has("run.read");
  const polling = activeRun && canReadRun && view.pending === null && !view.pollingPaused;
  const logLimit = useMemo(
    () =>
      Math.max(1, Math.min(capabilities?.limits.max_log_records ?? 1, MAX_PRESENTED_LOG_RECORDS)),
    [capabilities],
  );

  useEffect(() => {
    if (!client || !view.run || !polling) return;
    const runId = view.run.run_id;
    let active = true;
    const timer = window.setTimeout(() => {
      void client
        .getRun(runId)
        .then((run) => {
          if (!active) return;
          setView((current) =>
            current.run?.run_id === runId
              ? { ...current, run, error: null, pollingPaused: false }
              : current,
          );
        })
        .catch((cause: unknown) => {
          if (!active) return;
          setView((current) =>
            current.run?.run_id === runId
              ? {
                  ...current,
                  run:
                    cause instanceof HostedControlOperationError ? current.run : { ...current.run },
                  error: operationMessage(cause, "Druff could not refresh this run."),
                  pollingPaused: cause instanceof HostedControlOperationError,
                }
              : current,
          );
        });
    }, pollIntervalMs);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [client, pollIntervalMs, polling, view.run]);

  const start = useCallback(async () => {
    if (
      !client ||
      !address ||
      !revision ||
      !graphIsClean ||
      !has("run.start") ||
      !canReadRun ||
      view.pending !== null ||
      view.logsPending ||
      activeRun
    ) {
      setView((current) => ({
        ...current,
        error:
          "Open and save a hosted graph with run.start and run.read access before starting a run.",
      }));
      return;
    }
    const origin = { address, revision };
    setView((current) => ({
      ...current,
      pending: "start",
      error: null,
      conflict: false,
      acknowledgement: null,
    }));
    try {
      const run = await client.startRun(address, revision);
      setView({
        ...EMPTY_VIEW,
        run,
        origin,
      });
    } catch (cause) {
      setView((current) => ({
        ...current,
        pending: null,
        error: operationMessage(cause, "Druff could not start this run."),
        conflict: cause instanceof HostedControlOperationError && cause.conflict,
      }));
    }
  }, [
    activeRun,
    address,
    canReadRun,
    client,
    graphIsClean,
    has,
    revision,
    view.logsPending,
    view.pending,
  ]);

  const cancel = useCallback(async () => {
    const captured = view.run;
    if (
      !client ||
      !captured ||
      !has("run.cancel") ||
      !captured.can_cancel ||
      view.pending !== null ||
      view.logsPending
    ) {
      setView((current) => ({
        ...current,
        error: "This normalized run cannot be canceled by the current hosted role.",
      }));
      return;
    }
    setView((current) => ({
      ...current,
      pending: "cancel",
      error: null,
      acknowledgement: null,
    }));
    try {
      const result = await client.cancelRun(captured.run_id);
      setView((current) =>
        current.run?.run_id === captured.run_id
          ? {
              ...current,
              pending: null,
              run: { ...current.run, state: result.state, can_cancel: false },
              acknowledgement: result.accepted
                ? "Dander acknowledged cancellation; status polling continues."
                : "Dander did not acknowledge cancellation for this run.",
            }
          : current,
      );
    } catch (cause) {
      setView((current) => ({
        ...current,
        pending: null,
        error: operationMessage(cause, "Druff could not request cancellation."),
      }));
    }
  }, [client, has, view.logsPending, view.pending, view.run]);

  const replay = useCallback(async () => {
    const captured = view.run;
    if (
      !client ||
      !captured ||
      !has("run.replay") ||
      !captured.can_replay ||
      view.pending !== null ||
      view.logsPending
    ) {
      setView((current) => ({
        ...current,
        error: "This normalized run cannot be replayed by the current hosted role.",
      }));
      return;
    }
    setView((current) => ({
      ...current,
      pending: "replay",
      error: null,
      acknowledgement: null,
    }));
    try {
      const result = await client.replayRun(captured.run_id);
      if (!result.accepted) {
        setView((current) => ({
          ...current,
          pending: null,
          acknowledgement: "Dander did not acknowledge replay for this run.",
        }));
        return;
      }
      const resultingRunId = result.resulting_run_id!;
      setView((current) => ({
        ...current,
        pending: null,
        pollingPaused: false,
        run: { run_id: resultingRunId, state: result.state },
        logs: null,
        acknowledgement: `Dander acknowledged replay as ${resultingRunId}.`,
      }));
    } catch (cause) {
      setView((current) => ({
        ...current,
        pending: null,
        error: operationMessage(cause, "Druff could not replay this run."),
      }));
    }
  }, [client, has, view.logsPending, view.pending, view.run]);

  const loadLogs = useCallback(async () => {
    const captured = view.run;
    if (
      !client ||
      !captured ||
      !has("run.logs") ||
      !captured.logs_available ||
      view.logsPending ||
      view.pending !== null
    ) {
      setView((current) => ({
        ...current,
        error: "Bounded logs are unavailable for this run or hosted role.",
      }));
      return;
    }
    setView((current) => ({ ...current, logsPending: true, error: null }));
    try {
      const logs = await client.logs(captured.run_id, logLimit);
      setView((current) =>
        current.run?.run_id === captured.run_id
          ? { ...current, logsPending: false, logs }
          : current,
      );
    } catch (cause) {
      setView((current) => ({
        ...current,
        logsPending: false,
        error: operationMessage(cause, "Druff could not read bounded logs."),
      }));
    }
  }, [client, has, logLimit, view.logsPending, view.pending, view.run]);

  return {
    ...view,
    polling,
    canStart:
      client !== null &&
      address !== null &&
      revision !== null &&
      graphIsClean &&
      has("run.start") &&
      canReadRun &&
      view.pending === null &&
      !view.logsPending &&
      !activeRun,
    canCancel:
      view.run !== null &&
      Boolean(view.run.can_cancel) &&
      has("run.cancel") &&
      view.pending === null &&
      !view.logsPending,
    canReplay:
      view.run !== null &&
      Boolean(view.run.can_replay) &&
      has("run.replay") &&
      view.pending === null &&
      !view.logsPending,
    canLoadLogs:
      view.run !== null &&
      Boolean(view.run.logs_available) &&
      has("run.logs") &&
      !view.logsPending &&
      view.pending === null,
    start,
    cancel,
    replay,
    loadLogs,
  };
}

function operationMessage(cause: unknown, fallback: string): string {
  if (cause instanceof TypeError) {
    return `${fallback} The hosted service could not be reached; retrying the request is safe.`;
  }
  return cause instanceof Error ? cause.message : fallback;
}
