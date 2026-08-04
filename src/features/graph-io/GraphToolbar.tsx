"use client";

import { useRef, useState, type ChangeEvent } from "react";
import {
  Cloud,
  CloudDownload,
  CloudUpload,
  Code2,
  Download,
  LayoutGrid,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useGraphStore } from "@/lib/graph-store";
import {
  canvasToGraph,
  graphToCanvas,
  withVisualPositions,
  type GraphFormat,
} from "@/lib/pipeline-graph";
import { exportGraphToFile, parseImportedFile } from "@/lib/graph-io/graph-file";
import { LocalStorageGraphPersistence } from "@/lib/persistence/graph-persistence";
import {
  DEFAULT_DANDER_GRAPH_URL,
  openDanderGraph,
  saveDanderGraph,
  type DanderGraphErrorDetail,
} from "@/lib/persistence/dander-graph-client";

/** The bridge origin `dander graph serve` binds to by default; overridable for a non-default
 *  `--port`/host via `NEXT_PUBLIC_DANDER_GRAPH_URL` (see `.env.example`). */
const DANDER_GRAPH_URL = process.env.NEXT_PUBLIC_DANDER_GRAPH_URL ?? DEFAULT_DANDER_GRAPH_URL;

/** Which half of `GraphEditor` is currently showing. Ephemeral UI state — deliberately not part of
 * the graph store (`steering/02-engineering.md`: this is view state, not graph data). */
export type ViewMode = "canvas" | "source";

export type GraphToolbarProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

/**
 * Export / import / clear-saved / canvas⇄source controls for `GraphEditor`. Export and import both
 * go through the single DRUFF-4 serialization path (`canvasToGraph`/`graphToCanvas` +
 * `encodeGraph`/`decodeGraph` via `graph-file.ts`) — there is no second ad hoc encoder here.
 *
 * Import failures raise a `sonner` error toast with `parseImportedFile`'s actionable message and
 * leave the current canvas untouched (no partial load), so a malformed file can't leave the editor
 * half-broken (AC4).
 */
export function GraphToolbar({ viewMode, onViewModeChange }: GraphToolbarProps) {
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const setGraph = useGraphStore((state) => state.setGraph);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // The revision (Dander's ETag) from the last successful open/save against the Dander graph
  // bridge. `null` means "never opened this session" — `handleSaveToDander` refuses to save
  // without one rather than guessing, since the bridge's optimistic-concurrency contract requires
  // a real prior revision (`dander-graph-client.ts`). Session-local UI state, not graph data — same
  // reasoning as `viewMode` in `GraphEditor` (`steering/02-engineering.md`).
  const [danderRevision, setDanderRevision] = useState<string | null>(null);
  const [danderBusy, setDanderBusy] = useState(false);

  function handleExport(format: GraphFormat): void {
    exportGraphToFile(canvasToGraph(nodes, edges), format);
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

    const restored = graphToCanvas(result.graph);
    setGraph(restored.nodes, restored.edges);
    toast.success(`Imported "${result.graph.name}"`);
  }

  function handleClearSaved(): void {
    // Constructed inline (not module-scope) so `window.localStorage` is only ever touched from
    // this client-only click handler — see `useGraphPersistence`'s doc comment for why.
    new LocalStorageGraphPersistence().clear();
    toast.success("Cleared the locally-saved graph.");
  }

  async function handleOpenFromDander(): Promise<void> {
    setDanderBusy(true);
    try {
      const result = await openDanderGraph(DANDER_GRAPH_URL);
      if (!result.ok) {
        toast.error("Could not open the graph from Dander", {
          description: describeDanderFailure(result.error, result.details),
        });
        return;
      }
      const restored = graphToCanvas(result.graph);
      setGraph(restored.nodes, restored.edges);
      setDanderRevision(result.revision);
      toast.success(`Opened "${result.graph.name}" from Dander`);
    } finally {
      setDanderBusy(false);
    }
  }

  async function handleSaveToDander(): Promise<void> {
    if (danderRevision === null) {
      toast.error("Open the graph from Dander first", {
        description:
          "Saving requires the revision from the last open, per Dander's conflict check.",
      });
      return;
    }

    setDanderBusy(true);
    try {
      const graph = withVisualPositions(canvasToGraph(nodes, edges), nodes);
      const result = await saveDanderGraph(graph, danderRevision, DANDER_GRAPH_URL);
      if (!result.ok) {
        toast.error("Could not save the graph to Dander", {
          description: describeDanderFailure(result.error, result.details),
        });
        return;
      }
      setDanderRevision(result.revision);
      toast.success("Saved to Dander");
    } finally {
      setDanderBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2 border-b bg-background px-4 py-2">
      <Button variant="outline" size="sm" onClick={() => handleExport("yaml")}>
        <Download /> Export YAML
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport("json")}>
        <Download /> Export JSON
      </Button>
      <Button variant="outline" size="sm" onClick={handleImportClick}>
        <Upload /> Import
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".yaml,.yml,.json"
        className="hidden"
        aria-label="Import pipeline graph file"
        onChange={(event) => {
          void handleFileSelected(event);
        }}
      />
      <Button variant="ghost" size="sm" onClick={handleClearSaved}>
        <Trash2 /> Clear saved
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={danderBusy}
        onClick={() => {
          void handleOpenFromDander();
        }}
      >
        <CloudDownload /> Open from Dander
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={danderBusy || danderRevision === null}
        onClick={() => {
          void handleSaveToDander();
        }}
      >
        <CloudUpload /> Save to Dander
      </Button>
      {danderRevision !== null && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Cloud className="size-3.5" /> connected
        </span>
      )}

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

/** Formats a Dander graph-bridge failure into a toast description: the top-level message, plus
 *  Dander's per-field `details` (if any) joined one-per-line — never a raw stack trace. */
function describeDanderFailure(error: string, details?: DanderGraphErrorDetail[]): string {
  if (!details || details.length === 0) return error;
  const lines = details.map((detail) => `${detail.location || "(graph)"}: ${detail.message}`);
  return `${error}\n${lines.join("\n")}`;
}
