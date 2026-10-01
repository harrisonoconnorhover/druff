/**
 * Generated from dander-platform==0.9.0rc33 (dander_platform-0.9.0rc33-py3-none-any.whl).
 * Published wheel: https://github.com/harrisonoconnorhover/dander/releases/download/v0.9.0rc33/dander_platform-0.9.0rc33-py3-none-any.whl
 * Wheel SHA256: 2dd84610ab96093944d41f21706e410c30e83b6c92f719d1aa50ec0c7841661f
 * Contract bundle: io.dander.control.contracts/v1 (a28316b7e5158e0520fe1c24d59885083714f47b67aa396892fa9742060fb279)
 * Do not edit by hand; run `pnpm contracts:generate`.
 */

/**
 * @maxItems 7
 */
export type AvailableActions =
  | []
  | [RunActionKind]
  | [RunActionKind, RunActionKind]
  | [RunActionKind, RunActionKind, RunActionKind]
  | [RunActionKind, RunActionKind, RunActionKind, RunActionKind]
  | [RunActionKind, RunActionKind, RunActionKind, RunActionKind, RunActionKind]
  | [RunActionKind, RunActionKind, RunActionKind, RunActionKind, RunActionKind, RunActionKind]
  | [
      RunActionKind,
      RunActionKind,
      RunActionKind,
      RunActionKind,
      RunActionKind,
      RunActionKind,
      RunActionKind,
    ];
/**
 * This interface was referenced by `RunExplanationResponse`'s JSON-Schema
 * via the `definition` "RunActionKind".
 */
export type RunActionKind =
  "refresh" | "logs" | "replay" | "cancel" | "inspect_outputs" | "review_configuration" | "none";
/**
 * @maxItems 8
 */
export type Caveats =
  | []
  | [string]
  | [string, string]
  | [string, string, string]
  | [string, string, string, string]
  | [string, string, string, string, string]
  | [string, string, string, string, string, string]
  | [string, string, string, string, string, string, string]
  | [string, string, string, string, string, string, string, string];
/**
 * @maxItems 8
 */
export type Details =
  | []
  | [string]
  | [string, string]
  | [string, string, string]
  | [string, string, string, string]
  | [string, string, string, string, string]
  | [string, string, string, string, string, string]
  | [string, string, string, string, string, string, string]
  | [string, string, string, string, string, string, string, string];
export type Label = string;
export type Reason = string;
export type ResultsAvailable = boolean;
export type RunId = string;
/**
 * This interface was referenced by `RunExplanationResponse`'s JSON-Schema
 * via the `definition` "RunState".
 */
export type RunState =
  "queued" | "running" | "succeeded" | "failed" | "canceling" | "canceled" | "retrying";
export type Summary = string;

/**
 * A bounded explanation derived only from the current normalized run status.
 */
export interface RunExplanationResponse {
  available_actions?: AvailableActions;
  caveats?: Caveats;
  details?: Details;
  next_action: RunExplanationAction;
  results_available: ResultsAvailable;
  run_id: RunId;
  state: RunState;
  summary: Summary;
}
/**
 * One suggested next step, without performing a run mutation.
 *
 * This interface was referenced by `RunExplanationResponse`'s JSON-Schema
 * via the `definition` "RunExplanationAction".
 */
export interface RunExplanationAction {
  kind: RunActionKind;
  label: Label;
  reason: Reason;
}
