import { expect, it } from "vitest";
import { HostedControlApiClient } from "@/features/hosted-control/control-api";
import type { HostedControlFetch } from "@/features/hosted-control/authorized-fetch";
import {
  DANDER_CONTRACT_BUNDLE_ID,
  DANDER_CONTRACT_BUNDLE_SHA256,
} from "@/generated/dander-contracts/metadata";
import { HostedGraphPersistence } from "@/lib/persistence/graph-persistence";

const url = process.env.DANDER_CONTROL_URL;
const project = process.env.DANDER_REPAIR_PROJECT;
const graph = process.env.DANDER_REPAIR_GRAPH;
const runId = process.env.DANDER_REPAIR_RUN_ID;
if (!url || !project || !graph || !runId) {
  throw new Error(
    "Set DANDER_CONTROL_URL, DANDER_REPAIR_PROJECT, DANDER_REPAIR_GRAPH and DANDER_REPAIR_RUN_ID to observe an already-completed synthetic repair.",
  );
}
const base = new URL(url);
if (!/^https?:$/.test(base.protocol) || base.username || base.password) {
  throw new Error("DANDER_CONTROL_URL must be credential-free HTTP(S).");
}
const request: HostedControlFetch = async (target, init) => {
  const endpoint = new URL(target.toString(), base);
  if (endpoint.origin !== base.origin) throw new Error("Refused a cross-origin request.");
  return fetch(endpoint, { ...init, redirect: "error" });
};
const control = new HostedControlApiClient(request);
const persistence = new HostedGraphPersistence(request);

it("reads an accepted native repair through the production Druff clients without starting another workload", async () => {
  const capabilities = await control.capabilities();
  expect(capabilities.contract).toEqual({
    id: DANDER_CONTRACT_BUNDLE_ID,
    sha256: DANDER_CONTRACT_BUNDLE_SHA256,
  });
  const address = { project, graph };
  const saved = await persistence.load(address);
  const run = await control.getRun(runId);
  expect(run.state).toBe("succeeded");
  expect(run.repair_window).toBeTruthy();
  expect(run.result_schema).toBeTruthy();
  const preview = await control.previewRepair(address, saved.revision, run.repair_window!);
  expect(preview.graph_content_sha256).toBe(saved.contentSha256);
  expect(preview.window).toEqual(run.repair_window);
  expect(preview.outputs.length).toBeGreaterThan(0);
  const explanation = await control.explainRun(runId);
  expect(explanation).toMatchObject({ run_id: runId, state: "succeeded", results_available: true });
  expect(explanation.summary).toBeTruthy();
  // Repair preview is read-only: no second launch, graph save, source extraction or watermark write.
  await expect(persistence.load(address)).resolves.toMatchObject({
    revision: saved.revision,
    contentSha256: saved.contentSha256,
  });
});
