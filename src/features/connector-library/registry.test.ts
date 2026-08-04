import { beforeEach, describe, expect, it } from "vitest";
import {
  CONNECTOR_REGISTRY,
  clearDiscoveredConnectors,
  getConnector,
  getConnectorForDanderNode,
  listConnectors,
  setDiscoveredConnectors,
} from "@/features/connector-library/registry";
import { GREENHOUSE_CONNECTOR } from "@/features/connector-library/descriptors/greenhouse";
import { ConnectorDescriptorSchema } from "@/features/connector-library/descriptors/types";

beforeEach(clearDiscoveredConnectors);

describe("getConnector", () => {
  it("resolves the Greenhouse connector by its registry id", () => {
    expect(getConnector("greenhouse")).toBe(GREENHOUSE_CONNECTOR);
  });

  it("returns undefined for an unknown id", () => {
    expect(getConnector("does-not-exist")).toBeUndefined();
  });
});

describe("getConnectorForDanderNode", () => {
  it("resolves Greenhouse by generic source type plus connector binding", () => {
    expect(getConnectorForDanderNode("source", { connector: "greenhouse_job_board" })).toBe(
      GREENHOUSE_CONNECTOR,
    );
  });

  it("does not classify an unrelated generic source as Greenhouse", () => {
    expect(getConnectorForDanderNode("source", { connector: "salesforce" })).toBeUndefined();
  });

  it("round-trips each registered connector's runtime identity", () => {
    for (const connector of listConnectors()) {
      const resolved = getConnectorForDanderNode(connector.danderType, {
        connector: connector.danderConnector,
      });
      expect(resolved?.id).toBe(connector.id);
    }
  });
});

describe("listConnectors", () => {
  it("lists every registered connector, including Greenhouse", () => {
    expect(listConnectors()).toContain(GREENHOUSE_CONNECTOR);
  });

  it("stays in lockstep with CONNECTOR_REGISTRY", () => {
    expect(listConnectors()).toEqual(Object.values(CONNECTOR_REGISTRY));
  });

  it("adds a discovered connector and round-trips its canonical binding", () => {
    setDiscoveredConnectors([
      {
        id: "salesforce",
        name: "Salesforce",
        kind: "source",
        danderType: "source",
        danderConnector: "salesforce",
        fields: [],
        plugin: { distribution: "dander-connector-salesforce", version: "0.1.0rc1" },
      },
    ]);

    expect(getConnector("salesforce")?.name).toBe("Salesforce");
    expect(getConnectorForDanderNode("source", { connector: "salesforce" })?.id).toBe("salesforce");
    expect(listConnectors()).toContain(GREENHOUSE_CONNECTOR);
  });
});

describe("ConnectorDescriptorSchema", () => {
  it("parses every registered connector descriptor without throwing", () => {
    for (const connector of listConnectors()) {
      expect(() => ConnectorDescriptorSchema.parse(connector)).not.toThrow();
    }
  });

  it("fails loud on a malformed descriptor (missing required shape)", () => {
    expect(() =>
      ConnectorDescriptorSchema.parse({
        id: "bad",
        name: "Bad" /* missing kind/danderType/fields */,
      }),
    ).toThrow();
  });

  it("fails loud on an unknown field type", () => {
    expect(() =>
      ConnectorDescriptorSchema.parse({
        ...GREENHOUSE_CONNECTOR,
        fields: [{ key: "k", label: "K", type: "number", required: false }],
      }),
    ).toThrow();
  });
});
