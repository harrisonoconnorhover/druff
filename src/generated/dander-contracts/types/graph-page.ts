/**
 * Generated from dander-platform==0.9.0rc34 (dander_platform-0.9.0rc34-py3-none-any.whl).
 * Published wheel: https://github.com/harrisonoconnorhover/dander/releases/download/v0.9.0rc34/dander_platform-0.9.0rc34-py3-none-any.whl
 * Wheel SHA256: d37c1d91c15cca9ce3d080af6dec384f7cd9cbc521dea253e10dc44772d35bad
 * Contract bundle: io.dander.control.contracts/v1 (a28316b7e5158e0520fe1c24d59885083714f47b67aa396892fa9742060fb279)
 * Do not edit by hand; run `pnpm contracts:generate`.
 */

export type ContentSha256 = string;
export type CreatedAt = string;
export type Graph = string;
export type Project = string;
export type UpdatedAt = string;
/**
 * @maxItems 100
 */
export type Items = GraphSummaryResponse[];
export type NextCursor = string | null;

/**
 * A bounded graph-summary page that never embeds full graph documents.
 */
export interface GraphPageResponse {
  items: Items;
  next_cursor?: NextCursor;
}
/**
 * Document-free metadata for one graph in a bounded hosted list response.
 *
 * This interface was referenced by `GraphPageResponse`'s JSON-Schema
 * via the `definition` "GraphSummaryResponse".
 */
export interface GraphSummaryResponse {
  content_sha256: ContentSha256;
  created_at: CreatedAt;
  graph: Graph;
  project: Project;
  updated_at: UpdatedAt;
}
