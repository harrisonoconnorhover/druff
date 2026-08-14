# Morning Handoff

## Finished

- Moved OIDC authorization-code callbacks from query parameters to the browser fragment.
- Kept the one-shot Strict Mode callback capture and immediate browser-history scrub.
- Made provider logout token-free and state-free after clearing the in-memory user.
- Added real oidc-client-ts request coverage and recorded the managed-hosting boundary.

## Try It

Run the focused OIDC session and hosted-provider tests. The authorize URL should request
`response_mode=fragment`; the end-session URL should contain neither state nor tokens.

## Checks

- Focused Vitest passed 9 tests; full Vitest passed 66 files and 669 tests.
- Contract drift, typecheck, ESLint, Prettier, and the deterministic production build passed.
- Full Playwright passed all 11 journeys after its fake issuer was corrected to return a fragment.
- Independent completion review passed with no material finding.
- No dependency, generated contract, API client, graph, run-control, or container change is included.

## Decisions

- Use the standard fragment response mode so managed request logs never receive sign-in code/state.
- Omit optional logout state after local access is cleared instead of adding a second parser or log exclusion.
- Keep active/rollback image trees identical while truthful commit labels produce distinct digests.

## Remaining

- Merge the focused protected PR and verify exact-main CI.
- Build exact active/rollback images only after protected merge and exact-main CI.
- Continue the GCP Terraform profile separately; do not claim provider qualification here.

## Review First

- `src/features/hosted-control/oidc-session.ts`
- `src/features/hosted-control/oidc-session.test.ts`
- `src/features/hosted-control/HostedControlProvider.test.tsx`
