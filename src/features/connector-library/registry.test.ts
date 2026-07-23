import { describe, expect, it } from "vitest";
import {
  CONNECTOR_REGISTRY,
  getConnector,
  getConnectorByDanderType,
  listConnectors,
} from "@/features/connector-library/registry";
import { GREENHOUSE_CONNECTOR } from "@/features/connector-library/descriptors/greenhouse";
import { ConnectorDescriptorSchema } from "@/features/connector-library/descriptors/types";

describe("getConnector", () => {
  it("resolves the Greenhouse connector by its registry id", () => {
    expect(getConnector("greenhouse")).toBe(GREENHOUSE_CONNECTOR);
  });

  it("returns undefined for an unknown id", () => {
    expect(getConnector("does-not-exist")).toBeUndefined();
  });
});

describe("getConnectorByDanderType", () => {
  it("resolves the Greenhouse connector by its danderType", () => {
    expect(getConnectorByDanderType(GREENHOUSE_CONNECTOR.danderType)).toBe(GREENHOUSE_CONNECTOR);
  });

  it("returns undefined for an unknown type token", () => {
    expect(getConnectorByDanderType("connector.unknown")).toBeUndefined();
  });

  it("round-trips id -> danderType -> id for every registered connector (not a hard-coded string)", () => {
    for (const connector of listConnectors()) {
      const resolved = getConnectorByDanderType(connector.danderType);
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
