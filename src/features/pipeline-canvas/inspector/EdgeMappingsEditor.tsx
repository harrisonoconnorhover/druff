"use client";

import { Plus } from "lucide-react";
import type { Edge, Node } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import {
  addMapping,
  moveMapping,
  removeMapping,
  setConstant,
  setExpression,
  setMappingField,
  setTransformationKind,
} from "@/features/pipeline-canvas/inspector/edgeMappings";
import { MappingRow } from "@/features/pipeline-canvas/inspector/MappingRow";
import { validateMapping } from "@/features/pipeline-canvas/inspector/validateMapping";
import { useGraphStore } from "@/lib/graph-store";
import type { PipelineEdgeData, PipelineNodeData } from "@/lib/pipeline-graph";
import type { FieldMapping, NodeField, TransformationKind } from "@/lib/pipeline-graph/schema";

/** Props for {@link EdgeMappingsEditor}. */
export type EdgeMappingsEditorProps = {
  /** The single selected edge to inspect, resolved by the caller (`EdgeInspector`, DRUFF-8) — this
   * component is a store-connected category container, not a store reader for edge *selection*
   * itself (mirrors `NodeInspector`'s relationship to `Inspector`). */
  edge: Edge<PipelineEdgeData>;
};

/**
 * The edge inspector's "Mappings" category (DRUFF-9): the authoring UI over the selected edge's
 * ordered `FieldMapping[]`. A pure projection of the graph store, not a copy of it — reads
 * `edge.data.mappings` and the two endpoint nodes' declared fields, renders one `MappingRow` per
 * mapping, and writes every edit straight back through `updateEdgeData(edge.id, { mappings })`.
 * There is no local `useState` mirror of the mapping array, so this panel can never drift from the
 * canvas — the same invariant `NodeInspector`/`EdgeInspector` already document.
 *
 * Endpoint fields are resolved inline (rather than via a separate exported selector) — this
 * ticket's Design offered either; inline keeps the lookup colocated with its only caller.
 */
export function EdgeMappingsEditor({ edge }: EdgeMappingsEditorProps) {
  const nodes = useGraphStore((state) => state.nodes);
  const updateEdgeData = useGraphStore((state) => state.updateEdgeData);

  const mappings = edge.data?.mappings ?? [];
  const sourceFields = fieldsForNode(edge.source, nodes);
  const targetFields = fieldsForNode(edge.target, nodes);

  function commit(next: FieldMapping[]): void {
    updateEdgeData(edge.id, { mappings: next });
  }

  return (
    <div className="flex flex-col gap-2">
      {mappings.length === 0 && (
        <p className="text-xs text-muted-foreground">No field mappings yet.</p>
      )}
      {mappings.map((mapping, index) => (
        // Index as key: `MappingRow` is fully controlled by its props with no local state of its
        // own (unlike `NodeFieldsEditor`'s `FieldRow`), so a reorder just updates the props at each
        // existing position rather than needing a stable identity to remount around — see
        // `edgeMappings.ts`'s doc comment.
        <MappingRow
          key={index}
          mapping={mapping}
          sourceFields={sourceFields}
          targetFields={targetFields}
          errors={validateMapping(mapping)}
          isFirst={index === 0}
          isLast={index === mappings.length - 1}
          onTargetChange={(target) => commit(setMappingField(mappings, index, { target }))}
          onSourceChange={(source) => commit(setMappingField(mappings, index, { source }))}
          onKindChange={(kind: TransformationKind) =>
            commit(setTransformationKind(mappings, index, kind))
          }
          onExpressionChange={(expression) => commit(setExpression(mappings, index, expression))}
          onConstantChange={(value) => commit(setConstant(mappings, index, value))}
          onRemove={() => commit(removeMapping(mappings, index))}
          onMove={(direction) => commit(moveMapping(mappings, index, direction))}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => commit(addMapping(mappings))}
      >
        <Plus />
        Add mapping
      </Button>
    </div>
  );
}

/** Resolves a node id to its declared `fields`, defaulting to `[]` for an unresolved id (e.g. a
 * dangling edge endpoint) or a node with no declared fields yet — the vocabulary the source/target
 * pickers resolve against (DRUFF-7). */
function fieldsForNode(nodeId: string, nodes: Node<PipelineNodeData>[]): NodeField[] {
  return nodes.find((node) => node.id === nodeId)?.data.fields ?? [];
}
