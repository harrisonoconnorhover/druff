/**
 * Generated from dander-platform==0.9.0rc18 (dander_platform-0.9.0rc18-py3-none-any.whl).
 * Wheel SHA256: 4500b32451c02b6331a337b6d38eb96cc49a29838b6e3ea5a2b87b9daf85406c
 * Contract bundle: io.dander.control.contracts/v1 (344ef5ff2d685d5bedf7a1ddb119a42a6de08d90f285dc0a981e79c55452c1ed)
 * Do not edit by hand; run `pnpm contracts:generate`.
 */

export type Code = string;
export type CorrelationId = string;
export type Code1 = string;
export type Location = string | null;
export type Message = string;
export type Details = ApiErrorDetail[];
export type Message1 = string;

export interface ApiErrorEnvelope {
  error: ApiError;
}
/**
 * This interface was referenced by `ApiErrorEnvelope`'s JSON-Schema
 * via the `definition` "ApiError".
 */
export interface ApiError {
  code: Code;
  correlation_id: CorrelationId;
  details?: Details;
  message: Message1;
}
/**
 * This interface was referenced by `ApiErrorEnvelope`'s JSON-Schema
 * via the `definition` "ApiErrorDetail".
 */
export interface ApiErrorDetail {
  code: Code1;
  location?: Location;
  message: Message;
}
