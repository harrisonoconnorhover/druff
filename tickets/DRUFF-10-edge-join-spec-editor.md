---
id: DRUFF-10
title: Edge join spec editor
status: done
component: frontend
epic: edge-editing
depends_on: [DRUFF-7, DRUFF-8]
created: 2026-07-23
---

## Context

An `Edge` in Dander may carry an optional `join: JoinSpec` for a connection that combines two sources
(see `../dander/src/dander/pipeline/README.md`, "Join specification"). A `JoinSpec` has a `type:
JoinType` (`inner`/`left`/`right`/`full`) and an ordered `keys: list[JoinKeyPair]` where each pair
has a `left` field name (on the edge's source/`from` node) and a `right` field name (on the edge's
target/`to` node); **at least one pair is required**. Join is opaque and inert — Druff records join
*intent* only; no SQL is generated or executed here.

Building on edge inspection (DRUFF-8) and per-node declared fields (DRUFF-7), this ticket adds an
optional **join editor** for a selected edge. DRUFF-4 already models `JoinSpec`/`JoinKeyPair`/
`JoinType`; this is the authoring UI plus the shape rules, with left/right key choices drawn from the
correct side's declared fields.

## Acceptance Criteria

- [ ] Selecting an edge shows a "Join" category that lets the user optionally define or remove a
      `JoinSpec`; when absent, the edge stays join-less (Dander omits `join` entirely, not `null`) —
      persisted through the store (DRUFF-8).
- [ ] The join `type` can be set to `inner`, `left`, `right`, or `full` (Dander's `JoinType`).
- [ ] The user can add/edit/remove/reorder an ordered list of `left`/`right` key pairs; `left` is
      chosen from the source/`from` node's declared fields and `right` from the target/`to` node's
      declared fields (DRUFF-7), matching Dander's left=from / right=to orientation.
- [ ] Dander's rule that a defined `JoinSpec` has **at least one** key pair is enforced with an
      actionable inline message (not a crash); a join with zero pairs cannot be saved as a defined
      join.
- [ ] The edge's `join` round-trips through canvas ⇄ graph ⇄ YAML/JSON unchanged, matching Dander's
      on-disk keys (`type`, `keys[].left`/`right`), and a join-less edge round-trips with no `join`
      key (via DRUFF-4).
- [ ] The join edit/validation logic is unit-tested with non-sensitive fixtures (see
      `steering/02-engineering.md`).
- [ ] No steering violations (secrets, style, docs).

## Design

### Approach

This ticket is **UI + shape-rules only**. Everything below the UI already exists and must not be
re-invented:

- **Model** — `JoinSpec` / `JoinKeyPair` / `JoinType` are already defined in DRUFF-4's
  `src/lib/pipeline-graph/schema.ts` (`JoinSpecSchema` = `{ type, keys: min(1), metadata }`,
  `JoinKeyPairSchema` = `{ left, right }`, `JoinTypeSchema` = `inner|left|right|full`), with
  `PipelineEdge.join` typed as an **optional key** (absent, not `null`, when join-less) and
  `withNullJoinOmitted` normalizing a hand-authored `join: null` to an absent key.
- **Round-trip** — `canvas-convert.ts` already carries `edge.data.join` through
  canvas ⇄ graph ⇄ YAML/JSON untouched in both directions (`edgeToGraphEdge` reads `data.join`,
  `graphEdgeToCanvasEdge` writes it back), and a join-less edge already round-trips with no `join`
  key. **No schema, serializer, or converter change is required** for AC5 — this ticket must only
  produce a `JoinSpec` in exactly that shape and not regress it.
- **Edge foundation (DRUFF-8)** — provides edge selection binding the inspector to one edge, the
  store action to update an edge's `data` (e.g. `updateEdgeData(id, patch)`), and an edge-scoped
  inspector surface that resolves the edge's `from`/`to` nodes and hosts per-edge **categories**
  (the "Mappings" category is DRUFF-9's; this ticket adds the "Join" category alongside it).
- **Node fields (DRUFF-7)** — each node carries `data.fields: NodeField[]`; `left` key options come
  from the **source/`from`** node's fields, `right` from the **target/`to`** node's fields.

So DRUFF-10 = one **pure logic module** (join edit operations + validation, unit-tested per AC6)
plus one **presentational component** (`JoinEditor`) mounted as the edge inspector's "Join"
category, with left/right field pickers fed from the correct side's declared fields.

The editing model follows DRUFF-3/DRUFF-9's **store-driven, no-local-mirror** rule: every edit
recomputes the whole `JoinSpec` and writes it straight back through `updateEdgeData(edge.id,
{ join })`, so the inspector can never drift from the canvas/store. There is **no** `useState`
copy of the join.

### The "at least one pair" invariant (AC4) — enforced by construction

To satisfy "a join with zero pairs cannot be saved as a defined join" while keeping edits
store-live, the store's `edge.data.join` is kept **always valid or absent** — a zero-pair defined
join is made unrepresentable rather than reachable-then-blocked:

- **Add join** seeds `createJoinSpec()` = `{ type: "inner", keys: [{ left: "", right: "" }],
  metadata: {} }` — valid by construction (one pair) from the first render.
- **Remove join** deletes the key entirely → edge becomes join-less (`updateEdgeData` with
  `join: undefined`), matching Dander omitting `join` rather than writing `null`.
- Within a defined join, the **remove control on the last remaining pair is disabled** with an
  actionable inline message ("A join needs at least one key pair — use *Remove join* to make this
  connection join-less."). Down-to-one is the floor; the whole-join removal is the only exit.

`validateJoinSpec` is still the single source of the inline messages and is what AC6 unit-tests: it
returns the zero-pair rule (backstops any imported/edge-case spec by surfacing a message, never a
crash) plus per-pair advisory hints for a blank `left`/`right` ("choose a field"). Blank field
names remain structurally serializable (`JoinKeyPairSchema` has no non-empty constraint), so they
are advisory, not a save-blocker — only the zero-pair rule gates "defined join", and that gate is
held by construction.

### Interfaces / modules

**1. Pure logic — `src/features/pipeline-canvas/inspector/joinSpec.ts`** (no React, no store, no
network — fully unit-testable):

```ts
import type { JoinSpec, JoinKeyPair, JoinType } from "@/lib/pipeline-graph";

/** The four Dander join types, in display order (drives the type picker; config-driven, not branched). */
export const JOIN_TYPES: readonly JoinType[] = ["inner", "left", "right", "full"];

/** A freshly-defined join: valid-by-construction with one blank key pair (the >=1 rule holds from t=0). */
export function createJoinSpec(): JoinSpec;

export function setJoinType(spec: JoinSpec, type: JoinType): JoinSpec;
export function addKeyPair(spec: JoinSpec): JoinSpec;                                   // append blank pair
export function updateKeyPair(spec: JoinSpec, index: number, patch: Partial<JoinKeyPair>): JoinSpec;
export function removeKeyPair(spec: JoinSpec, index: number): JoinSpec;                 // total; may yield []
export function moveKeyPair(spec: JoinSpec, from: number, to: number): JoinSpec;        // reorder (bounds-safe no-op)

export type JoinValidation = {
  ok: boolean;                                             // false iff keys.length === 0 (defined-join gate)
  message?: string;                                        // spec-level message when !ok
  keyErrors: Record<number, { left?: string; right?: string }>;  // per-pair blank-field advisories
};
export function validateJoinSpec(spec: JoinSpec): JoinValidation;
```

All operations are **pure and immutable** (return a new spec, preserve `metadata` and untouched
pairs) so the component stays a thin projection. `removeKeyPair` is intentionally *total* (can
return `keys: []`) so the rule is testable in isolation; the "can't empty it" invariant lives at
the component boundary (disabled last-pair control), mirroring how `NodeConfigEditor` keeps
list-mechanics in the component.

**2. Presentational — `src/features/pipeline-canvas/inspector/JoinEditor.tsx`** (`'use client'`,
controlled, no store access — same seam shape as `ConnectorConfigForm`/`NodeConfigEditor`):

```ts
export type JoinEditorProps = {
  join: JoinSpec | undefined;          // absent = join-less edge
  leftFields: NodeField[];             // from/source node's declared fields (DRUFF-7)
  rightFields: NodeField[];            // to/target node's declared fields (DRUFF-7)
  onChange: (join: JoinSpec | undefined) => void;   // undefined => remove the join key
};
```

Render contract:
- `join === undefined` → an **"Add join"** button (calls `onChange(createJoinSpec())`).
- `join` present → a **type** picker over `JOIN_TYPES`; the ordered **key-pair list**, each row a
  `left` field select (options = `leftFields`), a `right` field select (options = `rightFields`),
  reorder up/down controls (`moveKeyPair`), and a remove control (`removeKeyPair`, disabled on the
  sole remaining pair); an **"Add key pair"** button; a **"Remove join"** button
  (`onChange(undefined)`); and the `validateJoinSpec` messages inline (spec-level + per-pair).
- **Preserve out-of-vocabulary values.** A `left`/`right` that names a field not in the node's
  declared list (e.g. an imported graph, or fields not yet authored) must still render as the
  selected value and never be silently dropped — surface it as a distinct "not a declared field"
  option rather than resetting it. If a side has **no** declared fields, show a hint pointing at
  DRUFF-7 ("declare fields on the … node") but still render any stored value.

**3. Field picker primitive — `src/components/ui/select.tsx`** (shadcn/Radix `Select` wrapper).
`@radix-ui/react-select` is already in the lockfile but no shadcn wrapper exists yet. DRUFF-9's
mapping editor needs the same picker, so this is **shared plumbing**: add it if a sibling ticket
hasn't already. Acceptable fallback: a Tailwind-styled native `<select>` (simplest, fully
jsdom-testable) — flagged as an implementation choice, not a hard requirement.

**4. Integration — mount the Join category in DRUFF-8's edge inspector.** The edge inspector
resolves the selected edge and looks up its `from`/`to` nodes from the store (`state.nodes`), then
renders `<JoinEditor join={edge.data?.join} leftFields={fromNode?.data.fields ?? []}
rightFields={toNode?.data.fields ?? []} onChange={(join) => updateEdgeData(edge.id, { join })} />`.
The exact file/prop names depend on DRUFF-8's realized structure (see *Flags* below); the
`JoinEditor` seam is designed to drop into whatever category slot DRUFF-8 exposes.

### Data flow / state

```
edge selected (DRUFF-8) → edge inspector resolves edge + from/to nodes from store
   → <JoinEditor join=edge.data.join leftFields=from.fields rightFields=to.fields onChange=…>
   → user edit → pure joinSpec.ts op recomputes JoinSpec
   → onChange(nextJoin) → updateEdgeData(edge.id, { join: nextJoin | undefined })  (DRUFF-8 store)
   → store re-renders inspector (projection) + canvas edge
   → save (DRUFF-5) → canvasToGraph → serialize (Zod) → YAML/JSON, join keys type / keys[].left/right
```

State lives only in the store. `JoinEditor` is a pure function of props. No effects, no fetch, no
network — nothing in this ticket touches Dander's backend.

### Files to touch / create

| File | Action | Purpose |
|---|---|---|
| `src/features/pipeline-canvas/inspector/joinSpec.ts` | create | Pure edit ops + `validateJoinSpec` + `JOIN_TYPES`. |
| `src/features/pipeline-canvas/inspector/joinSpec.test.ts` | create | Unit tests (AC6) — non-sensitive fixtures. |
| `src/features/pipeline-canvas/inspector/JoinEditor.tsx` | create | The "Join" category UI. |
| `src/components/ui/select.tsx` | create *(if not already added by DRUFF-9)* | Shared field-picker primitive. |
| DRUFF-8's edge inspector component (e.g. `…/inspector/EdgeInspector.tsx`) | edit | Mount `JoinEditor` as the Join category, wiring `from`/`to` fields + `updateEdgeData`. |

**No changes** to `schema.ts`, `serialize.ts`, or `canvas-convert.ts` — the join model and its
round-trip already exist (DRUFF-4). If the Code agent finds any `JoinSpec` key not already carried,
that is a DRUFF-4 gap to flag, not to patch inline.

### Trade-offs

- **Invariant by construction vs. reachable-then-blocked.** Seeding one pair + disabling the last
  remove keeps the store always-valid, so serialize can never hit `JoinSpecSchema`'s `min(1)` and
  fail — at the cost that a defined join always shows one (possibly blank) pair. Chosen because it
  matches the store-driven no-drift rule and makes the AC4 gate structural rather than a hope.
- **Blank field names advisory, not blocking.** Only zero-pairs gates "defined join" (matches AC4's
  exact wording and Dander's model, which constrains pair *count*, not emptiness). Blank left/right
  get an inline hint but still serialize — avoids inventing a stricter rule than Dander enforces.
- **Pure logic split from the component.** Puts all the tested behavior in `joinSpec.ts` (jsdom-free,
  fast) and keeps `JoinEditor` a thin projection — same split as `nodeConfig.ts`/`NodeConfigEditor`.
- **Native `<select>` fallback allowed.** Radix `Select` is portal-based and awkward under
  jsdom/RTL; since AC6 only requires the *logic* tested (component drag/pointer is Playwright per
  `typescript.md`), a native select is a legitimate, simpler choice.

### Test seams (AC6)

- **`joinSpec.test.ts`** unit-tests the pure module with plain non-sensitive fixtures (field names
  like `id`, `account_id` — never real/sensitive values, per `steering/02-engineering.md`):
  `createJoinSpec` shape; `setJoinType`; `addKeyPair`/`updateKeyPair`/`removeKeyPair` (incl. down to
  `[]`) / `moveKeyPair` immutability + ordering + bounds; `validateJoinSpec` (`ok=false` + message
  on zero pairs; per-pair `keyErrors` on blank left/right; `ok=true` clean). Optionally assert
  `createJoinSpec()` and an edited spec parse clean through `JoinSpecSchema` and serialize to
  `type` / `keys[].left`/`right` — cheap guard that the editor output stays contract-shaped (AC5).
- **No network / no backend** — nothing here calls Dander; nothing to mock.
- **Component/interaction** — any real pointer/drag reorder behavior belongs in a Playwright e2e
  (per `typescript.md`), not a jsdom unit test; not required by this ticket's ACs.

### Flags / open questions (for Product / DRUFF-8 alignment)

- **DRUFF-8 not yet implemented at design time.** There is currently no edge selection,
  `updateEdgeData`, or edge inspector in the tree (the store handles nodes only). This design writes
  to DRUFF-8's *stated contract* (edge binding + `updateEdgeData` + category-hosting edge
  inspector). The Code agent must align the exact mount point / prop names to DRUFF-8's realized
  structure; the `JoinEditor` seam is deliberately structure-agnostic to absorb that.
- **Shared `select` primitive ownership.** DRUFF-9 and DRUFF-10 both need the field picker; whichever
  lands first should add `src/components/ui/select.tsx` (or the native fallback), the other reuses
  it. Not a blocker, just avoid two divergent pickers.
- **Reorder affordance.** Design specifies up/down controls (deterministic, jsdom-friendly) rather
  than drag-reorder; if Product wants drag-reorder it becomes a Playwright-tested interaction — flag
  rather than assume.

## Implementation Notes

Implemented exactly per Design, no schema/serializer/converter changes.

- **`src/features/pipeline-canvas/inspector/joinSpec.ts`** (new) — pure, immutable edit ops
  (`createJoinSpec`, `setJoinType`, `addKeyPair`, `updateKeyPair`, `removeKeyPair`, `moveKeyPair`)
  plus `validateJoinSpec`/`JoinValidation`/`JOIN_TYPES`, matching the Design's interface exactly.
  `moveKeyPair(spec, from, to)` is a generic, bounds-safe reorder (no-op on out-of-range `from`/`to`
  or `from === to`); the component drives it with adjacent indices for its up/down buttons.
- **`src/features/pipeline-canvas/inspector/joinSpec.test.ts`** (new) — unit tests per AC6: all six
  ops (incl. `removeKeyPair` down to `[]`, `moveKeyPair` immutability/ordering/bounds) and
  `validateJoinSpec` (zero-pair `ok=false` + message; per-pair blank-`left`/`right` advisories;
  clean `ok=true`), plus a cheap `JoinSpecSchema.parse` guard on `createJoinSpec()`'s output (AC5).
  Fixtures use synthetic field names only (`account_id`, `region`, …), no real/sensitive data.
- **`src/features/pipeline-canvas/inspector/JoinEditor.tsx`** (new) — the "Join" category: an
  "Add join" button when `join` is `undefined`; once defined, a `type` picker over `JOIN_TYPES`, an
  ordered key-pair list (each row: `left` select over `leftFields`, `right` select over
  `rightFields`, up/down reorder, remove — disabled on the sole remaining pair with the inline "use
  Remove join" message), an "Add key pair" button, a "Remove join" button
  (`onChange(undefined)`), and `validateJoinSpec`'s messages inline. The per-pair row is an internal
  (non-exported) `JoinKeyRow` helper in the same file — Design listed no separate row-component
  file, mirroring `MappingRow.tsx`'s own internal `ConstantValueEditor` pattern. Field pickers are
  plain native `<select>`s styled with the same `CONTROL_CLASS` convention `MappingRow` uses (the
  Design-sanctioned fallback; no shared `src/components/ui/select.tsx` existed yet and DRUFF-9
  landed with the same native-select choice, so this ticket followed suit rather than introducing a
  second, divergent picker primitive — flagging this per the Design's "shared `select` primitive
  ownership" open question, since neither ticket added it). Out-of-vocabulary stored values (e.g.
  from an imported graph) render as a distinct "`<value>` (not a declared field)" option rather than
  being dropped or reset; a side with zero declared fields shows a "Declare fields on the … node
  first" hint but still renders any stored value, per Design.
- **`src/features/pipeline-canvas/inspector/JoinEditor.test.tsx`** (new) — component-level tests via
  a small `useState`-backed harness (mirroring `EdgeMappingsEditor.test.tsx`'s live-rerender
  pattern, adapted since `JoinEditor` itself takes no store): add/remove join, field selection, type
  change, reorder, the last-pair-remove-disabled invariant re-triggering at exactly one pair,
  blank-field advisories appearing/clearing, and the out-of-vocabulary/no-declared-fields render
  contracts.
- **`src/features/pipeline-canvas/inspector/EdgeInspector.tsx`** (edited) — mounted `<JoinEditor>` in
  the existing "Join" `role="group"` slot in place of the placeholder text, resolving `leftFields`/
  `rightFields` from the store's `nodes` via a local `fieldsForNode` helper (same resolution
  `EdgeMappingsEditor` uses) and wiring `onChange` to `updateEdgeData(edge.id, { join })`.
- **`src/features/pipeline-canvas/inspector/EdgeInspector.test.tsx`** (edited) — updated the two
  tests that asserted the old "Added in a later step" Join placeholder to instead assert the real
  `JoinEditor` UI (the "Add join" button for a join-less edge; the join `type`/`left`/`right`
  selects reflecting `EDGE_WITH_DATA`'s existing fixture join).
- **No `src/components/ui/select.tsx`** — not added; DRUFF-9 didn't add one either (its `MappingRow`
  uses plain native selects), so this ticket followed the precedent already set in the tree rather
  than introducing a new shared primitive unilaterally.

Deviations from Design: none of substance. All interface names/signatures match the Design's
`joinSpec.ts`/`JoinEditor.tsx` contracts as specified.

Tooling (all clean): `eslint`, `tsc --noEmit`, `vitest run` (278/278 passing across 25 files,
including the 41 new/updated join-related tests). `prettier --check .` is clean for every file this
ticket touched; it still flags a pre-existing `README.md` formatting drift unrelated to this change
(not touched here).

## Review Log

_Append-only. PR-Review adds entries below._

### 2026-07-23 — PASS

Reviewed implementation against all acceptance criteria, the three universal steering files, and
`steering/languages/typescript.md`. Inspected every file named in the Implementation Notes.

**Acceptance criteria — all met:**

- **AC1 (Join category, optional define/remove, absent = join-less, persisted through store)** —
  `EdgeInspector.tsx` mounts `<JoinEditor>` in the existing `role="group"` "Join" slot, wiring
  `onChange` to `updateEdgeData(edge.id, { join })`. "Remove join" calls `onChange(undefined)`; the
  serializer (`serialize.ts:75`) omits an `undefined` join key entirely, so a removed join
  round-trips with no `join` key (never `null`) — verified by `serialize.test.ts` and
  `round-trip.test.ts` (both pass).
- **AC2 (type inner/left/right/full)** — `JOIN_TYPES` drives the type `<select>`; config-driven, not
  branched.
- **AC3 (add/edit/remove/reorder, left=from / right=to fields)** — all five ops present;
  `EdgeInspector.fieldsForNode` feeds `leftFields` from `edge.source` and `rightFields` from
  `edge.target`, matching Dander's orientation.
- **AC4 (>=1 pair enforced, actionable inline message, no crash, zero-pair not saveable)** — enforced
  by construction: `createJoinSpec` seeds one pair; the sole-remaining-pair remove control is disabled
  with an inline message; `validateJoinSpec` backstops any imported zero-pair spec with a message
  rather than a crash. Verified in unit + component tests.
- **AC5 (round-trip unchanged, join-less omits key)** — no schema/serializer/converter change made
  (correct — DRUFF-4 already carries `edge.data.join` through untouched); `round-trip.test.ts` and the
  `JoinSpecSchema.parse` guard confirm the editor's output stays contract-shaped.
- **AC6 (logic unit-tested, non-sensitive fixtures)** — `joinSpec.test.ts` covers all six ops
  (immutability, ordering, bounds, `removeKeyPair` down to `[]`) and `validateJoinSpec`;
  `JoinEditor.test.tsx` covers the interaction contracts incl. the last-pair-disabled invariant,
  out-of-vocabulary value preservation, and no-declared-fields hint. Fixtures use only synthetic field
  names (`account_id`, `region`, …).
- **AC7 (no steering violations)** — no credential-shaped literals in any touched file (grepped);
  typed exports with TSDoc throughout; pure logic split from the presentational component
  (interface-first, per `02-engineering.md`); native `<select>` fallback is a Design-sanctioned choice
  consistent with DRUFF-9's precedent.

**Tooling re-verified locally:** `tsc --noEmit` clean, `eslint` clean on all touched files, and the
join + round-trip + serialize + EdgeInspector test files pass (56/56). Implementation matches the
approved Design with no material deviation.

No blocking issues. Status → `done`.
