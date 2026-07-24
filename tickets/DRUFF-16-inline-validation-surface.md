---
id: DRUFF-16
title: Surface graph validation violations inline on the offending node/edge
status: done
component: frontend
epic: validation-surface
depends_on: [DRUFF-15]
created: 2026-07-23
---

## Context

The "Validation surface" module in `steering/00-project-overview.md` calls for inline display of
Dander's `graph_ops` validation errors (dangling edge, cycle, unknown field, …) **directly on the
offending node/edge on the canvas, not a separate error log/panel**. DRUFF-15 ports Dander's
structural + field-wiring checks as a pure TypeScript validator that returns structured violations
tagged with the offending node and/or edge. This ticket consumes that validator and renders each
violation **inline on the canvas**, on the node or edge it belongs to.

Mapping of violation → surface:
- Node-scoped violations (duplicate node id, duplicate field name, and unknown-field references
  whose offending node is a mapping/transformation/join endpoint) render on the **node**.
- Edge-scoped violations (dangling edge, self-loop, and the mapping/join wiring errors that belong
  to an edge) render on the **edge**.
- A cycle spans several nodes/edges — it is surfaced on the participating nodes/edges rather than in
  a separate list.

This stays within the "Druff never executes user code" and "not a separate log/panel" constraints —
it is a read-only visual overlay driven entirely by DRUFF-15's pure validator over the current
canvas graph. Violation text must carry structure only (ids, field names), never sensitive config/
metadata/expression payloads (already guaranteed by DRUFF-15's output; this ticket must not
re-introduce them into any tooltip/label).

## Acceptance Criteria

- [ ] The canvas runs DRUFF-15's validator over the current graph state and reflects the result
      inline; validation re-evaluates when the graph changes (nodes/edges/fields/mappings/joins
      edited, added, or removed).
- [ ] Each violation is shown **on the offending node or edge** on the canvas (per the mapping
      above) — a node with a violation is visibly flagged, an edge with a violation is visibly
      flagged. There is **no** separate error log/list/panel as the surface (per the "Validation
      surface" module in `steering/00-project-overview.md`).
- [ ] A node/edge with multiple violations surfaces all of them (e.g. via an inline
      badge/marker with the individual messages available on hover/expand), and the message text is
      actionable and structural (ids, field names) — never a stack trace and never a sensitive
      config/metadata/field/expression value.
- [ ] A cycle is surfaced on the participating nodes/edges, not collapsed into a single unrelated
      element or a separate log.
- [ ] A valid graph shows no violation markers (clean canvas).
- [ ] The violation→node/edge attribution logic (and any presentation-state mapping) is unit-tested
      with non-sensitive fixtures; component/interaction behavior is tested per
      `steering/02-engineering.md`.
- [ ] No steering violations (secrets, style, docs).

## Design

### Approach

Everything this ticket needs already exists as a seam except the surfacing. DRUFF-15 gives a **pure
validator over a Dander `PipelineGraph`**; DRUFF-4's `canvasToGraph` already converts the live
canvas nodes/edges into exactly that shape (resolving connector `danderType`, dropping layout). So
the pipeline is: `store nodes/edges → canvasToGraph → validateGraph → GraphViolation[] →
attribute to canvas node/edge ids → render a marker on each flagged node/edge`. No new state is
persisted; validation is a **pure derivation of the current graph**, recomputed by a memoized hook
whenever `nodes`/`edges` change (Zustand hands back new array references on every mutation, so an
edited field/mapping/join re-runs validation — AC1). There is **no** error log/list/panel anywhere
in this design; the entire surface is per-node/per-edge markers (AC2, and the "Validation surface"
module in `steering/00-project-overview.md`).

The design keeps three concerns separate and independently testable, mirroring how the codebase
already splits pure logic (`validateMapping`, `resolveInspectorTarget`) from React:

1. **Attribution** (pure, no React/store) — maps a `GraphViolation[]` onto the canvas by id:
   which canvas node ids and which canvas edge ids each violation belongs to. This is the AC6 core.
2. **Message formatting** (pure) — turns a structured violation (kind + ids/field-name/index/
   reference-kind) into one actionable, structural sentence. Because it only ever interpolates
   those structural fields, it is *structurally incapable* of leaking a `config`/`metadata`/field/
   expression value (AC3) — DRUFF-15 already guarantees no such payload is in the object.
3. **Presentation** — a memoized hook runs the pipeline once at the canvas boundary and publishes a
   `ViolationIndex` via context; the custom node and a new custom edge each look up **their own**
   violations by id and render a shared `ViolationMarker`.

**Attribution is data-driven, not a hardcoded kind→surface `switch`** (`steering/02-engineering.md`:
config-driven over code-driven). Rather than DRUFF-16 re-encoding the ticket's node-vs-edge mapping
table as branching code, it fans each violation out to **every node id and every edge it references**
in the violation object. The ticket's mapping ("duplicate-field-name on the node", "dangling-edge on
the edge", …) is then realized by *how DRUFF-15 tags each violation* — which is where that decision
belongs, since DRUFF-15 owns the semantics. A cycle, which references several nodes/edges, fans to
all of them for free (AC4). A valid graph yields `[]` → an empty index → no markers (AC5).

### Dependency contract with DRUFF-15 (must coordinate — DRUFF-15's design isn't written yet)

DRUFF-16 **imports** DRUFF-15's validator and violation type rather than redefining them; the shape
below is the seam this design assumes. If DRUFF-15 lands a different shape, adjust the thin
attribution/format adapters, not the surfacing. Assumed export (from the DRUFF-15 module, expected at
`src/lib/pipeline-graph/validate.ts`, re-exported from the `pipeline-graph` barrel):

```ts
export type ViolationKind =
  | "duplicate-node-id" | "dangling-edge" | "self-loop" | "graph-cycle"
  | "duplicate-field-name" | "unknown-field-reference" | "join-key-field";

/** Structured, non-sensitive (ids / field names / indices only — no config/metadata/expression). */
export type GraphViolation = {
  kind: ViolationKind;
  /** Offending node id(s). A cycle carries every participating node id. Empty when purely edge-scoped. */
  nodeIds: string[];
  /** Offending edge locator(s). `index` is the edge's position in `graph.edges`; `from`/`to` are the
   *  endpoint ids. Empty when purely node-scoped. */
  edges: { index: number; from: string; to: string }[];
  /** Present for field-wiring kinds — the unresolved field name. */
  fieldName?: string;
  /** Present for a `join-key-field` violation — the offending `JoinKeyPair` index. */
  joinKeyIndex?: number;
  /** Which side of the reference failed, for message precision. */
  referenceKind?: "source" | "target" | "transformation-input" | "join-left" | "join-right";
};

export function validateGraph(graph: PipelineGraph): GraphViolation[];
```

**Two requirements this design places on DRUFF-15's tagging (flag for the DRUFF-15 designer):**

- **Edge-scoped violations must carry the edge's array `index`, not only `from`/`to`.** The canvas
  can hold *parallel* edges between the same two nodes; endpoint ids alone can't disambiguate them.
  `canvasToGraph` maps `edges` → `graph.edges` **in order**, so index `i` in the validator's graph is
  exactly canvas `edges[i]` — an unambiguous back-reference. Attribution falls back to endpoint
  matching (fanning to *all* matching canvas edges — a safe over-approximation) if `index` is absent,
  but the index is the correct fix.
- **A `graph-cycle` violation should enumerate its participating nodes** (`nodeIds`) and, ideally, the
  participating edges. If DRUFF-15 supplies only nodes, DRUFF-16 derives the participating edges as
  the canvas edges whose `source`/`target` are both in `nodeIds` (so the cycle still flags edges per
  AC4). This derivation is in the attribution helper and unit-tested; flagged so DRUFF-15 can instead
  return the edges directly if cleaner.

### Interfaces / modules

```ts
// src/features/pipeline-canvas/validation/attributeViolations.ts   (pure — no React, no store)
/** Per-canvas-element violation buckets. Keys are canvas node ids / canvas edge ids; an id absent
 *  from a map has no violations. */
export type ViolationIndex = {
  byNodeId: Record<string, GraphViolation[]>;
  byEdgeId: Record<string, GraphViolation[]>;
};
/**
 * Fans each violation onto the canvas elements it references. `edges` (the live canvas edges, in the
 * same order `canvasToGraph` consumed them) resolves an edge locator's `index` — falling back to
 * `source`/`target` endpoint matching — to a canvas edge id, and expands a `graph-cycle`'s node set
 * to its participating canvas edges. Order within a bucket preserves validator order (structural
 * before field-wiring), so the first-listed message is the most fundamental fault.
 */
export function attributeViolations(
  violations: GraphViolation[],
  edges: Edge<PipelineEdgeData>[],
): ViolationIndex;

// src/features/pipeline-canvas/validation/formatViolationMessage.ts  (pure)
/** One actionable, structural sentence per violation — interpolates only kind + ids / field name /
 *  join-key index / reference kind (never a value/config/expression). e.g.
 *  `Field "email" is not declared on node "crm_source" (mapping source).` */
export function formatViolationMessage(v: GraphViolation): string;

// src/features/pipeline-canvas/validation/useGraphViolations.ts
/** Memoized store→graph→validate→attribute pipeline. Recomputes only when `nodes`/`edges` change. */
export function useGraphViolations(): ViolationIndex;

// src/features/pipeline-canvas/validation/ViolationContext.tsx
export const ViolationProvider: React.FC<{ value: ViolationIndex; children: React.ReactNode }>;
/** Read the current element's own violations by id (`[]` when clean). */
export function useNodeViolations(nodeId: string): GraphViolation[];
export function useEdgeViolations(edgeId: string): GraphViolation[];
```

### Components / data flow

- **`useGraphViolations`** (hook) reads `nodes`+`edges` from `useGraphStore` and, in a `useMemo` keyed
  on those two references, runs `canvasToGraph(nodes, edges)` → `validateGraph(graph)` →
  `attributeViolations(violations, edges)`. Returns the `ViolationIndex`.
- **`Canvas`** (in `PipelineCanvas.tsx`) calls the hook and wraps `<ReactFlow>` in
  `<ViolationProvider value={index}>` so custom node/edge components rendered *inside* React Flow can
  consume it. The provider sits inside the existing `ReactFlowProvider`. Nothing is written back into
  the store or into node/edge `data` — the index lives only in context (keeping `PipelineNodeData`/
  `PipelineEdgeData`, the Dander-contract-mirroring shapes, free of transient UI state, consistent
  with how `kind` is the *only* UI-derived field allowed on node data).
- **`ViolationMarker`** (shared) — given `violations: GraphViolation[]`, renders nothing when empty;
  otherwise a small danger badge showing the **count**, wrapped in the existing shadcn `Tooltip`
  whose content lists each `formatViolationMessage(v)` on hover (AC3's "all of them, messages on
  hover"). Uses a `lucide-react` alert icon (e.g. `AlertTriangle`) + a `text-destructive`/
  `border-destructive` accent. `role="button"`/`aria-label` with the count for accessibility and to
  give component tests a stable handle.
- **`PipelineNode`** (edit) — calls `useNodeViolations(id)` (id via `props.id`), applies a danger
  ring/border when non-empty (alongside the existing `selected` ring), and renders `<ViolationMarker>`
  in a corner. `NodeProps` already exposes `id`.
- **`PipelineEdge`** (new custom edge, `edges/PipelineEdge.tsx`) — default React Flow edges can't host
  a marker, so introduce a custom edge using `BaseEdge` + `getBezierPath` (matching current default
  visuals) that: strokes the path with the destructive color when `useEdgeViolations(id)` is
  non-empty, and renders `<ViolationMarker>` at the path midpoint via `EdgeLabelRenderer`. Registered
  as `edgeTypes={{ pipelineEdge: PipelineEdge }}`; every edge is made this type via
  `defaultEdgeOptions={{ type: "pipelineEdge" }}` on `<ReactFlow>` **and** an explicit
  `type: "pipelineEdge"` set in `graphEdgeToCanvasEdge` (import path) and on `SEED_GRAPH` edges, so
  both freshly-connected and imported edges surface violations.

Data flow: `store mutation → new nodes/edges refs → useGraphviolations recomputes index →
ViolationProvider value updates → each flagged PipelineNode/PipelineEdge re-reads its own bucket →
ViolationMarker + danger styling appear/clear`.

### Files to touch / create

| File | Change |
|---|---|
| `src/lib/pipeline-graph/validate.ts` | **(DRUFF-15)** — consumed here; not authored by this ticket. Coordinate the shape above; import from the barrel. |
| `src/lib/pipeline-graph/index.ts` | Ensure DRUFF-15's `validateGraph` + `GraphViolation`/`ViolationKind` are re-exported (add if DRUFF-15 didn't). |
| `src/features/pipeline-canvas/validation/attributeViolations.ts` | New: `ViolationIndex` + `attributeViolations` (pure). |
| `src/features/pipeline-canvas/validation/attributeViolations.test.ts` | New: AC6 core — each kind → correct node/edge bucket, multi-violation collection, cycle fan-out (incl. derived edges), endpoint/index resolution + parallel-edge fallback, clean graph → empty. |
| `src/features/pipeline-canvas/validation/formatViolationMessage.ts` | New: pure message formatter. |
| `src/features/pipeline-canvas/validation/formatViolationMessage.test.ts` | New: actionable/structural text per kind; asserts no sensitive value can appear (fixtures carry ids/names only). |
| `src/features/pipeline-canvas/validation/useGraphViolations.ts` | New: memoized store→graph→validate→attribute hook. |
| `src/features/pipeline-canvas/validation/useGraphViolations.test.ts` | New: `renderHook` + seeded store — recomputes on graph change, memoizes when unchanged. |
| `src/features/pipeline-canvas/validation/ViolationContext.tsx` | New: provider + `useNodeViolations`/`useEdgeViolations`. |
| `src/features/pipeline-canvas/validation/ViolationMarker.tsx` | New: count badge + tooltip of messages, danger styling. |
| `src/features/pipeline-canvas/validation/ViolationMarker.test.tsx` | New: hidden when empty; shows count + all messages on hover for multiple violations. |
| `src/features/pipeline-canvas/edges/PipelineEdge.tsx` | New: custom edge with danger stroke + midpoint marker. |
| `src/features/pipeline-canvas/nodes/PipelineNode.tsx` | Edit: read `useNodeViolations`, add danger styling + `<ViolationMarker>`. |
| `src/features/pipeline-canvas/nodes/PipelineNode.test.tsx` | New: node flagged when its id has violations, clean node has no marker (provider-wrapped render). |
| `src/features/pipeline-canvas/PipelineCanvas.tsx` | Edit: call `useGraphViolations`, wrap in `ViolationProvider`, register `edgeTypes` + `defaultEdgeOptions`. |
| `src/lib/pipeline-graph/canvas-convert.ts` | Edit: set `type: "pipelineEdge"` in `graphEdgeToCanvasEdge`. |
| `src/lib/graph-store.ts` | Edit: set `type: "pipelineEdge"` on `SEED_GRAPH` edges. |
| `e2e/validation-surface.spec.ts` | New (optional): Playwright end-to-end — wire an invalid graph, assert a node marker + edge marker appear and clear when fixed (canvas pointer/render behavior is Playwright per `steering/languages/typescript.md`). |

### Test seams

- **Pure, no React/store:** `attributeViolations` and `formatViolationMessage` are unit-tested with
  synthetic `GraphViolation` fixtures + fixture canvas edges — the bulk of AC6 and the AC3
  no-sensitive-payload guarantee. Fixtures carry only ids/field names (`steering/01-security.md`,
  `steering/02-engineering.md`: no real/sensitive data).
- **Hook, store but no canvas:** `useGraphViolations` via `renderHook` against a fresh/seeded store —
  asserts recompute-on-change (AC1) and memo stability. DRUFF-15's `validateGraph` is the real pure
  function (no mock needed — no network, no Dander backend call anywhere in this ticket, so no Zod
  boundary parse and nothing to mock per `steering/02-engineering.md`).
- **Component (jsdom):** `ViolationMarker` and `PipelineNode` render directly with fixture props
  wrapped in `ViolationProvider`, asserting marker presence/absence and message text.
- **Canvas interaction (Playwright, optional):** full drag/connect + inline marker appearance, since
  real React Flow edge rendering and pointer behavior don't work under jsdom.

### Trade-offs & flags

- **Context vs. writing violations into node/edge `data`.** Chosen context so the Dander-contract
  data shapes stay free of transient per-render state and the node/edge arrays aren't rebuilt every
  validation. Cost: custom node/edge components must be context consumers — acceptable, they already
  are client components.
- **A custom edge is unavoidable.** Default edges can't render a marker; introducing `PipelineEdge`
  is the smallest change that lets an edge be visibly flagged (AC2). All edges are routed to it via
  `defaultEdgeOptions` + explicit `type`, matching the current default bezier look otherwise.
- **Attribution fans to *all* referenced elements (flag — confirm).** The ticket's node-vs-edge
  mapping is ambiguous for field-wiring faults (an unknown-field reference belongs to both the
  endpoint *node* whose fields lack it and the *edge* carrying the mapping). This design surfaces a
  violation on every element DRUFF-15 tags it with, so such a fault may show on both. That reliably
  satisfies "shown on the offending node **or** edge" but can double-mark; confirm whether product
  wants both endpoints flagged or a single canonical surface per kind (the latter would be a small
  config table keyed by `ViolationKind`).
- **Depends on DRUFF-15 being `done` first** (`depends_on: [DRUFF-15]`), and on the two tagging
  requirements above (edge `index`; cycle participants). Both are flagged for the DRUFF-15 designer;
  neither blocks writing DRUFF-16's pure attribution/format/marker code against the assumed type.

## Implementation Notes

Built per the Design, with one necessary adaptation flagged in the Design itself: DRUFF-15 landed
(as `done`) with a different concrete shape than this ticket's assumed `GraphViolation`. The real
export, from `src/lib/pipeline-graph/violations.ts` + `graph-validation.ts` (re-exported from the
`pipeline-graph` barrel), is:

- `Violation` — a discriminated union on `kind`, one variant per structural/field-wiring check
  (`duplicate-node-id`, `dangling-edge`, `self-loop`, `graph-cycle`, `duplicate-field-name`,
  `unknown-field-reference`, `join-key-field`), each carrying a *singular* `nodeId`/`edge: EdgeRef`
  (not the assumed `nodeIds[]`/`edges[]` arrays) plus `EdgeRef.edgeIndex` (present unconditionally,
  not "if DRUFF-15 supplies it").
- `validateFieldWiring(graph): Violation[]` — the single entry point (already runs the structural
  gate first internally), used in place of the assumed `validateGraph`.

None of this changes the design's intent or file layout — only the adapters:
- `attributeViolations.ts` extracts each violation's referenced node id(s)/edge(s) via a small
  per-`kind` switch (`violationRefs`), because the union's fields differ by discriminant shape; this
  is a data-extraction step, not a kind→surface decision (the fan-out itself is still uniform: every
  referenced element gets flagged). `dangling-edge`'s `missingId` intentionally contributes no node
  id (it names a node that, by construction, doesn't exist on the canvas).
- `EdgeRef.edgeIndex` is always present, so edge resolution primarily indexes `edges[edgeIndex]`
  (verified against the ref's own `from`/`to`), falling back to an endpoint scan only if the index
  is out of range or mismatched — the "safe over-approximation" fallback the Design anticipated.
- A `graph-cycle`'s participating edges are derived from **consecutive pairs** in `cycle` (the exact
  cycle path DRUFF-15 returns, start repeated at end) rather than "any edge whose endpoints are both
  in the cycle's node set" — more precise than the Design's suggested fallback, avoiding flagging an
  unrelated edge that happens to connect two in-cycle nodes without itself being part of the cycle.

Files added, matching the Design's table exactly: `validation/attributeViolations.ts` (+ test),
`validation/formatViolationMessage.ts` (+ test), `validation/useGraphViolations.ts` (+ test),
`validation/ViolationContext.tsx`, `validation/ViolationMarker.tsx` (+ test), `edges/PipelineEdge.tsx`.
Edited: `nodes/PipelineNode.tsx` (danger ring + corner `ViolationMarker`, `useNodeViolations`),
`PipelineCanvas.tsx` (`useGraphViolations`, `ViolationProvider`, `edgeTypes`, `defaultEdgeOptions`),
`canvas-convert.ts` (`graphEdgeToCanvasEdge` now sets `type: "pipelineEdge"`), `graph-store.ts`
(`SEED_GRAPH` edges get the same `type`) — updated `canvas-convert.test.ts`'s one exact-shape
assertion accordingly (pre-existing DRUFF-4 test, not otherwise touched).

Added `e2e/validation-surface.spec.ts` (the Design's "optional" Playwright test) — asserts the seed
graph shows zero markers, then drags a self-loop connection and asserts both the node and its edge
get flagged with an actionable, structural tooltip message. Also added a minimal `ResizeObserver`
stub to `vitest.setup.ts` — jsdom has none, and Radix's `Tooltip` (first real usage in this codebase,
via `ViolationMarker`) reads element size on mount; without it, tests rendering the marker's tooltip
throw an uncaught `ReferenceError`.

Toolchain, all green: `eslint` (0 problems), `prettier --check` (clean on every file touched;
pre-existing `README.md` formatting warning is untouched/unrelated), `tsc --noEmit` (0 errors),
`vitest run` (487/487 passing, including all new attribution/format/hook/component tests),
`playwright test` (5/5 passing, including the new e2e spec).

No deviations from the Design beyond the DRUFF-15-shape adaptation above; no open flags carried
forward except the one already noted in the Design ("attribution fans to all referenced elements,
confirm whether product wants a single canonical surface per kind instead") — left as-is per the
Design's own resolution to build against the fan-out and flag it, not block on it.

## Review Log

_Append-only. PR-Review adds entries below._

### 2026-07-23 — PASS

Reviewed the implementation against all seven acceptance criteria, the approved Design, and the
steering files. Inspected every file named in the Implementation Notes.

**Acceptance criteria — all met:**
- **AC1** (validator runs over live graph, re-evaluates on change): `useGraphViolations` runs
  `canvasToGraph → validateFieldWiring → attributeViolations` in a `useMemo` keyed on the store's
  `nodes`/`edges` references; Zustand hands back new references on every mutation. Verified by
  `useGraphViolations.test.ts` (recompute-on-change + memo-stability) and the e2e spec.
- **AC2** (surfaced on the offending node/edge; no separate log/panel): markers render only on
  `PipelineNode` (corner badge + destructive ring) and the new custom `PipelineEdge` (destructive
  stroke + midpoint marker via `EdgeLabelRenderer`). No error list/panel exists anywhere — grep
  and the e2e spec confirm the canvas markers are the only surface.
- **AC3** (multi-violation, actionable structural text, never a sensitive value): `ViolationMarker`
  shows a count badge and lists every `formatViolationMessage(v)` on hover. Messages interpolate
  only structural fields (ids/field names/indices) and are *structurally incapable* of leaking a
  `config`/`metadata`/`expression`/`constant` payload — the `Violation` union carries none.
  `formatViolationMessage.test.ts` locks this per kind.
- **AC4** (cycle on participating nodes/edges): `graph-cycle` fans to every node in the path and
  to the consecutive-pair edges (`cycleEdges`), correctly excluding an unrelated edge that merely
  connects two in-cycle nodes. Covered by `attributeViolations.test.ts`.
- **AC5** (valid graph → clean canvas): empty violation list → `{ byNodeId: {}, byEdgeId: {} }` →
  no markers. Unit- and e2e-tested (seed graph shows zero markers).
- **AC6** (attribution/format unit-tested; component/interaction tested): `attributeViolations`
  (all kinds → correct buckets, multi-collection, cycle fan-out, index resolution + parallel-edge
  and out-of-range fallbacks) and `formatViolationMessage` are unit-tested with non-sensitive
  fixtures; `ViolationMarker`, `PipelineNode`, and the hook have component/hook tests; the optional
  Playwright spec drives the real canvas.
- **AC7** (no steering violations): no secrets/PII in the diff (grep clean); fixtures carry only
  ids/field names; TSDoc on every export; typed exports; functional components; feature-grouped
  layout; Vitest/Playwright split per `steering/languages/typescript.md`.

**Design fidelity:** matches the approved Design, with the single DRUFF-15-shape adaptation already
flagged in the Design and documented in Implementation Notes (singular `nodeId`/`edge` +
unconditional `edgeIndex`; `validateFieldWiring` entry point). Attribution stays a pure
data-extraction step, not a kind→surface decision. The open "fan to all referenced elements vs.
single canonical surface" question is a product decision explicitly deferred by the Design, not a
defect — it reliably satisfies "on the offending node **or** edge."

**Toolchain (re-run, all green):** `tsc --noEmit` 0 errors; `eslint .` 0 problems; `prettier
--check` clean on every touched file; `vitest run` 487/487; `playwright test` 5/5 (including the
new `e2e/validation-surface.spec.ts`). The `ResizeObserver` stub added to `vitest.setup.ts` is the
correct minimal fix for Radix Tooltip's first use under jsdom.

No blocking issues. Status → `done`.
