"use client";

import type { ChangeEvent } from "react";
import type { Node } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { NodeFieldsEditor } from "@/features/pipeline-canvas/inspector/NodeFieldsEditor";
import { resolveConfigCategories } from "@/features/pipeline-canvas/inspector/configCategories";
import { NODE_KINDS } from "@/features/pipeline-canvas/nodes/nodeKinds";
import { useGraphStore } from "@/lib/graph-store";
import type { PipelineNodeData } from "@/lib/pipeline-graph";

/** Props for {@link NodeInspector}. */
export type NodeInspectorProps = {
  /** The single selected node to inspect, resolved by the caller (`Inspector`, DRUFF-8) via
   * `resolveInspectorTarget` — this component is a pure prop-driven body, not a store reader. */
  node: Node<PipelineNodeData>;
};

/**
 * The node property panel's body (DRUFF-3, refactored into a body component by DRUFF-8): a pure
 * projection of the graph store (DRUFF-1), not a copy of it. It writes every edit straight back
 * through `updateNodeData` — there is no local `useState` mirror of a node's fields, so the panel
 * can never drift from what the canvas renders (AC4). Because `PipelineNode` renders from the same
 * store `nodes`, a name/config edit made here re-renders the canvas node with no extra plumbing
 * (AC2/AC3).
 *
 * Takes its `node` as a prop rather than deriving the selection itself — `Inspector` (DRUFF-8) owns
 * the always-mounted `<aside>` shell, the empty state, and the node-vs-edge selection routing, so
 * this component only ever renders when there is exactly one node to show.
 *
 * The Config section is routed through `resolveConfigCategories` (DRUFF-11): a config-driven
 * resolver maps the selected node to the ordered list of config categories/editors it should
 * render (e.g. the descriptor-driven connector form for a pre-made connector node, DRUFF-6, or the
 * generic key/value `NodeConfigEditor` as the last-resort fallback), so a new category (HTTP,
 * Trigger, custom-code — DRUFF-12/13/14) is a registration at that seam, not a new branch here.
 *
 * A third "Fields" section (DRUFF-7) sits below Config and edits `node.data.fields` the same way —
 * `NodeFieldsEditor`'s `fields`-in/`onChange`-out seam writing straight back through
 * `updateNodeData`. It's orthogonal to the connector-vs-generic Config branch above it and renders
 * for every node kind, since a connector node still declares a field schema.
 */
export function NodeInspector({ node }: NodeInspectorProps) {
  const updateNodeData = useGraphStore((state) => state.updateNodeData);

  const kindLabel = NODE_KINDS[node.data.kind].label;
  const categories = resolveConfigCategories(node);

  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase">{kindLabel} node</h2>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="node-inspector-name">Name</Label>
        <Input
          id="node-inspector-name"
          value={node.data.name}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateNodeData(node.id, { name: event.target.value })
          }
        />
      </div>

      <Separator />

      {/* `role="group"`/`aria-label` give this section (and Fields below) a distinct accessible
          name — both editors' "Add field" buttons are otherwise identically named, which would be
          ambiguous both to assistive tech and to `getByRole` queries once Config and Fields render
          side by side (DRUFF-7). */}
      <div className="flex flex-col gap-1.5" role="group" aria-label="Config">
        <Label>Config</Label>
        {categories.map((category) => (
          // Key includes `node.id` so a category's editor (and any local state it holds, e.g.
          // `NodeConfigEditor`'s row list) remounts per selected node, as before this ticket; also
          // includes `category.id` so a change in the matched set for the same node remounts too.
          <div key={`${node.id}:${category.id}`} className="flex flex-col gap-1.5">
            {categories.length > 1 && (
              <p className="text-xs font-medium text-muted-foreground">{category.label}</p>
            )}
            <category.Editor
              node={node}
              onConfigChange={(config) => updateNodeData(node.id, { config })}
            />
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex flex-col gap-1.5" role="group" aria-label="Fields">
        <Label>Fields</Label>
        {/* `key={node.id}` remounts the editor per node — see NodeConfigEditor's doc comment for
            why this local-row-mirror pattern resets this way rather than reacting to prop changes. */}
        <NodeFieldsEditor
          key={node.id}
          fields={node.data.fields}
          onChange={(fields) => updateNodeData(node.id, { fields })}
        />
      </div>
    </div>
  );
}
