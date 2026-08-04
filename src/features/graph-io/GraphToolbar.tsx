"use client";

import { useRef, type ChangeEvent } from "react";
import { Code2, Download, FolderOpen, LayoutGrid, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useGraphStore } from "@/lib/graph-store";
import { canvasToGraph, graphToCanvas, type GraphFormat } from "@/lib/pipeline-graph";
import { exportGraphToFile, parseImportedFile } from "@/lib/graph-io/graph-file";
import type { GraphPersistenceControls } from "@/features/graph-io/useGraphPersistence";

/** Which half of `GraphEditor` is currently showing. Ephemeral UI state — deliberately not part of
 * the graph store (`steering/02-engineering.md`: this is view state, not graph data). */
export type ViewMode = "canvas" | "source";

export type GraphToolbarProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  persistence: GraphPersistenceControls;
};

/**
 * Explicit Dander Open/Save, draft export, graph-or-manifest import, and canvas⇄source controls.
 * A `dander.yaml` takes the intentionally one-way manifest projection path and detaches from the
 * served graph before entering the canvas.
 *
 * Import failures raise a `sonner` error toast with `parseImportedFile`'s actionable message and
 * leave the current canvas untouched (no partial load), so a malformed file can't leave the editor
 * half-broken (AC4).
 */
export function GraphToolbar({ viewMode, onViewModeChange, persistence }: GraphToolbarProps) {
  const graphName = useGraphStore((state) => state.graphName);
  const graphTrigger = useGraphStore((state) => state.graphTrigger);
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const setGraph = useGraphStore((state) => state.setGraph);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport(format: GraphFormat): void {
    exportGraphToFile(canvasToGraph(nodes, edges, graphName, graphTrigger), format);
  }

  function handleImportClick(): void {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    // Reset so re-selecting the same filename still fires `onChange`.
    event.target.value = "";
    if (!file) return;

    const text = await file.text();
    const result = parseImportedFile(text, file.name);
    if (!result.ok) {
      toast.error("Could not import pipeline graph", { description: result.error });
      return;
    }

    const restored = graphToCanvas(
      result.graph,
      result.kind === "manifest-preview" ? result.positions : undefined,
    );
    persistence.detach();
    setGraph(restored.nodes, restored.edges, result.graph.name, result.graph.trigger);
    if (result.kind === "manifest-preview") {
      toast.success(
        `Loaded ${result.pipelineCount} hosted pipeline${result.pipelineCount === 1 ? "" : "s"} as a local draft`,
        { description: "No Dander files or cloud resources were changed." },
      );
    } else {
      toast.success(`Imported Druff draft "${result.graph.name}"`);
    }
  }

  return (
    <div className="flex items-center gap-2 border-b bg-background px-4 py-2">
      <Button
        variant="default"
        size="sm"
        disabled={persistence.status === "loading" || persistence.status === "saving"}
        onClick={() => void persistence.open()}
      >
        <FolderOpen /> Open from Dander
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={persistence.status !== "clean" && persistence.status !== "dirty"}
        onClick={() => void persistence.save()}
      >
        <Save /> Save to Dander
      </Button>
      <span
        className="text-xs text-muted-foreground"
        role="status"
        title={persistence.error ?? undefined}
      >
        {statusLabel(persistence)}
      </span>
      <Button variant="outline" size="sm" onClick={() => handleExport("yaml")}>
        <Download /> Export draft YAML
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport("json")}>
        <Download /> Export draft JSON
      </Button>
      <Button variant="outline" size="sm" onClick={handleImportClick}>
        <Upload /> Import graph or dander.yaml
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".yaml,.yml,.json"
        className="hidden"
        aria-label="Import Druff graph or Dander manifest file"
        onChange={(event) => {
          void handleFileSelected(event);
        }}
      />
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant={viewMode === "canvas" ? "secondary" : "ghost"}
          size="sm"
          aria-pressed={viewMode === "canvas"}
          onClick={() => onViewModeChange("canvas")}
        >
          <LayoutGrid /> Canvas
        </Button>
        <Button
          variant={viewMode === "source" ? "secondary" : "ghost"}
          size="sm"
          aria-pressed={viewMode === "source"}
          onClick={() => onViewModeChange("source")}
        >
          <Code2 /> Source
        </Button>
      </div>
    </div>
  );
}

function statusLabel(persistence: GraphPersistenceControls): string {
  switch (persistence.status) {
    case "disconnected":
      return "Local draft";
    case "loading":
      return "Opening…";
    case "clean":
      return "Saved";
    case "dirty":
      return "Unsaved changes";
    case "saving":
      return "Saving…";
    case "conflict":
      return "File changed elsewhere — reopen";
    case "error":
      return persistence.error ?? "Dander unavailable";
  }
}
