---
id: DRUFF-4
title: Pipeline-graph model and canvas serialization
status: done
component: frontend
epic: graph-io
depends_on: [DRUFF-1]
created: 2026-07-22
---

## Context

Save/load and the source-view toggle (DRUFF-5) must round-trip a graph in Dander's actual
pipeline-graph shape — top-level `name` + `nodes[]` + `edges[]`, where a node is
`id`/`type`/`name`/`config`/`fields[]` and an edge is `from`/`to`/`mappings[]`/`join` (see Dander's
`src/dander/pipeline/README.md`, and the "Contract with Dander" note in
`steering/00-project-overview.md`). This ticket defines the TypeScript types mirroring that shape
and the pure converters between the canvas store's React Flow nodes/edges (DRUFF-1) and a Dander
`PipelineGraph`, plus YAML/JSON encode/decode. It is the data-layer seam; the UI that uses it lands
in DRUFF-5. This is a UI/authoring representation only — no execution (a non-goal in
`00-project-overview.md`).

## Acceptance Criteria

- [ ] TypeScript types mirror Dander's on-disk pipeline-graph shape (graph `name`/`nodes`/`edges`;
      node `id`/`type`/`name`/`config`/`fields`; edge `from`/`to`/`mappings`/`join`), using the
      on-disk key names (`from`/`to`, not `source`/`target`).
- [ ] A converter turns the canvas store's nodes/edges into a `PipelineGraph`, and an inverse
      converter loads a `PipelineGraph` into canvas nodes/edges.
- [ ] Encode/decode to both YAML and JSON is supported and byte-for-shape round-trips (decode ∘
      encode is identity for a representative graph).
- [ ] Canvas ⇄ graph conversion round-trips for a representative graph (positions and app-only
      fields are handled deliberately, documented either way).
- [ ] Converters are pure and unit-tested end-to-end (canvas → graph → YAML/JSON → graph → canvas)
      with fixtures carrying no real/sensitive data (see `steering/01-security.md`,
      `steering/02-engineering.md`).
- [ ] No steering violations (secrets, style, docs).

## Design

### Approach

This ticket is the **data-layer seam** between two representations that must never leak into each
other: Dander's on-disk `PipelineGraph` (the contract in `steering/00-project-overview.md` →
"Contract with Dander") and the canvas's React Flow `Node[]`/`Edge[]` owned by the DRUFF-1 store.
It ships as a small, self-contained `src/lib/pipeline-graph/` module of **pure functions and types**
— no React, no store access, no network — so DRUFF-5 (save/load + source view) can compose it and
unit tests can exercise it end-to-end without rendering.

Four concerns, kept as separate files behind one barrel:

1. **Types = the on-disk shape, defined once via Zod.** Per `languages/typescript.md`, imported
   YAML/JSON crosses the Dander contract boundary, so it is *parsed, not cast*. We define Zod
   schemas that mirror Dander's shape exactly (verified against Dander's
   `src/dander/pipeline/README.md`) and derive the TypeScript types with `z.infer`. One source of
   truth for both runtime validation and static types. **On-disk key names are authoritative:**
   edges use `from`/`to` (not `source`/`target`), and the module works in on-disk shape throughout
   — there is no separate "Druff-internal" renaming of edge endpoints.

2. **Encode/decode YAML+JSON.** `encodeGraph(graph, format)` / `decodeGraph(text, format)` over a
   `GraphFormat = "yaml" | "json"`. Encode emits **Dander-canonical form**: `from`/`to` keys,
   `config` (never `params`), and `join` **omitted entirely when absent** (not `null`) so join-less
   edges match Dander byte-for-shape. Decode runs the text through `JSON.parse` / the YAML parser
   and then the Zod schema, which (a) applies Dander's documented defaults (`config: {}`,
   `fields: []`, `nullable: true`, `metadata: {}`, `description: null`, transformation
   `kind: "direct"`), (b) accepts `params` as an input alias for `config` and normalizes it to
   `config`, and (c) throws a structured, actionable error on malformed input (consumed by DRUFF-5's
   "fail loud on bad import"). The invariant the AC calls "byte-for-shape round-trip" is tested as
   `decode(encode(g))` deep-equals `g` for a representative fully-populated graph — structural
   identity, not byte-identical strings.

3. **Canvas ⇄ graph converters.** `canvasToGraph(nodes, edges)` and `graphToCanvas(graph, layout?)`,
   both pure. Field mapping (React Flow ⇄ Dander):

   | React Flow | Dander graph | Notes |
   |---|---|---|
   | `node.id` | `node.id` | 1:1. |
   | `node.data.name` | `node.name` | Human label. |
   | `node.data.type` | `node.type` | Authoritative free-form Dander type token (e.g. `source`/`target`). |
   | `node.data.config` | `node.config` | Populated by the inspector (DRUFF-3) / connector forms (DRUFF-6). |
   | `node.data.fields` | `node.fields` | Declared field schema. |
   | `node.data.kind` | *(not in graph)* | App-only visual grouping; **derived** from `type` via a config map on import, never written to the graph. |
   | `node.position` | *(not in graph)* | App-only layout; see "Positions" below. |
   | `edge.source`/`edge.target` | `edge.from`/`edge.to` | React Flow's own edge keys are `source`/`target`; these carry **node ids** and map to the graph's `from`/`to`. |
   | `edge.data.mappings`/`edge.data.join` | `edge.mappings`/`edge.join` | Field-level lineage; opaque, passed through. |

4. **The canvas node-data contract itself.** DRUFF-1 seeds a placeholder `PipelineNodeData =
   { label, kind }`. Lossless conversion needs the Dander-backed superset. This ticket promotes
   `PipelineNodeData` to `{ name; type; kind; config; fields }` and **moves its canonical
   definition into `src/lib/pipeline-graph/`** (the leaf contract layer) so the converters don't
   force `lib` to import feature code — the canvas feature imports the type from `lib`, preserving a
   clean `feature → lib` dependency direction. `PipelineNode.tsx` is updated to read `data.name`
   (was `data.label`) and to keep deriving its icon/accent from `kind`.

**Positions & app-only fields (deliberate, documented).** Dander's shape has **no** position field,
and the "Contract with Dander" purity is worth protecting — we do **not** smuggle layout into
`config`/`metadata`. Therefore: `canvasToGraph` **drops** `position`, `selected`, `dragging`, and
every other React-Flow-only field; the on-disk graph is layout-free. Layout is an **app-only
sidecar** (`GraphLayout = Record<nodeId, XYPosition>`) that `extractLayout(nodes)` pulls out (DRUFF-5
persists it to localStorage alongside the graph). `graphToCanvas(graph, layout?)` re-applies a
supplied layout; for any node absent from it (e.g. a bare Dander graph imported with no Druff
sidecar) it falls back to a **deterministic left-to-right placement by graph node order**, so import
is total and stable. This makes both round-trips well-defined:
- `canvasToGraph ∘ graphToCanvas` = identity on the **graph** (positions irrelevant).
- `graphToCanvas(canvasToGraph(nodes, edges), extractLayout(nodes))` = identity on the **canvas**,
  positions included.

**Out of scope (flagged so the Code agent doesn't over-build):** Dander's *semantic* validation —
`graph_ops` cycle/dangling-edge/field-wiring checks — is **not** re-implemented here. Zod does
structural/shape validation only. Semantic validation is Dander's job and surfaces via the separate
"Validation surface" module; DRUFF-4 stays a pure serialization/conversion layer (no-execution
non-goal in `00-project-overview.md`).

### Modules / files

Create `src/lib/pipeline-graph/`:

- **`schema.ts`** — Zod schemas mirroring the on-disk shape and their `z.infer` types:
  `PipelineGraph`, `PipelineNodeSchema` (graph node), `NodeField`, `PipelineEdge`, `FieldMapping`,
  `Transformation` (+ `TransformationKind` enum `direct|expression|constant`), `JoinSpec`,
  `JoinKeyPair` (+ `JoinType` enum `inner|left|right|full`). Encodes the defaults and the
  `config`/`params` input alias. The one boundary Zod-parse for the whole app.
- **`serialize.ts`** — `GraphFormat`, `encodeGraph(graph, format): string`,
  `decodeGraph(text, format): PipelineGraph` (parse → `schema.parse`, throwing a structured error).
  Canonical dump: `from`/`to`, `config` only, `join` omitted when absent.
- **`canvas-types.ts`** — canonical `PipelineNodeData`, `PipelineNodeKind`, `GraphLayout`, and the
  config-driven `TYPE_TO_KIND` map (+ default kind for an unknown type). Leaf types shared by the
  converter and the canvas feature.
- **`canvas-convert.ts`** — `canvasToGraph(nodes, edges): PipelineGraph`,
  `graphToCanvas(graph, layout?): { nodes, edges }`, `extractLayout(nodes): GraphLayout`, and the
  deterministic fallback-layout helper.
- **`index.ts`** — barrel re-exporting the public contract (types + the four functions + layout
  helpers). Downstream (DRUFF-5) imports only from here.
- **`__fixtures__/example-graph.ts`** — a representative, **non-sensitive** graph built from
  Dander's `crm_to_warehouse_example` (fake names, `sensitivity: pii` as a tag only, never a value)
  exercising: two source fields, a direct mapping, an `expression` transformation with `inputs`, a
  `left` join, and at least one join-less edge. Also a matching YAML string fixture for decode tests.

Tests (colocated, Vitest, no network/React):

- **`schema.test.ts`** — defaults applied; `params`→`config` alias normalizes; malformed input
  throws.
- **`serialize.test.ts`** — `decode(encode(g))` deep-equals `g` for YAML and JSON; `join` omitted
  (not `null`) when absent; canonical keys emitted.
- **`canvas-convert.test.ts`** — the field mapping above; `kind` derived from `type` on import;
  positions dropped on export and restored from a `layout`.
- **`round-trip.test.ts`** — the AC end-to-end chain, both formats:
  `canvas → graph → YAML/JSON → graph → canvas` deep-equals the original canvas (layout fed back
  via `extractLayout`).

Edit existing:

- **`src/features/pipeline-canvas/nodes/PipelineNode.tsx`** — import `PipelineNodeData`/
  `PipelineNodeKind` from `@/lib/pipeline-graph`; render `data.name` instead of `data.label`.
- **`src/features/pipeline-canvas/PipelineCanvas.tsx`** *(and the DRUFF-1 store, if landed first)* —
  update the seed nodes to the new `data` shape (`name`/`type`/`kind`/`config`/`fields`). Coordinate
  with DRUFF-1's store, which owns the seed after that ticket.

### Dependencies

- **Add `yaml`** (eemeli/`yaml` v2 — pure TS, deterministic `stringify`, **no** native bindings or
  postinstall scripts). YAML encode/decode is undifferentiated plumbing that must not be
  hand-rolled (`02-engineering.md` borrow-vs-build; `01-security.md` §4 dependency review). Pin the
  version and commit the updated `pnpm-lock.yaml`. JSON uses the built-in `JSON`.

### Trade-offs

- **Zod-first types vs hand-written `interface`s.** Zod schemas are slightly heavier but give
  boundary validation *and* the inferred types from one definition — exactly the "parse, don't
  cast" rule for the Dander contract. Chosen.
- **Positions excluded from the graph vs embedded in `config`/`metadata`.** Excluding keeps the
  Dander contract clean and interoperable at the cost of an app-only sidecar + a deterministic
  import fallback. Chosen for contract purity; the sidecar is a natural fit for DRUFF-5's
  localStorage persistence.
- **Canonical/normalized dump vs minimal dump.** Emitting Dander-canonical form (full defaults,
  `join` omitted-when-absent) matches Dander's own dumper and makes the round-trip invariant clean,
  at the cost of more verbose output than a hand author might write. Acceptable — the source view is
  machine-round-tripped, not the primary authoring surface.
- **`kind` derived from `type` vs stored independently.** Deriving keeps `kind` (a pure UI concept)
  out of the contract and config-driven via `TYPE_TO_KIND`, at the cost of a mapping table to
  maintain as node types grow.

### Test seams

Everything here is a pure function, so nothing is mocked — no Dander API call exists at this layer
yet. Fixtures are static, typed, and non-sensitive (fake names; PII only as a metadata *tag*, never
a value — `01-security.md` §3). jsdom is unnecessary but harmless. The Dander-API seam this module
will eventually sit behind (fetching/writing real graphs) is DRUFF-5+ territory and out of scope.

### Flagged for the Code agent / product

- **`node.type` token semantics are under-specified.** Dander's example uses `source`/`target`;
  the canvas `kind` is `source|transform|write`. This design treats `type` as the free-form Dander
  token and `kind` as a derived UI grouping via `TYPE_TO_KIND`, but the exact token set and its
  mapping to write/transform kinds is a product decision that DRUFF-6 (connectors) will pressure —
  keep `TYPE_TO_KIND` config-driven and note this in the Decision Log if the mapping is firmed up.
- **Coordination with DRUFF-1.** This ticket widens `PipelineNodeData` beyond DRUFF-1's
  `{label, kind}` placeholder and relocates its canonical definition to `lib`. If DRUFF-1 has
  already landed, update its store seed + any `data.label` reads in the same change; if not, ensure
  DRUFF-1's store adopts this shape.
- **"byte-for-shape" (AC 3)** is interpreted as structural (deep-equal) identity of the decoded
  graph, not byte-identical serialized strings — confirm that reading is acceptable.

## Implementation Notes

Implemented exactly as designed: `src/lib/pipeline-graph/` ships as a self-contained module of
pure functions/types, no React, no store access, no network.

**Files added:**
- `schema.ts` — Zod schemas + `z.infer` types mirroring Dander's on-disk shape 1:1 (verified
  against Dander's `src/dander/pipeline/graph.py`, not just the README): `NodeFieldSchema`,
  `PipelineNodeSchema`, `TransformationKindSchema`/`TransformationSchema`, `FieldMappingSchema`,
  `JoinTypeSchema`/`JoinKeyPairSchema`/`JoinSpecSchema`, `PipelineEdgeSchema`,
  `PipelineGraphSchema`. Two `z.preprocess` normalizations: `config`/`params` alias on node config
  (Pydantic's `AliasChoices` equivalent), and an explicit `join: null` folded to an absent key
  before the object schema runs. Zod does structural validation only, per Design's "Out of scope"
  note — Dander's semantic `graph_ops` checks are not reimplemented.
- `serialize.ts` — `GraphFormat`, `encodeGraph`, `decodeGraph`, `GraphDecodeError`. Encode
  re-validates through the schema first, then emits canonical `from`/`to`/`config` keys with a
  join-less edge's `join` key dropped entirely (mirrors Dander's `_dump_graph_payload`). Decode
  wraps both the YAML/JSON syntax parse and the Zod parse in try/catch, throwing one structured
  `GraphDecodeError` either way (never a bare parser/Zod stack trace).
- `canvas-types.ts` — `PipelineNodeKind`, `PipelineNodeData`, `GraphLayout`, `TYPE_TO_KIND`,
  `DEFAULT_NODE_KIND`, `kindForType`, `defaultTypeForKind`.
- `canvas-convert.ts` — `canvasToGraph`, `graphToCanvas`, `extractLayout`, `computeDefaultLayout`,
  exactly per the design's field-mapping table. Edge `mappings`/`join`/`metadata` are read from a
  canvas edge's opaque `data` via a plain shape assertion (`CanvasEdgeData`), not a Zod parse —
  documented in-code as deliberate: this is in-memory canvas state Druff itself populated, not text
  crossing the Dander-contract boundary (Zod parsing happens in `serialize.ts`).
- `index.ts` — barrel re-exporting the full public contract.
- `__fixtures__/example-graph.ts` — `EXAMPLE_GRAPH` (adapted from Dander's own
  `crm_to_warehouse_example`) plus a hand-authored `EXAMPLE_GRAPH_YAML` string (exercises the
  `params` alias and Dander's defaults independent of `encodeGraph`). Fake names throughout;
  `sensitivity: pii` appears only as a metadata tag, never a value.

**Tests** (all colocated, Vitest, no network/React — 74/74 passing repo-wide): `schema.test.ts`,
`serialize.test.ts` (including the `decode(encode(g))` identity for both formats, canonical-key
assertions, and the join-omitted-not-null checks), `canvas-convert.test.ts`, `round-trip.test.ts`
(the AC's full canvas → graph → YAML/JSON → graph → canvas chain, both formats, plus the
graph → canvas → graph identity check).

**Existing files edited** (all necessary consequences of widening `PipelineNodeData`, confirmed
against the Design's "Coordination with DRUFF-1" flag — DRUFF-1 had already landed):
- `nodes/PipelineNode.tsx` — now imports `PipelineNodeData`/`PipelineNodeKind` from
  `@/lib/pipeline-graph` (re-exporting them for existing consumers) and renders `data.name` instead
  of `data.label`.
- `nodes/nodeKinds.ts` — re-exports the canonical `PipelineNodeKind` from `@/lib/pipeline-graph`
  instead of defining its own; `NODE_KINDS`/`PIPELINE_NODE_KINDS`/`isPipelineNodeKind` (pure
  UI/palette concerns) stay put.
- `nodes/createNode.ts` — builds the new `{name, type, kind}` shape; `type` is seeded via
  `defaultTypeForKind(kind)` (see deviation below).
- `inspector/NodeInspector.tsx` — `data.label` → `data.name` in both the read and the
  `updateNodeData` write.
- `src/lib/graph-store.ts` — `PipelineNodeData` import moved to `@/lib/pipeline-graph`; `SEED_GRAPH`
  nodes updated to the new data shape (`name`/`type`/`kind`).
- Existing tests updated to match (`createNode.test.ts`, `graph-store.test.ts`,
  `NodeInspector.test.tsx`) — same behavior, new field names/shape only. `e2e/pipeline-canvas.spec.ts`
  needed no changes (it only asserts visible label text, unchanged).

**Dependency:** added `yaml@2.9.0` (pinned; lockfile committed) exactly as scoped — pure TS, no
native bindings/postinstall scripts.

**Deviations / flags for review, per the Design's own "Flagged for the Code agent" section:**
1. **`canvasToGraph`'s third `name` parameter.** The Design's signature is `canvasToGraph(nodes,
   edges): PipelineGraph`, but `PipelineGraph.name` is a required field and the DRUFF-1 canvas
   store has no concept of a graph-level name at all — a genuine gap in the Design, not something
   this ticket could silently invent product behavior for. Resolved conservatively: added an
   **optional** third parameter (`name = "untitled-pipeline"`), so the two-arg call shape the
   Design describes still works, while a caller that does have a name (DRUFF-5's save flow, once
   it exists) can supply one. Flagging for product/DRUFF-5 to decide how/where a graph name
   actually surfaces in the UI.
2. **`TYPE_TO_KIND` token set.** Per the Design's own flag, Dander's example only shows
   `source`/`target` tokens; there's no Dander `"write"` token. Chose `target → write` (matching
   the one concrete example in Dander's docs) and `source/transform/trigger` as identity mappings,
   with `"transform"` as the fallback kind for an unrecognized token. Kept as a single
   `TYPE_TO_KIND` table (config-driven, `02-engineering.md`) rather than hardcoded branching, so
   it's a one-line change if/when DRUFF-6 firms up the real token set — noting per the Design that
   this belongs in the Decision Log once that happens, not yet appended here since it's still
   provisional.
3. **`defaultTypeForKind`** (the inverse mapping, used only by `createNode.ts` for a freshly
   palette-dropped node with no upstream graph `type` to derive `kind` from) is derived from the
   same `TYPE_TO_KIND` table rather than a second hand-maintained map, so the pairing can't drift.
4. **Canvas edge `id` scheme.** Dander's `Edge` has no id of its own; `graphToCanvas` mints
   `${from}->${to}#${index}` — deterministic across repeat imports (stable for a reload round trip)
   and disambiguates parallel edges between the same two nodes via array index. Not specified in
   the Design; flagging in case DRUFF-5 wants a different scheme once persistence needs a stable
   key across saves.

**Toolchain, all green:** `eslint` (0 problems), `prettier --check` (clean on all touched files —
a pre-existing, untracked `README.md` formatting warning is unrelated to this ticket and left
untouched), `tsc --noEmit` (clean), `vitest run` (74/74 passing), `next build` (compiles + static
export succeeds). No `pnpm-lock.yaml` conflicts; `yaml` add is the only dependency change.

## Review Log

_Append-only. PR-Review adds entries below._

### 2026-07-22 — PR-Review — **PASS**

Reviewed the `src/lib/pipeline-graph/` module and its edits to the canvas feature against all six
acceptance criteria, the three universal steering files, and `languages/typescript.md`. Inspected
every changed/added file and verified `schema.ts` against Dander's actual `src/dander/pipeline/graph.py`
(not just the README).

**Acceptance criteria — all met:**
1. Types mirror Dander's on-disk shape 1:1 via Zod + `z.infer` — `NodeField`, `Node`
   (id/type/name/config/fields), `Transformation`(+kind enum), `FieldMapping`, `JoinSpec`/`JoinKeyPair`
   (+type enum), `Edge` using on-disk **`from`/`to`** (not source/target), `PipelineGraph`. Defaults
   (`nullable:true`, `description:null`, `metadata:{}`, `config:{}`, `fields:[]`, transformation
   `kind:"direct"`) and the `config`/`params` alias match Pydantic's `AliasChoices` precedence exactly.
2. `canvasToGraph` / `graphToCanvas` present, both pure (no React/store/network).
3. `encodeGraph`/`decodeGraph` for YAML+JSON; `decode(encode(g))` structural-identity tested for both
   formats; `join` omitted-when-absent (not `null`), matching Dander's `_dump_graph_payload`.
4. Canvas ⇄ graph round-trips; positions/UI-only fields deliberately dropped from the graph and carried
   in an app-only `GraphLayout` sidecar with a deterministic import fallback — documented in code and design.
5. Converters unit-tested end-to-end (`round-trip.test.ts`: canvas → graph → YAML/JSON → graph → canvas,
   both formats). Fixtures non-sensitive — `sensitivity: pii` appears only as a metadata *tag*, never a value.
6. No steering violations: secret grep of the diff clean (only doc-comment references); yaml pinned via the
   repo-wide caret+committed-lockfile convention; TSDoc on every export.

**Toolchain verified independently:** `vitest run` 74/74, `tsc --noEmit` clean, `eslint` clean,
`prettier --check` clean on the module, `next build` succeeds.

**Non-blocking observations (no action required):** the four flagged deviations (optional `name` param,
`TYPE_TO_KIND` `target→write` mapping, `defaultTypeForKind` inverse, `${from}->${to}#${index}` edge-id
scheme) are all sound, config-driven, and correctly deferred to DRUFF-5/DRUFF-6. Dander's *semantic*
validators (Transformation kind-payload rules, derived-mapping-requires-transformation, `graph_ops`
cycle/dangling checks) are intentionally not reimplemented — matches the Design's explicit "Out of scope"
and the no-execution non-goal.

Verdict: **PASS.** Status → `done`.
