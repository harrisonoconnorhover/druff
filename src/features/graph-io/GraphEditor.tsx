"use client";

import { useState } from "react";
import { GraphToolbar, type ViewMode } from "@/features/graph-io/GraphToolbar";
import { SourceView } from "@/features/graph-io/SourceView";
import { useGraphPersistence } from "@/features/graph-io/useGraphPersistence";
import { PipelineCanvas } from "@/features/pipeline-canvas/PipelineCanvas";

/**
 * Top-level container for DRUFF-5: owns which half (`canvas` | `source`) is showing, wires up
 * localStorage hydrate/autosave via `useGraphPersistence`, and renders `GraphToolbar` above either
 * `PipelineCanvas` or the read-only `SourceView`. `viewMode` is local `useState` — ephemeral UI
 * state, not graph data — per this ticket's Design.
 */
export function GraphEditor() {
  const [viewMode, setViewMode] = useState<ViewMode>("canvas");
  useGraphPersistence();

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <GraphToolbar viewMode={viewMode} onViewModeChange={setViewMode} />
      <div
        className="border-b bg-amber-50 px-4 py-2 text-xs text-amber-950 dark:bg-amber-950/30 dark:text-amber-100"
        role="status"
      >
        Local authoring preview only. Importing dander.yaml creates an editable Druff draft; Druff
        does not deploy or write changes back to Dander.
      </div>
      <div className="min-h-0 flex-1">
        {viewMode === "canvas" ? <PipelineCanvas /> : <SourceView />}
      </div>
    </div>
  );
}
