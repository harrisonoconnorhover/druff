/**
 * Structured output contract for `graph-validation.ts`'s pure structural + field-wiring checks.
 * Mirrors Dander's `graph_ops`/`errors.py` error-type names (see `../dander/src/dander/pipeline/
 * errors.py`) as a discriminated union rather than a thrown exception hierarchy, so a validator
 * can collect every violation in a graph instead of raising on the first (DRUFF-15 Design:
 * "Collect violations, don't raise-on-first").
 *
 * Every field here is graph **structure only** — node ids, edge endpoint ids, field names, a
 * join-key index, a reference-kind discriminant — per `steering/01-security.md` and Dander's own
 * `errors.py` rule. Nothing here ever carries a node's `config`, a field's/edge's `metadata`, a
 * field value, or a transformation's `expression`/`constant` payload.
 */

/**
 * Where a field reference that failed to resolve originated (mirrors Dander's
 * `FieldReferenceKind`).
 */
export type FieldReferenceKind =
  | "mapping_source" // FieldMapping.source, checked on the edge's `from` node
  | "mapping_target" // FieldMapping.target, checked on the edge's `to` node
  | "transformation_input" // Transformation.inputs entry, checked on the `from` node
  | "join_left" // JoinKeyPair.left, checked on the `from` node
  | "join_right"; // JoinKeyPair.right, checked on the `to` node

/**
 * Structural identity of an edge for attribution — endpoint ids plus its index in `graph.edges`.
 * `edgeIndex` goes beyond Dander's `(source, target)` tuple so a consumer (DRUFF-16) can
 * disambiguate parallel edges between the same two nodes; it lines up with DRUFF-4's canvas-edge
 * id scheme `${from}->${to}#${index}`.
 */
export type EdgeRef = { from: string; to: string; edgeIndex: number };

/**
 * A single detected violation of a `PipelineGraph`'s structural or field-wiring correctness.
 *
 * A discriminated union on `kind` (mirroring Dander's error-type names) rather than a thrown
 * exception, so `validateStructure`/`validateFieldWiring` can return every violation found in one
 * pass. Every variant carries only structural identifiers — never a sensitive payload.
 */
export type Violation =
  // ── structural, phase 1 ─────────────────────────────────────────────
  | { kind: "duplicate-node-id"; nodeId: string }
  | { kind: "dangling-edge"; edge: EdgeRef; missingId: string }
  | { kind: "self-loop"; nodeId: string; edge: EdgeRef }
  // ── structural, phase 2 ─────────────────────────────────────────────
  | { kind: "graph-cycle"; cycle: string[] } // node ids, start repeated at end: ["a","b","a"]
  // ── field-wiring, phase 3 ───────────────────────────────────────────
  | { kind: "duplicate-field-name"; nodeId: string; fieldName: string }
  | {
      kind: "unknown-field-reference";
      nodeId: string;
      fieldName: string;
      edge: EdgeRef;
      referenceKind: "mapping_source" | "mapping_target" | "transformation_input";
    }
  | {
      kind: "join-key-field";
      nodeId: string;
      fieldName: string;
      edge: EdgeRef;
      referenceKind: "join_left" | "join_right";
      keyIndex: number;
    };

/** The set of possible `Violation.kind` discriminant values. */
export type ViolationKind = Violation["kind"];
