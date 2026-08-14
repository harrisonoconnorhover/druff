/**
 * Generated from dander-platform==0.9.0rc19 (dander_platform-0.9.0rc19-py3-none-any.whl).
 * Wheel SHA256: 8f1336786e46471a2048d6250008ad176ff3b62d047020872659304c7d2db552
 * Contract bundle: io.dander.control.contracts/v1 (695791dfda6058d68453d9e146146d5cdda1439d86c40a7ec249cb4e14a12be3)
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
