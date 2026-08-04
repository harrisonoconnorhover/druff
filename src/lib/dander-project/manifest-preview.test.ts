import { describe, expect, it } from "vitest";
import {
  DanderProjectManifestSchema,
  projectDanderManifest,
} from "@/lib/dander-project/manifest-preview";

const MANIFEST = {
  version: 1,
  platform: { region: "us-central1" },
  pipelines: {
    greenhouse_jobs: {
      source: "greenhouse_job_board",
      models: ["stg_greenhouse__jobs"],
      schedule: "0 9 * * *",
      time_zone: "America/New_York",
      paused: false,
      secrets: { NEVER_PROJECT_THIS: "secret-reference" },
      resources: { job: "dander-greenhouse-public" },
    },
    example_second: {
      source: "example_source",
      models: ["first_model", "second_model"],
      paused: true,
    },
  },
};

describe("projectDanderManifest", () => {
  it("draws every hosted pipeline as schedule -> source -> model nodes", () => {
    const manifest = DanderProjectManifestSchema.parse(MANIFEST);
    const preview = projectDanderManifest(manifest);

    expect(preview.pipelineCount).toBe(2);
    expect(preview.graph.name).toBe("dander-manifest-preview");
    expect(preview.graph.nodes).toHaveLength(7);
    expect(preview.graph.edges).toHaveLength(5);
    expect(preview.graph.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "greenhouse_jobs__source",
          name: "Ingest greenhouse_job_board",
        }),
        expect.objectContaining({
          id: "greenhouse_jobs__model__stg_greenhouse__jobs",
          name: "Build stg_greenhouse__jobs",
        }),
      ]),
    );
  });

  it("keeps pipelines in separate rows with transforms to the right", () => {
    const preview = projectDanderManifest(DanderProjectManifestSchema.parse(MANIFEST));

    expect(preview.positions.greenhouse_jobs__trigger.x).toBeLessThan(
      preview.positions.greenhouse_jobs__source.x,
    );
    expect(preview.positions.greenhouse_jobs__source.x).toBeLessThan(
      preview.positions.greenhouse_jobs__model__stg_greenhouse__jobs.x,
    );
    expect(preview.positions.example_second__source.y).toBeGreaterThan(
      preview.positions.greenhouse_jobs__source.y,
    );
  });

  it("does not copy secret references or cloud resource names into the local draft", () => {
    const preview = projectDanderManifest(DanderProjectManifestSchema.parse(MANIFEST));
    const serialized = JSON.stringify(preview);

    expect(serialized).not.toContain("NEVER_PROJECT_THIS");
    expect(serialized).not.toContain("secret-reference");
    expect(serialized).not.toContain("dander-greenhouse-public");
  });
});
