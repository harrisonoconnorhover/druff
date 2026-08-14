import { assertCompatibleControlBootstrap } from "@/lib/dander-contracts";
import type { ControlBootstrapDescriptor } from "@/lib/dander-contracts";

export const CONTROL_BOOTSTRAP_PATH = "/bootstrap.json" as const;
export const SIGNIN_CALLBACK_PATH = "/auth/callback" as const;
export const SIGNOUT_CALLBACK_PATH = "/signed-out" as const;

export class HostedControlConfigurationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "HostedControlConfigurationError";
  }
}

export type BootstrapDiscovery =
  | { mode: "loopback" }
  | { mode: "hosted"; descriptor: ControlBootstrapDescriptor; apiOrigin: string };

function parseHttpsUrl(value: string, label: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch (error) {
    throw new HostedControlConfigurationError(`${label} must be an absolute HTTPS URL.`, {
      cause: error,
    });
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.search !== "" ||
    parsed.hash !== ""
  ) {
    throw new HostedControlConfigurationError(
      `${label} must be a credential-free HTTPS URL without a query or fragment.`,
    );
  }
  return parsed;
}

export function verifyControlBootstrap(
  input: unknown,
  browserOrigin: string,
): { descriptor: ControlBootstrapDescriptor; apiOrigin: string } {
  let descriptor: ControlBootstrapDescriptor;
  try {
    descriptor = assertCompatibleControlBootstrap(input);
  } catch (error) {
    throw new HostedControlConfigurationError(
      "The hosted-control descriptor does not match this Druff build.",
      { cause: error },
    );
  }

  const currentOrigin = new URL(browserOrigin).origin;
  const api = parseHttpsUrl(descriptor.api_url, "Control API URL");
  parseHttpsUrl(descriptor.issuer, "OIDC issuer");
  const redirect = parseHttpsUrl(descriptor.redirect_uri, "OIDC redirect URI");
  const logout = parseHttpsUrl(descriptor.logout_uri, "OIDC logout URI");
  const expectedRedirect = new URL(SIGNIN_CALLBACK_PATH, currentOrigin).href;
  const expectedLogout = new URL(SIGNOUT_CALLBACK_PATH, currentOrigin).href;

  if (redirect.href !== expectedRedirect) {
    throw new HostedControlConfigurationError(
      `OIDC redirect URI must exactly match Druff's ${SIGNIN_CALLBACK_PATH} route.`,
    );
  }
  if (logout.href !== expectedLogout) {
    throw new HostedControlConfigurationError(
      `OIDC logout URI must exactly match Druff's ${SIGNOUT_CALLBACK_PATH} route.`,
    );
  }

  return { descriptor, apiOrigin: api.origin };
}

export async function discoverControlBootstrap({
  browserOrigin,
  fetchImpl = fetch,
}: {
  browserOrigin: string;
  fetchImpl?: typeof fetch;
}): Promise<BootstrapDiscovery> {
  const bootstrapUrl = new URL(CONTROL_BOOTSTRAP_PATH, browserOrigin);
  let response: Response;
  try {
    response = await fetchImpl(bootstrapUrl, {
      method: "GET",
      credentials: "omit",
      redirect: "error",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    throw new HostedControlConfigurationError(
      "Druff could not load the hosted-control descriptor. No hosted request was attempted.",
      { cause: error },
    );
  }

  if (response.status === 404) return { mode: "loopback" };
  if (!response.ok) {
    throw new HostedControlConfigurationError(
      `Hosted-control descriptor request failed with HTTP ${response.status}.`,
    );
  }

  let input: unknown;
  try {
    input = await response.json();
  } catch (error) {
    throw new HostedControlConfigurationError("Hosted-control descriptor is not valid JSON.", {
      cause: error,
    });
  }
  const verified = verifyControlBootstrap(input, browserOrigin);
  return { mode: "hosted", ...verified };
}
