"use client";

import { useSyncExternalStore } from "react";
import {
  NODE_KINDS,
  PIPELINE_NODE_KINDS,
  isPipelineNodeKind,
} from "@/features/pipeline-canvas/nodes/nodeKinds";
import { getConnectorSnapshot, subscribeConnectors } from "@/features/connector-library/registry";
import { ConnectorCatalogDialog } from "@/features/connector-library/ConnectorCatalogDialog";
import { cn } from "@/lib/utils";
import type { PipelineNodeKind } from "@/lib/pipeline-graph";

/**
 * MIME type used to carry a dragged palette item's payload on the native HTML5 `dataTransfer`
 * channel. A dedicated (non-generic) type keeps a drop from picking up unrelated drag data (e.g.
 * dragged text/files) — `Canvas.onDrop` still guards via `parsePaletteDragPayload`.
 */
export const DND_MIME = "application/druff-node-kind";

/**
 * What a palette drag carries, JSON-serialized under `DND_MIME`. `connectorId` (DRUFF-6) is present
 * only when the dragged item is a pre-made connector entry, not a plain kind entry — a generic
 * Source/Transform/Write/Trigger drag omits it entirely.
 */
export type PaletteDragPayload = {
  kind: PipelineNodeKind;
  connectorId?: string;
};

/** Serializes a palette item's drag payload for `dataTransfer.setData`. */
export function encodePaletteDragPayload(payload: PaletteDragPayload): string {
  return JSON.stringify(payload);
}

/**
 * Parses a `dataTransfer` payload back into a `PaletteDragPayload`. Returns `null` for anything
 * malformed, non-JSON, or carrying an unrecognized `kind` (e.g. unrelated drag data such as dragged
 * text/files, or a stale payload from an older palette build) so a drop can safely ignore it rather
 * than creating a malformed node.
 */
export function parsePaletteDragPayload(raw: string): PaletteDragPayload | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (parsed === null || typeof parsed !== "object" || !("kind" in parsed)) return null;
  const { kind, connectorId } = parsed as { kind: unknown; connectorId?: unknown };
  if (!isPipelineNodeKind(kind)) return null;
  return { kind, connectorId: typeof connectorId === "string" ? connectorId : undefined };
}

/**
 * Sidebar listing the four draggable generic pipeline node kinds plus every registered pre-made
 * connector (DRUFF-6, e.g. Greenhouse) as additional source entries. Presentational and stateless
 * — it does not touch the graph store or React Flow directly. Its entire contract with the canvas
 * is "emit a `PaletteDragPayload` on the drag event"; `PipelineCanvas`'s drop handler does the rest.
 * Native HTML5 drag-and-drop (rather than shared React/store state) is what lets this component
 * live outside the canvas's `ReactFlowProvider`.
 */
export function NodePalette() {
  const connectors = useSyncExternalStore(
    subscribeConnectors,
    getConnectorSnapshot,
    getConnectorSnapshot,
  );
  return (
    <aside className="flex w-48 shrink-0 flex-col gap-2 border-r bg-muted/30 p-3">
      <h2 className="px-1 text-xs font-semibold text-muted-foreground uppercase">Node palette</h2>
      <ul className="flex flex-col gap-2">
        {PIPELINE_NODE_KINDS.map((kind) => {
          const { label, icon: Icon, accent } = NODE_KINDS[kind];
          return (
            <li key={kind}>
              <div
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(DND_MIME, encodePaletteDragPayload({ kind }));
                  event.dataTransfer.effectAllowed = "move";
                }}
                className={cn(
                  "flex cursor-grab items-center gap-2 rounded-md border border-l-4 bg-card px-3 py-2 text-sm shadow-sm active:cursor-grabbing",
                  accent,
                )}
              >
                <Icon className="size-4 text-muted-foreground" />
                <span>{label}</span>
              </div>
            </li>
          );
        })}
      </ul>

      <h2 className="px-1 pt-2 text-xs font-semibold text-muted-foreground uppercase">
        Connectors
      </h2>
      <ConnectorCatalogDialog />
      <ul className="flex flex-col gap-2">
        {connectors.map((connector) => {
          const { icon: KindIcon, accent } = NODE_KINDS[connector.kind];
          const Icon = connector.icon ?? KindIcon;
          return (
            <li key={connector.id}>
              <div
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(
                    DND_MIME,
                    encodePaletteDragPayload({ kind: connector.kind, connectorId: connector.id }),
                  );
                  event.dataTransfer.effectAllowed = "move";
                }}
                className={cn(
                  "flex cursor-grab items-center gap-2 rounded-md border border-l-4 bg-card px-3 py-2 text-sm shadow-sm active:cursor-grabbing",
                  accent,
                )}
              >
                <Icon className="size-4 text-muted-foreground" />
                <span>{connector.name}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
