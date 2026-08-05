import { describe, expect, it, vi } from "vitest";
import {
  ConnectorDiscoveryError,
  DanderApiConnectorDiscovery,
} from "@/features/connector-library/discovery";

const CATALOG = {
  connectors: [
    {
      id: "salesforce",
      display_name: "Salesforce",
      engine: "salesforce_bulk2",
      description: "Read Accounts.",
      plugin: {
        id: "salesforce",
        distribution: "dander-connector-salesforce",
        version: "0.1.0rc1",
      },
      endpoints: [
        {
          id: "accounts",
          display_name: "Accounts",
          graph_binding: { connector: "salesforce", endpoint: "accounts" },
          fields: [
            { name: "Id", display_name: "ID", data_type: "STRING", required: true },
            {
              name: "SystemModstamp",
              display_name: "System modification stamp",
              data_type: "TIMESTAMP",
              required: true,
            },
          ],
        },
      ],
    },
  ],
};

describe("DanderApiConnectorDiscovery", () => {
  it("projects an installed plugin into a canonical source binding and field schema", async () => {
    const fetchConnectors = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(CATALOG), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const discovery = new DanderApiConnectorDiscovery("http://127.0.0.1:8765/", fetchConnectors);

    await expect(discovery.load()).resolves.toEqual([
      expect.objectContaining({
        id: "salesforce",
        name: "Salesforce",
        danderType: "source",
        danderConnector: "salesforce",
        plugin: {
          distribution: "dander-connector-salesforce",
          version: "0.1.0rc1",
        },
        outputFields: [
          expect.objectContaining({ name: "Id", type: "STRING", nullable: false }),
          expect.objectContaining({
            name: "SystemModstamp",
            type: "TIMESTAMP",
            nullable: false,
          }),
        ],
      }),
    ]);
    expect(fetchConnectors).toHaveBeenCalledWith("http://127.0.0.1:8765/v1/connectors", {
      method: "GET",
      headers: { Accept: "application/json" },
      targetAddressSpace: "loopback",
    });
  });

  it("keeps older Dander graph services usable through the static fallback", async () => {
    const fetchConnectors = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ error: "Not found." }), { status: 404 }));

    await expect(
      new DanderApiConnectorDiscovery("http://dander.test", fetchConnectors).load(),
    ).resolves.toEqual([]);
  });

  it("rejects inconsistent bindings and unexpected sensitive properties", async () => {
    const inconsistent = structuredClone(CATALOG);
    inconsistent.connectors[0].endpoints[0].graph_binding.endpoint = "contacts";
    const badBinding = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify(inconsistent), { status: 200 }));
    await expect(
      new DanderApiConnectorDiscovery("http://dander.test", badBinding).load(),
    ).rejects.toThrow(ConnectorDiscoveryError);

    const sensitive = structuredClone(CATALOG) as typeof CATALOG & { base_url: string };
    sensitive.base_url = "https://private.example.test";
    const badShape = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify(sensitive), { status: 200 }));
    await expect(
      new DanderApiConnectorDiscovery("http://dander.test", badShape).load(),
    ).rejects.toThrow(/cannot safely use/);
  });
});
