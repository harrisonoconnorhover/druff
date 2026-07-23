/**
 * Public contract of the `pipeline-graph` module — the data-layer seam between Dander's on-disk
 * `PipelineGraph` and the canvas's React Flow nodes/edges (see this module's design in
 * `tickets/DRUFF-4-pipeline-graph-model-serialization.md`). Downstream code (DRUFF-5, the canvas
 * feature) imports only from this barrel, never from the individual files directly.
 */

export {
  NodeFieldSchema,
  PipelineNodeSchema,
  TransformationKindSchema,
  TransformationSchema,
  FieldMappingSchema,
  JoinTypeSchema,
  JoinKeyPairSchema,
  JoinSpecSchema,
  PipelineEdgeSchema,
  PipelineGraphSchema,
} from "@/lib/pipeline-graph/schema";
export type {
  NodeField,
  PipelineNode,
  TransformationKind,
  Transformation,
  FieldMapping,
  JoinType,
  JoinKeyPair,
  JoinSpec,
  PipelineEdge,
  PipelineGraph,
} from "@/lib/pipeline-graph/schema";

export { encodeGraph, decodeGraph, GraphDecodeError } from "@/lib/pipeline-graph/serialize";
export type { GraphFormat } from "@/lib/pipeline-graph/serialize";

export {
  TYPE_TO_KIND,
  DEFAULT_NODE_KIND,
  kindForType,
  defaultTypeForKind,
} from "@/lib/pipeline-graph/canvas-types";
export type {
  PipelineNodeData,
  PipelineNodeKind,
  GraphLayout,
} from "@/lib/pipeline-graph/canvas-types";

export {
  canvasToGraph,
  graphToCanvas,
  extractLayout,
  computeDefaultLayout,
} from "@/lib/pipeline-graph/canvas-convert";
