import { z } from "zod";
import { localNetworkRequest } from "@/lib/local-network-request";

export const PluginCatalogConnectorSchema = z
  .object({
    id: z.string().min(1),
    display_name: z.string().min(1),
    description: z.string(),
    distribution: z.string().min(1),
    version: z.string().min(1),
    dander_specifier: z.string().min(1),
    compatible: z.boolean(),
    support_status: z.string().min(1),
    validation_status: z.string().min(1),
    documentation_url: z.url(),
    pypi_url: z.url(),
    repository_url: z.url(),
    installed: z.boolean(),
    installed_version: z.string().min(1).nullable(),
  })
  .strict()
  .superRefine((connector, context) => {
    if (connector.installed !== (connector.installed_version !== null)) {
      context.addIssue({
        code: "custom",
        message: "installed and installed_version must agree",
        path: ["installed_version"],
      });
    }
  });

const PluginCatalogSchema = z
  .object({
    schema_version: z.literal(1),
    dander_version: z.string().min(1),
    connectors: z.array(PluginCatalogConnectorSchema),
  })
  .strict();

export type PluginCatalogConnector = z.infer<typeof PluginCatalogConnectorSchema>;

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
    const parsed = PluginCatalogSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new PluginCatalogDiscoveryError(
        "Dander returned plugin-catalog metadata this Druff version cannot safely use.",
      );
    }
    return parsed.data.connectors;
  }
}
