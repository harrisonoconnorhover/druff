import { localNetworkRequest } from "@/lib/local-network-request";
import { OperationCatalogResponseSchema } from "@/lib/dander-contracts";
import type {
  OperationDescriptor as GeneratedOperationDescriptor,
  OperationParameter as GeneratedOperationParameter,
} from "@/generated/dander-contracts/types/operation-catalog";
import {
  ComparisonOperatorSchema,
  type ComparisonOperator,
} from "@/features/pipeline-operations/operationConfig";
import type { HostedControlFetch } from "@/features/hosted-control/authorized-fetch";

type OperationParameter = Omit<GeneratedOperationParameter, "operators"> & {
  operators?: ComparisonOperator[];
};

export type OperationDescriptor = Omit<GeneratedOperationDescriptor, "parameters"> & {
  parameters: OperationParameter[];
};

function normalizeOperation(operation: GeneratedOperationDescriptor): OperationDescriptor {
  return {
    ...operation,
    parameters: (operation.parameters ?? []).map((parameter) => ({
      ...parameter,
      operators: parameter.operators?.flatMap((operator) => {
        const parsed = ComparisonOperatorSchema.safeParse(operator);
        return parsed.success ? [parsed.data] : [];
      }),
    })),
  };
}

export interface OperationCatalogDiscovery {
  load(): Promise<OperationDescriptor[]>;
}

export class OperationCatalogDiscoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OperationCatalogDiscoveryError";
  }
}

type FetchCatalog = typeof fetch;

/** Loads Dander-owned, presentation-only metadata for operations this runtime can execute. */
export class DanderApiOperationCatalogDiscovery implements OperationCatalogDiscovery {
  private readonly endpoint: string;
  private readonly fetchCatalog: FetchCatalog;

  constructor(
    baseUrl = "http://127.0.0.1:8765",
    fetchCatalog: FetchCatalog = globalThis.fetch.bind(globalThis),
  ) {
    this.endpoint = `${baseUrl.replace(/\/$/, "")}/v1/operations`;
    this.fetchCatalog = fetchCatalog;
  }

  async load(): Promise<OperationDescriptor[]> {
    const response = await this.fetchCatalog(
      this.endpoint,
      localNetworkRequest({ method: "GET", headers: { Accept: "application/json" } }),
    );
    if (response.status === 404) return [];
    if (!response.ok) {
      throw new OperationCatalogDiscoveryError(
        `Dander operation discovery failed (${response.status} ${response.statusText}).`,
      );
    }
    return parseOperationCatalog(await response.json());
  }
}

/** Authenticated hosted adapter for Dander's generated operation catalog. */
export class HostedOperationCatalogDiscovery implements OperationCatalogDiscovery {
  constructor(private readonly request: HostedControlFetch) {}

  async load(): Promise<OperationDescriptor[]> {
    const response = await this.request("/v1/operations", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (response.status !== 200) {
      throw new OperationCatalogDiscoveryError(
        `Hosted Dander operation discovery failed (${response.status} ${response.statusText}).`,
      );
    }
    return parseOperationCatalog(await response.json());
  }
}

function parseOperationCatalog(input: unknown): OperationDescriptor[] {
  const parsed = OperationCatalogResponseSchema.safeParse(input);
  if (!parsed.success) {
    throw new OperationCatalogDiscoveryError(
      "Dander returned operation metadata this Druff version cannot safely use.",
    );
  }
  return parsed.data.operations.map(normalizeOperation);
}
