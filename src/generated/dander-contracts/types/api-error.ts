/**
 * Generated from dander-platform==0.9.0rc19 (dander_platform-0.9.0rc19-py3-none-any.whl).
 * Wheel SHA256: 8f1336786e46471a2048d6250008ad176ff3b62d047020872659304c7d2db552
 * Contract bundle: io.dander.control.contracts/v1 (695791dfda6058d68453d9e146146d5cdda1439d86c40a7ec249cb4e14a12be3)
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
