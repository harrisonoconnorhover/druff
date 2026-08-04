import { z } from "zod";

const GraphOperationBindingSchema = z.object({
  project: z.string().min(1),
  pipeline_id: z.string().min(1),
  region: z.string().min(1),
  job_name: z.string().min(1),
});

const CloudRunExecutionSchema = z.object({
  name: z.string().min(1),
  state: z.enum(["starting", "running", "succeeded", "failed"]),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  succeeded_count: z.number().int().nonnegative(),
  failed_count: z.number().int().nonnegative(),
  log_uri: z.url().nullable(),
});

const DanderRunSchema = z.object({
  run_id: z.string().min(1),
  pipeline_id: z.string().min(1),
  source: z.string().min(1),
  status: z.enum(["running", "succeeded", "failed", "skipped"]),
  stage: z.enum(["ingest", "transform", "metadata", "complete"]),
  started_at: z.string().min(1),
  finished_at: z.string().nullable(),
  endpoints: z.number().int().nonnegative(),
  extracted: z.number().int().nonnegative(),
  affected: z.number().int().nonnegative(),
  models: z.number().int().nonnegative(),
  assertions: z.number().int().nonnegative(),
  assets: z.number().int().nonnegative(),
  failure_stage: z.enum(["ingest", "transform", "metadata", "complete"]).nullable(),
});

export const GraphOperationsStatusSchema = z.discriminatedUnion("enabled", [
  z.object({ enabled: z.literal(false) }),
  z.object({
    enabled: z.literal(true),
    graph_name: z.string().min(1),
    revision: z.string().min(1),
    binding: GraphOperationBindingSchema,
    execution: CloudRunExecutionSchema.nullable(),
    run: DanderRunSchema.nullable(),
  }),
]);

const GraphValidationResultSchema = z.object({
  valid: z.literal(true),
  graph_name: z.string().min(1),
  revision: z.string().min(1),
  binding: GraphOperationBindingSchema,
});

const GraphRunResultSchema = z.object({
  execution: CloudRunExecutionSchema,
});

export type GraphOperationsStatus = z.infer<typeof GraphOperationsStatusSchema>;
export type GraphValidationResult = z.infer<typeof GraphValidationResultSchema>;
export type GraphRunResult = z.infer<typeof GraphRunResultSchema>;

export class GraphOperationsError extends Error {
  readonly status: number | null;

  constructor(message: string, options: { status?: number } = {}) {
    super(message);
    this.name = "GraphOperationsError";
    this.status = options.status ?? null;
  }
}

type FetchOperations = typeof fetch;

export interface GraphOperationsClient {
  status(): Promise<GraphOperationsStatus>;
  validate(revision: string): Promise<GraphValidationResult>;
  run(revision: string): Promise<GraphRunResult>;
}

/**
 * Calls only Dander's fixed graph-operations routes. Cloud identifiers come back as read-only
 * status; the browser never supplies a project, region, pipeline, job name, or filesystem path.
 */
export class DanderApiGraphOperations implements GraphOperationsClient {
  private readonly baseUrl: string;
  private readonly fetchOperations: FetchOperations;

  constructor(
    baseUrl = "http://127.0.0.1:8765",
    fetchOperations: FetchOperations = globalThis.fetch.bind(globalThis),
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.fetchOperations = fetchOperations;
  }

  async status(): Promise<GraphOperationsStatus> {
    return this.request(
      "/v1/graph/status",
      { method: "GET", headers: { Accept: "application/json" } },
      GraphOperationsStatusSchema,
    );
  }

  async validate(revision: string): Promise<GraphValidationResult> {
    return this.request(
      "/v1/graph/validate",
      {
        method: "POST",
        headers: { Accept: "application/json", "If-Match": revision },
      },
      GraphValidationResultSchema,
    );
  }

  async run(revision: string): Promise<GraphRunResult> {
    return this.request(
      "/v1/graph/run",
      {
        method: "POST",
        headers: { Accept: "application/json", "If-Match": revision },
      },
      GraphRunResultSchema,
    );
  }

  private async request<T>(path: string, init: RequestInit, schema: z.ZodType<T>): Promise<T> {
    let response: Response;
    try {
      response = await this.fetchOperations(`${this.baseUrl}${path}`, init);
    } catch (cause) {
      throw new GraphOperationsError(
        cause instanceof TypeError
          ? "Could not reach Dander's local graph service."
          : "Dander's graph operation request failed.",
      );
    }
    if (!response.ok) {
      throw new GraphOperationsError(await responseError(response), { status: response.status });
    }
    try {
      return schema.parse(await response.json());
    } catch {
      throw new GraphOperationsError(
        "Dander returned an operations response this Druff version cannot read.",
        { status: response.status },
      );
    }
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function responseError(response: Response): Promise<string> {
  try {
    const payload: unknown = await response.json();
    if (isPlainObject(payload) && typeof payload.error === "string") return payload.error;
  } catch {
    // Fall through to a status-only message; never echo an unvalidated response body.
  }
  return `Dander graph operation failed (${response.status} ${response.statusText}).`;
}
