import type { FieldMapping, Transformation, TransformationKind } from "@/lib/pipeline-graph/schema";

/**
 * Pure, immutable edit operations over an edge's ordered `mappings: FieldMapping[]` (Dander's
 * `FieldMapping`/`Transformation` shape), mirroring `nodeFields.ts`'s role for the node inspector's
 * Fields section: kept free of React and the store so the non-trivial parts — reordering and the
 * transformation-kind normalization that keeps every produced object schema-valid — are
 * unit-testable without rendering anything (DRUFF-9 AC6).
 *
 * Unlike `nodeFields.ts`'s `FieldRow`, no client-only row-id wrapper is introduced here: `MappingRow`
 * (the presentational component built on top of this module) is fully controlled by its props with
 * no local per-row state of its own, so a plain array index is a safe, sufficient React key — a
 * reorder just changes the props at each existing position rather than remounting anything, unlike
 * `NodeFieldsEditor`'s row list which *does* carry per-row local `useState`.
 */

/** A freshly-added mapping's contents: no source (derived, unset), no transformation (`direct`
 * by construction until the user picks otherwise), and an empty tag bag — matching Dander's own
 * `FieldMapping` defaults. `target` is left blank for the user to pick from the target node's
 * declared fields. */
function newMapping(): FieldMapping {
  return { source: null, target: "", transformation: null, metadata: {} };
}

/** Appends a freshly-defaulted mapping to the end of the list. */
export function addMapping(mappings: FieldMapping[]): FieldMapping[] {
  return [...mappings, newMapping()];
}

/** Removes the mapping at `index`; an out-of-range index is a no-op rather than throwing. */
export function removeMapping(mappings: FieldMapping[], index: number): FieldMapping[] {
  if (index < 0 || index >= mappings.length) return mappings;
  return mappings.filter((_, i) => i !== index);
}

/**
 * Swaps the mapping at `index` with its neighbor in `direction`. Clamps at both ends — moving the
 * first mapping "up" or the last mapping "down" is a no-op rather than wrapping around or throwing,
 * so the move-up/move-down buttons can stay enabled without extra boundary bookkeeping in the
 * component (mirrors `nodeFields.ts`'s `moveField`).
 */
export function moveMapping(
  mappings: FieldMapping[],
  index: number,
  direction: "up" | "down",
): FieldMapping[] {
  if (index < 0 || index >= mappings.length) return mappings;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= mappings.length) return mappings;

  const next = [...mappings];
  [next[index], next[swapWith]] = [next[swapWith], next[index]];
  return next;
}

/** Merges a `source`/`target` patch into the mapping at `index`, leaving every other mapping and
 * the mapping's `transformation` untouched. An out-of-range index is a no-op. */
export function setMappingField(
  mappings: FieldMapping[],
  index: number,
  patch: Partial<Pick<FieldMapping, "source" | "target">>,
): FieldMapping[] {
  if (index < 0 || index >= mappings.length) return mappings;
  return mappings.map((mapping, i) => (i === index ? { ...mapping, ...patch } : mapping));
}

/** Reads the current transformation `kind` for display, defaulting a `null`/absent transformation
 * to `"direct"` — Dander's own default (a `direct` mapping carries `transformation: null`, not an
 * explicit `{kind:"direct"}` object; see this module's design "direct -> null" trade-off). */
export function derivedKind(mapping: FieldMapping): TransformationKind {
  return mapping.transformation?.kind ?? "direct";
}

/**
 * The key normalizer: sets the mapping at `index`'s transformation `kind`, enforcing the
 * mutually-exclusive `expression`/`constant` payload rule **by construction** rather than only by
 * validation.
 *
 * - `"direct"` -> `transformation: null`. Matches Dander's canonical "plain copy, no payload" and
 *   its minimal dump (`transformation` itself defaults to `null`).
 * - `"expression"` -> `{ kind: "expression", expression: <preserved-or-"">, constant: null,
 *   inputs: <preserved>, metadata: <preserved> }`.
 * - `"constant"` -> `{ kind: "constant", expression: null, constant: <preserved-or-null>,
 *   inputs: <preserved>, metadata: <preserved> }`.
 *
 * Switching kind always clears the *other* kind's payload, so the store can never hold a
 * both-set transformation from this editor's own edits — but `inputs`/`metadata` are carried over
 * from the previous transformation (or default to `[]`/`{}` when there was none) so a stray kind
 * toggle doesn't silently drop pre-existing data this ticket doesn't edit.
 */
export function setTransformationKind(
  mappings: FieldMapping[],
  index: number,
  kind: TransformationKind,
): FieldMapping[] {
  if (index < 0 || index >= mappings.length) return mappings;
  return mappings.map((mapping, i) =>
    i === index
      ? { ...mapping, transformation: normalizeTransformation(mapping.transformation, kind) }
      : mapping,
  );
}

function normalizeTransformation(
  current: Transformation | null,
  kind: TransformationKind,
): Transformation | null {
  if (kind === "direct") return null;

  const inputs = current?.inputs ?? [];
  const metadata = current?.metadata ?? {};

  if (kind === "expression") {
    return {
      kind: "expression",
      expression: current?.expression ?? "",
      constant: null,
      inputs,
      metadata,
    };
  }

  return {
    kind: "constant",
    expression: null,
    constant: current?.constant ?? null,
    inputs,
    metadata,
  };
}

/**
 * Sets the `expression` string on the mapping at `index`'s transformation, stored exactly as
 * authored and **never parsed or evaluated** (per the "Druff never executes user code" non-goal).
 * A no-op if the mapping has no transformation yet — the expression control only renders once the
 * user has picked the `expression` kind, which always leaves a non-null transformation in place.
 */
export function setExpression(
  mappings: FieldMapping[],
  index: number,
  expression: string,
): FieldMapping[] {
  if (index < 0 || index >= mappings.length) return mappings;
  return mappings.map((mapping, i) => {
    if (i !== index || !mapping.transformation) return mapping;
    return { ...mapping, transformation: { ...mapping.transformation, expression } };
  });
}

/**
 * Sets the `constant` literal on the mapping at `index`'s transformation. `value` is stored
 * exactly as given — including the literal `null`, which is how a real, explicit null constant is
 * represented and distinguished from "not provided" (a `direct` mapping, which carries no
 * transformation at all). A no-op if the mapping has no transformation yet, same rationale as
 * `setExpression`.
 */
export function setConstant(
  mappings: FieldMapping[],
  index: number,
  value: unknown,
): FieldMapping[] {
  if (index < 0 || index >= mappings.length) return mappings;
  return mappings.map((mapping, i) => {
    if (i !== index || !mapping.transformation) return mapping;
    return { ...mapping, transformation: { ...mapping.transformation, constant: value } };
  });
}
