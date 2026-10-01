import { afterAll, describe, expect, it } from "vitest";
import {
  HostedControlApiClient,
  HostedControlOperationError,
} from "@/features/hosted-control/control-api";
import type { HostedControlFetch } from "@/features/hosted-control/authorized-fetch";
import {
  DANDER_CONTRACT_BUNDLE_ID,
  DANDER_CONTRACT_BUNDLE_SHA256,
} from "@/generated/dander-contracts/metadata";
import {
  HostedGraphPersistence,
  type GraphAddress,
  type GraphDocument,
} from "@/lib/persistence/graph-persistence";
import { canvasToGraph, graphToCanvas } from "@/lib/pipeline-graph";
import { EXAMPLE_GRAPH } from "@/lib/pipeline-graph/__fixtures__/example-graph";

const configuredUrl = process.env.DANDER_CONTROL_URL;
const expectedVersion = process.env.DANDER_EXPECTED_VERSION;

if (!configuredUrl || !expectedVersion) {
  throw new Error(
    "Set DANDER_CONTROL_URL and DANDER_EXPECTED_VERSION to run current-Dander acceptance.",
  );
}

const baseUrl = new URL(configuredUrl);
if (!/^https?:$/.test(baseUrl.protocol) || baseUrl.username || baseUrl.password) {
  throw new Error("DANDER_CONTROL_URL must be credential-free HTTP(S).");
}

const address: GraphAddress = {
  project: "demo-project",
  graph: "druff-current-dander-acceptance",
};

const request: HostedControlFetch = async (target, init) => {
  const url = new URL(target.toString(), baseUrl);
  if (url.origin !== baseUrl.origin) {
    throw new Error("Current-Dander acceptance refused a cross-origin request.");
  }
  return fetch(url, { ...init, redirect: "error" });
};

const persistence = new HostedGraphPersistence(request);
const control = new HostedControlApiClient(request);
let current: GraphDocument | null = null;

afterAll(async () => {
  if (current?.address) {
    await persistence.delete(current.address, current.revision);
    current = null;
  }
});

describe("current protected Dander Control API", () => {
  it("accepts Druff graph and operation clients without a compatibility shim", async () => {
    const capabilities = await control.capabilities();
    expect(capabilities).toMatchObject({
      api_version: "v1",
      dander_version: expectedVersion,
      contract: {
        id: DANDER_CONTRACT_BUNDLE_ID,
        sha256: DANDER_CONTRACT_BUNDLE_SHA256,
      },
    });

    await expect(persistence.listProjects()).resolves.toContain(address.project);

    current = await persistence.create(address, EXAMPLE_GRAPH);
    expect(current.address).toEqual(address);
    expect(current.contentSha256).toMatch(/^[0-9a-f]{64}$/);

    const opened = await persistence.load(address);
    expect(opened).toMatchObject({
      address,
      revision: current.revision,
      contentSha256: current.contentSha256,
      graph: EXAMPLE_GRAPH,
    });

    const canvas = graphToCanvas(opened.graph);
    const unchangedDraft = canvasToGraph(
      canvas.nodes,
      canvas.edges,
      opened.graph.name,
      opened.graph.trigger,
    );
    const unchangedReview = await control.previewChanges(address, opened.revision, unchangedDraft);
    expect(unchangedReview.candidate_content_sha256).toBe(opened.contentSha256);

    const validation = await control.validate(address, opened.revision);
    expect(validation).toMatchObject({
      graph_name: EXAMPLE_GRAPH.name,
      content_sha256: opened.contentSha256,
    });

    const candidate = { ...EXAMPLE_GRAPH, name: "current_dander_acceptance_updated" };
    const changes = await control.previewChanges(address, opened.revision, candidate);
    expect(changes.baseline_content_sha256).toBe(opened.contentSha256);
    expect(changes.candidate_content_sha256).not.toBe(opened.contentSha256);
    expect(changes.graph_properties_changed).toContain("name");
    expect(changes.estimates?.rows_written).toBeNull();
    expect(changes.estimates?.cost_usd).toBeNull();
    // Preview must not save even though it accepts the unsaved candidate.
    await expect(persistence.load(address)).resolves.toMatchObject({
      revision: opened.revision,
      contentSha256: opened.contentSha256,
      graph: opened.graph,
    });

    current = await persistence.save(candidate, opened.revision, address);
    expect(current.revision).not.toBe(opened.revision);
    expect(current.contentSha256).toBe(changes.candidate_content_sha256);
    await expect(control.previewChanges(address, opened.revision, candidate)).rejects.toMatchObject(
      { conflict: true },
    );

    const previewFailure = await control
      .preview(address, current.revision)
      .catch((error: unknown) => error);
    expect(previewFailure).toBeInstanceOf(HostedControlOperationError);
    expect(previewFailure).toMatchObject({ unsupported: true });

    const runFailure = await control
      .startRun(address, current.revision)
      .catch((error: unknown) => error);
    expect(runFailure).toBeInstanceOf(HostedControlOperationError);
    expect(runFailure).toMatchObject({ unsupported: true });

    // This server intentionally has no execution plan or provider backend. Do not turn
    // a read-only contract proof into an accidental live workload or pretend repair ran.
    await expect(
      control.previewRepair(address, current.revision, {
        start_date: "2026-09-01",
        end_date: "2026-09-03",
      }),
    ).rejects.toMatchObject({ unsupported: true });

    await persistence.delete(address, current.revision);
    current = null;
    await expect(persistence.load(address)).rejects.toThrow(/does not exist/i);
  });
});
