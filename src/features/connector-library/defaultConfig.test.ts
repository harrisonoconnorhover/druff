import { describe, expect, it } from "vitest";
import { defaultConfigForDescriptor } from "@/features/connector-library/defaultConfig";
import type { ConnectorDescriptor } from "@/features/connector-library/descriptors/types";

// Fixture descriptor only — non-sensitive, never a real connector's fields verbatim in a test.
const FIXTURE_CONNECTOR: ConnectorDescriptor = {
  id: "fixture",
  name: "Fixture",
  kind: "source",
  danderType: "connector.fixture",
  danderConnector: "fixture",
  fields: [
    { key: "api_key_ref", label: "API key reference", type: "secret", required: true },
    { key: "base_url", label: "Base URL", type: "text", required: false },
  ],
};

describe("defaultConfigForDescriptor", () => {
  it("seeds one empty-string entry per descriptor field", () => {
    expect(defaultConfigForDescriptor(FIXTURE_CONNECTOR)).toEqual({
      api_key_ref: "",
      base_url: "",
    });
  });

  it("never seeds a non-empty default for a secret field", () => {
    const config = defaultConfigForDescriptor(FIXTURE_CONNECTOR);

    expect(config.api_key_ref).toBe("");
  });

  it("returns an empty object for a descriptor with no fields", () => {
    expect(defaultConfigForDescriptor({ ...FIXTURE_CONNECTOR, fields: [] })).toEqual({});
  });

  it("seeds non-secret runtime bindings but never secret defaults", () => {
    expect(
      defaultConfigForDescriptor({
        ...FIXTURE_CONNECTOR,
        fields: [
          {
            key: "connector",
            label: "Connector",
            type: "text",
            required: true,
            defaultValue: "fixture",
          },
          {
            key: "secret",
            label: "Secret",
            type: "secret",
            required: true,
            defaultValue: "forbidden",
          },
        ],
      }),
    ).toEqual({ connector: "fixture", secret: "" });
  });
});
