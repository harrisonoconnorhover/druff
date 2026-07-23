---
description: Run the multi-agent feature workflow (product → design → code → review) on a plain-English request
argument-hint: <describe the feature in plain English>
---
This is an explicit request to run the Druff agentic `feature` workflow.

Invoke the **Workflow** tool with `scriptPath: ".claude/workflows/feature.js"` (invoke by path, not
by `name` — see the operational notes in `CLAUDE.md`) and pass the feature request below verbatim as
`args`. Let it run in the background, then when it completes, **independently verify** the result
(read the ticket + diff, and run whatever this project's lint/typecheck/test commands are once the
stack is chosen) before reporting — do not just relay the agents' self-report.

Feature request:
$ARGUMENTS
