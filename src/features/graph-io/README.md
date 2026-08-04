# `graph-io`

Local save/load and the canvas ⇄ source view toggle (DRUFF-5) — the "Graph source view" module
described in `steering/00-project-overview.md`. This feature adds **no new graph semantics**; it is
glue between the canvas store (`src/lib/graph-store.ts`, DRUFF-1), the pure pipeline-graph model and
converters (`src/lib/pipeline-graph/`, DRUFF-4), and four browser affordances:

- **localStorage persistence** — `useGraphPersistence` hydrates the store from the last-saved
  snapshot on mount, then debounced-autosaves on every store change, via
  `src/lib/persistence/graph-persistence.ts`. The default/offline path.
- **File export/import** — `GraphToolbar`'s Export/Import controls, via
  `src/lib/graph-io/graph-file.ts`.
- **Dander graph bridge** — `GraphToolbar`'s "Open from Dander"/"Save to Dander" controls talk to
  Dander's local `dander graph serve` bridge (`GET`/`PUT /v1/graph`, ETag/If-Match optimistic
  concurrency) via `src/lib/persistence/dander-graph-client.ts`. Explicit open/save (not autosave)
  — "Save to Dander" is disabled until a successful "Open from Dander" supplies the revision the
  bridge's conflict check requires. See `steering/00-project-overview.md`'s "Contract with Dander".
- **Canvas ⇄ source toggle** — `GraphEditor` owns `viewMode` and renders either `PipelineCanvas` or
  the read-only `SourceView`.

## Files

- `GraphEditor.tsx` — container: owns `viewMode`, mounts persistence, renders the toolbar above the
  active view.
- `GraphToolbar.tsx` — export (YAML/JSON), import (validates + fail-loud toast on malformed input),
  clear-saved, Dander open/save, and the canvas/source toggle.
- `SourceView.tsx` — read-only Monaco view of the live canvas encoded as YAML/JSON.
- `useGraphPersistence.ts` — hydrate-on-mount + debounced-autosave hook (localStorage only).

## Single serialization path

Every conversion between the canvas and text goes through DRUFF-4's converters:
`canvasToGraph → encodeGraph` for anything going out (autosave, file export, `SourceView`), and
`decodeGraph → graphToCanvas` for anything coming in (localStorage hydration, file import). There is
exactly one encoder and one validating decoder in the app — nothing here reimplements either.

## What's out of scope here

- `SourceView` is **read-only** — editing YAML/JSON back into the canvas is a future ticket.
- The Dander graph bridge is a separate async client (`dander-graph-client.ts`), not a second
  `GraphPersistence` implementation — that interface is synchronous/autosave-shaped and doesn't fit
  the bridge's explicit-open/save, revision-conflict contract. See `steering/00-project-overview.md`
  Decision Log, 2026-08-03.
- Druff's schema mirror of Dander's `PipelineGraph` (`src/lib/pipeline-graph/schema.ts`) has known,
  not-yet-closed drift against Dander's current model (`Node.trigger`/`.cursor`,
  `TransformationKind.custom_code`, `WriteMode.replace`) — a graph using those will open here with
  those fields silently dropped (trigger/cursor) or, for a `custom_code` transformation, fail to
  parse entirely. See "Contract with Dander" in `steering/00-project-overview.md`.
