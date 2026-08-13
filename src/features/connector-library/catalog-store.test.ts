import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearPluginCatalog,
  getPluginCatalogSnapshot,
  setPluginCatalog,
  subscribePluginCatalog,
} from "@/features/connector-library/catalog-store";
import type { PluginCatalogConnector } from "@/features/connector-library/catalog";

const CONNECTOR: PluginCatalogConnector = {
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

beforeEach(clearPluginCatalog);

describe("plugin catalog store", () => {
  it("replaces validated snapshots and notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribePluginCatalog(listener);

    setPluginCatalog([CONNECTOR]);

    expect(getPluginCatalogSnapshot()).toEqual([CONNECTOR]);
    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
  });

  it("rejects malformed server-owned entries", () => {
    const malformed = { ...CONNECTOR, secret_reference: "not-allowed" };
    expect(() => setPluginCatalog([malformed])).toThrow();
  });
});
