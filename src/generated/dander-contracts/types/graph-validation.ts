/**
 * Generated from dander-platform==0.9.0rc33 (dander_platform-0.9.0rc33-py3-none-any.whl).
 * Published wheel: https://github.com/harrisonoconnorhover/dander/releases/download/v0.9.0rc33/dander_platform-0.9.0rc33-py3-none-any.whl
 * Wheel SHA256: 2dd84610ab96093944d41f21706e410c30e83b6c92f719d1aa50ec0c7841661f
 * Contract bundle: io.dander.control.contracts/v1 (a28316b7e5158e0520fe1c24d59885083714f47b67aa396892fa9742060fb279)
 * Do not edit by hand; run `pnpm contracts:generate`.
 */

export type ContentSha256 = string;
export type GraphName = string;
export type Location = string;
export type Message = string;
export type Type = string;
export type Issues = GraphValidationDetail[];
export type Valid = boolean;

export interface GraphValidationResponse {
  content_sha256: ContentSha256;
  graph_name: GraphName;
  issues?: Issues;
  valid: Valid;
}
/**
 * This interface was referenced by `GraphValidationResponse`'s JSON-Schema
 * via the `definition` "GraphValidationDetail".
 */
export interface GraphValidationDetail {
  location: Location;
  message: Message;
  type: Type;
}
