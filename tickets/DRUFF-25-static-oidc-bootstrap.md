---
id: DRUFF-25
title: Add static OIDC and verified bootstrap discovery
status: open
component: frontend
epic: self-hosted-control-plane
depends_on: [DRUFF-24]
created: 2026-08-13
---

## Context

Hosted Druff needs human login without a Next.js server, password database, or browser cloud
credential.

## Acceptance Criteria

- [ ] Use external OIDC authorization code plus PKCE with state and nonce.
- [ ] Keep callback transaction only in session storage and access tokens only in memory; never use
      localStorage, URL tokens, a client secret, or a browser refresh token.
- [ ] Load only the provider-generated public descriptor and verify its artifact/contract metadata.
- [ ] Send Bearer tokens only to the fixed descriptor API origin and handle expiry/logout safely.
- [ ] Preserve explicit loopback/offline mode and static export; no Next server is introduced.

## Design

The descriptor and Dander's server trust settings come from one typed deployment source. React
capability checks are presentation only; Dander authorizes every request.

## Implementation Notes

_Pending._

## Review Log

_Pending._
