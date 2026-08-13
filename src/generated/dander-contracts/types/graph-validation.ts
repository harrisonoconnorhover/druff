/**
 * Generated from dander-platform==0.9.0rc18 (dander_platform-0.9.0rc18-py3-none-any.whl).
 * Wheel SHA256: 4500b32451c02b6331a337b6d38eb96cc49a29838b6e3ea5a2b87b9daf85406c
 * Contract bundle: io.dander.control.contracts/v1 (344ef5ff2d685d5bedf7a1ddb119a42a6de08d90f285dc0a981e79c55452c1ed)
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
