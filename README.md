# Druff

Front-end companion to **[Dander](https://github.com/harrisonoconnorhover/dander)** — a visual
editor for Dander's canonical
`PipelineGraph` files (drag/drop nodes, wire connections, configure sources/transforms/writes).

Druff connects to Dander's hosted Control API or its single-file localhost API. Hosted users sign
in, choose a graph, configure it on the canvas, review unsaved changes, save, run and inspect the
recorded outcome. Dander owns parsing, validation, revision conflicts, storage and execution.

In localhost mode, an operator can bind the open graph to one manifest pipeline to validate it,
run its already-deployed Cloud Run job and inspect the run ledger. A version-1 `dander.yaml` can
still be imported as a detached, one-way visualization. When Dander explicitly enables it with
complete operator inputs, Druff can also request a source-free candidate and display its
non-applyable Terraform plan; Druff never writes the manifest or applies infrastructure.

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
bundle; hosted graph storage, identity, and run controls are implemented by the static client.

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

Contract output is generated only from the pinned
[`dander-platform==0.9.0rc34` GitHub integration-candidate wheel](https://github.com/harrisonoconnorhover/dander/releases/download/v0.9.0rc34/dander_platform-0.9.0rc34-py3-none-any.whl),
SHA-256 `d37c1d91c15cca9ce3d080af6dec384f7cd9cbc521dea253e10dc44772d35bad`.
The generator verifies the wheel, manifest, every file, and the whole bundle before writing output;
it never reads a sibling Dander checkout. This client requires the matching RC34 bundle. The
GitHub integration candidate does not promote Dander's public PyPI RC20 beta or qualify additional
provider profiles.

```bash
pnpm contracts:check     # re-generate in a temporary directory and fail on committed drift
pnpm contracts:generate  # intentionally refresh committed output after updating the artifact pin
```

Release acceptance can additionally exercise Druff's production graph and operation clients
against a locally running current Dander Control API:

```bash
# In an environment installed from the pinned RC34 wheel above (not the RC20 PyPI beta):
dander control serve --ephemeral --project demo-project --port 8770

# In Druff:
DANDER_CONTROL_URL=http://127.0.0.1:8770 \
DANDER_EXPECTED_VERSION=0.9.0rc34 \
pnpm test:current-dander
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

The hosted workspace guides one saved graph through **Choose → Configure → Review → Run → Results**:

1. Browse a project and open a graph, or create a graph from the current canvas draft. Configure
   source and output nodes in the existing inspector. Connections and deployed environments still
   belong to Dander's operator configuration.
2. Choose **Preview changes** to compare the unsaved draft with its saved revision. The review
   lists changed nodes and connections, downstream outputs, and the write behavior of every
   output a full run will write. This comparison does not query rows or estimate a bill.
3. Choose **Save reviewed changes**, then **Run reviewed graph**. Edits invalidate the review;
   Dander checks the saved revision again before accepting execution. Saving alone does not run.
4. Read the recorded outcome and suggested next action. Missing result measurements stay
   **Unknown**, including server-default counters before a result document exists. Advanced
   validation, deployment preview, logs, cancellation and replay remain available.
5. Expand **Repair selected output dates** to preview a saved graph's half-open UTC date window
   (first date included, end date excluded). A compatible environment can rebuild those output
   partitions from retained raw warehouse data. This does not fetch historical source records or
   move normal ingestion progress. Dander determines eligibility and publishes the selected
   ranges atomically; unsupported graphs/environments return an explicit explanation.

Date repair is an experimental producer capability until its stated qualification gates are met.
A generated client and its Dander deployment must use the same published contract bundle. Browser
journey tests use synthetic HTTP/OIDC fixtures; they do not establish live provider success.

To inspect an already-completed operator-owned native repair through Druff's real HTTP client,
without starting another workload:

```bash
DANDER_CONTROL_URL=http://127.0.0.1:8876 \
DANDER_REPAIR_PROJECT=repair-proof-rc34 \
DANDER_REPAIR_GRAPH=repair-corrections \
DANDER_REPAIR_RUN_ID=REPLACE_WITH_ACCEPTED_RUN_ID \
pnpm test:repair-observation
```

This observation verifies the exact contract, saved graph, repair preview, status and explanation
for the September 10–12 synthetic fixture, including zero extracted rows, two output rows written
and four output rows affected.
The operator's separate provider evidence must establish warehouse results, watermarks and cleanup.

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
