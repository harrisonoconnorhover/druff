import type { OperationDescriptor } from "@/features/pipeline-operations/catalog";
import { OperationCatalogResponseSchema } from "@/lib/dander-contracts";

let operationCatalogSnapshot: OperationDescriptor[] = [];
const listeners = new Set<() => void>();

export function setOperationCatalog(operations: OperationDescriptor[]): void {
  OperationCatalogResponseSchema.parse({ operations });
  operationCatalogSnapshot = structuredClone(operations);
  for (const listener of listeners) listener();
}

export function clearOperationCatalog(): void {
  operationCatalogSnapshot = [];
  for (const listener of listeners) listener();
}

export function subscribeOperationCatalog(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOperationCatalogSnapshot(): OperationDescriptor[] {
  return operationCatalogSnapshot;
}
