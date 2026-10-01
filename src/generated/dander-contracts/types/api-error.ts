/**
 * Generated from dander-platform==0.9.0rc34 (dander_platform-0.9.0rc34-py3-none-any.whl).
 * Published wheel: https://github.com/harrisonoconnorhover/dander/releases/download/v0.9.0rc34/dander_platform-0.9.0rc34-py3-none-any.whl
 * Wheel SHA256: d37c1d91c15cca9ce3d080af6dec384f7cd9cbc521dea253e10dc44772d35bad
 * Contract bundle: io.dander.control.contracts/v1 (a28316b7e5158e0520fe1c24d59885083714f47b67aa396892fa9742060fb279)
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
