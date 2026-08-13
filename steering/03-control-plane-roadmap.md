# Druff 1.0 self-hosted control-plane roadmap

Status: Phase D0 accepted for implementation planning; current product remains local-loopback alpha

Date: 2026-08-13

This document is the Druff-owned companion to Dander's
`docs/druff-control-plane-roadmap.md`. It records the cross-repository checkpoint only. No hosted
API, login, graph store, public endpoint, release, or provider resource is created by Phase D0.

## Exact baseline

| Repository | Origin | Starting commit | Baseline |
|---|---|---|---|
| Dander | `https://github.com/harrisonoconnorhover/dander.git` | `536b31b701a67a5b7eeb68e09e1d87a4c59898f9` | Phase 7 accepted; CI run `31704251539` green; protected by ruleset `20133128` |
| Druff | `https://github.com/harrisonoconnorhover/druff.git` | `f9cc23cd8763b7cf761a61ba6be9ad9c26b42d96` | CI run `31050509937` green; no main ruleset at assessment time |

Druff `main` protection is required before Phase D1 implementation may merge. Dander's unrelated
Phase 8 work is not a Druff dependency or exit gate. The local Phase 8 checkpoint at
`eec57a89c3d302d82b40d15ebc468c2858d1a3d1` is excluded from contract generation and must remain
untouched by this roadmap.

## What exists now

Druff already provides:

- a static Next.js export and source-free non-root image;
- canonical graph import/export and canvas conversion;
- explicit Dander-backed open/save with ETag conflict handling;
- connector, curated plugin, and operation discovery;
- manual inline graph validation;
- one fixed graph's GCP status/run and deployment-preview controls; and
- unit/component and Playwright coverage for the current bounded slice.

The current production image serves only static assets with BusyBox. The application has no
Next.js route handler, middleware, cookie/header API, server environment read, database, or other
runtime-server dependency. All network clients default to Dander's loopback service.

## Current drift that D1 must remove

The manually maintained Druff contracts are no longer an acceptable authority:

- `PipelineGraphSchema` omits Dander `NodeField.extensions`, so it rejects a valid current Dander
  graph using provider annotations.
- Typed source/transform/target `config` is modeled only as an arbitrary record.
- Druff's writer transport schema contains `load_job` and `storage_write`, while Dander also
  models `copy` and provider-selected `direct` with different authoring constraints.
- Trigger, field-test, transformation, and writer semantic checks are intentionally only partial
  in Druff. Dander remains the enforcement boundary.
- Graph, connector, plugin, operation, preview, run, and status response validators are separate
  handwritten Zod definitions.
- The TypeScript graph validator is a useful advisory port, not authorization or proof that a
  graph can execute.

Dander's current `PipelineGraph.model_json_schema()` is also insufficient by itself: validator-
routed typed node configs collapse to an open/empty config shape, and per-call strict-extra
validation is absent. D1 therefore consumes an explicit Dander-owned transport bundle, not a raw
domain-schema dump.

## Product and trust boundary

```text
external OIDC issuer
        |
        | authorization code + PKCE
        v
static Druff ---- generated Control API client ----> Dander Control API
                                                        |
                                                        +-- semantics and validation
                                                        +-- graphs and revisions
                                                        +-- catalogs and previews
                                                        +-- runs and providers
```

Druff remains cloud-ignorant. It never receives a GCP, AWS, Azure, OCI, Kubernetes, warehouse, or
launcher client. React components render normalized capabilities and safe unsupported reasons;
they do not branch on provider payloads or authorize operations.

Dander owns graph models, semantic validation, operation definitions, connector/plugin contracts,
compilation, deployment preview, execution, run state, provider behavior, storage, infrastructure,
and authorization. Druff may validate for immediate presentation, but only a Dander response can
authorize/save/validate/preview/run/cancel/replay.

## Static deployment decision

Druff remains `output: "export"`. Graph CRUD, catalog reads, validation/preview, polling, run
controls, and OIDC authorization code plus PKCE all work from static assets. No current feature
requires secure session termination, same-origin proxying, or server-only configuration, so a
long-running Next.js service would add a second backend without value.

The build produces one deterministic `StaticAssetBundle` identity. Deployment supplies a small
public bootstrap descriptor with only:

- Dander Control API URL;
- OIDC issuer, public client ID, and audience;
- exact redirect and logout URI;
- Dander contract/API compatibility metadata; and
- bootstrap/static artifact digests.

The descriptor and Dander's server-side CORS/OIDC settings must be generated from one typed Dander
deployment input and verified equal. Browser-readable configuration is discovery data, never the
trust authority or a way for the user to choose an API target at runtime.

## OIDC and browser token handling

Hosted deployments use one operator-configured external issuer and a public SPA client:

1. authorization-code flow with PKCE, state, and nonce;
2. the short callback transaction exists only in session storage;
3. the access token exists only in memory;
4. no browser client secret, localStorage token, URL token, or browser refresh token;
5. bounded reauthentication when the short-lived token expires; and
6. safe logout through the configured issuer.

Dander validates token signature, issuer, audience, expiry, and required claims on every hosted
request and centrally maps roles to capabilities. UI role checks only hide or explain controls.
Exact CORS origins and a CSP are deployment-verified. Provider workload credentials never enter
the browser. Existing loopback mode remains physically separate and has no hosted OIDC requirement.

## Generated contract strategy

Dander first releases a deterministic `io.dander.control.contracts/v1` transport bundle with
explicit graph DTOs, errors, catalogs, preview, runs, bounded logs, mutation results,
capabilities, and compatibility metadata. Typed graph DTOs encode strict boundary objects,
type/config branches, allowed extensible fallbacks, aliases/omission rules, extensions, and writer
transports. Canonical fixtures prove domain-to-transport validation and round trip.

Druff then generates TypeScript types and runtime validators from that exact published artifact.
Generated output is deterministic and checked for drift in CI. The Druff build embeds the contract
bundle ID/digest. `GET /v1/capabilities` advertises the Dander API/bundle and compatible Druff
range; incompatibility fails with an upgrade message before editing.

Cross-repository order is strict:

```text
Dander producer PR
→ protected Dander release/artifact
→ Druff generated consumer PR
```

Druff never generates from a sibling checkout, local WIP commit, or unmerged Dander branch.

## Graph and revision experience

Hosted mode adds project/graph list, create, open, conditional save, and conditional delete. The
generated API returns:

- an opaque ETag used only for concurrency; and
- a canonical JSON `content_sha256` used for portable identity.

The UI never interprets provider generations or object-store ETags. Conflict behavior preserves
the current explicit dirty/saving/conflict/reload model. Import/export and detached local drafts
remain available. Graph data contains configuration and secret references, never resolved secret
values or provider/business rows.

## Implementation sequence

1. Merge paired D0 documentation PRs and protect Druff `main`.
2. Dander publishes the explicit contract bundle in a protected release artifact.
3. Druff generates types/validators and replaces authoritative handwritten boundary schemas.
4. Dander lands GraphStore plus local adapters, then the hosted multi-graph API.
5. Dander adds provider object stores separately; no provider behavior leaks into Druff.
6. Dander lands hosted OIDC/authz; Druff lands static PKCE/bootstrap integration.
7. Druff lands graph management, then validation/catalog/preview, then run controls in separate PRs.
8. Druff hardens the deterministic static artifact and passes the full local Playwright journey.
9. Dander lands a separate control-service projection and static-site deployment input.
10. Local/Kubernetes and each cloud Terraform/live proof proceed separately under the Dander plan.

## Compatibility and migration

- Keep today's `DanderApiGraphPersistence`, discovery, and operations interfaces as testable seams;
  adapt them behind one generated Control API client rather than adding provider clients.
- Keep `dander graph serve --file GRAPH` and current local Druff operation throughout migration.
- Unknown/additive fields are preserved only where Dander's transport contract permits them.
- Existing GCP-only status/run/preview behavior remains a local compatibility slice until the
  hosted normalized API advertises an equivalent capability.
- Polling every 2–5 seconds is the default; no WebSocket or server-rendering requirement.
- No adapter or Terraform existence changes a provider support label.

## Pull-request and evidence gates

Every substantial Druff PR requires its ticket, focused tests, lint/type/format/unit/build/
Playwright checks as applicable, source-free container and secret scans, compatibility and handoff
updates, and independent completion review. Application implementation may not merge until Druff
main has PR and required-CI protection.

Local contract, mock, OIDC-test-issuer, static-build, and Playwright work is no-cost. OIDC client
registration, artifact publication, public endpoints, or provider use stops for explicit human
approval. Every paid attempt requires a reviewed plan/command, numeric provider ceiling, stable
approval reference, no automatic rerun, and exact cleanup or retained no drift. Phase D0 consumes
no credential, cloud mutation, publication, or cost approval.

## Non-goals

No organizations/workspaces, billing, password database, enterprise directory, fine-grained RBAC,
multiplayer/CRDTs, comments, approvals, promotion workflows, secret UI, browser plugin install,
browser code execution, provider client, database solely for graphs, arbitrary path access,
universal asset model, WebSocket requirement, HA/multi-region service, generalized orchestration,
or generic platform framework is added.

## Review disposition

The independent D0 review confirmed static export plus public-client PKCE as the smallest adequate
topology and the separate service projection as proportionate. Its four corrections are binding:
explicit transport DTOs instead of naïve Pydantic schema export; one typed source for public and
server trust settings; actual logical-project v2/platforms-manifest v1 naming; and GraphStore-first
multi-graph routing with opaque ETags separate from canonical content hashes.

Those corrections preserve the requested architecture rather than changing it. No additional
product-direction approval is required before the protected local-only sequence begins.
