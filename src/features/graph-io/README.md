# `graph-io`

Local save/load and the canvas ⇄ source view toggle (DRUFF-5) — the "Graph source view" module
described in `steering/00-project-overview.md`. This feature adds **no new graph semantics**; it is
glue between the canvas store (`src/lib/graph-store.ts`, DRUFF-1), the pure pipeline-graph model and
converters (`src/lib/pipeline-graph/`, DRUFF-4), and three browser affordances:

- **localStorage persistence** — `useGraphPersistence` hydrates the store from the last-saved
  snapshot on mount, then debounced-autosaves on every store change, via
  `src/lib/persistence/graph-persistence.ts`.
- **File export/import** — `GraphToolbar`'s Export/Import controls, via
  `src/lib/graph-io/graph-file.ts`.
- **Canvas ⇄ source toggle** — `GraphEditor` owns `viewMode` and renders either `PipelineCanvas` or
  the read-only `SourceView`.

## Files

- `GraphEditor.tsx` — container: owns `viewMode`, mounts persistence, renders the toolbar above the
  active view.
- `GraphToolbar.tsx` — export (YAML/JSON), import (validates + fail-loud toast on malformed input),
  clear-saved, and the canvas/source toggle.
- `SourceView.tsx` — read-only Monaco view of the live canvas encoded as YAML/JSON.
- `useGraphPersistence.ts` — hydrate-on-mount + debounced-autosave hook.

## Single serialization path

Every conversion between the canvas and text goes through DRUFF-4's converters:
`canvasToGraph → encodeGraph` for anything going out (autosave, file export, `SourceView`), and
`decodeGraph → graphToCanvas` for anything coming in (localStorage hydration, file import). There is
exactly one encoder and one validating decoder in the app — nothing here reimplements either.

## What's out of scope here

- `SourceView` is **read-only** — editing YAML/JSON back into the canvas is a future ticket.
- Only localStorage is implemented; `GraphPersistence` (`src/lib/persistence/graph-persistence.ts`)
  is the seam a future Dander-backed store would implement instead.
