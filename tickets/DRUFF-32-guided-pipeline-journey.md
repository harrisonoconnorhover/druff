---
id: DRUFF-32
title: Guide graph configuration, reviewed runs and date repair
status: done
component: frontend
created: 2026-10-01
---

## Context

The existing editor exposes persistence, validation and run commands in parallel. Connect those
capabilities into a first-success journey using Dander's published transport contracts, without
adding a browser runtime, provider clients or a second planner.

## Acceptance Criteria

- [x] Keep hosted sign-in, capability checks and loopback behavior intact.
- [x] Guide graph selection and configuration to an unsaved change preview, explicit save and run
      of the exact reviewed saved graph; draft or saved-content changes invalidate review, and
      submissions retain the saved graph's exact opaque revision precondition.
- [x] Show recorded run explanations and unknown measurements truthfully; preserve cancellation,
      replay and logs with their existing permissions and idempotency semantics.
- [x] Preview and submit retained-raw date repair with the exact saved revision, date window and
      advertised execution environment; explain its limits and never imply historical recovery.
- [x] Preserve existing editing and advanced controls. Verify new state transitions and API
      contracts, exercise the browser with synthetic OIDC/API fixtures, and exercise the production
      client against Dander's actual Control API. Record native provider proof separately.

## Design

One hosted journey panel composes the existing graph, validation and run hooks. A review is bound
to the graph address, draft content and opaque baseline revision, and survives only an exact save.
Date repair is a deliberate preview/start operation. Outcomes come from Dander's deterministic
explanation endpoint. The loopback editor remains separate.

## Verification

Published RC33 contract checks passed: 685 unit/component tests; TypeScript, ESLint, Prettier, static build; all
11 Playwright journeys; real HTTP acceptance against an ephemeral published-wheel Dander RC33 Control
API. Browser OIDC/API fixtures are synthetic. The actual HTTP test covers canonical canvas hash
identity, unsaved preview, exact save and stale preview rejection without a provider backend.

Contracts were finally regenerated from the published RC34 GitHub wheel, with exact wheel/bundle
hashes and independent drift verification. RC34 fixes Control's native image identity reconciliation;
the contract bundle is unchanged. Final real HTTP acceptance against RC34, 29 contract tests,
18 journey/API tests, TypeScript and focused lint passed. This GitHub candidate does not promote
the RC20 PyPI beta.
Native repair success and cleanup are recorded separately below;
`pnpm test:repair-observation` reads an accepted run without launching another workload.

Protected PR run `36869153273` passed frontend and secret checks but found three fixed high
vulnerabilities in the existing Caddy binary dependencies. Pin `golang.org/x/crypto` to `v0.55.0`
for CVE-2026-56854 and `google.golang.org/grpc` to `v1.83.2` for CVE-2026-84304 and
CVE-2026-84445. The existing Caddy version, image pins and scan policy remain intact. Protected
run `36870826744` passed both architecture scans, reproducibility, runtime/routes/headers and
frontend/secret checks with those replacements.

## Delivered candidate

[PR #25](https://github.com/harrisonoconnorhover/druff/pull/25) merged as
`eabceb21d7b1b38fcbccdf34f07772e89ea52f6a` through normal protection. Its final RC34-paired
head passed CI `36876247454`; [exact-main CI](https://github.com/harrisonoconnorhover/druff/actions/runs/36877515144)
also passed all frontend, browser, artifact and secret checks.

Published `ghcr.io/harrisonoconnorhover/druff:0.2.0-rc.1` by copying the locally verified OCI
artifact without rebuilding. Anonymous fetch verified the exact public index:

- Index: `sha256:6aade12c399a67c604577e4a022af6dff22db7764626dd9a7a4f5cea1a2ceac1`
- Linux/AMD64: `sha256:c03f82349d1f66d0f6b48c2c9db3b0d8b597953f1b387ca0191637a1b4573eea`
- Linux/ARM64: `sha256:d60a5383e07887ab5f071ce0cb1afc0e100fdbd797b25677e4f5792ca6ffac16`

Both architectures passed non-root/source-free runtime, callback/probe/header/cache checks,
reproducible static-layer comparison, SBOM/provenance validation and high/critical vulnerability
and secret scans. Active `sha256:5ab559fe0c637407dd3398304d0480c73477cd770c073c92de4f8f2cda023eb9`
and rollback `sha256:bd1228bbe30a7f17ce3d0d9f9f4967e271a9b6fb9d010c8ffb648b2a8c19175d`
were unchanged. Task-owned local release builder/registry were removed.

The real production-client observer passed at 14:34:17 UTC on October 1 against RC34 Control and
accepted native run `run-ec3ecadaeb48d3cca4ccf537`: September 10–12 window, zero extracted rows,
two output rows written and four affected. Dander's separate native proof used the verified RC33
runtime, confirmed unchanged outside-window rows/raw/watermark and restored Job arguments, and
verified cloud/local cleanup by 14:37:02 UTC. This narrow proof does not promote the RC20 public
beta or qualify other provider profiles; browser OIDC/API journeys remain synthetic evidence.
