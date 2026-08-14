import { describe, expect, it, vi } from "vitest";
import {
  DanderApiOperationCatalogDiscovery,
  HostedOperationCatalogDiscovery,
  OperationCatalogDiscoveryError,
} from "@/features/pipeline-operations/catalog";

const CATALOG = {
  schema_version: 1,
  operations: [
    {
      kind: "trim_whitespace",
      display_name: "Trim whitespace",
      description: "Remove leading and trailing whitespace.",
      parameters: [{ name: "field", display_name: "Field", control: "field", required: true }],
    },
  ],
};

describe("DanderApiOperationCatalogDiscovery", () => {
  it("loads the runtime-owned safe operation catalog", async () => {
    const fetchCatalog = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(CATALOG), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      new DanderApiOperationCatalogDiscovery("http://127.0.0.1:8765/", fetchCatalog).load(),
    ).resolves.toEqual(CATALOG.operations);
    expect(fetchCatalog).toHaveBeenCalledWith("http://127.0.0.1:8765/v1/operations", {
      method: "GET",
      headers: { Accept: "application/json" },
      targetAddressSpace: "loopback",
    });
  });

  it("treats an older runtime 404 as an empty optional catalog", async () => {
    const fetchCatalog = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 404 }));
    await expect(
      new DanderApiOperationCatalogDiscovery("http://dander.test", fetchCatalog).load(),
    ).resolves.toEqual([]);
  });

  it("rejects duplicate, unknown, or sensitive descriptors", async () => {
    const malformed = structuredClone(CATALOG) as Record<string, unknown>;
    malformed.secret_reference = "must-not-cross-this-boundary";
    const fetchCatalog = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify(malformed), { status: 200 }));

    await expect(
      new DanderApiOperationCatalogDiscovery("http://dander.test", fetchCatalog).load(),
    ).rejects.toThrow(OperationCatalogDiscoveryError);
  });

  it("loads operations through the authenticated hosted request", async () => {
    const request = vi.fn(async () => Response.json(CATALOG));

    await expect(new HostedOperationCatalogDiscovery(request).load()).resolves.toEqual(
      CATALOG.operations,
    );
    expect(request).toHaveBeenCalledWith("/v1/operations", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
  });
});
