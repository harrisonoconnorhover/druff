"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HostedControlApiClient,
  HostedControlOperationError,
  type HostedCapability,
} from "@/features/hosted-control/control-api";
import {
  attributeRemoteValidationIssues,
  type RemoteValidationIssue,
  type ViolationIndex,
} from "@/features/pipeline-canvas/validation/attributeViolations";
import type {
  CapabilitiesResponse,
  DeploymentPreviewResponse,
  GraphValidationResponse,
} from "@/lib/dander-contracts";
import { useGraphStore } from "@/lib/graph-store";
import { canvasToGraph } from "@/lib/pipeline-graph";
import type { GraphAddress } from "@/lib/persistence/graph-persistence";

type PendingOperation = "validate" | "preview" | null;

type OperationIdentity = {
  address: GraphAddress;
  revision: string;
  contentSha256: string;
  graphName: string;
  canvasSemantic: string;
};

type OperationView = {
  pending: PendingOperation;
  error: string | null;
  conflict: boolean;
  validation: GraphValidationResponse | null;
  preview: DeploymentPreviewResponse | null;
  remoteViolations: ViolationIndex;
  generalIssues: RemoteValidationIssue[];
};

type StoredOperationView = {
  identityKey: string;
  view: OperationView;
};

export type HostedValidationPreviewControls = OperationView & {
  canValidate: boolean;
  canPreview: boolean;
  validate(): Promise<void>;
  previewDeployment(): Promise<void>;
};

export type HostedValidationPreviewClient = Pick<HostedControlApiClient, "validate" | "preview">;

const EMPTY_INDEX: ViolationIndex = { byNodeId: {}, byEdgeId: {} };
const EMPTY_VIEW: OperationView = {
  pending: null,
  error: null,
  conflict: false,
  validation: null,
  preview: null,
  remoteViolations: EMPTY_INDEX,
  generalIssues: [],
};

export function useHostedValidationPreview({
  client,
  capabilities,
  address,
  revision,
  contentSha256,
  graphIsClean,
}: {
  client: HostedValidationPreviewClient | null;
  capabilities: CapabilitiesResponse | null;
  address: GraphAddress | null;
  revision: string | null;
  contentSha256: string | null;
  graphIsClean: boolean;
}): HostedValidationPreviewControls {
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const graphName = useGraphStore((state) => state.graphName);
  const graphTrigger = useGraphStore((state) => state.graphTrigger);
  const canvasSemantic = JSON.stringify(canvasToGraph(nodes, edges, graphName, graphTrigger));
  const identity = useMemo<OperationIdentity | null>(
    () =>
      address && revision && contentSha256 && graphIsClean
        ? { address, revision, contentSha256, graphName, canvasSemantic }
        : null,
    [address, canvasSemantic, contentSha256, graphIsClean, graphName, revision],
  );
  const identityKey = identity
    ? JSON.stringify([
        identity.address.project,
        identity.address.graph,
        identity.revision,
        identity.contentSha256,
        identity.graphName,
        identity.canvasSemantic,
      ])
    : "detached-or-dirty";
  const activeIdentityKeyRef = useRef(identityKey);
  const [stored, setStored] = useState<StoredOperationView>({
    identityKey,
    view: EMPTY_VIEW,
  });

  useEffect(() => {
    activeIdentityKeyRef.current = identityKey;
  }, [identityKey]);

  const view = stored.identityKey === identityKey ? stored.view : EMPTY_VIEW;

  const has = useCallback(
    (capability: HostedCapability): boolean =>
      capabilities?.operations.includes(capability) ?? false,
    [capabilities],
  );

  const validate = useCallback(async () => {
    const captured = identity;
    const capturedKey = identityKey;
    if (!client || !captured || !has("graph.validate")) {
      setStored({
        identityKey: capturedKey,
        view: {
          ...EMPTY_VIEW,
          error: "Save a hosted graph with graph.validate access before validating it.",
        },
      });
      return;
    }
    setStored((current) => ({
      identityKey: capturedKey,
      view: {
        ...(current.identityKey === capturedKey ? current.view : EMPTY_VIEW),
        pending: "validate",
        error: null,
        conflict: false,
      },
    }));
    try {
      const result = await client.validate(captured.address, captured.revision);
      if (!isCurrentIdentity(activeIdentityKeyRef.current, capturedKey, captured)) return;
      if (
        result.content_sha256 !== captured.contentSha256 ||
        result.graph_name !== captured.graphName
      ) {
        throw new Error(
          "Dander returned validation for a different graph revision. Reload before retrying.",
        );
      }
      const state = useGraphStore.getState();
      const attributed = attributeRemoteValidationIssues(
        result.issues ?? [],
        state.nodes,
        state.edges,
      );
      setStored((current) => ({
        identityKey: capturedKey,
        view: {
          ...(current.identityKey === capturedKey ? current.view : EMPTY_VIEW),
          pending: null,
          validation: result,
          remoteViolations: attributed.index,
          generalIssues: attributed.general,
        },
      }));
    } catch (cause) {
      if (!isCurrentIdentity(activeIdentityKeyRef.current, capturedKey, captured)) return;
      const failure = operationFailure(cause);
      setStored((current) => ({
        identityKey: capturedKey,
        view: {
          ...(current.identityKey === capturedKey ? current.view : EMPTY_VIEW),
          pending: null,
          error: failure.message,
          conflict: failure.conflict,
          validation: null,
          remoteViolations: EMPTY_INDEX,
          generalIssues: [],
        },
      }));
    }
  }, [client, has, identity, identityKey]);

  const previewDeployment = useCallback(async () => {
    const captured = identity;
    const capturedKey = identityKey;
    if (!client || !captured || !has("deployment.preview")) {
      setStored({
        identityKey: capturedKey,
        view: {
          ...EMPTY_VIEW,
          error: "Save a hosted graph with deployment.preview access before requesting a preview.",
        },
      });
      return;
    }
    setStored((current) => ({
      identityKey: capturedKey,
      view: {
        ...(current.identityKey === capturedKey ? current.view : EMPTY_VIEW),
        pending: "preview",
        error: null,
        conflict: false,
      },
    }));
    try {
      const result = await client.preview(captured.address, captured.revision);
      if (!isCurrentIdentity(activeIdentityKeyRef.current, capturedKey, captured)) return;
      // The DTO's revision is an opaque preview field, not the public quoted HTTP ETag. Identity
      // remains bound solely by the exact address/ETag/content SHA captured above.
      setStored((current) => ({
        identityKey: capturedKey,
        view: {
          ...(current.identityKey === capturedKey ? current.view : EMPTY_VIEW),
          pending: null,
          preview: result,
        },
      }));
    } catch (cause) {
      if (!isCurrentIdentity(activeIdentityKeyRef.current, capturedKey, captured)) return;
      const failure = operationFailure(cause);
      setStored((current) => ({
        identityKey: capturedKey,
        view: {
          ...(current.identityKey === capturedKey ? current.view : EMPTY_VIEW),
          pending: null,
          error: failure.message,
          conflict: failure.conflict,
          preview: null,
        },
      }));
    }
  }, [client, has, identity, identityKey]);

  return {
    ...view,
    canValidate: identity !== null && view.pending === null && has("graph.validate"),
    canPreview: identity !== null && view.pending === null && has("deployment.preview"),
    validate,
    previewDeployment,
  };
}

function currentCanvasSemantic(): string {
  const state = useGraphStore.getState();
  return JSON.stringify(
    canvasToGraph(state.nodes, state.edges, state.graphName, state.graphTrigger),
  );
}

function isCurrentIdentity(
  activeIdentityKey: string,
  capturedKey: string,
  captured: OperationIdentity,
): boolean {
  return activeIdentityKey === capturedKey && currentCanvasSemantic() === captured.canvasSemantic;
}

function operationFailure(cause: unknown): { message: string; conflict: boolean } {
  const conflict = cause instanceof HostedControlOperationError && cause.conflict;
  if (conflict) {
    return { message: `${cause.message} Reload the hosted graph before retrying.`, conflict };
  }
  return {
    message: cause instanceof Error ? cause.message : "Hosted Dander operation failed safely.",
    conflict,
  };
}
