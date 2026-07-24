---
id: DRUFF-7
title: Node field schema editor (Fields category)
status: done
component: frontend
epic: node-fields
depends_on: [DRUFF-3, DRUFF-4]
created: 2026-07-23
---

## Context

Dander's `pipeline` package lets a `Node` declare an ordered `fields: list[NodeField]` — the schema
it exposes (see `../dander/src/dander/pipeline/README.md`, "Node field schema"). Druff's inspector
(DRUFF-3) today only edits a node's display name and a generic key/value `config` bag; it exposes
none of a node's declared fields. DRUFF-4's model/serializer already mirrors `NodeField` and carries
`node.data.fields` through canvas ⇄ graph ⇄ YAML/JSON, but there is no UI to author them.

This ticket adds a **"Fields" category** to the node inspector: add/edit/remove/reorder a node's
declared fields, backed by Dander's `NodeField` shape — `name` (required), `type` (free-form token
e.g. `STRING`/`INT64`), `nullable` (default `true`), `description`, and `metadata` (free-form
tags/labels only, e.g. `sensitivity: pii` — never a real field value or sample data, per
`steering/01-security.md`). It grounds the "Node field schema editor" in the module map's Canvas
inspector, and its declared fields are the vocabulary DRUFF-9 (field mappings) and DRUFF-10 (join
keys) resolve against.

## Acceptance Criteria

- [ ] The node inspector shows a "Fields" category for a selected node, listing that node's declared
      fields in order.
- [ ] The user can add a field, edit its `name`, `type`, `nullable`, and `description`, remove a
      field, and reorder fields; every edit persists to the node's `fields` through the store
      (DRUFF-1/3), updating live.
- [ ] Each field matches Dander's `NodeField` keys exactly: `name` (required), `type` (free-form
      token), `nullable` (defaults to `true`), `description` (optional), `metadata` (free-form
      tags/labels only).
- [ ] `metadata` is edited as tag key/value pairs and is documented/guarded as **tags only** — the
      UI must not invite entering a real field value or sample data (per `steering/01-security.md`).
- [ ] A node's declared fields round-trip through canvas ⇄ graph ⇄ YAML/JSON unchanged (via DRUFF-4;
      extend DRUFF-4's model/serializer if any `NodeField` key is not yet carried).
- [ ] The field-list editing logic (add/edit/remove/reorder, defaults, ordering) is unit-tested with
      non-sensitive fixtures (see `steering/02-engineering.md`).
- [ ] No steering violations (secrets, style, docs).

## Design

### Approach

The whole ticket sits **inside DRUFF-3's inspector seam** and reuses its already-proven shape.
`NodeInspector` (`src/features/pipeline-canvas/inspector/NodeInspector.tsx`) is a pure projection of
the graph store: it reads the single selected node via `selectSelectedNode` and writes every edit
straight back through `updateNodeData(node.id, patch)` — no local `useState` mirror of node data. We
extend that panel with a third section, **"Fields"**, sitting below Name and Config, that edits
`node.data.fields` the same way the Config section edits `node.data.config`. There is no new store
API, no new selector, and no new node-data key: `PipelineNodeData.fields?: NodeField[]` already
exists (`canvas-types.ts`) and `updateNodeData` already shallow-merges a `{ fields }` patch.

**The data-layer already round-trips fields — confirmed, no DRUFF-4 change needed.** All five
`NodeField` keys are already carried end-to-end: `NodeFieldSchema` in
`src/lib/pipeline-graph/schema.ts` declares `name`, `type`, `nullable` (default `true`),
`description` (nullable, default `null`), `metadata` (default `{}`); and `canvas-convert.ts` carries
`fields: node.data.fields ?? []` on save and `fields: node.fields` on load in both directions.
So AC5 ("extend DRUFF-4's model/serializer if any key is not yet carried") is satisfied by the
existing model — the design **adds no schema/serializer changes** and the Code agent should verify
this by extending `round-trip.test.ts` with a node that carries a fully-populated `fields` array
(name/type/nullable=false/description/metadata) rather than by touching `schema.ts`. If that test
surprises us, only then is a schema change in scope.

**Pure logic split out from the component, mirroring `nodeConfig.ts`.** Following the DRUFF-3 pattern
(a React-free `nodeConfig.ts` holding the non-trivial mapping, tested without rendering; a thin
`NodeConfigEditor.tsx` around it), all field-list operations — create-with-defaults, update, remove,
reorder, and the metadata tag ⇄ record mapping — live in a new pure module `nodeFields.ts`. That
module is where AC6's unit tests land (add/edit/remove/reorder, defaults, ordering), with no DOM.
The component is a thin, mostly-presentational shell over those functions.

**Two behavioural differences from the Config editor, both deliberate:**

1. *Fields have order-identity; config rows do not.* `NodeConfigEditor` keys rows by array index and
   explicitly documents "rows are only appended/removed, not reordered." Fields **are** reorderable
   (AC2), so index-as-key would mis-associate input state/focus across a reorder. The editor's local
   row list therefore carries a **client-only stable row id** (a monotonic counter or
   `crypto.randomUUID()`), used purely as the React `key` and never written to the graph — the
   persisted value is always a clean `NodeField[]`.
2. *Blank names are kept, not dropped.* `entriesToConfig` drops blank-key rows because an unnamed
   config row isn't a real entry. A field row has positional identity, so dropping a
   momentarily-blank `name` mid-typing would make the row vanish. We therefore **persist every field
   row as-authored**, blank `name` included; a blank/duplicate name is an invalid-graph condition
   that belongs to Dander's `graph_ops` validation surface (a separate, not-yet-built module — see
   `schema.ts`'s "semantic checks out of scope" note), not to this editor.

**Reorder via up/down buttons, not drag.** Per `steering/languages/typescript.md`, drag/drop is
unreliable under jsdom and would force a Playwright test, defeating AC6's "unit-tested field-list
logic." Move-up/move-down buttons keep the reorder operation a pure array transform that unit-tests
cleanly; a richer drag handle can come later behind the same `reorderField` seam if a ticket asks.

**`metadata` is tags-only, and the UI says so (AC4, `01-security.md`).** Each field's `metadata` is
edited as key/value **tag** pairs via a small sub-editor that *reuses* `nodeConfig.ts`'s existing,
already-tested `configToEntries`/`entriesToConfig` mapping (a `Record<string,string>` ⇄ rows
mapping is exactly what tag pairs need — no second copy). The metadata sub-editor is visually and
textually framed as labels/tags: a section label like "Metadata tags", placeholder hints
(`e.g. sensitivity` / `pii`), and short helper text "Tags/labels only — never a real field value or
sample data." This is guidance + framing, not a runtime secret scanner (out of scope, and the store
never ships to a bundle as a secret); the guard is the same "author, don't run, don't put real data
here" contract the rest of the app follows.

### Components / modules & data flow

- **`nodeFields.ts`** (pure, no React/store) — the tested core:
  - `type FieldRow = { id: string; field: NodeField }` — a field plus its client-only row id.
  - `newField(): NodeField` — a blank field with Dander defaults (`name: ""`, `type: ""`,
    `nullable: true`, `description: null`, `metadata: {}`). Single source of truth for "what a
    freshly-added field looks like," mirroring `defaultConfigForDescriptor`'s role.
  - `toRows(fields: NodeField[] | undefined): FieldRow[]` / `fromRows(rows: FieldRow[]): NodeField[]`
    — attach/strip the transient row id; `toRows(undefined)` yields `[]` (fields is optional).
  - `addField`, `updateField(rows, id, patch)`, `removeField(rows, id)`,
    `moveField(rows, id, "up"|"down")` — pure `FieldRow[] → FieldRow[]` transforms
    (`moveField` clamps at the ends). These are the AC6 unit-test surface.
  - Metadata tag pairs reuse `configToEntries`/`entriesToConfig` from `nodeConfig.ts` directly (no
    new mapping); `nodeFields.ts` re-exports or the component imports both — Code agent's call.
- **`NodeFieldsEditor.tsx`** (`"use client"`) — the section component, same prop-seam as
  `NodeConfigEditor`:
  - Props: `{ fields: NodeField[] | undefined; onChange: (fields: NodeField[]) => void }`.
  - Holds one piece of local state — `FieldRow[]`, seeded from `fields` on mount via `toRows` — for
    the *exact same reason* `NodeConfigEditor` does (a just-added blank-name row must survive until
    named; a stable row id must persist across edits). Every edit recomputes the list, calls
    `onChange(fromRows(next))` immediately (store never lags the screen), and is reset across node
    switches by the parent remounting it with `key={node.id}`.
  - Renders per field: `name` (Input, `aria-label="Field name"`), `type` (Input,
    `aria-label="Field type"`, placeholder `STRING`), `nullable` (a checkbox/toggle,
    `aria-label="Nullable"`), `description` (Input, optional), move-up/move-down/remove buttons, and
    a collapsible/inline **metadata tags** sub-editor. An empty state ("No fields yet.") and an
    "Add field" button at the bottom, matching `NodeConfigEditor`'s affordances.
- **`NodeInspector.tsx`** — add a `<Separator />` + "Fields" section that renders
  `<NodeFieldsEditor key={node.id} fields={node.data.fields} onChange={(fields) => updateNodeData(node.id, { fields })} />`.
  The connector-vs-generic branch above it is untouched — Fields is orthogonal to Config and shows
  for every node kind (a connector node still declares a field schema).

Data flow end-to-end: store `node.data.fields` → `NodeInspector` (projection) → `NodeFieldsEditor`
(local row mirror for UI mechanics only) → `onChange` → `updateNodeData(id, { fields })` → store →
canvas re-render + (on save) `canvasToGraph` → serializer → YAML/JSON, unchanged.

### Files to touch / create

- **Create** `src/features/pipeline-canvas/inspector/nodeFields.ts` — pure field-row operations +
  `newField` defaults; TSDoc on each export.
- **Create** `src/features/pipeline-canvas/inspector/nodeFields.test.ts` — AC6 unit tests: add,
  edit each key, remove, reorder (incl. clamping at both ends), `newField` defaults, and
  metadata-tag mapping, using non-sensitive fixtures only.
- **Create** `src/features/pipeline-canvas/inspector/NodeFieldsEditor.tsx` — the section component.
- **Edit** `src/features/pipeline-canvas/inspector/NodeInspector.tsx` — mount the Fields section.
- **Edit** `src/features/pipeline-canvas/inspector/NodeInspector.test.tsx` — component tests: Fields
  section lists a selected node's fields in order; add/edit/remove/reorder each persist to the
  store; the metadata-tags-only helper text is present.
- **Edit** `src/lib/pipeline-graph/round-trip.test.ts` (and/or `serialize.test.ts`) — add a
  fully-populated-`fields` node to prove round-trip (AC5) against the *existing* model.
- **Possibly add** a `Checkbox`/`Switch` shadcn primitive under `src/components/ui/` if none exists
  for the `nullable` toggle (only `button/card/dialog/input/label/separator/sonner/tabs/tooltip` are
  present today) — add via the project's shadcn setup rather than hand-rolling.

### Trade-offs

- **Section vs. Tabs.** The ticket calls Fields a "category." A `Tabs` primitive exists, but the
  inspector today stacks Name + Config as plain separated sections; a third stacked section is the
  smaller, consistent change and keeps all properties visible without a click. Tabs can be layered
  on later across all sections at once if the panel gets crowded — not this ticket.
- **Up/down reorder vs. drag handle.** Chosen for unit-testability and to keep AC6 out of Playwright
  (see Approach). The `moveField` seam makes a future drag upgrade a component-only change.
- **Reusing `nodeConfig.ts`'s mapping for metadata** vs. a bespoke metadata module: reuse wins —
  tag pairs are exactly a string record ⇄ rows mapping, already tested; duplicating it would be the
  DRY violation `02-engineering.md` warns against.
- **Keeping blank-name field rows** (vs. dropping like config): required for stable
  positional/reorder identity; the cost is that the editor can hold a transiently-invalid graph,
  which is acceptable because validity is Dander's `graph_ops` concern surfaced elsewhere.

### Test seams

- **Pure logic (`nodeFields.test.ts`, Vitest, no DOM):** all list transforms and defaults — the
  bulk of AC6.
- **Component (`NodeInspector.test.tsx`, RTL + userEvent):** seed the store singleton with a fixture
  node carrying `fields`, assert the section lists them in order and that add/edit/remove/reorder
  each land on `useGraphStore.getState()...data.fields`, plus the tags-only helper text renders.
  Follows the existing file's store-singleton seed/restore pattern.
- **Round-trip (`round-trip.test.ts`):** a fixture graph node with a full `NodeField` proves AC5
  through the real Zod schema + serializer. **No network anywhere** — nothing here touches Dander;
  all fixtures are non-sensitive tag/label data (`sensitivity: pii` is a label, not a value).

### Flagged / under-specified

- **AC3 `description`.** Dander/Zod model `description` as `string | null` (default `null`), not
  `undefined`. The editor should write `null` (not `""` or omitted) when the box is cleared, so it
  round-trips identically to a hand-authored `description: null`. Called out so the Code agent
  doesn't emit an empty string and break AC5's round-trip.
- **`nullable` default surfacing.** AC3 says `nullable` "defaults to `true`." `newField` sets it;
  the checkbox must render a missing/legacy `nullable` as `true` too (defensive default) so a field
  imported without the key shows checked.
- **No graph-level uniqueness/validation** of field names in this ticket — that's the Validation
  surface module (unbuilt). Noted so the reviewer doesn't expect it here.

## Implementation Notes

Implemented per Design, no deviations from the specified approach/data flow. Summary:

- **`src/features/pipeline-canvas/inspector/nodeFields.ts`** (new) — pure, React-free field-row
  logic: `FieldRow`/`newField`/`toRows`/`fromRows`/`addField`/`updateField`/`removeField`/
  `moveField`. `moveField` clamps at both ends; `updateField`/`removeField`/`moveField` are no-ops
  for an unmatched row id. Metadata tag mapping is reused directly from `nodeConfig.ts`'s
  `configToEntries`/`entriesToConfig` (no second copy), as the Design called for.
- **`src/features/pipeline-canvas/inspector/nodeFields.test.ts`** (new) — AC6 unit tests: `newField`
  defaults, `toRows`/`fromRows` (incl. `undefined` → `[]` and round-trip), add/update-each-key/
  remove/reorder (incl. clamping at both ends and no-ops on unmatched ids), and the metadata-tag
  mapping reuse. All fixtures are non-sensitive labels/tokens per `steering/02-engineering.md`.
- **`src/features/pipeline-canvas/inspector/NodeFieldsEditor.tsx`** (new) — the Fields section
  component: local `FieldRow[]` state seeded via `toRows` (same rationale as `NodeConfigEditor`:
  survives a blank-name row until typed; reset by the parent's `key={node.id}`), move-up/down/
  remove buttons (disabled at the ends rather than hidden, so the control set doesn't shift), a
  `nullable` checkbox (added via `shadcn add checkbox`, backed by the already-installed
  `radix-ui` package — no new dependency, lockfile unchanged), and an inline metadata-tags
  sub-editor framed as "Metadata tags" with the required tags-only helper text (AC4).
  `description` is written as `null` (never `""`) when cleared, per the Design's flagged
  round-trip note; `nullable` defensively reads a missing/legacy value as `true`.
- **`src/features/pipeline-canvas/inspector/NodeInspector.tsx`** (edit) — mounts
  `<NodeFieldsEditor key={node.id} fields={node.data.fields} onChange={(fields) =>
  updateNodeData(node.id, { fields })}>` as a third stacked section below Config, unconditionally
  (orthogonal to the connector-vs-generic Config branch). **One addition beyond the Design's
  literal file list:** gave the Config and Fields section wrapper `<div>`s `role="group"
  aria-label="Config"|"Fields"`. Both editors' "Add field"/"Remove field" buttons are identically
  named by design (matching affordances), which is ambiguous to `getByRole` queries — and to
  assistive tech — once both sections render side by side in the same panel; the accessible
  group name scopes them without changing any visible text.
- **`src/features/pipeline-canvas/inspector/NodeInspector.test.tsx`** (edit) — added a
  `NODE_WITH_FIELDS` fixture and a "Fields section" describe block: lists fields in order, shows
  the tags-only helper text, add/edit-name/toggle-nullable/remove/reorder each persist to the
  store, and editing a metadata tag persists to that field's `metadata`. Updated the pre-existing
  "adding a config field" test to scope its "Add field" query to the Config group (see above).
- **`src/lib/pipeline-graph/round-trip.test.ts`** (edit) — added a dedicated
  `FULLY_POPULATED_FIELDS_GRAPH` (one node, one `NodeField` with every key populated:
  `nullable: false`, a `description` string, a `metadata` tag) and asserted
  graph → canvas → graph → YAML/JSON → graph is the identity over both formats, proving AC5
  against the *existing* model. Confirmed the Design's claim: no `schema.ts`/`canvas-convert.ts`
  change was needed — `NodeFieldSchema`, `nodeToGraphNode`, and `graphNodeToCanvasNode` already
  carry all five `NodeField` keys losslessly. (`EXAMPLE_GRAPH`'s existing fields already covered
  most of this combination incidentally via `serialize.test.ts`/the pre-existing round-trip
  tests; the new test makes the AC5 proof explicit and self-contained rather than relying on that
  incidental coverage.)
- **`src/components/ui/checkbox.tsx`** (new, generated) — added via `npx shadcn@latest add
  checkbox` for the `nullable` toggle, per the Design's "Possibly add a Checkbox/Switch shadcn
  primitive" note. No new npm dependency — it's built on the `radix-ui` package already in
  `package.json`; `package.json`/lockfile are unchanged.

Toolchain run clean on every touched file: `eslint`, `prettier --check`, `tsc --noEmit`, and
`vitest run` (166/166 passing, including the 3 test files this ticket edited/added). A
pre-existing `prettier --check` warning on `README.md` is unrelated to this ticket and was left
untouched.

### 2026-07-23 — Addendum fixes (AC4 metadata-tag add/edit defect)

- **`src/features/pipeline-canvas/inspector/NodeFieldsEditor.tsx`** — `FieldMetadataEditor` was
  stateless (`const entries = configToEntries(metadata)`, recomputed every render), so a
  freshly-added blank-key tag row was immediately dropped by `entriesToConfig` and vanished before
  the user could type a key; the same lack of a local buffer meant clearing an existing tag's key
  mid-edit destroyed its value. Fixed by giving `FieldMetadataEditor` local row state, mirroring
  `NodeConfigEditor` exactly: `const [entries, setEntries] = useState<ConfigEntry[]>(() =>
  configToEntries(metadata))`, and `commit(next)` now both `setEntries(next)` and
  `onChange(entriesToConfig(next))`. `ConfigEntry` is imported from `nodeConfig.ts` (already
  exported). No extra `key` plumbing was needed: `FieldRowEditor` (the parent) already keys each
  field by its stable `row.id`, so this local state persists across edits of the same field and
  resets correctly when the row identity changes, per the addendum. Verified manually: clicking
  "Add tag" now leaves a visible, editable blank tag row, and clearing an existing tag's key no
  longer drops its value.
- **`src/features/pipeline-canvas/inspector/NodeInspector.test.tsx`** — added "adding a metadata
  tag and typing a key/value persists a new tag to the field's metadata" under the "Fields
  section" describe block. Seeds a node with **no** declared fields, clicks "Add field" (scoped to
  the Fields `role="group"`) to get a single field with empty metadata (avoiding ambiguity with a
  second pre-existing field/tag row), clicks "Add tag" (same group), types into the resulting
  "Metadata tag key"/"Metadata tag value" inputs (queried scoped to the Fields group), and asserts
  `useGraphStore.getState()...data.fields?.[0].metadata` equals `{ owner: "data-eng" }` — a
  non-sensitive label fixture. Confirmed this test fails against the pre-fix
  `FieldMetadataEditor` (the "Metadata tag key" input doesn't exist at all — `getByLabelText`
  throws) and passes after the fix.
- Re-ran the full toolchain after the fix: `eslint`, `prettier --check`, and `tsc --noEmit` all
  clean on the touched files; `vitest run` — 167/167 passing (166 pre-existing + the 1 new
  regression test), including all 20 tests in `NodeInspector.test.tsx`.

## Review Log

_Append-only. PR-Review adds entries below._

### 2026-07-23 — FAIL (pr-review)

Most ACs are solidly met — the pure `nodeFields.ts` logic, its unit tests, the round-trip proof
(AC5), the inspector wiring, `nullable`/`description` defaults, and the tags-only helper text are
all correct and well-tested. But **AC4 ("metadata is edited as tag key/value pairs") is not met**:
a user cannot add a metadata tag to a field at all. This is a confirmed, reproducible defect, so
FAIL.

**Root cause.** `FieldMetadataEditor` in `NodeFieldsEditor.tsx` (lines ~185–240) is *stateless*: it
derives its rows on every render with `const entries = configToEntries(metadata);` and commits with
`onChange(entriesToConfig(next))`. But `entriesToConfig` intentionally **drops blank-key rows**. So
clicking "Add tag" appends `{ key: "", value: "" }`, which `entriesToConfig` immediately discards →
`metadata` is unchanged → the next render recomputes `entries` with no blank row → the new tag row
vanishes before the user can type a key. This is exactly the failure `NodeConfigEditor` avoids by
holding the row list in local `useState` (see its doc comment, lines 20–35: "a freshly-added row has
a blank key that `entriesToConfig` intentionally drops, so it must survive in *something* other than
`config` until the user types a key"). `FieldMetadataEditor` copied the mapping but not the local-
state mechanic that makes it usable.

Verified: a throwaway RTL test that clicks "Add tag" then queries for the "Metadata tag key" input
finds **no** input — the row never persists. The existing test "editing a metadata tag key/value
persists" (`NodeInspector.test.tsx:294`) only edits the *value* of a *pre-existing* tag (whose key
stays non-blank), so it never exercises adding a tag and doesn't catch this.

Secondary manifestation of the same root cause: clearing an existing tag's **key** to blank mid-edit
(e.g. to rename it) drops the whole row and loses its value, because there is no local buffer to hold
the transiently-blank key. Fixing the root cause fixes both.

#### Addendum (concrete, numbered)

1. **`src/features/pipeline-canvas/inspector/NodeFieldsEditor.tsx` — give `FieldMetadataEditor`
   local row state, mirroring `NodeConfigEditor`.** Replace the stateless
   `const entries = configToEntries(metadata);` with a local `useState<ConfigEntry[]>(() =>
   configToEntries(metadata))` seeded on mount, and have `commit(next)` both `setEntries(next)` and
   call `onChange(entriesToConfig(next))` — so a freshly-added blank-key tag row survives in local
   state until the user types a key, exactly as `NodeConfigEditor` does. Because `FieldRowEditor` is
   keyed by the stable `row.id`, this local state correctly persists across edits of the same field
   and resets when the node/row identity changes; no extra `key` plumbing is needed. (`ConfigEntry`
   is exported from `nodeConfig.ts`.) After the change, clicking "Add tag" must leave a visible,
   editable blank tag row, and clearing an existing tag's key must not destroy its value.

2. **`src/features/pipeline-canvas/inspector/NodeInspector.test.tsx` — add a regression test that
   actually adds a metadata tag.** Seed a selected node, click "Add tag" (scope the query to the
   Fields `role="group"` to avoid the duplicate-name ambiguity the impl already guards against),
   type a key and value into the resulting "Metadata tag key"/"Metadata tag value" inputs, and
   assert the field's `metadata` in `useGraphStore.getState()` equals `{ <key>: <value> }`. This is
   the coverage gap that let the defect through — AC6 requires the field-list *and its metadata*
   editing logic to be tested. Use non-sensitive label fixtures only.

Re-run `eslint`, `prettier --check`, `tsc --noEmit`, and `vitest run` on the touched files; the new
regression test must fail before fix #1 and pass after.

### 2026-07-23 — PASS (pr-review)

The prior FAIL's sole blocker (AC4 — could not add a metadata tag) is resolved, and every other AC
remains met. Verified against the actual code, not just the notes.

**Addendum item 1 (root cause) — fixed.** `FieldMetadataEditor` (`NodeFieldsEditor.tsx:197–203`) now
holds `const [entries, setEntries] = useState<ConfigEntry[]>(() => configToEntries(metadata))` and
`commit(next)` both `setEntries(next)` and `onChange(entriesToConfig(next))`, mirroring
`NodeConfigEditor` exactly. A freshly-added blank-key tag row now survives in local state until the
user types a key instead of being dropped by `entriesToConfig` on the next render. `ConfigEntry` is
imported from `nodeConfig.ts` (already exported); no second copy of the mapping. The parent
`FieldRowEditor` is keyed by the stable `row.id`, so this local state persists across same-field
edits and resets on row-identity change — no extra `key` plumbing, as specified.

**Addendum item 2 (regression test) — added and meaningful.** `NodeInspector.test.tsx:308–330`
seeds a fieldless node, clicks "Add field" then "Add tag" (both scoped to the Fields
`role="group"`), types into the "Metadata tag key"/"Metadata tag value" inputs, and asserts the
field's `metadata` equals `{ owner: "data-eng" }` (a non-sensitive label). This exercises the exact
path the defect broke — the inputs don't exist pre-fix.

**Full AC re-check.** AC1 Fields section lists a selected node's fields in order (test passes).
AC2 add/edit-name/toggle-nullable/remove/reorder each persist live to the store (tests pass; pure
transforms for type/description edits covered in `nodeFields.test.ts`). AC3 keys match Dander's
`NodeField` exactly with `nullable` default `true` and `description` written as `null` not `""`
(`newField`, unit-tested). AC4 metadata is tag key/value pairs with the tags-only helper text and
now fully functional add/edit. AC5 a fully-populated `NodeField` round-trips over YAML and JSON
against the existing model (`round-trip.test.ts`). AC6 add/edit/remove/reorder/defaults/ordering and
the metadata mapping are unit-tested with non-sensitive fixtures. AC7 no steering violations.

**Security.** No hardcoded secrets in the diff; `sensitivity: "pii"` and `owner: "data-eng"` are
labels, not real values; nothing sensitive logged; no new dependency (Checkbox built on the
already-installed `radix-ui`, lockfile unchanged).

**Toolchain (re-run by reviewer):** `pnpm lint` clean, `pnpm typecheck` clean, `prettier --check`
clean on all six touched files, `pnpm test` 167/167 passing.
