# Morning Handoff

## Finished

- Added a deterministic, content-addressed static export with exact source and contract provenance.
- Added a vulnerability-clean scratch/Caddy runtime with callback routes, probes, and security policy.
- Added multi-platform OCI, SBOM/SLSA association, reproducibility, and exact-promotion verification.
- Added exact-image runtime checks plus pre-promotion vulnerability and secret scans in protected CI.
- Extended the full hosted browser journey through cancellation, replay, success, and restart.

## Try It

Run `pnpm test:artifact`, then `pnpm build` and
`node scripts/static-artifact.mjs --check --root out`. Build the Dockerfile and serve port 8080 with
a read-only root plus a `/tmp` tmpfs to exercise the exact static runtime.

## Checks

- Artifact tests, Actionlint, strict TypeScript, ESLint, Prettier, and repeated production builds pass.
- Local amd64/arm64 OCI inspection found one exact shared layer plus per-platform SPDX/SLSA; exact
  raw-index promotion passed. Local read-only Caddy route/header/export verification passed.
- Full Vitest passes 66 files/669 tests and all 11 Playwright journeys pass with the committed CSP;
  protected PR run `31802260747` passed both exact runnable-digest scans and local promotion.

## Decisions

- Keep Next static export; Caddy serves files only and adds no application runtime.
- Resolve provenance once: clean HEAD is exact; dirty local sources are explicitly `unrecorded`.
- Treat public registry publication as later D9 work; DRUFF-29 promotes only in disposable local CI.

## Remaining

- Merge the protected PR, then verify exact-main CI and record its evidence.
- Continue D6 in roadmap order; do not publish a public Druff image without separate approval.

## Review First

- `.github/workflows/ci.yml`
- `scripts/oci-artifact.mjs`
- `Dockerfile` and `Caddyfile`
