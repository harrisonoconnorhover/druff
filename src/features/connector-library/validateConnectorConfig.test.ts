import { describe, expect, it } from "vitest";
import { validateConnectorConfig } from "@/features/connector-library/validateConnectorConfig";
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

describe("validateConnectorConfig", () => {
  it("returns no errors when every required field is present", () => {
    expect(
      validateConnectorConfig(FIXTURE_CONNECTOR, {
        api_key_ref: "my-greenhouse-key-ref",
        base_url: "",
      }),
    ).toEqual({});
  });

  it("reports a missing required field", () => {
    expect(validateConnectorConfig(FIXTURE_CONNECTOR, { base_url: "" })).toEqual({
      api_key_ref: "API key reference is required.",
    });
  });

  it("reports a whitespace-only required field as missing", () => {
    expect(
      validateConnectorConfig(FIXTURE_CONNECTOR, { api_key_ref: "   ", base_url: "" }),
    ).toEqual({
      api_key_ref: "API key reference is required.",
    });
  });

  it("never reports an optional field, present or absent", () => {
    expect(
      validateConnectorConfig(FIXTURE_CONNECTOR, { api_key_ref: "my-greenhouse-key-ref" }),
    ).toEqual({});
  });

  it("returns an empty object for a descriptor with no required fields", () => {
    const noRequiredFields: ConnectorDescriptor = {
      ...FIXTURE_CONNECTOR,
      fields: [{ key: "base_url", label: "Base URL", type: "text", required: false }],
    };

    expect(validateConnectorConfig(noRequiredFields, {})).toEqual({});
  });
});
