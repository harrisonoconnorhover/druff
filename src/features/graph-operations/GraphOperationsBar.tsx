"use client";

import { CircleCheck, PackageSearch, Play, RefreshCw } from "lucide-react";
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
          variant="outline"
          size="sm"
          disabled={!operations.canPreviewDeployment}
          onClick={() => void operations.previewDeployment()}
        >
          <PackageSearch /> Build candidate &amp; plan
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
        Run targets the manifest-bound job already deployed. Candidate preview explicitly pushes a
        source-free image and plans the full manifest, but never applies infrastructure or changes a
        schedule.
      </p>
      {operations.deploymentPreview ? (
        <div className="mt-2 rounded-md border bg-background p-3 text-xs">
          <div className="font-medium">Candidate image pushed; no infrastructure applied.</div>
          <div className="mt-1 break-all font-mono text-[11px]">
            {operations.deploymentPreview.candidate_image}
          </div>
          <div className="mt-1 text-muted-foreground">
            {operations.deploymentPreview.plan_summary} Shared image consumers:{" "}
            {operations.deploymentPreview.affected_jobs.join(", ")}.
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer font-medium">Review exact Terraform plan</summary>
            <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded bg-slate-950 p-3 text-[11px] text-slate-100">
              {operations.deploymentPreview.plan_text}
            </pre>
          </details>
        </div>
      ) : null}
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
  if (operations.pending === "preview") return "Building candidate and planning…";
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
