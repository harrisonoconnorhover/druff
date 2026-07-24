---
id: DRUFF-8
title: Edge inspection foundation (select an edge to inspect its data)
status: done
component: frontend
epic: edge-editing
depends_on: [DRUFF-1, DRUFF-3, DRUFF-4]
created: 2026-07-23
---

## Context

Edges on the canvas are purely visual today: the store (DRUFF-1) tracks them for connect/redraw, and
DRUFF-4's converters already carry an edge's `data.mappings`/`data.join` through canvas ⇄ graph ⇄
YAML/JSON opaquely, but nothing lets a user **select an edge and edit its data**. Dander's `Edge`
carries a `mappings: list[FieldMapping]` and an optional `join: JoinSpec` (see
`../dander/src/dander/pipeline/README.md`), and Druff's "Canvas" module calls for selecting and
editing edges, not just nodes.

This ticket adds the **edge-inspection foundation** that the field-mapping editor (DRUFF-9) and the
join-spec editor (DRUFF-10) both build on: selecting exactly one edge binds the inspector to that
edge, the store exposes an action to update an edge's `data`, and the inspector shows the edge's
identity (its source/from and target/to nodes) with an empty place for the mapping/join categories
those follow-on tickets fill. It deliberately ships no mapping/join editing UI itself.

## Acceptance Criteria

- [ ] Selecting exactly one edge on the canvas binds the inspector to that edge; deselecting or
      multi-selecting empties/clears it (consistent with the node inspector's DRUFF-3 behavior).
- [ ] The inspector distinguishes an edge selection from a node selection and shows the edge's
      identity — its source/`from` node and target/`to` node (by node name/id).
- [ ] The store exposes an action to update an edge's `data` (e.g. `updateEdgeData(id, patch)`), and
      edges carry a `data` shape able to hold Dander's `mappings` and `join` (per DRUFF-4). Editing
      state is store-driven, not inspector-local state that can drift from the canvas.
- [ ] An edge's `data` (including any `mappings`/`join` already present) round-trips through
      canvas ⇄ graph ⇄ YAML/JSON unchanged (via DRUFF-4).
- [ ] The edge-selection derivation and the store edge-update action are unit-tested with
      non-sensitive fixtures (see `steering/02-engineering.md`).
- [ ] No steering violations (secrets, style, docs).

## Design

### Approach

Edges already flow through the system opaquely: the store (DRUFF-1) holds `edges: Edge[]`, React
Flow writes `edge.selected` on selection via `applyEdgeChanges`, and DRUFF-4's converters already
round-trip an edge's `data.mappings`/`data.join`/`data.metadata` through canvas ⇄ graph ⇄ YAML/JSON
(the `example-graph` fixture exercises a `left`-join edge with mappings/`inputs` plus a join-less
edge, covered by `canvas-convert.test.ts` and `round-trip.test.ts`). What is missing is (a) a
**typed** edge-data shape so the store and inspector aren't reaching into `unknown`, (b) a
**store action** to edit an edge's `data`, (c) a **selection derivation** for edges, and (d) an
**inspector that binds to the selected edge** and shows its identity.

The design mirrors the node side exactly so the two halves stay symmetric and DRUFF-9 (mappings)
and DRUFF-10 (join) plug in the same way DRUFF-6/7 plugged into the node inspector:

- **Reuse `selectSelectedNode`'s derivation pattern for edges.** Selection is *not* tracked in a
  separate store field; it lives on `edge.selected` (React Flow writes it), so a new
  `selectSelectedEdge` derives "the one selected edge, or `null` for zero/multi" the same way
  `selectSelectedNode` does. One source of truth, multi-select unrepresentable as "the" edge.
- **Promote the edge-data shape to a shared type.** The edge-data shape is already defined —
  privately — as `CanvasEdgeData` in `canvas-convert.ts`. Promote it to an exported
  `PipelineEdgeData` in the `pipeline-graph` contract layer (`canvas-types.ts`), re-export from the
  barrel, and have both the store (`edges: Edge<PipelineEdgeData>[]`) and the converter import it.
  This satisfies AC3's "edges carry a `data` shape able to hold Dander's `mappings` and `join`" by
  *typing* what DRUFF-4 already round-trips, with no behavior change.
- **`updateEdgeData` mirrors `updateNodeData`.** A store-driven, shallow-merge-into-`data` action so
  edit state can never drift from the canvas (AC3). It must tolerate `edge.data` being `undefined`
  (seed edges carry none): merge as `{ ...(edge.data ?? {}), ...patch }`.
- **A container owns the always-mounted panel shell; body components render per selection.** Today
  `NodeInspector` *is* the fixed-width `<aside>` and owns its own empty state. To host both a node
  body and an edge body without layout reflow (DRUFF-3's invariant), introduce an `Inspector`
  container that is the always-mounted `<aside>` and delegates its body to `NodeInspector`,
  `EdgeInspector`, or a shared empty state. This strengthens the non-reflow invariant (the aside
  never unmounts; only its inner content swaps) and is the seam DRUFF-11 will also route through.

**Node-vs-edge precedence (AC2).** With normal single-click React Flow selection a node and an edge
are never simultaneously selected. To make the resolution total and testable regardless, a pure
`resolveInspectorTarget(node, edge)` maps the two derived selections to a discriminated
`InspectorTarget` (`node` | `edge` | `none`): exactly-one-node-and-no-edge → node; exactly-one-edge-
and-no-node → edge; anything else (zero, multi, or both) → `none`. Keeping this as a **pure helper**
fed by the two stable store selectors — rather than a single Zustand selector returning a fresh
object each render — avoids the new-reference re-render trap and keeps the precedence rule unit-
testable without a store.

### Interfaces / modules

```ts
// src/lib/pipeline-graph/canvas-types.ts  (contract layer — canonical edge-data shape)
/** React Flow edge-`data` contract: the subset the DRUFF-4 converters round-trip to/from a
 *  Dander graph edge. All optional so a bare/seed edge with no data stays valid. */
export type PipelineEdgeData = {
  mappings?: PipelineEdge["mappings"];   // DRUFF-9 fills these
  join?: PipelineEdge["join"];           // DRUFF-10 fills this
  metadata?: PipelineEdge["metadata"];
};

// src/lib/graph-store.ts
type GraphState = {
  edges: Edge<PipelineEdgeData>[];       // was Edge[]
  // …existing…
  /** Shallow-merges `patch` into the target edge's `data` (creating it if absent), replacing the
   *  edge so React Flow re-renders. Edge analogue of `updateNodeData`. */
  updateEdgeData: (id: string, patch: Partial<PipelineEdgeData>) => void;
};
/** The sole selected edge, or null for zero/multi. Mirrors `selectSelectedNode`; derives from
 *  `edge.selected`, adds no selection state. */
export function selectSelectedEdge(state: GraphState): Edge<PipelineEdgeData> | null;

// src/features/pipeline-canvas/inspector/inspectorTarget.ts  (pure, no store/React)
export type InspectorTarget =
  | { kind: "node"; node: Node<PipelineNodeData> }
  | { kind: "edge"; edge: Edge<PipelineEdgeData> }
  | { kind: "none" };
export function resolveInspectorTarget(
  node: Node<PipelineNodeData> | null,
  edge: Edge<PipelineEdgeData> | null,
): InspectorTarget;
/** Resolves an edge's `source`/`target` ids to `{ id, name }` display pairs against the current
 *  nodes; falls back to the raw id (name = id) for an id that doesn't resolve. Reused by DRUFF-9/10
 *  for their field-source dropdowns. */
export function edgeEndpointNames(
  edge: Edge<PipelineEdgeData>,
  nodes: Node<PipelineNodeData>[],
): { from: { id: string; name: string }; to: { id: string; name: string } };
```

### Components

- **`Inspector`** (new, `inspector/Inspector.tsx`) — the always-mounted, fixed-width
  `<aside className="flex w-80 shrink-0 flex-col border-l bg-muted/30">`. Reads `selectSelectedNode`
  and `selectSelectedEdge`, calls `resolveInspectorTarget`, and renders one body:
  `<NodeInspector node=… />`, `<EdgeInspector edge=… />`, or a shared empty state
  ("Select a node or edge to inspect it."). Replaces `<NodeInspector/>` in `page.tsx`. Body
  components own their inner `flex flex-col gap-4 overflow-y-auto p-4` so the current padding/scroll
  is preserved.
- **`NodeInspector`** (refactor) — becomes a **body** component taking `node: Node<PipelineNodeData>`
  as a prop; drops the `<aside>` wrapper, the `selectSelectedNode` read, and the empty-state branch
  (all moved up to `Inspector`). Its name/config JSX and its `updateNodeData` store read are
  unchanged. This is the one existing component that meaningfully changes shape.
- **`EdgeInspector`** (new, `inspector/EdgeInspector.tsx`) — body component taking
  `edge: Edge<PipelineEdgeData>`. Reads the store `nodes`, resolves endpoints via
  `edgeEndpointNames`, and renders: an edge/"Connection" header that visually distinguishes it from a
  node (AC2), the identity (From `{name}` → To `{name}`, each showing the node id), and two labeled,
  **empty** placeholder sections — "Mappings" and "Join" — each with muted "Added in a later step"
  copy. It ships **no** mapping/join editing controls; DRUFF-9/DRUFF-10 replace those placeholders.

### Data flow

`applyEdgeChanges` (React Flow) writes `edge.selected` → `selectSelectedEdge` derives the one edge →
`Inspector` binds `EdgeInspector` to it → an edit calls `store.updateEdgeData(edge.id, patch)`
(DRUFF-9/10) → store replaces the edge → canvas + inspector re-render from the same `edges` array
(no inspector-local mirror). Save/load already carries `edge.data` through DRUFF-4's converters
untouched.

### Files to touch / create

| File | Change |
|---|---|
| `src/lib/pipeline-graph/canvas-types.ts` | Add exported `PipelineEdgeData` (import `PipelineEdge` type). |
| `src/lib/pipeline-graph/index.ts` | Re-export the `PipelineEdgeData` type from the barrel. |
| `src/lib/pipeline-graph/canvas-convert.ts` | Replace private `CanvasEdgeData` with the imported `PipelineEdgeData`; type `edgeToGraphEdge`/`graphEdgeToCanvasEdge` as `Edge<PipelineEdgeData>`. No behavior change. |
| `src/lib/graph-store.ts` | Type `edges` as `Edge<PipelineEdgeData>[]` (state, `createGraphState`, `SEED_GRAPH`, `onEdgesChange`/`onConnect` sigs); add `updateEdgeData`; add `selectSelectedEdge`. |
| `src/features/pipeline-canvas/inspector/inspectorTarget.ts` | New: `resolveInspectorTarget` + `edgeEndpointNames` (pure). |
| `src/features/pipeline-canvas/inspector/Inspector.tsx` | New: always-mounted shell + three-way body routing. |
| `src/features/pipeline-canvas/inspector/NodeInspector.tsx` | Refactor to a prop-driven body (drop aside/empty-state/selection read). |
| `src/features/pipeline-canvas/inspector/EdgeInspector.tsx` | New: edge identity + Mappings/Join placeholders. |
| `src/app/page.tsx` | Mount `<Inspector/>` instead of `<NodeInspector/>`. |
| `src/lib/graph-store.test.ts` | Add: `updateEdgeData` (merges patch, creates `data` when absent, leaves other edges intact) and `selectSelectedEdge` (single / zero / multi). |
| `src/features/pipeline-canvas/inspector/inspectorTarget.test.ts` | New: `resolveInspectorTarget` precedence (node / edge / none incl. the both-selected case) + `edgeEndpointNames` (resolves names, id fallback). |
| `src/features/pipeline-canvas/inspector/EdgeInspector.test.tsx` | New: renders From/To names, distinguishes edge from node, shows empty Mappings/Join placeholders. |
| `src/features/pipeline-canvas/inspector/Inspector.test.tsx` | New: routes to node body / edge body / empty state per selection (absorbs NodeInspector's old empty & multi-select cases). |
| `src/features/pipeline-canvas/inspector/NodeInspector.test.tsx` | **Migrate:** render `<NodeInspector node={…} />` for the body assertions; the empty-state and multi-select assertions move to `Inspector.test.tsx`. |

### Test seams

- **Pure logic, no store/React:** `resolveInspectorTarget` and `edgeEndpointNames` are unit-tested
  directly with fixture nodes/edges — the bulk of AC2/AC5's derivation coverage.
- **Store, no React:** `updateEdgeData` and `selectSelectedEdge` are tested against a fresh vanilla
  store via the existing `createStore(createGraphState(fixture))` pattern in `graph-store.test.ts`
  (AC5). Fixtures carry only synthetic non-sensitive data (steering/02).
- **Component:** `Inspector`/`EdgeInspector` tests seed the app-wide store singleton and assert
  rendering, following the exact pattern already in `NodeInspector.test.tsx`
  (`setState` in `beforeEach`, restore in `afterEach`).
- **Round-trip (AC4):** already provided by DRUFF-4 — `example-graph` (mappings + `left` join +
  join-less edge) is round-tripped by `canvas-convert.test.ts`/`round-trip.test.ts`. The
  `PipelineEdgeData` typing change is behavior-preserving; no new round-trip test is required, only
  re-confirmation that the existing suite stays green.
- No network anywhere; nothing crosses the Dander contract in this ticket, so no new Zod parse.

### Trade-offs & notes

- **Container owns the shell (vs. leaving `NodeInspector` self-contained and toggling siblings).**
  Chosen so there is exactly one always-mounted aside and one shared empty state, honoring DRUFF-3's
  no-reflow invariant while making node/edge symmetric — at the cost of refactoring `NodeInspector`
  into a body and migrating a few of its tests. Worth it: DRUFF-11 routes config categories through
  this same body seam, so paying for the seam once here avoids each follow-on bolting a branch onto
  the inspector.
- **`PipelineEdgeData` lives in the `pipeline-graph` contract layer, not the canvas feature** — same
  reasoning as `PipelineNodeData`/`PipelineNodeKind` already there: the converter and the feature
  share one source of truth without the feature owning a type the data layer also depends on.
- **Precedence as a pure helper fed by two stable selectors**, rather than one object-returning
  Zustand selector, deliberately sidesteps Zustand's new-reference re-render behavior and keeps the
  rule testable without a store.
- **Ambiguity flagged (AC2):** the ticket doesn't state what wins if a node *and* an edge are both
  selected. React Flow's default single-select never produces this; the design resolves it to `none`
  (empty inspector) rather than silently privileging one, so a genuinely ambiguous selection reads
  as "nothing to inspect." Confirm this is acceptable — the alternative (node-wins) is a one-line
  change in `resolveInspectorTarget` if product prefers it.

## Implementation Notes

Implemented exactly per Design, no deviations.

- **`PipelineEdgeData`** added to `src/lib/pipeline-graph/canvas-types.ts` (re-exported from the
  `index.ts` barrel) and imported by both `canvas-convert.ts` (replacing the private
  `CanvasEdgeData` it previously defined — no behavior change, just typed) and `graph-store.ts`
  (`edges: Edge<PipelineEdgeData>[]`, `SEED_GRAPH`, `createGraphState`, `onEdgesChange`/`setGraph`
  signatures).
- **`updateEdgeData(id, patch)`** added to the store, mirroring `updateNodeData`: shallow-merges
  `patch` into the target edge's `data`, creating it via `{ ...(edge.data ?? {}), ...patch }` when
  absent (covers seed/bare edges). **`selectSelectedEdge`** added mirroring `selectSelectedNode`
  (derives from `edge.selected`, no new state field).
- **`src/features/pipeline-canvas/inspector/inspectorTarget.ts`** (new, pure, no store/React):
  `resolveInspectorTarget(node, edge)` — node-and-no-edge → `{kind:"node"}`; edge-and-no-node →
  `{kind:"edge"}`; both-or-neither → `{kind:"none"}` (the both-selected ambiguity resolves to
  "nothing to inspect," per the Design's flagged trade-off — not revisited here). `edgeEndpointNames`
  resolves `source`/`target` ids to `{id, name}` pairs against the live nodes, falling back to the
  raw id as the name when an endpoint doesn't resolve (e.g. a dangling edge).
- **`Inspector`** (new) is now the always-mounted `<aside className="flex w-80 shrink-0 flex-col
  border-l bg-muted/30">`, reading both selectors and routing to `NodeInspector`, `EdgeInspector`,
  or the shared empty state ("Select a node or edge to inspect it."). Mounted in `src/app/page.tsx`
  in place of the old direct `<NodeInspector/>`.
- **`NodeInspector`** refactored to a prop-driven body (`{ node }` prop instead of reading
  `selectSelectedNode`/owning the `<aside>`/empty-state — all moved up to `Inspector`). Its
  name/config/fields JSX and `updateNodeData` usage are otherwise unchanged; the outer wrapper is
  now a plain `<div className="flex flex-col gap-4 overflow-y-auto p-4">`.
- **`EdgeInspector`** (new) is a body component taking `{ edge }`: renders a "Connection" header
  (visually distinguishes it from a node body per AC2), From/To rows (name + id) via
  `edgeEndpointNames`, and two empty, non-editable "Mappings"/"Join" `role="group"` sections with
  "Added in a later step." copy — no mapping/join editing controls, per this ticket's explicit
  scope boundary (DRUFF-9/DRUFF-10 fill those in).
- **Test migration:** `NodeInspector.test.tsx` now renders `<NodeInspector node={...} />` directly;
  the empty-state and multi-select-empties-the-panel assertions moved to the new
  `Inspector.test.tsx`. One addition beyond the ticket's file list: a small test-local
  `LiveNodeInspector` wrapper (subscribes to the store by node id) is used for the three
  connector-field tests, since `ConnectorConfigForm` is fully controlled with no local row state
  (unlike `NodeConfigEditor`) — multi-keystroke typing needs a fresh `node` prop per store update,
  which in production `Inspector` supplies naturally by re-rendering on every store change; the
  isolated unit test needed an equivalent stand-in to exercise that same live-prop behavior.
- **Round-trip (AC4):** no new test added — confirmed the existing `canvas-convert.test.ts` /
  `round-trip.test.ts` suite (which already exercises a mapped+joined edge and a join-less edge)
  stays green under the `PipelineEdgeData` typing change, per the Design's "Test seams" note.

**Tooling run:** `tsc --noEmit` clean; `eslint .` clean; `prettier --check .` clean for every file
touched (pre-existing `README.md` formatting warning is unrelated/untouched); `vitest run` — 188
tests passed (20 files), including the new `graph-store.test.ts` (`updateEdgeData`/
`selectSelectedEdge`), `inspectorTarget.test.ts`, `EdgeInspector.test.tsx`, and
`Inspector.test.tsx` suites.

## Review Log

_Append-only. PR-Review adds entries below._

### 2026-07-23 — PASS

All six acceptance criteria are met, verified against the changed code and the steering files.

- **AC1 (single-edge selection binds; deselect/multi clears):** `selectSelectedEdge` derives the
  sole selected edge (null for zero/multi) from `edge.selected`; `resolveInspectorTarget` maps to
  `none` for zero/multi; `Inspector` renders the shared empty state. Covered by
  `graph-store.test.ts` (single/zero/multi) and `Inspector.test.tsx` (node/edge/none + deselect,
  including a multi-edge case).
- **AC2 (distinguishes edge from node; shows from/to identity):** `EdgeInspector` renders a
  "Connection" header and From/To rows (`{name} ({id})`) via `edgeEndpointNames`;
  `resolveInspectorTarget` separates the two. Covered by `EdgeInspector.test.tsx`,
  `Inspector.test.tsx`, and `inspectorTarget.test.ts` (incl. id fallback for a dangling endpoint).
- **AC3 (`updateEdgeData` + typed edge `data`, store-driven):** `updateEdgeData(id, patch)`
  shallow-merges into `data`, tolerating `undefined` via `{ ...(edge.data ?? {}), ...patch }`;
  `PipelineEdgeData` (mappings/join/metadata) types `edges: Edge<PipelineEdgeData>[]`. Inspector
  bodies read the store, hold no local mirror. Covered by four `updateEdgeData` store tests
  (merge / create-when-absent / preserve-other-keys / leaves-other-edges-untouched).
- **AC4 (edge `data` round-trips via DRUFF-4):** the `PipelineEdgeData` typing change is
  behavior-preserving; `canvas-convert.test.ts` explicitly carries mappings/join/metadata both
  directions, and `round-trip.test.ts` round-trips `EXAMPLE_GRAPH` (a `left`-join+mapped edge and a
  join-less edge) through YAML and JSON. Suite green.
- **AC5 (derivation + store action unit-tested, non-sensitive fixtures):** `resolveInspectorTarget`,
  `edgeEndpointNames`, `selectSelectedEdge`, and `updateEdgeData` are all directly unit-tested with
  synthetic fixtures only.
- **AC6 (no steering violations):** grepped the full diff for credential-shaped literals — none
  (only `*_key_ref`/"api key reference" label strings, which are references, not values); TSDoc on
  every export, everything type-annotated, feature-grouped layout, tests colocated.

Design fidelity is exact. The one deviation — a test-local `LiveNodeInspector` wrapper in
`NodeInspector.test.tsx` — is disclosed in Implementation Notes and justified (a fully-controlled
`ConnectorConfigForm` needs a fresh `node` prop per store update, which production `Inspector`
supplies by re-rendering). The both-selected → `none` tie-break is flagged as a product-confirmable
choice, not a blocker.

Tooling re-confirmed locally: `tsc --noEmit` clean, `eslint .` clean, `prettier --check` clean,
`vitest run` 188 passed (20 files).
