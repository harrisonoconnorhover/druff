# Morning Handoff

## Finished

- Added strict dynamic connector discovery from Dander's `GET /v1/connectors` endpoint.
- Added Salesforce to the palette without hardcoding Salesforce runtime behavior in Druff.
- Seeded canonical connector/endpoint bindings and declared output fields on dropped plugin nodes.
- Preserved static Greenhouse for offline use and lossless generic-node behavior when discovery fails.
- Proved dynamic Salesforce drag, inspect, and conditional save through Playwright.

## Try It

```bash
dander graph serve --file /path/to/graph.yaml --config /path/to/dander.yaml
pnpm dev
```

Choose **Open from Dander**; installed plugin connectors appear in the palette.

## Checks

- ESLint, TypeScript, and Prettier checks passed.
- Full Vitest suite passed with two workers: 50 files and 563 tests.
- All 8 Playwright workflows passed in Chromium, including dynamic Salesforce.
- The production Next.js build passed.

## Decisions

- Dander remains authoritative for installed plugins, graph validation, authentication, and runtime.
- Druff consumes only presentation-safe descriptors and keeps one canonical PipelineGraph schema.
- Discovery failures degrade to generic lossless source nodes instead of blocking graph access.

## Remaining

- Complete local validation and open focused Dander, plugin, and Druff PRs.
- Publish Dander `0.4.0rc2` and the plugin candidate only after explicit approval.
- Run isolated GCP acceptance only after the separate reviewed-apply approval.

## Review First

- `src/features/connector-library/discovery.ts`
- `src/features/connector-library/registry.ts`
- `e2e/dynamic-salesforce-connector.spec.ts`
