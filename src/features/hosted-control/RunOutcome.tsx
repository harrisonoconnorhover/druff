"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { HostedControlApiClient } from "@/features/hosted-control/control-api";
import type { HostedRunControls } from "@/features/hosted-control/useHostedRunControls";
import type { RunExplanationResponse } from "@/lib/dander-contracts";

/** Render recorded outcomes without inferring success, row changes, or a diagnosis from missing data. */
export function RunOutcome({
  client,
  controls,
  canExplain,
  onInspectOutputs,
}: {
  client: Pick<HostedControlApiClient, "explainRun">;
  controls: HostedRunControls;
  canExplain: boolean;
  onInspectOutputs?: () => void;
}): React.JSX.Element | null {
  const run = controls.run;
  const key = JSON.stringify(run);
  const runId = run?.run_id;
  const [result, setResult] = useState<{
    key: string;
    explanation?: RunExplanationResponse;
    error?: string;
  } | null>(null);
  useEffect(() => {
    if (!runId || !canExplain) return;
    let active = true;
    void client
      .explainRun(runId)
      .then((explanation) => {
        if (active) setResult({ key, explanation });
      })
      .catch((cause: unknown) => {
        if (active)
          setResult({
            key,
            error: cause instanceof Error ? cause.message : "The run explanation is unavailable.",
          });
      });
    return () => {
      active = false;
    };
  }, [client, canExplain, runId, key]);
  if (!run) return null;
  const current = result?.key === key ? result : null;
  const explanation = current?.explanation;
  const measured = Boolean(run.result_schema) && explanation?.results_available !== false;
  const next = explanation?.next_action;
  const action =
    next?.kind === "logs" && controls.canLoadLogs
      ? controls.loadLogs
      : next?.kind === "replay" && controls.canReplay
        ? controls.replay
        : next?.kind === "cancel" && controls.canCancel
          ? controls.cancel
          : next?.kind === "refresh"
            ? controls.refresh
            : next?.kind === "inspect_outputs"
              ? onInspectOutputs
              : undefined;
  return (
    <section
      className="space-y-2 rounded-md border bg-background p-3 text-sm"
      aria-label="Run outcome"
      aria-live="polite"
    >
      <h3 className="font-semibold">{explanation?.summary ?? `Run ${run.state}`}</h3>
      {controls.origin ? (
        <p className="text-xs text-muted-foreground">
          {controls.origin.address.project} / {controls.origin.address.graph}
        </p>
      ) : null}
      {run.repair_window ? (
        <p>
          Output repair: {run.repair_window.start_date} through {run.repair_window.end_date} (end
          excluded, UTC).
        </p>
      ) : null}
      <p>
        Extracted: {measured ? (run.extracted ?? "Unknown") : "Unknown"} · Affected:{" "}
        {measured ? (run.affected ?? "Unknown") : "Unknown"} · Models:{" "}
        {measured ? (run.models ?? "Unknown") : "Unknown"}
      </p>
      {explanation ? (
        <>
          <ul className="list-inside list-disc space-y-1">
            {(explanation.details ?? []).map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
          {next ? (
            <div>
              <p>{next.reason}</p>
              {action ? (
                <Button className="mt-2" size="sm" variant="outline" onClick={() => void action()}>
                  {next.label}
                </Button>
              ) : (
                <p className="font-medium">{next.label}</p>
              )}
            </div>
          ) : null}
          <details>
            <summary className="cursor-pointer">What these results mean</summary>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {(explanation.caveats ?? []).map((caveat) => (
                <li key={caveat}>{caveat}</li>
              ))}
            </ul>
          </details>
        </>
      ) : (
        <p className="text-muted-foreground">
          {current?.error ??
            (canExplain
              ? "Loading the recorded outcome…"
              : "Run explanations are unavailable for this connection.")}
        </p>
      )}
      {run.failure_summary ? <p className="text-destructive">{run.failure_summary}</p> : null}
      {controls.pollingPaused ? (
        <Button size="sm" variant="outline" onClick={() => void controls.refresh()}>
          Refresh run
        </Button>
      ) : null}
    </section>
  );
}
