import { describe, expect, it, vi } from "vitest";
import {
  HostedControlRequestError,
  createHostedControlFetch,
} from "@/features/hosted-control/authorized-fetch";

const ACCESS = { value: "memory-only-token", expiresAt: 2_000_000_000 };

describe("hosted Control API fetch boundary", () => {
  it("sends Bearer only to the descriptor API origin without cookies or redirects", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));
    const request = createHostedControlFetch({
      apiOrigin: "https://control.example.test",
      getAccessToken: () => ACCESS,
      fetchImpl,
    });
    await request("/v1/projects", { method: "GET" });

    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBeInstanceOf(URL);
    expect((url as URL).href).toBe("https://control.example.test/v1/projects");
    expect(init).toBeDefined();
    expect(init!.credentials).toBe("omit");
    expect(init!.redirect).toBe("error");
    expect(new Headers(init!.headers).get("Authorization")).toBe("Bearer memory-only-token");
  });

  it("refuses foreign origins and caller-supplied authorization", async () => {
    const request = createHostedControlFetch({
      apiOrigin: "https://control.example.test",
      getAccessToken: () => ACCESS,
      fetchImpl: vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 })),
    });
    await expect(request("https://elsewhere.example.test/v1/projects")).rejects.toThrow(
      HostedControlRequestError,
    );
    await expect(
      request("/v1/projects", { headers: { Authorization: "Bearer caller-token" } }),
    ).rejects.toThrow("cannot override");
  });

  it("fails before fetch on expiry and clears auth on expiry or HTTP 401", async () => {
    const onUnauthorized = vi.fn(async () => undefined);
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 401 }));
    const expired = createHostedControlFetch({
      apiOrigin: "https://control.example.test",
      getAccessToken: () => ({ value: "expired", expiresAt: 1 }),
      onUnauthorized,
      fetchImpl,
    });
    await expect(expired("/v1/projects")).rejects.toThrow("Sign in again");
    expect(fetchImpl).not.toHaveBeenCalled();

    const active = createHostedControlFetch({
      apiOrigin: "https://control.example.test",
      getAccessToken: () => ACCESS,
      onUnauthorized,
      fetchImpl,
    });
    await active("/v1/projects");
    expect(onUnauthorized).toHaveBeenCalledTimes(2);
  });
});
