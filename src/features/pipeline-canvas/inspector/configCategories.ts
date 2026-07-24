import type { ComponentType } from "react";
import type { Node } from "@xyflow/react";
import type { PipelineNodeData } from "@/lib/pipeline-graph";
import { CONNECTOR_CONFIG_CATEGORY } from "@/features/pipeline-canvas/inspector/categories/ConnectorConfigCategory";
import { GenericConfigCategory } from "@/features/pipeline-canvas/inspector/categories/GenericConfigCategory";
import { HTTP_REQUEST_CONFIG_CATEGORY } from "@/features/pipeline-canvas/inspector/categories/http/category";
import { TRIGGER_CONFIG_CATEGORY } from "@/features/pipeline-canvas/inspector/categories/TriggerConfigCategory";
import { CUSTOM_CODE_CONFIG_CATEGORY } from "@/features/pipeline-canvas/inspector/categories/CustomCodeConfigCategory";
import { WRITER_CONFIG_CATEGORY } from "@/features/pipeline-canvas/inspector/categories/writer/category";

/**
 * Uniform seam every config category editor is bound to (DRUFF-11): full node in, full config out.
 * We pass the whole node (not just `config`) because categories key off different slices of it —
 * the connector category off `connectorId`, a future HTTP/custom-code category (DRUFF-12/14) off
 * `kind`/`type` — so the prop list doesn't grow with every new category.
 */
export type ConfigCategoryEditorProps = {
  node: Node<PipelineNodeData>;
  /** Persists the node's *entire* config (categories merge onto `node.data.config` themselves,
   *  since `updateNodeData` replaces `config` wholesale — it does not deep-merge). */
  onConfigChange: (config: Record<string, unknown>) => void;
};

/**
 * One entry in the config-category registry (DRUFF-11): a predicate deciding whether it applies to
 * a given node, plus the editor to render when it does. Adding a new category (DRUFF-12/13/14) is
 * appending one `ConfigCategory` to `CONFIG_CATEGORIES` — a data change, not a new branch in
 * `NodeInspector` — per the config-driven rule in `steering/02-engineering.md`.
 */
export type ConfigCategory = {
  /** Stable id for React keys + tests, e.g. `"connector"` | `"generic"` | `"http"`. */
  id: string;
  /** Sub-heading shown only when more than one category co-renders for the same node (the
   *  single-match case, true for every node today, hides it). */
  label: string;
  /** Pure, side-effect-free: does this category apply to the node? Mutual exclusion between
   *  categories (e.g. a pre-made connector node should not also show a raw HTTP editor) is each
   *  predicate's own responsibility; registration order is the tie-break when two both match. */
  matches: (node: Node<PipelineNodeData>) => boolean;
  /** Editor rendered for a matched node; may be a `next/dynamic` import (DRUFF-14's Monaco). */
  Editor: ComponentType<ConfigCategoryEditorProps>;
};

/**
 * Explicit last-resort fallback for a node that matches no registered category. Deliberately kept
 * out of `CONFIG_CATEGORIES` (its `matches` is unused — `resolveConfigCategories` reaches for it
 * directly) so it can never accidentally be skipped by list order.
 */
export const GENERIC_CONFIG_CATEGORY: ConfigCategory = {
  id: "generic",
  label: "Config",
  matches: () => true,
  Editor: GenericConfigCategory,
};

/**
 * Ordered registry of known config categories. DRUFF-12/13/14 each append ONE entry here — the
 * seam this ticket exists to establish (AC3). `HTTP_REQUEST_CONFIG_CATEGORY` (DRUFF-12) is
 * registered after `CONNECTOR_CONFIG_CATEGORY` and excludes any node the connector category
 * already matches (its own `matches` requires no `connectorId`), so registration order here is
 * cosmetic for this pair — each predicate already enforces mutual exclusion.
 *
 * `TRIGGER_CONFIG_CATEGORY` (DRUFF-13) matches only `kind === "trigger"` nodes, a kind no other
 * registered category's predicate matches (the connector/HTTP categories both key off a `source`
 * node), so its position in this list is likewise cosmetic — included for readability, grouped
 * with the other node-kind-specific categories.
 *
 * `CUSTOM_CODE_CONFIG_CATEGORY` (DRUFF-14) matches a `transform`-kind node (SQL) or a
 * connector-less `source`-kind node (Python) — the latter is the **same** predicate
 * `HTTP_REQUEST_CONFIG_CATEGORY` uses, so for that node kind both categories match and co-render,
 * by design (DRUFF-11's Design flagged exactly this: "a future custom-API-connector node showing
 * both HTTP settings and a custom-code editor"). Registered last so, when both match, HTTP settings
 * render above the code editor.
 *
 * `WRITER_CONFIG_CATEGORY` (DRUFF-17) matches only `kind === "write"` nodes, a kind no other
 * registered category's predicate matches (connector/HTTP/custom-code key off `source`, trigger
 * off `trigger`), so its position in this list is likewise cosmetic — it was the one remaining
 * node kind that fell through to the generic fallback before this ticket.
 */
export const CONFIG_CATEGORIES: ConfigCategory[] = [
  CONNECTOR_CONFIG_CATEGORY,
  HTTP_REQUEST_CONFIG_CATEGORY,
  TRIGGER_CONFIG_CATEGORY,
  CUSTOM_CODE_CONFIG_CATEGORY,
  WRITER_CONFIG_CATEGORY,
];

/**
 * Resolves the ordered list of config categories a node's inspector Config section should render.
 * Returns every matching category, in registration order, so categories that aren't mutually
 * exclusive (e.g. a future custom-API-connector node showing both HTTP settings and a custom-code
 * editor, DRUFF-12/14) can co-exist instead of fighting over a single slot. Guarantees a non-empty
 * result by falling back to `fallback` (the generic key/value editor) when nothing matches (AC2) —
 * the fallback guarantee lives here, inside the tested resolver, rather than in the caller.
 *
 * `categories`/`fallback` are injectable so the resolution algorithm itself is unit-testable with
 * fixture categories, independent of the real component registry.
 */
export function resolveConfigCategories(
  node: Node<PipelineNodeData>,
  categories: ConfigCategory[] = CONFIG_CATEGORIES,
  fallback: ConfigCategory = GENERIC_CONFIG_CATEGORY,
): ConfigCategory[] {
  const matched = categories.filter((category) => category.matches(node));
  return matched.length > 0 ? matched : [fallback];
}
