import { z } from "zod";
import type { GraphLayout, PipelineGraph } from "@/lib/pipeline-graph";

const PIPELINE_ID = /^[a-z][a-z0-9_]{1,62}$/;
const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_-]*$/;

const DanderPipelineSpecSchema = z
  .object({
    source: z.string().regex(IDENTIFIER),
    models: z.array(z.string().regex(IDENTIFIER)).min(1),
    schedule: z.string().min(1).default("0 9 * * *"),
    time_zone: z.string().min(1).default("America/New_York"),
    paused: z.boolean().default(true),
    build_models: z.boolean().default(true),
  })
  .passthrough();

/**
 * The small, read-only subset of Dander's version-1 project manifest that Druff needs to draw a
 * hosted pipeline. Unknown project and pipeline keys are accepted because this is a visualization
 * boundary, not Dander's authoritative configuration validator.
 */
export const DanderProjectManifestSchema = z
  .object({
    version: z.literal(1),
    pipelines: z.record(z.string().regex(PIPELINE_ID), DanderPipelineSpecSchema),
  })
  .passthrough();

export type DanderProjectManifest = z.infer<typeof DanderProjectManifestSchema>;

export type DanderManifestPreview = {
  graph: PipelineGraph;
  positions: GraphLayout;
  pipelineCount: number;
};

const COLUMN_X = {
  trigger: 0,
  source: 300,
  model: 600,
} as const;
const FIRST_ROW_Y = 80;
const MODEL_SPACING_Y = 110;
const PIPELINE_GAP_Y = 90;

/**
 * Projects a real `dander.yaml` manifest into Druff's editable graph canvas. This is intentionally
 * one-way: the hosted manifest remains authoritative and Druff never writes it back or deploys it.
 * Secret mappings and resource identifiers are deliberately not copied into the canvas draft.
 */
export function projectDanderManifest(manifest: DanderProjectManifest): DanderManifestPreview {
  const graph: PipelineGraph = {
    name: "dander-manifest-preview",
    nodes: [],
    edges: [],
  };
  const positions: GraphLayout = {};
  let pipelineY = FIRST_ROW_Y;

  for (const [pipelineId, pipeline] of Object.entries(manifest.pipelines)) {
    const triggerId = `${pipelineId}__trigger`;
    const sourceId = `${pipelineId}__source`;

    graph.nodes.push(
      {
        id: triggerId,
        type: "trigger",
        name: pipeline.paused
          ? `Paused schedule: ${pipeline.schedule}`
          : `Schedule: ${pipeline.schedule}`,
        config: {
          pipeline_id: pipelineId,
          schedule: pipeline.schedule,
          time_zone: pipeline.time_zone,
          paused: pipeline.paused,
        },
        fields: [],
      },
      {
        id: sourceId,
        type: "source",
        name: `Ingest ${pipeline.source}`,
        config: { pipeline_id: pipelineId, source: pipeline.source },
        fields: [],
      },
    );
    graph.edges.push({
      from: triggerId,
      to: sourceId,
      metadata: {},
      mappings: [],
    });
    positions[triggerId] = { x: COLUMN_X.trigger, y: pipelineY };
    positions[sourceId] = { x: COLUMN_X.source, y: pipelineY };

    pipeline.models.forEach((model, index) => {
      const modelId = `${pipelineId}__model__${model}`;
      graph.nodes.push({
        id: modelId,
        type: "transform",
        name: `Build ${model}`,
        config: {
          pipeline_id: pipelineId,
          model,
          build_models: pipeline.build_models,
        },
        fields: [],
      });
      graph.edges.push({ from: sourceId, to: modelId, metadata: {}, mappings: [] });
      positions[modelId] = {
        x: COLUMN_X.model,
        y: pipelineY + index * MODEL_SPACING_Y,
      };
    });

    pipelineY +=
      Math.max(MODEL_SPACING_Y, pipeline.models.length * MODEL_SPACING_Y) + PIPELINE_GAP_Y;
  }

  return {
    graph,
    positions,
    pipelineCount: Object.keys(manifest.pipelines).length,
  };
}
