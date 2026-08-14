import type { ValidateFunction } from "ajv";
import type { ApiErrorEnvelope } from "./types/api-error";
import type { CapabilitiesResponse } from "./types/capabilities";
import type { ConnectorCatalogResponse } from "./types/connector-catalog";
import type { ControlBootstrapDescriptor } from "./types/control-bootstrap";
import type { DeploymentPreviewResponse } from "./types/deployment-preview";
import type { GraphCreateRequest } from "./types/graph-create";
import type { GraphPageResponse } from "./types/graph-page";
import type { GraphResourceResponse } from "./types/graph-resource";
import type { GraphValidationResponse } from "./types/graph-validation";
import type { LogPageResponse } from "./types/log-page";
import type { MutationResult } from "./types/mutation-result";
import type { OperationCatalogResponse } from "./types/operation-catalog";
import type { PipelineGraphDocument } from "./types/pipeline-graph";
import type { PluginCatalogResponse } from "./types/plugin-catalog";
import type { ProjectListResponse } from "./types/project-list";
import type { RunPageResponse } from "./types/run-page";
import type { RunRequest } from "./types/run-request";
import type { RunStatusResponse } from "./types/run-status";
import type {
  GraphNodeDocument,
  NodeFieldDocument,
  FieldTestDocument,
  CursorStrategyDocument,
  PositionDocument,
  NodeVisualDocument,
  TransformationDocument,
  FieldMappingDocument,
  JoinKeyPairDocument,
  JoinDocument,
  EdgeDocument,
  TriggerDocument,
  DestinationDocument,
  PartitioningDocument,
  WriterDocument,
} from "./types/pipeline-graph";

export const validateApiError: ValidateFunction<ApiErrorEnvelope>;
export const validateCapabilities: ValidateFunction<CapabilitiesResponse>;
export const validateConnectorCatalog: ValidateFunction<ConnectorCatalogResponse>;
export const validateControlBootstrap: ValidateFunction<ControlBootstrapDescriptor>;
export const validateDeploymentPreview: ValidateFunction<DeploymentPreviewResponse>;
export const validateGraphCreate: ValidateFunction<GraphCreateRequest>;
export const validateGraphPage: ValidateFunction<GraphPageResponse>;
export const validateGraphResource: ValidateFunction<GraphResourceResponse>;
export const validateGraphValidation: ValidateFunction<GraphValidationResponse>;
export const validateLogPage: ValidateFunction<LogPageResponse>;
export const validateMutationResult: ValidateFunction<MutationResult>;
export const validateOperationCatalog: ValidateFunction<OperationCatalogResponse>;
export const validatePipelineGraph: ValidateFunction<PipelineGraphDocument>;
export const validatePluginCatalog: ValidateFunction<PluginCatalogResponse>;
export const validateProjectList: ValidateFunction<ProjectListResponse>;
export const validateRunPage: ValidateFunction<RunPageResponse>;
export const validateRunRequest: ValidateFunction<RunRequest>;
export const validateRunStatus: ValidateFunction<RunStatusResponse>;
export const validatePipelineNode: ValidateFunction<GraphNodeDocument>;
export const validateNodeField: ValidateFunction<NodeFieldDocument>;
export const validateFieldTest: ValidateFunction<FieldTestDocument>;
export const validateCursorStrategy: ValidateFunction<CursorStrategyDocument>;
export const validatePosition: ValidateFunction<PositionDocument>;
export const validateNodeVisual: ValidateFunction<NodeVisualDocument>;
export const validateTransformation: ValidateFunction<TransformationDocument>;
export const validateFieldMapping: ValidateFunction<FieldMappingDocument>;
export const validateJoinKeyPair: ValidateFunction<JoinKeyPairDocument>;
export const validateJoin: ValidateFunction<JoinDocument>;
export const validatePipelineEdge: ValidateFunction<EdgeDocument>;
export const validateTrigger: ValidateFunction<TriggerDocument>;
export const validateDestination: ValidateFunction<DestinationDocument>;
export const validatePartitioning: ValidateFunction<PartitioningDocument>;
export const validateWriter: ValidateFunction<WriterDocument>;
