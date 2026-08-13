/**
 * Generated from dander-platform==0.9.0rc18 (dander_platform-0.9.0rc18-py3-none-any.whl).
 * Wheel SHA256: 4500b32451c02b6331a337b6d38eb96cc49a29838b6e3ea5a2b87b9daf85406c
 * Contract bundle: io.dander.control.contracts/v1 (344ef5ff2d685d5bedf7a1ddb119a42a6de08d90f285dc0a981e79c55452c1ed)
 * Do not edit by hand; run `pnpm contracts:generate`.
 */

export type Accepted = boolean;
export type Operation = "cancel" | "replay";
export type ResultingRunId = string | null;
export type RunId = string;
/**
 * This interface was referenced by `MutationResult`'s JSON-Schema
 * via the `definition` "RunState".
 */
export type RunState =
  "queued" | "running" | "succeeded" | "failed" | "canceling" | "canceled" | "retrying";

export interface MutationResult {
  accepted: Accepted;
  operation: Operation;
  resulting_run_id?: ResultingRunId;
  run_id: RunId;
  state: RunState;
}
