"use client";

import { NodeConfigEditor } from "@/features/pipeline-canvas/inspector/NodeConfigEditor";
import type { ConfigCategoryEditorProps } from "@/features/pipeline-canvas/inspector/configCategories";

/**
 * Thin adapter binding the generic key/value `NodeConfigEditor` (DRUFF-3) to the DRUFF-11
 * config-category seam. `NodeConfigEditor`'s `Record<string, string>` `onChange` is
 * assignment-compatible with the seam's `Record<string, unknown>` `onConfigChange`, so this is
 * pure wiring — no behavior of its own. Registered as {@link GENERIC_CONFIG_CATEGORY}'s `Editor`
 * in `configCategories.ts`; never matched directly, only reached as the resolver's last-resort
 * fallback for a node with no other matching category (AC2).
 *
 * No `key={node.id}` here on `NodeConfigEditor` itself — `NodeInspector` already keys this whole
 * category's wrapper `div` on `${node.id}:${category.id}`, which remounts this component (and so
 * `NodeConfigEditor`'s local row-list state) whenever the selected node changes.
 */
export function GenericConfigCategory({ node, onConfigChange }: ConfigCategoryEditorProps) {
  return <NodeConfigEditor config={node.data.config} onChange={onConfigChange} />;
}
