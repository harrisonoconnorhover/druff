# TypeScript / React Conventions

Primary application language. Read alongside `01-security.md` and `02-engineering.md`.

## Toolchain (pinned)

- **Node 22+**, **pnpm** for package management (`pnpm install`, `pnpm dev`, …). Lockfile committed.
- **Next.js (App Router)** + **React** + **TypeScript strict mode**.
- **React Flow (`@xyflow/react`)** for the pipeline canvas — custom node/edge components, not the
  defaults, once a node kind needs more than a label.
- **Tailwind CSS + shadcn/ui** (Radix primitives) for styling/components.
- **Zustand** for canvas/app state — not Redux; it's React Flow's own recommended pairing.
- **Zod** for runtime validation at boundaries (API responses, anything crossing the Dander
  contract) — the TypeScript analogue of Dander's Pydantic-at-the-boundary rule.
- **Monaco Editor** (`@monaco-editor/react`) for embedded code widgets (Python/SQL modes).
- **ESLint** (`eslint-config-next`) + **Prettier** for lint/format — kept as two tools rather than
  one (e.g. Biome) because Next.js-specific rules (App Router conventions, `<Image>` usage,
  exhaustive-deps) aren't fully covered by the alternatives yet.
- **Vitest + React Testing Library** for unit/component tests; **Playwright** for e2e — drag/drop
  and canvas-connection interactions don't work reliably under jsdom, so anything exercising real
  pointer/drag behavior on the canvas is a Playwright test, not a unit test.
- CI runs: `eslint` → `prettier --check` → `tsc --noEmit` → `vitest run` → (`playwright test`
  where applicable). All must pass.

## Code style

- 2-space indent, Prettier-enforced formatting, PascalCase components, camelCase functions/vars,
  UPPER_SNAKE constants.
- **Type-annotate everything exported** — component props, hook return types, function signatures.
  No bare `any` without a comment justifying it (mirrors Dander's no-bare-`Any` rule).
- Functional components + hooks only; no class components.
- **Zod schemas** at every boundary that receives external data (Dander API responses, imported
  YAML/JSON graphs) — parse, don't just cast.
- Small, focused components; push side effects into hooks. Dependency-inject API clients (via
  props or context) so components/hooks are testable without a real network call.
- Explicit error handling; never swallow a rejected promise silently. Never log secrets, tokens,
  or Dander row-level data (see `01-security.md`).
- No side effects at module scope.

## Structure

- Group by feature/domain, not by type: e.g. `src/features/pipeline-canvas/` (the React Flow
  canvas, one file per custom node kind — source/custom-api/transform/write/trigger — and per
  custom edge kind), `src/features/connector-library/` (saved custom connectors), `src/lib/`
  (Zustand stores, the Dander API client, Zod schemas for the pipeline-graph contract).
- `'use client'` at the boundary where browser interactivity actually starts (the canvas and
  anything stateful); keep everything above that a Server Component by default.
- One component per file where reasonable. Colocate a component's tests next to it.

## Documentation

- **TSDoc comments** on every exported component, hook, and function — document **why**, not what
  the code obviously does: invariants, units, edge cases (same philosophy as Dander's Google-style
  docstrings).

  ```ts
  /**
   * Resolves a node's declared field schema against the live Dander graph, so the canvas can flag
   * a field-mapping that points at a field the source node no longer exposes.
   */
  function resolveNodeFields(node: PipelineNode, graph: PipelineGraph): FieldSchema[] { ... }
  ```

- READMEs per top-level feature directory explaining its role and how it plugs into the module
  map in `00-project-overview.md`.
- No aspirational docs for unbuilt node kinds — mark clearly as planned if described ahead of code.
