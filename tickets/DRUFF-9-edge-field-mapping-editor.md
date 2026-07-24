---
id: DRUFF-9
title: Edge field-mapping editor
status: done
component: frontend
epic: edge-editing
depends_on: [DRUFF-7, DRUFF-8]
created: 2026-07-23
---

## Context

Dander's `Edge` declares an ordered `mappings: list[FieldMapping]` — column-level lineage across the
connection (see `../dander/src/dander/pipeline/README.md`, "Connection field-to-field mapping" and
"Connection transformations"). Each `FieldMapping` writes one `target` field (a name on the target/
`to` node) and either reads a `source` field (a name on the source/`from` node) or is derived via a
`transformation`. With edge inspection in place (DRUFF-8) and declared fields authored per node
(DRUFF-7), this ticket adds the **field-mapping editor** for a selected edge.

Per target field the user picks a source field or leaves it derived, and chooses a transformation
`kind` from Dander's closed `TransformationKind`: `direct` (default plain copy, no extra payload),
`expression` (a stored opaque expression string — **never parsed or evaluated client-side**, per the
"Druff never executes user code" non-goal in `steering/00-project-overview.md`), or `constant` (an
explicit literal, including a real `null`). DRUFF-4 already models `FieldMapping`/`Transformation`;
this is the authoring UI plus the shape rules the model enforces, surfaced as actionable inline
validation rather than a crash. Semantic field-wiring validation (does a name resolve on the
connected node) remains Dander's job (DRUFF-4 "Out of scope"); this ticket's validation is the
`FieldMapping`/`Transformation` shape rules Dander's model itself enforces.

## Acceptance Criteria

- [ ] Selecting an edge shows a "Mappings" category listing the edge's `FieldMapping` entries, and
      lets the user add, edit, remove, and reorder them; every edit persists to the edge's
      `data.mappings` through the store (DRUFF-8).
- [ ] For each mapping the user sets a `target` field (chosen from the target/`to` node's declared
      fields, DRUFF-7) and either a `source` field (chosen from the source/`from` node's declared
      fields) or leaves it derived/unset.
- [ ] The transformation `kind` can be set to `direct`, `expression`, or `constant` (Dander's
      `TransformationKind`): `direct` carries no `expression`/`constant`; `expression` stores an
      opaque expression string; `constant` stores an explicit literal value, and a real `null`
      constant is distinguishable from "not provided".
- [ ] Dander's mapping rules are enforced with actionable inline messages (not a crash): a mapping
      must have a `source` **or** a transformation (a derived mapping with no source requires an
      `expression`/`constant` transformation), and `expression`/`constant` are mutually exclusive.
- [ ] Expression/body/constant strings are stored as authored and are **never parsed or evaluated in
      the browser** (per the "Druff never executes user code" non-goal).
- [ ] The edge's `mappings` (with transformations) round-trip through canvas ⇄ graph ⇄ YAML/JSON
      unchanged, matching Dander's on-disk keys (`source`/`target`, `transformation.kind`/
      `expression`/`constant`/`inputs`) (via DRUFF-4).
- [ ] The mapping/transformation validation and edit logic are unit-tested with non-sensitive
      fixtures (see `steering/02-engineering.md`).
- [ ] No steering violations (secrets, style, docs).

## Design

### Approach

DRUFF-9 is the **Mappings category** for a selected edge: the authoring UI over the edge's ordered
`FieldMapping[]` plus the `FieldMapping`/`Transformation` **shape** rules Dander's model enforces
(surfaced inline, never as a crash). It slots into the edge inspector shell DRUFF-8 provides, the
same way the "Fields" category (DRUFF-7) and generic config editor (DRUFF-3) slot into the node
inspector.

The design follows the two seams already established in this repo and mandated by
`02-engineering.md` (interfaces-first, push side effects into hooks, dependency-inject so logic is
testable without a network/store):

1. **Pure logic modules** — the whole of the AC's "edit logic and validation" lives in framework-
   free functions (`edgeMappings.ts`, `validateMapping.ts`), exactly like `nodeConfig.ts` and
   `validateConnectorConfig.ts`. These are what the unit tests exercise; no rendering, no store.
2. **A store-connected category container** (`EdgeMappingsEditor.tsx`) that plays the role
   `NodeInspector` plays for node config: it reads the selected edge and its two endpoint nodes'
   declared fields from the store, renders the list, and writes every edit straight back through
   `updateEdgeData(edgeId, { mappings })` — no local `useState` mirror of the mapping array, so the
   panel can never drift from the canvas (same invariant NodeInspector documents). A presentational
   `MappingRow` (data-in / callbacks-out, no store) renders one mapping.

Everything the module produces is a Dander-shaped `FieldMapping`/`Transformation` object whose keys
match `src/lib/pipeline-graph/schema.ts` exactly, so DRUFF-4's converter round-trips it untouched —
DRUFF-9 adds **no** new serialization code; it only has to write well-formed objects.

**Non-goal guard (binding).** Per "Druff never executes user code": `expression` strings and
`constant` literals are captured and stored **as authored** and are never parsed or `eval`'d. Note
`constant` authoring may `JSON.parse` the user's text purely as *data deserialization* to obtain a
typed literal (string/number/boolean/null) — that is not code execution — but there is never any
evaluation of `expression`. The Monaco widget (if used for `expression`) runs in plain-text mode
with no language service that executes anything.

### Interfaces this ticket depends on (from DRUFF-8 / DRUFF-7)

Declared here as the contract DRUFF-9 builds against; if DRUFF-8/DRUFF-7 land these with different
names, only the container's wiring changes, not the pure logic:

- **DRUFF-8 store**: `updateEdgeData(id: string, patch: Partial<CanvasEdgeData>)` on `GraphState`
  (patch-merges into the React Flow edge's `data`; `CanvasEdgeData` is the shape already declared in
  `canvas-convert.ts` — `{ mappings?, join?, metadata? }`), and a `selectSelectedEdge(state): Edge | null`
  selector mirroring `selectSelectedNode` (sole selected edge, else `null`).
- **DRUFF-8 shell**: `EdgeInspector` renders category sections for the selected edge; DRUFF-9 mounts
  `<EdgeMappingsEditor />` as its "Mappings" section.
- **DRUFF-7**: nodes carry `data.fields: NodeField[]` (already on `PipelineNodeData`); these declared
  fields are the vocabulary the source/target pickers resolve against.
- **Endpoint-field resolution**: add a selector `selectEdgeEndpointFields(edge)` (or resolve inline
  in the container) that looks up the `from`/`to` nodes by `edge.source`/`edge.target` and returns
  `{ sourceFields, targetFields }` from each node's `data.fields ?? []`.

### Components / modules

- **`edgeMappings.ts`** (pure, no React) — immutable edit ops over `FieldMapping[]` and the
  transformation-shape normalization that keeps every produced object schema-valid:
  - `addMapping(mappings, target?)` → append a new mapping (`{ source: null, target: "", transformation: null, metadata: {} }`).
  - `removeMapping(mappings, index)`, `moveMapping(mappings, index, dir)` (reorder via up/down —
    ordering is meaningful, `mappings` is an ordered list; button-based reorder is jsdom-testable,
    unlike drag).
  - `setMappingField(mappings, index, patch: Partial<Pick<FieldMapping, "source" | "target">>)`.
  - `setTransformationKind(mappings, index, kind: TransformationKind)` — the key normalizer:
    - `direct` → `transformation: null` (Dander's canonical "plain copy, no payload"; keeps the
      dump minimal and matches `transformation` defaulting to `null`).
    - `expression` → `{ kind: "expression", expression: <preserved-or-"">, constant: null, inputs: <preserved ?? []>, metadata: <preserved ?? {}> }`.
    - `constant` → `{ kind: "constant", expression: null, constant: <preserved-or-null>, inputs: <preserved ?? []>, metadata: <preserved ?? {}> }`.
    Switching kind **clears the other kind's payload** (enforces the mutually-exclusive rule by
    construction, not just by validation) while preserving `inputs`/`metadata` so a stray kind toggle
    doesn't silently drop pre-existing data DRUFF-9 doesn't edit.
  - `setExpression(mappings, index, expression: string)`, and `setConstant(mappings, index, value: unknown)`.
  - `derivedKind(mapping): TransformationKind` — reads the current kind for the selector
    (`transformation?.kind ?? "direct"`).
- **`validateMapping.ts`** (pure) — `validateMapping(mapping): MappingError[]` returning actionable,
  field-anchored messages for the **shape** rules Dander's model enforces (explicitly *not* semantic
  field-wiring, which stays Dander's job per DRUFF-4 "Out of scope"):
  - missing `target` → "Every mapping must write a target field."
  - no `source` **and** no expression/constant payload → "A derived mapping (no source) needs an
    expression or constant." (the source-or-transformation rule).
  - both `expression` and `constant` present on the transformation → "A transformation is either an
    expression or a constant, not both." (mutual exclusion — normally unreachable because
    `setTransformationKind` clears the other, but validated defensively for imported graphs).
  - `kind: "expression"` with empty/whitespace `expression` → "Expression can't be empty."
  A companion `validateMappings(mappings)` returns errors keyed by index for the list-level render.
  Errors are a typed struct (`{ field: "target" | "source" | "transformation" | "expression"; message: string }`),
  mirroring `validateConnectorConfig`'s error shape so `MappingRow` can anchor each message to its
  control.
- **`MappingRow.tsx`** (presentational, `'use client'`) — one mapping row; props: the `FieldMapping`,
  `sourceFields`/`targetFields: NodeField[]`, its `MappingError[]`, position/`isFirst`/`isLast`, and
  callbacks (`onChange`, `onRemove`, `onMove`). Controls:
  - **target** picker — native `<select>` over `targetFields` (jsdom/RTL-friendly via
    `selectOptions`; deliberately not Radix `Select`, which is unreliable under jsdom per
    `typescript.md`). When the `to` node declares no fields yet, render a disabled placeholder with a
    hint ("Declare fields on the target node first") rather than a free-text box — keeps `target`
    honest to DRUFF-7's declared vocabulary.
  - **source** picker — native `<select>` over `sourceFields` plus an explicit "(derived — no
    source)" option that sets `source: null`.
  - **kind** selector — native `<select>` over `direct | expression | constant`.
  - **expression** — a `<textarea>` (or Monaco in plain-text mode) shown only when kind is
    `expression`; stored verbatim, never evaluated.
  - **constant** — a small `ConstantValueEditor` shown only when kind is `constant`: a type selector
    (`string | number | boolean | null`) plus a value input, disabled/hidden when type is `null`.
    This makes a **real `null` constant explicit and distinguishable from "not provided"** (the AC):
    a `constant` transformation is always a present object with `constant` set (possibly the literal
    `null`), whereas a `direct` mapping has `transformation: null` and no constant at all. The value
    input's text is turned into a typed literal by the selected type (number via `Number`, boolean
    via a true/false toggle, string verbatim) — data coercion only, no evaluation.
  - remove + move-up/move-down buttons (mirrors `NodeConfigEditor`'s icon buttons).
- **`EdgeMappingsEditor.tsx`** (store-connected container, `'use client'`) — resolves the selected
  edge and endpoint fields from the store, maps `mappings` to `MappingRow`s, and on any row callback
  computes the next array with an `edgeMappings.ts` op and calls `updateEdgeData(edge.id, { mappings: next })`.
  Renders an "Add mapping" button and an empty-state line. This is the piece DRUFF-8's `EdgeInspector`
  mounts.

### Data flow

Store (`edges[i].data.mappings`) → `selectSelectedEdge` + `selectEdgeEndpointFields` →
`EdgeMappingsEditor` → `MappingRow` (with per-row `validateMapping` errors) → user edit → pure
`edgeMappings.ts` op → `updateEdgeData(id, { mappings })` → store → re-render. No mapping state lives
outside the store. On save/load, DRUFF-4's `edgeToGraphEdge`/`graphEdgeToCanvasEdge` already carry
`data.mappings` verbatim, so round-trip is inherited, not re-implemented.

### Files to touch / create

- **create** `src/features/pipeline-canvas/inspector/edgeMappings.ts` — pure edit ops + kind
  normalization.
- **create** `src/features/pipeline-canvas/inspector/edgeMappings.test.ts` — unit tests
  (add/remove/reorder, kind switch clears the other payload, `inputs`/`metadata` preserved, explicit
  null constant survives). Non-sensitive fixtures only.
- **create** `src/features/pipeline-canvas/inspector/validateMapping.ts` — shape-rule validation.
- **create** `src/features/pipeline-canvas/inspector/validateMapping.test.ts` — unit tests for each
  rule (source-or-transformation, mutual exclusion, empty expression, missing target).
- **create** `src/features/pipeline-canvas/inspector/MappingRow.tsx` — presentational row.
- **create** `src/features/pipeline-canvas/inspector/EdgeMappingsEditor.tsx` — store-connected
  category container.
- **create** `src/features/pipeline-canvas/inspector/EdgeMappingsEditor.test.tsx` — component test
  over a fixture store (add a mapping, pick target/source, switch to expression/constant, assert
  `updateEdgeData` receives well-formed objects; assert an inline error renders for a derived mapping
  with no payload). Follows `NodeInspector.test.tsx`'s store-binding pattern.
- **edit** `src/features/pipeline-canvas/inspector/EdgeInspector.tsx` (owned by DRUFF-8) — mount
  `<EdgeMappingsEditor />` in its Mappings section.
- **maybe add** `src/components/ui/textarea.tsx` — shadcn `Textarea` primitive if not already present
  (for the expression field); trivial, no new dependency (Radix not required). Reuse Monaco only if
  DRUFF-14's code widget already exists.
- **reference/no-change** `src/lib/pipeline-graph/schema.ts`, `src/lib/pipeline-graph/canvas-convert.ts`
  — the target shape and the round-trip seam; DRUFF-9 conforms to them.

### Trade-offs

- **Pure logic module vs. logic inside the component.** Chosen: extract, matching `nodeConfig.ts` /
  `validateConnectorConfig.ts`. The AC explicitly requires the edit *and* validation logic to be
  unit-tested; keeping it framework-free makes those tests trivial and keeps `MappingRow` dumb.
- **`direct` → `transformation: null` (vs. a `{kind:"direct"}` object).** Chosen: `null`. It matches
  Dander's default (`transformation` defaults to `null`) and its minimal dump, so a plain copy adds
  nothing to the on-disk file. *Flag:* confirm against Dander that a direct/plain-copy mapping dumps
  with `transformation` omitted/`null` rather than an explicit `{kind:"direct"}` — if Dander emits the
  latter, switch the normalizer to produce it (the round-trip test will catch a mismatch either way).
- **Normalize-on-kind-switch (clear the other payload) vs. validate-only.** Chosen: normalize, so the
  mutual-exclusion rule holds by construction and the store never holds a both-set transformation;
  validation still covers it defensively for imported graphs.
- **Native `<select>`/`<textarea>` vs. Radix `Select`/Monaco.** Chosen: native, per `typescript.md`
  (Radix Select is unreliable under jsdom; drag/canvas interactions are the only things pushed to
  Playwright). Cheaper, accessible, unit-testable. Monaco is reserved for larger code widgets
  (DRUFF-14) and would be plain-text only here anyway.
- **Store-connected container + presentational row vs. one big store-coupled component.** Chosen:
  split, so `MappingRow` is testable in isolation (data-in/callbacks-out) and the container stays a
  thin projection of the store — the exact `NodeInspector` → `NodeConfigEditor` shape already in the
  repo.

### Test seams

- `edgeMappings.ts` / `validateMapping.ts`: pure unit tests, no mocks, non-sensitive fixtures.
- `EdgeMappingsEditor.test.tsx`: binds a fresh vanilla store (`createStore(createGraphState(fixture))`)
  like `NodeInspector.test.tsx`; no network — there is none in this feature (all edits are local store
  mutations). Assert the objects handed to `updateEdgeData` match the schema keys.
- Round-trip is covered by DRUFF-4's existing `round-trip.test.ts`; add a fixture edge carrying an
  `expression` and a `constant` (incl. explicit `null`) mapping there if not already present, to lock
  the on-disk keys.

### Flags / under-specified

- **Constant literal breadth.** This design supports `string | number | boolean | null` constants
  (covers "explicit literal incl. real null"). Arrays/objects/JSON literals are *not* in scope here —
  flag for product if Dander constants need richer literals; the `constant: unknown` model already
  permits them, so it's a UI-scope decision, not a model change.
- **`transformation.inputs` authoring.** The round-trip AC lists `inputs`, but no AC asks the user to
  *edit* it. This design **preserves** `inputs` untouched across edits and defaults new ones to `[]`;
  authoring `inputs` (naming which upstream fields an expression consumes) is deferred — flag if
  product wants it in this ticket.
- **Endpoint fields empty.** If a `from`/`to` node has no declared fields yet (DRUFF-7 not authored),
  the pickers render a disabled hint rather than free text. Confirm this is the desired UX vs.
  allowing a free-typed field name (which would let a mapping reference a field the node doesn't
  declare — a semantic error Dander would catch, but arguably better prevented here).

## Implementation Notes

Implemented per Design; two deliberate deviations noted below (both flagged as "either" options in
the Design itself), everything else built as specified.

- **`src/features/pipeline-canvas/inspector/edgeMappings.ts`** (new) — pure, React-free ops over
  `FieldMapping[]`: `addMapping`, `removeMapping`, `moveMapping` (clamped at both ends, mirrors
  `nodeFields.ts`'s `moveField`), `setMappingField` (source/target patch), `derivedKind`, and the
  key normalizer `setTransformationKind` (`direct` → `transformation: null`; `expression`/`constant`
  → a well-formed object with the *other* kind's payload cleared but `inputs`/`metadata` preserved),
  plus `setExpression`/`setConstant` (no-ops when the mapping has no transformation yet, which the
  UI never triggers since those controls only render for their matching kind). **One deliberate
  simplification vs. `nodeFields.ts`'s `FieldRow`:** no client-only row-id wrapper — `MappingRow` is
  fully controlled by props with zero local state, so a plain array index is a safe, sufficient
  identity for reordering (a swap just changes the props at each existing DOM position; nothing
  needs to remount). Documented in the module's doc comment.
- **`src/features/pipeline-canvas/inspector/edgeMappings.test.ts`** (new) — unit tests: add/remove/
  move (incl. clamping and out-of-range no-ops), `setMappingField`, `derivedKind`, every
  `setTransformationKind` transition (direct→expression, direct→constant, expression→constant and
  back, re-selecting the same kind, both preserving `inputs`/`metadata` across a switch including an
  explicit-`null`-constant case), and `setExpression`/`setConstant` (incl. storing an explicit `null`
  constant and no-op on a `direct` mapping). Non-sensitive fixtures only.
- **`src/features/pipeline-canvas/inspector/validateMapping.ts`** (new) — `validateMapping`/
  `validateMappings` per the Design's four shape rules exactly: missing/blank `target`; no `source`
  and no `transformation` (any transformation object counts, including an explicit-`null`-constant
  one — that's a deliberate derive-as-null, not "nothing provided"); both `expression` and a
  non-null `constant` present at once (checked defensively — `setTransformationKind` never produces
  this from this editor's own edits); and an empty/whitespace `expression` when `kind: "expression"`.
  Returns a typed `{ field, message }[]`, mirroring `validateConnectorConfig`'s error shape.
- **`src/features/pipeline-canvas/inspector/validateMapping.test.ts`** (new) — a passing case per
  rule, a failing case per rule, an accumulated-multi-error case, and `validateMappings`' by-index
  keying (including the empty-object "all valid" case).
- **`src/features/pipeline-canvas/inspector/MappingRow.tsx`** (new) — presentational row: native
  `<select>`s for target/source/kind (no Radix `Select`, per `typescript.md`), a plain shadcn
  `Textarea` for `expression` (plain-text only — never evaluated), and an inline
  `ConstantValueEditor` (type selector `string|number|boolean|null` + a matching value control) so a
  real `null` constant is explicit and distinguishable from "not provided." The target picker
  renders a disabled `<select>` with a "Declare fields on the target node first" hint when the
  target node has no declared fields yet (per the Design's flagged UX choice); the source picker
  always offers an explicit "(derived — no source)" option. Fully controlled — no local state, no
  store access — errors are rendered inline next to the control they're about (`target`/`source`
  under the field row; `transformation`/`expression` under the kind selector/textarea).
- **`src/features/pipeline-canvas/inspector/EdgeMappingsEditor.tsx`** (new) — the store-connected
  "Mappings" category container: reads `edge.data.mappings` and resolves both endpoint nodes'
  declared fields **inline** (a small `fieldsForNode` helper) rather than as a separately-exported
  `selectEdgeEndpointFields` — the Design offered either, and inline keeps the lookup colocated with
  its only caller. Every row callback computes the next array via an `edgeMappings.ts` op and calls
  `updateEdgeData(edge.id, { mappings: next })` directly — no local mirror of the mapping array, so
  the panel can never drift from the canvas. Renders an "Add mapping" button and a "No field
  mappings yet." empty state.
- **`src/features/pipeline-canvas/inspector/EdgeMappingsEditor.test.tsx`** (new) — a
  `LiveEdgeMappingsEditor` test wrapper (subscribes to the store by edge id), mirroring
  `NodeInspector.test.tsx`'s `LiveNodeInspector` — needed for the same reason: a fully-controlled
  child needs a fresh prop per store write across multi-step interactions (add, then edit the new
  row). Covers: empty state; add persists a well-formed blank mapping; picking target/source
  persists both; the derived-source option resets `source` to `null`; switching kind to
  `expression`/`constant`/back to `direct` persists the normalized transformation (incl. asserting
  the `constant` kind's explicit `{constant: null}` object is distinct from a `direct` mapping's
  `transformation: null`); the number-constant-type coercion; remove; reorder; an inline validation
  error renders for a derived mapping with no transformation and clears once a source is picked; and
  the disabled-target-picker hint when the target node has no declared fields. **One deviation from
  the Design's "Test seams" note:** it describes binding "a fresh vanilla store
  (`createStore(createGraphState(fixture))`)," but the actual `NodeInspector.test.tsx`/
  `EdgeInspector.test.tsx` precedent already in the repo uses the app-wide store singleton
  (`useGraphStore.getState()`/`setState`/`afterEach` restore) instead — this file follows that
  established, working convention for consistency with its sibling test files rather than the
  Design's literal (and inconsistent-with-the-codebase) description.
- **`src/features/pipeline-canvas/inspector/EdgeInspector.tsx`** (edit, owned by DRUFF-8) — the
  Mappings section now mounts `<EdgeMappingsEditor edge={edge} />` in place of the DRUFF-8
  placeholder text; the Join section's "Added in a later step." placeholder is untouched (DRUFF-10).
- **`src/features/pipeline-canvas/inspector/EdgeInspector.test.tsx`** (edit) — updated the two tests
  that asserted two "Added in a later step" placeholders: now asserts one (Join only) plus the
  Mappings section's real empty state / rendered mapping. Gave `NODE_A`/`NODE_B` declared `fields`
  (an `id` field each) so the existing-data fixture's mapping (`target: "id"`) resolves against a
  real target field instead of hitting the "no declared fields" disabled state.
- **`src/lib/pipeline-graph/round-trip.test.ts`** (edit) — added `CONSTANT_MAPPING_GRAPH`, a
  dedicated fixture with a `direct` mapping, a `constant` mapping with a real value (`"active"`),
  and a `constant` mapping with an **explicit `null`** literal, and asserted graph → canvas → graph
  → YAML/JSON → graph is the identity over both formats. `EXAMPLE_GRAPH` already covered an
  `expression` transformation with `inputs`; this fixture locks the `constant` half of the on-disk
  keys the Design's "Test seams" note called out. No `schema.ts`/`canvas-convert.ts` change was
  needed — the existing model already carries `constant`/`kind` losslessly (confirmed by this new
  test passing unmodified against the pre-existing converters).
- **`src/components/ui/textarea.tsx`** (new, generated) — added via `npx shadcn@latest add
  textarea` for the `expression` field, per the Design's "maybe add" note. No new dependency —
  matches `Input`'s existing class conventions; `package.json`/lockfile unchanged.

**Flags carried over from Design, not resolved here (as scoped):** constant literal breadth is
`string|number|boolean|null` only (arrays/objects out of scope); `transformation.inputs` is
preserved but not authored by this UI; a `from`/`to` node with no declared fields shows a disabled
hint rather than a free-text fallback for the target picker (the source picker always has the
derived option, so it never needs the same guard).

Toolchain run clean on the full repo: `eslint` clean; `prettier --check` clean on every
touched/created file (the pre-existing `README.md` formatting warning is unrelated and untouched);
`tsc --noEmit` clean; `vitest run` — 243/243 tests passing across 23 files, including the four new
test files this ticket adds and the two edited pre-existing ones.

## Review Log

_Append-only. PR-Review adds entries below._

### 2026-07-23 — PASS

Reviewed the implementation against all eight acceptance criteria, the steering files
(`01-security.md`, `02-engineering.md`, `languages/typescript.md`), and the approved Design.
Inspected every named file. Verdict: **PASS**.

**Acceptance criteria — all met:**

1. **Mappings category / CRUD+reorder persisted through the store.** `EdgeInspector.tsx` mounts
   `<EdgeMappingsEditor edge={edge} />` in a labelled "Mappings" section. `EdgeMappingsEditor.tsx`
   renders one `MappingRow` per mapping plus an "Add mapping" button and a "No field mappings yet."
   empty state; every row callback (`onTargetChange`/`onSourceChange`/`onKindChange`/
   `onExpressionChange`/`onConstantChange`/`onRemove`/`onMove`) computes the next array via a pure
   `edgeMappings.ts` op and commits through `updateEdgeData(edge.id, { mappings: next })` — no local
   `useState` mirror, so the panel can't drift from the canvas. Verified by
   `EdgeMappingsEditor.test.tsx` (add/pick/remove/reorder all assert the store contents).
2. **target from `to`-node fields; source from `from`-node fields or derived.** `fieldsForNode`
   resolves each endpoint's `data.fields`; `MappingRow` target/source pickers are native `<select>`s
   over those vocabularies, with an explicit "(derived — no source)" option mapping to `source: null`
   and a disabled "Declare fields on the target node first" hint when the `to` node declares none.
3. **kind direct/expression/constant, payload rules, explicit-null constant.** `setTransformationKind`
   normalizes `direct → transformation:null`, `expression`/`constant → well-formed object with the
   other kind's payload cleared. `ConstantValueEditor` exposes `string|number|boolean|null`, so a real
   `null` constant is a present `{constant:null}` object distinct from `direct`'s `transformation:null`.
   Coercion is data-only (`Number`, boolean toggle, raw string) — no `JSON.parse`/eval.
4. **Shape rules as inline, non-crashing messages.** `validateMapping.ts` returns typed
   `{field,message}[]` for missing target, source-or-transformation, expression/constant mutual
   exclusion (checked defensively for imported graphs), and empty expression; `MappingRow` anchors each
   message to its control. Verified error renders then clears in the component test.
5. **Never parsed/evaluated in the browser.** Grepped the changed files: no `eval`, `new Function`,
   `dangerouslySetInnerHTML`, or expression `JSON.parse`. Expression is a plain `<textarea>` stored
   verbatim; constant is captured via typed inputs only.
6. **Round-trip unchanged, Dander keys.** No `schema.ts`/`canvas-convert.ts` change needed;
   `round-trip.test.ts` adds `CONSTANT_MAPPING_GRAPH` (direct, real-value constant, and explicit-`null`
   constant) asserting graph → canvas → graph → YAML/JSON → graph identity over both formats; passes.
7. **Logic unit-tested, non-sensitive fixtures.** `edgeMappings.test.ts`, `validateMapping.test.ts`,
   and `EdgeMappingsEditor.test.tsx` cover the edit ops, every kind transition (incl.
   `inputs`/`metadata` preservation and explicit-null survival), all four validation rules, and the
   store-bound component flows. All fixtures are synthetic tokens.
8. **No steering violations.** No secrets/PII anywhere in the diff; no browser-storage writes; native
   `<select>`/`<textarea>` per `typescript.md` (Radix Select avoided under jsdom); interface-first pure
   modules with the store side-effect pushed into the container; TSDoc on every export; `package.json`/
   lockfile untouched (the new `textarea.tsx` is a trivial local shadcn primitive).

**Toolchain re-run at review time (not just trusting the notes):** `tsc --noEmit` clean; `eslint` clean
on all changed files; `prettier --check` clean on all touched/created files; `vitest run` — **243/243
tests across 23 files** pass, including the ticket's 5 relevant test files (65 tests).

The two Implementation-Notes deviations (inline endpoint-field resolution instead of a separate
`selectEdgeEndpointFields` selector; the store-singleton test pattern instead of the Design's literal
`createStore(...)` wording) are both explicitly offered as "either" in the Design and match existing
sibling-file precedent — justified, not regressions. No blocking issues.
