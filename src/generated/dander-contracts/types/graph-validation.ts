/**
 * Generated from dander-platform==0.9.0rc19 (dander_platform-0.9.0rc19-py3-none-any.whl).
 * Wheel SHA256: 8f1336786e46471a2048d6250008ad176ff3b62d047020872659304c7d2db552
 * Contract bundle: io.dander.control.contracts/v1 (695791dfda6058d68453d9e146146d5cdda1439d86c40a7ec249cb4e14a12be3)
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
