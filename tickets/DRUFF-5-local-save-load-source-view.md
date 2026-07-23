---
id: DRUFF-5
title: Local save/load and source-view toggle
status: done
component: frontend
epic: graph-io
depends_on: [DRUFF-1, DRUFF-4]
created: 2026-07-22
---

## Context

To have something real to show without a live Dander backend, a graph should persist locally and
round-trip through Dander's pipeline-graph format. Per the "Graph source view" module in
`steering/00-project-overview.md`, the editor also needs a toggle between the visual canvas and the
underlying YAML/JSON. This ticket builds the UI on top of the converters from DRUFF-4 and the store
from DRUFF-1: save/load to localStorage plus file export/import, and a canvas ⇄ source view toggle.

## Acceptance Criteria

- [ ] The current graph can be saved to localStorage and reloaded on next visit, restoring nodes,
      edges, and their config.
- [ ] The graph can be exported to a YAML or JSON file and imported back, reproducing the same
      canvas (round-trip via DRUFF-4's converters).
- [ ] A toggle switches between the visual canvas and a read view of the underlying YAML/JSON for
      the current graph; the source view reflects the current canvas state.
- [ ] Import validates that the file is a well-formed graph and fails loud with an actionable
      message on malformed input, without crashing the editor (see `steering/02-engineering.md`).
- [ ] No secret, credential, or sensitive data is written to localStorage, logs, or committed
      fixtures (see `steering/01-security.md`).
- [ ] Persistence/serialization glue logic is unit-tested with non-sensitive fixtures.
- [ ] No steering violations (secrets, style, docs).

## Design

### Approach

DRUFF-5 is pure **glue + UI** on top of two seams that land first: the Zustand canvas store
(DRUFF-1) and the pure pipeline-graph model/converters (DRUFF-4). This ticket adds no new graph
semantics — it wires those seams to three browser affordances: localStorage persistence, file
export/import, and a canvas ⇄ source read toggle. Everything that touches the browser (localStorage,
`Blob`/anchor download, `<input type=file>`, Monaco) is kept in thin, dependency-injectable modules
so the serialization glue — the part with actual logic and the part AC6 requires tested — is pure
and unit-testable with no DOM and no network.

The **single serialization path is DRUFF-4's converters**. Both persistence and file export encode
through the same `canvasToGraph` → `encodeGraph` pipeline, and both import/hydrate run
`decodeGraph` → `graphToCanvas`, so there is exactly one place a graph is turned into text and one
place text is validated back into a graph. `decodeGraph` is expected to validate with DRUFF-4's Zod
schema (`steering/languages/typescript.md`: parse, don't cast) — that same guard protects **both**
imported files and anything read back out of localStorage (which can be stale, hand-edited, or
corrupt). Nothing is ever `cast` from an external boundary.

**Layout (node positions) is app-only presentation, not part of Dander's graph** (DRUFF-4 documents
positions as app-only). To restore the exact canvas on next visit, localStorage stores a small
**session envelope** — `{ version, graph, positions }` — where `graph` is the pure Dander
`PipelineGraph` and `positions` is a `nodeId → {x,y}` sidecar. **File export writes only the pure
`PipelineGraph`** (that is the artifact Dander consumes); on import the canvas is rebuilt via
`graphToCanvas` and laid out by whatever position convention DRUFF-4 defines (auto/`fitView` if the
file carries none). This keeps the shared-with-Dander contract clean while still giving a lossless
local round-trip.

**Persistence is interface-first** (`02-engineering.md`): a `GraphPersistence` contract with a
`localStorage` implementation today, so a future Dander-backed or filesystem store plugs into the
same seam without touching callers. **View-mode** (`canvas | source`) is ephemeral UI state and
lives as local `useState` in the editor container — it does not belong in the graph store.

**Security** (`01-security.md`, AC5): the persisted envelope contains only the same graph the user
authored plus positions — no new fields, no credentials. Per the project non-goals and DRUFF-6,
connector secrets never live in graph `config` (they are backend-resolved key references), so
nothing sensitive reaches localStorage. Error paths log the **failure reason and shape** (parse
message, key, node/edge counts) — never stored `config` values — so a corrupt blob can't leak
record data into the console.

### Components / modules & data flow

- **`GraphPersistence` (interface) + `localStorageGraphPersistence` (impl)** — the persistence seam.
  Methods: `save(snapshot: GraphSnapshot): void`, `load(): GraphSnapshot | null`, `clear(): void`.
  The impl takes a `Storage` in its constructor (defaulting to `window.localStorage`) so tests
  inject a Map-backed fake. Key is versioned (`druff.graph.v1`); a missing key, unparseable JSON,
  version mismatch, or schema-invalid `graph` all resolve to `null` (log reason, don't throw) so a
  bad blob degrades to the seed graph instead of crashing. Genuine environment failures (quota,
  `localStorage` disabled/private mode) on `save` surface loudly rather than silently.
- **`graph-file` (browser I/O glue)** — `exportGraphToFile(graph, format)` encodes via DRUFF-4 and
  triggers a `Blob` + object-URL anchor download (`pipeline.yaml` / `pipeline.json`).
  `parseImportedFile(text, filename)` is **pure**: infers format from extension, runs DRUFF-4
  `decodeGraph`, and returns a discriminated result `{ ok: true; graph } | { ok: false; error }`
  with an actionable message on malformed input (AC4). The DOM/download side effect is a thin
  wrapper around the pure parse.
- **`useGraphPersistence` (hook)** — connects store ↔ persistence. On mount, hydrates the store from
  `persistence.load()` (falling back to the seed graph if `null`); subscribes to store changes and
  **debounced-autosaves** the current `{graph, positions}` envelope. Dependencies (persistence
  impl, converters) are injectable for testing; contains no JSX.
- **`GraphToolbar` (UI)** — shadcn `Button`s for Export (YAML/JSON menu), Import (hidden file
  `<input>`), Clear/reset local storage, and the **Canvas ⇄ Source** toggle. On import failure it
  raises a `sonner` error toast (fail loud, actionable) and leaves canvas state untouched — no
  partial load, so the editor can't be left half-broken.
- **`SourceView` (UI)** — read-only Monaco (`@monaco-editor/react`, `readOnly`) rendering
  `encodeGraph(canvasToGraph(store), format)` for the current store state, with a YAML/JSON format
  switch. It re-derives from the store on every render so it always reflects the live canvas (AC3).
  Read-only by design: AC3 asks for a *read* view; source→canvas editing is deferred (the
  `decodeGraph` seam is already there for a future editable version).
- **`GraphEditor` (container)** — owns `viewMode` (`useState`), mounts `useGraphPersistence`, renders
  `GraphToolbar` above either `<PipelineCanvas/>` or `<SourceView/>`.

Data flow: store (DRUFF-1) is the single source of truth → `GraphEditor` reads it → `SourceView`
and autosave both derive text from it via DRUFF-4 converters → import/hydrate write back into the
store via `graphToCanvas` + store actions.

### Files

**Create**
- `src/lib/persistence/graph-persistence.ts` — `GraphPersistence` interface, `GraphSnapshot` type,
  `localStorageGraphPersistence` impl (versioned key, injectable `Storage`).
- `src/lib/persistence/graph-persistence.test.ts` — save→load round-trip, corrupt/versioned/invalid
  blob → `null`, save-throws surfaced. Map-backed fake `Storage`, no DOM.
- `src/lib/graph-io/graph-file.ts` — `exportGraphToFile`, pure `parseImportedFile` (+ format-from-
  extension helper).
- `src/lib/graph-io/graph-file.test.ts` — `parseImportedFile`: valid YAML, valid JSON, malformed
  YAML, schema-invalid graph, unknown extension. Non-sensitive fixtures only.
- `src/features/graph-io/useGraphPersistence.ts` — hydrate-on-mount + debounced autosave hook.
- `src/features/graph-io/GraphToolbar.tsx` — export/import/clear/toggle controls.
- `src/features/graph-io/SourceView.tsx` — read-only Monaco source view with YAML/JSON switch.
- `src/features/graph-io/GraphEditor.tsx` — container owning `viewMode`, wiring the above.
- `src/features/graph-io/README.md` — feature role per `typescript.md` doc rule.

**Modify**
- `src/app/page.tsx` — render `<GraphEditor/>` instead of bare `<PipelineCanvas/>`.
- `src/app/layout.tsx` — mount `sonner` `<Toaster/>` (component exists at `components/ui/sonner.tsx`
  but is not yet mounted) so import errors have somewhere to surface.

**Depends on (do not redefine — import from DRUFF-4/DRUFF-1)**
- DRUFF-4: `PipelineGraph` type, `canvasToGraph`, `graphToCanvas`, `encodeGraph`, `decodeGraph`,
  the Zod graph schema.
- DRUFF-1: the canvas store hook + actions (nodes/edges + set/replace-graph action for hydration).

### Test seams

- **Persistence** — inject a Map-backed `Storage`; assert round-trip, and that corrupt/mismatched/
  invalid data yields `null` (never throws), while a throwing `setItem` (quota) propagates.
- **File parse** — `parseImportedFile` is pure: fixtures for each valid/invalid case assert the
  discriminated result and message. No `Blob`/anchor in unit tests (that side effect is thin).
- **No mocking of DRUFF-4 converters** — they are pure; call them directly with fixtures.
- **No network anywhere.** Canvas drag/connect stays a Playwright concern (`typescript.md`); the
  unit-tested core here is the serialization/persistence glue (AC6).

### Flags / coordination points (verify against concurrently-designed tickets)

1. **Exact export names** for DRUFF-4 (`canvasToGraph`/`graphToCanvas`/`encodeGraph`/`decodeGraph`,
   schema) and DRUFF-1 (store hook + a replace-whole-graph action for hydration) are assumed here
   and must match those tickets' final designs.
2. **File-import layout**: since positions are app-only, a graph imported from a *file* (no
   positions) will be auto-laid-out, not pixel-restored — only the localStorage envelope restores
   exact positions. Confirm this satisfies AC2's "reproducing the same canvas" (structural
   round-trip yes; pixel layout only for local reload). Alternative: have DRUFF-4 stash positions
   under an app-namespaced key in the file — a DRUFF-4 decision, flagged there.
3. **Autosave vs explicit Save**: AC1 ("reloaded on next visit") is met by debounced autosave +
   hydrate-on-mount; no explicit Save button is required. A `Clear` control is provided. Confirm
   autosave is the desired behavior.
4. **Source view is read-only** (AC3 says "read view"); editing source back into the canvas is
   out of scope for this ticket.

## Implementation Notes

Built per the Design almost exactly as specified, with one addition and one implementation
deviation, both noted below.

**Files created** (all as designed):
- `src/lib/persistence/graph-persistence.ts` — `GraphPersistence` interface, `GraphSnapshot` type,
  `LocalStorageGraphPersistence` impl.
- `src/lib/persistence/graph-persistence.test.ts` — 9 tests: round-trip, missing/corrupt-JSON/
  version-mismatch/schema-invalid blob → `null`, malformed-positions fallback to `{}`, save-quota-
  throw propagates, `clear()`, and a test asserting a corrupt blob's values never reach
  `console.warn` (AC5).
- `src/lib/graph-io/graph-file.ts` — `formatFromFilename`, pure `parseImportedFile`,
  `exportGraphToFile`.
- `src/lib/graph-io/graph-file.test.ts` — 11 tests covering `formatFromFilename` (yaml/yml/json,
  case-insensitivity, unknown/missing extension) and `parseImportedFile` (valid YAML, valid JSON
  round-tripped via `encodeGraph`, malformed YAML/JSON syntax, schema-invalid graph, unrecognized
  extension).
- `src/features/graph-io/useGraphPersistence.ts`, `GraphToolbar.tsx`, `SourceView.tsx`,
  `GraphEditor.tsx`, `README.md`.

**Files modified:**
- `src/app/page.tsx` — renders `<GraphEditor/>` in place of the bare `<PipelineCanvas/>`;
  `NodeInspector` stays a sibling aside, unchanged.
- `src/app/layout.tsx` — mounts `<Toaster/>` (from `components/ui/sonner.tsx`) so import-failure
  toasts have somewhere to render.
- `src/lib/graph-store.ts` / `.test.ts` — see "Addition" below.

**Addition beyond the Design's file list:** DRUFF-1's store had no wholesale "replace graph"
action, which the Design flagged (Flags #1) as an assumption to verify. It wasn't present, so this
ticket adds `setGraph(nodes, edges)` to `GraphState` (bypasses `applyNodeChanges`/
`applyEdgeChanges` — hydration/import is a wholesale replacement, not an incremental edit) plus a
unit test for it in `graph-store.test.ts`. This is the only change to a DRUFF-1 file.

**Deviation from the Design's exact wording — no eager `localStorageGraphPersistence` singleton:**
The Design's Files section names the impl `localStorageGraphPersistence` and describes a
`Storage`-injecting constructor, which reads as "export a ready-made default instance." Doing that
literally (`export const localStorageGraphPersistence = new LocalStorageGraphPersistence()` at
module scope) turned out to be a real bug, caught by running the Playwright e2e suite: Next.js
evaluates a `'use client'` module's top level during SSR too, and the constructor's default
parameter (`window.localStorage`) threw `ReferenceError: window is not defined` server-side,
breaking every page load. Fixed by keeping only the exported class, `LocalStorageGraphPersistence`,
and having every call site (`useGraphPersistence`'s effect, `GraphToolbar`'s clear handler)
construct `new LocalStorageGraphPersistence()` inline, inside a `useEffect`/click handler — i.e.
only where it is guaranteed to run client-side. This is also a closer fit for
`steering/languages/typescript.md`'s "no side effects at module scope" rule than the literal
reading was. Tests construct `LocalStorageGraphPersistence` directly either way, so this didn't
change the test files.

**`useGraphPersistence` sequencing:** implemented as a single effect that (1) loads + hydrates via
`useGraphStore.getState().setGraph(...)` if a snapshot exists, then (2) subscribes to the store
imperatively (`useGraphStore.subscribe`) for the ongoing debounced autosave — rather than two
effects gated by a `nodes`/`edges`-dependent `useState` flag. The two-effect version hit
`eslint-plugin-react-hooks`'s `set-state-in-effect` rule (calling a state setter synchronously in
an effect body) and also had to work around a hydrate-vs-first-autosave race; the single
imperative-subscribe effect avoids both and matches the Design's own wording ("subscribes to store
changes and debounced-autosaves") more directly.

**Verified against acceptance criteria:**
- AC1 — hydrate-on-mount + 500ms-debounced autosave via `useGraphStore.subscribe`, confirmed with
  Playwright (fresh load still renders the seed graph when nothing is saved yet).
- AC2 — export/import both go through DRUFF-4's `canvasToGraph`/`graphToCanvas` +
  `encodeGraph`/`decodeGraph`. As the Design's Flags #2 anticipated, a *file* import gets
  DRUFF-4's deterministic fallback layout (positions aren't part of the on-disk graph); only the
  localStorage envelope restores exact pixel positions.
- AC3 — `SourceView` re-derives `encodeGraph(canvasToGraph(nodes, edges), format)` from the live
  store on every render (no cached/stale copy); YAML/JSON switch via two small toggle buttons.
- AC4 — `parseImportedFile` returns `{ ok: false; error }` with `GraphDecodeError`'s actionable
  message on malformed syntax or a schema-invalid graph; `GraphToolbar` raises a `sonner`
  `toast.error` and never calls `setGraph` on failure, so the canvas is left untouched.
- AC5 — the persisted envelope is `{ version, graph, positions }` only; no new fields. `load()`'s
  failure logs (`console.warn`) never include the corrupt/parsed `graph`/`positions` values
  themselves, only the failure reason/shape (message, version number, node count when available) —
  covered by a dedicated test.
- AC6 — `graph-persistence.test.ts` and `graph-file.test.ts` unit-test the persistence/
  serialization glue with the existing non-sensitive `EXAMPLE_GRAPH` fixture (DRUFF-4) and inline
  fixtures; a Map-backed fake `Storage`, no DOM, no network.
- AC7 — see Tooling results below.

**Tooling run (all passing):**
- `pnpm exec eslint .` — clean.
- `pnpm exec prettier --check .` — clean (one pre-existing, unrelated warning on the repo-root
  `README.md`, not touched by this ticket).
- `pnpm exec tsc --noEmit` — clean.
- `pnpm exec vitest run` — 96/96 tests passing across 11 files (12 new: the `setGraph` addition
  plus the two new persistence/graph-io test files).
- `pnpm exec playwright test` — 3/3 e2e tests passing (this is what caught the SSR singleton bug
  above; re-ran green after the fix).

No secrets/keys introduced; `.env.example` unchanged.

## Review Log

_Append-only. PR-Review adds entries below._

### 2026-07-22 — PASS

Reviewed the implementation against all seven acceptance criteria, the steering files
(`01-security.md`, `02-engineering.md`, `languages/typescript.md`), and the approved Design.
Inspected every created/modified file and re-ran the full tooling suite.

**Acceptance criteria — all met:**
- AC1 (localStorage save + reload restoring nodes/edges/config): `useGraphPersistence` hydrates on
  mount via `persistence.load()` → `graphToCanvas(graph, positions)` and debounced-autosaves
  (`{graph, positions}` envelope) on every store change through the imperative
  `useGraphStore.subscribe`. `config`/`fields` round-trip through `canvasToGraph`/`graphToCanvas`;
  exact pixel positions are restored from the `positions` sidecar. Verified.
- AC2 (file export/import round-trip via DRUFF-4 converters): export goes `canvasToGraph → encodeGraph`,
  import `parseImportedFile → decodeGraph → graphToCanvas`. Structural round-trip (name, nodes, edges,
  types, config) is exact; a file carries no positions by design, so layout falls back to DRUFF-4's
  deterministic left-to-right placement. This is the pixel-vs-structure interpretation the Design
  explicitly flagged (Flags #2) and accepted to keep the Dander contract layout-free — met as scoped.
- AC3 (canvas ⇄ source read toggle reflecting live state): `GraphEditor` owns `viewMode` (`useState`);
  `SourceView` re-derives `encodeGraph(canvasToGraph(nodes, edges), format)` from store selectors on
  every render (no cached copy), read-only Monaco (`readOnly` + `domReadOnly`). Verified.
- AC4 (import validates, fails loud without crashing): `parseImportedFile` returns a discriminated
  `{ok:false, error}` with `GraphDecodeError`'s actionable message on bad extension / malformed
  syntax / schema-invalid graph; `GraphToolbar` raises a `sonner` error toast and never calls
  `setGraph` on failure, so the canvas is left untouched. `<Toaster/>` is mounted in `layout.tsx`.
- AC5 (no secrets/sensitive data persisted or logged): envelope is `{version, graph, positions}`
  only; `load()` failure logs include only reason/shape (parse message, version, node count) — never
  the stored `graph`/`positions` values — with a dedicated test asserting a secret-looking value
  never reaches `console.warn`. No `.env.example` change needed.
- AC6 (glue unit-tested, non-sensitive fixtures): `graph-persistence.test.ts` (9 tests: round-trip,
  missing/corrupt-JSON/version-mismatch/schema-invalid → null, malformed-positions fallback, quota
  throw propagates, `clear()`, no-leak) and `graph-file.test.ts` (11 tests). Map-backed fake
  `Storage`, no DOM, no network; uses DRUFF-4's `EXAMPLE_GRAPH` fixture. Verified.
- AC7 (no steering violations): confirmed below.

**Security:** grep of the DRUFF-5 diff for credential-shaped literals returns only the negative-
assertion security test (asserting a fake `sk-`-prefixed value does NOT leak to logs). No hardcoded
secrets, nothing sensitive in the client bundle, fixtures, or logs.

**Design fidelity & conventions:** single serialization path through DRUFF-4 honored; persistence is
interface-first (`GraphPersistence` seam with injectable `Storage`); view-mode kept as ephemeral
`useState`, not in the graph store. The two documented deviations (no eager module-scope singleton to
avoid the SSR `window` `ReferenceError`; single imperative-subscribe effect to satisfy
`react-hooks` rules) are sound and better fit `typescript.md`'s "no side effects at module scope".
The `setGraph` addition to DRUFF-1's store is justified (wholesale hydration/import) and tested.
TSDoc present on exports; feature README present.

**Tooling re-run (independently verified, not just trusted):** `tsc --noEmit` clean; `eslint .`
clean; `prettier --check` on DRUFF-5 files clean; `vitest run` 96/96 across 11 files.

No blocking issues. Status → `done`.
