import { z } from "zod";
import { localNetworkRequest } from "@/lib/local-network-request";
import {
  ComparisonOperatorSchema,
  OperationKindSchema,
} from "@/features/pipeline-operations/operationConfig";

const OperationParameterSchema = z
  .object({
    name: z.string().min(1),
    display_name: z.string().min(1),
    control: z.enum(["field", "integer", "scalar", "select", "conditions"]),
    required: z.boolean(),
    minimum: z.number().int().optional(),
    default: z.string().optional(),
    options: z.array(z.string()).optional(),
    operators: z.array(ComparisonOperatorSchema).optional(),
  })
  .strict();

export const OperationDescriptorSchema = z
  .object({
    kind: OperationKindSchema,
    display_name: z.string().min(1),
    description: z.string(),
    parameters: z.array(OperationParameterSchema),
  })
  .strict();

const OperationCatalogSchema = z
  .object({
    schema_version: z.literal(1),
    operations: z.array(OperationDescriptorSchema),
  })
  .strict()
  .superRefine((catalog, context) => {
    const kinds = new Set<string>();
    catalog.operations.forEach((operation, index) => {
      if (kinds.has(operation.kind)) {
        context.addIssue({
          code: "custom",
          message: "operation kinds must be unique",
          path: ["operations", index, "kind"],
        });
      }
      kinds.add(operation.kind);
    });
  });

export type OperationDescriptor = z.infer<typeof OperationDescriptorSchema>;

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
    const parsed = OperationCatalogSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new OperationCatalogDiscoveryError(
        "Dander returned operation metadata this Druff version cannot safely use.",
      );
    }
    return parsed.data.operations;
  }
}
