import type { NodeField } from "@/lib/pipeline-graph/schema";

/**
 * Pure operations over a node's declared `fields: NodeField[]` (Dander's `NodeField` schema),
 * mirroring `nodeConfig.ts`'s role for the Config section: kept free of React and the store so the
 * non-trivial parts — defaults, add/remove/reorder, and the client-only row identity fields need
 * for stable reordering — are unit-testable without rendering anything (DRUFF-7 AC6).
 *
 * A `NodeField` itself has no stable identity of its own (unlike a node/edge, it carries no `id`),
 * yet fields **are** reorderable (unlike `nodeConfig`'s config rows, which are only
 * appended/removed — see that module's doc comment). Keying the editor's row list by array index
 * would mis-associate input focus/local state across a reorder, so every row is paired with a
 * `FieldRow.id`: a client-only, monotonically-generated identifier used purely as a React key and
 * **never** written back to the graph — `fromRows` strips it before the result reaches the store.
 */
export type FieldRow = {
  /** Client-only row identity for stable list rendering/reordering; never persisted. */
  id: string;
  field: NodeField;
};

/**
 * Monotonic counter backing `FieldRow.id` generation. A plain incrementing counter (rather than
 * `crypto.randomUUID()`) keeps row ids short, deterministic within a test run, and dependency-free;
 * uniqueness only needs to hold within one editor instance's lifetime, not globally.
 */
let nextRowId = 0;

/** Mints a fresh, unique `FieldRow.id` for a newly-added or newly-loaded row. */
function generateRowId(): string {
  nextRowId += 1;
  return `field-row-${nextRowId}`;
}

/**
 * A freshly-added field's contents, matching Dander's own `NodeField` defaults exactly: `name`/
 * `type` blank (authored in place), `nullable` defaults to `true`, `description` is `null` (not
 * `undefined` or `""` — see this ticket's Design "Flagged" note on round-tripping a cleared
 * description), and `metadata` starts as an empty tag bag. Single source of truth for "what a
 * blank field looks like," mirroring `nodeConfig`'s blank-row shape.
 */
export function newField(): NodeField {
  return { name: "", type: "", nullable: true, description: null, metadata: {} };
}

/**
 * Expands a node's `fields` into editable rows, one per field in declared order, each tagged with
 * a fresh client-only row id. `undefined` (a node with no declared fields yet) yields no rows
 * rather than throwing, since `fields` is optional on `PipelineNodeData`.
 */
export function toRows(fields: NodeField[] | undefined): FieldRow[] {
  return (fields ?? []).map((field) => ({ id: generateRowId(), field }));
}

/**
 * Collapses edited rows back into the `NodeField[]` the store/graph understand, stripping the
 * client-only row id. Unlike `nodeConfig`'s `entriesToConfig`, **every row survives**, blank `name`
 * included — a field row has positional identity (order is meaningful), so dropping a
 * momentarily-unnamed row mid-typing would make it vanish instead of just being invalid. A
 * blank/duplicate name is a `graph_ops`-level semantic concern (see this ticket's Design), not this
 * editor's job to enforce.
 */
export function fromRows(rows: FieldRow[]): NodeField[] {
  return rows.map((row) => row.field);
}

/** Appends a freshly-defaulted field row to the end of the list. */
export function addField(rows: FieldRow[]): FieldRow[] {
  return [...rows, { id: generateRowId(), field: newField() }];
}

/**
 * Merges `patch` into the row identified by `id`, leaving every other row untouched. A row id that
 * doesn't match anything (already removed, stale reference) is a no-op rather than throwing, so a
 * late-arriving event from an already-removed row can't corrupt the list.
 */
export function updateField(rows: FieldRow[], id: string, patch: Partial<NodeField>): FieldRow[] {
  return rows.map((row) => (row.id === id ? { ...row, field: { ...row.field, ...patch } } : row));
}

/** Removes the row identified by `id`; a non-matching id is a no-op. */
export function removeField(rows: FieldRow[], id: string): FieldRow[] {
  return rows.filter((row) => row.id !== id);
}

/**
 * Swaps the row identified by `id` with its neighbor in `direction`. Clamps at both ends — moving
 * the first row "up" or the last row "down" is a no-op rather than wrapping around or throwing, so
 * the move-up/move-down buttons can be left enabled without extra boundary bookkeeping in the
 * component.
 */
export function moveField(rows: FieldRow[], id: string, direction: "up" | "down"): FieldRow[] {
  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) return rows;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= rows.length) return rows;

  const next = [...rows];
  [next[index], next[swapWith]] = [next[swapWith], next[index]];
  return next;
}
