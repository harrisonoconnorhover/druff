---
id: DRUFF-25
title: Add static OIDC and verified bootstrap discovery
status: done
component: frontend
epic: self-hosted-control-plane
depends_on: [DRUFF-24]
created: 2026-08-13
---

## Context

Hosted Druff needs human login without a Next.js server, password database, or browser cloud
credential.

## Acceptance Criteria

- [x] Use external OIDC authorization code plus PKCE with state and nonce.
- [x] Keep callback transaction only in session storage and access tokens only in memory; never use
      localStorage, URL tokens, a client secret, or a browser refresh token.
- [x] Load only the provider-generated public descriptor and verify its artifact/contract metadata.
- [x] Send Bearer tokens only to the fixed descriptor API origin and handle expiry/logout safely.
- [x] Preserve explicit loopback/offline mode and static export; no Next server is introduced.

## Design

The descriptor and Dander's server trust settings come from one typed deployment source. React
capability checks are presentation only; Dander authorizes every request.

## Implementation Notes

- `oidc-client-ts` 3.5.0 owns discovery, authorization-code exchange, PKCE, and callback state
  validation. Druff explicitly requests Dander's separate API audience as the OAuth resource.
- `/bootstrap.json` is the sole hosted discovery location. A 404 selects labeled loopback/offline
  mode; an invalid or incompatible descriptor blocks the workspace.
- Sign-in and sign-out callbacks are exported at the exact generated descriptor routes. Access
  tokens use an in-memory store; only code-flow transaction state uses session storage. DRUFF-30
  later made logout state-free after clearing memory so managed request logs receive no query data.
- The hosted fetch boundary fixes the descriptor API origin, omits cookies, refuses redirects and
  caller Authorization headers, and clears auth on expiry or HTTP 401.

## Review Log

### 2026-08-14 — pre-implementation adversarial review

The review approved the OIDC dependency but found two correctness omissions in the initial plan.
The implementation now maps `api_audience` to the authorize request's `resource` parameter and
exports/processes the descriptor's distinct `/signed-out` callback. Logout clears the in-memory
user before navigation so no ID-token hint enters the end-session URL.

### 2026-08-14 — completion adversarial review

The review caught React Strict Mode re-running callback URL capture and overwriting the original
code/state with the already-clean route. Capture is now one-shot, and a Strict Mode regression
proves the original callback is processed exactly once after hosted discovery completes.
