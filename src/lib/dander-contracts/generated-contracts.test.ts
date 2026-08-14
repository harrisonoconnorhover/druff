import { describe, expect, it } from "vitest";
import apiErrorFixture from "@/generated/dander-contracts/bundle/fixtures/api-error.json";
import capabilitiesFixture from "@/generated/dander-contracts/bundle/fixtures/capabilities.json";
import connectorCatalogFixture from "@/generated/dander-contracts/bundle/fixtures/connector-catalog.json";
import controlBootstrapFixture from "@/generated/dander-contracts/bundle/fixtures/control-bootstrap.json";
import deploymentPreviewFixture from "@/generated/dander-contracts/bundle/fixtures/deployment-preview.json";
import graphCreateFixture from "@/generated/dander-contracts/bundle/fixtures/graph-create.json";
import graphPageFixture from "@/generated/dander-contracts/bundle/fixtures/graph-page.json";
import graphResourceFixture from "@/generated/dander-contracts/bundle/fixtures/graph-resource.json";
import graphValidationFixture from "@/generated/dander-contracts/bundle/fixtures/graph-validation.json";
import logPageFixture from "@/generated/dander-contracts/bundle/fixtures/log-page.json";
import mutationResultFixture from "@/generated/dander-contracts/bundle/fixtures/mutation-result.json";
import operationCatalogFixture from "@/generated/dander-contracts/bundle/fixtures/operation-catalog.json";
import pipelineGraphAliasFixture from "@/generated/dander-contracts/bundle/fixtures/pipeline-graph-alias-input.json";
import pipelineGraphFixture from "@/generated/dander-contracts/bundle/fixtures/pipeline-graph.json";
import pluginCatalogFixture from "@/generated/dander-contracts/bundle/fixtures/plugin-catalog.json";
import projectListFixture from "@/generated/dander-contracts/bundle/fixtures/project-list.json";
import runPageFixture from "@/generated/dander-contracts/bundle/fixtures/run-page.json";
import runRequestFixture from "@/generated/dander-contracts/bundle/fixtures/run-request.json";
import runStatusFixture from "@/generated/dander-contracts/bundle/fixtures/run-status.json";
import {
  ApiErrorEnvelopeSchema,
  CapabilitiesResponseSchema,
  ConnectorCatalogResponseSchema,
  ControlBootstrapDescriptorSchema,
  DeploymentPreviewResponseSchema,
  DANDER_CONTRACT_BUNDLE_SHA256,
  GraphCreateRequestSchema,
  GraphPageResponseSchema,
  GraphResourceResponseSchema,
  GraphValidationResponseSchema,
  IncompatibleDanderContractError,
  LogPageResponseSchema,
  MutationResultSchema,
  OperationCatalogResponseSchema,
  PipelineGraphDocumentSchema,
  PluginCatalogResponseSchema,
  ProjectListResponseSchema,
  RunPageResponseSchema,
  RunRequestSchema,
  RunStatusResponseSchema,
  assertCompatibleCapabilities,
} from "@/lib/dander-contracts";
import { PipelineGraphSchema } from "@/lib/pipeline-graph/schema";
import { decodeGraph, encodeGraph } from "@/lib/pipeline-graph/serialize";

const rootFixtures: [string, { parse(value: unknown): unknown }, unknown][] = [
  ["api error", ApiErrorEnvelopeSchema, apiErrorFixture],
  ["capabilities", CapabilitiesResponseSchema, capabilitiesFixture],
  ["connector catalog", ConnectorCatalogResponseSchema, connectorCatalogFixture],
  ["Control bootstrap", ControlBootstrapDescriptorSchema, controlBootstrapFixture],
  ["deployment preview", DeploymentPreviewResponseSchema, deploymentPreviewFixture],
  ["graph create", GraphCreateRequestSchema, graphCreateFixture],
  ["graph page", GraphPageResponseSchema, graphPageFixture],
  ["graph resource", GraphResourceResponseSchema, graphResourceFixture],
  ["graph validation", GraphValidationResponseSchema, graphValidationFixture],
  ["bounded log page", LogPageResponseSchema, logPageFixture],
  ["mutation result", MutationResultSchema, mutationResultFixture],
  ["operation catalog", OperationCatalogResponseSchema, operationCatalogFixture],
  ["pipeline graph", PipelineGraphDocumentSchema, pipelineGraphFixture],
  ["plugin catalog", PluginCatalogResponseSchema, pluginCatalogFixture],
  ["project list", ProjectListResponseSchema, projectListFixture],
  ["run page", RunPageResponseSchema, runPageFixture],
  ["run request", RunRequestSchema, runRequestFixture],
  ["run status", RunStatusResponseSchema, runStatusFixture],
];

describe("published Dander contract bundle", () => {
  it.each(rootFixtures)("parses the published %s fixture", (_name, schema, fixture) => {
    expect(schema.parse(fixture)).toEqual(fixture);
  });

  it("keeps generated validation pure and rejects strict-boundary additions", () => {
    const minimal = { name: "minimal" };
    const before = structuredClone(minimal);

    expect(PipelineGraphDocumentSchema.parse(minimal)).toEqual(before);
    expect(minimal).toEqual(before);
    expect(() => PipelineGraphDocumentSchema.parse({ ...minimal, provider: "gcp" })).toThrow();
  });

  it("round-trips Dander's representative graph without semantic field loss", () => {
    const input = structuredClone(pipelineGraphFixture);
    const graph = PipelineGraphSchema.parse(input);
    const encoded = JSON.parse(encodeGraph(graph, "json"));

    expect(input).toEqual(pipelineGraphFixture);
    expect(encoded).toEqual(pipelineGraphFixture);
    expect(decodeGraph(JSON.stringify(encoded), "json")).toEqual(graph);

    expect(new Set(graph.nodes.map((node) => node.type))).toEqual(
      new Set(["source", "transform", "target", "task"]),
    );
    expect(
      new Set(
        graph.nodes.flatMap((node) => node.fields.flatMap((field) => field.extensions ?? [])),
      ),
    ).toContainEqual({ provider: "redshift", name: "source_type", value: "varchar" });
    expect(
      new Set(
        graph.edges.flatMap((edge) =>
          edge.mappings.flatMap((mapping) =>
            mapping.transformation ? [mapping.transformation.kind] : [],
          ),
        ),
      ),
    ).toEqual(new Set(["direct", "expression", "constant", "custom_code"]));
    expect(
      new Set(
        graph.nodes.flatMap((node) => {
          const writer = node.config.writer;
          return typeof writer === "object" && writer !== null && "write_mode" in writer
            ? [writer.write_mode]
            : [];
        }),
      ),
    ).toEqual(new Set(["scd1", "scd2", "snapshot", "incremental", "replace"]));
    expect(
      graph.nodes.some((node) => {
        const writer = node.config.writer;
        return (
          typeof writer === "object" &&
          writer !== null &&
          "transport" in writer &&
          writer.transport === "copy"
        );
      }),
    ).toBe(true);
    expect(
      new Set(
        graph.nodes.flatMap((node) => {
          const operations = node.config.operations;
          return Array.isArray(operations)
            ? operations.flatMap((operation) =>
                typeof operation === "object" && operation !== null && "kind" in operation
                  ? [operation.kind]
                  : [],
              )
            : [];
        }),
      ),
    ).toEqual(new Set(["trim_whitespace", "truncate_string", "default_value", "filter_rows"]));
    expect(graph.nodes.some((node) => node.cursor !== undefined)).toBe(true);
    expect(graph.nodes.some((node) => node.visual !== undefined)).toBe(true);
    expect(graph.trigger?.kind).toBe("schedule");
  });

  it("canonicalizes the published params alias immutably and preserves allowed extras", () => {
    const input = structuredClone(pipelineGraphAliasFixture);
    const graph = PipelineGraphSchema.parse(input);

    expect(input).toEqual(pipelineGraphAliasFixture);
    expect(graph).toEqual({
      name: "legacy_alias",
      nodes: [
        {
          id: "extension",
          type: "task",
          name: "Extension",
          config: { preserved: { value: 1 } },
          fields: [],
        },
      ],
      edges: [],
    });
    expect(encodeGraph(graph, "json")).not.toContain('"params"');
  });
});

describe("Dander contract compatibility", () => {
  const compatible = {
    ...capabilitiesFixture,
    contract: { ...capabilitiesFixture.contract, sha256: DANDER_CONTRACT_BUNDLE_SHA256 },
  };

  it("accepts the exact embedded bundle and Druff version range", () => {
    expect(assertCompatibleCapabilities(compatible)).toEqual(compatible);
  });

  it("fails actionably for a different valid bundle digest", () => {
    const incompatible = {
      ...compatible,
      contract: { ...compatible.contract, sha256: "f".repeat(64) },
    };
    expect(() => assertCompatibleCapabilities(incompatible)).toThrow(
      IncompatibleDanderContractError,
    );
    expect(() => assertCompatibleCapabilities(incompatible)).toThrow(/Upgrade|upgrade/);
  });

  it("fails actionably when the advertised Druff range excludes this build", () => {
    const incompatible = {
      ...compatible,
      compatibility: { minimum_druff_contract: "2.0.0", maximum_druff_contract: "2.x" },
    };
    expect(() => assertCompatibleCapabilities(incompatible)).toThrow(/requires Druff contract/);
  });
});
