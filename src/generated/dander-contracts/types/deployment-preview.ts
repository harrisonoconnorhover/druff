/**
 * Generated from dander-platform==0.9.0rc18 (dander_platform-0.9.0rc18-py3-none-any.whl).
 * Wheel SHA256: 4500b32451c02b6331a337b6d38eb96cc49a29838b6e3ea5a2b87b9daf85406c
 * Contract bundle: io.dander.control.contracts/v1 (344ef5ff2d685d5bedf7a1ddb119a42a6de08d90f285dc0a981e79c55452c1ed)
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
