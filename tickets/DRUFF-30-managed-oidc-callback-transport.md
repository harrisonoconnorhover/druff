---
id: DRUFF-30
title: Keep managed OIDC callbacks out of request logs
status: done
component: frontend
epic: self-hosted-control-plane
depends_on: [DRUFF-29]
created: 2026-08-14
---

## Context

Managed static hosting can create platform request logs before Druff's Caddy process sees a
callback. Query-mode authorization codes and state would therefore cross a logging boundary that
the application cannot sanitize.

## Acceptance Criteria

- [x] Request authorization-code plus PKCE responses in the URL fragment.
- [x] Capture the original fragment once and scrub it before hosted discovery completes.
- [x] Clear in-memory authorization before a token-free, state-free provider logout redirect.
- [x] Preserve the fixed sign-in and sign-out callback routes and explicit loopback mode.
- [x] Cover the real authorize/end-session URLs and React Strict Mode callback handoff.

## Design

Use oidc-client-ts's standard fragment response mode. Fragments remain in the browser and are not
sent in HTTP requests. RP-initiated logout has no response-mode setting, so omit its optional state
after clearing the only in-memory access token; the fixed post-logout route remains registered.

## Implementation Notes

- Kept code flow, PKCE S256, nonce, the API resource, session-backed sign-in transaction state,
  memory-only user storage, and token validation unchanged.
- Removed only optional logout state. No logging exclusion, provider branch, contract field, Dander
  change, or Terraform behavior was added.
- Protected active and rollback images may use the merge and green PR-head commits respectively:
  their reviewed trees are identical while their exact revision labels and image digests differ.

## Review Log

### 2026-08-14 — adversarial pre-review

The review confirmed fragment mode is the smallest managed-hosting correction. It also found that
oidc-client-ts shares its response parser with logout while logout state is returned in the query.
The accepted correction removes that optional state and proves the clean fixed callback instead of
adding a logging exclusion or a second parser.
