import { GREENHOUSE_CONNECTOR } from "@/features/connector-library/descriptors/greenhouse";
import {
  ConnectorDescriptorSchema,
  type ConnectorDescriptor,
} from "@/features/connector-library/descriptors/types";

/**
 * The one place the palette (DRUFF-2), node-factory, and graph converter (DRUFF-4) read pre-made
 * connectors from — adding connector #2..N is a data edit (a new descriptor file + one entry here),
 * never a new component, per this ticket's Design.
 */
export const CONNECTOR_REGISTRY: Record<string, ConnectorDescriptor> = {
  [GREENHOUSE_CONNECTOR.id]: GREENHOUSE_CONNECTOR,
};

let discoveredConnectors: ConnectorDescriptor[] = [];
let connectorSnapshot: ConnectorDescriptor[] = Object.values(CONNECTOR_REGISTRY);
const listeners = new Set<() => void>();

function rebuildSnapshot(): void {
  const merged = new Map(
    Object.values(CONNECTOR_REGISTRY).map((connector) => [connector.id, connector]),
  );
  for (const connector of discoveredConnectors) merged.set(connector.id, connector);
  connectorSnapshot = Array.from(merged.values());
}

/** Replace the server-discovered connector set while retaining static offline fallbacks. */
export function setDiscoveredConnectors(connectors: ConnectorDescriptor[]): void {
  discoveredConnectors = connectors.map((connector) => ConnectorDescriptorSchema.parse(connector));
  rebuildSnapshot();
  for (const listener of listeners) listener();
}

/** Clear server-owned entries when discovery is unavailable or a different server is opened. */
export function clearDiscoveredConnectors(): void {
  discoveredConnectors = [];
  rebuildSnapshot();
  for (const listener of listeners) listener();
}

/** React external-store seam used by the palette without making the registry React-specific. */
export function subscribeConnectors(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getConnectorSnapshot(): ConnectorDescriptor[] {
  return connectorSnapshot;
}

/** Looks up a connector descriptor by Druff's internal/palette `id` (e.g. `"greenhouse"`). */
export function getConnector(id: string): ConnectorDescriptor | undefined {
  return connectorSnapshot.find((connector) => connector.id === id);
}

/**
 * Looks up a connector descriptor by Dander's on-disk node `type` token — the inverse direction
 * used when loading a graph (`canvas-convert.ts`'s `graphToCanvas`) to recognize a node as a known
 * connector.
 */
export function getConnectorForDanderNode(
  danderType: string,
  config: Record<string, unknown>,
): ConnectorDescriptor | undefined {
  const connectorName = config.connector;
  if (typeof connectorName !== "string") return undefined;
  return connectorSnapshot.find(
    (connector) =>
      connector.danderType === danderType && connector.danderConnector === connectorName,
  );
}

/** All registered connectors, in registration order — what the palette lists as pre-made entries. */
export function listConnectors(): ConnectorDescriptor[] {
  return connectorSnapshot;
}
