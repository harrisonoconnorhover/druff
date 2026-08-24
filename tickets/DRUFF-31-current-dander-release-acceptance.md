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
