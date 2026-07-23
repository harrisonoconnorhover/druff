---
id: DRUFF-3
title: Node inspector panel
status: done
component: frontend
epic: canvas-editing
depends_on: [DRUFF-1]
created: 2026-07-22
---

## Context

Nodes are currently just labeled boxes with no way to edit them. Per the module map in
`steering/00-project-overview.md`, selecting a node should let the user edit its properties. This
ticket adds a side panel that, when a node is selected, shows and edits that node's properties —
its display name and its kind-specific config — writing changes back through the store (DRUFF-1).
It establishes the generic inspector shell; a concrete config-driven form for a real connector is
proven in DRUFF-6.

## Acceptance Criteria

- [ ] Clicking a node opens an inspector panel bound to that node; deselecting/clearing selection
      hides or empties it.
- [ ] Editing the node's display name in the panel updates the node on the canvas live (via the
      store).
- [ ] The panel has a place to render kind-specific config (even if generic key/value for now),
      and edits persist to the node's `config` in the store.
- [ ] Editing state is driven by the store, not panel-local state that can drift from the canvas.
- [ ] Any non-trivial mapping logic (node -> editable fields, edits -> node data) is unit-tested
      (see `steering/02-engineering.md`).
- [ ] No steering violations (secrets, style, docs).

## Design

### Approach

The inspector is a **client component that reads and writes the DRUFF-1 Zustand graph store — it
holds no editing state of its own.** This is the crux of AC4: the panel is a pure projection of the
store. It derives *which* node to inspect from the store's `nodes` (React Flow writes selection into
node objects as `selected: true` via the `onNodesChange` → `applyNodeChanges` path DRUFF-1 already
wires), and it writes every edit straight back through the store's `updateNodeData` action. Because
the canvas node components also render from those same store `nodes`, a name edit made in the panel
re-renders the node on the canvas with no extra plumbing (AC2). There is deliberately no local
`useState` mirror of the node's fields that could drift.

Selection is *derived*, not separately tracked: a store selector returns the node when **exactly
one** node is selected, and `null` otherwise (zero, or a multi-select). The panel is always mounted
as a fixed-width `aside` beside the canvas and simply renders an **empty state** when the selector
returns `null` (AC1 — "hides or empties"; we choose *empties* so the layout doesn't reflow on every
click). Keeping the inspector outside React Flow's `ReactFlowProvider` is intentional and safe: it
depends only on the module-level Zustand store, not React Flow context, so it can sit as a sibling of
`PipelineCanvas` in the page. The store is the seam that decouples the two panes.

The config region (AC3) is the extension point for DRUFF-6. The inspector delegates the entire
kind-specific area to a single swappable **`NodeConfigEditor`** boundary. For this ticket that
boundary is a **generic key/value editor** over the node's `config` record; DRUFF-6 will later select
a descriptor-driven form for a known connector kind at the same boundary. We stop at a single
component prop-seam rather than building a form registry now — no speculative generality (per
02-engineering: design the seam, don't build what no ticket asks for).

The **testable logic** AC5 targets is the mapping between a `config` record and the editable
key/value rows the generic editor manipulates (add row, rename a key, clear a key, duplicate keys).
That lives in a pure, render-free `nodeConfig.ts` module and is where the unit tests concentrate; the
React components stay thin around it.

### Data model change

`PipelineNodeData` (in `nodes/PipelineNode.tsx`) gains an optional config bag:

```ts
export type PipelineNodeData = {
  label: string;                        // the node's display name (edited by the inspector)
  kind: PipelineNodeKind;
  config?: Record<string, unknown>;     // kind-specific config; edited via NodeConfigEditor
};
```

`config` is optional so existing seed nodes and DRUFF-1/2 stay valid. The generic editor treats
values as **strings** for now; typed/validated fields arrive with the descriptor form in DRUFF-6.

### Store contract consumed (from DRUFF-1)

DRUFF-3 does **not** add store state. It consumes DRUFF-1's `useGraphStore` (provisional path
`src/lib/graphStore.ts` — align to whatever DRUFF-1 lands):

- `nodes: Node<PipelineNodeData>[]` — read for selection + current values.
- `updateNodeData(id: string, patch: Partial<PipelineNodeData>): void` — the one mutation used, for
  both name (`{ label }`) and config (`{ config }`) edits.

If DRUFF-1's update action is shaped as a full-`data` replace rather than a shallow patch, the panel
merges before calling. One new **selector** is added alongside the store (co-located with DRUFF-1's
module, or in the inspector feature if the store exports raw state): `selectSelectedNode(state) =>
Node<PipelineNodeData> | null` returning the sole selected node or `null`.

### Components / modules

| Name | Kind | Responsibility |
|---|---|---|
| `NodeInspector` | client component | The panel shell. Subscribes to `selectSelectedNode` + `updateNodeData`. Renders empty state when `null`; otherwise the name field and the config section. Owns no field state. |
| `NodeNameField` | client component (optional split) | Controlled `Input` bound to `node.data.label`; `onChange` → `updateNodeData(id, { label })`. May be inlined into `NodeInspector` if trivial. |
| `NodeConfigEditor` | client component | The swappable config boundary. For now: a generic key/value list — add/remove rows, edit key + value — driven by `config` in and `onChange(config)` out. Purely presentational; injects its callback, so it's testable and DRUFF-6 can swap it. |
| `nodeConfig.ts` | pure module | `configToEntries(config)` ↔ `entriesToConfig(entries)`; the non-trivial mapping (blank-key drop, duplicate-key resolution, order-stable rows). No React, no store. |

**Data flow:** `store.nodes` → `selectSelectedNode` → `NodeInspector` → (`NodeNameField`,
`NodeConfigEditor`) → user edit → `updateNodeData(id, patch)` → store → re-render of both the panel
and the canvas node. One directional loop through the store.

### Files to touch / create

- **`src/features/pipeline-canvas/inspector/NodeInspector.tsx`** (new) — panel shell + empty state.
- **`src/features/pipeline-canvas/inspector/NodeConfigEditor.tsx`** (new) — generic key/value editor.
- **`src/features/pipeline-canvas/inspector/nodeConfig.ts`** (new) — pure config↔entries mapping.
- **`src/features/pipeline-canvas/inspector/nodeConfig.test.ts`** (new) — Vitest unit tests (AC5).
- **`src/features/pipeline-canvas/inspector/NodeInspector.test.tsx`** (new, optional) — RTL
  component test: empty state when nothing selected; typing the name calls `updateNodeData`; config
  edit persists. jsdom-safe (no canvas drag).
- **`src/features/pipeline-canvas/nodes/PipelineNode.tsx`** (edit) — add `config?` to
  `PipelineNodeData`.
- **`src/app/page.tsx`** (edit) — layout becomes a flex row: `PipelineCanvas` (`flex-1`) + `aside`
  (`w-80 border-l`, e.g.) hosting `NodeInspector`.
- **`src/lib/graphStore.ts`** (edit, light — owned by DRUFF-1) — export `selectSelectedNode` if
  selectors live with the store. If DRUFF-1 isn't merged yet, coordinate; DRUFF-3 depends on it.
- Reuse existing shadcn primitives: `components/ui/{input,label,button,separator}.tsx` (all present).
  No new dependency.

### Trade-offs

- **Derive selection from `node.selected` vs. a `selectedNodeId` in the store.** Chosen: derive.
  It keeps one source of truth (React Flow already owns selection and mirrors it into store nodes via
  `onNodesChange`), directly satisfying AC4, and avoids a second field that could disagree with the
  canvas. Cost: a multi-select has no single node to show — handled explicitly by the empty state.
- **Always-mounted panel that empties vs. conditionally unmounted.** Chosen: always mounted, empty
  state. Stable layout, no reflow per click; AC1 allows either.
- **Generic key/value editor vs. jumping straight to descriptor-driven forms.** Chosen: generic now.
  DRUFF-3's job is the inspector *shell* and the store-write contract; DRUFF-6 proves the descriptor
  form at the `NodeConfigEditor` seam. Building the registry here would be speculative.
- **Pure `nodeConfig.ts` vs. logic inside the component.** Chosen: extract. Duplicate/blank-key
  handling is real logic and must be unit-tested without rendering (02-engineering: no network, no
  React in unit tests).

### Test seams

- **Unit (primary, AC5):** `nodeConfig.test.ts` — `configToEntries`/`entriesToConfig` round-trip;
  blank keys dropped; duplicate keys resolved deterministically (document last-wins); row order
  stable across edits. Pure, no mocks.
- **Component (optional):** `NodeInspector.test.tsx` with a real in-memory store instance (or a
  minimal store stub exposing `nodes` + a spy `updateNodeData`): asserts empty state with no/multi
  selection, and that name/config edits call `updateNodeData` with the right patch.
- **No network:** there is no Dander API call in this ticket, so nothing to mock at the API boundary.
  Canvas drag/pointer behavior is out of scope here (that's Playwright territory per typescript.md),
  so these tests stay in jsdom.

### Flags / under-specified criteria

- **Multi-select behavior** isn't specified by the ticket. Decision: inspect only when exactly one
  node is selected; empty state otherwise. Confirm if a "first selected wins" behavior is preferred.
- **AC1 "hides or empties"** — resolved to *empties* (always-mounted aside). Flag if a collapsible/
  hidden panel is wanted instead.
- **Config value types** — generic editor edits string values only; typed fields and required-field
  validation are DRUFF-6's descriptor form, not this ticket.
- **Store action shape** (`updateNodeData` patch vs. full-data replace) depends on DRUFF-1's final
  API; the panel adapts by merging if needed. DRUFF-1 must be merged first (declared `depends_on`).

## Implementation Notes

Implemented per the Design section, on top of DRUFF-1's `useGraphStore` /
`src/lib/graph-store.ts` and DRUFF-2's `PipelineCanvas`/`NodePalette`, which had already landed
(uncommitted) in the working tree.

**Files added:**
- `src/features/pipeline-canvas/inspector/nodeConfig.ts` — pure `configToEntries` /
  `entriesToConfig` mapping. Blank (or whitespace-only) keys are dropped; duplicate keys resolve
  last-row-wins (plain-object assignment semantics); surviving keys keep first-occurrence order.
- `src/features/pipeline-canvas/inspector/nodeConfig.test.ts` — Vitest unit tests for the above
  (AC5): empty/undefined config, stringification of non-string values, round-trip, blank-key drop,
  key trimming, duplicate-key last-wins, order stability across an edit.
- `src/features/pipeline-canvas/inspector/NodeConfigEditor.tsx` — the generic key/value config
  boundary (`config` in, `onChange(config)` out). Holds one piece of local state (the row list),
  seeded from `config` on mount only, so a freshly-added blank-key row survives the keystroke that
  gives it a key (since `entriesToConfig` drops blank keys, that row can't live in `config` alone
  until it has one). Every row edit still calls `onChange` immediately — nothing is batched or
  held back from the store.
- `src/features/pipeline-canvas/inspector/NodeInspector.tsx` — the panel shell. Reads the sole
  selected node via `selectSelectedNode`, renders the empty state on `null`, otherwise a name
  `Input` bound directly to `node.data.label` and the `NodeConfigEditor` for `node.data.config`.
  No local field state — both writes go straight through `updateNodeData`. Mounts
  `NodeConfigEditor` with `key={node.id}` so switching the selected node fully remounts (and so
  resets) the editor's local row list rather than the editor needing to special-case reacting to
  an external `config` prop change while staying mounted.
- `src/features/pipeline-canvas/inspector/NodeInspector.test.tsx` — RTL component tests against
  the real `useGraphStore` singleton (seeded/reset per test): empty state with no/multi selection,
  name field bound + live-updates the store, config values shown/edited/persisted, add-field +
  type-a-key persists a new entry, remove-field clears it from `config`.

**Files edited:**
- `src/features/pipeline-canvas/nodes/PipelineNode.tsx` — added `config?: Record<string,
  unknown>` to `PipelineNodeData` (optional, so existing/seed nodes without config stay valid;
  `unknown` rather than `string` leaves room for DRUFF-6's typed descriptor config at the same
  field without a breaking change).
- `src/lib/graph-store.ts` — added the `selectSelectedNode` selector (sole selected node, or
  `null` for zero/multi-select), derived from `node.selected` rather than adding new store state,
  per the design's "one source of truth" rationale. No other store changes needed —
  `updateNodeData`'s existing shallow-merge patch semantics matched the design's assumption
  exactly.
- `src/app/page.tsx` — layout is now a flex row: the canvas wrapper (`min-w-0 flex-1`) plus
  `<NodeInspector />` as a sibling (the inspector owns its own `w-80 border-l` `<aside>` styling,
  so `page.tsx` doesn't duplicate it).
- `vitest.setup.ts` — added a global `afterEach(cleanup)` from `@testing-library/react`. This
  project's Vitest config doesn't set `test.globals: true`, so RTL's usual auto-cleanup (which
  detects ambient test-framework globals) wasn't firing; without it, `NodeInspector.test.tsx`'s
  renders accumulated across tests in the same jsdom `document` and later tests saw duplicate
  elements from earlier ones. Centralized once in the shared setup file rather than each component
  test file needing its own `afterEach(cleanup)` boilerplate — this was the one deviation from a
  file explicitly listed as "not to touch" in the design's file list, but it's infrastructure the
  design's own `NodeInspector.test.tsx` plan depends on to pass at all.

**Deviations from the design:**
- `PipelineNodeData.config` is typed `Record<string, unknown>` (as the design's data-model
  snippet specified) rather than `Record<string, string>`; the generic editor still only ever
  writes strings into it via `entriesToConfig`.
- No stable `id` field on `ConfigEntry` — rows are identified by array index only (`configToEntries`
  returns `{ key, value }[]`, in object-key order). Index is stable enough since rows are only
  appended/removed, never reordered, and using the (editable, sometimes-blank) `key` itself as an
  identity would break exactly the blank/duplicate-key cases the design flags as the interesting
  logic.
- `vitest.setup.ts` change noted above — outside the design's listed file set, but required for
  the design's own component-test plan to work under this repo's existing (non-`globals`) Vitest
  config.

**Toolchain results:** `pnpm exec eslint` — clean. `pnpm exec prettier --check` — clean for all
files touched (pre-existing `README.md` formatting warning is unrelated/untracked, not touched by
this ticket). `pnpm exec tsc --noEmit` — clean. `pnpm test` (Vitest) — 37/37 passed across 5 test
files (adds `nodeConfig.test.ts` and `NodeInspector.test.tsx` to the existing 3). No Playwright
changes — this ticket has no drag/canvas-pointer behavior in scope, per the design's test-seam
section.

## Review Log

_Append-only. PR-Review adds entries below._

### 2026-07-22 — PASS

Reviewed the inspector implementation against all six acceptance criteria, the steering files, and
the approved Design. Inspected every DRUFF-3 file and ran the toolchain locally.

**Acceptance criteria — all met:**
- **AC1 (select opens/deselect empties):** `selectSelectedNode` in `src/lib/graph-store.ts` derives
  the sole-selected node from `node.selected` (returns `null` for zero or multi-select);
  `NodeInspector` renders the empty state on `null`. Covered by the "empty state when no node
  selected", "empty state when more than one node selected", and "binds… and hides once deselected"
  tests.
- **AC2 (name edits live):** name `Input` is bound to `node.data.label` and writes
  `updateNodeData(id, { label })`; the canvas node re-renders from the same store `nodes`. Covered
  by "editing the name field updates the node's label in the store live".
- **AC3 (config region + persists):** `NodeConfigEditor` is the swappable seam; edits flow through
  `updateNodeData(id, { config })`. Covered by the shows/edit/add/remove config tests.
- **AC4 (store-driven, no drifting local state):** `NodeInspector` holds no field state.
  `NodeConfigEditor`'s one piece of local state (the row list) is justified UI mechanics — a
  blank-key row that `entriesToConfig` intentionally drops must survive keystrokes — commits to the
  store on every edit, and is reset per node via `key={node.id}`. Within this ticket the editor is
  the only writer of a node's config, so no external-writer drift is reachable; the reasoning is
  documented and sound.
- **AC5 (non-trivial mapping unit-tested):** the pure `nodeConfig.ts` (`configToEntries` /
  `entriesToConfig`) is covered by `nodeConfig.test.ts` for undefined/empty config,
  stringification, round-trip, blank-key drop, key-trim, duplicate-key last-wins, and order
  stability — plus RTL component tests for the wired behavior.
- **AC6 (no steering violations):** no hardcoded secrets (grep of the inspector dir clean; test
  fixtures use a clearly-fake `sk_test` value and no real credentials); no new `.env` keys required;
  TSDoc on the exported functions/components; strict typing, no bare `any`; unit/component split
  stays in Vitest/jsdom, with no Playwright needed for this scope.

**Security:** clean — nothing secret-shaped or sensitive in the diff, fixtures, or logs.

**Design fidelity:** matches the approved Design. The three documented deviations
(`config: Record<string, unknown>`, index-based row identity, and the `vitest.setup.ts`
`afterEach(cleanup)`) are each justified in the Implementation Notes; the setup-file change is
necessary infrastructure for the design's own component-test plan under this repo's non-`globals`
Vitest config and is centralized rather than duplicated per test file.

**Scope note:** the working tree also shows changes to `e2e/pipeline-canvas.spec.ts`,
`PipelineCanvas.tsx`, and `CLAUDE.md`; these belong to DRUFF-1/DRUFF-2 (which landed uncommitted
ahead of this ticket, per the Implementation Notes), not DRUFF-3, so DRUFF-3's "no Playwright
changes" claim holds.

**Toolchain (re-run during review):** `tsc --noEmit` clean; `eslint` on the changed files clean;
`vitest run` 37/37 passed across 5 files.

No blocking issues. Status → `done`.
