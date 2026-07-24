"use client";

import type { Edge, Node } from "@xyflow/react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { EdgeMappingsEditor } from "@/features/pipeline-canvas/inspector/EdgeMappingsEditor";
import { JoinEditor } from "@/features/pipeline-canvas/inspector/JoinEditor";
import { edgeEndpointNames } from "@/features/pipeline-canvas/inspector/inspectorTarget";
import { useGraphStore } from "@/lib/graph-store";
import type { PipelineEdgeData, PipelineNodeData } from "@/lib/pipeline-graph";
import type { NodeField } from "@/lib/pipeline-graph/schema";

/** Props for {@link EdgeInspector}. */
export type EdgeInspectorProps = {
  /** The single selected edge to inspect, resolved by the caller (`Inspector`, DRUFF-8) via
   * `resolveInspectorTarget` — this component is a pure prop-driven body, not a store reader. */
  edge: Edge<PipelineEdgeData>;
};

/**
 * The edge property panel's body — the **edge-inspection foundation** DRUFF-8 added alongside the
 * node inspector. Shows the edge's identity (its source/`from` and target/`to` nodes, by name with
 * id fallback), the "Mappings" category (DRUFF-9's `EdgeMappingsEditor`, the field-mapping editor),
 * and the "Join" category (DRUFF-10's `JoinEditor`, the optional join-spec editor).
 *
 * Reads the store's live `nodes` (not a prop) to resolve endpoint names via `edgeEndpointNames`,
 * so a node rename is reflected here with no extra plumbing, the same way `PipelineNode` picks up
 * store changes automatically.
 */
export function EdgeInspector({ edge }: EdgeInspectorProps) {
  const nodes = useGraphStore((state) => state.nodes);
  const updateEdgeData = useGraphStore((state) => state.updateEdgeData);
  const { from, to } = edgeEndpointNames(edge, nodes);

  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase">Connection</h2>

      <div className="flex flex-col gap-1.5">
        <Label>From</Label>
        <p className="text-sm">
          {from.name} <span className="text-xs text-muted-foreground">({from.id})</span>
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>To</Label>
        <p className="text-sm">
          {to.name} <span className="text-xs text-muted-foreground">({to.id})</span>
        </p>
      </div>

      <Separator />

      <div className="flex flex-col gap-1.5" role="group" aria-label="Mappings">
        <Label>Mappings</Label>
        <EdgeMappingsEditor edge={edge} />
      </div>

      <Separator />

      <div className="flex flex-col gap-1.5" role="group" aria-label="Join">
        <Label>Join</Label>
        <JoinEditor
          join={edge.data?.join}
          leftFields={fieldsForNode(edge.source, nodes)}
          rightFields={fieldsForNode(edge.target, nodes)}
          onChange={(join) => updateEdgeData(edge.id, { join })}
        />
      </div>
    </div>
  );
}

/** Resolves a node id to its declared `fields`, defaulting to `[]` for an unresolved id (e.g. a
 * dangling edge endpoint) or a node with no declared fields yet — same resolution
 * `EdgeMappingsEditor` uses for the Mappings category's field vocabulary. */
function fieldsForNode(nodeId: string, nodes: Node<PipelineNodeData>[]): NodeField[] {
  return nodes.find((node) => node.id === nodeId)?.data.fields ?? [];
}
