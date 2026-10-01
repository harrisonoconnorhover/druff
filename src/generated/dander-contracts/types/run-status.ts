/**
 * Generated from dander-platform==0.9.0rc33 (dander_platform-0.9.0rc33-py3-none-any.whl).
 * Published wheel: https://github.com/harrisonoconnorhover/dander/releases/download/v0.9.0rc33/dander_platform-0.9.0rc33-py3-none-any.whl
 * Wheel SHA256: 2dd84610ab96093944d41f21706e410c30e83b6c92f719d1aa50ec0c7841661f
 * Contract bundle: io.dander.control.contracts/v1 (a28316b7e5158e0520fe1c24d59885083714f47b67aa396892fa9742060fb279)
 * Do not edit by hand; run `pnpm contracts:generate`.
 */

export type Affected = number;
export type Assertions = number;
export type Assets = number;
export type CanCancel = boolean;
export type CanReplay = boolean;
export type Endpoints = number;
export type Extracted = number;
export type FailureCode = string | null;
export type FailureSummary = string | null;
export type FinishedAt = string | null;
export type LogsAvailable = boolean;
export type Models = number;
export type DecisionSchema = "io.dander.control.placement-decision/v1";
export type EligiblePlanCount = number;
export type EstimatedCostMicrousd = number | null;
export type MaxCostMicrousd = number | null;
export type Mode = "automatic" | "manual_override" | "configured_default" | "scheduled" | "replay";
export type PreferredLocality = string | null;
export type SelectedEnvironment = string;
export type SelectedLocality = string | null;
export type EndDate = string;
export type StartDate = string;
export type ResultSchema = "io.dander.control.execution-result-summary/v1" | null;
export type RunId = string;
export type CpuMillis = number;
export type DecisionSchema1 = "io.dander.control.size-class-decision/v2";
export type EligiblePlanCount1 = number;
export type EphemeralStorageMib = number | null;
export type EstimateObservedAt = string | null;
export type EstimateSource = string | null;
export type EstimatedInputBytes = number | null;
export type MaxInputBytes = number;
export type MemoryMib = number;
export type Mode1 =
  "automatic_input" | "manual_override" | "configured_default" | "scheduled" | "replay";
export type SelectedSizeClass = string;
export type Skipped = boolean;
export type Stage = string | null;
export type StartedAt = string | null;
/**
 * This interface was referenced by `RunStatusResponse`'s JSON-Schema
 * via the `definition` "RunState".
 */
export type RunState =
  "queued" | "running" | "succeeded" | "failed" | "canceling" | "canceled" | "retrying";
export type BytesBilled = number;
export type BytesProcessed = number;
export type BytesRead = number;
export type BytesWritten = number;
export type DurationMs = number;
export type ExecutionDurationMs = number;
export type OperationCount = number;
export type QueueDurationMs = number;
export type RetryCount = number;
export type RowsAffected = number;
export type RowsRead = number;
export type RowsWritten = number;
export type SpillBytes = number;

export interface RunStatusResponse {
  affected?: Affected;
  assertions?: Assertions;
  assets?: Assets;
  can_cancel?: CanCancel;
  can_replay?: CanReplay;
  endpoints?: Endpoints;
  extracted?: Extracted;
  failure_code?: FailureCode;
  failure_summary?: FailureSummary;
  finished_at?: FinishedAt;
  logs_available?: LogsAvailable;
  models?: Models;
  placement?: RunPlacementDecision | null;
  repair_window?: GraphRepairWindow | null;
  result_schema?: ResultSchema;
  run_id: RunId;
  sizing?: RunSizeClassDecision | null;
  skipped?: Skipped;
  stage?: Stage;
  started_at?: StartedAt;
  state: RunState;
  telemetry?: RunTelemetrySummary | null;
}
/**
 * Fixed-size explanation of the execution-plan selection used by Control.
 *
 * This interface was referenced by `RunStatusResponse`'s JSON-Schema
 * via the `definition` "RunPlacementDecision".
 */
export interface RunPlacementDecision {
  decision_schema: DecisionSchema;
  eligible_plan_count: EligiblePlanCount;
  estimated_cost_microusd?: EstimatedCostMicrousd;
  max_cost_microusd?: MaxCostMicrousd;
  mode: Mode;
  preferred_locality?: PreferredLocality;
  selected_environment: SelectedEnvironment;
  selected_locality?: SelectedLocality;
}
/**
 * UTC calendar dates: start is inclusive and end is exclusive.
 *
 * This interface was referenced by `RunStatusResponse`'s JSON-Schema
 * via the `definition` "GraphRepairWindow".
 */
export interface GraphRepairWindow {
  end_date: EndDate;
  start_date: StartDate;
}
/**
 * Fixed-size explanation of the selected execution resource class.
 *
 * This interface was referenced by `RunStatusResponse`'s JSON-Schema
 * via the `definition` "RunSizeClassDecision".
 */
export interface RunSizeClassDecision {
  cpu_millis: CpuMillis;
  decision_schema: DecisionSchema1;
  eligible_plan_count: EligiblePlanCount1;
  ephemeral_storage_mib?: EphemeralStorageMib;
  estimate_observed_at?: EstimateObservedAt;
  estimate_source?: EstimateSource;
  estimated_input_bytes?: EstimatedInputBytes;
  max_input_bytes: MaxInputBytes;
  memory_mib: MemoryMib;
  mode: Mode1;
  selected_size_class: SelectedSizeClass;
}
/**
 * Fixed-size telemetry totals; provider operation details remain in logs.
 *
 * This interface was referenced by `RunStatusResponse`'s JSON-Schema
 * via the `definition` "RunTelemetrySummary".
 */
export interface RunTelemetrySummary {
  bytes_billed: BytesBilled;
  bytes_processed: BytesProcessed;
  bytes_read: BytesRead;
  bytes_written: BytesWritten;
  duration_ms: DurationMs;
  execution_duration_ms: ExecutionDurationMs;
  operation_count: OperationCount;
  queue_duration_ms: QueueDurationMs;
  retry_count: RetryCount;
  rows_affected: RowsAffected;
  rows_read: RowsRead;
  rows_written: RowsWritten;
  spill_bytes: SpillBytes;
}
