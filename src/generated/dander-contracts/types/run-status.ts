/**
 * Generated from dander-platform==0.9.0rc18 (dander_platform-0.9.0rc18-py3-none-any.whl).
 * Wheel SHA256: 4500b32451c02b6331a337b6d38eb96cc49a29838b6e3ea5a2b87b9daf85406c
 * Contract bundle: io.dander.control.contracts/v1 (344ef5ff2d685d5bedf7a1ddb119a42a6de08d90f285dc0a981e79c55452c1ed)
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
 * This interface was referenced by `RunStatusResponse`'s JSON-Schema
 * via the `definition` "RunState".
 */
export type RunState =
  "queued" | "running" | "succeeded" | "failed" | "canceling" | "canceled" | "retrying";

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
