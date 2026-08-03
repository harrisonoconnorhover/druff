"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { useGraphStore } from "@/lib/graph-store";
import { canvasToGraph, encodeGraph, type GraphFormat } from "@/lib/pipeline-graph";

/**
 * Read-only YAML/JSON view of the current canvas, re-derived from the graph store on every render
 * via the same `canvasToGraph` → `encodeGraph` path explicit Save uses, so it reflects the live
 * canvas rather than a snapshot taken at mount time (AC3). Editing source back into the canvas is
 * out of scope for this ticket (see the ticket's Design, "Flags" #4) — `decodeGraph` already exists
 * for that seam if a future ticket adds it.
 */
export function SourceView() {
  const graphName = useGraphStore((state) => state.graphName);
  const graphTrigger = useGraphStore((state) => state.graphTrigger);
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const [format, setFormat] = useState<GraphFormat>("yaml");

  const source = encodeGraph(canvasToGraph(nodes, edges, graphName, graphTrigger), format);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b px-4 py-2">
        <span className="mr-auto text-xs text-muted-foreground">
          Canonical PipelineGraph — not deployable dander.yaml
        </span>
        <Button
          variant={format === "yaml" ? "secondary" : "ghost"}
          size="sm"
          aria-pressed={format === "yaml"}
          onClick={() => setFormat("yaml")}
        >
          YAML
        </Button>
        <Button
          variant={format === "json" ? "secondary" : "ghost"}
          size="sm"
          aria-pressed={format === "json"}
          onClick={() => setFormat("json")}
        >
          JSON
        </Button>
      </div>
      <div className="min-h-0 flex-1">
        <Editor
          // Remounts the editor model on a format switch instead of Monaco diffing YAML text
          // against a stale JSON model (or vice versa).
          key={format}
          language={format}
          value={source}
          options={{ readOnly: true, minimap: { enabled: false }, domReadOnly: true }}
        />
      </div>
    </div>
  );
}
