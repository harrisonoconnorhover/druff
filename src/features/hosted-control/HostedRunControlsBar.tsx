"use client";

import { Ban, Play, RotateCcw, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HostedRunControls } from "@/features/hosted-control/useHostedRunControls";
import type { CapabilitiesResponse, RunStatusResponse } from "@/lib/dander-contracts";

export function HostedRunControlsBar({
  capabilities,
  controls,
  onReload,
}: {
  capabilities: CapabilitiesResponse;
  controls: HostedRunControls;
  onReload(): Promise<void>;
}) {
  return (
    <div className="border-b bg-indigo-50/60 px-4 py-2 text-xs text-slate-800 dark:bg-indigo-950/20 dark:text-slate-200">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">Hosted runs</span>
        <Button
          variant="outline"
          size="sm"
          disabled={!controls.canStart}
          onClick={() => void controls.start()}
        >
          <Play /> Start run
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!controls.canCancel}
          onClick={() => void controls.cancel()}
        >
          <Ban /> Cancel run
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!controls.canReplay}
          onClick={() => void controls.replay()}
        >
          <RotateCcw /> Replay run
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!controls.canLoadLogs}
          onClick={() => void controls.loadLogs()}
        >
          <ScrollText /> Load bounded logs
        </Button>
        {controls.conflict ? (
          <Button variant="outline" size="sm" onClick={() => void onReload()}>
            <RotateCcw /> Reload graph for run
          </Button>
        ) : null}
        <span className="text-muted-foreground" aria-live="polite">
          {activityLabel(controls)}
        </span>
      </div>

      {!capabilities.operations.includes("run.start") ? (
        <p className="mt-1 text-muted-foreground">
          Starting runs is unsupported for this hosted role or profile.
        </p>
      ) : null}
      {!capabilities.operations.includes("run.read") ? (
        <p className="mt-1 text-muted-foreground">
          Run status is unavailable for this hosted role or profile.
        </p>
      ) : null}

      {controls.run ? <RunSummary run={controls.run} origin={controls.origin} /> : null}

      {controls.logs ? (
        <div className="mt-2 rounded-md border bg-background p-3">
          <div className="font-medium">Bounded sanitized logs ({controls.logs.records.length})</div>
          {controls.logs.records.length > 0 ? (
            <ol className="mt-1 space-y-1 font-mono text-[11px]" aria-label="Run logs">
              {controls.logs.records.map((record, index) => (
                <li key={`${record.timestamp}-${record.code}-${index}`} className="break-words">
                  {record.timestamp} [{record.level}] {record.code}: {record.message} · correlation{" "}
                  {record.correlation_id}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-1 text-muted-foreground">No sanitized log records were returned.</p>
          )}
          {controls.logs.next_cursor ? (
            <p className="mt-1 text-muted-foreground">
              More records exist; this view intentionally renders one bounded page.
            </p>
          ) : null}
        </div>
      ) : null}

      {controls.acknowledgement ? (
        <p className="mt-1 text-muted-foreground" role="status">
          {controls.acknowledgement}
        </p>
      ) : null}
      {controls.error ? (
        <p className="mt-1 text-destructive" role="alert">
          {controls.error}
        </p>
      ) : null}
    </div>
  );
}

function RunSummary({
  run,
  origin,
}: {
  run: RunStatusResponse;
  origin: HostedRunControls["origin"];
}) {
  return (
    <div className="mt-2 rounded-md border bg-background p-3" aria-label="Normalized run status">
      <div className="font-medium">
        Run {run.run_id}: {run.state}
        {run.stage ? ` / ${run.stage}` : ""}
      </div>
      {origin ? (
        <div className="mt-1 text-[11px] text-muted-foreground">
          Started from {origin.address.project}/{origin.address.graph} at exact revision{" "}
          {origin.revision}
        </div>
      ) : null}
      <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
        <span>Endpoints: {run.endpoints ?? 0}</span>
        <span>Extracted: {run.extracted ?? 0}</span>
        <span>Affected: {run.affected ?? 0}</span>
        <span>Models: {run.models ?? 0}</span>
        <span>Assertions: {run.assertions ?? 0}</span>
        <span>Assets: {run.assets ?? 0}</span>
      </div>
      {run.failure_summary ? (
        <p className="mt-1 text-destructive">
          {run.failure_code ? `${run.failure_code}: ` : ""}
          {run.failure_summary}
        </p>
      ) : null}
    </div>
  );
}

function activityLabel(controls: HostedRunControls): string {
  if (controls.pending === "start") return "Starting…";
  if (controls.pending === "cancel") return "Requesting cancellation…";
  if (controls.pending === "replay") return "Requesting replay…";
  if (controls.logsPending) return "Loading one bounded log page…";
  if (controls.polling) return "Polling normalized status every 2 seconds";
  if (controls.pollingPaused) return "Status polling stopped after an incompatible response";
  return "";
}
