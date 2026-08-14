/**
 * Generated from dander-platform==0.9.0rc19 (dander_platform-0.9.0rc19-py3-none-any.whl).
 * Wheel SHA256: 8f1336786e46471a2048d6250008ad176ff3b62d047020872659304c7d2db552
 * Contract bundle: io.dander.control.contracts/v1 (695791dfda6058d68453d9e146146d5cdda1439d86c40a7ec249cb4e14a12be3)
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
