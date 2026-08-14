import {
  InMemoryWebStorage,
  UserManager,
  WebStorageStateStore,
  type User,
  type UserManagerSettings,
} from "oidc-client-ts";
import type { ControlBootstrapDescriptor } from "@/lib/dander-contracts";

const TRANSACTION_STORAGE_PREFIX = "druff.oidc.transaction.";
const USER_STORAGE_PREFIX = "druff.oidc.user.";
const CALLBACK_TOKEN_PARAMETERS = new Set(["access_token", "id_token", "refresh_token", "token"]);

export class HostedControlAuthenticationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "HostedControlAuthenticationError";
  }
}

export interface BrowserAccessToken {
  value: string;
  expiresAt: number;
}

export type OidcUserManager = Pick<
  UserManager,
  "signinRedirect" | "signinCallback" | "signoutRedirect" | "signoutCallback" | "removeUser"
>;

export function buildOidcSettings(
  descriptor: ControlBootstrapDescriptor,
  transactionStorage: Storage,
): UserManagerSettings {
  return {
    authority: descriptor.issuer,
    client_id: descriptor.public_client_id,
    redirect_uri: descriptor.redirect_uri,
    post_logout_redirect_uri: descriptor.logout_uri,
    response_type: "code",
    response_mode: "query",
    scope: "openid",
    resource: descriptor.api_audience,
    disablePKCE: false,
    stateStore: new WebStorageStateStore({
      prefix: TRANSACTION_STORAGE_PREFIX,
      store: transactionStorage,
    }),
    userStore: new WebStorageStateStore({
      prefix: USER_STORAGE_PREFIX,
      store: new InMemoryWebStorage(),
    }),
    automaticSilentRenew: false,
    monitorSession: false,
    loadUserInfo: false,
    revokeTokensOnSignout: false,
    fetchRequestCredentials: "omit",
  };
}

export function createOidcNonce(random = crypto): string {
  const bytes = new Uint8Array(32);
  random.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

export function assertCallbackContainsNoTokens(callbackUrl: string): void {
  const parsed = new URL(callbackUrl);
  const fragment = new URLSearchParams(parsed.hash.startsWith("#") ? parsed.hash.slice(1) : "");
  for (const name of CALLBACK_TOKEN_PARAMETERS) {
    if (parsed.searchParams.has(name) || fragment.has(name)) {
      throw new HostedControlAuthenticationError(
        "The identity provider returned a token in the browser URL. Druff accepts authorization-code callbacks only.",
      );
    }
  }
}

export function requireBrowserAccessToken(
  user: User | undefined | null,
  nowSeconds = Date.now() / 1000,
): BrowserAccessToken {
  if (!user || user.access_token.trim() === "" || /[\r\n]/.test(user.access_token)) {
    throw new HostedControlAuthenticationError(
      "The identity provider did not return a usable access token.",
    );
  }
  if (user.token_type.toLowerCase() !== "bearer") {
    throw new HostedControlAuthenticationError("Druff accepts Bearer access tokens only.");
  }
  if (typeof user.refresh_token === "string" && user.refresh_token !== "") {
    throw new HostedControlAuthenticationError(
      "The identity provider returned a browser refresh token, which this Druff build refuses to retain.",
    );
  }
  if (
    typeof user.expires_at !== "number" ||
    !Number.isFinite(user.expires_at) ||
    user.expires_at <= nowSeconds
  ) {
    throw new HostedControlAuthenticationError(
      "The access token is missing an expiry or has expired.",
    );
  }
  return { value: user.access_token, expiresAt: user.expires_at };
}

export class HostedOidcSession {
  constructor(private readonly manager: OidcUserManager) {}

  async beginSignIn(): Promise<void> {
    await this.manager.signinRedirect({ nonce: createOidcNonce() });
  }

  async completeSignIn(callbackUrl: string): Promise<BrowserAccessToken> {
    assertCallbackContainsNoTokens(callbackUrl);
    const user = await this.manager.signinCallback(callbackUrl);
    try {
      return requireBrowserAccessToken(user);
    } catch (error) {
      await this.manager.removeUser();
      throw error;
    }
  }

  async beginSignOut(): Promise<void> {
    // Clear the in-memory User before building the end-session URL so oidc-client-ts cannot put
    // an ID-token hint in that URL. The provider receives only client_id, state, and the reviewed
    // post-logout callback.
    await this.manager.removeUser();
    await this.manager.signoutRedirect({ state: {} });
  }

  async completeSignOut(callbackUrl: string): Promise<void> {
    assertCallbackContainsNoTokens(callbackUrl);
    await this.manager.signoutCallback(callbackUrl);
    await this.manager.removeUser();
  }

  async clear(): Promise<void> {
    await this.manager.removeUser();
  }
}

export function createHostedOidcSession(
  descriptor: ControlBootstrapDescriptor,
  transactionStorage: Storage,
): HostedOidcSession {
  return new HostedOidcSession(new UserManager(buildOidcSettings(descriptor, transactionStorage)));
}
