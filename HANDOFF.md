# Morning Handoff

## Finished

- Added one-way import of version-1 `dander.yaml` into an editable Druff canvas draft.
- Projected every hosted pipeline as schedule → source → model nodes with deterministic rows.
- Preserved imported graph names and unsupported current Dander writer settings across edits.
- Labeled source/export/UI clearly as local drafts with no deployment or manifest write-back.
- Loaded the real four-pipeline Dander manifest and verified a local Greenhouse edit survived reload.

## Try It

```bash
cd "/Users/harrison/Documents/Make This Work/druff"
pnpm dev
```

Open <http://localhost:3000>, choose **Import graph or dander.yaml**, and select
`/Users/harrison/Documents/dander/dander.yaml`.

## Checks

- `pnpm format:check` — passed.
- `pnpm test` — 45 files, 537 tests passed.
- `pnpm typecheck` and `pnpm lint` — passed with no warnings.
- `pnpm test:e2e` — 6 Chromium tests passed.
- `pnpm build` — production build passed.

## Decisions

- Keep Druff separate from Dander; use a one-way manifest projection rather than changing runtime code.
- Treat Druff YAML/JSON exports as non-deployable drafts until a shared execution contract exists.
- Fail loudly or preserve data whenever Druff does not understand a current Dander field.

## Remaining

- Josh should review the projection and decide whether Druff should eventually write manifests or use a Dander service/API.
- Fork/push this Druff branch only after explicit approval; nothing has been published.

## Review First

- `src/lib/dander-project/manifest-preview.ts`
- `src/lib/graph-io/graph-file.ts`
- `src/features/pipeline-canvas/inspector/categories/writer/writerConfig.ts`
