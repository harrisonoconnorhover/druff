---
id: DRUFF-31
title: Verify release compatibility with current Dander
status: done
component: frontend
epic: self-hosted-control-plane
depends_on: [DRUFF-29, DRUFF-30]
created: 2026-08-24
---

## Context

Druff's deterministic artifact and complete browser journey were protected against the published
RC19 transport bundle. Current protected Dander is RC32: the bundle is byte-identical, while the
hosted service implementation has continued to harden. Release selection needs one reusable
cross-repository acceptance boundary rather than a copied mock-version claim.

## Acceptance Criteria

- [x] Verify the exact current Dander version and contract identity through `/v1/capabilities`.
- [x] Exercise Druff's generated graph and operation clients against a real current Dander HTTP
      application, including conditional create/open/save/delete and bodyless validation.
- [x] Confirm unavailable preview and run capabilities fail closed through normalized errors.
- [x] Keep ordinary unit tests network-free and make current-Dander acceptance explicit and local.
- [x] Allow browser acceptance to bind an explicit isolated local port instead of reusing an
      unrelated service on the default development port.
- [x] Preserve the published RC19 artifact pin because current protected Dander carries the exact
      same contract bundle bytes.

## Design

Add one opt-in Vitest configuration and integration journey. The test receives a credential-free
local Control URL and expected version, then uses Druff's production clients without a compatibility
adapter. Normal Vitest excludes the integration directory.

## Implementation Notes

- `pnpm test:current-dander` targets only the cross-repository acceptance file.
- `PLAYWRIGHT_PORT` selects an isolated browser-test server without changing CI's default.
- The journey uses invented graph data and cleans its graph through the same conditional API.
- No Dander source, generated contract, production client, provider behavior, or dependency changed.

## Review Log

### 2026-08-24 — implementation review

The smallest release gap is a real-server compatibility check. The current protected Dander bundle
matches Druff's published pin byte-for-byte, so regenerating DTOs or changing runtime code would be
false churn.

### 2026-08-24 — release artifact record

PR #23 merged as `34acec00dfc9aafe93a62b1e3ed2b1b807a66487`; exact-main CI run
`32787930579` passed all three required jobs. Active uses that merge commit. Rollback uses its green
PR head `55f1565f3cb8d83efb1c38d0552d13808867b1be`; both resolve to tree
`ce829147ef3b06cc73c4b4c892541977913686cb`.

| Identity | Active | Rollback |
| --- | --- | --- |
| OCI index | `sha256:5ab559fe0c637407dd3398304d0480c73477cd770c073c92de4f8f2cda023eb9` | `sha256:bd1228bbe30a7f17ce3d0d9f9f4967e271a9b6fb9d010c8ffb648b2a8c19175d` |
| linux/amd64 | `sha256:df39b359f7e16f5ed21b9fe429bbd92b5d1bfdf55eede9ae13bfea5bf807a138` | `sha256:128fbb599b7fbaac4f6655210e118e8cd53da30cfaeab7e6fbb3352b0501d77d` |
| linux/arm64 | `sha256:cda7a83ad5343ca6766d79cb974d740137c77dbae73166c2aab9251a6f09060d` | `sha256:bcccc122f6b9cf15ce9dc4a211fc76a566eb816bb4d53bc4f82914bd623491f6` |
| Static layer | `sha256:d55b44dceb9c5300c6c709c29d48c442f66b917ed1594c3fe46475b50d43c6cd` | `sha256:09557745dfe7293e457107cc13b1c2185971d992e468220dc7a441eaa96f0a6a` |
| Static bundle | `904c7eb1629ba7ab60def188acbe4bc7d0db316954ffb91a8684aee5cec50865` | `8b1d86a49d02cf722de45993d7f1cfdee7bb2781e29b78c3b1476add2c761d2b` |
| OCI archive SHA-256 | `f40cf29112dd02dd639aa2be4fc93d661f1862d8b4bcc01695a1f42f80d33dfc` | `992ee53405f04bc6b47924eda4310a84e41cfd2763d850a3d4db964ab9eb30c4` |

The archives are retained under `/Users/harrison/.codex/artifacts/druff/2026-08-24-release/`.
Each contains both platforms plus SPDX SBOM and SLSA provenance attestations. Exact promotion kept
the source index bytes unchanged; isolated repeat builds reproduced the static layer. Both platform
manifests for both artifacts passed Trivy 0.70.0 vulnerability and secret scanning with zero
HIGH/CRITICAL or secret findings. Both platforms also passed exported source-free checks and
read-only runtime route, probe, cache, and security-header verification. The production clients
passed again from protected Druff against protected Dander RC32 after the artifacts were retained.
