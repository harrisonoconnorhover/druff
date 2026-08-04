# Morning Handoff

## Finished

- Bound Greenhouse source nodes to Dander's real `greenhouse_job_board` connector and `jobs` endpoint.
- Resolve connector-backed source nodes by both graph node type and `config.connector`.
- Seed only non-secret descriptor defaults so new connector nodes are immediately executable without storing credentials.
- Added Dander's `replace` write mode to graph validation and writer controls.
- Preserved PipelineGraph as the canonical format and the existing explicit Open/Save workflow.

## Try It

```bash
pnpm dev
```

Add Greenhouse and target nodes, select **Replace**, connect the fields, then save the
graph through the local Dander graph service. Reference that file from a Dander pipeline.

## Checks

- `pnpm test` — 47 files and 550 tests passed.
- `pnpm test:e2e` — 6 Chromium tests passed.
- `pnpm lint`, `pnpm typecheck`, and `pnpm format:check` — passed.
- `pnpm build` — production build passed.

## Decisions

- Druff authors connector/endpoint identity; Dander connector YAML owns operational details and secrets.
- Generic source nodes are not inferred to be Greenhouse without the matching connector binding.
- `replace` is the only graph target mode the first Dander runtime bridge executes.

## Remaining

- Merge the companion Dander runtime bridge before presenting Execute/Deploy as available.
- Add execution status UI only after the runtime contract is merged and stable.
- Require separate approval for any hosted image push or GCP deployment.

## Review First

- `src/features/connector-library/descriptors/greenhouse.ts`
- `src/features/connector-library/registry.ts`
- `src/lib/pipeline-graph/canvas-convert.ts`
