import { z } from "zod";
import type { ErrorObject, ValidateFunction } from "ajv";
import {
  validateApiError,
  validateCapabilities,
  validateConnectorCatalog,
  validateCursorStrategy,
  validateDeploymentPreview,
  validateDestination,
  validateFieldMapping,
  validateFieldTest,
  validateGraphValidation,
  validateJoin,
  validateJoinKeyPair,
  validateLogPage,
  validateMutationResult,
  validateNodeField,
  validateNodeVisual,
  validateOperationCatalog,
  validatePartitioning,
  validatePipelineEdge,
  validatePipelineGraph,
  validatePipelineNode,
  validatePluginCatalog,
  validatePosition,
  validateRunRequest,
  validateRunStatus,
  validateTransformation,
  validateTrigger,
  validateWriter,
} from "@/generated/dander-contracts/validators.js";

function pointerPath(pointer: string): PropertyKey[] {
  if (pointer.length === 0) return [];
  return pointer
    .slice(1)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
    .map((part) => (/^(0|[1-9]\d*)$/.test(part) ? Number(part) : part));
}

function describeError(error: ErrorObject): string {
  const location = error.instancePath || "/";
  if (error.keyword === "additionalProperties") {
    const property = error.params.additionalProperty;
    return `${location} contains unrecognized field ${JSON.stringify(property)}`;
  }
  return `${location} ${error.message ?? "does not match the contract"}`;
}

/**
 * Turns an exact generated Ajv validator into Druff's normal Zod boundary interface. Validation
 * is deliberately pure: no coercion, default insertion, or unknown-field removal occurs here.
 */
export function generatedContractSchema<T>(
  label: string,
  validator: ValidateFunction<T>,
): z.ZodType<T> {
  return z.unknown().transform((value, context): T => {
    if (validator(value)) return value;
    const errors = validator.errors ?? [];
    if (errors.length === 0) {
      context.addIssue({ code: "custom", message: `${label} does not match Dander's contract.` });
    } else {
      for (const error of errors) {
        context.addIssue({
          code: "custom",
          message: `${label}: ${describeError(error)}`,
          path: pointerPath(error.instancePath),
        });
      }
    }
    return z.NEVER;
  });
}

export const ApiErrorEnvelopeSchema = generatedContractSchema("API error", validateApiError);
export const CapabilitiesResponseSchema = generatedContractSchema(
  "capabilities response",
  validateCapabilities,
);
export const ConnectorCatalogResponseSchema = generatedContractSchema(
  "connector catalog",
  validateConnectorCatalog,
);
export const DeploymentPreviewResponseSchema = generatedContractSchema(
  "deployment preview",
  validateDeploymentPreview,
);
export const GraphValidationResponseSchema = generatedContractSchema(
  "graph validation",
  validateGraphValidation,
);
export const LogPageResponseSchema = generatedContractSchema("log page", validateLogPage);
export const MutationResultSchema = generatedContractSchema(
  "mutation result",
  validateMutationResult,
);
export const OperationCatalogResponseSchema = generatedContractSchema(
  "operation catalog",
  validateOperationCatalog,
);
export const PipelineGraphDocumentSchema = generatedContractSchema(
  "pipeline graph",
  validatePipelineGraph,
);
export const PluginCatalogResponseSchema = generatedContractSchema(
  "plugin catalog",
  validatePluginCatalog,
);
export const RunRequestSchema = generatedContractSchema("run request", validateRunRequest);
export const RunStatusResponseSchema = generatedContractSchema("run status", validateRunStatus);

export const RawPipelineNodeSchema = generatedContractSchema("pipeline node", validatePipelineNode);
export const RawNodeFieldSchema = generatedContractSchema("node field", validateNodeField);
export const RawFieldTestSchema = generatedContractSchema("field test", validateFieldTest);
export const RawCursorStrategySchema = generatedContractSchema(
  "cursor strategy",
  validateCursorStrategy,
);
export const RawPositionSchema = generatedContractSchema("position", validatePosition);
export const RawNodeVisualSchema = generatedContractSchema("node visual", validateNodeVisual);
export const RawTransformationSchema = generatedContractSchema(
  "transformation",
  validateTransformation,
);
export const RawFieldMappingSchema = generatedContractSchema("field mapping", validateFieldMapping);
export const RawJoinKeyPairSchema = generatedContractSchema("join key pair", validateJoinKeyPair);
export const RawJoinSchema = generatedContractSchema("join", validateJoin);
export const RawPipelineEdgeSchema = generatedContractSchema("pipeline edge", validatePipelineEdge);
export const RawTriggerSchema = generatedContractSchema("trigger", validateTrigger);
export const RawDestinationSchema = generatedContractSchema("destination", validateDestination);
export const RawPartitioningSchema = generatedContractSchema("partitioning", validatePartitioning);
export const RawWriterSchema = generatedContractSchema("writer", validateWriter);
