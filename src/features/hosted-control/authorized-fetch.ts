import type { BrowserAccessToken } from "@/features/hosted-control/oidc-session";

export class HostedControlRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HostedControlRequestError";
  }
}

export type HostedControlFetch = (target: string | URL, init?: RequestInit) => Promise<Response>;

export function createHostedControlFetch({
  apiOrigin,
  getAccessToken,
  onUnauthorized,
  fetchImpl = fetch,
}: {
  apiOrigin: string;
  getAccessToken: () => BrowserAccessToken | null;
  onUnauthorized?: () => void | Promise<void>;
  fetchImpl?: typeof fetch;
}): HostedControlFetch {
  const fixedOrigin = new URL(apiOrigin).origin;

  return async (target, init = {}) => {
    const access = getAccessToken();
    if (!access || access.expiresAt <= Date.now() / 1000) {
      await onUnauthorized?.();
      throw new HostedControlRequestError("Sign in again before contacting hosted Dander.");
    }

    const url = new URL(target.toString(), fixedOrigin);
    if (url.origin !== fixedOrigin) {
      throw new HostedControlRequestError(
        "Druff refused to send a hosted access token outside the configured Control API origin.",
      );
    }
    if (url.username !== "" || url.password !== "") {
      throw new HostedControlRequestError("Control API requests cannot contain URL credentials.");
    }
    if (init.credentials !== undefined && init.credentials !== "omit") {
      throw new HostedControlRequestError(
        "Hosted Control API requests cannot send browser credentials.",
      );
    }
    if (init.redirect !== undefined && init.redirect !== "error") {
      throw new HostedControlRequestError("Hosted Control API requests cannot follow redirects.");
    }

    const headers = new Headers(init.headers);
    if (headers.has("Authorization")) {
      throw new HostedControlRequestError(
        "Callers cannot override the hosted Authorization header.",
      );
    }
    headers.set("Authorization", `Bearer ${access.value}`);

    const response = await fetchImpl(url, {
      ...init,
      headers,
      credentials: "omit",
      redirect: "error",
    });
    if (response.status === 401) await onUnauthorized?.();
    return response;
  };
}
