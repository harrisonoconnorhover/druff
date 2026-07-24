"use client";

import { resolveCustomCodeLanguage } from "@/features/pipeline-canvas/inspector/categories/customCodeConfig";
import { CustomCodeConfigEditor } from "@/features/pipeline-canvas/inspector/categories/CustomCodeConfigEditor";
import type {
  ConfigCategory,
  ConfigCategoryEditorProps,
} from "@/features/pipeline-canvas/inspector/configCategories";

/**
 * Thin adapter binding {@link CustomCodeConfigEditor} (DRUFF-14) — whose own props are
 * `{ language, config, onChange }`, independent of any particular inspector seam — to the DRUFF-11
 * config-category seam (`node` in, `onConfigChange(config)` out). Resolves the language once via
 * `resolveCustomCodeLanguage` and passes it straight down.
 *
 * The `undefined`-language branch is defensive only: {@link CUSTOM_CODE_CONFIG_CATEGORY}'s
 * `matches` guarantees a language is always resolvable whenever `resolveConfigCategories` actually
 * selects this editor, so a real user never hits it — mirrors `ConnectorConfigCategory`'s
 * `if (!connector) return null` for the same reason (fail soft for a direct/test caller that
 * bypasses `matches`, rather than a non-null assertion that throws).
 */
function CustomCodeCategoryEditor({ node, onConfigChange }: ConfigCategoryEditorProps) {
  const language = resolveCustomCodeLanguage(node.data);
  if (!language) return null;

  return (
    <CustomCodeConfigEditor
      language={language}
      config={node.data.config}
      onChange={onConfigChange}
    />
  );
}

/**
 * Registration for {@link CustomCodeCategoryEditor} at the DRUFF-11 config-category seam: matches
 * any node `resolveCustomCodeLanguage` resolves a language for — a `transform`-kind node (SQL), or
 * a `source`-kind node with no `connectorId` (Python, standing in for a not-yet-modeled
 * custom-API-connector kind; see `customCodeConfig.ts`'s doc comment and this ticket's Design
 * "Custom-API-connector identity" trade-off/flag).
 *
 * Deliberately **not** mutually exclusive with `HTTP_REQUEST_CONFIG_CATEGORY` (DRUFF-12), which
 * matches that same connector-less `source` node: both co-render for it, per DRUFF-11's Design
 * ("categories that aren't mutually exclusive... a future custom-API-connector node showing both
 * HTTP settings and a custom-code editor").
 */
export const CUSTOM_CODE_CONFIG_CATEGORY: ConfigCategory = {
  id: "custom-code",
  label: "Custom code",
  matches: (node) => resolveCustomCodeLanguage(node.data) !== undefined,
  Editor: CustomCodeCategoryEditor,
};
