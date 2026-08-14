"use client";

import { useMemo, useState } from "react";
import { GraphToolbar, type ViewMode } from "@/features/graph-io/GraphToolbar";
import { SourceView } from "@/features/graph-io/SourceView";
import { useGraphPersistence } from "@/features/graph-io/useGraphPersistence";
import { GraphOperationsBar } from "@/features/graph-operations/GraphOperationsBar";
import { useGraphOperations } from "@/features/graph-operations/useGraphOperations";
import { PipelineCanvas } from "@/features/pipeline-canvas/PipelineCanvas";
import { useHostedControl } from "@/features/hosted-control/HostedControlProvider";
import { HostedGraphPersistence } from "@/lib/persistence/graph-persistence";

/**
 * Top-level container for DRUFF-5: owns which half (`canvas` | `source`) is showing, wires up
 * explicit Dander Open/Save via `useGraphPersistence`, and renders `GraphToolbar` above either
 * `PipelineCanvas` or the read-only `SourceView`. `viewMode` is ephemeral UI state, not graph
 * data.
 */
export function GraphEditor() {
  const [viewMode, setViewMode] = useState<ViewMode>("canvas");
  const control = useHostedControl();
  const hostedPersistence = useMemo(
    () => (control.mode === "hosted" ? new HostedGraphPersistence(control.request) : null),
    [control.mode, control.request],
  );
  const persistence = useGraphPersistence(
    hostedPersistence === null ? {} : { persistence: hostedPersistence },
  );

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <GraphToolbar viewMode={viewMode} onViewModeChange={setViewMode} persistence={persistence} />
      {control.mode === "hosted" ? (
        <div className="border-b bg-blue-50 px-4 py-2 text-xs text-blue-950 dark:bg-blue-950/30 dark:text-blue-100">
          Hosted canonical graph editing. Validation, catalogs, deployment previews, and run
          controls arrive in the next focused steps; this view never contacts a loopback Dander
          service.
        </div>
      ) : (
        <LoopbackOperations persistence={persistence} />
      )}
      <div className="min-h-0 flex-1">
        {viewMode === "canvas" ? <PipelineCanvas /> : <SourceView />}
      </div>
    </div>
  );
}

function LoopbackOperations({
  persistence,
}: {
  persistence: ReturnType<typeof useGraphPersistence>;
}) {
  const operations = useGraphOperations({
    revision: persistence.revision,
    graphIsClean: persistence.status === "clean",
  });

  return (
    <>
      <GraphOperationsBar operations={operations} />
      <div
        className="border-b bg-amber-50 px-4 py-2 text-xs text-amber-950 dark:bg-amber-950/30 dark:text-amber-100"
        role="status"
      >
        PipelineGraph editor. Dander validates and writes an explicitly served graph file;
        dander.yaml imports remain detached previews. Candidate planning is explicit, pushes only a
        source-free image, and cannot apply its temporary Terraform plan.
      </div>
    </>
  );
}
