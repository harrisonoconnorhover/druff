# Security Steering — NON-NEGOTIABLE

> Every agent MUST read and obey this before writing code. Violations are automatic PR-review
> failures.

## 1. Secrets: zero hardcoding, ever

- **NEVER** write a secret, key, password, token, connection string, or credential literal into
  source, config, tests, fixtures, comments, or commit messages. Not even temporarily.
- Anything shipped in Druff's client bundle is public. Connector forms may store references that
  Dander resolves later, but must never receive or resolve the underlying credential.
- Druff does not use environment-held credentials today. If a future server component needs one,
  document the new boundary before implementation and commit names/placeholders only, never values.

## 2. Current Dander boundary

- The hosted Druff service is a public static browser shell. It has no project IAM roles, graph
  storage, provider credentials, Dander API, or server-side session.
- Privileged operations go only to Dander's operator-started service at `127.0.0.1:8765`. Dander
  binds one graph, manifest pipeline, and GCP project at startup; Druff cannot choose arbitrary
  filesystem or cloud targets.
- Dander permits only the operator-supplied exact Druff origin. Do not widen CORS to `*`, accept an
  origin from browser input, bind the control service to a non-loopback interface, or add a public
  proxy to it.
- The browser may require explicit local-network permission before a hosted page can contact the
  loopback service. The operator's local process and `gcloud` identity remain the authority; no
  long-lived browser credential or custom token scheme is used.
- The Dander responses consumed by Druff contain graph/configuration data and presentation-safe
  connector, operation, execution, and plan metadata. They must not contain secret values, raw
  provider rows, Terraform state, or unrestricted logs.

## 3. Data sensitivity

- Treat Dander-sourced HR, compensation, customer, and other business data as sensitive by default:
  do not place it in client logs, errors, analytics, committed fixtures, or screenshots.
- Use invented values in tests. Secret-reference syntax is allowed only when it is visibly a
  handle, such as `secret:demo_key`, and never resembles a usable credential.
- Preserve the existing fail-closed handling for unknown connector/operation fields and unsafe
  credential-shaped request literals. Dander remains the authoritative validator.

## 4. Dependencies and artifacts

- Pin dependencies in `pnpm-lock.yaml`. Review new packages for install/build scripts and runtime
  network behavior.
- The production image contains only compiled static assets and its non-root web server. Do not
  copy the source tree, package manager, development dependencies, local graphs, or environment
  files into the runtime image.

## Quick self-check before any commit

- [ ] No literal secret or sensitive data appears in the diff or built browser assets.
- [ ] Browser-visible APIs return only the minimum presentation/operation metadata required.
- [ ] The Dander control service remains loopback-only and exact-origin scoped.
- [ ] New dependencies are justified and the lockfile changes with them.

## Roadmap boundary

The authenticated hosted Control API described in `03-control-plane-roadmap.md` is not implemented
at the current baseline. When that work lands, external OIDC tokens remain human identity only,
access tokens stay in browser memory, and Dander validates and authorizes every hosted request.
That future mode must not weaken or silently replace the current loopback-only exact-origin path.
