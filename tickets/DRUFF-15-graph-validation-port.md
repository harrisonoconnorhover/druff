---
id: DRUFF-15
title: Port Dander's structural + field-wiring graph validation to pure TypeScript
status: done
component: frontend
epic: validation-surface
depends_on: [DRUFF-4]
created: 2026-07-23
---

## Context

Dander's `graph_ops` module (see `../dander/src/dander/pipeline/graph_ops.py` and the "Validation
layer" note in `../dander/src/dander/pipeline/README.md`) is the correctness layer over a
`PipelineGraph`. It runs two tiers of pure checks:

- **Structural** (`validate`), in a fixed order, each assuming the earlier ones held:
  `DuplicateNodeIdError` (two nodes share an `id`), `DanglingEdgeError` (an edge `from`/`to`
  references a missing node id), `SelfLoopError` (an edge's `from` == `to`), `GraphCycleError` (the
  graph is not a DAG).
- **Field-wiring** (`validate_field_wiring`), which runs the structural gate first, then:
  `DuplicateFieldNameError` (a node declares two fields with the same `name`),
  `UnknownFieldReferenceError` for a `FieldMapping`'s `source` (on the edge's `from` node) and
  `target` (on the edge's `to` node) and for each `Transformation.inputs` field (on the edge's
  `from` node), and `JoinKeyFieldError` for a `JoinKeyPair`'s `left` (on `from`) / `right` (on `to`).

Druff has no live backend contract with Dander yet, so it cannot call the Python validator directly.
Per the "Validation surface" module in `steering/00-project-overview.md`, this ticket ports these
exact checks as **pure TypeScript functions over Druff's own `PipelineGraph` model** (already
mirrored from Dander's on-disk shape in DRUFF-4, using the `from`/`to` edge keys). This ticket is the
**logic seam only** — the pure validator and its structured violation output; surfacing violations
inline on the canvas is DRUFF-16.

Field-wiring assumes structural invariants (unique ids, resolvable endpoints) hold, so the checks
must run in the **same fixed order Dander runs them**: all structural checks first, field-wiring
second. Per Dander's security rule (`../dander/src/dander/pipeline/graph_ops.py` docstring and
`steering/01-security.md`), every violation carries **structure only** — node ids, edge endpoint
ids, field names, join key index, reference kind — and **never** a node's `config`, a field's/edge's
`metadata`, a field value, or a transformation's expression/constant payload.

## Acceptance Criteria

- [ ] Pure TypeScript functions validate a Druff `PipelineGraph` (DRUFF-4 model, `from`/`to` edge
      keys) with no React, no store access, and no network — the same "pure function of a graph"
      shape as Dander's `graph_ops`.
- [ ] All four **structural** checks are ported with Dander's semantics: duplicate node id, dangling
      edge (either endpoint), self-loop, and cycle (non-DAG) detection.
- [ ] All **field-wiring** checks are ported with Dander's semantics: duplicate field name within a
      node; unknown field reference for a `FieldMapping`'s `source` (resolved on the edge's `from`
      node) and `target` (on the `to` node); unknown field reference for each `Transformation.inputs`
      entry (on the `from` node); and join-key field errors for a `JoinKeyPair`'s `left` (on `from`)
      / `right` (on `to`). A mapping with `source == null` (a derived field) is not checked for a
      source field, matching Dander.
- [ ] Checks run in the **same fixed order** as Dander: all structural checks first (duplicate id →
      dangling → self-loop → cycle), then field-wiring (duplicate field name → mapping fields →
      transformation inputs → join fields), because field-wiring assumes structural invariants hold.
- [ ] Each detected violation is returned as **structured data** identifying the offending node
      and/or edge (by id / endpoint ids), the violation kind (mirroring Dander's error-type names),
      and the relevant field name / join-key index / reference kind — so DRUFF-16 can attach it to
      the offending node or edge. Violation objects carry **no** sensitive payload (no `config`,
      `metadata`, field value, or transformation expression/constant), per `steering/01-security.md`
      and Dander's own rule.
- [ ] The functions are unit-tested with non-sensitive fixtures covering each violation kind and the
      cross-tier ordering guarantee (a graph with both a structural and a field-wiring fault surfaces
      the structural one first), per `steering/02-engineering.md`.
- [ ] No steering violations (secrets, style, docs).

## Design

### Approach

This is the **logic seam** for the Validation surface module: a pure port of Dander's `graph_ops`
structural + field-wiring checks over Druff's own DRUFF-4 `PipelineGraph` model. It ships as a small
addition to the existing `src/lib/pipeline-graph/` module — pure functions and types, **no React, no
store access, no network** — so DRUFF-16 can call it against live canvas state and unit tests can
exercise it without rendering. It sits behind the existing `index.ts` barrel like the rest of the
module. The reference implementation is Dander's `../dander/src/dander/pipeline/graph_ops.py` and
`errors.py`; this design ports their **semantics** 1:1, translating two Python idioms:

1. **`from`/`to`, not `source`/`target`.** Dander's Python `Edge` model uses `source`/`target`
   internally; Druff's DRUFF-4 schema deliberately keeps Dander's *on-disk* key names `from`/`to`
   (`schema.ts`, `PipelineEdgeSchema`). This port reads `edge.from`/`edge.to` throughout. The
   `reference_kind` "source node / target node" wording still means the `from` node / `to` node.

2. **Collect violations, don't raise-on-first — but keep Dander's gates.** Dander raises the first
   error it finds and stops (it is a hard gate before orchestration hands the graph to execution).
   Druff drives a **live inline surface** (DRUFF-16) that must flag *every* offending node/edge at
   once, and DRUFF-16 AC3 explicitly requires a node/edge with multiple faults to surface all of
   them. So the validator **returns a `Violation[]`** rather than throwing. This is the one
   deliberate divergence from Dander, and it is safe **only because the phase gates below are
   preserved** — where a later check's precondition requires an earlier tier to be clean, the later
   check does not run until it is. The AC's "same fixed order" and cross-tier ordering guarantee are
   satisfied by those gates and by emitting violations in Dander's check order.

**Phased evaluation (the gates that make collect-don't-raise faithful).** The checks are grouped into
phases; a phase runs only when its precondition phases produced zero violations, exactly mirroring
why Dander's `validate` runs its four checks in a fixed order and why `validate_field_wiring` calls
`validate` first:

- **Phase 1 — structural, pre-cycle:** duplicate node id → dangling edge → self-loop. All three are
  independently computable (none needs another to hold: dangling's node-id membership test is valid
  even with duplicate ids; self-loop is per-edge), so **all violations from all three are collected**
  and returned in that order.
- **Phase 2 — cycle:** runs **only if Phase 1 is empty**. Cycle detection builds an adjacency index
  and a three-colour DFS keyed by node id; a dangling endpoint would key-miss, a duplicate id would
  collapse, and a self-loop would mis-report as a trivial cycle `[a, a]` — Dander avoids all three by
  checking them first and raising. Gating Phase 2 behind a clean Phase 1 reproduces that precisely.
  Emits **at most one** `graph-cycle` violation (the first cycle found, matching Dander's single
  raise), carrying the cycle path with the start node repeated at the end.
- **Phase 3 — field-wiring:** runs **only if Phases 1 and 2 are both empty** (i.e. the whole
  structural tier is clean), mirroring `validate_field_wiring` gating behind the full `validate`.
  Within it, in Dander's fixed order: duplicate field name (per node) → mapping `source`/`target` →
  transformation `inputs` → join key `left`/`right`. The duplicate-field-name scan runs **before**
  the field-name membership index is built (a `Set` would collapse a node's duplicate names and mask
  the very fault the scan catches — Dander's `_FieldIndex` note); the index is then a
  `nodeId → Set<fieldName>` lookup, and all field-wiring violations are collected.

This yields the AC's guarantee directly: a graph with both a structural and a field-wiring fault
returns **only** the structural violation(s) — Phase 3 never runs — so the structural fault surfaces
first (and alone), which is the ordering test the AC calls out.

**Security — structure only, verified by construction.** Per `steering/01-security.md` and Dander's
own `errors.py` rule, every `Violation` carries graph **structure only**: node ids, edge endpoint
ids (`from`/`to`), edge index, field names, join-key index, and a reference-kind discriminant. The
validator reads exclusively `node.id`, `node.fields[].name`, `edge.from`/`edge.to`, `mapping.source`/
`mapping.target`, `transformation.inputs`, and `join.keys[].left`/`.right`. It **never reads or
copies** `node.config`, any `metadata`, a `NodeField`'s other attributes, a field value, or a
transformation's `expression`/`constant` payload — so no sensitive value can reach a violation object
or, downstream, a DRUFF-16 tooltip. This is a design invariant the Code agent must preserve and the
tests assert (a fixture with sensitive-looking `config`/`expression` values produces violations whose
serialized form contains none of them).

**Presentation is out of scope.** The validator returns pure structured data; human-readable message
text and node-vs-edge attribution/rendering are DRUFF-16's job (the ticket says so explicitly). To
avoid over-building, this ticket does **not** ship message templates — but the `Violation` union
carries every structural field DRUFF-16 needs to both attribute (nodeId / edge+edgeIndex / cycle
path) and format an actionable message itself.

### Interfaces / types

New file `violations.ts` — the structured output contract (a discriminated union on `kind`, whose
values mirror Dander's error-type names). All fields are structural; `edgeIndex` is the position in
`graph.edges` (added beyond Dander's `(source,target)` tuple so DRUFF-16 can disambiguate parallel
edges between the same two nodes — it maps to DRUFF-4's `${from}->${to}#${index}` canvas-edge id
scheme):

```ts
/** Where a field reference that failed to resolve originated (mirrors Dander's FieldReferenceKind). */
export type FieldReferenceKind =
  | "mapping_source"        // FieldMapping.source, checked on the edge's `from` node
  | "mapping_target"        // FieldMapping.target, checked on the edge's `to` node
  | "transformation_input"  // Transformation.inputs entry, checked on the `from` node
  | "join_left"             // JoinKeyPair.left, checked on the `from` node
  | "join_right";           // JoinKeyPair.right, checked on the `to` node

/** Structural identity of an edge for attribution — endpoint ids + its index in graph.edges. */
export type EdgeRef = { from: string; to: string; edgeIndex: number };

export type Violation =
  // ── structural, phase 1 ─────────────────────────────────────────────
  | { kind: "duplicate-node-id"; nodeId: string }
  | { kind: "dangling-edge"; edge: EdgeRef; missingId: string }
  | { kind: "self-loop"; nodeId: string; edge: EdgeRef }
  // ── structural, phase 2 ─────────────────────────────────────────────
  | { kind: "graph-cycle"; cycle: string[] } // node ids, start repeated at end: ["a","b","a"]
  // ── field-wiring, phase 3 ───────────────────────────────────────────
  | { kind: "duplicate-field-name"; nodeId: string; fieldName: string }
  | { kind: "unknown-field-reference"; nodeId: string; fieldName: string; edge: EdgeRef;
      referenceKind: "mapping_source" | "mapping_target" | "transformation_input" }
  | { kind: "join-key-field"; nodeId: string; fieldName: string; edge: EdgeRef;
      referenceKind: "join_left" | "join_right"; keyIndex: number };

export type ViolationKind = Violation["kind"];
```

`join-key-field` is kept a distinct variant (rather than folded into `unknown-field-reference`)
because it carries `keyIndex` and mirrors Dander's separate `JoinKeyFieldError` type — while its
`referenceKind` still narrows to the two join sides, so a DRUFF-16 consumer that wants to treat all
unresolved references uniformly can match on `referenceKind` across both variants.

New file `graph-validation.ts` — the pure functions, mirroring Dander's two public entry points:

```ts
/** Structural checks only (Dander's `validate`): phase 1 then, if clean, phase 2.
 *  Returns every structural violation found, in fixed order; empty ⇒ structurally sound. */
export function validateStructure(graph: PipelineGraph): Violation[];

/** Full validation (Dander's `validate_field_wiring`): runs `validateStructure` first and, ONLY if
 *  it is empty, runs the field-wiring phase. On a graph with a structural fault, returns exactly the
 *  structural violations (field-wiring not evaluated) — the cross-tier ordering guarantee. This is
 *  the entry point DRUFF-16 calls. */
export function validateFieldWiring(graph: PipelineGraph): Violation[];
```

Internal (module-private) helpers, ported from `graph_ops.py`:
- `checkDuplicateNodeIds`, `checkDanglingEdges`, `checkSelfLoops` — phase 1 collectors.
- `checkAcyclic` — builds `buildAdjacency(graph)` (`nodeId → successor nodeId[]`, edge-insertion
  order) and runs `firstCycle(nodeIds, adjacency)`: a deterministic three-colour (`white/grey/black`)
  DFS visiting nodes and successors in insertion order, slicing the recursion stack from the grey
  node to close the path — a direct port of `_dfs_topological_order`'s cycle branch. Returns the
  first cycle path or `null`. (Topological *ordering* itself is not needed by this ticket and is not
  ported — only cycle detection.)
- `buildFieldIndex(graph)` → `nodeId → Set<fieldName>` and `has(nodeId, fieldName)`; built after the
  duplicate-field-name scan.
- `checkDuplicateFieldNames`, `checkMappingFields`, `checkTransformationFields`, `checkJoinFields` —
  phase 3 collectors, each iterating `graph.edges.forEach((edge, edgeIndex) => …)` so every edge-borne
  violation carries its `edgeIndex`. A mapping with `source === null` (a derived field) is **not**
  checked for a source field, matching Dander; a mapping with no `transformation` contributes no
  input checks; an edge with no `join` contributes no join checks.

### Files to touch / create

Create under the existing `src/lib/pipeline-graph/` (flat, matching the module's current layout):
- **`violations.ts`** — the `Violation` union, `FieldReferenceKind`, `EdgeRef`, `ViolationKind` (types
  only; no runtime logic), with TSDoc on each exported type.
- **`graph-validation.ts`** — `validateStructure`, `validateFieldWiring`, and the module-private
  helpers above. TSDoc on both exports documenting the phase gates, the collect-don't-raise divergence
  from Dander, and the structure-only security invariant.
- **`graph-validation.test.ts`** — colocated Vitest suite (see Test seams).

Edit:
- **`src/lib/pipeline-graph/index.ts`** — re-export `validateStructure`, `validateFieldWiring`
  (values) and `Violation`, `ViolationKind`, `FieldReferenceKind`, `EdgeRef` (types) from the barrel,
  so DRUFF-16 imports them from `@/lib/pipeline-graph` like the rest of the contract.

No changes to `schema.ts`, `serialize.ts`, `canvas-convert.ts`, or `canvas-types.ts` — this ticket
consumes the DRUFF-4 model read-only and adds a sibling concern.

### Trade-offs

- **Collect-all vs raise-on-first.** Diverges from Dander so the live inline surface can flag every
  fault at once (DRUFF-16 AC3). Kept faithful by the phase gates; the alternative (throw the first
  error) would force DRUFF-16 to re-run the validator repeatedly and could never show two faults
  together. Chosen.
- **Phased gates vs one flat pass collecting everything.** A flat pass would mis-report (self-loops as
  cycles, key-misses on dangling endpoints) and break the cross-tier ordering AC. The gates cost a
  little structure but reproduce Dander's semantics exactly. Chosen.
- **Discriminated union vs a single `{kind, message, …}` bag.** The union gives each violation exactly
  the structural fields it has (and TypeScript exhaustiveness for DRUFF-16's `switch`), at the cost of
  more variants. Chosen over a stringly-typed bag; it also keeps sensitive payloads structurally
  impossible to attach.
- **`edgeIndex` added beyond Dander's `(source, target)` tuple.** A small, purely-structural extension
  so DRUFF-16 can attribute a violation to the exact canvas edge when parallel edges share endpoints
  (DRUFF-4's edge-id scheme is `${from}->${to}#${index}`). Justified; still no sensitive data.
- **Messages deferred to DRUFF-16.** Keeps this ticket the pure logic seam it's scoped as; the union
  carries everything needed to format actionable text. If a shared `describeViolation` helper proves
  useful it can be added in DRUFF-16 where the presentation lives — not built speculatively here.

### Test seams

Everything is a pure function of a graph — **nothing is mocked**, no Dander API exists at this layer,
no network, no React/jsdom needed. `graph-validation.test.ts` uses small, hand-built, **non-sensitive**
graph literals (fake ids/field names; the DRUFF-4 `EXAMPLE_GRAPH` fixture serves as the known-valid
graph) and covers, per AC:
- **Valid graph ⇒ `[]`** from both `validateStructure` and `validateFieldWiring` (`EXAMPLE_GRAPH` is
  structurally sound and fully field-wired — verified: every mapping/transformation/join reference
  resolves).
- **Each structural kind:** duplicate node id; dangling edge (a `from` miss and a `to` miss, asserting
  `missingId`); self-loop; cycle (asserting the `cycle` path with the start repeated at the end, and
  its determinism).
- **Each field-wiring kind:** duplicate field name; unknown `mapping_source` (and that a `source:
  null` derived mapping is *not* flagged); unknown `mapping_target`; unknown `transformation_input`;
  `join-key-field` for `join_left` and `join_right` with the right `keyIndex`.
- **Cross-tier ordering (AC):** a graph carrying **both** a structural fault (e.g. a self-loop) and a
  field-wiring fault returns **only** the structural violation — field-wiring did not run.
- **Collect-within-tier + gates:** two duplicate ids both reported; a dangling edge suppresses cycle
  evaluation (no false `graph-cycle`); a self-loop is reported as `self-loop`, never as `graph-cycle`.
- **Security invariant:** a fixture whose `config`/`metadata`/`expression`/`constant` hold
  sensitive-looking sentinel strings produces violations whose `JSON.stringify` contains **none** of
  those sentinels — only structural ids/names.

### Flagged for the Code agent / product

- **`edgeIndex` semantics.** Included as the index into `graph.edges` (0-based, insertion order) so it
  lines up with DRUFF-4's `${from}->${to}#${index}` canvas-edge id. If DRUFF-16 ends up keying edges
  differently, this is the one field to reconcile — flag it there rather than reshaping the union.
- **Single vs all cycles.** `graph-cycle` reports only the first cycle found (faithful to Dander's
  single raise). If DRUFF-16 wants every independent cycle highlighted, that's a follow-up on this
  function, not a change to the violation shape.
- **No `describeViolation`/message helper shipped** (deferred to DRUFF-16 where presentation lives) —
  confirm that reading is acceptable; the structured union carries everything a message needs.

## Implementation Notes

Implemented exactly per Design, no deviations.

- **`src/lib/pipeline-graph/violations.ts`** (new) — `FieldReferenceKind`, `EdgeRef`, the
  `Violation` discriminated union (all 7 variants from the Design), and `ViolationKind`. Types
  only, TSDoc on every export, no runtime logic.
- **`src/lib/pipeline-graph/graph-validation.ts`** (new) — `validateStructure` and
  `validateFieldWiring`, plus the module-private helpers exactly as specified: `buildAdjacency`,
  `firstCycle` (three-colour DFS, recursive closure mirroring Dander's `_dfs_topological_order`
  cycle branch — returns the found cycle up the call stack instead of throwing, so the search
  short-circuits deterministically without an internal exception), `checkDuplicateNodeIds`,
  `checkDanglingEdges`, `checkSelfLoops`, `checkAcyclic` (phase 1/2), `buildFieldIndex`,
  `checkDuplicateFieldNames`, `checkMappingFields`, `checkTransformationFields`, `checkJoinFields`
  (phase 3). Phase gates implemented exactly as designed: `validateStructure` returns phase 1
  violations directly if non-empty, else runs phase 2; `validateFieldWiring` returns
  `validateStructure`'s output directly if non-empty (field-wiring never evaluated), else runs the
  duplicate-field-name scan, builds the field index, and concatenates the remaining phase-3
  collectors in Dander's fixed order. Every collector reads only structural fields (`node.id`,
  `field.name`, `edge.from`/`.to`, `mapping.source`/`.target`, `transformation.inputs`,
  `join.keys[].left`/`.right`) — never `config`/`metadata`/expression/constant — matching the
  Design's security-by-construction invariant.
- **`src/lib/pipeline-graph/graph-validation.test.ts`** (new) — colocated Vitest suite, 19 tests
  covering every item in the Design's Test seams: `EXAMPLE_GRAPH` returns `[]` from both entry
  points; each structural violation kind (duplicate id including the two-distinct-ids and
  three-repeats collect cases, dangling edge on both `from`/`to` misses, self-loop, cycle with its
  path shape and determinism); the dangling-suppresses-cycle and self-loop-never-cycle
  false-positive guards; each field-wiring kind (duplicate field name, unknown
  `mapping_source`/`mapping_target`/`transformation_input`, `join_left`/`join_right` with
  `keyIndex`, and the `source: null` derived-mapping non-check); the cross-tier ordering guarantee
  (self-loop + unresolvable mapping target on the same edge yields only the `self-loop`
  violation); and the security invariant (a fixture with sentinel strings in `config`, field
  `metadata`, edge `metadata`, mapping `metadata`, transformation `metadata`/`expression`/
  `constant` produces violations whose `JSON.stringify` contains none of the sentinels).
- **`src/lib/pipeline-graph/index.ts`** (edited) — barrel now re-exports `validateStructure`,
  `validateFieldWiring` (values) and `Violation`, `ViolationKind`, `FieldReferenceKind`, `EdgeRef`
  (types), alongside the existing DRUFF-4 exports.
- No changes to `schema.ts`, `serialize.ts`, `canvas-convert.ts`, or `canvas-types.ts`, per Design.

**Toolchain:** `pnpm typecheck` (clean), `pnpm lint` (clean), `pnpm test` — 456/456 passing (19
new). `pnpm format:check` is clean for every file this ticket touched; the one remaining warning
(`README.md`) is pre-existing and unrelated (verified via `git stash` against the base commit
before this change).

## Review Log

_Append-only. PR-Review adds entries below._

### 2026-07-23 — PASS

Reviewed the implementation (`violations.ts`, `graph-validation.ts`, `graph-validation.test.ts`,
`index.ts`) against all seven acceptance criteria, the steering files, and the Dander reference
(`../dander/src/dander/pipeline/graph_ops.py`, `errors.py`). Verdict: **PASS**.

**Acceptance criteria — all met:**

1. **Pure functions, no React/store/network, `from`/`to` keys.** `validateStructure` /
   `validateFieldWiring` are pure functions of a `PipelineGraph`; the module imports only types
   (`schema`, `violations`) and reads `edge.from`/`edge.to` throughout. No side effects at module
   scope.
2. **Four structural checks, Dander semantics.** `checkDuplicateNodeIds`, `checkDanglingEdges`
   (both endpoints, with `missingId`), `checkSelfLoops`, and `checkAcyclic` (three-colour DFS in
   `firstCycle`) are a faithful 1:1 port of Dander's `_check_*` functions and
   `_dfs_topological_order`'s cycle branch — verified line-against-line, including the cycle-path
   shape (start node repeated at end).
3. **Field-wiring checks, Dander semantics.** Duplicate field name; mapping `source` (with the
   `source === null` derived-field skip) / `target`; transformation `inputs` on the `from` node;
   join `left`/`right` on `from`/`to` with `keyIndex`. `referenceKind` values match Dander's
   `FieldReferenceKind` enum exactly. Matches Dander's `_check_mapping_fields` /
   `_check_transformation_fields` / `_check_join_fields`.
4. **Fixed order via phase gates.** `validateStructure` returns Phase 1 (duplicate id → dangling →
   self-loop) before Phase 2 (cycle) runs only when Phase 1 is empty; `validateFieldWiring` returns
   `validateStructure`'s output unevaluated-further when non-empty, then runs the field-wiring tier
   in Dander's fixed order with the field index built after the duplicate-name scan. Reproduces
   `validate` → `validate_field_wiring` gating precisely.
5. **Structured, no sensitive payload.** `Violation` is a discriminated union carrying only
   structural identifiers. Confirmed by construction: the only `config`/`metadata`/`expression`/
   `constant` references in `graph-validation.ts` are in the module docstring stating it never
   reads them; every collector touches only `node.id`, `field.name`, `edge.from`/`.to`,
   `mapping.source`/`.target`, `transformation.inputs`, `join.keys[].left`/`.right`. The security
   test (sentinel strings in `config`/`metadata`/`expression`/`constant`) asserts none reach the
   serialized violations.
6. **Unit-tested, incl. cross-tier ordering.** 19 colocated Vitest tests cover every violation
   kind, the collect-within-tier and false-positive guards (dangling suppresses cycle; self-loop
   never reported as cycle), the cross-tier ordering guarantee (self-loop + bad mapping target on
   one edge → only the `self-loop` violation), and the security invariant. Fixtures are hand-built
   with non-sensitive fake ids/names per `02-engineering.md`.
7. **No steering violations.** No credential-shaped literals in the diff (grepped). TSDoc on every
   export documenting the phase gates, the collect-don't-raise divergence, and the security
   invariant, per `languages/typescript.md`. Barrel re-exports the two functions (values) and
   `Violation`/`ViolationKind`/`FieldReferenceKind`/`EdgeRef` (types).

**Toolchain (re-run, not just trusted):** `pnpm typecheck` clean; `pnpm lint` clean;
`prettier --check` clean on all four touched files; `graph-validation.test.ts` 19/19 passing; full
suite 456/456. No changes to `schema.ts`/`serialize.ts`/`canvas-convert.ts`/`canvas-types.ts`, per
Design — this ticket consumes the DRUFF-4 model read-only.

No blocking issues. Status → `done`.
