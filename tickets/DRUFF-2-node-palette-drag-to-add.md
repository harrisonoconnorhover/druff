---
id: DRUFF-2
title: Node palette with drag-to-add
status: done
component: frontend
epic: canvas-editing
depends_on: [DRUFF-1]
created: 2026-07-22
---

## Context

The "Canvas" module in `steering/00-project-overview.md` calls for dragging nodes from a palette
onto the surface. Right now the graph is hardcoded; a palette that creates real nodes is what makes
"drag and drop" real. This ticket adds a sidebar listing the node kinds (source / transform /
write / trigger) and wires drag-and-drop so dropping a kind onto the canvas creates a new node in
the store (DRUFF-1) at the drop position. `PipelineNode` currently renders only source/transform/
write, so the `trigger` kind must also be given a visual treatment.

## Acceptance Criteria

- [x] A sidebar palette lists the four node kinds: source, transform, write, trigger.
- [x] Dragging a palette item onto the canvas creates a new node of that kind in the store, placed
      at the drop location, with a sensible default label.
- [x] The new node is immediately connectable (has the standard handles) like existing nodes.
- [x] `PipelineNode` renders the `trigger` kind (icon + accent) consistently with the other kinds.
- [x] Logic that is not pure React Flow wiring (e.g. building a new node from a kind + position) is
      unit-tested (see `steering/02-engineering.md`).
- [x] No steering violations (secrets, style, docs).

## Design

### Approach

The canvas already renders `PipelineNode` custom nodes and, after DRUFF-1, reads/mutates its graph
through a Zustand store rather than local React Flow hooks. DRUFF-2 adds two things on top of that:
a **palette sidebar** listing the node kinds, and the **drag-to-add wiring** that turns a drop onto
the pane into a real node in the store at the drop position. It also gives the `trigger` kind a
visual treatment so `PipelineNode` renders all four kinds.

Drag-to-add uses React Flow's canonical pattern: HTML5 native drag-and-drop, which communicates the
dragged kind through `event.dataTransfer` (a string channel) rather than React state — so the
palette does **not** need to live inside the `ReactFlowProvider` or share a store with the canvas.
The palette item's `onDragStart` writes the kind onto the drag event; the canvas pane's
`onDragOver`/`onDrop` read it back, convert the drop's screen coordinates into flow coordinates with
`useReactFlow().screenToFlowPosition`, build a node, and hand it to the store's `addNode`.

The one piece of real, testable logic — turning a `kind` + drop `position` into a fully-formed
`Node<PipelineNodeData>` (correct `type`, a sensible default label, `data.kind`) — is extracted into
a **pure `createNode` factory** that takes the node id as a parameter. Keeping id generation out of
the factory makes it deterministic under Vitest without mocking `crypto`; the drop handler is the
only place that mints a real id (`crypto.randomUUID()`). This matches the steering rule that
non-pure-React-Flow logic is unit-tested while the real pointer/drag interaction is covered by
Playwright (jsdom can't drive HTML5 drag reliably).

To stay config-driven and avoid duplicating per-kind metadata between the node renderer and the
palette, the per-kind visual + label config is centralized in one **`nodeKinds.ts`** module that
both `PipelineNode` (its current `KIND_STYLE`) and `NodePalette` consume. Adding a future kind is
then a one-row change in one file.

### Store contract assumed from DRUFF-1

This design calls `addNode(node: Node<PipelineNodeData>)` — i.e. the store accepts an
already-built node. **Coordination note / to confirm against DRUFF-1's final store:** if DRUFF-1
instead exposes `addNode(kind, position)` and builds the node internally, then `createNode` should
live inside the store module and be called there — the pure factory stays the unit-tested seam
either way; only its call site moves. The Code agent should read the store's actual `addNode`
signature before wiring and adapt the call site, not duplicate node-building logic.

### Components / modules & data flow

- **`nodeKinds.ts`** (new, config) — single source of truth for the four kinds. Exports the
  `PipelineNodeKind` union (moved here from `PipelineNode.tsx`), a type guard
  `isPipelineNodeKind(value: unknown): value is PipelineNodeKind` derived from the config keys, and
  a `NODE_KINDS` record keyed by kind with `{ label, defaultLabel, icon, accent }`. `label` is the
  palette display name ("Source", "Transform", "Write", "Trigger"); `defaultLabel` is what a
  freshly-dropped node is named ("New source", …); `icon`/`accent` are the existing visual fields.
- **`createNode.ts`** (new, pure) — `createNode(kind, position, id): Node<PipelineNodeData>`.
  Returns `{ id, type: "pipelineNode", position, data: { label: NODE_KINDS[kind].defaultLabel, kind } }`.
  No side effects, no id generation, no store access. This is the unit-tested seam.
- **`NodePalette.tsx`** (new, `"use client"`) — renders `Object.values` of the kinds as a vertical
  list of draggable items (icon + `label`). Each item: `draggable`, and `onDragStart` sets
  `event.dataTransfer.setData(DND_MIME, kind)` and `effectAllowed = "move"`. Presentational only —
  it does not touch the store or React Flow; its entire contract is "emit a kind on the drag event."
  `DND_MIME` (e.g. `"application/druff-node-kind"`) is a shared constant colocated with the palette
  or in `nodeKinds.ts`.
- **`PipelineCanvas.tsx` / inner `Canvas`** (edit) — the drop target. The inner `Canvas` (already
  inside `ReactFlowProvider`) gains `const { screenToFlowPosition } = useReactFlow()` and:
  - `onDragOver` → `event.preventDefault(); event.dataTransfer.dropEffect = "move"` (required for a
    drop to fire).
  - `onDrop` → `event.preventDefault()`, read `kind = event.dataTransfer.getData(DND_MIME)`, guard
    with `isPipelineNodeKind(kind)` (ignore unknown payloads), compute
    `position = screenToFlowPosition({ x: event.clientX, y: event.clientY })`, then
    `addNode(createNode(kind, position, crypto.randomUUID()))`.
  These handlers go on the `ReactFlow` element. The outer `PipelineCanvas` becomes a
  `flex h-full w-full` row: `<NodePalette />` sidebar + the `ReactFlowProvider`-wrapped canvas.
- **`PipelineNode.tsx`** (edit) — drop the local `PipelineNodeKind`/`KIND_STYLE` definitions; import
  the union and `NODE_KINDS` from `nodeKinds.ts` and read `icon`/`accent` from there. Add the
  `trigger` row in `nodeKinds.ts` (icon e.g. lucide `Zap` or `Timer`; a distinct accent, e.g.
  `border-l-violet-500`). No change to handle rendering — all kinds keep the standard
  left target / right source handles so a dropped node is immediately connectable (AC).

Data flow on drop: `NodePalette` (drag event, kind) → `Canvas.onDrop` (guard + coords) →
`createNode` (pure build) → store `addNode` → store `nodes` → `ReactFlow` re-renders with the new
node. State lives only in the DRUFF-1 store; the palette and factory are stateless.

### Files to touch / create

- `src/features/pipeline-canvas/nodes/nodeKinds.ts` — new; centralized kind config + union + guard.
- `src/features/pipeline-canvas/nodes/createNode.ts` — new; pure node factory.
- `src/features/pipeline-canvas/nodes/createNode.test.ts` — new; Vitest unit tests.
- `src/features/pipeline-canvas/NodePalette.tsx` — new; draggable palette sidebar.
- `src/features/pipeline-canvas/nodes/PipelineNode.tsx` — edit; consume `nodeKinds.ts`, add `trigger`.
- `src/features/pipeline-canvas/PipelineCanvas.tsx` — edit; drop handlers + palette layout + `addNode`.
- `e2e/pipeline-canvas.spec.ts` — edit; add a Playwright test for the drag-drop-create flow.
- `src/app/page.tsx` — likely no change (palette lives inside `PipelineCanvas`); confirm layout fills height.

### Test seams

- **Unit (Vitest)** — `createNode.test.ts`: for each of the four kinds, asserts the returned node
  has `type === "pipelineNode"`, the given `id` and `position`, `data.kind === kind`, and
  `data.label === NODE_KINDS[kind].defaultLabel`. Optionally a `isPipelineNodeKind` test for a
  known-good and a junk string. No React render, no network — pure per steering.
- **Component (Vitest + RTL, optional-but-recommended)** — `NodePalette` renders exactly four
  draggable items with the expected labels. (Rendering only; the drag itself is not exercised here.)
- **E2E (Playwright)** — extend `e2e/pipeline-canvas.spec.ts`: drag a palette item onto the pane and
  assert a new node with the default label appears and can be selected/connected. Real drag/pointer
  behavior belongs here, not jsdom, per `steering/languages/typescript.md`.
- No Dander/backend calls are involved in this ticket, so nothing external is mocked.

### Trade-offs & flags

- **Native HTML5 DnD over a JS drag lib** — it's React Flow's documented approach, needs no new
  dependency, and decouples the palette from the canvas (communicates via `dataTransfer`, not shared
  state). Cost: drop only fires when `onDragOver` calls `preventDefault()` — a well-known footgun,
  called out above so the Code agent doesn't miss it.
- **Id passed into `createNode` rather than generated inside** — keeps the factory pure and
  deterministic for unit tests; the impurity (`crypto.randomUUID()`) is isolated to the single drop
  call site.
- **Centralized `nodeKinds.ts`** — one extra module, but removes the duplication the palette would
  otherwise create between itself and `PipelineNode`, and makes "add a kind" a one-file change.
- **Flag — `trigger` handles:** a trigger is a pipeline *start* and arguably has no upstream input,
  so a target handle is semantically odd. This ticket's AC explicitly requires the *standard*
  handles ("immediately connectable like existing nodes"), so this design keeps them for all kinds
  and defers trigger-specific handle semantics to a later ticket. Noted so it's a decision, not an
  oversight.
- **Flag — default label wording** ("New source", etc.) is a guess the AC leaves open ("a sensible
  default label"); trivially adjustable in `nodeKinds.ts` if product wants different copy.
- **Flag — `addNode` signature** — see "Store contract assumed from DRUFF-1" above; confirm before
  wiring.

## Implementation Notes

Implemented per the Design section, with no deviations from the assumed store contract — DRUFF-1's
`addNode(node: Node<PipelineNodeData>)` already matches what this design expected, so `createNode`
stayed a standalone pure factory (no need to move it into the store module).

**Files added:**
- `src/features/pipeline-canvas/nodes/nodeKinds.ts` — `PipelineNodeKind` union (moved out of
  `PipelineNode.tsx`), `NODE_KINDS` config (label/defaultLabel/icon/accent per kind, now including
  `trigger`: `Zap` icon, `border-l-violet-500` accent), `PIPELINE_NODE_KINDS` ordered list, and the
  `isPipelineNodeKind` type guard.
- `src/features/pipeline-canvas/nodes/createNode.ts` — pure `createNode(kind, position, id)`
  factory; no id generation, no store/side effects.
- `src/features/pipeline-canvas/nodes/createNode.test.ts` — Vitest: one case per kind (via
  `it.each`) asserting shape/`type`/`data.kind`/`data.label`, a no-mutation check on the input
  `position`, and `isPipelineNodeKind` cases (each known kind, an unknown string, non-string
  values).
- `src/features/pipeline-canvas/NodePalette.tsx` — presentational, stateless draggable sidebar;
  exports the shared `DND_MIME` constant. Renders the four kinds off `PIPELINE_NODE_KINDS` so
  adding a kind to `nodeKinds.ts` is enough to add it to the palette too.

**Files edited:**
- `src/features/pipeline-canvas/nodes/PipelineNode.tsx` — dropped the local `PipelineNodeKind`/
  `KIND_STYLE`; now imports both from `nodeKinds.ts` (re-exports `PipelineNodeKind` for existing
  importers). No change to handle rendering, so `trigger` nodes get the same left/right handles as
  every other kind (AC: "immediately connectable ... like existing nodes").
- `src/features/pipeline-canvas/PipelineCanvas.tsx` — inner `Canvas` now calls
  `useReactFlow().screenToFlowPosition` and wires `onDragOver` (`preventDefault` +
  `dropEffect = "move"`, required for `onDrop` to fire at all) and `onDrop` (reads the kind off
  `dataTransfer` via `DND_MIME`, guards with `isPipelineNodeKind`, converts the drop's screen
  coords to flow coords, and calls `addNode(createNode(kind, position, crypto.randomUUID()))`).
  Outer `PipelineCanvas` is now a `flex h-full w-full` row: `<NodePalette />` + a `min-w-0 flex-1`
  wrapper around the `ReactFlowProvider`. That wrapper was a necessary addition beyond the design's
  literal wording — `ReactFlowProvider` renders no DOM node (context only), so without a sized
  flex-item ancestor the canvas's own `width:100%/height:100%` had nothing definite to fill once it
  became a flex sibling of the palette.
- `e2e/pipeline-canvas.spec.ts` — added a Playwright test that drags the "Transform" palette item
  onto the pane via raw mouse down/move/up (Playwright's documented recipe for native HTML5 DnD,
  since there's no `dragAndDrop()` API for this case) and asserts the "New transform" node appears
  and exposes the standard two handles.

**Verification run:** `eslint` (clean), `prettier --check` on changed files (clean; the pre-existing
`README.md` formatting warning is unrelated to this ticket), `tsc --noEmit` (clean), `vitest run`
(20/20 passed, including the new `createNode`/`isPipelineNodeKind` suite), `playwright test`
(3/3 passed, including the new drag-drop-create test).

No open flags from the design needed a different call from what it proposed (trigger keeps
standard handles per the AC; default-label wording used as suggested; `nodeKinds.ts` centralization
as designed).

## Review Log

_Append-only. PR-Review adds entries below._

### 2026-07-22 — PASS

Reviewed against all six acceptance criteria, the three universal steering files, and
`steering/languages/typescript.md`. Inspected every file named in the Implementation Notes plus the
DRUFF-1 store the drop path depends on.

**Acceptance criteria — all met:**
1. Palette lists the four kinds — `NodePalette` renders `PIPELINE_NODE_KINDS` (source/transform/
   write/trigger) off the centralized `NODE_KINDS` config. ✔
2. Drag-to-add creates a node at the drop position with a sensible default label — `Canvas.onDrop`
   guards the payload, converts screen→flow coords via `screenToFlowPosition`, and calls
   `addNode(createNode(kind, position, crypto.randomUUID()))`; default label is `NODE_KINDS[kind].defaultLabel`
   ("New transform", …). ✔
3. New node immediately connectable — `PipelineNode` unconditionally renders the standard
   left-target / right-source handles for every kind; the e2e test asserts the dropped node exposes
   exactly two handles. ✔
4. `trigger` kind rendered (icon + accent) — added to `NODE_KINDS` (`Zap` icon, `border-l-violet-500`);
   `PipelineNode` reads icon/accent from `NODE_KINDS[data.kind]`, so all four kinds render
   consistently. ✔
5. Non-pure-RF logic unit-tested — `createNode.test.ts` covers `createNode` per kind (shape/type/
   position/`data.kind`/`data.label` + a no-mutation check) and `isPipelineNodeKind` (each known
   kind, unknown string, non-string). Real drag interaction correctly deferred to Playwright per
   `typescript.md`. ✔
6. No steering violations — see below. ✔

**Security:** no hardcoded secrets/tokens/credentials in the diff; `DND_MIME` is a MIME identifier,
not a secret; nothing sensitive logged or committed; no client-shipped credentials. Clean.

**Design fidelity:** implements the approved design faithfully — centralized `nodeKinds.ts`, pure
id-injected `createNode` factory, native HTML5 DnD via `dataTransfer` with the required
`onDragOver` `preventDefault()`, and `isPipelineNodeKind` guarding foreign drop payloads. The one
noted deviation (the `min-w-0 flex-1` wrapper around `ReactFlowProvider`, which renders no DOM node)
is justified and correct.

**Conventions & engineering:** store contract assumed from DRUFF-1 matches its actual
`addNode(node: Node<PipelineNodeData>)` signature (graph-store.ts) — no drift. TSDoc present on all
new exports; strict typing throughout, no bare `any`; `"use client"` at the interactive boundary
only; feature-grouped structure; logic seam isolated and tested with no network.

**Verification (re-run during review):** `eslint` clean · `tsc --noEmit` clean · `prettier --check`
clean on all changed files · `vitest run` 20/20 · `playwright test` 3/3 (the new drag-drop test
genuinely drives the flow — its "New transform" assertion only passes if `onDrop`→`addNode` fired).

No blocking issues. Status → `done`.
