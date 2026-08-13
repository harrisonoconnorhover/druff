# Morning Handoff

## Finished

- Recorded exact Dander/Druff commits, green CI, Phase 7 cleanup, and current main protection state.
- Protected Druff `main` with PR, required-CI, force-push, and deletion ruleset `20801422`.
- Confirmed Druff can remain a static export for the complete bounded control-plane experience.
- Inventoried schema drift and defined Dander-produced generated contracts instead of manual mirrors.
- Defined external OIDC/PKCE, graph revision, migration, PR, cost, and compatibility boundaries.

## Try It

Read `steering/03-control-plane-roadmap.md`; the current loopback workflow remains unchanged.

## Checks

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` passed.
- `pnpm test` passed: 56 files and 586 tests.
- `pnpm test:e2e` passed: 10 browser journeys.
- Protected CI, the source-free image check, and the secret scan remain required before merge.

## Decisions

- Druff remains static and cloud-ignorant; Dander remains the semantic and authorization authority.
- Public bootstrap and server trust settings derive from one Dander deployment input.
- Generated DTOs and GraphStore-first routing precede hosted UI implementation.

## Remaining

- Merge the paired D0 documentation PRs after checks and completion review.
- Consume only the published Dander contract artifact in DRUFF-24.
- Keep OIDC registration and provider work behind separate human approval.

## Review First

- `steering/03-control-plane-roadmap.md`
- `tickets/DRUFF-24-generated-control-contracts.md`
- `tickets/DRUFF-25-static-oidc-bootstrap.md`
