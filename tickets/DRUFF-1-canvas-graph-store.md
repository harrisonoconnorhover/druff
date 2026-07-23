---
id: DRUFF-1
title: Introduce a Zustand canvas graph store
status: done
component: frontend
epic: canvas-editing
depends_on: []
created: 2026-07-22
---

## Context

Today `PipelineCanvas.tsx` holds the graph in local React Flow hooks (`useNodesState`/
`useEdgesState`) seeded from a hardcoded `initialNodes`/`initialEdges`. The palette (DRUFF-2),
inspector (DRUFF-3), and save/load (DRUFF-5) all need to read and mutate one shared, mutable graph
that lives outside the component. Per `steering/00-project-overview.md`, Zustand is the canvas
state model (and React Flow's recommended pairing). This ticket establishes that store as the
single source of truth for canvas nodes and edges, with no visible behavior change yet.

## Acceptance Criteria

- [ ] A Zustand store owns the canvas `nodes` and `edges` and exposes actions to add a node, update
      a node's `data`, remove a node, and apply React Flow node/edge changes and new connections.
- [ ] `PipelineCanvas` renders from the store instead of local `useNodesState`/`useEdgesState`; the
      existing pan/zoom, connect, and redraw-edge behavior is unchanged.
- [ ] The former hardcoded graph is seeded through the store (as initial state) rather than inlined
      in the component, so it can later be replaced by a loaded graph.
- [ ] Store actions have unit tests (add/update/remove node, connect edge) with no network or
      React rendering (see `steering/02-engineering.md`).
- [ ] No steering violations (secrets, style, docs).

## Design

### Approach

Extract the graph out of `PipelineCanvas` into a single Zustand store that owns `nodes` and
`edges` and exposes both the React Flow wiring callbacks (`onNodesChange`, `onEdgesChange`,
`onConnect`) and the higher-level graph mutations later tickets need (`addNode`, `updateNodeData`,
`removeNode`). The React Flow change/connect handlers are implemented in the store with the same
pure helpers React Flow's own hooks use under the hood — `applyNodeChanges`, `applyEdgeChanges`,
and `addEdge` — so pan/zoom, selection, drag, connect, and redraw behavior are byte-for-byte
unchanged; we're only moving *where the state lives*, not how React Flow drives it. This directly
satisfies "renders from the store instead of local hooks; existing behavior unchanged."

The store is the single source of truth (SRP: it owns graph state and nothing else — no rendering,
no palette/inspector concerns). `PipelineCanvas` becomes a thin view that subscribes to the slices
it needs and forwards the store callbacks to `<ReactFlow>`. This is the seam DRUFF-2 (palette →
`addNode`), DRUFF-3 (inspector → `updateNodeData` / selection), and DRUFF-5 (save/load → replace
nodes/edges wholesale) all plug into without touching the canvas component again.

To keep the store's own logic **unit-testable with no React rendering and no network** (an explicit
AC and a `steering/02-engineering.md` rule), the state initializer is a plain factory function
rather than a module-level singleton. A `createGraphState(seed)` factory returns the Zustand
initializer; the app binds one instance via `create(createGraphState(SEED_GRAPH))` exported as the
`useGraphStore` hook, while tests instantiate a fresh isolated vanilla store per test with
`createStore(createGraphState(fixtureSeed))` and call actions through `store.getState()`. No shared
mutable singleton across tests, no `renderHook`, no DOM.

The former hardcoded `initialNodes`/`initialEdges` move into the store module as an exported
`SEED_GRAPH` (kept as the same placeholder graph, same comment about it being a stand-in for a
Dander-loaded graph). Because seeding flows through the factory, DRUFF-5 can later swap `SEED_GRAPH`
for a graph loaded via the Dander contract by replacing the seed argument — no component change.

### Store contract

`src/lib/graph-store.ts` exports:

```ts
type GraphState = {
  nodes: Node<PipelineNodeData>[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange<Node<PipelineNodeData>>[]) => void; // applyNodeChanges
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;                   // applyEdgeChanges
  onConnect: (connection: Connection) => void;                           // addEdge
  addNode: (node: Node<PipelineNodeData>) => void;                       // append
  updateNodeData: (id: string, patch: Partial<PipelineNodeData>) => void; // merge into data
  removeNode: (id: string) => void; // remove node + any edge touching it
};
```

Design notes / rationale, and boundaries flagged for adjacent tickets:

- **`addNode` takes an already-constructed `Node`, not a `kind`+`position`.** Building a node from a
  palette kind + drop position is DRUFF-2's job (and DRUFF-2 unit-tests that construction
  separately). Keeping the store's action a dumb append preserves its single responsibility and
  avoids putting id-generation / default-label policy inside the store.
- **`updateNodeData` merges a `Partial<PipelineNodeData>`** so DRUFF-3 can extend `PipelineNodeData`
  with a `config` field and edit it through the same action without changing the store API. The
  action shallow-merges the patch into the target node's `data` and replaces the node object
  (new array + new node reference) so React Flow re-renders.
- **`removeNode` also prunes incident edges** — a node removal must not leave a dangling edge (which
  Dander's `graph_ops` validation would flag). This is graph-integrity logic, so it belongs in the
  store and is worth a dedicated test.
- Selection is *not* added here — nodes carry React Flow's built-in `selected` flag via
  `onNodesChange`, which is sufficient for DRUFF-3 to read the selected node later. No separate
  `selectedId` field until a ticket needs one (no speculative generality).

### Component wiring

`PipelineCanvas.tsx` (the inner `Canvas`) subscribes with **narrow per-field selectors**
(`useGraphStore((s) => s.nodes)`, `((s) => s.onConnect)`, …) rather than pulling the whole state
object, to avoid re-rendering on unrelated changes / identity churn. Store actions are stable
references (Zustand keeps them across renders), so no `useCallback` is needed and the local
`useCallback(onConnect)` is removed. `nodeTypes` stays module-level as today. The
`ReactFlowProvider` wrapper and the outer `PipelineCanvas` shell are unchanged. No prop drilling —
the store is imported directly where used.

### Files

| File | Change | Purpose |
|---|---|---|
| `src/lib/graph-store.ts` | **create** | `createGraphState(seed)` factory, `useGraphStore` hook bound to `SEED_GRAPH`, exported `SEED_GRAPH`, and the `GraphState` type. TSDoc on exports (per `typescript.md`). |
| `src/lib/graph-store.test.ts` | **create** | Vitest unit tests over a fresh `createStore(createGraphState(fixture))` per test: add / update-data / remove node (asserts incident edges pruned) / connect edge. No rendering, no network; fixture carries no real/sensitive data. |
| `src/features/pipeline-canvas/PipelineCanvas.tsx` | **edit** | Drop `useNodesState`/`useEdgesState`/`initialNodes`/`initialEdges`/local `onConnect`; render from `useGraphStore` selectors and forward store callbacks. |

Colocation note: `typescript.md` names `src/lib/` explicitly as the home for Zustand stores, so the
store lives there (not under the feature folder) — it's shared state consumed by palette / inspector
/ save-load, not canvas-private.

### Test seams

- **Unit (Vitest, this ticket):** the store's action logic, exercised on an isolated vanilla store
  instance — pure state transitions, no React, no network. This is the AC's required coverage.
- **Component/e2e untouched:** the existing Playwright spec (`e2e/pipeline-canvas.spec.ts`) still
  asserts the placeholder nodes render and the canvas pans; since `SEED_GRAPH` is the same graph and
  behavior is unchanged, it should pass as-is and is the guard for "behavior unchanged." Real
  drag/connect stays in Playwright per `typescript.md` (jsdom can't drive React Flow pointer
  interactions) — so the canvas wiring itself is not unit-tested, by policy.

### Trade-offs

- **Factory + vanilla `createStore` for tests vs. a single `create()` singleton with `setState`
  reset between tests.** Chose the factory: per-test isolation with zero shared mutable state and no
  `beforeEach` reset ceremony, and it keeps the initializer pure/injectable (seed is a parameter).
  Slight extra indirection (one factory function) is the cost.
- **Store owns the React Flow callbacks vs. keeping `useNodesState`/`useEdgesState` in the component
  and only mirroring into the store.** Chose store-owns-callbacks: two sources of truth (local hook
  state + store) is exactly the drift DRUFF-3's AC warns against ("not panel-local state that can
  drift from the canvas"). One store, one truth.
- **`addNode(node)` vs. `addNode(kind, position)`.** Chose the dumb append to protect SRP; node
  construction is DRUFF-2's tested concern. Revisit only if a second caller needs the same
  construction (then extract a shared `makeNode` helper, not a fatter store).

### Open questions / under-specified

- None blocking. `updateNodeData` merging a partial (to accommodate DRUFF-3's future `config`) is a
  forward-looking choice, not required by DRUFF-1's ACs — called out above so PR-review sees it as
  deliberate, not scope creep.

## Implementation Notes

Implemented exactly per the Design section; no deviations.

- **`src/lib/graph-store.ts` (new).** Exports `GraphState`, `createGraphState(seed)` (a
  `StateCreator<GraphState>` factory), `SEED_GRAPH` (the same placeholder 3-node graph moved
  verbatim out of `PipelineCanvas.tsx`, same "not a real pipeline" comment), and `useGraphStore`
  bound via `create<GraphState>(createGraphState(SEED_GRAPH))`. `onNodesChange`/`onEdgesChange`/
  `onConnect` are thin wrappers over React Flow's own `applyNodeChanges`/`applyEdgeChanges`/
  `addEdge` helpers, so pan/zoom/drag/select/connect/redraw are byte-for-byte the same as the
  `useNodesState`/`useEdgesState` hooks they replace. `addNode` appends a pre-built node (no
  id-generation/kind policy in the store, per the design's SRP call-out). `updateNodeData`
  shallow-merges a `Partial<PipelineNodeData>` into the target node's `data` and replaces both the
  node object and the array so React Flow sees new references. `removeNode` filters the node out
  and prunes any edge with a matching `source` or `target`, so a removal can never leave a
  dangling edge.
- **`src/lib/graph-store.test.ts` (new).** Vitest unit tests over an isolated
  `createStore(createGraphState(fixture))` per test (via `zustand/vanilla`) — no rendering, no
  network, fixture data is placeholder-only (`Source A`/`Write B`/`Transform C`, no real/sensitive
  content). Covers: `addNode` appends; `updateNodeData` merges without touching other nodes;
  `removeNode` removes the node and prunes its incident edge (plus a second test asserting an
  unrelated edge survives); `onConnect` adds a distinct edge for a new connection (adjusted the
  connection's target node from the design sketch's assumed a→b duplicate, since React Flow's
  `addEdge` de-dupes an already-existing identical connection — used a fresh a→c connection
  instead so the added-edge assertion is meaningful); `onNodesChange`/`onEdgesChange` apply a
  `remove` change through `applyNodeChanges`/`applyEdgeChanges`. 9 tests, all passing.
- **`src/features/pipeline-canvas/PipelineCanvas.tsx` (edit).** Removed `useNodesState`/
  `useEdgesState`, the local `initialNodes`/`initialEdges`, the `useCallback`-wrapped `onConnect`,
  and the now-unused `addEdge`/`useCallback` imports. `Canvas` now reads `nodes`, `edges`,
  `onNodesChange`, `onEdgesChange`, `onConnect` via five narrow `useGraphStore` selectors and
  forwards them to `<ReactFlow>` unchanged. `nodeTypes`, the `ReactFlowProvider` wrapper, and the
  outer `PipelineCanvas` shell are untouched.

**Toolchain results:**
- `eslint .` — clean.
- `prettier --check .` — clean on all touched files (one pre-existing, unrelated warning on
  `README.md` from before this change).
- `tsc --noEmit` — clean.
- `vitest run` — 2 files, 9 tests, all passing (7 new store tests + the pre-existing `cn` test).
- `playwright test` (`e2e/pipeline-canvas.spec.ts`) — both existing specs (placeholder nodes
  render; canvas pans) still pass unmodified, confirming the AC's "existing behavior unchanged."

No deviations from the Design. No new secrets/config keys introduced (nothing added to
`.env.example`). No steering violations found.

## Review Log

_Append-only. PR-Review adds entries below._

### 2026-07-22 — PASS

Reviewed the store (`src/lib/graph-store.ts`), its tests (`src/lib/graph-store.test.ts`), and the
rewired canvas (`src/features/pipeline-canvas/PipelineCanvas.tsx`) against all five acceptance
criteria, the three universal steering files, and `steering/languages/typescript.md`.

**Acceptance criteria — all met:**

1. **Store owns nodes/edges + actions.** `GraphState` exposes `nodes`, `edges`, `onNodesChange`,
   `onEdgesChange`, `onConnect`, `addNode`, `updateNodeData`, `removeNode`. Change/connect handlers
   are thin wrappers over React Flow's own `applyNodeChanges`/`applyEdgeChanges`/`addEdge`. ✓
2. **Canvas renders from the store, behavior unchanged.** Diff confirms `useNodesState`/
   `useEdgesState`/local `onConnect`/`useCallback`/`addEdge` imports removed; `Canvas` now reads five
   narrow `useGraphStore` selectors and forwards them. Since the callbacks delegate to the same RF
   helpers, pan/zoom/connect/redraw are behaviorally identical. ✓
3. **Former hardcoded graph seeded through the store.** `initialNodes`/`initialEdges` moved verbatim
   into exported `SEED_GRAPH` (same 3 nodes, same 2 edges, same "not a real pipeline" comment);
   seeding flows through `createGraphState(seed)` so DRUFF-5 can swap the seed. ✓
4. **Unit tests, no network / no React.** 7 store tests over an isolated `createStore(createGraphState(fixture))`
   via `zustand/vanilla`: add appends; update shallow-merges without touching siblings; remove prunes
   incident edges; remove leaves unrelated edges intact; `onConnect` adds a distinct edge; `onNodesChange`/
   `onEdgesChange` apply remove changes. Fixture data is placeholder-only. ✓
5. **No steering violations.** No secrets/credentials in the diff; fixture and seed carry no sensitive
   data; nothing added to `.env.example` (none needed). TSDoc on every export, all exports type-annotated,
   no bare `any`; store lives in `src/lib/` and tests are colocated per `typescript.md`. The module-scope
   `create(...)` is Zustand's idiomatic store-hook construction (a pure factory call), not a side effect. ✓

**Toolchain (re-run by review):** `tsc --noEmit` clean · `eslint` clean · `vitest run` 2 files / 9
tests passing · `prettier --check` clean on all three touched files (the sole `README.md` warning is a
pre-existing, unrelated untracked file, correctly excluded from this ticket's scope).

No blocking issues. Verdict: **PASS** — status set to `done`.
