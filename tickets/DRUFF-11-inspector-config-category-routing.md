---
id: DRUFF-11
title: Inspector kind-specific config category routing
status: done
component: frontend
epic: node-config
depends_on: [DRUFF-3, DRUFF-6]
created: 2026-07-23
---

## Context

The node inspector (DRUFF-3) renders one of two things for a node's config: the descriptor-driven
`ConnectorConfigForm` for a pre-made connector node (DRUFF-6), or a **generic key/value editor** as
the fallback for everything else. The feature request calls for replacing that flat key/value
fallback with **structured, kind-specific config categories** (HTTP/API settings, Trigger config,
custom-code) grounded in Dander's typed per-node-type config (see
`../dander/src/dander/pipeline/README.md`, "Typed per-node-type config").

Rather than each category ticket bolting its own branch onto the inspector, this ticket establishes
the **config-category routing seam** once: a config-driven resolver that maps a node (its
type/kind/connector) to the config editor(s) it should show, with the generic key/value editor
demoted to the last-resort fallback for an unknown/unmodeled node. It ships that mechanism plus the
existing connector and generic-fallback branches re-expressed through it — no new category yet. The
HTTP (DRUFF-12), Trigger (DRUFF-13), and custom-code (DRUFF-14) categories then plug in as data/
registrations at this seam, independently of one another. This follows the "config-driven over
code-driven" rule in `steering/02-engineering.md`.

## Acceptance Criteria

- [ ] A config-driven resolver maps a selected node to the config category/editor(s) it should
      render, replacing the inspector's hardcoded "connector → form, else generic key/value" branch.
- [ ] Existing behavior is preserved: a pre-made connector node still renders its
      `ConnectorConfigForm` (DRUFF-6), and a node with no matching category still renders the generic
      key/value editor as the explicit fallback.
- [ ] Adding a new config category is a registration/data change at this seam, not a new hardcoded
      branch in the inspector component (demonstrated by the seam's shape, so DRUFF-12/13/14 plug in
      independently).
- [ ] Config edits from any routed category persist to the node's `config` through the store and
      round-trip through save/load (DRUFF-4/5) unchanged.
- [ ] The category-resolution logic is unit-tested with non-sensitive fixtures (see
      `steering/02-engineering.md`).
- [ ] No steering violations (secrets, style, docs).

## Design

### Approach

Today `NodeInspector` hardcodes the config UI as a single ternary: if the node carries a
`connectorId` that resolves to a descriptor, render `ConnectorConfigForm`; otherwise render the
generic `NodeConfigEditor` key/value fallback (`NodeInspector.tsx` lines 47–91). Every future
category (HTTP DRUFF-12, Trigger DRUFF-13, custom-code DRUFF-14) would otherwise bolt another
branch onto that ternary. This ticket extracts the decision into a **config-driven category
registry + a pure resolver**, so adding a category becomes appending one entry to a data array,
not editing the inspector.

The unifying seam is deliberately the **widest common denominator** of the two existing branches:
every category editor receives the full selected `node` and a single `onConfigChange(config)`
callback, and persists by writing the node's `config` back through the store exactly as today
(`updateNodeData(node.id, { config })`). We pass the whole node (not just `config`) because
categories key off different slices of it — connector off `connectorId`, HTTP/custom-code off
`kind`/`type` — and passing the node avoids a prop list that grows with every new category. Because
the write path is byte-identical to the current connector branch (`{ ...currentConfig, ...changes }`
→ `updateNodeData`), persistence and save/load round-trip (DRUFF-4/5) are unchanged — no store,
serializer, or converter code is touched, and this ticket adds **no** new config keys (AC4).

The resolver returns an **ordered list** of matching categories, not a single category, honoring
the AC's "category/editor(s)" wording and letting DRUFF-12/13/14 co-exist on one node (e.g. a
custom-API-connector node could later show both HTTP settings and a custom-code editor) instead of
fighting over a single slot. When no registered category matches, the resolver falls back to the
**generic key/value editor** as the explicit last-resort entry — the fallback guarantee lives
inside the tested resolver function, so "unknown/unmodeled node → generic editor" is a unit
assertion (AC2/AC5). For the state this ticket ships, exactly one category ever matches (connector)
or none (→ generic), so the rendered UI is visually identical to today; the multi-match path exists
in the seam but isn't exercised until a second category registers.

Each category owns its own `matches(node)` predicate, so mutual exclusion (e.g. "a pre-made
connector node shows the connector form, not the raw HTTP editor") is each predicate's
responsibility, and registration order is the tie-break when two predicates both match. The
resolver itself stays dumb: `filter` by `matches`, else fallback.

### Interfaces / modules

**`src/features/pipeline-canvas/inspector/configCategories.ts`** (new) — the seam + registry +
resolver, framework-light so resolution is unit-testable:

```ts
import type { ComponentType } from "react";
import type { Node } from "@xyflow/react";
import type { PipelineNodeData } from "@/lib/pipeline-graph";

/** Uniform seam every category editor is bound to: full node in, full config out. */
export type ConfigCategoryEditorProps = {
  node: Node<PipelineNodeData>;
  /** Persists the node's *entire* config (categories merge onto `node.data.config`, since
   *  `updateNodeData` replaces `config` wholesale — it does not deep-merge). */
  onConfigChange: (config: Record<string, unknown>) => void;
};

export type ConfigCategory = {
  /** Stable id for React keys + tests, e.g. "connector" | "generic" | "http". */
  id: string;
  /** Sub-heading shown only when more than one category co-renders (single-match: hidden). */
  label: string;
  /** Pure, side-effect-free: does this category apply to the node? */
  matches: (node: Node<PipelineNodeData>) => boolean;
  /** Editor rendered for a matched node; may be a `next/dynamic` import (DRUFF-14 Monaco). */
  Editor: ComponentType<ConfigCategoryEditorProps>;
};

/** Ordered registry — DRUFF-12/13/14 each append ONE entry here (a data change, AC3). */
export const CONFIG_CATEGORIES: ConfigCategory[] = [CONNECTOR_CONFIG_CATEGORY];

/** Explicit last-resort fallback; not in the registry — `matches` is unused (kept `() => true`). */
export const GENERIC_CONFIG_CATEGORY: ConfigCategory = { id: "generic", label: "Config", matches: () => true, Editor: GenericConfigCategory };

/**
 * Ordered categories for a node; guarantees non-empty by falling back to the generic editor.
 * `categories`/`fallback` are injectable so the resolution algorithm is testable with fixture
 * categories, independent of the real component registry.
 */
export function resolveConfigCategories(
  node: Node<PipelineNodeData>,
  categories: ConfigCategory[] = CONFIG_CATEGORIES,
  fallback: ConfigCategory = GENERIC_CONFIG_CATEGORY,
): ConfigCategory[] {
  const matched = categories.filter((c) => c.matches(node));
  return matched.length > 0 ? matched : [fallback];
}
```

**`src/features/pipeline-canvas/inspector/categories/ConnectorConfigCategory.tsx`** (new) — the
current connector branch, moved verbatim behind the seam. `matches`:
`node.data.connectorId != null && getConnector(node.data.connectorId) != null` (so a node whose
`connectorId` is unknown to the registry falls through to generic, AC2). Its `Editor` resolves the
descriptor, coerces config to string-keyed via the existing `entriesToConfig(configToEntries(...))`,
runs `validateConnectorConfig`, renders `ConnectorConfigForm`, and writes back with
`onConfigChange({ ...stringConfig, [key]: value })`. Exports `CONNECTOR_CONFIG_CATEGORY`.

**`src/features/pipeline-canvas/inspector/categories/GenericConfigCategory.tsx`** (new) — thin
wrapper: `<NodeConfigEditor config={node.data.config} onChange={onConfigChange} />`
(`NodeConfigEditor`'s `Record<string,string>` onChange is assignment-compatible with
`Record<string, unknown>`). No `matches` of its own — it is only ever the fallback.

**`src/features/pipeline-canvas/inspector/NodeInspector.tsx`** (edit) — replace the `connector ?
… : …` ternary (and its now-dead imports: `getConnector`, `validateConnectorConfig`,
`ConnectorConfigForm`, `NodeConfigEditor`, `configToEntries`/`entriesToConfig`, `stringConfig`) with:

```tsx
const categories = resolveConfigCategories(node);
// … under the existing <Label>Config</Label> section:
{categories.map((category) => (
  // key includes node.id so NodeConfigEditor's local row list remounts per node (as today);
  // includes category.id so a change in the matched set also resets cleanly.
  <div key={`${node.id}:${category.id}`} className="flex flex-col gap-1.5">
    {categories.length > 1 && (
      <p className="text-xs font-medium text-muted-foreground">{category.label}</p>
    )}
    <category.Editor
      node={node}
      onConfigChange={(config) => updateNodeData(node.id, { config })}
    />
  </div>
))}
```

The empty-state / name-field / `<Separator/>` / `<Label>Config</Label>` shell is unchanged. The
`key={node.id}` remount behavior that `NodeConfigEditor`'s doc comment depends on is preserved
(now `${node.id}:${category.id}`).

### Files to touch / create

| File | Change |
|---|---|
| `…/inspector/configCategories.ts` | **New.** `ConfigCategoryEditorProps`, `ConfigCategory`, `CONFIG_CATEGORIES`, `GENERIC_CONFIG_CATEGORY`, `resolveConfigCategories`. |
| `…/inspector/categories/ConnectorConfigCategory.tsx` | **New.** Connector branch behind the seam + `CONNECTOR_CONFIG_CATEGORY` (predicate + Editor). |
| `…/inspector/categories/GenericConfigCategory.tsx` | **New.** Generic key/value fallback editor. |
| `…/inspector/NodeInspector.tsx` | **Edit.** Swap the hardcoded ternary for `resolveConfigCategories(...).map(...)`; drop now-unused imports. |
| `…/inspector/configCategories.test.ts` | **New.** Resolver unit tests (below). |

### Test seams

`resolveConfigCategories` is pure and injectable, so it is tested without rendering (AC5), with
non-sensitive fixtures only (AC's "non-sensitive fixtures"):

- **Algorithm, with fixture categories** (no real components): multiple predicates matching →
  returns all, in registration order; none matching → returns `[fallback]`; order preserved.
- **Against the real registry** (assert on returned `.id`s, no render): a node with a registered
  `connectorId` (`"greenhouse"`) → `["connector"]`; a node with an **unknown** `connectorId` →
  `["generic"]` (AC2 fallback); a plain node with no `connectorId` → `["generic"]`.

The two adapter components are thin pass-throughs over `ConnectorConfigForm` / `NodeConfigEditor`,
which already carry their own component tests; the existing `NodeInspector.test.tsx` continues to
assert the end-to-end connector-vs-generic rendering (extend it if it referenced the old
ternary internals). No network is involved, so nothing new needs mocking (there is no Dander call
on this path).

### Trade-offs

- **List-returning resolver over single-match.** Honors the AC's "editor(s)", removes an artificial
  one-category-per-node cap, and lets DRUFF-12/13/14 register independently without a precedence
  war. Costs a trivially larger render (map vs one element); today the list is always length 1.
- **Fallback inside the resolver** (vs the caller applying it). Puts the "unknown node → generic"
  guarantee in one place that a unit test pins, and keeps `NodeInspector` a dumb `.map`.
- **Seam = full `node` + `onConfigChange(fullConfig)`** rather than the connector form's
  `(key,value)` or a `config`-only prop. Widest common denominator; keeps the single store write
  path (`updateNodeData(id, { config })`) and therefore AC4's round-trip guarantee for free, at the
  cost of each category doing its own `{ ...config, …changes }` merge internally (which the
  connector branch already does — `updateNodeData` replaces `config` wholesale, it does not
  deep-merge).
- **Categories own their `matches`; resolver stays dumb.** Mutual exclusion and precedence live in
  data (predicates + registration order), not in inspector code — the config-driven rule from
  `steering/02-engineering.md`.

### Flags / assumptions for review

- **AC "category/editor(s)" plurality** is read as *possibly many, rendered in order*. If the
  product intent was strictly one editor per node, collapse `resolveConfigCategories` to return the
  first match only — a one-line change — but the multi-shape is the more future-proof reading and is
  what lets 12/13/14 "plug in independently."
- **Multi-section styling is intentionally minimal** (a small sub-heading per category, shown only
  when >1 co-render). Real layout/ordering of stacked categories is deferred to the first ticket
  that actually co-renders two (DRUFF-12), rather than speculatively built here.
- **Precedence between the connector category and DRUFF-12's HTTP category** for `source` nodes is
  DRUFF-12's predicate to define (it should exclude nodes that already carry a `connectorId`);
  called out so DRUFF-12 doesn't accidentally double-render a form for a pre-made connector.

## Implementation Notes

Implemented exactly per Design, no deviations.

- **`src/features/pipeline-canvas/inspector/configCategories.ts`** (new): `ConfigCategoryEditorProps`,
  `ConfigCategory`, `CONFIG_CATEGORIES` (currently `[CONNECTOR_CONFIG_CATEGORY]`),
  `GENERIC_CONFIG_CATEGORY`, and the pure/injectable `resolveConfigCategories(node, categories,
  fallback)` resolver (`filter` by `matches`, else `[fallback]`).
- **`src/features/pipeline-canvas/inspector/categories/ConnectorConfigCategory.tsx`** (new): the
  connector branch moved behind the seam. `matches` is `connectorId != null && getConnector(...) !=
  null` (unknown/stale `connectorId` → no match → falls through to generic, AC2). The editor keeps
  the existing `entriesToConfig(configToEntries(...))` string-coercion and
  `validateConnectorConfig` wiring, writing back via `onConfigChange({ ...stringConfig, [key]:
  value })`. Added a defensive `if (!connector) return null` inside the editor itself (matches
  already guarantees this in the real resolved-from-registry path; kept so a test or future caller
  invoking the editor directly without going through `matches` fails soft rather than throwing on a
  non-null assertion).
- **`src/features/pipeline-canvas/inspector/categories/GenericConfigCategory.tsx`** (new): thin
  pass-through to `NodeConfigEditor`. No `key` prop of its own — `NodeInspector` keys the whole
  category wrapper `div` on `${node.id}:${category.id}`, which already remounts this component (and
  so `NodeConfigEditor`'s local row-list state) on node change.
- **`NodeInspector.tsx`** (edited): dropped the `connector ? ConnectorConfigForm : NodeConfigEditor`
  ternary and its now-unused imports (`getConnector`, `validateConnectorConfig`,
  `ConnectorConfigForm`, `NodeConfigEditor`, `configToEntries`/`entriesToConfig`); Config section is
  now `resolveConfigCategories(node).map(...)`, rendering each category's `Editor` with a
  sub-heading only when more than one category co-renders. The empty-state / name field / Fields
  section / shell are unchanged.
- **`configCategories.test.ts`** (new): algorithm tests against fixture categories (multi-match
  preserves registration order; no-match falls back; never returns empty), plus tests against the
  real registry (known `connectorId` → `["connector"]`; unknown `connectorId` → `["generic"]`;
  no `connectorId` → `["generic"]`). All fixtures are non-sensitive per `steering/02-engineering.md`.
- `NodeInspector.test.tsx` needed no changes — its connector-vs-generic assertions exercise the same
  observable behavior (now routed through the resolver) and passed unmodified.
- Persistence is unchanged: every category writes back through the same
  `updateNodeData(node.id, { config })` call `NodeInspector` already made, so AC4's save/load
  round-trip (DRUFF-4/5) needed no touching.

**Verification:** `pnpm test` (286/286 passed, 26 files), `pnpm typecheck` (clean), `pnpm lint`
(clean), `pnpm format:check` (clean except a pre-existing `README.md` formatting warning, confirmed
present on `main` before this change via `git stash` — unrelated to this ticket, left untouched).

## Review Log

_Append-only. PR-Review adds entries below._

### 2026-07-23 — PASS

Reviewed the implemented seam (`configCategories.ts`, `categories/ConnectorConfigCategory.tsx`,
`categories/GenericConfigCategory.tsx`), the `NodeInspector.tsx` edit, and the tests
(`configCategories.test.ts`, `NodeInspector.test.tsx`) against the acceptance criteria, design, and
steering.

Acceptance criteria — all met:
- **AC1** — The hardcoded "connector → form, else generic" ternary is gone; `NodeInspector` now
  renders `resolveConfigCategories(node).map(...)`, a pure config-driven resolver over the
  `CONFIG_CATEGORIES` registry. Verified in `NodeInspector.tsx` (lines 48, 73–86) and
  `configCategories.ts`.
- **AC2** — Behavior preserved: a registered `connectorId` routes to `ConnectorConfigForm`; an
  unknown/absent `connectorId` falls through to the generic key/value editor. The connector
  predicate (`connectorId != null && getConnector(...) != null`) and the resolver's `[fallback]`
  branch enforce this, and it is pinned by both resolver tests and the still-passing
  `NodeInspector.test.tsx` end-to-end assertions.
- **AC3** — Adding a category is a one-line append to `CONFIG_CATEGORIES` with a `matches`
  predicate; the resolver stays dumb (`filter` else fallback) and returns an ordered list, so
  DRUFF-12/13/14 plug in as data/registrations without editing the inspector.
- **AC4** — Every category persists via the identical `updateNodeData(node.id, { config })` write
  path; no store/serializer/converter code touched, no new config keys. Persistence and the
  connector-edit round-trip are covered by `NodeInspector.test.tsx`.
- **AC5** — `resolveConfigCategories` is unit-tested pure/injectable (fixture-category algorithm
  cases: multi-match order, no-match fallback, never-empty) and against the real registry
  (known/unknown/absent `connectorId`). Fixtures are non-sensitive (key-ref names with empty
  values, no real secrets).
- **AC6** — No steering violations: no hardcoded secrets in the diff; exported types/components are
  annotated and TSDoc'd; feature-grouped structure; interface-first seam per
  `steering/02-engineering.md`.

Verification reproduced locally: `pnpm typecheck` clean, `pnpm lint` clean, `pnpm test` 286/286
passing (26 files). `pnpm format:check` flags only `README.md`, which I confirmed is pre-existing on
`HEAD` and untouched by this ticket's diff — not a blocking issue.

No blocking issues. Verdict: **PASS**.
