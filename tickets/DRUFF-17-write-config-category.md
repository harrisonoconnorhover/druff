---
id: DRUFF-17
title: Write-layer (WriterConfig) config category for target nodes
status: done
component: frontend
epic: node-config
depends_on: [DRUFF-4, DRUFF-11]
created: 2026-07-23
---

## Context

Dander's `TargetNodeConfig.writer: WriterConfig | None` (see
`../dander/src/dander/pipeline/node_config.py`, landed in DANDER-16) declares how and where a
`target`/write node writes. This ticket adds a **"Write config" category** — plugging into the
config-category routing seam DRUFF-11 established, exactly as DRUFF-12's HTTP category and
DRUFF-13's trigger category do — that authors Dander's `WriterConfig` shape **1:1** for target/write
nodes.

`WriterConfig` (grounded in `node_config.py`, not an invented shape) declares:
- `write_mode` — Dander's `WriteMode` (`scd1` / `scd2` / `snapshot` / `incremental`), **required**.
- `destination: DestinationSpec` — `project` (optional), `dataset` (required, non-empty), `table`
  (required, non-empty), `business_key: list[str]` (ordered column names).
- `cursor_field: str | None` — watermark/cursor column; required non-empty **only** when
  `write_mode` is `incremental`.
- `partitioning: PartitioningSpec | None` — `field: str | None` (where `None` means BigQuery
  ingestion-time partitioning rather than a named column), `granularity` (`hour`/`day`/`month`/
  `year`, defaulting to `day`), `require_partition_filter: bool` (defaulting to `false`).
- `clustering: list[str]` — ordered clustering column names, **max 4, no duplicates**.

Dander's `WriterConfig` `model_validator` enforces the per-mode requirements server-side; this ticket
**mirrors those same rules client-side for inline UX**, following the exact "client-side UX mirror,
Dander remains the enforcing boundary" pattern DRUFF-12's `httpRequestReferences.ts` established for
`RequestSpec`'s Rule A/B. The client-side mirror is guidance so the form fails loud early — it does
**not** replace Dander's authoritative validation.

Per `steering/01-security.md`: `dataset`/`table`/column names are ordinary identifiers, never
secrets — but no real secret/credential value is ever stored in config or committed fixtures, and
fixtures use benign identifiers only.

## Acceptance Criteria

- [ ] Selecting a target/write node shows a "Write config" category, registered as a
      data/registration change at the DRUFF-11 config-category routing seam (not a new hardcoded
      branch in the inspector), and scoped so it applies to target/write nodes (not source/transform).
- [ ] The category authors Dander's `WriterConfig` shape 1:1, grounded in the on-disk keys from
      `../dander/src/dander/pipeline/node_config.py`: `write_mode` (closed set
      `scd1`/`scd2`/`snapshot`/`incremental`), `destination` (`project` optional, `dataset` required,
      `table` required, ordered `business_key` list), `cursor_field`, `partitioning`
      (`field` nullable = ingestion-time, `granularity` closed set defaulting to `day`,
      `require_partition_filter` defaulting to `false`), and ordered `clustering` — not an invented
      parallel shape.
- [ ] Client-side per-mode requirement mirror is enforced for inline UX, matching Dander's
      `WriterConfig` `model_validator`: `business_key` required non-empty for `scd1`/`scd2`/
      `incremental` but not `snapshot`; `cursor_field` required non-empty only for `incremental`;
      `clustering` capped at 4 columns with no duplicates. Violations are shown inline (Dander
      remains the enforcing boundary — the mirror is UX guidance, documented as kept in sync with
      `node_config.py`).
- [ ] The write config is stored on the node's `config` grounded in Dander's on-disk key
      (`config.writer`) and round-trips through canvas ⇄ graph ⇄ YAML/JSON unchanged via DRUFF-4
      (config stays opaque passthrough; no new required change to `schema.ts` unless a round-trip
      test proves one is needed), the same way fields/mappings/joins and DRUFF-12's HTTP config do.
- [ ] The mapping/edit logic and the per-mode requirement mirror are unit-tested with non-sensitive
      fixtures (benign identifiers, no real secrets), per `steering/02-engineering.md`.
- [ ] No steering violations (secrets, style, docs).

## Design

### Approach

This ticket adds one **config category** — "Write config" — plugging into the DRUFF-11
config-category routing seam exactly as DRUFF-12 (HTTP) and DRUFF-13 (Trigger) do: one
`ConfigCategory` registration appended to `CONFIG_CATEGORIES`, no new branch in `NodeInspector`. The
category is scoped to **write/target nodes** via `matches: node.data.kind === "write"` — the canvas
`kind` a Dander `type: "target"` node maps to (`TYPE_TO_KIND`, `canvas-types.ts`), the exact analog
of DRUFF-13's `kind === "trigger"`. It authors Dander's `WriterConfig` shape 1:1, grounded in the
real on-disk keys read directly from `../dander/src/dander/pipeline/node_config.py` (verified:
`WriterConfig`/`DestinationSpec`/`PartitioningSpec`, `WriteMode` from `../dander/src/dander/writer/
base.py`), stored under `config.writer` (Dander's `TargetNodeConfig.writer`).

It follows the three-layer split DRUFF-13 established, so the only React file is the editor:

1. **A pure config↔view-model mapping + config-driven mode table** (`writerConfig.ts`) — the whole
   of the AC5 "mapping/edit logic," framework-free and unit-tested without rendering, mirroring
   `triggerConfig.ts` (DRUFF-13) and `httpRequestConfig.ts` (DRUFF-12).
2. **A structural Zod schema for defensive reads** (`WriterConfigSchema` added to `schema.ts`),
   used by `readWriterConfig` to `safeParse` `config.writer` — the same precedent DRUFF-13 set with
   `TriggerSchema` (parse, don't cast — `steering/languages/typescript.md`). It is **structural
   only**: Dander's *semantic* per-mode rules live in `validateWriter`, exactly as `TriggerSchema`
   is structural and `validateTrigger` carries the cross-kind payload rule.
3. **The category editor** (`WriterConfigEditor.tsx`) — a controlled component on the DRUFF-11 seam
   (`config`-bearing `node` in, `onConfigChange(config)` out).

**Round-trip (AC4) needs no change to `schema.ts`'s round-trip envelope.** `PipelineNodeSchema.config`
is an opaque `z.record(z.string(), z.unknown())` passthrough, so a nested `config.writer` object
already round-trips through canvas ⇄ graph ⇄ YAML/JSON unchanged — proven by a focused round-trip
test (`writer-config-round-trip.test.ts`), not by widening the node schema. Adding
`WriterConfigSchema` as a **separate exported schema** (not wired into `PipelineNodeSchema.config`)
is precisely how `TriggerSchema` was added and is not a round-trip change — `config` stays opaque.
As with DRUFF-12, the seam must hand this category the **raw `Record<string, unknown>` config**
(which it does — DRUFF-11's `ConfigCategoryEditorProps.node` carries `node.data.config` untouched),
never the string-flattened connector-form view, or the nested `writer` object would be destroyed.

**Client-side per-mode mirror (AC3), Dander stays the boundary.** `validateWriter` mirrors
`WriterConfig._check_mode_requirements` verbatim for inline UX only: `destination.business_key`
required non-empty for `scd1`/`scd2`/`incremental` but **not** `snapshot`; `cursor_field` required
non-empty **only** for `incremental`; `clustering` capped at 4 with no duplicates. It also mirrors
`DestinationSpec`'s `dataset`/`table` `Field(min_length=1)` (required non-empty) since those are
part of authoring a valid `WriterConfig`. This is documented, like `httpRequestReferences.ts`, as
"kept in sync by hand with `node_config.py`; Dander is the enforcing authority" — guidance so the
form fails loud early, never a replacement for Dander's Pydantic validation.

**Nothing is executed or evaluated** (the "Druff never executes user code" non-goal): every value
here (`cursor_field`, `dataset`, clustering columns, partition field) is an ordinary identifier
stored as authored text. Per `steering/01-security.md` these are identifiers, never secrets;
fixtures use benign names only.

### Components / modules and data flow

New files under `src/features/pipeline-canvas/inspector/categories/writer/` (nested like `http/`,
since this category ships a mapping module + editor + registration + tests):

- **`writerConfig.ts`** — pure mapping + the config-driven mode table + validation. No React, no
  store.
  - Types: `WriteMode = "scd1" | "scd2" | "snapshot" | "incremental"` (mirrors Dander's `WriteMode`);
    `PartitioningGranularity = "hour" | "day" | "month" | "year"` (mirrors `PartitioningType`);
    `WriterView` — the flat editable view-model holding **every** field together so switching write
    mode never invents/discards a differently-shaped object (same pattern as `TriggerFieldValues`):
    `{ writeMode; project: string; dataset: string; table: string; businessKey: string[];
    cursorField: string; partitioningEnabled: boolean; partitionIngestionTime: boolean;
    partitionField: string; granularity: PartitioningGranularity; requirePartitionFilter: boolean;
    clustering: string[] }`.
  - Constants (config-driven, so the on-disk spelling is one edit): `WRITER_CONFIG_KEY = "writer"`,
    `WRITE_MODES: readonly WriteModeDescriptor[]` (each `{ mode, label, help, requiresBusinessKey,
    requiresCursor }` — the descriptor table backing the mode selector and driving which fields are
    required, mirroring `TRIGGER_MODES`), `PARTITIONING_GRANULARITIES: readonly
    PartitioningGranularity[]`.
  - `readWriterConfig(config): WriterView` — `WriterConfigSchema.safeParse(config?.[WRITER_CONFIG_KEY])`;
    on failure (fresh write node, or hand-edited/legacy config) returns a sensible default view
    (`writeMode: "scd1"`, empty destination, partitioning disabled) rather than throwing — the same
    graceful-default stance `readTriggerConfig` takes. `partitioningEnabled` is derived from
    whether a `partitioning` object was present; `partitionIngestionTime` from `partitioning.field
    === null`.
  - `writeWriterConfig(prevConfig, view): Record<string, unknown>` — merges onto a **copy** of
    `prevConfig` (preserving every non-`writer` key, and any extra keys Dander's `extra="allow"`
    carried on `writer` — see below), rebuilding `config.writer` as a clean Dander-shaped object.
    Emit rules (mirroring Dander's defaults, where an absent optional key == its default, matching
    the omit-when-default convention `triggerConfig.ts`/`httpRequestConfig.ts` already use):
    - `write_mode`: always (required).
    - `destination`: always `{ dataset, table }` (emitted even when empty — they are required, and
      the mirror flags empties; trimming applied); `project` included only when non-blank;
      `business_key` included only when it has ≥1 non-blank entry (trimmed, blanks dropped; ordered).
    - `cursor_field`: included only when non-blank (trimmed).
    - `partitioning`: included only when `partitioningEnabled`. Within it: `field` is `null` when
      `partitionIngestionTime` (BigQuery ingestion-time partitioning — a **meaningful null**, so it
      is emitted explicitly, not omitted) else the trimmed `partitionField`; `granularity` always
      (defaults `day`); `require_partition_filter` always (bool).
    - `clustering`: included only when it has ≥1 non-blank entry (trimmed, blanks dropped; ordered;
      duplicates are a validation error but preserved as-authored so the inline error can show).
  - `validateWriter(view): Record<string, string>` — the AC3 mirror (empty object = valid, same
    convention as `validateTrigger`/`validateConnectorConfig`). Keys: `dataset`/`table` (required
    non-empty), `businessKey` (required when the active mode's `requiresBusinessKey`), `cursorField`
    (required when the mode's `requiresCursor`, i.e. `incremental`), `clustering` (>4 columns, or
    duplicate column names). Messages name the constraint, never echo a stored value
    (`steering/01-security.md`).
  - A small pure `moveClusteringColumn`/reorder helper if reorder is offered (mirroring
    `moveHeader`); or reuse the append/edit/remove-only list pattern from `triggerConfig`'s
    `depends_on` if reordering clustering columns isn't required (ordering still editable by
    remove/re-add). Clustering order **is** semantically meaningful to BigQuery, so an explicit
    reorder (up/down) is preferred, like `httpRequestConfig`'s `moveHeader`.

- **`WriterConfigEditor.tsx`** — `"use client"`, controlled, no store access, bound to
  `ConfigCategoryEditorProps`. Holds the whole `WriterView` in local state seeded from
  `readWriterConfig` on mount (same rationale as `TriggerConfigEditor`/`HttpRequestConfigEditor`: a
  half-typed dataset name or a new blank `business_key`/clustering row must survive between
  keystrokes; `NodeInspector` remounts per node via `key={node.id}`, so selection resets it). Every
  edit recomputes the full config via `writeWriterConfig(node.data.config, next)` and calls
  `onConfigChange` immediately, so the store never lags the screen and the merge is always against
  the **live** `config` prop (preserving sibling keys). Renders:
  - **Write mode** — a native `<select>` styled like `Input` over `WRITE_MODES` (DRUFF-12's
    precedent: a native `<select>` for a small closed set rather than vendoring a Radix `Select`;
    no new dependency). The active descriptor drives required-markers and cursor-field relevance.
  - **Destination** — `project` (Input, optional), `dataset` (Input, required-marked), `table`
    (Input, required-marked), and `business_key` as an ordered add/edit/remove/reorder list reusing
    the row pattern from `TriggerConfigEditor`'s `depends_on` / `HttpRequestConfigEditor`'s headers.
    `business_key` shows its required error only when the mode requires it.
  - **Cursor field** — a single `Input`, always rendered but required-marked/validated only for
    `incremental` (helper text explains it is the watermark column; an imported `cursor_field` on a
    non-incremental node is thus visible and preserved rather than silently dropped).
  - **Partitioning** — an "enable partitioning" `Checkbox` (`components/ui/checkbox.tsx`, already
    vendored); when enabled: an "ingestion-time partitioning" `Checkbox` (maps to `field: null`)
    that disables the partition-field `Input`, a `granularity` native `<select>` (hour/day/month/
    year, default day), and a `require_partition_filter` `Checkbox`.
  - **Clustering** — an ordered add/edit/remove/reorder list (max 4), with inline errors for >4 and
    duplicate column names surfaced from `validateWriter`.

- **`category.ts`** — the registration object contributed to the seam:
  `export const WRITER_CONFIG_CATEGORY: ConfigCategory = { id: "writer", label: "Write config",
  matches: (node) => node.data.kind === "write", Editor: WriterConfigEditor }`. TSDoc notes the
  predicate is the write-node analog of DRUFF-13's `kind === "trigger"`, matched by no other
  registered category (connector/HTTP/custom-code all key off `source`/`transform`), so its list
  position is cosmetic.

Data flow: store (DRUFF-1) → DRUFF-11 router resolves categories for the selected node → mounts
`WriterConfigEditor` with the node's raw `config` → user edits → `onConfigChange(config)` →
`updateNodeData(node.id, { config })` → store → canvas + source view re-render; save/load (DRUFF-4/5)
round-trips the nested `writer` object as opaque config.

### Schema additions (`src/lib/pipeline-graph/schema.ts` + `index.ts`)

Structural-only, mirroring the `TriggerSchema` precedent (exported, but **not** wired into
`PipelineNodeSchema.config` — config stays opaque, so no round-trip change):

- `WriteModeSchema = z.enum(["scd1", "scd2", "snapshot", "incremental"])` (+ `WriteMode` type).
- `PartitioningGranularitySchema = z.enum(["hour", "day", "month", "year"])`.
- `DestinationSpecSchema` — `{ project: string.nullable().default(null)?, dataset: string, table:
  string, business_key: array(string).default([]) }` (structural only — `min_length` semantics are
  `validateWriter`'s job, so a partially-authored destination still parses on read).
- `PartitioningSpecSchema` — `{ field: string.nullable().default(null), granularity:
  PartitioningGranularitySchema.default("day"), require_partition_filter: boolean.default(false) }`.
- `WriterConfigSchema` — `{ write_mode: WriteModeSchema, destination: DestinationSpecSchema,
  cursor_field: string.nullable().default(null), partitioning: PartitioningSpecSchema.nullable()
  .default(null), clustering: array(string).default([]) }`, plus `WriterConfig` type. Doc comment:
  structural shape only; per-mode requirements are Dander's `_check_mode_requirements` (authority)
  mirrored client-side in `writerConfig.ts`'s `validateWriter`, out of scope here — the same stance
  the file's module comment and `TriggerSchema` already take. Exported through `index.ts`.

### Files to touch / create

Create:
- `src/features/pipeline-canvas/inspector/categories/writer/writerConfig.ts`
- `src/features/pipeline-canvas/inspector/categories/writer/writerConfig.test.ts`
- `src/features/pipeline-canvas/inspector/categories/writer/WriterConfigEditor.tsx`
- `src/features/pipeline-canvas/inspector/categories/writer/WriterConfigEditor.test.tsx`
- `src/features/pipeline-canvas/inspector/categories/writer/category.ts`
- `src/lib/pipeline-graph/writer-config-round-trip.test.ts` (AC4; small non-sensitive
  `writer`-bearing fixture; leaves DRUFF-4's fixtures/tests untouched — proves no `schema.ts`
  round-trip change is needed).

Touch (thin, at the seam — a data change, per DRUFF-11 AC3):
- `src/lib/pipeline-graph/schema.ts` — add the structural schemas above (no change to
  `PipelineNodeSchema`).
- `src/lib/pipeline-graph/index.ts` — export the new schemas/types.
- `src/features/pipeline-canvas/inspector/configCategories.ts` — append `WRITER_CONFIG_CATEGORY`
  to `CONFIG_CATEGORIES` (import + one array entry + a sentence in the registry doc comment). No
  change to `NodeInspector.tsx`.
- `src/features/pipeline-canvas/inspector/configCategories.test.ts` — **expected consequence of
  AC1**, not scope creep: the real-registry test "falls back to generic for a plain write-kind node
  with no connectorId" (currently lines 104–108) must flip to assert `["writer"]`, exactly as
  DRUFF-12/13 retargeted the tests their registrations flipped. After this ticket **every** node
  kind resolves to a category, so the *only* remaining real-registry generic-fallback case is the
  "unknown connectorId source" test (lines 92–100) — keep that one as the AC2 generic-fallback
  proof. The algorithm tests using the injected `MATCHES_KIND_WRITE` fixture category (lines 42–82)
  are unaffected (they don't touch the real registry).

Do **not** change `PipelineNodeSchema.config`, the converters, or the store — config stays opaque
(AC4).

### Trade-offs

- **Structural Zod schema (`WriterConfigSchema`) for reads vs UI-layer typing only.** Chosen: add
  the schema (the `TriggerSchema` precedent) because `WriterConfig` is a **nested** object
  (`destination`, `partitioning`) and safe-parsing it defensively is cleaner and honors "parse,
  don't cast." DRUFF-12 typed `RequestSpec` in the UI layer only; that was a flatter shape read
  key-by-key. Either is defensible; the nested shape + the existing `TriggerSchema` precedent tip it
  toward a schema. Cost: a second structural mirror of Dander's shape in Zod — mitigated by keeping
  it structural-only (semantics stay in `validateWriter`) and documenting it as hand-synced.
- **Semantics in `validateWriter`, not in Zod.** Keeps the schema total (a partially-authored
  writer still parses on read, so the editor can render and *guide* it) and puts all per-mode rules
  in one tested pure function — mirrors `TriggerSchema`/`validateTrigger`. Dander remains the
  enforcing boundary.
- **`partitioning` present-with-`field: null` (ingestion-time) vs absent (no partitioning).** These
  are genuinely different Dander states, so the editor models them with two controls (an "enable"
  toggle and an "ingestion-time" toggle) and `writeWriterConfig` emits an explicit `field: null`
  only when partitioning is enabled + ingestion-time. Cost: two booleans instead of one; necessary
  to represent both states losslessly (AC2).
- **Flat `WriterView` holding all fields vs a discriminated per-mode shape.** Flat, like
  `TriggerFieldValues` — switching write mode never reshapes the object, and fields that a mode
  doesn't require (`cursor_field` on `snapshot`) are simply not written by `writeWriterConfig`,
  never lost mid-edit. Cost: the view carries fields not always emitted — the same, accepted,
  trade-off DRUFF-13 made.
- **Native `<select>` for write mode / granularity vs a Radix `Select`.** Native, per DRUFF-12 —
  small closed sets, no new dependency/lockfile churn, styled to match `Input`. A `<select>` (not
  DRUFF-13's `Tabs`) because write mode doesn't gate whole field panels — destination/partitioning/
  clustering apply to every mode; only `business_key`'s required-ness and `cursor_field`'s
  relevance vary, handled by conditional markers rather than separate tab panels.
- **`clustering` reorder via up/down (like `moveHeader`) vs remove/re-add.** Up/down — clustering
  order is semantically meaningful to BigQuery, so it deserves a first-class reorder, consistent
  with `httpRequestConfig`'s header reorder.

### Test seams

All logic is pure or component-level; **nothing network/Dander is mocked** (no backend call exists
at this layer). Fixtures are synthetic and non-sensitive per `steering/01-security.md` — benign
identifiers only (`analytics`, `dim_customer`, `customer_id`, `updated_at`), no real secrets.

- **`writerConfig.test.ts`** — `readWriterConfig` (parse a full writer; graceful default on
  absent/garbage; `partitioning.field === null` → ingestion-time flag; partitioning absent →
  disabled); `writeWriterConfig` (round-trips a full writer; `project`/`business_key`/`cursor_field`/
  `clustering` omitted when blank; `partitioning` omitted when disabled and `field: null` emitted
  for ingestion-time; blank rows trimmed/dropped; sibling non-`writer` config keys preserved);
  `validateWriter` (business_key required for scd1/scd2/incremental but not snapshot; cursor_field
  required only for incremental; clustering >4 and duplicate errors; dataset/table required).
- **`WriterConfigEditor.test.tsx`** (RTL/jsdom, no drag) — write-mode change, destination edits,
  business_key add/edit/remove/reorder, cursor_field edit, partitioning enable + ingestion-time
  toggle + granularity + filter, clustering add/reorder each fire `onConfigChange` with the correct
  merged config; a `scd1` node with empty `business_key` and an `incremental` node with empty
  `cursor_field` render their inline errors; a 5th clustering column / a duplicate renders its error.
- **`writer-config-round-trip.test.ts`** — a `writer`-bearing target node survives graph → canvas →
  graph and canvas → graph → {yaml,json} → graph → canvas structurally unchanged, with no
  `schema.ts` round-trip change (config opaque), modeled on `http-request-round-trip.test.ts`.

### Flagged for the Code agent / review

- **`config.writer` sibling placement is confirmed against Dander.** `TargetNodeConfig.writer`
  (`node_config.py`) is a field on the target node's `config`, so `config.writer` is exact — not a
  `Node.trigger`-style sibling ambiguity like DRUFF-13 flagged. No open question here.
- **`extra="allow"` on `NodeConfig`/its subclasses.** Dander preserves unmodeled keys on a target
  config and on `WriterConfig`'s own extra content. `writeWriterConfig` merges onto a copy of
  `prevConfig` so sibling `config` keys survive; if a round-trip test shows extra keys *inside* an
  imported `writer` object also need preserving, spread the parsed-through original rather than
  rebuilding from scratch — call it out if the round-trip test proves it necessary (default plan:
  rebuild `writer` from the view, which is lossless for the modeled fields the editor owns).
- **`business_key`/`clustering` always emitted vs omit-when-empty.** Dander's `model_dump` re-emits
  `business_key: []`/`clustering: []`, but absent == default `[]` on load, so this design omits them
  when empty (consistent with the codebase's omit-when-default convention). If a byte-identical
  match to Dander's dump is ever required, that's a one-line change in `writeWriterConfig` — noted,
  not built, per "no speculative generality."

## Implementation Notes

Implemented exactly per the Design, no deviations from the specified shape/behavior. Files:

**New:**
- `src/features/pipeline-canvas/inspector/categories/writer/writerConfig.ts` — `WRITE_MODES`
  descriptor table, `WriterView`, `readWriterConfig`/`writeWriterConfig`/`validateWriter`, and a
  generic `moveListItem` reorder helper (mirrors `moveHeader`, generalized to a plain `string[]` so
  one function backs reorder for both `business_key` and `clustering`, per "reuse before
  inventing").
- `src/features/pipeline-canvas/inspector/categories/writer/writerConfig.test.ts` — 26 cases:
  mode-table shape, `readWriterConfig` (full parse, graceful default on garbage/legacy, ingestion-
  time detection, absent-partitioning detection), `writeWriterConfig` (always-emit
  write_mode/destination, full round-trip, omit-when-blank for project/business_key/cursor_field/
  clustering/partitioning, explicit `field: null` for ingestion-time, trim+drop-blank+preserve-order,
  sibling-key preservation + no-mutation), read/write round-trip stability, `validateWriter`
  (dataset/table required, business_key required for scd1/scd2/incremental not snapshot,
  cursor_field required only for incremental, clustering >4 and duplicate errors), `moveListItem`.
- `src/features/pipeline-canvas/inspector/categories/writer/WriterConfigEditor.tsx` — controlled
  editor per the DRUFF-11 seam; native `<select>` for write mode/granularity (no new dependency,
  per DRUFF-12 precedent); a shared `ColumnListField` (add/edit/remove/reorder) backs both
  `business_key` and `clustering` rather than two near-duplicate components; two independent
  `Checkbox`es (`components/ui/checkbox.tsx`, already vendored) represent "partitioning enabled"
  and "ingestion-time" so the three-valued `partitioning` state (absent / present+null-field /
  present+named-field) is representable losslessly.
- `src/features/pipeline-canvas/inspector/categories/writer/WriterConfigEditor.test.tsx` — RTL/
  jsdom: registration predicate; defaults for a config-less node; rendering an existing incremental
  writer; typing dataset/table calls `onConfigChange` with a clean payload; business_key required
  error shown for scd1 and absent for snapshot; adding a business_key row writes it; cursor_field
  required error for incremental; partitioning enable + ingestion-time writes `field: null`;
  granularity/require_partition_filter edits; clustering >4 and duplicate inline errors; clustering
  reorder.
- `src/features/pipeline-canvas/inspector/categories/writer/category.ts` — `WRITER_CONFIG_CATEGORY`
  registration (`id: "writer"`, `matches: node.data.kind === "write"`).
- `src/lib/pipeline-graph/writer-config-round-trip.test.ts` — AC4: graph→canvas→graph identity,
  canvas→graph→{yaml,json}→graph→canvas stability, and a writer-less target node's config has no
  `writer` key — proving no `schema.ts`/converter change was needed for the round-trip itself.

**Touched:**
- `src/lib/pipeline-graph/schema.ts` — added `WriteModeSchema`, `PartitioningGranularitySchema`,
  `DestinationSpecSchema`, `PartitioningSpecSchema`, `WriterConfigSchema` (+ inferred types), all
  structural-only per the `TriggerSchema` precedent; **not** wired into `PipelineNodeSchema.config`,
  so `config` stays opaque and no round-trip envelope change was made.
- `src/lib/pipeline-graph/index.ts` — exported the five new schemas/types through the barrel.
- `src/features/pipeline-canvas/inspector/configCategories.ts` — imported and appended
  `WRITER_CONFIG_CATEGORY` to `CONFIG_CATEGORIES`; added a doc-comment sentence noting its position
  is cosmetic (no other registered predicate matches `kind === "write"`). No change to
  `NodeInspector.tsx`.
- `src/features/pipeline-canvas/inspector/configCategories.test.ts` — flipped the "falls back to
  generic for a plain write-kind node" real-registry test to assert `["writer"]` instead, exactly as
  the Design called for (the expected AC1 consequence, same as DRUFF-12/13/14's prior retargets).
- `src/features/pipeline-canvas/inspector/NodeInspector.test.tsx` — **not explicitly flagged by the
  Design, but the same category of ripple**: this file's `NODE_B`/`WRITE_NODE` fixtures were
  `kind: "write"` nodes used specifically to exercise the generic key/value editor (its own comment
  said so). After this ticket, `write`-kind nodes resolve to the new Write config category instead,
  so those two fixtures were failing (`getByRole("button", { name: /remove field/i })` etc. no longer
  rendered). Retargeted both fixtures to the one real generic-fallback shape left after DRUFF-17 (a
  `source`-kind node carrying an unresolvable `connectorId` — same shape
  `configCategories.test.ts`'s own "unknown connectorId source" case uses) and renamed them
  `GENERIC_NODE`/`GENERIC_NODE_EMPTY` for clarity; no assertions changed, only the fixture shape and
  its explanatory comment.

**Deviations from Design:** none. The "Flagged for Code agent" open questions were resolved per the
Design's own stated default plan: `config.writer` placement confirmed exact (no ambiguity to
resolve); `business_key`/`clustering` omitted-when-empty (not byte-identical to Dander's
`model_dump`, per the codebase's existing omit-when-default convention); extra/unmodeled keys
*inside* an imported `writer` object are not specially preserved (rebuilt from the view) — the
round-trip test only exercises modeled fields, so this wasn't shown necessary, consistent with
"no speculative generality."

**Tooling:** `tsc --noEmit`, `eslint`, `prettier --check`, and `vitest run` (531 tests, full suite)
all pass clean.

## Review Log

_Append-only. PR-Review adds entries below._

### 2026-07-23 — PASS

Reviewed against all six acceptance criteria, the steering files, and Dander's actual source
(`../dander/src/dander/pipeline/node_config.py`, `../dander/src/dander/writer/base.py`).

- **AC1 (category at the DRUFF-11 seam, scoped to write nodes):** met. `WRITER_CONFIG_CATEGORY`
  (`categories/writer/category.ts`, `matches: node.data.kind === "write"`) is appended to
  `CONFIG_CATEGORIES` in `configCategories.ts` as a pure data change — no new branch in
  `NodeInspector`. `target → write` kind mapping confirmed in `canvas-types.ts` (`TYPE_TO_KIND`).
  `configCategories.test.ts` flips the write-kind case to assert `["writer"]`; the unknown-connectorId
  source case remains as the generic-fallback proof.
- **AC2 (WriterConfig shape 1:1):** met and verified field-by-field against Dander's Pydantic
  models — `WriteMode` (scd1/scd2/snapshot/incremental), `DestinationSpec` (project optional,
  dataset/table `Field(min_length=1)`, ordered `business_key`), `cursor_field`, `PartitioningSpec`
  (`field` nullable = ingestion-time, `granularity` closed set default `day`,
  `require_partition_filter` default `false`), `clustering` capped at 4. On-disk keys are exact.
- **AC3 (client-side per-mode mirror):** met. `validateWriter` mirrors
  `WriterConfig._check_mode_requirements` verbatim (business_key required for scd1/scd2/incremental
  not snapshot; cursor_field required only for incremental; clustering >4 and duplicate errors) plus
  `DestinationSpec`'s `min_length=1` on dataset/table. Errors render inline in the editor; messages
  name the constraint and never echo a stored value. Documented as hand-synced with `node_config.py`,
  Dander remaining the enforcing boundary.
- **AC4 (stored at `config.writer`, round-trips opaque):** met. `writer-config-round-trip.test.ts`
  proves graph→canvas→graph identity and canvas→graph→{yaml,json}→graph→canvas stability with no
  change to `PipelineNodeSchema.config` (stays `z.record(z.string(), z.unknown())`). The new
  `WriterConfigSchema` and friends are structural-only and exported but not wired into the node
  schema — the `TriggerSchema` precedent.
- **AC5 (unit tests, benign fixtures):** met. `writerConfig.test.ts` (read/write/validate/moveListItem)
  and `WriterConfigEditor.test.tsx` (13 cases: mode change, destination, business_key/clustering
  add/reorder, cursor field, partitioning + ingestion-time `field: null`, inline errors) use only
  benign identifiers (`analytics`, `dim_customer`, `customer_id`, `updated_at`).
- **AC6 (no steering violations):** met. Grep for credential-shaped literals across the writer files
  and round-trip fixture came back clean; nothing sensitive ships to the client bundle; TSDoc present
  on every export; no secret keys needed. `tsc --noEmit`, `eslint`, `prettier --check` all clean;
  full `vitest run` passes (531 tests, 44 files).

No blocking issues. Implementation matches the approved Design with no unjustified deviations
(the `NodeInspector.test.tsx` fixture retarget is a correct, expected ripple of AC1). PASS.
