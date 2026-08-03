# Druff

Front-end companion to **[Dander](../dander)** — a visual editor for building and visualizing
pipeline drafts (drag/drop nodes, wire connections, configure sources/transforms/writes).

Today Druff can import a Dander version-1 `dander.yaml` and project its hosted pipelines onto the
canvas. That projection is an editable **local draft**: Druff does not deploy it or write changes
back to the manifest. Dander remains the execution and infrastructure boundary.

See `CLAUDE.md` and `steering/00-project-overview.md` for the full picture (why this exists, the
module map, decision log).

## Stack

Next.js (App Router) + TypeScript · React Flow · Tailwind + shadcn/ui · Zustand · Zod · Monaco · pnpm.

## Repo map

```
src/                Next.js app (src/app), features (src/features/pipeline-canvas), src/lib
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

To visualize a current Dander project, choose **Import graph or dander.yaml** and select its
`dander.yaml`. Druff draws each schedule, source, and selected model. Exported `.druff.yaml`/JSON
files are editor drafts, not deployable Dander manifests.

## Everyday commands

```bash
pnpm lint             # eslint
pnpm typecheck        # tsc --noEmit
pnpm format:check     # prettier --check .
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

Working local authoring UI with canvas, inspectors, validation, save/load, source view, Greenhouse
connector configuration, and one-way hosted-manifest preview. Direct manifest write-back and
pipeline execution are not implemented.
