import { describe, expect, it, vi } from "vitest";
import {
  HostedControlConfigurationError,
  discoverControlBootstrap,
  verifyControlBootstrap,
} from "@/features/hosted-control/bootstrap";
import { hostedControlDescriptor } from "@/features/hosted-control/test-fixtures";

describe("hosted-control bootstrap discovery", () => {
  it("loads only the fixed same-origin descriptor without browser credentials", async () => {
    const descriptor = hostedControlDescriptor();
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(Response.json(descriptor));

    await expect(
      discoverControlBootstrap({
        browserOrigin: "https://druff.example.test",
        fetchImpl,
      }),
    ).resolves.toEqual({
      mode: "hosted",
      descriptor,
      apiOrigin: "https://control.example.test",
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBeInstanceOf(URL);
    expect((url as URL).href).toBe("https://druff.example.test/bootstrap.json");
    expect(init).toMatchObject({ credentials: "omit", redirect: "error", cache: "no-store" });
  });

  it("uses an absent descriptor as the explicit loopback/offline boundary", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 404 }));
    await expect(
      discoverControlBootstrap({ browserOrigin: "https://druff.example.test", fetchImpl }),
    ).resolves.toEqual({ mode: "loopback" });
  });

  it("fails closed for unreadable, stale, or redirected hosted configuration", async () => {
    const stale = hostedControlDescriptor();
    stale.contract.sha256 = "0".repeat(64);
    expect(() => verifyControlBootstrap(stale, "https://druff.example.test")).toThrow(
      HostedControlConfigurationError,
    );

    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 503 }));
    await expect(
      discoverControlBootstrap({ browserOrigin: "https://druff.example.test", fetchImpl }),
    ).rejects.toThrow("HTTP 503");
  });

  it("requires the exact exported sign-in and post-logout callback routes", () => {
    const wrongSignin = {
      ...hostedControlDescriptor(),
      redirect_uri: "https://druff.example.test/other-callback",
    };
    expect(() => verifyControlBootstrap(wrongSignin, "https://druff.example.test")).toThrow(
      "/auth/callback",
    );

    const wrongLogout = {
      ...hostedControlDescriptor(),
      logout_uri: "https://druff.example.test/other-logout",
    };
    expect(() => verifyControlBootstrap(wrongLogout, "https://druff.example.test")).toThrow(
      "/signed-out",
    );
  });

  it("rejects non-HTTPS provider and API URLs", () => {
    const descriptor = {
      ...hostedControlDescriptor(),
      issuer: "http://identity.example.test/tenant",
    };
    expect(() => verifyControlBootstrap(descriptor, "https://druff.example.test")).toThrow(
      "OIDC issuer",
    );
  });
});
