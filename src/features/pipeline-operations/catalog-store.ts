import {
  OperationDescriptorSchema,
  type OperationDescriptor,
} from "@/features/pipeline-operations/catalog";

let operationCatalogSnapshot: OperationDescriptor[] = [];
const listeners = new Set<() => void>();

export function setOperationCatalog(operations: OperationDescriptor[]): void {
  operationCatalogSnapshot = operations.map((operation) =>
    OperationDescriptorSchema.parse(operation),
  );
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
