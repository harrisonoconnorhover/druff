import type { PipelineNodeData } from "@/lib/pipeline-graph";

/**
 * Pure config<->view mapping for the custom-code config category (DRUFF-14): reusable custom
 * Python for a custom-API-connector node, or custom BigQuery SQL for a transform-layer node — see
 * `steering/00-project-overview.md`'s "Custom API connectors"/"Transform layers" modules. Kept
 * free of React and the store so language resolution and the config<->model mapping — the whole of
 * this ticket's AC6 unit target — are testable without rendering anything, exactly as
 * `nodeConfig.ts` (DRUFF-3) and `httpRequestConfig.ts` (DRUFF-12) are.
 *
 * Per the "Druff never executes user code" non-goal (and its Decision Log entry), `code` is stored
 * and round-tripped only — never parsed for evaluation, executed, or run as a preview. This module
 * doesn't even syntax-check it; that's Dander's job when it actually runs the pipeline.
 */

/** The two languages a custom-code node can carry, resolved from the node's kind — never stored,
 *  never chosen directly by the user (see {@link resolveCustomCodeLanguage}). */
export type CodeLanguage = "python" | "sql";

/** One named parameter alongside the authored code. Name-only per the Acceptance Criteria's
 *  "named parameters" — see this ticket's Design "Parameter shape" flag for extending this if a
 *  default value/description/type is wanted later. */
export type CodeParameter = { name: string };

/** The editable view this category's editor renders/edits. */
export type CustomCodeView = {
  code: string;
  parameters: CodeParameter[];
};

/**
 * Reserved, documented `config` keys this category owns. Both live in the `extra="allow"` bucket
 * of Dander's typed per-node-type config (`SourceNodeConfig`/`TransformNodeConfig` declare no
 * dedicated code field yet — see this ticket's Design), so they round-trip losslessly through
 * Dander without a schema change on either side. Named constants (not inline literals) so every
 * read/write site and every other category that might inspect `config` agrees on the exact
 * spelling.
 */
export const CUSTOM_CODE_KEY = "code";
export const CUSTOM_CODE_PARAMS_KEY = "parameters";

/**
 * Kind -> language table (config-driven per `steering/02-engineering.md`): a `transform` node
 * authors SQL (Dander's Transform module runs BigQuery SQL), a custom-API-connector node authors
 * Python. Extending the set of custom-code-bearing kinds later is a one-line change here rather
 * than new branches at every call site.
 */
const KIND_LANGUAGE: Partial<Record<PipelineNodeData["kind"], CodeLanguage>> = {
  transform: "sql",
};

/**
 * Resolves which language (if any) a node's custom-code category should use, deriving it from the
 * node's kind/connector rather than storing a `language` key — a stored language would be a
 * second, drift-prone source of truth once the node's kind is the single thing that actually
 * determines it (this ticket's Design "Language derived, not stored").
 *
 * Returns `undefined` for a node this category doesn't apply to at all (a pre-made connector,
 * write, or trigger node) — the DRUFF-11 registration's `matches` predicate is exactly
 * `resolveCustomCodeLanguage(node) !== undefined`.
 *
 * A `transform`-kind node always resolves to `sql`. A `source`-kind node with **no** `connectorId`
 * is treated as a custom API connector (no dedicated node kind exists yet for this — see this
 * ticket's Design "Custom-API-connector identity" trade-off/flag) and resolves to `python`; a
 * `source` node that *does* carry a `connectorId` is a pre-made connector (DRUFF-6) and doesn't
 * get this category at all, regardless of whether that `connectorId` resolves in the registry.
 */
export function resolveCustomCodeLanguage(
  node: Pick<PipelineNodeData, "kind" | "connectorId">,
): CodeLanguage | undefined {
  if (node.kind === "source") {
    return node.connectorId == null ? "python" : undefined;
  }
  return KIND_LANGUAGE[node.kind];
}

/** Narrows `value` to a plain object record (excludes `null`/arrays) — the shape a round-tripped
 *  `config.parameters` must have per-entry to be readable at all. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Normalizes an arbitrary round-tripped `config.parameters` value into `CodeParameter[]`, lenient
 * on malformed input rather than throwing: a non-array value yields no parameters; a non-object or
 * nameless entry is dropped; a non-string `name` is dropped. This only guards against a graph
 * edited outside Druff (or a stale/hand-written fixture) — this category itself never writes a
 * malformed entry.
 */
function normalizeParameters(value: unknown): CodeParameter[] {
  if (!Array.isArray(value)) return [];
  const parameters: CodeParameter[] = [];
  for (const entry of value) {
    if (isRecord(entry) && typeof entry.name === "string") {
      parameters.push({ name: entry.name });
    }
  }
  return parameters;
}

/**
 * Reads a node's custom code out of its raw `config`, defaulting every field so a fresh/untouched
 * node (no `code`/`parameters` keys at all) still renders a valid, all-defaults view rather than
 * throwing. Never mutates `config`. Coerces a non-string `code` to `""` and normalizes
 * `parameters` (see {@link normalizeParameters}) rather than trusting arbitrary round-tripped
 * input.
 */
export function readCustomCode(config: Record<string, unknown> | undefined): CustomCodeView {
  const rawCode = config?.[CUSTOM_CODE_KEY];
  return {
    code: typeof rawCode === "string" ? rawCode : "",
    parameters: normalizeParameters(config?.[CUSTOM_CODE_PARAMS_KEY]),
  };
}

/**
 * Writes an edited {@link CustomCodeView} back onto a **copy** of `config`, preserving every key
 * this category doesn't own. Never mutates `config`.
 *
 * Parameter names are trimmed; a blank name is dropped (mirrors a freshly-added, not-yet-named
 * row the same way `entriesToConfig` drops a blank-key config row); a duplicate (trimmed) name is
 * resolved last-wins while keeping first-occurrence order — the same semantics
 * `entriesToConfig`/`nodeConfig.ts` already established and unit-tests, reused here rather than
 * inventing a second rule for "the same shape of problem."
 *
 * When the resulting `code` is empty **and** no parameters survive, both `CUSTOM_CODE_KEY` and
 * `CUSTOM_CODE_PARAMS_KEY` are omitted entirely, so an untouched node's `config` stays clean rather
 * than accumulating `code: ""`/`parameters: []`.
 */
export function writeCustomCode(
  config: Record<string, unknown> | undefined,
  model: CustomCodeView,
): Record<string, unknown> {
  const nextConfig: Record<string, unknown> = { ...(config ?? {}) };

  const parameterOrder: string[] = [];
  const parameterSeen = new Set<string>();
  for (const { name } of model.parameters) {
    const trimmedName = name.trim();
    if (trimmedName === "") continue;
    if (!parameterSeen.has(trimmedName)) {
      parameterOrder.push(trimmedName);
      parameterSeen.add(trimmedName);
    }
  }
  const parameters: CodeParameter[] = parameterOrder.map((name) => ({ name }));

  if (model.code === "" && parameters.length === 0) {
    delete nextConfig[CUSTOM_CODE_KEY];
    delete nextConfig[CUSTOM_CODE_PARAMS_KEY];
    return nextConfig;
  }

  nextConfig[CUSTOM_CODE_KEY] = model.code;
  nextConfig[CUSTOM_CODE_PARAMS_KEY] = parameters;
  return nextConfig;
}
