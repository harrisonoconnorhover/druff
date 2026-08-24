# Morning Handoff

## Finished

- Added one opt-in acceptance journey using Druff's production clients against current protected Dander RC32.
- Confirmed RC32 retains Druff's exact published Control contract bundle bytes.
- Kept ordinary unit tests network-free and isolated the cross-repository journey in its own configuration.
- Made browser acceptance use an explicit safe local port when another workspace occupies port 3000.

## Try It

Start current Dander with `uv run dander control serve --ephemeral --project demo-project --port 8770`, then run `DANDER_CONTROL_URL=http://127.0.0.1:8770 DANDER_EXPECTED_VERSION=0.9.0rc32 pnpm test:current-dander`.

## Checks

- Current-Dander acceptance passed against protected Dander commit `33801213ee8c1bab78b8847a4b86bd9b4b8d1c63`.
- Contract drift, artifact tests, ESLint, TypeScript, Prettier, and all 669 unit tests passed.
- Production build and all 11 Playwright journeys passed on isolated port 3100.

## Decisions

- Retain the public RC19 contract artifact pin because RC32's bundle is byte-identical.
- Verify service compatibility through a real local HTTP application without adding a runtime adapter.

## Remaining

- Merge the focused protected PR after all three required jobs pass.
- Build, inspect, scan, and retain exact active and rollback OCI artifacts from protected commits.
- Record their immutable identities and terminal release disposition.

## Review First

- `integration/current-dander-control.test.ts`
- `playwright.config.ts`
- `tickets/DRUFF-31-current-dander-release-acceptance.md`
