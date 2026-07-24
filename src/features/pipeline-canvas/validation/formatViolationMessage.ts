import type { Violation } from "@/lib/pipeline-graph";

/**
 * A human label for a field-reference kind, shared by `unknown-field-reference`'s three
 * discriminants and reused (narrowed) for `join-key-field`'s two.
 */
const REFERENCE_KIND_LABEL: Record<
  "mapping_source" | "mapping_target" | "transformation_input" | "join_left" | "join_right",
  string
> = {
  mapping_source: "mapping source",
  mapping_target: "mapping target",
  transformation_input: "transformation input",
  join_left: "join key, left",
  join_right: "join key, right",
};

/**
 * Renders one actionable, structural sentence per `Violation` (AC3). Interpolates only the
 * structural fields `Violation` carries — kind, node ids, edge endpoint ids, field name, join-key
 * index, reference kind — and nothing else, so this is *structurally incapable* of leaking a
 * node's `config`, a field's/edge's `metadata`, a field value, or a transformation's
 * `expression`/`constant` payload (DRUFF-15 already guarantees none of those reach a `Violation`
 * object; this function has no other data to draw from).
 */
export function formatViolationMessage(violation: Violation): string {
  switch (violation.kind) {
    case "duplicate-node-id":
      return `Node id "${violation.nodeId}" is used by more than one node.`;
    case "dangling-edge":
      return `Edge from "${violation.edge.from}" to "${violation.edge.to}" references missing node "${violation.missingId}".`;
    case "self-loop":
      return `Node "${violation.nodeId}" has an edge that connects to itself.`;
    case "graph-cycle":
      return `Cycle detected: ${violation.cycle.join(" → ")}.`;
    case "duplicate-field-name":
      return `Node "${violation.nodeId}" declares field "${violation.fieldName}" more than once.`;
    case "unknown-field-reference":
      return `Field "${violation.fieldName}" is not declared on node "${violation.nodeId}" (${REFERENCE_KIND_LABEL[violation.referenceKind]}).`;
    case "join-key-field":
      return `Field "${violation.fieldName}" is not declared on node "${violation.nodeId}" (join key #${violation.keyIndex + 1}, ${REFERENCE_KIND_LABEL[violation.referenceKind]}).`;
  }
}
