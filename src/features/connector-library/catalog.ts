import { localNetworkRequest } from "@/lib/local-network-request";
import { PluginCatalogResponseSchema } from "@/lib/dander-contracts";
import type { PluginCatalogRecord } from "@/generated/dander-contracts/types/plugin-catalog";

export type PluginCatalogConnector = Omit<PluginCatalogRecord, "installed_version"> & {
  installed_version: string | null;
};

export interface PluginCatalogDiscovery {
  load(): Promise<PluginCatalogConnector[]>;
}

export class PluginCatalogDiscoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PluginCatalogDiscoveryError";
  }
}

type FetchCatalog = typeof fetch;

/** Loads Dander's curated presentation-only catalog without installing or activating packages. */
export class DanderApiPluginCatalogDiscovery implements PluginCatalogDiscovery {
  private readonly endpoint: string;
  private readonly fetchCatalog: FetchCatalog;

  constructor(
    baseUrl = "http://127.0.0.1:8765",
    fetchCatalog: FetchCatalog = globalThis.fetch.bind(globalThis),
  ) {
    this.endpoint = `${baseUrl.replace(/\/$/, "")}/v1/plugin-catalog`;
    this.fetchCatalog = fetchCatalog;
  }

  async load(): Promise<PluginCatalogConnector[]> {
    const response = await this.fetchCatalog(
      this.endpoint,
      localNetworkRequest({
        method: "GET",
        headers: { Accept: "application/json" },
      }),
    );
    if (response.status === 404) return [];
    if (!response.ok) {
      throw new PluginCatalogDiscoveryError(
        `Dander plugin catalog failed (${response.status} ${response.statusText}).`,
      );
    }
    const parsed = PluginCatalogResponseSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new PluginCatalogDiscoveryError(
        "Dander returned plugin-catalog metadata this Druff version cannot safely use.",
      );
    }
    return (parsed.data.connectors ?? []).map((connector) => ({
      ...connector,
      installed_version: connector.installed_version ?? null,
    }));
  }
}
