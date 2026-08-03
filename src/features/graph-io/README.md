# `graph-io`

Local save/load and the canvas ⇄ source view toggle (DRUFF-5) — the "Graph source view" module
described in `steering/00-project-overview.md`. This feature adds **no new graph semantics**; it is
glue between the canvas store (`src/lib/graph-store.ts`, DRUFF-1), the pure pipeline-graph model and
converters (`src/lib/pipeline-graph/`, DRUFF-4), and three browser affordances:

- **localStorage persistence** — `useGraphPersistence` hydrates the store from the last-saved
  snapshot on mount, then debounced-autosaves on every store change, via
  `src/lib/persistence/graph-persistence.ts`.
- **File export/import** — `GraphToolbar` exports explicitly named Druff graph drafts and imports
  either those drafts or a version-1 `dander.yaml`, via `src/lib/graph-io/graph-file.ts`.
- **Canvas ⇄ source toggle** — `GraphEditor` owns `viewMode` and renders either `PipelineCanvas` or
  the read-only `SourceView`.

## Files

- `GraphEditor.tsx` — container: owns `viewMode`, mounts persistence, renders the toolbar above the
  active view.
- `GraphToolbar.tsx` — draft export (YAML/JSON), graph/manifest import (validates + fail-loud toast
  on malformed input), clear-saved, and the canvas/source toggle.
- `SourceView.tsx` — read-only Monaco view of the live canvas encoded as YAML/JSON.
- `useGraphPersistence.ts` — hydrate-on-mount + debounced-autosave hook.

## Single serialization path

Every conversion from the canvas to text goes through DRUFF-4's
`canvasToGraph → encodeGraph` path (autosave, draft export, `SourceView`). Graph drafts come back
through `decodeGraph → graphToCanvas`. A Dander manifest takes the separate, one-way
`projectDanderManifest → graphToCanvas` path because it is a different product contract; it is
never re-encoded as or written back to `dander.yaml`.

## What's out of scope here

- `SourceView` is **read-only** — editing YAML/JSON back into the canvas is a future ticket.
- The Dander manifest projection does not read connector/model file contents and cannot write back
  or deploy changes.
- Only localStorage is implemented; `GraphPersistence` (`src/lib/persistence/graph-persistence.ts`)
  is the seam a future Dander-backed store would implement instead.
