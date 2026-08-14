import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import {
  HostedControlGate,
  HostedControlProvider,
  HostedControlStatus,
} from "@/features/hosted-control/HostedControlProvider";
import { OidcCallbackPage } from "@/features/hosted-control/OidcCallbackPage";
import { hostedControlDescriptor } from "@/features/hosted-control/test-fixtures";
import capabilitiesFixture from "@/generated/dander-contracts/bundle/fixtures/capabilities.json";
import {
  DANDER_CONTRACT_BUNDLE_ID,
  DANDER_CONTRACT_BUNDLE_SHA256,
} from "@/generated/dander-contracts/metadata";

const mocks = vi.hoisted(() => ({
  createSession: vi.fn(),
  discover: vi.fn(),
}));

vi.mock("@/features/hosted-control/HostedWorkspace", () => ({
  HostedWorkspace: () => <div>Verified hosted workspace</div>,
}));
vi.mock("@/features/hosted-control/bootstrap", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/hosted-control/bootstrap")>()),
  discoverControlBootstrap: mocks.discover,
}));
vi.mock("@/features/hosted-control/oidc-session", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/hosted-control/oidc-session")>()),
  createHostedOidcSession: mocks.createSession,
}));

function oidcSession() {
  return {
    beginSignIn: vi.fn(async () => undefined),
    completeSignIn: vi.fn(async () => ({ value: "memory-only", expiresAt: 2_000_000_000 })),
    beginSignOut: vi.fn(async () => undefined),
    completeSignOut: vi.fn(async () => undefined),
    clear: vi.fn(async () => undefined),
  };
}

describe("hosted-control presentation boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createSession.mockReturnValue(oidcSession());
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          ...capabilitiesFixture,
          contract: {
            id: DANDER_CONTRACT_BUNDLE_ID,
            sha256: DANDER_CONTRACT_BUNDLE_SHA256,
          },
          operations: ["graph.read"],
        }),
      ),
    );
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
    vi.unstubAllGlobals();
  });

  it("keeps the existing workspace available only as explicitly labeled loopback/offline mode", async () => {
    mocks.discover.mockResolvedValue({ mode: "loopback" });

    render(
      <HostedControlProvider>
        <HostedControlStatus />
        <HostedControlGate>
          <div>Local workspace</div>
        </HostedControlGate>
      </HostedControlProvider>,
    );

    expect(await screen.findByText("Loopback/offline mode")).toBeVisible();
    expect(screen.getByText("Local workspace")).toBeVisible();
    expect(mocks.discover).toHaveBeenCalledOnce();
  });

  it("preserves one original callback through Strict Mode while immediately cleaning the URL", async () => {
    const descriptor = hostedControlDescriptor();
    const session = oidcSession();
    mocks.createSession.mockReturnValue(session);
    mocks.discover.mockResolvedValue({
      mode: "hosted",
      descriptor,
      apiOrigin: "https://control.example.test",
    });
    const original =
      "http://localhost:3000/auth/callback#code=authorization-code&state=stored-state";
    window.history.replaceState(
      null,
      "",
      "/auth/callback#code=authorization-code&state=stored-state",
    );

    const callback = render(
      <StrictMode>
        <HostedControlProvider>
          <OidcCallbackPage kind="signin" />
        </HostedControlProvider>
      </StrictMode>,
    );

    await waitFor(() => expect(window.location.href).toBe("http://localhost:3000/auth/callback"));
    await waitFor(() => expect(session.completeSignIn).toHaveBeenCalledWith(original));
    expect(session.completeSignIn).toHaveBeenCalledOnce();
    await waitFor(() => expect(window.location.href).toBe("http://localhost:3000/"));
    expect(screen.getByText("Verified hosted workspace")).toBeVisible();

    callback.unmount();
    window.history.replaceState(null, "", "/");
    render(
      <HostedControlProvider>
        <HostedControlStatus />
        <HostedControlGate>
          <div>Hosted workspace after callback navigation</div>
        </HostedControlGate>
      </HostedControlProvider>,
    );

    expect(await screen.findByText("Hosted session")).toBeVisible();
    expect(await screen.findByText("Hosted workspace after callback navigation")).toBeVisible();
  });

  it("blocks the workspace when actual capabilities do not match the generated contract", async () => {
    const descriptor = hostedControlDescriptor();
    mocks.discover.mockResolvedValue({
      mode: "hosted",
      descriptor,
      apiOrigin: "https://control.example.test",
    });
    const session = oidcSession();
    mocks.createSession.mockReturnValue(session);
    vi.mocked(globalThis.fetch).mockResolvedValue(
      Response.json({
        ...capabilitiesFixture,
        contract: { id: DANDER_CONTRACT_BUNDLE_ID, sha256: "0".repeat(64) },
        operations: ["graph.read"],
      }),
    );
    // Reuse the verified in-memory callback handoff to enter the authenticated state.
    window.history.replaceState(null, "", "/auth/callback#code=code&state=state");
    const callback = render(
      <HostedControlProvider>
        <OidcCallbackPage kind="signin" />
      </HostedControlProvider>,
    );
    await waitFor(() => expect(session.completeSignIn).toHaveBeenCalled());
    callback.unmount();
    window.history.replaceState(null, "", "/");
    render(
      <HostedControlProvider>
        <HostedControlGate>
          <div>Must remain blocked</div>
        </HostedControlGate>
      </HostedControlProvider>,
    );
    expect(await screen.findByText("Hosted compatibility is safely blocked")).toBeVisible();
    expect(screen.queryByText("Must remain blocked")).not.toBeInTheDocument();
  });
});
