import type { HostedControlFetch } from "@/features/hosted-control/authorized-fetch";
import {
  ApiErrorEnvelopeSchema,
  DeploymentPreviewResponseSchema,
  GraphValidationResponseSchema,
  IncompatibleDanderContractError,
  LogPageResponseSchema,
  MutationResultSchema,
  RunStatusResponseSchema,
  assertCompatibleCapabilities,
  type CapabilitiesResponse,
  type DeploymentPreviewResponse,
  type GraphValidationResponse,
  type LogPageResponse,
  type MutationResult,
  type RunStatusResponse,
} from "@/lib/dander-contracts";
import type { GraphAddress } from "@/lib/persistence/graph-persistence";

const MAX_CAPABILITIES_BYTES = 128 * 1024;
const MAX_VALIDATION_BYTES = 256 * 1024;
const MAX_PREVIEW_BYTES = 512 * 1024;
const MAX_RUN_STATUS_BYTES = 128 * 1024;
const MAX_LOG_PAGE_BYTES = 512 * 1024;
const MAX_ERROR_BYTES = 64 * 1024;
const MAX_PLAN_TEXT_CHARACTERS = 100_000;
const MAX_PLAN_SUMMARY_CHARACTERS = 2_000;
const MAX_AFFECTED_JOBS = 100;
const MAX_RESOURCE_LABEL_CHARACTERS = 512;
const MAX_RUN_ID_CHARACTERS = 512;
const MAX_RUN_LABEL_CHARACTERS = 512;
const MAX_FAILURE_SUMMARY_CHARACTERS = 4_096;
const MAX_LOG_RECORDS = 100;
const MAX_LOG_MESSAGE_CHARACTERS = 4_096;
const MAX_LOG_METADATA_CHARACTERS = 512;
const MAX_CURSOR_CHARACTERS = 4_096;

type PendingMutation = {
  fingerprint: string;
  idempotencyKey: string;
};

export type HostedCapability = CapabilitiesResponse["operations"][number];

export class HostedControlOperationError extends Error {
  readonly conflict: boolean;
  readonly unsupported: boolean;
  readonly ambiguous: boolean;

  constructor(
    message: string,
    options: { conflict?: boolean; unsupported?: boolean; ambiguous?: boolean } = {},
  ) {
    super(message);
    this.name = "HostedControlOperationError";
    this.conflict = options.conflict ?? false;
    this.unsupported = options.unsupported ?? false;
    this.ambiguous = options.ambiguous ?? false;
  }
}

/** Generated-contract client for provider-neutral hosted control operations. */
export class HostedControlApiClient {
  private readonly pendingMutations = new Map<string, PendingMutation>();

  constructor(private readonly request: HostedControlFetch) {}

  async capabilities(): Promise<CapabilitiesResponse> {
    const response = await this.request("/v1/capabilities", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (response.status !== 200) {
      throw await operationError(response, "Dander capabilities are unavailable.");
    }
    let capabilities: CapabilitiesResponse;
    try {
      capabilities = assertCompatibleCapabilities(
        await readBoundedJson(response, MAX_CAPABILITIES_BYTES),
      );
    } catch (error) {
      if (error instanceof IncompatibleDanderContractError) throw error;
      throw incompatibleResponse("capabilities");
    }
    if (capabilities.api_version !== "v1") {
      throw new IncompatibleDanderContractError(
        "Dander did not advertise the exact v1 Control API required by this Druff build.",
      );
    }
    return capabilities;
  }

  async validate(address: GraphAddress, revision: string): Promise<GraphValidationResponse> {
    const response = await this.request(`${graphPath(address)}/validate`, {
      method: "POST",
      headers: { Accept: "application/json", "If-Match": revision },
    });
    if (response.status !== 200) {
      throw await operationError(response, "Dander could not validate this graph.");
    }
    const parsed = GraphValidationResponseSchema.safeParse(
      await readBoundedJson(response, MAX_VALIDATION_BYTES),
    );
    if (!parsed.success) throw incompatibleResponse("validation result");
    return parsed.data;
  }

  async preview(address: GraphAddress, revision: string): Promise<DeploymentPreviewResponse> {
    const response = await this.request(`${graphPath(address)}/deployment-preview`, {
      method: "POST",
      headers: { Accept: "application/json", "If-Match": revision },
    });
    if (response.status !== 200) {
      throw await operationError(response, "Dander could not preview this deployment.");
    }
    const parsed = DeploymentPreviewResponseSchema.safeParse(
      await readBoundedJson(response, MAX_PREVIEW_BYTES),
    );
    if (!parsed.success || !isBoundedPreview(parsed.data)) {
      throw incompatibleResponse("bounded deployment preview");
    }
    return parsed.data;
  }

  async startRun(address: GraphAddress, revision: string): Promise<RunStatusResponse> {
    const scope = `start:${addressKey(address)}`;
    const mutation = this.mutationFor(
      scope,
      JSON.stringify(["start", address.project, address.graph, revision]),
    );
    let response: Response;
    try {
      response = await this.request(`${graphPath(address)}/runs`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "If-Match": revision,
          "Idempotency-Key": mutation.idempotencyKey,
        },
      });
    } catch (error) {
      // The request may have reached Dander. An identical retry must reuse the same key.
      throw error;
    }
    if (response.status !== 202) {
      this.clearDefinitiveFailure(scope, response.status);
      throw await operationError(response, "Dander could not start this run.");
    }
    const run = await readRunStatus(response, "run start result", true);
    this.pendingMutations.delete(scope);
    return run;
  }

  async getRun(runId: string): Promise<RunStatusResponse> {
    const response = await this.request(`/v1/runs/${encodeURIComponent(runId)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (response.status !== 200) {
      throw await operationError(response, "Dander could not read this run.");
    }
    const run = await readRunStatus(response, "run status", false);
    if (run.run_id !== runId) throw incompatibleResponse("run status for a different run");
    return run;
  }

  async logs(runId: string, limit: number): Promise<LogPageResponse> {
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LOG_RECORDS) {
      throw new HostedControlOperationError("Druff refused an unsafe hosted log-page size.");
    }
    const query = new URLSearchParams({ limit: String(limit) });
    const response = await this.request(
      `/v1/runs/${encodeURIComponent(runId)}/logs?${query.toString()}`,
      { method: "GET", headers: { Accept: "application/json" } },
    );
    if (response.status !== 200) {
      throw await operationError(response, "Dander could not read bounded run logs.");
    }
    const parsed = LogPageResponseSchema.safeParse(
      await readBoundedJson(response, MAX_LOG_PAGE_BYTES),
    );
    if (!parsed.success || !isBoundedLogPage(parsed.data, limit)) {
      throw incompatibleResponse("bounded run log page");
    }
    return parsed.data;
  }

  async cancelRun(runId: string): Promise<MutationResult> {
    return this.mutateRun("cancel", runId);
  }

  async replayRun(runId: string): Promise<MutationResult> {
    return this.mutateRun("replay", runId);
  }

  private async mutateRun(operation: "cancel" | "replay", runId: string): Promise<MutationResult> {
    const scope = `${operation}:${runId}`;
    const mutation = this.mutationFor(scope, JSON.stringify([operation, runId]));
    let response: Response;
    try {
      response = await this.request(`/v1/runs/${encodeURIComponent(runId)}/${operation}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Idempotency-Key": mutation.idempotencyKey,
        },
      });
    } catch (error) {
      // The mutation may have completed. Keep the key until an exact correlated result validates.
      throw error;
    }
    if (response.status !== 200) {
      this.clearDefinitiveFailure(scope, response.status);
      throw await operationError(response, `Dander could not ${operation} this run.`);
    }
    let result: MutationResult;
    try {
      const parsed = MutationResultSchema.safeParse(
        await readBoundedJson(response, MAX_RUN_STATUS_BYTES),
      );
      if (!parsed.success || !isBoundedMutation(parsed.data)) {
        throw new Error("invalid mutation result");
      }
      result = parsed.data;
    } catch {
      throw ambiguousMutationResponse(`${operation} result`);
    }
    if (result.operation !== operation || result.run_id !== runId) {
      throw ambiguousMutationResponse(`${operation} result for a different run`);
    }
    if (operation === "replay" && result.accepted && !result.resulting_run_id) {
      throw ambiguousMutationResponse("accepted replay result without a resulting run");
    }
    this.pendingMutations.delete(scope);
    return result;
  }

  private mutationFor(scope: string, fingerprint: string): PendingMutation {
    const existing = this.pendingMutations.get(scope);
    if (existing?.fingerprint === fingerprint) return existing;
    const next = { fingerprint, idempotencyKey: `druff-${crypto.randomUUID()}` };
    this.pendingMutations.set(scope, next);
    return next;
  }

  private clearDefinitiveFailure(scope: string, status: number): void {
    if ((status >= 400 && status < 500) || status === 501) {
      this.pendingMutations.delete(scope);
    }
  }
}

function graphPath(address: GraphAddress): string {
  return `/v1/projects/${encodeURIComponent(address.project)}/graphs/${encodeURIComponent(address.graph)}`;
}

function addressKey(address: GraphAddress): string {
  return `${address.project}\u0000${address.graph}`;
}

async function operationError(response: Response, fallback: string): Promise<Error> {
  let code: string | null = null;
  let message = `${fallback} (${response.status} ${response.statusText}).`;
  try {
    const parsed = ApiErrorEnvelopeSchema.safeParse(
      await readBoundedJson(response, MAX_ERROR_BYTES),
    );
    if (parsed.success) {
      code = parsed.data.error.code;
      message = `${parsed.data.error.message} Correlation ID: ${parsed.data.error.correlation_id}.`;
    }
  } catch {
    // Never expose a raw response body or provider payload.
  }
  return new HostedControlOperationError(message, {
    conflict: response.status === 412 && code === "operation_conflict",
    unsupported: response.status === 501 && code === "operation_unavailable",
  });
}

function incompatibleResponse(label: string): HostedControlOperationError {
  return new HostedControlOperationError(
    `Dander returned a ${label} this Druff build cannot safely display. Upgrade the incompatible application.`,
  );
}

function ambiguousMutationResponse(label: string): HostedControlOperationError {
  return new HostedControlOperationError(
    `Dander returned an ambiguous ${label}. Retry the same operation safely; Druff will reuse its idempotency key.`,
    { ambiguous: true },
  );
}

function isBoundedPreview(preview: DeploymentPreviewResponse): boolean {
  return (
    preview.plan_text.length <= MAX_PLAN_TEXT_CHARACTERS &&
    preview.plan_summary.length <= MAX_PLAN_SUMMARY_CHARACTERS &&
    preview.candidate_image.length <= 4_096 &&
    preview.revision.length <= 4_096 &&
    (preview.affected_jobs?.length ?? 0) <= MAX_AFFECTED_JOBS &&
    (preview.affected_jobs ?? []).every(
      (resource) => resource.length <= MAX_RESOURCE_LABEL_CHARACTERS,
    )
  );
}

async function readRunStatus(
  response: Response,
  label: string,
  ambiguous: boolean,
): Promise<RunStatusResponse> {
  try {
    const parsed = RunStatusResponseSchema.safeParse(
      await readBoundedJson(response, MAX_RUN_STATUS_BYTES),
    );
    if (!parsed.success || !isBoundedRunStatus(parsed.data)) {
      throw new Error("invalid run status");
    }
    return parsed.data;
  } catch {
    throw ambiguous ? ambiguousMutationResponse(label) : incompatibleResponse(label);
  }
}

function isBoundedRunStatus(run: RunStatusResponse): boolean {
  return (
    isBoundedRequired(run.run_id, MAX_RUN_ID_CHARACTERS) &&
    isBoundedOptional(run.stage, MAX_RUN_LABEL_CHARACTERS) &&
    isBoundedOptional(run.started_at, MAX_RUN_LABEL_CHARACTERS) &&
    isBoundedOptional(run.finished_at, MAX_RUN_LABEL_CHARACTERS) &&
    isBoundedOptional(run.failure_code, MAX_RUN_LABEL_CHARACTERS) &&
    isBoundedOptional(run.failure_summary, MAX_FAILURE_SUMMARY_CHARACTERS)
  );
}

function isBoundedMutation(result: MutationResult): boolean {
  return (
    isBoundedRequired(result.run_id, MAX_RUN_ID_CHARACTERS) &&
    isBoundedOptional(result.resulting_run_id, MAX_RUN_ID_CHARACTERS)
  );
}

function isBoundedLogPage(page: LogPageResponse, requestedLimit: number): boolean {
  return (
    page.records.length <= requestedLimit &&
    page.records.length <= MAX_LOG_RECORDS &&
    isBoundedOptional(page.next_cursor, MAX_CURSOR_CHARACTERS) &&
    page.records.every(
      (record) =>
        isBoundedRequired(record.timestamp, MAX_LOG_METADATA_CHARACTERS) &&
        isBoundedRequired(record.code, MAX_LOG_METADATA_CHARACTERS) &&
        isBoundedRequired(record.correlation_id, MAX_LOG_METADATA_CHARACTERS) &&
        isBoundedRequired(record.message, MAX_LOG_MESSAGE_CHARACTERS),
    )
  );
}

function isBoundedRequired(value: string, maximum: number): boolean {
  return value.length > 0 && value.length <= maximum;
}

function isBoundedOptional(value: string | null | undefined, maximum: number): boolean {
  return value == null || value.length <= maximum;
}

async function readBoundedJson(response: Response, maximumBytes: number): Promise<unknown> {
  const declaredLength = response.headers.get("Content-Length");
  if (declaredLength !== null) {
    const parsedLength = Number(declaredLength);
    if (Number.isFinite(parsedLength) && parsedLength > maximumBytes) {
      throw new Error("Hosted response exceeds the accepted bound.");
    }
  }

  if (!response.body) throw new Error("Hosted response has no body.");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maximumBytes) {
      await reader.cancel();
      throw new Error("Hosted response exceeds the accepted bound.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}
