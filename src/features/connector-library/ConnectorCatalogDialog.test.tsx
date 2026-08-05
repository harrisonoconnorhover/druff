import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ConnectorCatalogDialog,
  connectorSetupInstructions,
} from "@/features/connector-library/ConnectorCatalogDialog";
import type { PluginCatalogConnector } from "@/features/connector-library/catalog";
import { clearPluginCatalog, setPluginCatalog } from "@/features/connector-library/catalog-store";

const SALESFORCE: PluginCatalogConnector = {
  id: "salesforce",
  display_name: "Salesforce",
  description: "Bulk API Accounts ingestion.",
  distribution: "dander-connector-salesforce",
  version: "0.1.1",
  dander_specifier: ">=0.4.0,<0.6",
  compatible: true,
  support_status: "first-party-alpha",
  validation_status: "provider-validated",
  documentation_url: "https://example.test/docs/salesforce",
  pypi_url: "https://example.test/pypi/salesforce",
  repository_url: "https://example.test/repository/salesforce",
  installed: true,
  installed_version: "0.1.1",
};

const SERVICENOW: PluginCatalogConnector = {
  ...SALESFORCE,
  id: "servicenow",
  display_name: "ServiceNow",
  description: "Table API incident ingestion.",
  distribution: "dander-connector-servicenow",
  documentation_url: "https://example.test/docs/servicenow",
  pypi_url: "https://example.test/pypi/servicenow",
  repository_url: "https://example.test/repository/servicenow",
  installed: false,
  installed_version: null,
};

beforeEach(() => {
  clearPluginCatalog();
  setPluginCatalog([SALESFORCE, SERVICENOW]);
});

describe("ConnectorCatalogDialog", () => {
  it("searches curated metadata and shows compatibility and installation status", async () => {
    const user = userEvent.setup();
    render(<ConnectorCatalogDialog />);

    await user.click(screen.getByRole("button", { name: /browse catalog/i }));
    expect(screen.getByText("Installed 0.1.1")).toBeInTheDocument();
    expect(screen.getByText("Not installed")).toBeInTheDocument();
    expect(screen.getAllByText("provider-validated")).toHaveLength(2);

    await user.type(screen.getByLabelText(/search connector catalog/i), "incident");
    expect(screen.getByRole("heading", { name: "ServiceNow" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Salesforce" })).not.toBeInTheDocument();
  });

  it("copies exact manifest and install steps without invoking package installation", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    render(<ConnectorCatalogDialog />);

    await user.click(screen.getByRole("button", { name: /browse catalog/i }));
    await user.click(screen.getAllByRole("button", { name: /copy setup/i })[0]);

    expect(writeText).toHaveBeenCalledWith(connectorSetupInstructions(SALESFORCE));
    expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();
  });
});

describe("connectorSetupInstructions", () => {
  it("pins the public package and keeps activation operator-controlled", () => {
    expect(connectorSetupInstructions(SALESFORCE)).toContain(
      "distribution: dander-connector-salesforce",
    );
    expect(connectorSetupInstructions(SALESFORCE)).toContain("version: 0.1.1");
    expect(connectorSetupInstructions(SALESFORCE)).toContain("dander plugins install");
    expect(connectorSetupInstructions(SALESFORCE)).toContain("Restart dander graph serve");
  });
});
