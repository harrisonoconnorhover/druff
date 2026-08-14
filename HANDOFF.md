# Morning Handoff

## Finished

- Added verified same-origin `/bootstrap.json` discovery with explicit loopback/offline fallback.
- Added static OIDC authorization-code + PKCE login with state, nonce, and the Dander API resource.
- Kept access tokens in memory and callback transactions in session storage; refresh and URL tokens
  fail closed.
- Added fixed-origin Bearer requests, expiry/401 clearing, and token-free correlated logout.
- Exported `/auth/callback` and `/signed-out` without adding a Next server or remote graph UI.

## Try It

Run `pnpm dev` with no bootstrap file to see labeled loopback/offline mode. A hosted deployment must
serve Dander's generated public descriptor at `/bootstrap.json`; do not hand-author it.

## Checks

- Contract drift, ESLint, strict TypeScript, and Prettier checks passed.
- Focused hosted-control and generated-contract suites passed 40 tests.
- Full Vitest passed 61 files and 627 tests; Playwright passed all 10 browser journeys.
- Static production build passed and exported `/`, `/auth/callback`, and `/signed-out`.

## Decisions

- Use `oidc-client-ts` 3.5.0 for discovery, code exchange, PKCE, and callback-state validation.
- Request `api_audience` as OAuth `resource`; never request `offline_access` or accept refresh tokens.
- Keep DRUFF-25 limited to identity/bootstrap; DRUFF-26 owns hosted project/graph behavior.

## Remaining

- Merge the focused protected PR and verify exact-main frontend, secret, and source-free-container CI.
- Implement DRUFF-26 remote project/graph management against this authenticated boundary.
- Continue DRUFF-27 through DRUFF-29 in roadmap order.

## Review First

- `src/features/hosted-control/HostedControlProvider.tsx`
- `src/features/hosted-control/oidc-session.ts`
- `src/features/hosted-control/bootstrap.ts`
