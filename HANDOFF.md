# Morning Handoff

## Finished

- Merged current-Dander compatibility in PR #23 and passed exact-main CI at `34acec00dfc9aafe93a62b1e3ed2b1b807a66487`.
- Exercised Druff's production clients against protected Dander RC32 at `33801213ee8c1bab78b8847a4b86bd9b4b8d1c63`.
- Built and retained exact active and rollback multi-platform OCI artifacts with SBOM and provenance attestations.
- Verified both artifacts are source-free, non-root, read-only, route-complete, and clean under the protected Trivy policy.

## Try It

Resolve the retained artifacts with `oras resolve --oci-layout /Users/harrison/.codex/artifacts/druff/2026-08-24-release/druff-active-34acec00dfc9.oci.tar:active` or the matching `druff-rollback-55f1565f3cb8.oci.tar:rollback`. For Control API acceptance, start current Dander and run `DANDER_CONTROL_URL=http://127.0.0.1:8770 DANDER_EXPECTED_VERSION=0.9.0rc32 pnpm test:current-dander`.

## Checks

- PR #23 and exact-main run `32787930579` passed Frontend quality, Source-free container, and Secret scan.
- Current-Dander acceptance, contract/artifact checks, lint, types, format, 669 unit tests, and 11 Playwright journeys passed.
- Both exact artifacts passed reproducible-layer, promotion, archive, amd64/arm64 runtime/export, and Trivy 0.70.0 HIGH/CRITICAL plus secret checks with zero findings.

## Decisions

- Active is merge commit `34acec00dfc9`; rollback is green PR head `55f1565f3cb8`; both share tree `ce829147ef3b`.
- Retain the public RC19 contract pin because protected RC32's bundle is byte-identical.
- Keep the release artifacts as local OCI archives; public registry publication remains a separate external action.

## Remaining

- No Druff implementation or release-readiness gap remains.
- Publish or deploy the retained artifact only when a destination is explicitly approved.

## Review First

- `tickets/DRUFF-31-current-dander-release-acceptance.md`
- `integration/current-dander-control.test.ts`
- `/Users/harrison/.codex/artifacts/druff/2026-08-24-release/records`
