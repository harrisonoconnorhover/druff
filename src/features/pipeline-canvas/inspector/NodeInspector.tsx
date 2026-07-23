"use client";

import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { NodeConfigEditor } from "@/features/pipeline-canvas/inspector/NodeConfigEditor";
import { configToEntries, entriesToConfig } from "@/features/pipeline-canvas/inspector/nodeConfig";
import { NODE_KINDS } from "@/features/pipeline-canvas/nodes/nodeKinds";
import { getConnector } from "@/features/connector-library/registry";
import { validateConnectorConfig } from "@/features/connector-library/validateConnectorConfig";
import { ConnectorConfigForm } from "@/features/connector-library/ConnectorConfigForm";
import { selectSelectedNode, useGraphStore } from "@/lib/graph-store";

/**
 * The node property panel (DRUFF-3): a pure projection of the graph store (DRUFF-1), not a copy
 * of it. It derives *which* node to show from `selectSelectedNode` and writes every edit straight
 * back through `updateNodeData` — there is no local `useState` mirror of a node's fields, so the
 * panel can never drift from what the canvas renders (AC4). Because `PipelineNode` renders from
 * the same store `nodes`, a name/config edit made here re-renders the canvas node with no extra
 * plumbing (AC2/AC3).
 *
 * Always mounted as a fixed-width sibling of the canvas; renders an empty state rather than
 * unmounting when there's no single node selected (zero, or a multi-select), so the layout doesn't
 * reflow on every click (AC1).
 *
 * When the selected node carries a `connectorId` (DRUFF-6), its descriptor is resolved from the
 * connector registry and the Config section renders the descriptor-driven `ConnectorConfigForm`
 * (with `validateConnectorConfig`'s required-field errors) instead of the generic `NodeConfigEditor`
 * — the same `config`-in/`onChange`-out seam, so this swap is the only thing that changes.
 */
export function NodeInspector() {
  const node = useGraphStore(selectSelectedNode);
  const updateNodeData = useGraphStore((state) => state.updateNodeData);

  if (!node) {
    return (
      <aside className="flex w-80 shrink-0 flex-col border-l bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          Select a single node to view and edit its properties.
        </p>
      </aside>
    );
  }

  const kindLabel = NODE_KINDS[node.data.kind].label;
  const connector = node.data.connectorId ? getConnector(node.data.connectorId) : undefined;
  // Coerces the node's live `config` (`Record<string, unknown> | undefined`) into the string-keyed
  // record `ConnectorConfigForm`/`validateConnectorConfig` expect, reusing `NodeConfigEditor`'s
  // already-tested key/value mapping rather than duplicating the string-coercion logic here.
  const stringConfig = entriesToConfig(configToEntries(node.data.config));

  return (
    <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l bg-muted/30 p-4">
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

      <div className="flex flex-col gap-1.5">
        <Label>Config</Label>
        {connector ? (
          <ConnectorConfigForm
            descriptor={connector}
            config={stringConfig}
            errors={validateConnectorConfig(connector, stringConfig)}
            onChange={(key, value) =>
              updateNodeData(node.id, { config: { ...stringConfig, [key]: value } })
            }
          />
        ) : (
          // `key={node.id}` remounts the editor (and so resets its local row list) whenever the
          // selected node changes, instead of the editor reacting to `config` prop changes itself —
          // see NodeConfigEditor's doc comment for why.
          <NodeConfigEditor
            key={node.id}
            config={node.data.config}
            onChange={(config) => updateNodeData(node.id, { config })}
          />
        )}
      </div>
    </aside>
  );
}
