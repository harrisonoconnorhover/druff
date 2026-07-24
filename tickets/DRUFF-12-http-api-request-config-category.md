---
id: DRUFF-12
title: HTTP/API request config category for source nodes
status: done
component: frontend
epic: node-config
depends_on: [DRUFF-4, DRUFF-11]
created: 2026-07-23
---

## Context

A Dander `source` node's config may carry a `request: RequestSpec` describing *how* it calls its API
— HTTP method, headers, query params, and a body template (see
`../dander/src/dander/pipeline/README.md`, "Source request/payload spec"). Druff's source and
future custom-API-connector nodes have no structured way to author this; they fall back to generic
key/value config. Plugging into the config-category routing seam (DRUFF-11), this ticket adds an
**HTTP/API settings category** grounded in Dander's `RequestSpec` shape.

The category covers: request `method` (Dander's `HttpMethod`: `GET`/`POST`/`PUT`/`PATCH`/`DELETE`),
an ordered list of request `headers` (key/value), a request `body` payload (raw text / JSON template,
stored as an **opaque string, never executed or rendered client-side**), and a base URL / endpoint.
`RequestSpec` is inert in Dander — Druff only authors and stores it. Per `steering/01-security.md`,
values that carry credentials are **references, not inline secret literals**: no real secret/API-key
value is ever stored in code, config, or committed state.

## Acceptance Criteria

- [ ] Selecting a source (or custom-API-connector) node shows an HTTP/API settings category with:
      request method (`GET`/`POST`/`PUT`/`PATCH`/`DELETE`), an ordered add/edit/remove/reorder list
      of request headers (key/value), a body payload field, and a base URL / endpoint field.
- [ ] The category is grounded in Dander's `RequestSpec` on-disk keys (`method`, `headers`, `body`,
      and the endpoint/base-URL keys on source config), stored on the node's `config` (e.g. under
      `config.request`), not an invented parallel shape.
- [ ] The body payload is stored as an opaque string/template and is **never executed, evaluated, or
      rendered as code in the browser** (per the "Druff never executes user code" non-goal in
      `steering/00-project-overview.md`).
- [ ] No real secret or API-key value is stored in code, config, fixtures, or committed state; a
      credential is represented as a reference/handle only (per `steering/01-security.md`), and the
      UI does not invite pasting a raw secret into a header/body value.
- [ ] The HTTP config round-trips through canvas ⇄ graph ⇄ YAML/JSON unchanged (via DRUFF-4; extend
      DRUFF-4's source-config model if the `request` shape is not yet carried structurally).
- [ ] The category's mapping/edit logic is unit-tested with non-sensitive fixtures (see
      `steering/02-engineering.md`).
- [ ] No steering violations (secrets, style, docs).

## Design

### Approach

This ticket adds one **config category** — "HTTP / API settings" — grounded in Dander's
`RequestSpec` (`../dander/src/dander/pipeline/request_spec.py`), and plugs it into the
config-category routing seam DRUFF-11 establishes. It splits cleanly into three layers so the only
part that touches React is the editor component:

1. **A pure config↔view mapping** (`httpRequestConfig.ts`) — the whole of the AC6 "mapping/edit
   logic," framework-free and unit-tested without rendering, exactly as DRUFF-3's `nodeConfig.ts`
   and DRUFF-6's `validateConnectorConfig.ts` are.
2. **A pure reference-grammar mirror** (`httpRequestReferences.ts`) — a small client-side echo of
   Dander's secret/field-reference rules, used only to drive inline UX (helper text + a "this must
   be a reference, not a literal" warning). **Dander remains the enforcing authority** at its
   Pydantic boundary; this is guidance so the UI never *invites* pasting a raw secret (AC4), not a
   re-implementation of Dander's full validator.
3. **The category editor** (`HttpRequestConfigEditor.tsx`) — a controlled component with the same
   `config`-in / `onChange(config)`-out prop seam as `NodeConfigEditor`, so DRUFF-11's router mounts
   it with no inspector-shell changes.

**Grounding in Dander's shape (AC2).** `RequestSpec` is stored **nested under `config.request`** on a
source node, and the base-URL/endpoint is a **sibling** config key (`config.endpoint`), per Dander's
README example (`config: { endpoint: /candidates, request: { method, headers, query_params, body } }`).
`RequestSpec` fields are `method` (`HttpMethod`, default `GET`), `headers` (name→value map),
`query_params` (name→value map), and `body` (JSON-object template, raw string, or absent). This
category edits `method`, `headers`, `body`, and `endpoint`; `query_params` is **preserved untouched**
on round-trip but not yet an editing surface (a documented extension seam — the AC lists method /
headers / body / base-URL, not query params).

**Round-trip (AC5) needs no DRUFF-4 schema change.** DRUFF-4's `PipelineNodeSchema.config` is
`z.record(z.unknown())` — deliberately opaque passthrough, because Dander owns the *typed per-node
config* and Druff's boundary schema mirrors only the graph envelope. A nested `config.request` object
therefore already round-trips through canvas ⇄ graph ⇄ YAML/JSON unchanged; the typing for `request`
lives in this ticket's **UI mapping layer**, not the boundary Zod schema (see trade-offs). We prove
it with a focused round-trip test rather than widening `schema.ts`. **Crucially, the seam must hand
this category the raw `Record<string, unknown>` config** — not the string-flattened
`entriesToConfig(configToEntries(...))` view the connector form receives — or the nested `request`
object would be stringified and destroyed. That is a constraint on DRUFF-11 (see "Flagged").

**Body is an opaque string, never code (AC3).** The body field is a **plain `<textarea>`**, never a
Monaco/code widget and never parsed/evaluated/highlighted — reinforcing the "Druff never executes
user code" non-goal. An imported non-string (JSON-object) body is preserved untouched unless the user
edits the field; on edit, the authored text is stored as Dander's `body: str` variant.

**`request` omitted when default (canonical).** When method is `GET` with no headers and no body, the
editor writes **no** `request` key (and drops an emptied one), matching Dander's omit-when-absent dump
(`request: null` is never emitted) — the omission happens in the mapping layer, since Druff's encoder
treats `config` as opaque and does not canonicalize nested shapes.

### Components / modules and data flow

New files under `src/features/pipeline-canvas/inspector/categories/http/`:

- **`httpRequestConfig.ts`** — pure mapping + view types. No React, no store.
  - Types: `HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"` (mirrors Dander's `HttpMethod`);
    `HeaderEntry = { key: string; value: string }`; `HttpRequestView = { method: HttpMethod;
    endpoint: string; headers: HeaderEntry[]; body: string }`.
  - `configToHttpRequest(config): HttpRequestView` — reads `config.request` + `config.endpoint`;
    `headers` map → ordered `HeaderEntry[]` in key-insertion order; `method` defaulted to `GET`; a
    non-string `body` pretty-printed to text for display (edit-preservation handled on write).
  - `httpRequestToConfig(view, existingConfig): Record<string, unknown>` — merges back onto a **copy
    of `existingConfig`** (preserving connector fields, `config.request.query_params`, and any other
    keys): sets/clears `config.endpoint`; rebuilds `config.request` from `method`/`headers`/`body`
    with blank-key header rows dropped and duplicate keys last-wins (same rule as `nodeConfig.ts`);
    **omits `request` entirely when fully default**. Preserves an un-edited non-string body verbatim.
  - `HTTP_METHODS: readonly HttpMethod[]` and `ENDPOINT_CONFIG_KEY` / `REQUEST_CONFIG_KEY` constants
    (config-driven, so the on-disk key spelling is one edit — see "Flagged").
- **`httpRequestReferences.ts`** — pure grammar mirror. `isSecretReference`, `isFieldReference`,
  `isReference`, `looksLikeRawCredentialShape` (a **small** subset of Dander's Rule B — auth-scheme
  prefix, known key prefixes, long high-entropy run), `SENSITIVE_HEADER_NAMES` set, and
  `validateHttpRequest(view): { headerErrors: Record<number, string>; bodyWarning?: string }`
  implementing a **Rule-A mirror** (a sensitive-named header whose value is not a reference → inline
  error) plus a **Rule-B-lite tripwire** (a credential-shaped literal → warning). Regexes/sets are
  centralized here and documented as "kept in sync with Dander's `request_spec.py`; Dander is the
  enforcing authority."
- **`HttpRequestConfigEditor.tsx`** — `"use client"`, controlled, no store access. Props:
  `{ config: Record<string, unknown> | undefined; onChange: (config: Record<string, unknown>) => void }`.
  Renders: a **method** picker (closed set), a **base URL / endpoint** `Input`, an **ordered header
  list** (add / edit key+value / remove / reorder via up-down buttons) reusing the local-row-list
  pattern from `NodeConfigEditor` (blank keys must survive until named; remounted per node via
  `key={node.id}` at the seam), and a **body** `<textarea>`. Inline reference help on header values
  and the `validateHttpRequest` errors/warnings rendered per row / under the body. Every edit recomputes
  the full config via `httpRequestToConfig` and calls `onChange` immediately (store never lags screen).
- **`category.ts`** (or `index.ts`) — the **registration object** contributed to DRUFF-11's seam:
  `{ id: "http-request", label: "HTTP / API settings", appliesTo: (node) => node.data.kind ===
  "source", Editor: HttpRequestConfigEditor }`. Its exact type is owned by DRUFF-11's `ConfigCategory`
  contract — adapt field names to whatever DRUFF-11 lands (see "Flagged").

Data flow: store (DRUFF-1) → DRUFF-11 router resolves categories for the selected node → mounts
`HttpRequestConfigEditor` with the node's raw `config` → user edits → `onChange(config)` →
`updateNodeData(node.id, { config })` → store → canvas + source view re-render; save/load (DRUFF-4/5)
round-trips the nested `request` as opaque config.

Likely small shadcn primitive adds (data-only, undifferentiated plumbing): `components/ui/select.tsx`
(Radix Select) for the method picker and `components/ui/textarea.tsx` for the body — or a styled
native `<select>`/`<textarea>` to avoid the adds. Either is acceptable; prefer the shadcn primitives
for visual consistency, pinned + lockfile committed if a new `@radix-ui/*` is pulled.

### Files to touch / create

Create:
- `src/features/pipeline-canvas/inspector/categories/http/httpRequestConfig.ts`
- `src/features/pipeline-canvas/inspector/categories/http/httpRequestConfig.test.ts`
- `src/features/pipeline-canvas/inspector/categories/http/httpRequestReferences.ts`
- `src/features/pipeline-canvas/inspector/categories/http/httpRequestReferences.test.ts`
- `src/features/pipeline-canvas/inspector/categories/http/HttpRequestConfigEditor.tsx`
- `src/features/pipeline-canvas/inspector/categories/http/HttpRequestConfigEditor.test.tsx`
- `src/features/pipeline-canvas/inspector/categories/http/category.ts` (registration)
- Possibly `src/components/ui/select.tsx`, `src/components/ui/textarea.tsx` (shadcn adds).
- A focused round-trip test proving `config.request` survives (colocate under
  `src/lib/pipeline-graph/`, e.g. `http-request-round-trip.test.ts`, with a small non-sensitive
  `request`-bearing fixture) — leaves DRUFF-4's existing fixture/tests untouched.

Touch (thin, at the seam — coordinate with DRUFF-11):
- The DRUFF-11 category registry file — add this category's registration (a data edit, per DRUFF-11
  AC3). No new hardcoded branch in `NodeInspector.tsx`.

Do **not** change `src/lib/pipeline-graph/schema.ts` (config stays opaque — see AC5 reasoning).

### Trade-offs

- **UI-layer typing for `request` vs a boundary Zod `RequestSpecSchema`.** Chosen: type it only in the
  UI mapping layer, keep DRUFF-4's `config` opaque. Duplicating Dander's `RequestSpec` as Zod at the
  boundary would fork a second source of truth that silently drifts from Dander's Pydantic model; the
  opaque passthrough already round-trips losslessly. Cost: no boundary validation of `request` shape
  on import — acceptable, since Dander validates on its side and this is authoring UI.
- **Body = plain textarea (opaque string) vs structured JSON editor.** Plain textarea, never
  code-rendered — directly honors the no-execution non-goal (AC3) and keeps DRUFF-14's Monaco widget
  the *only* code surface. Cost: no JSON structure assist for object-template bodies; un-edited
  object bodies preserved verbatim, edited ones normalized to Dander's `body: str` variant (flagged).
- **Mirror the reference grammar client-side vs Dander-only enforcement.** Mirror a *small* subset for
  inline UX (Rule-A on the sensitive-name set + a Rule-B-lite tripwire); Dander stays the authority.
  Cost: a second copy of a few regexes/sets that must track `request_spec.py` — mitigated by
  centralizing them in one tested module with a "Dander is source of truth" doc comment.
- **`query_params` preserved-but-not-edited vs dropped or edited now.** Preserve on round-trip, don't
  expose an editor yet — the AC scopes the category to method/headers/body/base-URL. Cost: a spec'd
  Dander field is momentarily un-authorable in Druff; a clean extension seam, no data loss.
- **`appliesTo: kind === "source"` vs a dedicated custom-API-connector predicate.** The current node
  model has only `source|transform|write|trigger`; there is no distinct custom-API-connector *kind*
  yet, so the predicate targets source-kind nodes (which a custom API connector is a specialization
  of). Config-driven — trivially widened once that kind exists.

### Test seams

All logic is pure or component-level; **nothing network/Dander is mocked** (no backend call exists at
this layer). Fixtures are synthetic and non-sensitive per `01-security.md` §3 — reference values are
obviously fake (`secret:demo_source_key`, `env:DEMO_TOKEN`, `field:updated_since`) and benign literals
are things like `application/json`; the Rule-B tests use clearly-fabricated credential *shapes*, never
a real-looking key.

- **`httpRequestConfig.test.ts`** — read `request` + `endpoint`; headers map ↔ ordered entries;
  blank-key drop; duplicate-key last-wins; reorder reflected in written key order; `request` omitted
  when default; un-edited non-string body preserved; `query_params` and other config keys preserved.
- **`httpRequestReferences.test.ts`** — `isSecretReference`/`isFieldReference`/`isReference` truth
  table; sensitive-header Rule-A error; Rule-B-lite tripwire fires on fabricated credential shapes and
  never on a recognized reference.
- **`HttpRequestConfigEditor.test.tsx`** (RTL/jsdom, no drag) — method change, endpoint edit, header
  add/edit/remove/reorder, body edit each fire `onChange` with the correct merged config; a
  sensitive-named header with a literal value renders its inline error.
- **`http-request-round-trip.test.ts`** — a `request`-bearing node survives canvas → graph → YAML/JSON
  → graph → canvas structurally unchanged (AC5).

### Flagged for the Code agent / product

- **DRUFF-11 is a hard dependency and not yet implemented.** The `ConfigCategory` registration type,
  the registry file path, and how multiple categories compose are all owned by DRUFF-11. Build DRUFF-11
  first (workflow order 11 → 12); adapt `category.ts`'s field names to DRUFF-11's final contract. The
  editor/mapping/reference modules are DRUFF-11-agnostic and can proceed regardless.
- **Seam must pass structured config, not stringified.** DRUFF-11's router currently would reuse
  NodeInspector's `entriesToConfig(configToEntries(config))` coercion (built for the connector form).
  That flattens nested objects to strings and would destroy `config.request`. The HTTP category must
  receive/emit raw `Record<string, unknown>`. Confirm DRUFF-11 supports a structured-config category,
  or this ticket must adjust the seam.
- **"Custom-API-connector node" is under-specified in the current model.** No such node *kind* exists
  (only source/transform/write/trigger). Predicate targets `kind === "source"`. Confirm with product.
- **Endpoint/base-URL key name.** Dander's README example uses `config.endpoint` (sibling of
  `request`); the Greenhouse descriptor separately uses `base_url`. This design uses `endpoint` as an
  `ENDPOINT_CONFIG_KEY` constant — confirm the authoritative source-config key against Dander's
  `SourceNodeConfig` before finalizing (one-line change if it differs).
- **Coexistence with the connector form.** A pre-made connector source (e.g. Greenhouse) is also
  source-kind, so it would match this predicate. Whether such a node shows *both* the connector form
  and the HTTP category, or only one, is a DRUFF-11 composition/ordering decision — surface it there.
- **Object-template body edited → stored as string.** Editing an imported JSON-object body normalizes
  it to Dander's `body: str` variant (both are valid Dander shapes). Confirm this is acceptable, or
  DRUFF-13/product may want a structured JSON body editor later.

## Implementation Notes

DRUFF-11 was already implemented and merged (`configCategories.ts` + `categories/` seam) before this
ticket started, so it was built directly against the real registry rather than a hypothetical one.
Implemented essentially per Design; two deviations, both noted below.

**New files** (`src/features/pipeline-canvas/inspector/categories/http/`):
- **`httpRequestConfig.ts`** — pure mapping. `HttpMethod`/`HTTP_METHODS`, `HeaderEntry` (a type
  alias over `nodeConfig.ts`'s `ConfigEntry`, reused directly rather than re-declared),
  `HttpRequestView`, `ENDPOINT_CONFIG_KEY`/`REQUEST_CONFIG_KEY` constants,
  `configToHttpRequest`/`httpRequestToConfig`, and `moveHeader` (a pure reorder helper mirroring
  `nodeFields.ts`'s `moveField`, minus the stable-id lookup — a header row, like a generic config
  row, has no identity beyond position).
- **`httpRequestReferences.ts`** — the reference-grammar mirror: `isSecretReference`/
  `isFieldReference`/`isReference`/`looksLikeRawCredentialShape`, `SENSITIVE_HEADER_NAMES`, and
  `validateHttpRequest`. Regexes/sets transcribed from `../dander/src/dander/pipeline/request_spec.py`
  (read directly from the actual Dander repo, not guessed) with a "kept in sync by hand" doc comment.
- **`HttpRequestConfigEditor.tsx`** — the controlled editor (method/endpoint/headers/body).
- **`category.ts`** — `HTTP_REQUEST_CONFIG_CATEGORY` registration.
- Tests: `httpRequestConfig.test.ts`, `httpRequestReferences.test.ts`,
  `HttpRequestConfigEditor.test.tsx`, and `src/lib/pipeline-graph/http-request-round-trip.test.ts`
  (AC5, no `schema.ts` change needed — confirmed by this test).

**Touched:** `configCategories.ts` (registered the new category, appended after
`CONNECTOR_CONFIG_CATEGORY`); `configCategories.test.ts` and `NodeInspector.test.tsx` updated for the
category resolution change this registration causes (see "Deviations" below) — no inspector-shell
code change, matching AC3.

**Endpoint/base-URL key name (Flagged item resolved for now):** used `config.endpoint`, matching
Dander's README canonical example (`config: { endpoint: /candidates, request: {...} }`) verified
directly against `../dander/src/dander/pipeline/README.md` and `node_config.py`. `SourceNodeConfig`
itself declares no `endpoint`/`base_url` field (only `request`; everything else rides on the
inherited `extra="allow"`), so there is no authoritative typed field to check against — `endpoint`
is a one-line constant (`ENDPOINT_CONFIG_KEY`) if this needs to change later.

**"Custom-API-connector" predicate (Flagged item resolved for now):** `HTTP_REQUEST_CONFIG_CATEGORY.matches`
is `kind === "source" && connectorId == null` — deliberately excluding **any** node that carries a
`connectorId` at all (not merely one that fails to resolve), per DRUFF-11's own "Flagged" note that
this predicate "should exclude nodes that already carry a connectorId." A pre-made connector node
(even with a stale/unresolvable `connectorId`) therefore keeps its pre-DRUFF-12 fallback (the
connector form if resolvable, else generic) instead of switching to the raw HTTP form.

**Shadcn `select` primitive vs. a styled native `<select>` (Trade-off, Design left either
acceptable):** used a plain native `<select>` styled to match `Input`'s Tailwind classes, not a new
`components/ui/select.tsx` Radix wrapper. Confirmed the `radix-ui` unified package (already a
dependency) does export `Select`, so a shadcn add wasn't strictly blocked by a missing dependency —
chose the native element anyway to keep the diff smaller and avoid a multi-file Radix
trigger/content/item/portal component for a five-item closed set; no new dependency, no lockfile
change. `Textarea` (already present in `src/components/ui`) is used for the body field.

**State-model deviation from Design (the one real implementation change).** The Design describes
method/endpoint/body as "fully derived from `node.data.config` on every render... no local state,"
mirroring `ConnectorConfigCategory`, with only header rows held locally. Implemented instead: the
**whole edited view** (method/endpoint/headers/body together) is held as one piece of local state,
seeded from `config` on mount (the same local-mirror pattern `NodeConfigEditor`/`NodeFieldsEditor`
already use, and what DRUFF-11's own doc comments point to as the established pattern for a
category with row-list/blank-key concerns). Reason: with method/endpoint/body deriving straight from
the `node` prop and no store actually wired up (i.e. any isolated render where `onConfigChange`
doesn't feed back into `node.data.config` on the same tick), a controlled `<textarea>`/`<input>`
bound directly to a prop that never updates snaps back to its old value between keystrokes,
so multi-character edits don't accumulate, and inline validation (which needs to see the
*in-progress* edit, not just the last value that made it all the way back through
`onConfigChange`) would always see stale data. End-to-end through the real store (`NodeInspector` +
zustand) this wouldn't have been visible, but it broke isolated component tests and — more
importantly — would have made the sensitive-header/body-credential warnings feel one edit behind in
the real UI too. Persistence semantics are unchanged: every edit still calls
`httpRequestToConfig(next, node.data.config)`, merging against the *live* `config` prop at
write-time, so connector fields/`query_params`/anything else this category doesn't own still survive
exactly as designed.

**`body: null` edge case caught during testing (bug fix, not a deviation):** an original
`config.request.body: null` (an explicit, meaningful-nothing value some hand-authored/imported graph
might carry) was initially misclassified by the "has a body" check as "yes, there's a body" (since
`null !== undefined`), which broke the "omit `request` entirely when fully default" rule for a
request whose only non-default trait was an explicit null body. Fixed with a `hasMeaningfulBody`
helper that treats `null` and `undefined` identically (Dander's `RequestSpec.body` defaults to
`None`, so the two spellings are equivalent on load) — covered by a dedicated regression test in
`httpRequestConfig.test.ts`.

**DRUFF-11 registry/test updates (expected consequence of AC1, not scope creep).** Registering
`HTTP_REQUEST_CONFIG_CATEGORY` changes what a plain `source`-kind node with no `connectorId`
resolves to — from the generic fallback (DRUFF-11's shipped behavior) to this new category — which
is exactly AC1's "selecting a source node shows an HTTP/API settings category." This flipped two
pre-existing assertions:
- `configCategories.test.ts`: "falls back to generic for a plain node with no connectorId" no longer
  holds for a *source*-kind node; kept the assertion for a non-source (`kind: "write"`) node and
  added a new test pinning the source-kind case to `["http-request"]`. The "unknown connectorId"
  fallback-to-generic test is unchanged (still passes, since the HTTP category's `connectorId ==
  null` check also excludes an unresolvable-but-present `connectorId`).
- `NodeInspector.test.tsx`: the "adding a config field..." generic-editor test used `NODE_A`
  (`kind: "source"`, no connector), which now renders the HTTP category instead of the generic
  editor. Retargeted that test to a new `TRANSFORM_NODE` fixture (`kind: "transform"`, no config) so
  it still exercises the generic fallback path; added two new tests asserting `NODE_A` itself now
  renders the HTTP category and that editing its endpoint field persists through the store.

**Verification:** `pnpm typecheck` (clean), `pnpm lint` (clean), `pnpm test` (370/370 passed, 30
files), `pnpm format:check` (clean except the pre-existing `README.md` warning — confirmed via `git
diff --stat README.md` showing no diff on that file; unrelated to this ticket, left untouched, same
as DRUFF-11's own review noted).

## Review Log

_Append-only. PR-Review adds entries below._

### 2026-07-23 — PASS

Reviewed the implementation against all seven acceptance criteria, the three steering files, the
approved Design, and Dander's actual `request_spec.py` / `pipeline/README.md`. Verified locally:
`pnpm typecheck` clean, `pnpm lint` clean, `pnpm test` 370/370 passing (30 files).

**Acceptance criteria — all met:**

1. **HTTP/API category with method / ordered headers / body / base URL (AC1)** — `HttpRequestConfigEditor.tsx`
   renders a closed-set method `<select>`, an endpoint `Input`, an add/edit/remove/reorder header
   list (`moveHeader` up/down, `Trash2` remove, "Add header"), and a body `Textarea`.
   `configCategories.test.ts` pins a plain `source` node with no `connectorId` to `["http-request"]`.
2. **Grounded in Dander's `RequestSpec` on-disk keys (AC2)** — stored under `config.request`
   (`method`/`headers`/`body`, `query_params` preserved untouched) with sibling `config.endpoint`.
   Cross-checked `ENDPOINT_CONFIG_KEY`/`REQUEST_CONFIG_KEY` and the `HttpMethod` set against the real
   `../dander/src/dander/pipeline/request_spec.py` and README example — exact match, no invented shape.
3. **Body opaque, never executed/rendered as code (AC3)** — plain `<textarea>`, no Monaco; the only
   JSON parse (`httpRequestReferences.ts`) is a static leaf read for the reference heuristic, never a
   render/eval. Matches the "Druff never executes user code" non-goal.
4. **No real secret stored; credentials are references only (AC4)** — the reference grammar mirror
   (`isSecretReference`/`isFieldReference`/`looksLikeRawCredentialShape`, `SENSITIVE_HEADER_NAMES`)
   transcribes `request_spec.py` verbatim; UI placeholders/helper text steer toward `secret:`/`env:`/
   `field:` references, with an inline Rule-A error and a Rule-B-lite body/header warning. Dander stays
   the enforcing authority (documented). No literal secret anywhere in the diff; all fixtures are
   obviously fabricated (`secret:demo_key`, `Bearer fake_demo_token_123`, `sk_fake…`).
5. **Round-trips canvas ⇄ graph ⇄ YAML/JSON unchanged (AC5)** — `http-request-round-trip.test.ts`
   proves a `request`-bearing node survives graph→canvas→graph and canvas→graph→{yaml,json}→graph→canvas
   structurally identical, with no `schema.ts` change (config stays an opaque passthrough).
6. **Mapping/edit logic unit-tested with non-sensitive fixtures (AC6)** — `httpRequestConfig.test.ts`,
   `httpRequestReferences.test.ts`, `HttpRequestConfigEditor.test.tsx`, and the round-trip test cover
   read/write, blank-key drop, duplicate-last-wins, reorder, omit-when-default, the `body: null`
   regression, un-edited object-body preservation, and `query_params`/other-key preservation.
7. **No steering violations (AC7)** — typecheck/lint/test clean; TSDoc on every export; feature-grouped
   under `inspector/categories/http/`; `"use client"` at the interactive boundary; native `<select>`
   over a new Radix dep (no lockfile churn); seam correctly hands the editor **raw** structured config
   (not the stringified connector-form view), so `config.request` is never flattened.

**Deviations reviewed and accepted:** the whole-view local-state pattern (over per-render derivation)
is justified in Implementation Notes and mirrors the established `NodeConfigEditor`/`NodeFieldsEditor`
pattern; persistence semantics are unchanged (every edit re-merges against the live `config` prop).
The `matches: kind === "source" && connectorId == null` predicate correctly implements DRUFF-11's
"exclude nodes already carrying a connectorId" flag. The registry/test updates to `configCategories.test.ts`
and `NodeInspector.test.tsx` are the expected consequence of AC1, not scope creep.

No blocking issues. Status → `done`.
