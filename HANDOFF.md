# Morning Handoff

## Finished

- Replaced UI localStorage autosave with explicit Open/Save through `GraphPersistence`.
- Made Druff's PipelineGraph schema match Dander's current graph contract and preserve fields it does not edit.
- Preserved graph/node triggers, cursors, tests, nested config, writer settings, and visual metadata across canvas edits.
- Text-only inspectors now preserve opaque nested config/metadata instead of coercing it to strings.
- Added revision conflicts so a stale browser cannot overwrite a newer file.

## Try It

```bash
cd /Users/harrison/Documents/dander
uv run dander graph serve --file path/to/pipeline.yaml

cd "/Users/harrison/Documents/Make This Work/druff"
pnpm dev
```

Open <http://localhost:3000>, choose **Open from Dander**, edit, and choose
**Save to Dander**. Local graph/manifest imports remain detached drafts.

## Checks

- `pnpm format:check` — passed.
- `pnpm test` — 47 files, 549 tests passed.
- `pnpm typecheck` and `pnpm lint` — passed with no warnings.
- `pnpm test:e2e` — 6 Chromium tests passed.
- `pnpm build` — production build passed.

## Decisions

- Keep `PipelineGraph` canonical and use `GraphPersistence` only as an interchangeable transport seam.
- Require explicit Open/Save and exact revision matching; do not autosave server files.
- Stop this slice at graph write-back; Druff still does not execute, deploy, or rewrite `dander.yaml`.

## Remaining

- Merge the companion Dander graph-service change before treating Open/Save as generally available.
- Decide separately whether a future authenticated Dander API should support remote editors.

## Review First

- `src/lib/pipeline-graph/schema.ts`
- `src/lib/pipeline-graph/canvas-convert.ts`
- `src/features/graph-io/useGraphPersistence.ts`
