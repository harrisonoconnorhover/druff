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
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
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
      "http://localhost:3000/auth/callback?code=authorization-code&state=stored-state";
    window.history.replaceState(
      null,
      "",
      "/auth/callback?code=authorization-code&state=stored-state",
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
    expect(screen.getByText("Hosted workspace after callback navigation")).toBeVisible();
  });
});
