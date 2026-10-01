/**
 * Generated from dander-platform==0.9.0rc34 (dander_platform-0.9.0rc34-py3-none-any.whl).
 * Published wheel: https://github.com/harrisonoconnorhover/dander/releases/download/v0.9.0rc34/dander_platform-0.9.0rc34-py3-none-any.whl
 * Wheel SHA256: d37c1d91c15cca9ce3d080af6dec384f7cd9cbc521dea253e10dc44772d35bad
 * Contract bundle: io.dander.control.contracts/v1 (a28316b7e5158e0520fe1c24d59885083714f47b67aa396892fa9742060fb279)
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
