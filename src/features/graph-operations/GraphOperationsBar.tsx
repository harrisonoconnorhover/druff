"use client";

import { CircleCheck, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GraphOperationControls } from "@/features/graph-operations/useGraphOperations";

export type GraphOperationsBarProps = {
  operations: GraphOperationControls;
};

/**
 * Presents the narrow deployed-job loop separately from graph editing, keeping validation,
 * execution, and status explicit without suggesting that Druff deploys the current canvas.
 */
export function GraphOperationsBar({ operations }: GraphOperationsBarProps) {
  const binding = operations.status?.enabled === true ? operations.status.binding : null;

  return (
    <div className="border-b bg-slate-50 px-4 py-2 text-xs text-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">Deployed graph</span>
        <Button
          variant="outline"
          size="sm"
          disabled={!operations.canValidate}
          onClick={() => void operations.validate()}
        >
          <CircleCheck /> Validate graph
        </Button>
        <Button
          variant="default"
          size="sm"
          disabled={!operations.canRun}
          onClick={() => void operations.run()}
        >
          <Play /> Run deployed job
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={!operations.canRefresh}
          onClick={() => void operations.refresh()}
        >
          <RefreshCw className={operations.pending === "refresh" ? "animate-spin" : undefined} />
          Refresh status
        </Button>
        <span className="text-muted-foreground" aria-live="polite">
          {pendingLabel(operations)}
        </span>
      </div>

      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground" aria-live="polite">
        <span>{bindingLabel(binding, operations)}</span>
        {operations.status?.enabled === true ? (
          <>
            <span>{executionLabel(operations.status.execution)}</span>
            <span>{runLabel(operations.status.run)}</span>
          </>
        ) : null}
      </div>

      <p className="mt-1 text-[11px] text-muted-foreground">
        Runs the manifest-bound job that is already deployed. It does not deploy edits, write
        dander.yaml, or change a schedule.
      </p>
      {operations.error ? (
        <p className="mt-1 text-destructive" role="alert">
          {operations.error}
        </p>
      ) : null}
    </div>
  );
}

function pendingLabel(operations: GraphOperationControls): string {
  if (operations.pending === "refresh") return "Refreshing…";
  if (operations.pending === "validate") return "Validating…";
  if (operations.pending === "run") return "Starting…";
  if (operations.validation === "valid") return "Graph valid";
  return "";
}

function bindingLabel(
  binding: {
    project: string;
    pipeline_id: string;
    region: string;
    job_name: string;
  } | null,
  operations: GraphOperationControls,
): string {
  if (binding) {
    return `${binding.pipeline_id} → ${binding.job_name} · ${binding.project}/${binding.region}`;
  }
  if (operations.status?.enabled === false) return "Document-only Dander service";
  return "Open a graph from Dander to inspect its deployed binding";
}

function executionLabel(
  execution: {
    name: string;
    state: "starting" | "running" | "succeeded" | "failed";
  } | null,
): string {
  return execution
    ? `Cloud Run: ${execution.state} (${execution.name})`
    : "Cloud Run: no execution";
}

function runLabel(
  run: {
    status: "running" | "succeeded" | "failed" | "skipped";
    stage: "ingest" | "transform" | "metadata" | "complete";
    extracted: number;
    affected: number;
  } | null,
): string {
  return run
    ? `Dander ledger: ${run.status}/${run.stage} · ${run.extracted} extracted · ${run.affected} affected`
    : "Dander ledger: no run yet";
}
