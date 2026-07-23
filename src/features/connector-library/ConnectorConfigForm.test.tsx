import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConnectorConfigForm } from "@/features/connector-library/ConnectorConfigForm";
import type { ConnectorDescriptor } from "@/features/connector-library/descriptors/types";

// Fixture descriptor + fixture-only values — no real/sensitive data, per steering/02-engineering.md.
const FIXTURE_CONNECTOR: ConnectorDescriptor = {
  id: "fixture",
  name: "Fixture",
  kind: "source",
  danderType: "connector.fixture",
  fields: [
    {
      key: "api_key_ref",
      label: "API key reference",
      type: "secret",
      required: true,
      help: "A secret reference, not the secret itself.",
    },
    { key: "base_url", label: "Base URL", type: "text", required: false, placeholder: "https://x" },
  ],
};

describe("ConnectorConfigForm", () => {
  it("renders exactly one control per descriptor field", () => {
    render(
      <ConnectorConfigForm
        descriptor={FIXTURE_CONNECTOR}
        config={{}}
        errors={{}}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/api key reference/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/base url/i)).toBeInTheDocument();
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
  });

  it("shows the current config value for each field", () => {
    render(
      <ConnectorConfigForm
        descriptor={FIXTURE_CONNECTOR}
        config={{ api_key_ref: "my-greenhouse-key-ref", base_url: "https://harvest.example" }}
        errors={{}}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/api key reference/i)).toHaveValue("my-greenhouse-key-ref");
    expect(screen.getByLabelText(/base url/i)).toHaveValue("https://harvest.example");
  });

  it("shows the required-field error message when errors is populated", () => {
    render(
      <ConnectorConfigForm
        descriptor={FIXTURE_CONNECTOR}
        config={{}}
        errors={{ api_key_ref: "API key reference is required." }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("API key reference is required.")).toBeInTheDocument();
    expect(screen.getByLabelText(/api key reference/i)).toHaveAttribute("aria-invalid", "true");
  });

  it("does not mask the secret field and shows its reference hint", () => {
    render(
      <ConnectorConfigForm
        descriptor={FIXTURE_CONNECTOR}
        config={{}}
        errors={{}}
        onChange={vi.fn()}
      />,
    );

    const secretInput = screen.getByLabelText(/api key reference/i);
    expect(secretInput).not.toHaveAttribute("type", "password");
    expect(
      screen.getByText(/reference to a secret dander resolves at run time/i),
    ).toBeInTheDocument();
  });

  it("calls onChange with the field's key and new value on input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ConnectorConfigForm
        descriptor={FIXTURE_CONNECTOR}
        config={{ base_url: "" }}
        errors={{}}
        onChange={onChange}
      />,
    );

    await user.type(screen.getByLabelText(/base url/i), "x");

    expect(onChange).toHaveBeenCalledWith("base_url", "x");
  });
});
