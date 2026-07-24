---
id: DRUFF-14
title: Custom-code config category (Monaco widget for custom connectors and transforms)
status: done
component: frontend
epic: node-config
depends_on: [DRUFF-11]
created: 2026-07-23
---

## Context

Two module-map node kinds carry user-authored code: **Custom API connectors** (reusable custom
Python for sources with no pre-made connector) and **Transform layers** (custom BigQuery SQL against
upstream fields) — see `steering/00-project-overview.md`. The tech stack names **Monaco Editor** for
embedded code widgets (already a dependency, `@monaco-editor/react`). Plugging into the
config-category routing seam (DRUFF-11), this ticket adds a **custom-code config category**: a
Monaco-embedded code widget plus named parameters, for authoring reusable custom logic.

Language is per node kind — Python for a custom-API-connector node, SQL for a transform node. The
code and its parameters are **authored and stored only**; per the "Druff never executes user code"
non-goal in `steering/00-project-overview.md` (and its Decision Log entry), Druff never runs, parses
for evaluation, or previews the execution of this code in the browser — it is stored as an opaque
string on the node's `config` for Dander to execute.

## Acceptance Criteria

- [ ] Selecting a custom-API-connector node or a transform-layer node shows a custom-code category
      with a Monaco-embedded editor, using the language for that kind (Python for custom connectors,
      SQL for transforms).
- [ ] The user can define an ordered list of named parameters (add/edit/remove) alongside the code.
- [ ] The code and parameters persist to the node's `config` through the store and round-trip through
      canvas ⇄ graph ⇄ YAML/JSON unchanged (via DRUFF-4), using stable, documented config keys; the
      code is stored as an opaque string.
- [ ] Druff never executes, evaluates, or runs a "preview" of the authored code in the browser (per
      the "Druff never executes user code" non-goal); no client-side Python/SQL runtime is added.
- [ ] The Monaco widget loads without pulling assets from a disallowed external host at runtime in a
      way that breaks the app, and degrades gracefully if the editor is unavailable.
- [ ] The parameter-list and config-mapping logic is unit-tested with non-sensitive fixtures (see
      `steering/02-engineering.md`).
- [ ] No steering violations (secrets, style, docs).

## Design

### Approach

This category is one **registration at the DRUFF-11 config-category seam**, not a new branch in
`NodeInspector`. It contributes three things: a pure config-mapping module, a Monaco-backed code
widget with a graceful fallback, and a named-parameter list editor — composed into one
`CustomCodeConfigEditor` that reads/writes the node's `config` through the same `config`-in /
`onChange`-out prop seam the generic `NodeConfigEditor` (DRUFF-3) and `ConnectorConfigForm`
(DRUFF-6) already use, so nothing in the inspector shell changes.

The code is stored as an **opaque string** on `config.code`; parameters as an ordered array on
`config.parameters`. Both live in the `extra="allow"` bucket of Dander's typed node config
(`SourceNodeConfig`/`TransformNodeConfig` declare no dedicated code field yet — verified in
`../dander/src/dander/pipeline/node_config.py`), so they round-trip losslessly through Dander
without a schema change on either side. Crucially, the pipeline-graph `config` is
`z.record(z.string(), z.unknown())` (`src/lib/pipeline-graph/schema.ts`) and `canvas-convert.ts`
passes `config` through untouched in both directions — so a string `code` and an array
`parameters` already round-trip canvas ⇄ graph ⇄ YAML/JSON with **no DRUFF-4 change required**
(unlike DRUFF-12, which may extend the source-config model). This is verified structurally, not
assumed.

**Language is derived, never stored.** Per node kind: `transform` → SQL, custom-API-connector →
Python. It is resolved from the node at render time (Dander already knows the node's `type`), so
storing a `language` key would be a second, drift-prone source of truth. The resolver is a small
config-driven function so the kind→language table is a one-line change if kinds are added.

Consistent with the "Druff never executes user code" non-goal, the widget only edits and stores an
opaque string — no client-side Python/SQL runtime, no parse-for-eval, no run/preview. Monaco is
used purely as a text editor with syntax highlighting for the resolved language.

### Interfaces / modules

**`customCodeConfig.ts`** (pure, no React/store — the unit-tested core, AC6):

```ts
export type CodeLanguage = "python" | "sql";
export type CodeParameter = { name: string };

/** Reserved config keys owned by this category (documented; opaque to Dander). */
export const CUSTOM_CODE_KEY = "code";
export const CUSTOM_CODE_PARAMS_KEY = "parameters";

/** Which nodes get this category, and in what language. `undefined` = not a custom-code node.
 *  transform-kind → sql; source-kind WITHOUT a connectorId (a custom API connector) → python;
 *  everything else (pre-made connector, write, trigger) → undefined. */
export function resolveCustomCodeLanguage(node: Pick<PipelineNodeData, "kind" | "connectorId">): CodeLanguage | undefined;

/** Reads config → editable model, lenient on arbitrary round-tripped input (coerce code to string
 *  w/ "" default; normalize parameters to CodeParameter[], dropping malformed entries). */
export function readCustomCode(config: Record<string, unknown> | undefined): { code: string; parameters: CodeParameter[] };

/** Merges the edited model back into config, preserving unrelated keys. Parameter names are
 *  trimmed; blank names dropped; duplicates resolved last-wins keeping first-occurrence order
 *  (mirrors the established `entriesToConfig` semantics). When code is empty AND no parameters
 *  survive, both keys are omitted so an untouched node stays clean. */
export function writeCustomCode(config: Record<string, unknown> | undefined, model: { code: string; parameters: CodeParameter[] }): Record<string, unknown>;
```

**`MonacoCodeEditor.tsx`** (client): thin wrapper over `@monaco-editor/react`'s `<Editor>`,
loaded via `next/dynamic` with `ssr:false` (Monaco is browser-only). Props
`{ language: CodeLanguage; value: string; onChange: (value: string) => void }`. Two hard
requirements from AC5: (1) **same-origin assets** — configure `@monaco-editor/react`'s `loader`
to serve Monaco from the app's own origin rather than the default `jsDelivr` CDN, so no runtime
call to a disallowed external host (also `steering/01-security.md` rule 4 — deps phoning home);
(2) **graceful degradation** — a `loading` placeholder while the editor initializes and a plain
controlled `<textarea aria-label>` fallback if Monaco fails to load or is unavailable, so authoring
never hard-breaks. Loader config runs once inside an effect/guarded init, never at module scope
(`steering/languages/typescript.md`).

**`CustomCodeConfigEditor.tsx`** (client): the category editor. Props `{ language, config, onChange }`.
Composes `MonacoCodeEditor` (code) + `ParameterListEditor` (params); reads via `readCustomCode`,
writes via `writeCustomCode`, emits the whole next `config` through `onChange`. Holds the edit
model in local state seeded once from `config`, committing on every change and relying on
`key={node.id}` remount for reset — the same pattern (and for the same blank-name-row reason)
documented on `NodeConfigEditor`.

**`ParameterListEditor.tsx`** (client): ordered add / edit / remove of named parameters, structured
exactly like `NodeConfigEditor`'s row list (add button, per-row input + remove, index keys since a
row's identity is only its position). A freshly-added blank-name row survives in local state until
named (would otherwise be dropped by `writeCustomCode` on the first keystroke).

**DRUFF-11 registration**: one entry added at DRUFF-11's category registry/resolver — a category
descriptor whose predicate is `resolveCustomCodeLanguage(node) !== undefined` and whose component
renders `CustomCodeConfigEditor` with the resolved language. **The exact registry API (descriptor
field names, whether it takes `node` vs `config`, file location) is owned by DRUFF-11 and not yet
finalized** — see Notes. DRUFF-14's internals (pure module + editors) are independent of that shape;
only the thin registration wrapper binds to it, so a divergence in DRUFF-11's final API is a
localized adaptation, not a rework.

### Data flow

`NodeInspector` → (DRUFF-11 resolver) selects the custom-code category for a matching node →
renders `CustomCodeConfigEditor` bound to `node.data.config` + `updateNodeData(node.id, { config })`.
All persistence is the existing store path (`graph-store.updateNodeData`); save/load and YAML/JSON
round-trip are the existing `canvas-convert` + `serialize` path, unchanged.

### Files to touch / create

- **CREATE** `src/features/pipeline-canvas/inspector/customCodeConfig.ts` — pure types +
  `resolveCustomCodeLanguage`/`readCustomCode`/`writeCustomCode` + reserved-key constants.
- **CREATE** `src/features/pipeline-canvas/inspector/customCodeConfig.test.ts` — unit tests
  (language resolution table, read coercion of malformed input, param normalization: trim / drop
  blank / dedupe last-wins / first-occurrence order, code+params round-trip, empty-omission,
  unrelated-key preservation) — non-sensitive fixtures only (AC6).
- **CREATE** `src/features/pipeline-canvas/inspector/MonacoCodeEditor.tsx` — same-origin Monaco
  wrapper + `<textarea>` fallback.
- **CREATE** `src/features/pipeline-canvas/inspector/CustomCodeConfigEditor.tsx` — category editor.
- **CREATE** `src/features/pipeline-canvas/inspector/ParameterListEditor.tsx` — named-parameter list.
- **CREATE** `src/features/pipeline-canvas/inspector/CustomCodeConfigEditor.test.tsx` — component
  test for add/edit/remove and code-change propagation with **`MonacoCodeEditor` mocked** to a plain
  textarea (no real Monaco under jsdom).
- **REGISTER** at DRUFF-11's category seam (add one descriptor entry; location per DRUFF-11).
- **CONFIG for same-origin Monaco**: whichever of these DRUFF-11's/this ticket's code agent picks —
  either add a pinned `monaco-editor` dependency (bundled + lockfile updated per
  `steering/01-security.md` rule 4) or copy Monaco's `vs/` assets into `public/monaco/` at build and
  point `loader.config({ paths: { vs: "/monaco/vs" } })` at them. No new secret/env keys either way.
- **DOCS**: document the two reserved keys + the kind→language mapping in the module TSDoc (and the
  pipeline-canvas feature README if/when one exists), per `steering/languages/typescript.md`.

### Test seams

- Pure `customCodeConfig` functions are the AC6 unit target — no React, no store, no network.
- `CustomCodeConfigEditor` component test **mocks `MonacoCodeEditor`** (jsdom can't run Monaco;
  `steering/languages/typescript.md` puts real editor/canvas interaction in Playwright, not units).
- No network anywhere; fixtures carry only fake `code`/param names, never real/sensitive data.
- Real Monaco typing/highlighting, if exercised at all, is Playwright/e2e territory — **not** an AC
  here, so not required for this ticket.

### Trade-offs

1. **Top-level `code`/`parameters` vs nested `config.customCode`.** Chose top-level for readable
   YAML/JSON in the source view (DRUFF-5) and likely forward-alignment with a future Dander code
   field. Nesting was considered to avoid key collisions, but routing already isolates these nodes
   from the generic key/value editor, so collision isn't a live risk. Keys documented as reserved.
2. **Language derived, not stored** — single source of truth (node kind), no desync; costs a tiny
   resolver instead of a persisted field.
3. **Custom-API-connector identity = source-kind node with no `connectorId`.** No dedicated node
   kind/palette entry exists today (`NODE_KINDS` = source/transform/write/trigger), so this is the
   only available discriminator. Kept behind the config-driven resolver so a real kind later is a
   one-line change. **Flagged** — see Notes.
4. **Self-hosted Monaco + textarea fallback** over the default CDN loader — satisfies AC5's
   no-disallowed-external-host and graceful-degradation clauses and `steering/01-security.md` rule 4.
5. **Parameter normalization reuses `entriesToConfig` semantics** (trim / drop-blank / dedupe
   last-wins / first-occurrence order) rather than inventing new rules — consistency + reuses a
   pattern already tested and understood in this codebase.

### Ambiguities flagged (for product / DRUFF-11)

- **DRUFF-11 seam API is not finalized.** This design assumes a category registry with a
  `matches(node)`-style predicate + a `{ config, onChange }` component. If DRUFF-11 lands a
  different shape, only the registration wrapper adapts.
- **"Custom-API-connector node" is under-specified in the current model.** The module map calls it a
  distinct draggable kind, but no such kind/palette entry exists; this design treats a
  connector-less source node as one. Confirm whether a dedicated kind should be added (would be a
  separate ticket) or the source-without-connector interpretation stands.
- **Parameter shape.** AC says "named parameters," so parameters are modeled name-only
  (`{ name }`); if a default value / description / type is wanted, it's an extension of
  `CodeParameter` and its editor row — call it out before build if so.

## Implementation Notes

Implemented per Design, with files placed under `inspector/categories/` (matching the convention
DRUFF-12/13 actually established after this ticket's Design was written, which predates that and
names paths directly under `inspector/`) rather than restructuring the seam. One naming deviation:
the "thin registration wrapper" is its own file (`CustomCodeConfigCategory.tsx`, mirroring
`TriggerConfigCategory.tsx`/`ConnectorConfigCategory.tsx`'s pattern of pairing an
editor-adapter-plus-registration in one file) instead of being folded into `CustomCodeConfigEditor.tsx`,
so the latter stays exactly the seam-agnostic `{ language, config, onChange }` component the Design
specifies.

- **`categories/customCodeConfig.ts`** (new): `CodeLanguage`, `CodeParameter`, `CustomCodeView`,
  reserved-key constants `CUSTOM_CODE_KEY`/`CUSTOM_CODE_PARAMS_KEY`, and the pure
  `resolveCustomCodeLanguage`/`readCustomCode`/`writeCustomCode`. Language resolution: `transform`
  kind -> `sql` (table-driven, one entry, extensible); `source` kind with no `connectorId` -> `python`;
  everything else -> `undefined`. `writeCustomCode` reuses `entriesToConfig`'s
  trim/drop-blank/dedupe-last-wins/first-occurrence-order semantics for parameter names, and omits
  both `code`/`parameters` keys only when code is empty **and** no parameters survive (when code is
  non-empty, `parameters` is always written, even as `[]`, so a set-but-empty parameter list isn't
  conflated with "untouched").
- **`categories/customCodeConfig.test.ts`** (new): language-resolution table, read-coercion of
  malformed/non-string/non-array input, parameter trim/drop-blank/dedupe/order, round-trip,
  empty-omission (both directions: fresh and previously-written-then-cleared), unrelated-key
  preservation, no-mutation. Fixture-only values, no real/sensitive data.
- **`categories/MonacoCodeEditor.tsx`** (new): thin `@monaco-editor/react` `<Editor>` wrapper. Drives
  `loader.init()` itself (rather than trusting `<Editor>`'s own internal state) so a rejected load —
  confirmed by reading `@monaco-editor/loader`'s source: a `<script>` `onerror` calls `state.reject`
  — falls back to a plain controlled `<textarea aria-label="{language} code">`; a "Loading editor…"
  placeholder covers the in-flight window. The loader is pointed at `/monaco/vs` (same-origin) via
  `loader.config({ paths: { vs: "/monaco/vs" } })`, called through a module-scope-guarded
  `ensureMonacoLoaderConfigured()` — guarded because `@monaco-editor/loader` throws if `config()` runs
  again after any `init()` has already resolved, which a second `NodeInspector`-driven remount (a
  different node selected) would otherwise trigger.
- **`categories/ParameterListEditor.tsx`** (new): ordered add/edit/remove list, structured exactly
  like `NodeConfigEditor`'s rows (index keys, add button, per-row input + remove). Holds no local
  state of its own — `parameters` is fully controlled by its caller, since `CustomCodeConfigEditor`
  already owns the single local edit-model this ticket's Design calls for.
- **`categories/CustomCodeConfigEditor.tsx`** (new): composes a `next/dynamic(..., { ssr: false })`
  import of `MonacoCodeEditor` (a second, code-split-boundary loading placeholder distinct from
  `MonacoCodeEditor`'s own internal one) + `ParameterListEditor`. Holds `{ code, parameters }` as
  local state seeded once from `config` (`NodeConfigEditor`'s local-mirror pattern — a freshly-added
  blank-name parameter row must survive until named), commits every edit through `writeCustomCode`
  merged against the current `config` prop, and calls `onChange` immediately.
- **`categories/CustomCodeConfigCategory.tsx`** (new): the DRUFF-11 registration. `matches` is
  `resolveCustomCodeLanguage(node.data) !== undefined`; `Editor` resolves the language and renders
  `CustomCodeConfigEditor`, with a defensive `if (!language) return null` (mirrors
  `ConnectorConfigCategory`'s same-shaped guard). Exports `CUSTOM_CODE_CONFIG_CATEGORY`, appended last
  in `configCategories.ts`'s `CONFIG_CATEGORIES` array.
- **`categories/CustomCodeConfigEditor.test.tsx`** / **`categories/CustomCodeConfigCategory.test.tsx`**
  (new): component tests with `MonacoCodeEditor` mocked to a plain textarea via `vi.mock` (the mock is
  resolved correctly through the `next/dynamic`/`import()` indirection). Cover: empty/existing
  code+parameters rendering, code-edit propagation, add/name/remove-parameter propagation, a
  not-yet-named row surviving in the UI without being written to config, clearing everything back to
  an omitted-keys config, and unrelated-key preservation. Plus the registration's `matches` table and
  a smoke-render of the adapter.
- **Same-origin Monaco (AC5 + `steering/01-security.md` rule 4)**: added `monaco-editor` as a pinned
  dependency (`^0.56.0`, matching the version already resolved transitively as `@monaco-editor/react`'s
  peer dependency — `pnpm install --offline` updated `pnpm-lock.yaml` with no network access needed)
  rather than leaving Monaco's default jsDelivr CDN loader in place. Added
  `scripts/copy-monaco-assets.mjs`, which resolves `monaco-editor`'s installed `min/vs` directory
  (via `require.resolve("monaco-editor")`, since the package's `exports` map has no `"./package.json"`
  subpath) and copies it to `public/monaco/vs`; wired into `package.json`'s `dev`/`build` scripts
  directly (`node scripts/copy-monaco-assets.mjs && next ...`) rather than a `postinstall` hook of this
  package, per steering's flag on install-time scripts as a supply-chain vector — this is an explicit
  build step over our own pinned dependency, not implicit at install time. `public/monaco/` is
  git-ignored (~24MB generated output, regenerated from `node_modules`) and added to
  `.prettierignore`/`eslint.config.mjs`'s ignores (it isn't hand-authored source).
- **Registration**: `CUSTOM_CODE_CONFIG_CATEGORY` appended to `configCategories.ts`'s
  `CONFIG_CATEGORIES`. It is **not** mutually exclusive with `HTTP_REQUEST_CONFIG_CATEGORY`
  (DRUFF-12) for a connector-less `source` node — both match and co-render, exactly the case
  DRUFF-11's Design flagged ("a future custom-API-connector node showing both HTTP settings and a
  custom-code editor"). This changed two pre-existing test expectations (not this ticket's own logic,
  but downstream of registering a second category against an already-tested node shape):
  `configCategories.test.ts`'s "plain source node -> HTTP request category" now expects
  `["http-request", "custom-code"]`, and `NodeInspector.test.tsx`'s generic-key/value-editor fixture
  (previously `kind: "transform"`, now also matched by custom-code) was changed to `kind: "write"` —
  the one kind no registered category (connector/HTTP/trigger/custom-code) matches, so it's still a
  true generic-fallback case. Both changes are documented inline at the edit site.
- **No execution, ever**: confirmed by construction — `customCodeConfig.ts` only reads/writes strings
  and name-only records; `MonacoCodeEditor` only renders `<Editor>`/`<textarea>`; nothing in this
  ticket parses, evaluates, or runs the authored code (AC4).

**Deviation from Design**: none in the pure-logic module (`customCodeConfig.ts` matches the Design's
interface sketch exactly). The one addition beyond the Design's file list is
`CustomCodeConfigCategory.tsx` as a standalone file (see above) and its accompanying test file — both
additive, not a change to the specified public interfaces.

**Verification**: `pnpm test` (437/437 passed, 35 files), `pnpm typecheck` (clean), `pnpm lint`
(clean — added `public/monaco/**` to `eslint.config.mjs`'s ignores so the generated vendor JS isn't
linted), `pnpm format:check` (clean except the pre-existing, untouched `README.md` warning — confirmed
via `git diff --stat README.md` showing no changes from this ticket). Manually ran
`node scripts/copy-monaco-assets.mjs` twice to confirm it's idempotent and safe to run on every
`dev`/`build`.

## Review Log

_Append-only. PR-Review adds entries below._

### 2026-07-23 — PR-Review — **PASS**

Reviewed implementation against all seven acceptance criteria, the three universal steering files,
and `steering/languages/typescript.md`. Inspected every named file plus the DRUFF-11 seam wiring
and the DRUFF-4 config passthrough. All criteria met with no blocking issues.

- **AC1 (category + Monaco per kind):** `CUSTOM_CODE_CONFIG_CATEGORY` is registered in
  `configCategories.ts`; `resolveCustomCodeLanguage` maps `transform` → SQL and a connector-less
  `source` → Python; `NodeInspector` renders it via `resolveConfigCategories`. Wiring
  NodeInspector → category → `CustomCodeConfigEditor` → `MonacoCodeEditor` verified end-to-end.
- **AC2 (named parameters):** `ParameterListEditor` provides ordered add/edit/remove; covered by
  component tests.
- **AC3 (persist + round-trip, opaque string):** writes `config.code` (string) and
  `config.parameters` (array) via `writeCustomCode` → `onChange` → `updateNodeData`. Confirmed
  structurally that `schema.ts` types `config` as `z.record(z.string(), z.unknown())` and
  `canvas-convert.ts` passes `config` through untouched in both directions (lines 74/134), so
  string+array values round-trip with no DRUFF-4 change. Reserved keys are named constants and
  documented.
- **AC4 (never executes):** verified by construction — nothing parses/evaluates/runs the code;
  no client-side runtime added. UI copy states this to the user.
- **AC5 (same-origin assets + graceful degradation):** `loader.config({ paths: { vs: "/monaco/vs" }})`
  points at self-hosted assets (no CDN); `scripts/copy-monaco-assets.mjs` verified to resolve
  `monaco-editor/min/vs` and copy `loader.js` + language bundles into `public/monaco/vs`. The
  wrapper drives `loader.init()` and falls back to a controlled `<textarea aria-label>` on failure,
  with a loading placeholder in between. Loader config is module-scope-guarded (no module-scope
  side effect).
- **AC6 (unit tests, non-sensitive fixtures):** `customCodeConfig.test.ts` covers language
  resolution, read coercion of malformed input, param trim/drop-blank/dedupe-last-wins/order,
  round-trip, empty-omission (both directions), unrelated-key preservation, and no-mutation.
  Fixture-only values.
- **AC7 (no steering violations):** no hardcoded secrets in the DRUFF-14 diff; no new env keys
  needed; `monaco-editor` pinned with lockfile updated; generated `public/monaco/` git-ignored and
  excluded from lint/prettier; build step wired explicitly (not a `postinstall`), per rule 4. TSDoc
  present on every export.

Security: credential-shaped grep over the ticket's files was clean (only hits were DRUFF-12's http
fixtures, out of scope, and clearly fake). Verification reproduced locally: `pnpm test` 437/437,
`pnpm typecheck` clean, `pnpm lint` clean, `pnpm format:check` clean except the pre-existing,
untouched `README.md` warning (confirmed `git diff README.md` empty). The two adjusted pre-existing
test expectations (`configCategories.test.ts`, `NodeInspector.test.tsx`) are correct downstream
consequences of registering a second matching category for a connector-less source / transform
node, documented inline. Copy script confirmed idempotent across repeated runs.
