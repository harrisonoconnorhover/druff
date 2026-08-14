import { describe, expect, it, vi } from "vitest";
import {
  DanderApiPluginCatalogDiscovery,
  HostedPluginCatalogDiscovery,
  PluginCatalogDiscoveryError,
} from "@/features/connector-library/catalog";

const CATALOG = {
  schema_version: 1,
  dander_version: "0.5.0",
  connectors: [
    {
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
    },
  ],
};

describe("DanderApiPluginCatalogDiscovery", () => {
  it("strictly parses curated package and support metadata", async () => {
    const fetchCatalog = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(CATALOG), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const discovery = new DanderApiPluginCatalogDiscovery("http://127.0.0.1:8765/", fetchCatalog);

    await expect(discovery.load()).resolves.toEqual(CATALOG.connectors);
    expect(fetchCatalog).toHaveBeenCalledWith("http://127.0.0.1:8765/v1/plugin-catalog", {
      method: "GET",
      headers: { Accept: "application/json" },
      targetAddressSpace: "loopback",
    });
  });

  it("treats an older Dander 404 as an empty optional catalog", async () => {
    const fetchCatalog = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ error: "Not found." }), { status: 404 }));

    await expect(
      new DanderApiPluginCatalogDiscovery("http://dander.test", fetchCatalog).load(),
    ).resolves.toEqual([]);
  });

  it("rejects fields outside Dander's generated catalog contract", async () => {
    const sensitive = structuredClone(CATALOG) as typeof CATALOG & { secret_reference: string };
    sensitive.secret_reference = "not-allowed";
    const sensitiveFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify(sensitive), { status: 200 }));
    await expect(
      new DanderApiPluginCatalogDiscovery("http://dander.test", sensitiveFetch).load(),
    ).rejects.toThrow(PluginCatalogDiscoveryError);
  });

  it("loads curated metadata through the authenticated hosted request", async () => {
    const request = vi.fn(async () => Response.json(CATALOG));

    await expect(new HostedPluginCatalogDiscovery(request).load()).resolves.toEqual(
      CATALOG.connectors,
    );
    expect(request).toHaveBeenCalledWith("/v1/plugin-catalog", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
  });
});
