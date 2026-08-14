"use client";

import { useSyncExternalStore } from "react";
import { CircleCheck, PackageSearch, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPluginCatalogSnapshot,
  subscribePluginCatalog,
} from "@/features/connector-library/catalog-store";
import {
  getDiscoveredConnectorSnapshot,
  subscribeConnectors,
} from "@/features/connector-library/registry";
import type { HostedValidationPreviewControls } from "@/features/hosted-control/useHostedValidationPreview";
import {
  getOperationCatalogSnapshot,
  subscribeOperationCatalog,
} from "@/features/pipeline-operations/catalog-store";
import type { CapabilitiesResponse } from "@/lib/dander-contracts";

export function HostedValidationPreviewBar({
  capabilities,
  operations,
  onReload,
}: {
  capabilities: CapabilitiesResponse;
  operations: HostedValidationPreviewControls;
  onReload(): Promise<void>;
}) {
  const connectors = useSyncExternalStore(
    subscribeConnectors,
    getDiscoveredConnectorSnapshot,
    getDiscoveredConnectorSnapshot,
  );
  const plugins = useSyncExternalStore(
    subscribePluginCatalog,
    getPluginCatalogSnapshot,
    getPluginCatalogSnapshot,
  );
  const catalogOperations = useSyncExternalStore(
    subscribeOperationCatalog,
    getOperationCatalogSnapshot,
    getOperationCatalogSnapshot,
  );

  return (
    <div className="border-b bg-slate-50 px-4 py-2 text-xs text-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">Hosted Dander</span>
        <Button
          variant="outline"
          size="sm"
          disabled={!operations.canValidate}
          onClick={() => void operations.validate()}
        >
          <CircleCheck /> Validate graph
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!operations.canPreview}
          onClick={() => void operations.previewDeployment()}
        >
          <PackageSearch /> Preview deployment
        </Button>
        {operations.conflict ? (
          <Button variant="outline" size="sm" onClick={() => void onReload()}>
            <RotateCcw /> Reload hosted version
          </Button>
        ) : null}
        <span className="text-muted-foreground" aria-live="polite">
          {pendingLabel(operations)}
        </span>
      </div>

      <div className="mt-1 text-[11px] text-muted-foreground">
        Dander {capabilities.dander_version} · API {capabilities.api_version} ·{" "}
        {capabilities.contract.id}
        {" · "}contract {compact(capabilities.contract.sha256)}
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
        <span>Installed connectors: {connectors.length}</span>
        <span>Curated plugins: {plugins.length}</span>
        <span>Operations: {catalogOperations.length}</span>
      </div>
      <details className="mt-1 text-[11px]">
        <summary className="cursor-pointer font-medium">Inspect catalogs and capabilities</summary>
        <div className="mt-1 grid gap-1 rounded border bg-background p-2 sm:grid-cols-2">
          <div>
            <strong>Capabilities:</strong> {capabilities.operations.join(", ") || "none"}
          </div>
          <div>
            <strong>Installed connectors:</strong>{" "}
            {connectors.map((connector) => connector.name).join(", ") || "none"}
          </div>
          <div>
            <strong>Curated plugins:</strong>{" "}
            {plugins.map((plugin) => plugin.display_name).join(", ") || "none"}
          </div>
          <div>
            <strong>Graph operations:</strong>{" "}
            {catalogOperations.map((operation) => operation.display_name).join(", ") || "none"}
          </div>
        </div>
      </details>

      {!capabilities.operations.includes("graph.validate") ? (
        <p className="mt-1 text-muted-foreground">
          Validation is unsupported for this hosted role or profile.
        </p>
      ) : null}
      {!capabilities.operations.includes("deployment.preview") ? (
        <p className="mt-1 text-muted-foreground">
          Deployment preview is unsupported for this hosted role or profile.
        </p>
      ) : null}
      {operations.generalIssues.length > 0 ? (
        <ul className="mt-2 list-disc pl-4 text-destructive" aria-label="Graph validation issues">
          {operations.generalIssues.map((issue, index) => (
            <li key={`${issue.location}-${index}`}>
              {issue.message} ({issue.location})
            </li>
          ))}
        </ul>
      ) : null}
      {operations.preview ? (
        <div className="mt-2 rounded-md border bg-background p-3">
          <div className="font-medium">Bounded deployment preview</div>
          <div className="mt-1 break-all font-mono text-[11px]">
            {operations.preview.candidate_image}
          </div>
          <div className="mt-1 text-muted-foreground">
            {operations.preview.plan_summary} Affected resources:{" "}
            {(operations.preview.affected_jobs ?? []).join(", ") || "none"}. Plan SHA-256:{" "}
            {operations.preview.plan_sha256}.
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer font-medium">Review bounded plan text</summary>
            <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded bg-slate-950 p-3 text-[11px] text-slate-100">
              {operations.preview.plan_text}
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

function pendingLabel(operations: HostedValidationPreviewControls): string {
  if (operations.pending === "validate") return "Validating…";
  if (operations.pending === "preview") return "Building bounded preview…";
  if (operations.validation?.valid === true) return "Dander validation: valid";
  if (operations.validation) {
    return `Dander validation: ${(operations.validation.issues ?? []).length} issue(s)`;
  }
  return "";
}

function compact(value: string): string {
  return value.length > 16 ? `${value.slice(0, 16)}…` : value;
}
