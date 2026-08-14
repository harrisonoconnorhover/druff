/**
 * Generated from dander-platform==0.9.0rc19 (dander_platform-0.9.0rc19-py3-none-any.whl).
 * Wheel SHA256: 8f1336786e46471a2048d6250008ad176ff3b62d047020872659304c7d2db552
 * Contract bundle: io.dander.control.contracts/v1 (695791dfda6058d68453d9e146146d5cdda1439d86c40a7ec249cb4e14a12be3)
 * Do not edit by hand; run `pnpm contracts:generate`.
 */

export type Id = string;
/**
 * @maxItems 100
 */
export type Projects = ProjectSummaryResponse[];

/**
 * The bounded logical projects configured for this Dander installation.
 */
export interface ProjectListResponse {
  projects: Projects;
}
/**
 * One configured logical project, never a provider project payload.
 *
 * This interface was referenced by `ProjectListResponse`'s JSON-Schema
 * via the `definition` "ProjectSummaryResponse".
 */
export interface ProjectSummaryResponse {
  id: Id;
}
