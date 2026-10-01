/**
 * Generated from dander-platform==0.9.0rc33 (dander_platform-0.9.0rc33-py3-none-any.whl).
 * Published wheel: https://github.com/harrisonoconnorhover/dander/releases/download/v0.9.0rc33/dander_platform-0.9.0rc33-py3-none-any.whl
 * Wheel SHA256: 2dd84610ab96093944d41f21706e410c30e83b6c92f719d1aa50ec0c7841661f
 * Contract bundle: io.dander.control.contracts/v1 (a28316b7e5158e0520fe1c24d59885083714f47b67aa396892fa9742060fb279)
 * Do not edit by hand; run `pnpm contracts:generate`.
 */

export type AffectedJobs = string[];
export type CandidateImage = string;
export type PlanSha256 = string;
export type PlanSummary = string;
export type PlanText = string;
export type Revision = string;

export interface DeploymentPreviewResponse {
  affected_jobs?: AffectedJobs;
  candidate_image: CandidateImage;
  plan_sha256: PlanSha256;
  plan_summary: PlanSummary;
  plan_text: PlanText;
  revision: Revision;
}
