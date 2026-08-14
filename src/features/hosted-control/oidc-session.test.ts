import { beforeEach, describe, expect, it, vi } from "vitest";
import { OidcClient, User, UserManager, type INavigator } from "oidc-client-ts";
import {
  HostedControlAuthenticationError,
  HostedOidcSession,
  assertCallbackContainsNoTokens,
  buildOidcSettings,
  createOidcNonce,
  requireBrowserAccessToken,
  type OidcUserManager,
} from "@/features/hosted-control/oidc-session";
import { hostedControlDescriptor } from "@/features/hosted-control/test-fixtures";

function user(overrides: Partial<ConstructorParameters<typeof User>[0]> = {}): User {
  return new User({
    access_token: "access-token",
    token_type: "Bearer",
    expires_at: 2_000_000_000,
    profile: {
      iss: "https://identity.example.test/tenant",
      aud: "druff-public-client",
      exp: 2_000_000_000,
      iat: 1_900_000_000,
      sub: "person-123",
    },
    ...overrides,
  });
}

function fakeManager(returnedUser: User | undefined = user()) {
  const order: string[] = [];
  const manager = {
    signinRedirect: vi.fn(async () => undefined),
    signinCallback: vi.fn(async () => returnedUser),
    signoutRedirect: vi.fn(async () => {
      order.push("redirect");
    }),
    signoutCallback: vi.fn(async () => undefined),
    removeUser: vi.fn(async () => {
      order.push("remove");
    }),
  } as unknown as OidcUserManager;
  return { manager, order };
}

describe("static OIDC session", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it("generates a real code/PKCE authorize request with state, nonce, and the API resource", async () => {
    const descriptor = hostedControlDescriptor();
    const settings = buildOidcSettings(descriptor, window.sessionStorage);
    const client = new OidcClient({
      ...settings,
      metadata: {
        issuer: descriptor.issuer,
        authorization_endpoint: `${descriptor.issuer}/authorize`,
        token_endpoint: `${descriptor.issuer}/token`,
        jwks_uri: `${descriptor.issuer}/jwks`,
      },
    });
    const nonce = createOidcNonce();
    const request = await client.createSigninRequest({ nonce });
    const url = new URL(request.url);

    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("response_mode")).toBe("fragment");
    expect(url.searchParams.get("scope")).toBe("openid");
    expect(url.searchParams.get("resource")).toBe(descriptor.api_audience);
    expect(url.searchParams.get("state")).toBeTruthy();
    expect(url.searchParams.get("nonce")).toBe(nonce);
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("code_challenge")).toBeTruthy();
    expect(url.searchParams.has("client_secret")).toBe(false);
    expect(url.searchParams.has("access_token")).toBe(false);
    expect(window.sessionStorage.length).toBe(1);
    expect(window.localStorage.length).toBe(0);

    await settings.userStore!.set("proof", user().toStorageString());
    expect(window.sessionStorage.length).toBe(1);
    expect(window.localStorage.length).toBe(0);
    expect(settings).toMatchObject({
      automaticSilentRenew: false,
      monitorSession: false,
      loadUserInfo: false,
      revokeTokensOnSignout: false,
      fetchRequestCredentials: "omit",
      disablePKCE: false,
    });
    expect(settings.client_secret).toBeUndefined();
    expect(settings.scope).not.toContain("offline_access");
  });

  it("passes a fresh nonce to every sign-in redirect", async () => {
    const { manager } = fakeManager();
    const session = new HostedOidcSession(manager);
    await session.beginSignIn();
    const argument = vi.mocked(manager.signinRedirect).mock.calls[0]![0]!;
    expect(argument.nonce).toMatch(/^[0-9a-f]{64}$/);
  });

  it("accepts only unexpired Bearer access tokens and refuses refresh tokens", () => {
    expect(requireBrowserAccessToken(user(), 1_900_000_000)).toEqual({
      value: "access-token",
      expiresAt: 2_000_000_000,
    });
    expect(() => requireBrowserAccessToken(user({ token_type: "DPoP" }))).toThrow(
      HostedControlAuthenticationError,
    );
    expect(() => requireBrowserAccessToken(user({ refresh_token: "refresh" }))).toThrow(
      "refresh token",
    );
    expect(() => requireBrowserAccessToken(user({ expires_at: 100 }), 101)).toThrow("expired");
  });

  it("rejects token-bearing callbacks before invoking the OIDC client", async () => {
    expect(() =>
      assertCallbackContainsNoTokens(
        "https://druff.example.test/auth/callback#access_token=forbidden",
      ),
    ).toThrow("authorization-code callbacks only");
    const { manager } = fakeManager();
    const session = new HostedOidcSession(manager);
    await expect(
      session.completeSignIn(
        "https://druff.example.test/auth/callback?state=state&id_token=forbidden",
      ),
    ).rejects.toThrow("authorization-code callbacks only");
    expect(manager.signinCallback).not.toHaveBeenCalled();
  });

  it("clears in-memory auth before creating a token-free state-free logout redirect", async () => {
    const { manager, order } = fakeManager();
    const session = new HostedOidcSession(manager);
    await session.beginSignOut();
    expect(order).toEqual(["remove", "redirect"]);
    expect(manager.signoutRedirect).toHaveBeenCalledWith();
  });

  it("uses a state-free end-session URL and accepts the clean fixed callback", async () => {
    const descriptor = hostedControlDescriptor();
    const settings = buildOidcSettings(descriptor, window.sessionStorage);
    let redirectUrl: string | null = null;
    const navigator: INavigator = {
      async prepare() {
        return {
          async navigate({ url }) {
            redirectUrl = url;
            return { url };
          },
          close() {},
        };
      },
      async callback() {},
    };
    const manager = new UserManager(
      {
        ...settings,
        metadata: {
          issuer: descriptor.issuer,
          authorization_endpoint: `${descriptor.issuer}/authorize`,
          token_endpoint: `${descriptor.issuer}/token`,
          jwks_uri: `${descriptor.issuer}/jwks`,
          end_session_endpoint: `${descriptor.issuer}/logout`,
        },
      },
      navigator,
    );
    await manager.storeUser(user({ id_token: "id-token-that-must-not-enter-the-url" }));
    const session = new HostedOidcSession(manager);
    await session.beginSignOut();

    expect(redirectUrl).not.toBeNull();
    const parsed = new URL(redirectUrl!);
    expect(parsed.searchParams.get("client_id")).toBe(descriptor.public_client_id);
    expect(parsed.searchParams.get("post_logout_redirect_uri")).toBe(descriptor.logout_uri);
    expect(parsed.searchParams.has("state")).toBe(false);
    expect(parsed.searchParams.has("id_token_hint")).toBe(false);
    expect(parsed.href).not.toContain("id-token-that-must-not-enter-the-url");
    await expect(session.completeSignOut(descriptor.logout_uri)).resolves.toBeUndefined();
  });
});
