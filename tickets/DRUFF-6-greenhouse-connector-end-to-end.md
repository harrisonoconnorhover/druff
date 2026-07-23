---
id: DRUFF-6
title: Greenhouse pre-made connector, end-to-end
status: done
component: frontend
epic: connectors
depends_on: [DRUFF-2, DRUFF-3]
created: 2026-07-22
---

## Context

Before building N pre-made connectors, prove the "config-driven form" pattern once, end-to-end. Per
the "Pre-made connectors" module in `steering/00-project-overview.md`, a connector is a config-
driven node type: a declarative descriptor of its known config shape, rendered as a form — no code.
This ticket adds Greenhouse as a source connector: a palette entry (DRUFF-2) that drops a
Greenhouse source node, whose inspector (DRUFF-3) renders a form driven by a declarative descriptor
of Greenhouse's config fields. Per `steering/00-project-overview.md`, Druff never executes the
connector — it only authors/stores config. Per `steering/01-security.md`, any secret (e.g. an API
key) is a config *key* only; no real secret value is stored in code, fixtures, or committed state.

## Acceptance Criteria

- [ ] A declarative connector descriptor defines the Greenhouse source's config fields (label,
      field key, type, required, help text) — data, not hardcoded JSX per field.
- [ ] Greenhouse appears in the palette and drops a source node identifiable as the Greenhouse
      connector.
- [ ] Selecting a Greenhouse node renders its config form from the descriptor in the inspector, and
      edits persist to the node's `config` in the store and round-trip through save/load (DRUFF-4/5).
- [ ] Required-field validation from the descriptor surfaces in the form (actionable, not a crash).
- [ ] No real secret/API-key value appears in code, fixtures, or committed state; any credential is
      represented as a config key only (see `steering/01-security.md`).
- [ ] The descriptor-to-form mapping and any validation logic are unit-tested with non-sensitive
      fixtures (see `steering/02-engineering.md`).
- [ ] No steering violations (secrets, style, docs).

## Design

### Approach

Greenhouse is the first *pre-made connector*, so this ticket's real job is to establish the
**config-driven connector pattern** once — a declarative descriptor rendered into a form — with
Greenhouse as its single concrete instance. Everything connector-specific is **data**
(`ConnectorDescriptor`), and everything generic is a **small reusable engine** (a registry, a pure
validator, a descriptor-driven form). Adding connector #2..N later is then "add a descriptor file +
one registry entry," not new components. This directly serves the config-driven rule in
`02-engineering.md` and the "Pre-made connectors … a form over each connector's known config shape,
no code" module in `00-project-overview.md`.

The connector's config is stored on the node's `config` object (the same `config` DRUFF-4 serializes
into Dander's on-disk node shape) and round-trips through save/load unchanged — the descriptor never
participates in serialization, it only *drives the editing UI and validation* of the plain
`config` record. A Greenhouse node is a normal `source` node distinguished by a `connectorId`
carried on its React Flow node `data`; on serialization that `connectorId` maps to Dander's node
`type`, so the node reloads as Greenhouse.

**Security is a first-class design constraint here.** Greenhouse authenticates with a Harvest API
key — a secret. Per `01-security.md`, Druff never stores that secret value: the descriptor marks the
field as a `secret` *reference*, and the stored `config` value is only the **name/handle** of where
the secret lives (a Secret-Manager key name / env key that Dander resolves at run time), never the
key itself. Because Druff itself never holds or uses this secret, **no `.env.example` entry is
required** (that rule is for secrets *Druff* consumes). No default, fixture, or committed graph ever
carries a real key.

New owned code lives in a new feature directory `src/features/connector-library/` (per the
group-by-feature structure and the "saved connectors" directory named in `typescript.md`). The
palette, inspector, store node-factory, and graph converter are **consumers** of this library and
belong to DRUFF-2/3/1/4; this ticket defines the small contract each must honor and extends them at
those seams (see Integration below).

### Modules / components

**Owned by this ticket (new, in `src/features/connector-library/`):**

- `descriptors/types.ts` — the descriptor contract + Zod schemas:
  - `ConnectorFieldType = "text" | "secret"` (the two Greenhouse needs). `number | boolean | select`
    are the **documented extension seam** — added when a connector first needs them, alongside the
    matching shadcn primitive; do not build them speculatively.
  - `ConnectorFieldDescriptor = { key: string; label: string; type: ConnectorFieldType; required:
    boolean; help?: string; placeholder?: string }`.
  - `ConnectorDescriptor = { id: string; name: string; kind: "source"; danderType: string; icon?:
    LucideIcon; fields: ConnectorFieldDescriptor[] }`. `id` is Druff's palette/registry key
    (`"greenhouse"`); `danderType` is the string written to Dander's node `type` on save and matched
    on load (see the flag below).
  - Zod schemas `ConnectorDescriptorSchema` etc. parse descriptors so a malformed/hand-edited
    descriptor fails loud at boundary rather than rendering a broken form.
- `descriptors/greenhouse.ts` — the Greenhouse descriptor **as data**. Representative, non-sensitive
  fields: `harvest_api_key_ref` (`secret`, required — "Reference/handle of the secret holding the
  Greenhouse Harvest API key; the key itself is never stored in Druff"), `base_url` (`text`,
  optional, placeholder `https://harvest.greenhouse.io/v1`), `on_behalf_of` (`text`, optional). No
  field carries a real value; `secret` fields have no default.
- `registry.ts` — `CONNECTOR_REGISTRY: Record<string, ConnectorDescriptor>` keyed by `id`, plus pure
  lookups: `getConnector(id)`, `getConnectorByDanderType(type)`, `listConnectors()`. This is the one
  place the palette and the converter read from — the seam that makes "add a connector" a data edit.
- `defaultConfig.ts` — `defaultConfigForDescriptor(descriptor): Record<string, string>`: pure,
  returns an entry per field seeded to `""` (or `placeholder`-independent empty). Guarantees a
  dropped node has a fully-keyed `config` and that **no secret gets a default value**.
- `validateConnectorConfig.ts` — `validateConnectorConfig(descriptor, config):
  Record<fieldKey, string>`: pure, framework-free. For each `required` field whose value is
  missing/blank, returns `"{label} is required."`. Empty object ⇒ valid. This is the "actionable, not
  a crash" validation the form consumes. Kept pure so it unit-tests with no DOM.
- `ConnectorConfigForm.tsx` (`'use client'`) — the **descriptor-driven form**. Props:
  `{ descriptor: ConnectorDescriptor; config: Record<string, string>; errors: Record<string,string>;
  onChange: (key: string, value: string) => void }`. Renders one row per descriptor field via a
  small `type → control` dispatch (both `text` and `secret` render a shadcn `Input`; `secret`
  additionally shows a "reference, not the secret" hint and is *not* masked, since it is not a
  secret value). Sets `aria-invalid` + an inline message from `errors`. Pure presentational +
  controlled — no store access, no local state that can drift (satisfies DRUFF-3's "driven by the
  store" rule). Field JSX is generic; the per-field *content* comes entirely from the descriptor.
- `README.md` — role of the feature dir and how it plugs into the "Pre-made connectors" module
  (per the per-feature-README convention).

**Consumed / extended at their seams (belong to dependency tickets):**

- `nodes/PipelineNode.tsx` (DRUFF-2 already must touch this for `trigger`) — extend
  `PipelineNodeData` with `connectorId?: string`; when set, render the connector's `name`/icon
  from the registry so a Greenhouse node is visually identifiable. `kind` stays `"source"`.
- Palette (DRUFF-2) — list `listConnectors()` as pre-made **source** entries (Greenhouse among
  them) in addition to the generic kinds. A palette item carries `{ kind: "source", connectorId }`.
- Store node-factory (DRUFF-1/2) — when creating a node from a palette item that has a
  `connectorId`, set `data.connectorId` and seed `config` via `defaultConfigForDescriptor`.
- Inspector (DRUFF-3) — when the selected node has a `connectorId`, resolve its descriptor from the
  registry, run `validateConnectorConfig`, and render `ConnectorConfigForm` instead of the generic
  key/value editor; `onChange` writes back through the store's `updateNodeData` (so edits are
  store-driven and live on the canvas).
- Graph converter (DRUFF-4) — canvas→graph: `node.type = getConnector(connectorId).danderType`;
  graph→canvas: `connectorId = getConnectorByDanderType(node.type)?.id`. `config` passes through
  untouched. This is what makes the Greenhouse node survive save/load round-trip.

### Data flow

Palette drag (`{kind:"source", connectorId:"greenhouse"}`) → store node-factory builds a `source`
node with `data.connectorId` + `config = defaultConfigForDescriptor(greenhouse)` → canvas shows a
Greenhouse node (PipelineNode reads registry for name/icon) → select it → inspector resolves
descriptor, renders `ConnectorConfigForm` bound to `node.data.config` → edit a field → `onChange`
→ store `updateNodeData` → re-render with fresh `errors` from `validateConnectorConfig`. Save
(DRUFF-5) → converter (DRUFF-4) writes `config` verbatim + `type = danderType`. Load → inverse.

### Files to touch / create

Create:
- `src/features/connector-library/descriptors/types.ts`
- `src/features/connector-library/descriptors/greenhouse.ts`
- `src/features/connector-library/registry.ts`
- `src/features/connector-library/defaultConfig.ts`
- `src/features/connector-library/validateConnectorConfig.ts`
- `src/features/connector-library/ConnectorConfigForm.tsx`
- `src/features/connector-library/validateConnectorConfig.test.ts`
- `src/features/connector-library/defaultConfig.test.ts`
- `src/features/connector-library/registry.test.ts`
- `src/features/connector-library/ConnectorConfigForm.test.tsx`
- `src/features/connector-library/README.md`

Touch (at the seams above; each is really a small extension of its own ticket's code):
- `src/features/pipeline-canvas/nodes/PipelineNode.tsx` (add `connectorId?`, registry-driven label/icon)
- palette component (DRUFF-2), node-factory (DRUFF-1/2), inspector (DRUFF-3), graph converter (DRUFF-4)

### Test seams

- **Pure, unit-tested (Vitest, no DOM):** `validateConnectorConfig` (required blank/present/whitespace
  cases), `defaultConfigForDescriptor` (one key per field, secret has no default), `registry` lookups
  (`getConnector`, `getConnectorByDanderType` round-trip for Greenhouse), and the Zod descriptor
  parse. Fixtures are non-sensitive (fabricated reference strings like `"my-greenhouse-key-ref"`,
  never a real key). This is the "descriptor-to-form mapping and validation logic" the AC requires.
- **Component-tested (RTL/jsdom):** `ConnectorConfigForm` renders exactly one control per descriptor
  field, shows the required-error message when `errors` is populated, and calls `onChange(key,value)`
  on input — no store, no network.
- **e2e (Playwright, per `typescript.md`):** drag Greenhouse from palette → node appears → edit
  config → reload → config persists. Drag/drop + real canvas interaction don't run under jsdom, so
  the end-to-end round-trip is a Playwright test, not a unit test.
- No network anywhere (Druff never calls Greenhouse — it only authors config).

### Trade-offs

- **`connectorId` on `data` + `danderType` mapping** vs. reusing `node.type` directly as the
  connector id: kept them separate because `type` is Dander's on-disk key (DRUFF-4) and its exact
  connector-type string is owned by Dander, whereas `id` is Druff's stable internal/palette key. The
  registry is the single translation point, so if Dander's naming differs we change one field.
- **`secret`-as-reference** vs. a masked password input holding the real key: chose reference-only
  because storing/masking a real key would violate `01-security.md` the moment it round-trips to
  localStorage/exported files. A reference is safe to persist and matches Dander's run-time
  secret-resolution model. Cost: the user must have provisioned the secret out-of-band; acceptable,
  and the help text says so.
- **`text | secret` only** vs. a full field-type system now: limited to what Greenhouse needs to
  avoid speculative generality (`02-engineering.md`); the dispatch and descriptor union are the
  explicit seams for `number/boolean/select` when a real connector requires them.
- **Descriptor as data with a Zod guard** vs. plain object: the Zod parse costs a few lines but
  fails loud on a malformed descriptor at the boundary, per the parse-don't-cast rule.

### Flags / assumptions for the Code agent

- **`danderType` value is unconfirmed.** The exact string Dander uses for a Greenhouse source
  connector `type` is not knowable from this repo (the Dander contract is still TODO in
  `00-project-overview.md`). Pick a clearly-marked placeholder (e.g. `"connector.greenhouse"`),
  centralize it on the descriptor, and leave a `TODO` referencing the Dander-contract decision so it
  is a one-line change once confirmed. Round-trip tests should assert *symmetry* (id→type→id), not a
  hard-coded Dander string.
- **Depends on DRUFF-2/3/4 seams that don't exist yet.** If those tickets land after this one, the
  connector-library modules (descriptor, registry, validator, form) are fully implementable and
  testable in isolation now; the four seam-edits (palette/factory/inspector/converter) must be made
  against whatever interfaces those tickets actually ship — reconcile at build time rather than
  guessing divergent APIs.
- **Greenhouse field set is representative, not authoritative.** The three fields prove the pattern;
  refine against Dander's actual Greenhouse connector config shape when the contract is defined —
  it's a data-only edit to `greenhouse.ts`.

## Implementation Notes

Implemented as designed. New feature dir `src/features/connector-library/`:

- `descriptors/types.ts` — `ConnectorFieldType`/`ConnectorFieldDescriptor`/`ConnectorDescriptor` +
  Zod schemas (`ConnectorFieldTypeSchema`/`ConnectorFieldDescriptorSchema`/`ConnectorDescriptorSchema`).
  `icon` is validated with `z.custom` (present-or-absent only) since a React component reference
  isn't itself serialized data.
- `descriptors/greenhouse.ts` — `GREENHOUSE_CONNECTOR`: `harvest_api_key_ref` (`secret`, required),
  `base_url`/`on_behalf_of` (`text`, optional). `danderType: "connector.greenhouse"` is a marked
  `TODO(dander-contract)` placeholder per the ticket's flag; round-trip tests assert id→type→id
  symmetry, not this literal string. Icon: `lucide-react`'s `Briefcase`.
- `registry.ts` — `CONNECTOR_REGISTRY` + `getConnector`/`getConnectorByDanderType`/`listConnectors`.
- `defaultConfig.ts` — `defaultConfigForDescriptor` (one `""` per field key; no secret default).
- `validateConnectorConfig.ts` — pure required-field validator, `{field.label} is required.`.
- `ConnectorConfigForm.tsx` — descriptor-driven form; `text`/`secret` both render an unmasked
  `Input` (a `secret` field holds a reference, not the real value) with a "reference, not the
  secret value" hint on `secret` fields, `aria-invalid`/inline error wiring, help text.
- `README.md` — role + how DRUFF-2/3/4/1 plug in.
- Tests: `defaultConfig.test.ts`, `validateConnectorConfig.test.ts`, `registry.test.ts` (includes
  the Zod parse test seam), `ConnectorConfigForm.test.tsx`.

Seam changes in already-built DRUFF-1..5 code (per this ticket's "Files to touch" list; the actual
shipped code differs in file/function names from the Design's assumptions, reconciled at build
time as the Design's own "Flags/assumptions" note anticipated):

- `src/lib/pipeline-graph/canvas-types.ts` — added `PipelineNodeData.connectorId?: string`.
- `src/lib/pipeline-graph/canvas-convert.ts` — `nodeToGraphNode` writes
  `getConnector(connectorId)?.danderType ?? data.type` as the graph `type` (falls back to `data.type`
  if the id doesn't resolve, so a node never silently loses its type); `graphNodeToCanvasNode`
  re-derives `connectorId` via `getConnectorByDanderType(node.type)`.
- `src/features/pipeline-canvas/nodes/createNode.ts` — added an optional 4th `connectorId` param;
  when it resolves to a registered connector, seeds `data.connectorId` + `config` via
  `defaultConfigForDescriptor`. An unknown `connectorId` is ignored (degrades to a plain node)
  rather than thrown on.
- `src/features/pipeline-canvas/nodes/PipelineNode.tsx` — when `data.connectorId` resolves, swaps
  in the connector's icon and shows its `name` (e.g. "Greenhouse") as the subtitle in place of the
  generic kind label; accent color still comes from `kind`.
- `src/features/pipeline-canvas/NodePalette.tsx` — the native-DnD payload on `DND_MIME` is now JSON
  (`PaletteDragPayload = { kind; connectorId? }`, via new `encodePaletteDragPayload`/
  `parsePaletteDragPayload`, replacing the old bare-kind-string payload) so a connector entry can
  carry its id alongside `kind`. Added a "Connectors" section listing `listConnectors()`.
- `src/features/pipeline-canvas/PipelineCanvas.tsx` — `onDrop` now decodes via
  `parsePaletteDragPayload` and passes `payload.connectorId` through to `createNode`.
- `src/features/pipeline-canvas/inspector/NodeInspector.tsx` — when the selected node's
  `connectorId` resolves, renders `ConnectorConfigForm` (config coerced to `Record<string,string>`
  by reusing `nodeConfig.ts`'s already-tested `configToEntries`/`entriesToConfig`, per "reuse before
  inventing") instead of the generic `NodeConfigEditor`; `onChange` merges the single changed key
  back through `updateNodeData`.

Deviations from the Design doc (reconciling against the actual DRUFF-1..5 shipped shapes, not
divergent choices):
- The Design's palette drag data was a bare kind string; extending it to carry `connectorId` meant
  switching the `DND_MIME` payload to JSON. `parsePaletteDragPayload` returns `null` for anything
  malformed/foreign, matching the old `isPipelineNodeKind` guard's fail-safe behavior.
- `NodeInspector`'s title (`{kindLabel} node`) was left unchanged for a connector node — the Design
  only specified swapping the Config section, not the header, so that's exactly what changed.

Test/tooling results (all clean):
- `pnpm exec eslint …` — no issues.
- `pnpm exec tsc --noEmit` — no errors.
- `pnpm exec vitest run` — 16 files, 134 tests, all passing (includes every new/extended test file
  listed above plus the extended `NodeInspector.test.tsx`/`createNode.test.ts`/
  `canvas-convert.test.ts` seam tests and a new `NodePalette.test.ts` for the drag-payload codec).
- `pnpm exec prettier --check .` — clean except a pre-existing, untouched root `README.md` (not
  part of this ticket's scope).
- `pnpm exec playwright test` — 4/4 passing, including a new `e2e/greenhouse-connector.spec.ts`
  covering the Design's called-out round trip (drag Greenhouse → node appears → edit config →
  reload → config persists), using only a fixture reference string, never a real secret. Also
  updated the two pre-existing `getByText("Greenhouse")` assertions in `e2e/pipeline-canvas.spec.ts`
  to a `.react-flow__node`-scoped locator, since the palette's new Greenhouse entry made the old
  unscoped text query ambiguous (Playwright strict-mode).

No secrets anywhere: `harvest_api_key_ref`'s only values in code/tests/fixtures are fabricated
reference strings (e.g. `"my-greenhouse-key-ref"`); no `.env.example` entry was added, per the
Design's rationale (Druff never holds or uses this secret itself).

### Addendum fixes (2026-07-22)

Both blocking review items addressed:

1. `src/lib/pipeline-graph/canvas-convert.ts`, `graphNodeToCanvasNode` — `kind` is now derived as
   `connector?.kind ?? kindForType(node.type)`: when the node's `type` resolves to a registered
   connector (via the same `getConnectorByDanderType` lookup already used for `connectorId`), the
   connector's own declared `kind` wins; `kindForType`/`TYPE_TO_KIND` now only run as the fallback
   for a `type` that doesn't match any registered connector. A Greenhouse node dropped as
   `kind: "source"` now reloads as `kind: "source"` — `PipelineNode`'s accent and
   `NodeInspector`'s "Source node" header are correct after save/load round-trip.
2. `src/lib/pipeline-graph/canvas-convert.test.ts`, "re-derives connectorId from a graph node's
   type matching a registered connector" — added an assertion that the round-tripped Greenhouse
   node's `data.kind` equals `GREENHOUSE_CONNECTOR.kind` ("source"), so a regression back to the
   `kindForType`-only derivation fails this unit test rather than only being observable visually
   after a manual reload.

Verified clean after the fix: `pnpm exec eslint .`, `pnpm exec tsc --noEmit`,
`pnpm exec prettier --check src/lib/pipeline-graph/canvas-convert.ts
src/lib/pipeline-graph/canvas-convert.test.ts` (repo-wide prettier still clean except the
pre-existing, out-of-scope root `README.md`), `pnpm exec vitest run` (16 files / 134 tests, all
passing — the addendum added an assertion to an existing test rather than a new test case), and
`pnpm exec playwright test` (4/4 passing, including the existing
`e2e/greenhouse-connector.spec.ts` round-trip).

## Review Log

_Append-only. PR-Review adds entries below._

### 2026-07-22 — FAIL

Strong implementation of the config-driven connector pattern: the descriptor contract + Zod guard,
registry, pure `defaultConfigForDescriptor`/`validateConnectorConfig`, and the descriptor-driven
`ConnectorConfigForm` are clean, well-typed, well-documented, and genuinely unit-tested with
non-sensitive fixtures. Security is sound — `harvest_api_key_ref` is a reference-only `secret`, no
real key value anywhere in code/tests/fixtures, no `.env.example` entry needed (Druff never holds
the secret). `tsc`, `eslint`, and `vitest` (16 files / 134 tests) all pass locally.

One blocking defect: the connector node's `kind` is corrupted on save/load round-trip, so a node
dropped as a `source` connector comes back as a `transform`. This contradicts AC #2 ("drops a
**source** node identifiable as the Greenhouse connector") and AC #3 ("round-trip through
save/load"), and it violates the Design's own stated invariant ("accent color still comes from
`kind` — a connector is always a specific kind"). Details + fix in the addendum.

**Addendum (blocking):**

1. `src/lib/pipeline-graph/canvas-convert.ts`, `graphNodeToCanvasNode` (~line 135) — on load, a
   connector node's `kind` is still derived with `kindForType(node.type)`. But the connector's
   `type` on disk is its `danderType` (`"connector.greenhouse"`), which is **not** a key in
   `TYPE_TO_KIND`, so it falls through to `DEFAULT_NODE_KIND` (`"transform"`). Net effect: a
   Greenhouse node created as `kind: "source"` (via `createNode`, from `connector.kind`) reloads as
   `kind: "transform"`. Observable regressions after a reload/round-trip:
   - `PipelineNode` renders the **transform** accent border instead of the source accent
     (`NODE_KINDS[data.kind].accent`).
   - `NodeInspector`'s header reads **"Transform node"** instead of "Source node"
     (`NODE_KINDS[node.data.kind].label`, line 46/55).
   The node is therefore no longer a "source node" after the round trip. Fix: when the connector
   resolves, derive `kind` from it — e.g.
   `kind: connector?.kind ?? kindForType(node.type)` — so a recognized connector keeps its declared
   kind and only unknown types fall back to the `TYPE_TO_KIND` table.

2. `src/lib/pipeline-graph/canvas-convert.test.ts`, "re-derives connectorId from a graph node's
   type…" (line ~150) — this test asserts only `data.connectorId`, never `data.kind`, which is why
   the defect in (1) slipped through. Add an assertion that the round-tripped Greenhouse node keeps
   `kind: "source"` (matching `GREENHOUSE_CONNECTOR.kind`). The e2e spec likewise only checks the
   icon/name subtitle text, so it does not cover this either — a unit assertion is the right guard.

### 2026-07-22 — PASS

Re-review after the addendum fixes. Both blocking items from the prior FAIL are resolved and
verified against the actual code:

1. `canvas-convert.ts` `graphNodeToCanvasNode` (line 141) now derives
   `kind: connector?.kind ?? kindForType(node.type)` — a recognized connector keeps its declared
   `kind`, and only an unregistered `type` falls back to the `TYPE_TO_KIND` table. A Greenhouse
   node dropped as `source` now reloads as `source`, so AC #2 ("source node identifiable as the
   Greenhouse connector") and AC #3 (round-trip) hold, and the Design's "accent comes from `kind`"
   invariant survives save/load.
2. `canvas-convert.test.ts` (line 173) adds the regression assertion
   `data.kind === GREENHOUSE_CONNECTOR.kind` to the round-trip test, so a regression back to the
   `kindForType`-only derivation now fails a unit test rather than only surfacing after a manual
   reload.

Full re-verification of every acceptance criterion:
- **AC1 (declarative descriptor):** `descriptors/greenhouse.ts` is pure data (label/key/type/
  required/help/placeholder per field); `descriptors/types.ts` holds the contract + Zod guard.
  No per-field JSX.
- **AC2 (palette + identifiable source node):** `NodePalette.tsx` lists `listConnectors()` in a
  Connectors section; `createNode` seeds `connectorId` + default config with `kind` unchanged;
  `PipelineNode.tsx` swaps in the connector icon/name while accent stays keyed to `kind`.
- **AC3 (form from descriptor + persist + round-trip):** `NodeInspector.tsx` renders
  `ConnectorConfigForm` for a connector node and writes edits through `updateNodeData`;
  `canvas-convert.ts` maps `connectorId → danderType` on save and back (incl. the now-fixed `kind`)
  on load, `config` passing through verbatim.
- **AC4 (required-field validation, actionable):** pure `validateConnectorConfig` returns
  `"{label} is required."` for blank/whitespace/missing required fields; the form wires
  `aria-invalid` + an inline error message, no crash path.
- **AC5 (no real secret):** grep of the whole feature dir + e2e spec finds only fabricated
  references (`my-greenhouse-key-ref`) and a Secret-Manager-style path
  (`projects/test-project/secrets/…-fixture`); `harvest_api_key_ref` is a reference-only `secret`
  with no default; no `.env.example` entry needed (Druff never holds the secret).
- **AC6 (unit tests, non-sensitive fixtures):** `validateConnectorConfig.test.ts`,
  `defaultConfig.test.ts`, `registry.test.ts` (incl. the Zod parse seam), `ConnectorConfigForm.test.tsx`
  (one control per field, required-error render, `onChange(key,value)`, secret not `type=password`).
- **AC7 (no steering violations):** feature-grouped structure, TSDoc on exports, Zod at the
  descriptor boundary, no swallowed errors, no client-side secret/PII logging.

Tooling re-run locally, all clean: `tsc --noEmit` (no errors), `eslint .` (no issues),
`vitest run` (16 files / 134 tests passing, including the new `data.kind` regression assertion),
`prettier --check` on all touched/new files (clean). All acceptance criteria met, no blocking
issues — status set to `done`.
