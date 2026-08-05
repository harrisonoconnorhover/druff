/**
 * Chrome's Local Network Access API annotates browser requests to Dander's loopback service.
 * The field is shipping in browsers before TypeScript's DOM declarations expose it.
 */
export type LocalNetworkRequestInit = RequestInit & {
  targetAddressSpace: "local";
};

export function localNetworkRequest(init: RequestInit): LocalNetworkRequestInit {
  return { ...init, targetAddressSpace: "local" };
}
