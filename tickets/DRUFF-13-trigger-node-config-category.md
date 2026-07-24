---
id: DRUFF-13
title: Trigger node config category (schedule vs webhook/event)
status: done
component: frontend
epic: node-config
depends_on: [DRUFF-11]
created: 2026-07-23
---

## Context

The module map in `steering/00-project-overview.md` names a **Triggers** node: a configurable node
representing what starts a pipeline run — a schedule (cron) or a webhook/event — mapping to a Cloud
Function / Cloud Run trigger on Dander's side. Druff has no structured way to author trigger config;
it falls back to generic key/value. Plugging into the config-category routing seam (DRUFF-11), this
ticket adds a **Trigger config category**.

The category lets the user choose between a **schedule** (a cron expression) and a **webhook/event**
definition, and author the corresponding fields. Consistent with the rest of Druff, the trigger
config is authored and stored only — nothing is scheduled or fired client-side; a cron expression is
stored as an opaque string, not evaluated in the browser.

## Acceptance Criteria

- [ ] Selecting a trigger node shows a Trigger config category that lets the user pick a trigger mode
      — schedule vs webhook/event — and author the fields for the chosen mode.
- [ ] Schedule mode captures a cron expression (stored as an opaque string, not evaluated in the
      browser); webhook/event mode captures its event/webhook definition fields.
- [ ] Trigger config persists to the node's `config` through the store and round-trips through
      canvas ⇄ graph ⇄ YAML/JSON unchanged (via DRUFF-4), using stable, documented config keys.
- [ ] Switching modes does not silently corrupt or crash; the stored config reflects the selected
      mode, and any needed-field validation surfaces as an actionable inline message.
- [ ] The mode/field mapping logic is unit-tested with non-sensitive fixtures (see
      `steering/02-engineering.md`).
- [ ] No steering violations (secrets, style, docs).

## Design

### Approach

The Trigger config category is a **config-driven category** that plugs into the DRUFF-11 routing
seam: a node whose kind/type is `trigger` routes to a `TriggerConfigCategory` component instead of
the generic key/value fallback. It follows the exact shape the two existing config editors already
use — a pure, framework-free **domain module** that owns the non-trivial mapping/validation logic
(mirroring `nodeConfig.ts` and `validateConnectorConfig.ts`), plus a thin presentational component
bound to the same `config`-in / `onChange(config)`-out prop-seam `NodeConfigEditor` and
`ConnectorConfigForm` expose. All the logic the AC requires unit-tested lives in the domain module,
so it is tested without rendering anything (AC5).

**Grounded in Dander's real `Trigger` model, not an invented shape.** Verified against Dander's
`../dander/src/dander/pipeline/graph.py` (`TriggerKind` + `Trigger`): a trigger is a `kind`
discriminator plus kind-specific payload fields, all opaque/inert (a cron string is stored, never
parsed or scheduled — matching Druff's "never executes user code" non-goal). The **on-disk keys are
fixed by Dander** and are the stable, documented keys this ticket uses:

| `kind` | payload key(s) | meaning |
|---|---|---|
| `schedule` | `cron: string` (required, non-empty) | cron-driven; opaque cron expression |
| `manual` | `event: string \| null` (optional) | manual / event trigger; optional opaque external-event name — **this is the ticket's "webhook/event" mode** |
| `dependency` | `depends_on: string[]` (≥1) | upstream-dependency trigger; upstream ids by name only |

Plus `metadata: Record<string, unknown>` (tags/labels only, never data/secrets), consistent with
the rest of the schema.

**Mode = Dander `kind`.** The ticket frames the choice as "schedule vs webhook/event"; those map to
Dander's `schedule` and `manual` kinds respectively. The mode set is a **config-driven table**
(`TRIGGER_MODES`), so adding/removing a mode is a one-row data change. See the flagged
under-specifications below re: the third kind (`dependency`) and the meaning of "webhook/event
definition fields".

**Switching modes never corrupts the stored config (AC4).** Dander's `Trigger._check_kind_payload`
validator *rejects* cross-kind payload (a `manual` trigger with a `cron` set fails to load). So
`writeTriggerConfig` always writes a **clean** trigger object holding only the selected kind's
payload keys — switching `schedule → manual` drops the stale `cron` rather than leaving it behind.
This is the core reason the mapping is a pure, tested function rather than inline component state.

### Where the trigger is stored — and a flagged contract question

Per this ticket's AC, the trigger persists to the **node's `config`** under a single documented key
`config.trigger`, whose value is a faithful Dander `Trigger` object (`{ kind, cron?, depends_on?,
event?, metadata? }`). Because DRUFF-4's `PipelineNodeSchema` already carries `config` as an opaque
`z.record(z.string(), z.unknown())`, this round-trips through canvas ⇄ graph ⇄ YAML/JSON **unchanged
with no DRUFF-4 schema change** (AC3), and the stored object is Dander-shaped rather than a parallel
invention.

> **⚠ Flag for Product/DRUFF-4 (contract question, do not silently resolve in code):** Dander's
> canonical placement for a trigger is **`Node.trigger`** — a *sibling* of `config` on the node
> (`graph.py` line 506: `trigger: Trigger | None`), **not** nested inside `config`. Storing it at
> `config.trigger` honors this ticket's explicit "persists to the node's `config`" wording and keeps
> DRUFF-13 self-contained, but a `trigger`-type node has **no** Dander node-type equivalent (Dander
> attaches a `Trigger` to a source/transform/target node or the pipeline; there is no `trigger`
> *node kind*). Truly loading a Druff trigger node into Dander's `Node.trigger` attribute is a
> **DRUFF-4 / Dander-contract mapping concern** (lift `config.trigger` → the node's top-level
> `trigger` key, and decide how a standalone trigger *node* maps onto Dander's attach-to-a-node
> model). That mapping is out of scope here and should be raised as a DRUFF-4 follow-up. This design
> keeps the stored object Dander-`Trigger`-shaped precisely so that future lift is a pure move, not
> a reshape.

### Components / modules

**1. `TriggerSchema` (Zod) — extend the contract layer.** Add `TriggerKindSchema`
(`z.enum(["schedule", "dependency", "manual"])`) and `TriggerSchema` to
`src/lib/pipeline-graph/schema.ts`, mirroring Dander's `Trigger` **structurally** (kind enum +
optional `cron`/`event` nullable strings, `depends_on` string array, `metadata`). Consistent with
that file's documented stance, the schema does **structural shape only** — Dander's cross-kind
payload rules (`_check_kind_payload`) are the *semantic* layer and live in `validateTrigger`
(below), not in Zod. Used by the domain module to **parse, not cast**, a node's `config.trigger`
when reading it into the editor (a hand-edited/legacy config may hold garbage there). Re-export
`TriggerKindSchema`/`TriggerSchema` + `TriggerKind`/`Trigger` types from
`src/lib/pipeline-graph/index.ts`.

**2. `triggerConfig.ts` — pure domain module** (`inspector/categories/triggerConfig.ts`), no React,
no store. This is the unit-tested heart (AC5). Exports:

- `TRIGGER_MODES: readonly TriggerModeDescriptor[]` — the config-driven mode table. Each descriptor:
  `{ kind: TriggerKind; label: string; help?: string; fields: TriggerFieldDescriptor[] }`, where a
  `TriggerFieldDescriptor` is `{ key: "cron" | "event" | "depends_on"; label; required: boolean;
  multi?: boolean; help?; placeholder? }`. Schedule → one required `cron` text field; webhook/event
  (`manual`) → one optional `event` text field; (dependency → one required multi `depends_on` list —
  see flag).
- `readTriggerConfig(config: Record<string, unknown> | undefined): { kind: TriggerKind | null;
  values: TriggerFieldValues }` — parses `config.trigger` via `TriggerSchema`; returns
  `kind: null` (no mode chosen yet) when absent/malformed, so a freshly-dropped trigger node or a
  legacy config renders an unselected editor rather than throwing.
- `writeTriggerConfig(prevConfig, kind, values): Record<string, unknown>` — returns a **new** node
  config: every non-`trigger` key of `prevConfig` preserved untouched, `config.trigger` rewritten to
  a clean Dander-shaped object holding **only** the selected `kind`'s payload keys (+ preserved
  `metadata`). Guarantees the stored config reflects the selected mode and never carries another
  kind's stale payload (AC4).
- `validateTrigger(kind, values): Record<string, string>` — required-field validation mirroring
  Dander's `_check_kind_payload`: `schedule` requires a non-empty (trimmed) `cron`; `dependency`
  requires ≥1 `depends_on`; `manual`'s `event` is optional (no error). Field-key → actionable
  message; empty result = valid (same convention as `validateConnectorConfig`, so the caller needs
  no separate boolean). This is the "needed-field validation surfaces as an actionable inline
  message" in AC4.

**3. `TriggerConfigCategory.tsx`** (`inspector/categories/TriggerConfigCategory.tsx`, `"use client"`).
Props: `{ config: Record<string, unknown> | undefined; onChange: (config: Record<string, unknown>)
=> void }` — **the same seam** the other editors use, so it drops into the DRUFF-11 resolver with no
special-casing. Renders a **mode selector** (use the existing `Tabs` primitive — one tab per
`TRIGGER_MODES` entry; no `Select`/`RadioGroup` primitive exists yet and Tabs cleanly pairs each
mode with its own field panel) and, for the active mode, its fields with inline errors from
`validateTrigger`. `depends_on` (if the dependency mode ships) is an add/remove list reusing the
row pattern already in `NodeConfigEditor`. Holds the editable field values in local state seeded
from `readTriggerConfig` on mount — the *same* justification `NodeConfigEditor` documents (a
half-typed cron / an empty new `depends_on` row must survive between keystrokes) — but every edit
**and** every mode switch immediately recomputes via `writeTriggerConfig` and calls `onChange`, so
the store never lags the UI. Reset across node selection by mounting a fresh instance per node
(`key={node.id}` at the DRUFF-11 call site, exactly as `NodeConfigEditor` is mounted today).

**4. Registration at the DRUFF-11 seam.** One category registration mapping the `trigger` node
kind/type to `TriggerConfigCategory`. **DRUFF-11 is not yet designed**, so the exact registration
mechanism (a resolver table entry keyed by `kind`/`type`) is owned there; this ticket's only
integration point is that single data/registration entry — no new hardcoded branch in
`NodeInspector` (per DRUFF-11 AC3). If DRUFF-13 is built before DRUFF-11's seam lands, wire it as a
`kind === "trigger"` branch in `NodeInspector` co-located with the existing connector branch, to be
folded into the resolver when DRUFF-11 arrives.

### Data flow

`NodeInspector` (already store-bound) selects the node → DRUFF-11 resolver picks
`TriggerConfigCategory` for a trigger node → category renders from `node.data.config` → on
edit/mode-switch, `writeTriggerConfig` computes the next config and the category calls its `onChange`,
which is `updateNodeData(node.id, { config })` (the identical write path every other editor uses) →
Zustand store updates → canvas + inspector re-render from the same store; save/load round-trips
`config.trigger` verbatim via DRUFF-4/5. No new store action, no local mirror of node data.

### Files to touch / create

- **EDIT** `src/lib/pipeline-graph/schema.ts` — add `TriggerKindSchema`, `TriggerSchema`, `Trigger`
  type (structural mirror of Dander's `Trigger`).
- **EDIT** `src/lib/pipeline-graph/index.ts` — re-export the above from the barrel.
- **CREATE** `src/features/pipeline-canvas/inspector/categories/triggerConfig.ts` — pure domain
  module (`TRIGGER_MODES`, `readTriggerConfig`, `writeTriggerConfig`, `validateTrigger`, types).
- **CREATE** `src/features/pipeline-canvas/inspector/categories/triggerConfig.test.ts` — Vitest unit
  tests (AC5); see test seams.
- **CREATE** `src/features/pipeline-canvas/inspector/categories/TriggerConfigCategory.tsx` — the
  category component.
- **CREATE** `src/features/pipeline-canvas/inspector/categories/TriggerConfigCategory.test.tsx` —
  RTL component test that the mode selector + inline required-field error surface (AC4).
- **EDIT (integration)** the DRUFF-11 resolver registration (file owned by DRUFF-11) — one entry for
  the `trigger` kind. Fallback: `NodeInspector.tsx` branch if DRUFF-11 hasn't landed.

### Test seams

- **Unit (`triggerConfig.test.ts`), no React, non-sensitive fixtures only** (AC5,
  `steering/02-engineering.md`): `readTriggerConfig` on absent/partial/malformed/legacy config →
  `kind: null` (no throw); on each valid kind → correct kind + values. `writeTriggerConfig`:
  preserves non-trigger config keys; `schedule → manual` drops `cron`; `manual → schedule` drops
  `event`; preserves `metadata`; output re-reads to the same view-model (round-trip stability).
  `validateTrigger`: empty `cron` on schedule → error; whitespace-only `cron` → error; valid cron →
  no error; empty `depends_on` on dependency → error; `manual` with empty `event` → no error.
  Fixtures use dummy cron/event strings — **never a real secret or credential** (`01-security.md`);
  a trigger carries none anyway, but keep fixtures scrubbed.
- **Component (`TriggerConfigCategory.test.tsx`)**: selecting a mode renders that mode's fields;
  editing calls `onChange` with the expected `config.trigger`; a schedule with a blank cron shows
  the actionable inline message. No store, no network — `onChange` is a spy (dependency-injected via
  props, per `typescript.md`).
- **No new round-trip test needed in `pipeline-graph`** — `config.trigger` is opaque record data
  DRUFF-4 already carries losslessly; a fixture with a `config.trigger` object may be added to the
  existing round-trip suite as a cheap guard if desired.

### Trade-offs & flagged under-specifications

- **Store at `config.trigger` vs Dander's `Node.trigger` sibling** — see the flagged contract
  question above. Chosen `config.trigger` to honor the AC literally and avoid a DRUFF-4 schema change
  now, while keeping the object Dander-`Trigger`-shaped so the eventual lift is a pure move.
- **⚠ Two modes (ticket) vs three kinds (Dander).** The ticket frames the choice as binary
  (schedule / webhook-event), but Dander's `TriggerKind` has **three** values —
  `schedule`, `manual`, **and `dependency`**. Because the mode set is a config-driven table,
  shipping `dependency` too is a one-row addition and **directly serves AC4's "does not silently
  corrupt"**: without it, loading a hand-authored `dependency` trigger and editing it would have no
  home. **Recommendation:** include all three modes (labeling `manual` "Webhook / event" per the
  ticket). At minimum, `readTriggerConfig` must recognize a `dependency` config and the editor must
  **preserve it non-destructively** rather than rewriting/dropping it. *Product to confirm whether
  `dependency` is in scope for the UI.*
- **⚠ "webhook/event definition fields" is thin in Dander.** Dander's `manual` kind carries only an
  **optional opaque `event` name** (+ free-form `metadata`) — there is **no** webhook URL / method /
  secret / signing field in Dander's model. So this mode captures the `event` name (opaque string)
  only; a richer webhook definition would require a **Dander-side model change** (a DANDER ticket)
  and must **not** be invented as a parallel Druff-only shape (`02-engineering.md`: grounded in
  Dander's keys). *Flagged for Product: confirm the opaque-event-name scope is acceptable, or file
  the Dander-side extension first.*
- **`Tabs` for the mode selector** rather than a radio/select — no `Select`/`RadioGroup` shadcn
  primitive is vendored yet, and Tabs cleanly pairs each mode with its field panel. If a future
  category wants a compact dropdown, add the `select` primitive then; not built speculatively here.
- **Local field state in the component** (vs fully controlled) — same documented reason as
  `NodeConfigEditor`: a half-typed value / an empty new list row must survive between keystrokes;
  `onChange` still fires immediately so the store is authoritative. Reset per node via `key`.

## Implementation Notes

Built exactly per the Design, including all three flagged decisions resolved as recommended
(shipping `dependency` as a third mode, storing at `config.trigger`, scoping "webhook/event" to
Dander's opaque `event` name only). DRUFF-11's resolver registry (`configCategories.ts`) had already
landed in this working tree, so integration used that seam directly (no `NodeInspector` branch
needed).

**Files created:**
- `src/features/pipeline-canvas/inspector/categories/triggerConfig.ts` — pure domain module:
  `TRIGGER_MODES` (schedule / manual "Webhook / event" / dependency), `readTriggerConfig`,
  `writeTriggerConfig`, `validateTrigger`, `TRIGGER_CONFIG_KEY = "trigger"`.
- `src/features/pipeline-canvas/inspector/categories/triggerConfig.test.ts` — 24 unit tests (AC5):
  read (absent/no-key/malformed/each valid kind), write (key preservation, clean per-kind payload,
  blank-field omission, mode-switch stale-field dropping both directions, metadata preservation
  across a switch, round-trip stability), validate (required cron/depends_on, optional event).
- `src/features/pipeline-canvas/inspector/categories/TriggerConfigCategory.tsx` — `Tabs`-based mode
  selector + per-mode fields (plain inputs for `cron`/`event`, an add/remove list for `depends_on`),
  bound to the DRUFF-11 `ConfigCategoryEditorProps` seam; exports `TRIGGER_CONFIG_CATEGORY`
  (`matches: node.data.kind === "trigger"`).
- `src/features/pipeline-canvas/inspector/categories/TriggerConfigCategory.test.tsx` — RTL tests:
  registration `matches`, default/existing-value rendering per mode, `onConfigChange` payloads,
  inline required-field errors (blank cron, empty `depends_on`), mode-switch dropping the stale
  field (AC4).

**Files edited:**
- `src/lib/pipeline-graph/schema.ts` — added `TriggerKindSchema` (`schedule`/`dependency`/`manual`)
  and `TriggerSchema` (structural mirror of Dander's `Trigger`; semantic cross-kind checks
  deliberately left to `validateTrigger`, consistent with this file's documented stance).
  `src/lib/pipeline-graph/index.ts` — re-exported both from the barrel.
- `src/features/pipeline-canvas/inspector/configCategories.ts` — registered
  `TRIGGER_CONFIG_CATEGORY` as a third entry in `CONFIG_CATEGORIES` (after HTTP); order is cosmetic
  since its predicate (`kind === "trigger"`) never overlaps the other two.
- `src/features/pipeline-canvas/inspector/configCategories.test.ts` — added a registry-resolution
  test confirming a trigger-kind node resolves to `["trigger"]`.
- `src/lib/pipeline-graph/round-trip.test.ts` — added the optional cheap guard the Design flagged
  ("if desired"): a trigger node with `config.trigger` round-trips canvas → graph → YAML/JSON →
  graph → canvas unchanged over both formats, with no schema change required (AC3).

**Deviations from Design:** none. The Design's three flagged trade-offs were resolved per its own
recommendation, not left open:
1. Shipped all three `TriggerKind`s (schedule/manual/dependency), not just the ticket's literal
   "schedule vs webhook/event" pair, so a hand-authored `dependency` trigger has a home (AC4).
2. Stored at `config.trigger` (not Dander's sibling `Node.trigger`) per the ticket's explicit
   wording; the DRUFF-4/Dander-contract lift (`config.trigger` → `Node.trigger`, and how a
   standalone `trigger` *node* maps onto Dander's attach-to-a-node model) remains an open
   **Product/DRUFF-4 follow-up**, not resolved here.
3. "Webhook/event definition fields" scoped to Dander's actual `manual.event` (opaque name) only —
   no invented URL/method/secret fields, since Dander's model has none; a richer webhook shape would
   need a Dander-side model change first.

**Toolchain:** `eslint` clean, `prettier --check` clean on all touched/created files (pre-existing
`README.md` formatting warning is unrelated, predates this ticket), `tsc --noEmit` clean,
`vitest run` — 405/405 tests passing across 32 files (32 unrolled from 30 pre-existing + 2 new).

## Review Log

_Append-only. PR-Review adds entries below._

### 2026-07-23 — PASS

Reviewed the implementation against all acceptance criteria, the three steering files, and the
approved Design. Inspected every created/edited file and verified the mapping against Dander's real
`Trigger`/`TriggerKind` model (`../dander/src/dander/pipeline/graph.py`).

**Acceptance criteria — all met:**
- **AC1/AC2** — `TriggerConfigCategory.tsx` renders a `Tabs` mode selector over `TRIGGER_MODES`
  (Schedule / Webhook-event / Upstream-dependency) with the active mode's fields; schedule captures
  an opaque `cron` string, webhook/event captures the optional `event` name. Registered at the
  DRUFF-11 seam via `TRIGGER_CONFIG_CATEGORY` (`matches: kind === "trigger"`).
- **AC3** — persists to `config.trigger` through the store's `updateNodeData` write path; the
  round-trip test (`round-trip.test.ts`) confirms a trigger node round-trips canvas → graph →
  YAML/JSON → graph → canvas unchanged over both formats with no DRUFF-4 schema change. Keys
  (`kind`/`cron`/`event`/`depends_on`/`metadata`) match Dander's on-disk shape exactly.
- **AC4** — `writeTriggerConfig` always emits a clean per-kind payload; verified `schedule → manual`
  drops stale `cron` and `manual → schedule` drops stale `event`, both in unit and component tests;
  `metadata` preserved across switches; `validateTrigger` surfaces required-field errors inline
  (blank cron, empty `depends_on`), rendered via `text-destructive` + `aria-invalid`.
- **AC5** — 24 non-sensitive unit tests on the pure domain module (read/write/validate), plus RTL
  component tests. Fixtures are scrubbed dummy strings.
- **AC6** — no steering violations: no hardcoded secrets (the lone "secret" grep hit is help-text
  prose), no client-side logging of sensitive data, everything exported is typed with TSDoc.

**Toolchain (re-run, not just trusted):** `tsc --noEmit` clean; `eslint` clean; `prettier --check`
clean on all touched files; `vitest run` — **405/405 across 32 files**, including the 52 tests in
the four trigger-related suites.

**Notes (non-blocking, correctly handled):** The Design's `config.trigger` vs Dander's canonical
sibling `Node.trigger` placement, and how a standalone `trigger` *node* maps onto Dander's
attach-to-a-node model, remain a flagged Product/DRUFF-4 follow-up — appropriately out of scope
here and stored Dander-`Trigger`-shaped so the eventual lift is a pure move. Verified against
Dander's source that all three `TriggerKind`s, the payload keys, `metadata`, and the
`_check_kind_payload` semantics the `validateTrigger`/`writeTriggerConfig` logic mirrors are
faithful (not invented).

Verdict: **PASS**. Status → `done`.
