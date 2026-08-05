import {
  PluginCatalogConnectorSchema,
  type PluginCatalogConnector,
} from "@/features/connector-library/catalog";

let pluginCatalogSnapshot: PluginCatalogConnector[] = [];
const listeners = new Set<() => void>();

/** Replaces the catalog atomically after validating every Dander-owned entry. */
export function setPluginCatalog(connectors: PluginCatalogConnector[]): void {
  pluginCatalogSnapshot = connectors.map((connector) =>
    PluginCatalogConnectorSchema.parse(connector),
  );
  for (const listener of listeners) listener();
}

/** Clears server-owned catalog metadata when discovery is unavailable. */
export function clearPluginCatalog(): void {
  pluginCatalogSnapshot = [];
  for (const listener of listeners) listener();
}

/** React external-store seam for the catalog dialog. */
export function subscribePluginCatalog(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPluginCatalogSnapshot(): PluginCatalogConnector[] {
  return pluginCatalogSnapshot;
}
