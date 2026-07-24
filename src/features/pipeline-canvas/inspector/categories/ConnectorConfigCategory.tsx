"use client";

import { getConnector } from "@/features/connector-library/registry";
import { validateConnectorConfig } from "@/features/connector-library/validateConnectorConfig";
import { ConnectorConfigForm } from "@/features/connector-library/ConnectorConfigForm";
import { configToEntries, entriesToConfig } from "@/features/pipeline-canvas/inspector/nodeConfig";
import type {
  ConfigCategory,
  ConfigCategoryEditorProps,
} from "@/features/pipeline-canvas/inspector/configCategories";

/**
 * The descriptor-driven connector config editor (DRUFF-6), moved verbatim behind the DRUFF-11
 * config-category seam. Applies only to a node whose `connectorId` resolves to a registered
 * descriptor — a node with an unknown/stale `connectorId` falls through to the generic fallback
 * (AC2) rather than rendering a broken form.
 */
function ConnectorConfigEditor({ node, onConfigChange }: ConfigCategoryEditorProps) {
  const connector = node.data.connectorId ? getConnector(node.data.connectorId) : undefined;
  // Coerces the node's live `config` (`Record<string, unknown> | undefined`) into the string-keyed
  // record `ConnectorConfigForm`/`validateConnectorConfig` expect, reusing `NodeConfigEditor`'s
  // already-tested key/value mapping rather than duplicating the string-coercion logic here.
  const stringConfig = entriesToConfig(configToEntries(node.data.config));

  // Defensive only: `matches` below guarantees `connector` is defined whenever this editor is
  // actually selected by `resolveConfigCategories`. Kept instead of a non-null assertion so a
  // future caller of this component directly (e.g. a test) fails soft, not with a thrown error.
  if (!connector) return null;

  return (
    <ConnectorConfigForm
      descriptor={connector}
      config={stringConfig}
      errors={validateConnectorConfig(connector, stringConfig)}
      onChange={(key, value) => onConfigChange({ ...stringConfig, [key]: value })}
    />
  );
}

/**
 * Registration for {@link ConnectorConfigEditor}: matches a node whose `connectorId` names a
 * registered pre-made connector (DRUFF-6). A node with no `connectorId`, or one that doesn't
 * resolve in the registry, doesn't match — `resolveConfigCategories` falls it through to the
 * generic key/value editor instead (AC2).
 */
export const CONNECTOR_CONFIG_CATEGORY: ConfigCategory = {
  id: "connector",
  label: "Connector config",
  matches: (node) => node.data.connectorId != null && getConnector(node.data.connectorId) != null,
  Editor: ConnectorConfigEditor,
};
