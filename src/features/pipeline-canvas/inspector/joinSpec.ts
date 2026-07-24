import type { JoinKeyPair, JoinSpec, JoinType } from "@/lib/pipeline-graph/schema";

/**
 * Pure, immutable edit operations over an edge's optional `join: JoinSpec` (Dander's `JoinSpec`/
 * `JoinKeyPair`/`JoinType` shape), mirroring `edgeMappings.ts`'s role for the "Mappings" category:
 * kept free of React and the store so the non-trivial parts — the "at least one key pair" invariant
 * and reordering — are unit-testable without rendering anything (DRUFF-10 AC6).
 *
 * The store's `edge.data.join` is kept **always valid or absent** by construction: `createJoinSpec`
 * seeds one blank pair (valid from the first render) and the component boundary (`JoinEditor`)
 * disables the remove control on a defined join's last remaining pair, so a defined join with zero
 * pairs is never reachable through this editor. `removeKeyPair` itself is intentionally *total* (it
 * may return `keys: []`) so that invariant is testable in isolation rather than baked into the pure
 * function — see this ticket's Design "invariant by construction vs. reachable-then-blocked".
 */

/** The four Dander join types, in display order (drives the type picker; config-driven, not
 * branched, per `steering/02-engineering.md`'s "config-driven over code-driven"). */
export const JOIN_TYPES: readonly JoinType[] = ["inner", "left", "right", "full"];

/** A freshly-defined join: valid-by-construction with one blank key pair, so the ">= 1 pair" rule
 * holds from the moment "Add join" is clicked, not just after the user fills something in. */
export function createJoinSpec(): JoinSpec {
  return { type: "inner", keys: [{ left: "", right: "" }], metadata: {} };
}

/** Sets the join's `type`, leaving `keys`/`metadata` untouched. */
export function setJoinType(spec: JoinSpec, type: JoinType): JoinSpec {
  return { ...spec, type };
}

/** Appends a blank key pair to the end of the ordered `keys` list. */
export function addKeyPair(spec: JoinSpec): JoinSpec {
  return { ...spec, keys: [...spec.keys, { left: "", right: "" }] };
}

/** Merges `patch` into the key pair at `index`, leaving every other pair untouched. An out-of-range
 * index is a no-op rather than throwing. */
export function updateKeyPair(
  spec: JoinSpec,
  index: number,
  patch: Partial<JoinKeyPair>,
): JoinSpec {
  if (index < 0 || index >= spec.keys.length) return spec;
  return {
    ...spec,
    keys: spec.keys.map((key, i) => (i === index ? { ...key, ...patch } : key)),
  };
}

/**
 * Removes the key pair at `index`; an out-of-range index is a no-op. Deliberately *total* — this
 * may drive `keys` down to `[]`, since the "a defined join needs >= 1 pair" invariant is enforced
 * at the `JoinEditor` component boundary (the last remaining pair's remove control is disabled),
 * not inside this pure function. Whether a zero-pair spec is "OK" is `validateJoinSpec`'s concern.
 */
export function removeKeyPair(spec: JoinSpec, index: number): JoinSpec {
  if (index < 0 || index >= spec.keys.length) return spec;
  return { ...spec, keys: spec.keys.filter((_, i) => i !== index) };
}

/**
 * Moves the key pair at `from` to position `to`, shifting the pairs in between. Bounds-safe: an
 * out-of-range `from`/`to`, or `from === to`, is a no-op rather than throwing or reordering nothing
 * visibly. The component drives this from up/down buttons (`moveKeyPair(spec, index, index - 1)` /
 * `moveKeyPair(spec, index, index + 1)`), which naturally clamp at the ends since an out-of-range
 * `to` is a no-op.
 */
export function moveKeyPair(spec: JoinSpec, from: number, to: number): JoinSpec {
  if (from < 0 || from >= spec.keys.length) return spec;
  if (to < 0 || to >= spec.keys.length) return spec;
  if (from === to) return spec;

  const next = [...spec.keys];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return { ...spec, keys: next };
}

/** Actionable validation result for a `JoinSpec` (DRUFF-10 AC4). `ok` is `false` only when `keys`
 * is empty — the one rule Dander's model actually enforces (`JoinSpecSchema`'s `keys.min(1)`); a
 * blank `left`/`right` on an individual pair is surfaced as an advisory `keyErrors` hint, not a
 * save-blocker (see this ticket's Design "blank field names advisory, not blocking"). */
export type JoinValidation = {
  /** `false` iff `keys.length === 0` — the "defined join needs >= 1 pair" gate. */
  ok: boolean;
  /** Set when `!ok`: an actionable message for the spec as a whole. */
  message?: string;
  /** Per-pair advisory hints for a blank `left`/`right`, keyed by index. An index absent from this
   * map has no advisories. */
  keyErrors: Record<number, { left?: string; right?: string }>;
};

/**
 * Validates a `JoinSpec`'s shape, backstopping any imported/edge-case spec (e.g. a hand-authored
 * zero-pair join, were one ever to reach here) with an actionable message instead of a crash —
 * `JoinEditor`'s own UI never constructs this state, since it disables the last pair's remove
 * control, but this function is the single source of truth those inline messages come from.
 */
export function validateJoinSpec(spec: JoinSpec): JoinValidation {
  const keyErrors: Record<number, { left?: string; right?: string }> = {};
  spec.keys.forEach((key, index) => {
    const rowErrors: { left?: string; right?: string } = {};
    if (key.left.trim() === "") rowErrors.left = "Choose a field.";
    if (key.right.trim() === "") rowErrors.right = "Choose a field.";
    if (rowErrors.left || rowErrors.right) keyErrors[index] = rowErrors;
  });

  if (spec.keys.length === 0) {
    return {
      ok: false,
      message:
        'A join needs at least one key pair — use "Remove join" to make this connection join-less.',
      keyErrors,
    };
  }

  return { ok: true, keyErrors };
}
