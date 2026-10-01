"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GraphPersistenceControls } from "@/features/graph-io/useGraphPersistence";
import {
  HostedControlOperationError,
  type HostedControlApiClient,
} from "@/features/hosted-control/control-api";
import type { HostedRunControls } from "@/features/hosted-control/useHostedRunControls";
import type { GraphRepairPreviewResponse } from "@/lib/dander-contracts";

/** A repair always previews the same saved graph and half-open window it submits. */
export function DateRepairPanel({
  client,
  persistence,
  controls,
  canPreview,
}: {
  client: Pick<HostedControlApiClient, "previewRepair">;
  persistence: GraphPersistenceControls;
  controls: HostedRunControls;
  canPreview: boolean;
}): React.JSX.Element {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [environment, setEnvironment] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{
    key: string;
    preview?: GraphRepairPreviewResponse;
    error?: string;
    conflict?: boolean;
  } | null>(null);
  const key = JSON.stringify([
    persistence.address,
    persistence.revision,
    persistence.contentSha256,
    persistence.status,
    start,
    end,
  ]);
  const current = result?.key === key ? result : null;
  const preview = current?.preview;
  const validDates =
    /^\d{4}-\d{2}-\d{2}$/.test(start) && /^\d{4}-\d{2}-\d{2}$/.test(end) && start < end;
  const selectedEnvironment =
    preview?.environments.length === 1 ? preview.environments[0] : environment;
  async function previewDates(): Promise<void> {
    if (
      !canPreview ||
      !validDates ||
      persistence.status !== "clean" ||
      !persistence.address ||
      !persistence.revision ||
      pending
    )
      return;
    setPending(true);
    setResult(null);
    setEnvironment("");
    try {
      const next = await client.previewRepair(persistence.address, persistence.revision, {
        start_date: start,
        end_date: end,
      });
      if (next.graph_content_sha256 !== persistence.contentSha256)
        throw new HostedControlOperationError(
          "This repair preview belongs to another graph revision. Reload before retrying.",
          { conflict: true },
        );
      setResult({ key, preview: next });
    } catch (cause) {
      setResult({
        key,
        error: cause instanceof Error ? cause.message : "The repair preview is unavailable.",
        conflict: cause instanceof HostedControlOperationError && cause.conflict,
      });
    } finally {
      setPending(false);
    }
  }
  const canStart = Boolean(
    preview &&
    controls.canStartRepair &&
    selectedEnvironment &&
    preview.environments.includes(selectedEnvironment),
  );
  return (
    <details className="rounded-md border bg-background p-3 text-sm">
      <summary className="cursor-pointer font-medium">Repair selected output dates</summary>
      <div className="mt-3 space-y-3">
        <p className="text-xs font-medium text-muted-foreground">Experimental output repair</p>
        <p>
          Rebuild dates in the selected graph from raw data already stored in the warehouse. This
          does not re-fetch source records or restore a historical snapshot.
        </p>
        {persistence.status !== "clean" ? (
          <p>Save the graph before previewing a date repair.</p>
        ) : null}
        {!canPreview ? <p>Date repair is unavailable for this connection or role.</p> : null}
        <div className="flex flex-wrap gap-3">
          <div className="space-y-1">
            <Label htmlFor="repair-start">First date (included, UTC)</Label>
            <Input
              id="repair-start"
              type="date"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="repair-end">End date (excluded, UTC)</Label>
            <Input
              id="repair-end"
              type="date"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
            />
          </div>
        </div>
        {start && end && !validDates ? (
          <p role="alert">The end date must be later than the first date.</p>
        ) : null}
        <Button
          size="sm"
          variant="outline"
          disabled={!canPreview || !validDates || pending || persistence.status !== "clean"}
          onClick={() => void previewDates()}
        >
          {pending ? "Checking repair…" : "Preview date repair"}
        </Button>
        {current?.error ? (
          <p role="alert" className="text-destructive">
            {current.error}
          </p>
        ) : null}
        {current?.conflict ? (
          <Button size="sm" variant="outline" onClick={() => void persistence.reload()}>
            Reload graph for repair
          </Button>
        ) : null}
        {preview ? (
          <div className="space-y-2" aria-label="Date repair review">
            <p className="font-medium">{preview.summary}</p>
            <ul className="list-inside list-disc">
              {preview.outputs.map((output) => (
                <li key={output.node_id}>
                  {output.name}: {output.destination.dataset}.{output.destination.table} by{" "}
                  {output.partition_field}
                </li>
              ))}
            </ul>
            <p>Rows and cost: unknown. Normal source progress is unchanged.</p>
            <ul className="list-inside list-disc text-muted-foreground">
              {(preview.limitations ?? []).map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
            {preview.environments.length > 1 ? (
              <div>
                <Label htmlFor="repair-environment">Execution environment</Label>
                <select
                  id="repair-environment"
                  className="m-2 rounded border bg-background p-2"
                  value={environment}
                  onChange={(event) => setEnvironment(event.target.value)}
                >
                  <option value="">Choose an environment</option>
                  {preview.environments.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {preview.environments.length === 0 ? (
              <p>No compatible execution environment is available.</p>
            ) : null}
            <Button
              size="sm"
              disabled={!canStart}
              onClick={() => {
                if (canStart && preview && selectedEnvironment)
                  void controls.start({ window: preview.window, environment: selectedEnvironment });
              }}
            >
              Start reviewed repair
            </Button>
          </div>
        ) : null}
      </div>
    </details>
  );
}
