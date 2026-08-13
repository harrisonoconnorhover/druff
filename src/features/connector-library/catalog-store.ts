import type { PluginCatalogConnector } from "@/features/connector-library/catalog";
import { PluginCatalogResponseSchema } from "@/lib/dander-contracts";

let pluginCatalogSnapshot: PluginCatalogConnector[] = [];
const listeners = new Set<() => void>();

/** Replaces the catalog atomically after validating every Dander-owned entry. */
export function setPluginCatalog(connectors: PluginCatalogConnector[]): void {
  const parsed = PluginCatalogResponseSchema.parse({ dander_version: "druff-store", connectors });
  pluginCatalogSnapshot = (parsed.connectors ?? []).map((connector) => ({
    ...connector,
    installed_version: connector.installed_version ?? null,
  }));
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
