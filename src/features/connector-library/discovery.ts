import { z } from "zod";
import {
  ConnectorDescriptorSchema,
  type ConnectorDescriptor,
} from "@/features/connector-library/descriptors/types";
import { localNetworkRequest } from "@/lib/local-network-request";

const DanderConnectorFieldSchema = z
  .object({
    name: z.string().min(1),
    display_name: z.string().min(1),
    data_type: z.string().min(1),
    required: z.boolean(),
  })
  .strict();

const DanderConnectorEndpointSchema = z
  .object({
    id: z.string().min(1),
    display_name: z.string().min(1),
    graph_binding: z.object({ connector: z.string().min(1), endpoint: z.string().min(1) }).strict(),
    fields: z.array(DanderConnectorFieldSchema),
  })
  .strict();

const DanderConnectorSchema = z
  .object({
    id: z.string().min(1),
    display_name: z.string().min(1),
    engine: z.string().min(1),
    description: z.string(),
    plugin: z
      .object({
        id: z.string().min(1),
        distribution: z.string().min(1),
        version: z.string().min(1),
      })
      .strict(),
    endpoints: z.array(DanderConnectorEndpointSchema).min(1),
  })
  .strict();

const DanderConnectorCatalogSchema = z
  .object({ connectors: z.array(DanderConnectorSchema) })
  .strict();

export interface ConnectorDiscovery {
  load(): Promise<ConnectorDescriptor[]>;
}

export class ConnectorDiscoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConnectorDiscoveryError";
  }
}

type FetchConnectors = typeof fetch;

/** Reads Dander's presentation-only connector catalog and projects it into Druff descriptors. */
export class DanderApiConnectorDiscovery implements ConnectorDiscovery {
  private readonly endpoint: string;
  private readonly fetchConnectors: FetchConnectors;

  constructor(
    baseUrl = "http://127.0.0.1:8765",
    fetchConnectors: FetchConnectors = globalThis.fetch.bind(globalThis),
  ) {
    this.endpoint = `${baseUrl.replace(/\/$/, "")}/v1/connectors`;
    this.fetchConnectors = fetchConnectors;
  }

  async load(): Promise<ConnectorDescriptor[]> {
    const response = await this.fetchConnectors(
      this.endpoint,
      localNetworkRequest({
        method: "GET",
        headers: { Accept: "application/json" },
      }),
    );
    // Dander versions before connector discovery remain usable with Druff's static Greenhouse
    // fallback. Other errors are real service failures and are surfaced to the caller.
    if (response.status === 404) return [];
    if (!response.ok) {
      throw new ConnectorDiscoveryError(
        `Dander connector discovery failed (${response.status} ${response.statusText}).`,
      );
    }
    const parsed = DanderConnectorCatalogSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new ConnectorDiscoveryError(
        "Dander returned connector metadata this Druff version cannot safely use.",
      );
    }
    return parsed.data.connectors.flatMap(projectConnector);
  }
}

function projectConnector(connector: z.infer<typeof DanderConnectorSchema>): ConnectorDescriptor[] {
  return connector.endpoints.map((endpoint) => {
    if (
      endpoint.graph_binding.connector !== connector.id ||
      endpoint.graph_binding.endpoint !== endpoint.id
    ) {
      throw new ConnectorDiscoveryError(
        `Dander connector ${connector.id} returned an inconsistent graph binding.`,
      );
    }
    const id = connector.endpoints.length === 1 ? connector.id : `${connector.id}:${endpoint.id}`;
    return ConnectorDescriptorSchema.parse({
      id,
      name:
        connector.endpoints.length === 1
          ? connector.display_name
          : `${connector.display_name} · ${endpoint.display_name}`,
      kind: "source",
      danderType: "source",
      danderConnector: endpoint.graph_binding.connector,
      fields: [
        {
          key: "connector",
          label: "Dander connector",
          type: "text",
          required: true,
          defaultValue: endpoint.graph_binding.connector,
          help: "Connector YAML name. API and authentication settings remain owned by Dander.",
        },
        {
          key: "endpoint",
          label: "Endpoint",
          type: "text",
          required: true,
          defaultValue: endpoint.graph_binding.endpoint,
          help: "Endpoint name declared by the installed Dander connector plugin.",
        },
      ],
      outputFields: endpoint.fields.map((field) => ({
        name: field.name,
        type: field.data_type,
        nullable: !field.required,
        description: field.display_name,
        metadata: {},
      })),
      plugin: {
        distribution: connector.plugin.distribution,
        version: connector.plugin.version,
      },
    });
  });
}
