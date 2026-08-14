# Druff

Front-end companion to **[Dander](https://github.com/harrisonoconnorhover/dander)** — a visual
editor for Dander's canonical
`PipelineGraph` files (drag/drop nodes, wire connections, configure sources/transforms/writes).

Druff opens and saves one graph file through Dander's localhost API. Dander owns parsing,
validation, conflict detection, and atomic filesystem writes. When the operator binds that graph
to one manifest pipeline, Druff can also validate it, manually run its already-deployed Cloud Run
job, and show compact execution/run-ledger status. A version-1 `dander.yaml` can still be imported
as a detached, one-way visualization. When Dander explicitly enables it with complete operator
inputs, Druff can also request a source-free candidate and display its non-applyable Terraform
plan; Druff never writes the manifest or applies infrastructure.

When that manifest pins installed connector plugins, Druff discovers their presentation-safe
descriptors from Dander and adds them to the palette dynamically. The first dynamic connector is
Salesforce Accounts. Greenhouse remains a static fallback for offline/document-only authoring;
Druff never receives API URLs, authentication settings, secret references, or credentials.

After **Open from Dander**, **Browse catalog** shows Dander's curated connector packages with exact
pins, compatible Dander versions, support and provider-validation status, public links, and whether
the current manifest activated them. Druff only copies setup instructions; it does not run a
package installer or edit `dander.yaml`.

Transform nodes can also author Dander's advertised, ordered, schema-preserving operations:
whitespace trimming, string truncation, null defaults, and bounded row filters. Druff stores these
directly as canonical `config.operations`; Dander remains the only execution engine. An older
runtime simply exposes no operation palette, and an unknown/newer operation stays preserved and
read-only instead of being rewritten.

See `CLAUDE.md` and `steering/00-project-overview.md` for the full picture (why this exists, the
module map, decision log). The accepted documentation-only Druff 1.0 architecture checkpoint is
in `steering/03-control-plane-roadmap.md`. Druff's DTOs now come from Dander's published contract
bundle; hosted graph storage, identity, and run APIs remain later phases.

## Stack

Next.js (App Router) + TypeScript · React Flow · Tailwind + shadcn/ui · Zustand · Zod · Monaco · pnpm.

## Repo map

```
src/                Next.js app (src/app), features (src/features/pipeline-canvas), src/lib
src/generated/      generated Dander DTO types, validators, fixtures, and exact bundle provenance
steering/           binding rules for humans + agents (read these)
tickets/            work items
scripts/            dev tooling (e.g. the workflow monitor)
.claude/            agent workforce, feature workflow, /feature command
```

## Developer setup

**Prerequisites:** Node 22+, [pnpm](https://pnpm.io) (`corepack enable && corepack prepare pnpm@latest --activate`).

```bash
pnpm install
pnpm dev              # http://localhost:3000
```

Contract output is generated only from the pinned public
`dander-platform==0.9.0rc19` wheel on PyPI. The generator verifies the wheel, manifest, every file,
and the whole bundle before writing output; it never reads a sibling Dander checkout.

```bash
pnpm contracts:check     # re-generate in a temporary directory and fail on committed drift
pnpm contracts:generate  # intentionally refresh committed output after updating the artifact pin
```

In a second terminal, select the graph file Dander may expose:

```bash
dander graph serve --file /absolute/path/to/pipeline.yaml
```

Then choose **Open from Dander**. Druff uses explicit Save, shows unsaved/conflict state, and will
not overwrite a file that changed after it was opened. Graph YAML formatting and comments may be
normalized because Dander writes its canonical model.

### Hosted interface

The production Dockerfile exports the compiled static interface into a non-root, read-only,
source-free Caddy image. Node and the package tree remain only in the discarded build stage. Every
build emits `/druff-artifact.json`, which binds the complete static file inventory to the source
revision, source epoch, version, and public Dander contract digest. A clean checkout uses its exact
commit; a dirty checkout records `unrecorded` rather than falsely attributing local edits to HEAD:

```bash
pnpm build
node scripts/static-artifact.mjs --check --root out
docker build --tag druff:local .
docker run --rm --read-only --tmpfs /tmp --publish 8080:8080 druff:local
```

The exact image serves extensionless OIDC callback routes, `/healthz`, `/readyz`, immutable hashed
assets, and the committed CSP/security policy. Protected CI builds linux/amd64 and linux/arm64 from
two isolated source contexts, verifies their shared static layer plus per-platform SPDX/SLSA
attestations, scans both runnable digests, and copies the reviewed index without rebuilding.

After a separately authorized registry publication, resolve the pushed digest and pass the
immutable `...@sha256:...` reference to Dander as
`dander init --druff-container-image IMAGE`. Dander provisions the public interface as a
scale-to-zero service with a dedicated identity that has no project roles.

At startup the static page checks only same-origin `/bootstrap.json`. When that file is absent,
Druff labels and preserves the existing loopback/offline workspace. When it is present, it must be
the public descriptor generated from Dander's hosted OIDC deployment input: Druff verifies the
exact contract digest and compatibility range, requires the fixed `/auth/callback` and
`/signed-out` routes, and gates the workspace behind external authorization-code + PKCE login.
Authorization responses use the URL fragment so managed HTTP request logs never receive the code
or sign-in state. The access token stays in browser memory; sign-in transaction state alone uses
session storage. Logout clears that memory before a token-free, state-free provider redirect.
Druff refuses browser refresh tokens, client secrets, token-bearing callback URLs, and Bearer
requests outside the descriptor's Control API origin. Do not hand-author or embed credentials in
this file.

Hosted mode uses the generated project, graph, catalog, validation, preview, run, status, log,
cancel, and replay APIs. Dander remains authoritative for authorization and semantics; Druff
discards stale or mismatched responses and never receives provider credentials or native payloads.
When `/bootstrap.json` is absent, the existing local-loopback workspace remains unchanged.

To enable the narrow operational controls for one graph that is already deployed, start Dander
with its matching manifest pipeline and GCP project:

```bash
dander graph serve \
  --file /absolute/path/to/graphs/greenhouse_jobs.yaml \
  --config /absolute/path/to/dander.yaml \
  --pipeline greenhouse_jobs_graph \
  --project my-gcp-project
```

Choose **Open from Dander**, then **Refresh status**. Validate and Run are enabled only while the
opened graph is saved and no execution is active. Run uses the operator's local `gcloud` identity
and targets only the fixed job Dander derived at startup. Use Refresh to read completion and the
latest Dander run-ledger result. These controls do not deploy edits, write `dander.yaml`, enable a
schedule, or expose cloud credentials to the browser.

To preview the deployment impact of a saved graph, restart the same command with
`--enable-deployment-preview`, the current billing/cost-guard inputs, and an explicit
`--failure-alert-email`. **Build candidate & plan** pushes an Artifact Registry candidate and shows
the exact full-manifest Terraform plan, including every job sharing that image. Save itself remains
file-only. The temporary binary plan is deleted by Dander; Druff cannot apply it or alter a
schedule.

To visualize a hosted Dander project manifest, choose **Import graph or dander.yaml** and select its
`dander.yaml`. Druff draws each schedule, source, and selected model. Exported `.druff.yaml`/JSON
files are editor drafts, not deployable Dander manifests.

## Everyday commands

```bash
pnpm lint             # eslint
pnpm typecheck        # tsc --noEmit
pnpm format:check     # prettier --check .
pnpm contracts:check # exact published Dander contract and generated-output drift
pnpm test:artifact   # deterministic bundle, OCI association, and exact-promotion checks
pnpm test             # vitest (unit/component)
pnpm test:e2e         # playwright (canvas drag/drop/connect — not reliable under jsdom)
pnpm build            # production build
```

**Green baseline** = lint, typecheck, format:check, test, and build all pass. Keep it green; the
`pr-review` agent enforces it on every ticket.

## The agent workforce & the `/feature` workflow

Features are built by a workforce of agents defined in `.claude/` — the `feature` workflow runs the
loop **Product → Design → Code → PR-Review**, looping a ticket back to Code with an addendum until
it passes review. See `CLAUDE.md` for the full picture.

**First, register it.** `.claude/agents/`, `.claude/workflows/`, and `.claude/commands/` are loaded
only at **Claude Code startup**. After cloning (or after editing anything under `.claude/`),
restart Claude Code in this project root so `/feature`, the agents, and the workflow become
available by name (until then, invoke by `scriptPath: ".claude/workflows/feature.js"`).

**Run it** (costs tokens, so each run is an explicit opt-in):

```text
/feature Add a node inspector panel for editing a selected node's properties
```

```text
(or just ask Claude in chat)   run the feature workflow with: <describe the feature>
```

It writes tickets to `tickets/` (lifecycle `open → in-design → in-code → in-review → done`),
implements + reviews each until PASS, and leaves the code + tests in your working tree.

## Watching workflows in real time

A workflow run spawns many background agents. `scripts/watch_workflows.py` is a dependency-free
(stdlib-only) live dashboard — ported from Dander's script of the same name — run it in a
**separate terminal** while a workflow is going:

```bash
python3 scripts/watch_workflows.py          # live dashboard, refresh every 2s
python3 scripts/watch_workflows.py --all    # include finished / idle runs
python3 scripts/watch_workflows.py -n 5     # refresh every 5s
python3 scripts/watch_workflows.py --once   # print one snapshot and exit
```

It auto-discovers **all** runs across sessions (so it handles several concurrent workflows), and
shows each run's agents with their role, ticket, and live PASS/FAIL verdicts:

```text
● wf_b3fcaba8-cb0  RUNNING  elapsed 2m08s  agents 1 done, 1 running
   ✓ product       —         6 ticket(s)
   ▸ design        DRUFF-1   working…
```

## Status

Working canonical graph editor with Dander-backed single-file Open/Save, canvas inspectors,
validation, source view, static Greenhouse plus dynamically discovered connector configuration,
one-way hosted-manifest preview, manual execution/status, and an explicit source-free
candidate/full-manifest plan for one operator-bound graph. Transform nodes can visually author the
safe operation subset advertised by the connected Dander runtime. Its compiled interface can be
hosted on Cloud Run while the Dander control plane remains local. Manifest write-back, provider
write-back, and Terraform apply are not implemented.
