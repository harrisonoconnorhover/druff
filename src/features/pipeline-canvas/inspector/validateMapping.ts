import type { FieldMapping } from "@/lib/pipeline-graph/schema";

/**
 * Actionable, field-anchored validation error for one `FieldMapping` — the **shape** rules
 * Dander's `FieldMapping`/`Transformation` model itself enforces, surfaced inline instead of a
 * crash (DRUFF-9 AC4). Deliberately *not* semantic field-wiring validation (does a `source`/
 * `target` name actually resolve on the connected node) — that stays Dander's `graph_ops` job, per
 * DRUFF-4's "Out of scope" note and this ticket's Design.
 *
 * `field` mirrors `validateConnectorConfig`'s error shape (a discriminant a caller can key
 * per-control messages off of) rather than a bare string, so `MappingRow` can anchor each message
 * to the control it's about.
 */
export type MappingError = {
  field: "target" | "source" | "transformation" | "expression";
  message: string;
};

/**
 * Validates one mapping's shape, returning zero or more actionable errors. Every rule below is a
 * *shape* rule the Dander model enforces — none of it inspects whether `source`/`target` resolve
 * against a real node's declared fields.
 */
export function validateMapping(mapping: FieldMapping): MappingError[] {
  const errors: MappingError[] = [];

  if (mapping.target.trim() === "") {
    errors.push({ field: "target", message: "Every mapping must write a target field." });
  }

  const hasSource = mapping.source !== null && mapping.source.trim() !== "";
  const transformation = mapping.transformation;

  // The source-or-transformation rule: a derived mapping (no source) must carry a transformation
  // to derive its value from. Any transformation object counts here, including a `constant`
  // transformation whose literal happens to be `null` — that's a deliberate, explicit "derive as
  // null," not "nothing provided."
  if (!hasSource && !transformation) {
    errors.push({
      field: "source",
      message: "A derived mapping (no source) needs an expression or constant.",
    });
  }

  if (transformation) {
    // Mutual exclusion, checked defensively for imported graphs that didn't go through
    // `setTransformationKind`'s normalizer (which never produces this state on its own): both an
    // `expression` and a (non-null, i.e. actually-authored) `constant` present at once.
    const hasExpression = transformation.expression !== null && transformation.expression !== "";
    const hasConstant = transformation.constant !== null;
    if (hasExpression && hasConstant) {
      errors.push({
        field: "transformation",
        message: "A transformation is either an expression or a constant, not both.",
      });
    }

    if (transformation.kind === "expression" && (transformation.expression ?? "").trim() === "") {
      errors.push({ field: "expression", message: "Expression can't be empty." });
    }
  }

  return errors;
}

/** Validates an ordered list of mappings, keyed by index, for the list-level render — an index
 * absent from the result has no errors. */
export function validateMappings(mappings: FieldMapping[]): Record<number, MappingError[]> {
  const errors: Record<number, MappingError[]> = {};
  mappings.forEach((mapping, index) => {
    const mappingErrors = validateMapping(mapping);
    if (mappingErrors.length > 0) errors[index] = mappingErrors;
  });
  return errors;
}
