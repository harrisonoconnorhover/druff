# Druff

Front-end companion to **Dander** (`../dander`), an open-source GCP-native EL(T) suite. Dander's
`pipeline` package defines a durable YAML/JSON pipeline-graph format (nodes with field schemas,
edges with field mappings/transformations/joins) explicitly as the storage format "behind a future
drag-drop UI." Druff is that UI.

> **Status:** scaffolding only. Steering + agent workforce ported from Dander and adapted; the
> actual product scope, tech stack, and language-specific steering are **not yet defined** — see
> the placeholders in `steering/00-project-overview.md`.

## Why a separate repo from Dander

Decided explicitly (not an accident of how this got scaffolded): Dander's steering/agent workforce
is Python/GCP-shaped (`code-python`, `code-sql`, `code-terraform`, GCP-specific security rules).
Bolting a frontend stack into that tree would mean either stretching those rules to cover a stack
they weren't written for, or the frontend silently ignoring them — plus it would inherit Dander's
`uv`/hatchling packaging and CI for no reason. Separate repos mean the frontend moves at its own
pace with its own CI/deploy, at the cost of a deliberate contract for sharing the pipeline-graph
schema (see the "Contract with Dander" section in `steering/00-project-overview.md`) instead of
importing Dander's Python types directly.

## Steering — the contract (read these; they are binding)

These three are **universal** — they apply to every agent and every change, so they're loaded
into every session:

@steering/00-project-overview.md
@steering/01-security.md
@steering/02-engineering.md

**Language rules load on demand (Kiro-style conditional inclusion), not globally** — once the
stack is chosen, add `steering/languages/<stack>.md` and reference it here, mirroring Dander's:
- Python → `steering/languages/python.md`
- BigQuery SQL → `steering/languages/sql.md`
- Terraform/HCL → `steering/languages/terraform.md`

None of these exist yet for Druff — see `steering/languages/README.md`.

## The agent workforce (`.claude/agents/`)

| Agent | Role |
|---|---|
| **product** | Plain-English request → small, independently-implementable tickets with acceptance criteria. |
| **design** | Ticket → clean, interface-first technical design. |
| **code-\<stack\>** | *Not created yet* — implements a ticket in the chosen frontend stack. Add once the stack is picked (see `steering/00-project-overview.md`). |
| **pr-review** | Quality gate: implementation vs. acceptance criteria + steering → PASS, or FAIL + addendum. |
| **documentation** | READMEs, component docs, usage guides; keeps docs true to code. |

## Orchestration — the `feature` workflow

Automated, via `.claude/workflows/feature.js`. It runs the full loop:

```
request → Product (writes tickets/) → Design (per ticket) → Build[ Code → PR-Review → (FAIL → Code)… ]
```

- **Product** decomposes the request into ticket files.
- **Design** produces a technical design per ticket (concurrently).
- **Build** implements + reviews each ticket **serially**; a FAIL loops back to the code agent with
  a concrete addendum, up to a capped number of rounds, until PASS.
- Right now, only `component: docs` tickets can actually build — `component: frontend` has no
  code agent yet (see the table above). Product tickets accordingly until that's added.

**Run it** (requires explicit opt-in each time — say "use a workflow" / "ultracode"):
> Run the `feature` workflow with args: `"<describe the feature in plain English>"`.

**Operational notes (carried over from Dander — same reasoning applies):**
- `.claude/agents/` and `.claude/workflows/` register only at **session startup**. Files created
  mid-session aren't picked up, so invoke the workflow by **path**
  (`scriptPath: ".claude/workflows/feature.js"`), not by `name: "feature"`, until the session reloads.
- For the same reason, the workflow does **not** hard-depend on the custom agent types. Each stage
  runs on the built-in `general-purpose` agent and *adopts* its role by reading the matching
  `.claude/agents/<role>.md` file, with the model tier passed explicitly.

Subagents can't spawn subagents, so this loop is driven from the top by the workflow — that's why
orchestration lives in a Workflow script, not inside an agent.

## Tickets (`tickets/`)

Local markdown, one file per ticket, git-tracked. Lifecycle:
`open → in-design → in-code → in-review → done` (FAIL sends it back to `in-code`). Format spec in
`tickets/README.md`; skeleton in `tickets/TEMPLATE.md`. Ticket ids are `DRUFF-<n>`.

## Repo map

```
CLAUDE.md                 ← you are here; loads steering + describes the workforce
steering/                 ← binding rules (overview, security, engineering, languages/ — TBD)
.claude/agents/           ← the workforce definitions (code-<stack> not yet added)
.claude/workflows/        ← feature.js orchestration
tickets/                  ← work items (markdown)
.env.example              ← secret KEYS only (real .env is git-ignored) — create once needed
```

## Conventions for any agent working here

- Read the relevant steering before writing code; when steering and a request conflict, surface it.
- Every code change traces to a ticket; the ticket's acceptance criteria are the definition of done.
- Record real product decisions in the Decision Log at the bottom of `steering/00-project-overview.md`.
