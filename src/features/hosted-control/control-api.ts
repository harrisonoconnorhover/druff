import type { HostedControlFetch } from "@/features/hosted-control/authorized-fetch";
import {
  ApiErrorEnvelopeSchema,
  DeploymentPreviewResponseSchema,
  GraphValidationResponseSchema,
  IncompatibleDanderContractError,
  assertCompatibleCapabilities,
  type CapabilitiesResponse,
  type DeploymentPreviewResponse,
  type GraphValidationResponse,
} from "@/lib/dander-contracts";
import type { GraphAddress } from "@/lib/persistence/graph-persistence";

const MAX_CAPABILITIES_BYTES = 128 * 1024;
const MAX_VALIDATION_BYTES = 256 * 1024;
const MAX_PREVIEW_BYTES = 512 * 1024;
const MAX_ERROR_BYTES = 64 * 1024;
const MAX_PLAN_TEXT_CHARACTERS = 100_000;
const MAX_PLAN_SUMMARY_CHARACTERS = 2_000;
const MAX_AFFECTED_JOBS = 100;
const MAX_RESOURCE_LABEL_CHARACTERS = 512;

export type HostedCapability = CapabilitiesResponse["operations"][number];

export class HostedControlOperationError extends Error {
  readonly conflict: boolean;
  readonly unsupported: boolean;

  constructor(message: string, options: { conflict?: boolean; unsupported?: boolean } = {}) {
    super(message);
    this.name = "HostedControlOperationError";
    this.conflict = options.conflict ?? false;
    this.unsupported = options.unsupported ?? false;
  }
}

/** Generated-contract client for the hosted capabilities, validation, and preview endpoints. */
export class HostedControlApiClient {
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
}

function graphPath(address: GraphAddress): string {
  return `/v1/projects/${encodeURIComponent(address.project)}/graphs/${encodeURIComponent(address.graph)}`;
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
