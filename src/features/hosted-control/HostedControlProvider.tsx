"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import {
  discoverControlBootstrap,
  type BootstrapDiscovery,
} from "@/features/hosted-control/bootstrap";
import {
  createHostedControlFetch,
  type HostedControlFetch,
} from "@/features/hosted-control/authorized-fetch";
import {
  HostedControlApiClient,
  type HostedCapability,
} from "@/features/hosted-control/control-api";
import {
  createHostedOidcSession,
  type BrowserAccessToken,
  type HostedOidcSession,
} from "@/features/hosted-control/oidc-session";
import type { CapabilitiesResponse, ControlBootstrapDescriptor } from "@/lib/dander-contracts";

type ControlState =
  | { mode: "loading" }
  | { mode: "loopback" }
  | { mode: "error"; message: string }
  | {
      mode: "hosted";
      descriptor: ControlBootstrapDescriptor;
      apiOrigin: string;
      access: BrowserAccessToken | null;
    };

type RetainedAccess = {
  binding: string;
  access: BrowserAccessToken;
};

type CapabilityState = {
  access: BrowserAccessToken;
  capabilities: CapabilitiesResponse | null;
  error: string | null;
};

// Static callback navigation may remount this provider even though the JavaScript realm remains
// alive. Retain the token only in module memory, bound to the exact reviewed identity/API tuple.
// A full reload, new tab, configuration change, expiry, 401, or sign-out clears it.
let retainedAccess: RetainedAccess | null = null;

function accessBinding(descriptor: ControlBootstrapDescriptor): string {
  return JSON.stringify([
    descriptor.issuer,
    descriptor.public_client_id,
    descriptor.api_audience,
    descriptor.api_url,
  ]);
}

function activeRetainedAccess(descriptor: ControlBootstrapDescriptor): BrowserAccessToken | null {
  const binding = accessBinding(descriptor);
  if (retainedAccess?.binding === binding && retainedAccess.access.expiresAt > Date.now() / 1000) {
    return retainedAccess.access;
  }
  retainedAccess = null;
  return null;
}

interface HostedControlContextValue {
  mode: ControlState["mode"];
  authenticated: boolean;
  error: string | null;
  descriptor: ControlBootstrapDescriptor | null;
  capabilities: CapabilitiesResponse | null;
  capabilityError: string | null;
  hasCapability(capability: HostedCapability): boolean;
  signIn(): Promise<void>;
  completeSignIn(callbackUrl: string): Promise<void>;
  signOut(): Promise<void>;
  completeSignOut(callbackUrl: string): Promise<void>;
  request: HostedControlFetch;
}

const HostedControlContext = createContext<HostedControlContextValue | null>(null);

function messageFrom(error: unknown): string {
  return error instanceof Error ? error.message : "Hosted authentication failed safely.";
}

export function HostedControlProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ControlState>({ mode: "loading" });
  const [actionError, setActionError] = useState<string | null>(null);
  const [capabilityState, setCapabilityState] = useState<CapabilityState | null>(null);
  const sessionRef = useRef<HostedOidcSession | null>(null);

  useEffect(() => {
    let active = true;
    void discoverControlBootstrap({ browserOrigin: window.location.origin })
      .then((discovery: BootstrapDiscovery) => {
        if (!active) return;
        if (discovery.mode === "loopback") {
          retainedAccess = null;
          setState({ mode: "loopback" });
          return;
        }
        sessionRef.current = createHostedOidcSession(discovery.descriptor, window.sessionStorage);
        setState({
          ...discovery,
          mode: "hosted",
          access: activeRetainedAccess(discovery.descriptor),
        });
      })
      .catch((error: unknown) => {
        if (active) setState({ mode: "error", message: messageFrom(error) });
      });
    return () => {
      active = false;
      sessionRef.current = null;
    };
  }, []);

  const clearAuthentication = useCallback(async () => {
    retainedAccess = null;
    await sessionRef.current?.clear();
    setState((current) => (current.mode === "hosted" ? { ...current, access: null } : current));
  }, []);

  useEffect(() => {
    if (state.mode !== "hosted" || !state.access) return;
    const remainingMilliseconds = state.access.expiresAt * 1000 - Date.now();
    const timer = window.setTimeout(
      () => void clearAuthentication(),
      Math.max(0, Math.min(remainingMilliseconds, 2_147_000_000)),
    );
    return () => window.clearTimeout(timer);
  }, [clearAuthentication, state]);

  const signIn = useCallback(async () => {
    if (!sessionRef.current) throw new Error("Hosted sign-in is not configured.");
    setActionError(null);
    try {
      await sessionRef.current.beginSignIn();
    } catch (error) {
      setActionError(messageFrom(error));
      throw error;
    }
  }, []);

  const completeSignIn = useCallback(async (callbackUrl: string) => {
    if (!sessionRef.current) throw new Error("Hosted sign-in is not configured.");
    const access = await sessionRef.current.completeSignIn(callbackUrl);
    setState((current) => {
      if (current.mode !== "hosted") return current;
      retainedAccess = { binding: accessBinding(current.descriptor), access };
      return { ...current, access };
    });
    setActionError(null);
  }, []);

  const signOut = useCallback(async () => {
    if (!sessionRef.current) throw new Error("Hosted sign-out is not configured.");
    retainedAccess = null;
    setState((current) => (current.mode === "hosted" ? { ...current, access: null } : current));
    setActionError(null);
    try {
      await sessionRef.current.beginSignOut();
    } catch (error) {
      setActionError(messageFrom(error));
      throw error;
    }
  }, []);

  const completeSignOut = useCallback(async (callbackUrl: string) => {
    if (!sessionRef.current) throw new Error("Hosted sign-out is not configured.");
    await sessionRef.current.completeSignOut(callbackUrl);
    retainedAccess = null;
    setActionError(null);
    setState((current) => (current.mode === "hosted" ? { ...current, access: null } : current));
  }, []);

  const request = useCallback<HostedControlFetch>(
    async (target, init) => {
      if (state.mode !== "hosted") {
        throw new Error("Hosted Control API requests are unavailable in loopback/offline mode.");
      }
      const hostedFetch = createHostedControlFetch({
        apiOrigin: state.apiOrigin,
        getAccessToken: () => state.access,
        onUnauthorized: clearAuthentication,
      });
      return hostedFetch(target, init);
    },
    [clearAuthentication, state],
  );

  const hostedAccess = state.mode === "hosted" ? state.access : null;

  useEffect(() => {
    if (state.mode !== "hosted" || hostedAccess === null) return;
    let active = true;
    void new HostedControlApiClient(request)
      .capabilities()
      .then((result) => {
        if (active) {
          setCapabilityState({ access: hostedAccess, capabilities: result, error: null });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setCapabilityState({
            access: hostedAccess,
            capabilities: null,
            error: messageFrom(error),
          });
        }
      });
    return () => {
      active = false;
    };
  }, [hostedAccess, request, state.mode]);

  const visibleCapabilityState =
    hostedAccess !== null && capabilityState?.access === hostedAccess ? capabilityState : null;
  const capabilities = visibleCapabilityState?.capabilities ?? null;
  const capabilityError = visibleCapabilityState?.error ?? null;

  const value: HostedControlContextValue = {
    mode: state.mode,
    authenticated: state.mode === "hosted" && state.access !== null,
    error: state.mode === "error" ? state.message : actionError,
    descriptor: state.mode === "hosted" ? state.descriptor : null,
    capabilities,
    capabilityError,
    hasCapability: (capability) => capabilities?.operations.includes(capability) ?? false,
    signIn,
    completeSignIn,
    signOut,
    completeSignOut,
    request,
  };

  return <HostedControlContext.Provider value={value}>{children}</HostedControlContext.Provider>;
}

export function useHostedControl(): HostedControlContextValue {
  const value = useContext(HostedControlContext);
  if (!value) throw new Error("useHostedControl must be used inside HostedControlProvider.");
  return value;
}

export function HostedControlStatus() {
  const control = useHostedControl();
  if (control.mode === "loading") {
    return <span className="text-xs text-muted-foreground">Checking deployment…</span>;
  }
  if (control.mode === "loopback") {
    return <span className="text-xs text-muted-foreground">Loopback/offline mode</span>;
  }
  if (control.mode === "error") {
    return <span className="text-xs text-destructive">Hosted configuration blocked</span>;
  }
  if (!control.authenticated) {
    return (
      <Button size="sm" onClick={() => void control.signIn().catch(() => undefined)}>
        Sign in
      </Button>
    );
  }
  if (control.capabilityError) {
    return <span className="text-xs text-destructive">Hosted compatibility blocked</span>;
  }
  if (!control.capabilities) {
    return <span className="text-xs text-muted-foreground">Verifying Dander…</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Hosted session</span>
      <Button
        size="sm"
        variant="outline"
        onClick={() => void control.signOut().catch(() => undefined)}
      >
        Sign out
      </Button>
    </div>
  );
}

export function HostedControlGate({ children }: { children: ReactNode }) {
  const control = useHostedControl();
  if (control.mode === "loading") {
    return <div className="m-auto text-sm text-muted-foreground">Checking deployment…</div>;
  }
  if (control.mode === "error") {
    return (
      <div role="alert" className="m-auto max-w-lg p-6 text-sm">
        <h2 className="font-semibold">Hosted control is safely blocked</h2>
        <p className="mt-2 text-muted-foreground">{control.error}</p>
      </div>
    );
  }
  if (control.mode === "hosted" && !control.authenticated) {
    return (
      <div className="m-auto max-w-lg p-6 text-sm">
        <h2 className="font-semibold">Sign in to hosted Dander</h2>
        <p className="mt-2 text-muted-foreground">
          This deployment uses an external identity provider. Druff never stores your access token
          on disk.
        </p>
        {control.error ? (
          <p role="alert" className="mt-2 text-destructive">
            {control.error}
          </p>
        ) : null}
        <Button className="mt-4" onClick={() => void control.signIn().catch(() => undefined)}>
          Sign in
        </Button>
      </div>
    );
  }
  if (control.mode === "hosted" && control.capabilityError) {
    return (
      <div role="alert" className="m-auto max-w-lg p-6 text-sm">
        <h2 className="font-semibold">Hosted compatibility is safely blocked</h2>
        <p className="mt-2 text-muted-foreground">{control.capabilityError}</p>
      </div>
    );
  }
  if (control.mode === "hosted" && !control.capabilities) {
    return <div className="m-auto text-sm text-muted-foreground">Verifying Dander…</div>;
  }
  if (control.mode === "hosted" && !control.hasCapability("graph.read")) {
    return (
      <div role="alert" className="m-auto max-w-lg p-6 text-sm">
        <h2 className="font-semibold">Graph access is unavailable</h2>
        <p className="mt-2 text-muted-foreground">
          This hosted identity was not granted Dander&apos;s graph.read capability.
        </p>
      </div>
    );
  }
  return children;
}
