/**
 * Generated from dander-platform==0.9.0rc19 (dander_platform-0.9.0rc19-py3-none-any.whl).
 * Wheel SHA256: 8f1336786e46471a2048d6250008ad176ff3b62d047020872659304c7d2db552
 * Contract bundle: io.dander.control.contracts/v1 (695791dfda6058d68453d9e146146d5cdda1439d86c40a7ec249cb4e14a12be3)
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
export type RunId = string;
export type Stage = string | null;
export type StartedAt = string | null;
/**
 * This interface was referenced by `RunPageResponse`'s JSON-Schema
 * via the `definition` "RunState".
 */
export type RunState =
  "queued" | "running" | "succeeded" | "failed" | "canceling" | "canceled" | "retrying";
/**
 * @maxItems 100
 */
export type Items = RunStatusResponse[];
export type NextCursor = string | null;

/**
 * A bounded page of normalized, non-sensitive run summaries.
 */
export interface RunPageResponse {
  items: Items;
  next_cursor?: NextCursor;
}
/**
 * This interface was referenced by `RunPageResponse`'s JSON-Schema
 * via the `definition` "RunStatusResponse".
 */
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
  run_id: RunId;
  stage?: Stage;
  started_at?: StartedAt;
  state: RunState;
}
