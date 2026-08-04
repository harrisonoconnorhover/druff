import type { Node } from "@xyflow/react";
import {
  defaultTypeForKind,
  type PipelineNodeData,
  type PipelineNodeKind,
} from "@/lib/pipeline-graph";
import { NODE_KINDS } from "@/features/pipeline-canvas/nodes/nodeKinds";
import { getConnector } from "@/features/connector-library/registry";
import { defaultConfigForDescriptor } from "@/features/connector-library/defaultConfig";

/**
 * Pure factory turning a node `kind` + drop `position` into a fully-formed pipeline-graph node.
 * Takes `id` as a parameter rather than generating one so it stays deterministic under unit tests
 * with no `crypto` mocking; the only real id-minting (`crypto.randomUUID()`) happens at the single
 * drop call site in `PipelineCanvas`, keeping this factory free of side effects and store access.
 *
 * `type` is seeded from `kind` via `defaultTypeForKind` (DRUFF-4's `TYPE_TO_KIND` table, inverted)
 * — a freshly-dropped node has no upstream Dander graph to derive `type` from, so it gets a
 * sensible default token consistent with the kind the user picked in the palette. `config`/
 * `fields` are left unset (rather than `{}`/`[]`) so a brand-new node behaves exactly like the
 * pre-DRUFF-4 placeholder shape until the inspector (DRUFF-3) populates them.
 *
 * `connectorId` (DRUFF-6) is set when the palette item dragged was a pre-made connector rather than
 * a plain kind; when it resolves to a registered descriptor, the node's `data.connectorId` is set
 * and `config` is seeded via `defaultConfigForDescriptor` (fully-keyed, all-empty — never a real
 * secret default). An unresolvable/unknown `connectorId` is ignored rather than thrown on, so a
 * stale palette payload degrades to a plain node instead of failing the drop.
 */
export function createNode(
  kind: PipelineNodeKind,
  position: { x: number; y: number },
  id: string,
  connectorId?: string,
): Node<PipelineNodeData> {
  const connector = connectorId ? getConnector(connectorId) : undefined;
  return {
    id,
    type: "pipelineNode",
    position,
    data: {
      name: NODE_KINDS[kind].defaultLabel,
      type: defaultTypeForKind(kind),
      kind,
      ...(connector && {
        connectorId: connector.id,
        config: defaultConfigForDescriptor(connector),
        ...(connector.outputFields && { fields: connector.outputFields }),
      }),
    },
  };
}
