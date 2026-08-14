# Morning Handoff

## Finished

- Added authenticated hosted project/graph list, create, open, conditional save, and confirmed delete.
- Preserved dirty/conflict/reload behavior, detached drafts, and local import/export.
- Kept opaque ETags separate from canonical-content SHA and normalized all DTOs through generated
  RC19 validators.
- Retained create/delete idempotency keys across ambiguous retries and synthetic service restarts.
- Kept legacy localhost operations completely unavailable in hosted mode.

## Try It

Run `pnpm test:e2e` for a fresh static export and browser acceptance. Loopback behavior remains
available with `pnpm dev`; hosted mode requires Dander's generated `/bootstrap.json` descriptor.

## Checks

- Contract drift, ESLint, strict TypeScript, Prettier, and static production build passed.
- Full Vitest passed 63 files and 643 tests.
- All 11 Playwright journeys passed, including hosted conflict/retry/restart acceptance.

## Decisions

- Reuse one persistence controller; the hosted client adds collection operations without a second store.
- Retain mutation keys only for ambiguous retries; classify conflicts by operation and error code.
- Complete verified callbacks in place so generic static navigation cannot discard memory-only auth.

## Remaining

- Merge the independently reviewed focused PR and verify exact-main CI.
- Continue DRUFF-27 through DRUFF-29 in roadmap order.

## Review First

- `src/lib/persistence/graph-persistence.ts`
- `src/features/graph-io/useGraphPersistence.ts`
- `e2e/hosted-graph-management.spec.ts`
