import { GREENHOUSE_CONNECTOR } from "@/features/connector-library/descriptors/greenhouse";
import type { ConnectorDescriptor } from "@/features/connector-library/descriptors/types";

/**
 * The one place the palette (DRUFF-2), node-factory, and graph converter (DRUFF-4) read pre-made
 * connectors from — adding connector #2..N is a data edit (a new descriptor file + one entry here),
 * never a new component, per this ticket's Design.
 */
export const CONNECTOR_REGISTRY: Record<string, ConnectorDescriptor> = {
  [GREENHOUSE_CONNECTOR.id]: GREENHOUSE_CONNECTOR,
};

/** Looks up a connector descriptor by Druff's internal/palette `id` (e.g. `"greenhouse"`). */
export function getConnector(id: string): ConnectorDescriptor | undefined {
  return CONNECTOR_REGISTRY[id];
}

/**
 * Looks up a connector descriptor by Dander's on-disk node `type` token — the inverse direction
 * used when loading a graph (`canvas-convert.ts`'s `graphToCanvas`) to recognize a node as a known
 * connector.
 */
export function getConnectorByDanderType(danderType: string): ConnectorDescriptor | undefined {
  return Object.values(CONNECTOR_REGISTRY).find((connector) => connector.danderType === danderType);
}

/** All registered connectors, in registration order — what the palette lists as pre-made entries. */
export function listConnectors(): ConnectorDescriptor[] {
  return Object.values(CONNECTOR_REGISTRY);
}
