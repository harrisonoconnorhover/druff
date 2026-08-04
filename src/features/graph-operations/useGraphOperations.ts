"use client";

import { useCallback, useRef, useState } from "react";
import {
  DanderApiGraphOperations,
  type GraphDeploymentPreview,
  type GraphOperationsClient,
  type GraphOperationsStatus,
} from "@/lib/dander-operations/graph-operations";

export type GraphOperationPending = "refresh" | "validate" | "run" | "preview" | null;

export type GraphOperationControls = {
  status: GraphOperationsStatus | null;
  pending: GraphOperationPending;
  error: string | null;
  validation: "unknown" | "valid";
  deploymentPreview: GraphDeploymentPreview | null;
  canRefresh: boolean;
  canValidate: boolean;
  canRun: boolean;
  canPreviewDeployment: boolean;
  refresh: () => Promise<void>;
  validate: () => Promise<void>;
  run: () => Promise<void>;
  previewDeployment: () => Promise<void>;
};

export type UseGraphOperationsOptions = {
  revision: string | null;
  graphIsClean: boolean;
  client?: GraphOperationsClient;
};

/**
 * Coordinates the operator-bound Dander API with the currently opened graph revision. Operations
 * are impossible for detached or dirty drafts, so the UI cannot imply that unsaved edits ran.
 */
export function useGraphOperations({
  revision,
  graphIsClean,
  client,
}: UseGraphOperationsOptions): GraphOperationControls {
  const clientRef = useRef<GraphOperationsClient | null>(null);
  if (clientRef.current === null) {
    clientRef.current = client ?? new DanderApiGraphOperations();
  }

  const [status, setStatus] = useState<GraphOperationsStatus | null>(null);
  const [statusRevision, setStatusRevision] = useState<string | null>(null);
  const [pending, setPending] = useState<GraphOperationPending>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorRevision, setErrorRevision] = useState<string | null>(null);
  const [validation, setValidation] = useState<"unknown" | "valid">("unknown");
  const [validatedRevision, setValidatedRevision] = useState<string | null>(null);
  const [deploymentPreview, setDeploymentPreview] = useState<GraphDeploymentPreview | null>(null);
  const [previewRevision, setPreviewRevision] = useState<string | null>(null);

  const readStatus = useCallback(async (): Promise<void> => {
    if (revision === null) return;
    setPending("refresh");
    setError(null);
    setErrorRevision(null);
    try {
      setStatus(await clientRef.current!.status());
      setStatusRevision(revision);
    } catch (cause) {
      setError(describeError(cause));
      setErrorRevision(revision);
    } finally {
      setPending(null);
    }
  }, [revision]);

  const validate = useCallback(async (): Promise<void> => {
    if (revision === null || !graphIsClean) {
      setError("Save the opened Dander graph before validating it.");
      setErrorRevision(revision);
      return;
    }
    setPending("validate");
    setError(null);
    try {
      await clientRef.current!.validate(revision);
      setValidation("valid");
      setValidatedRevision(revision);
    } catch (cause) {
      setValidation("unknown");
      setValidatedRevision(null);
      setError(describeError(cause));
      setErrorRevision(revision);
    } finally {
      setPending(null);
    }
  }, [graphIsClean, revision]);

  const run = useCallback(async (): Promise<void> => {
    if (revision === null || !graphIsClean || status?.enabled !== true) {
      setError("Open and save a graph from an operations-enabled Dander service before running.");
      setErrorRevision(revision);
      return;
    }
    if (isActive(status)) {
      setError("The deployed job already has an active execution.");
      setErrorRevision(revision);
      return;
    }
    setPending("run");
    setError(null);
    try {
      const result = await clientRef.current!.run(revision);
      setValidation("valid");
      setValidatedRevision(revision);
      setStatus({ ...status, execution: result.execution });
      setStatusRevision(revision);
    } catch (cause) {
      setError(describeError(cause));
      setErrorRevision(revision);
    } finally {
      setPending(null);
    }
  }, [graphIsClean, revision, status]);

  const previewDeployment = useCallback(async (): Promise<void> => {
    if (
      revision === null ||
      !graphIsClean ||
      status?.enabled !== true ||
      status.deployment_preview_enabled !== true
    ) {
      setError("Open and save a graph from a deployment-preview-enabled Dander service first.");
      setErrorRevision(revision);
      return;
    }
    setPending("preview");
    setError(null);
    setDeploymentPreview(null);
    setPreviewRevision(null);
    try {
      const result = await clientRef.current!.previewDeployment(revision);
      setDeploymentPreview(result);
      setPreviewRevision(revision);
      setValidation("valid");
      setValidatedRevision(revision);
    } catch (cause) {
      setError(describeError(cause));
      setErrorRevision(revision);
    } finally {
      setPending(null);
    }
  }, [graphIsClean, revision, status]);

  const attached = revision !== null;
  const visibleStatus = attached && statusRevision === revision ? status : null;
  const visiblePending = attached ? pending : null;
  const available = visibleStatus?.enabled === true;
  const idle = visiblePending === null;
  return {
    status: visibleStatus,
    pending: visiblePending,
    error: attached && errorRevision === revision ? error : null,
    validation: attached && validatedRevision === revision ? validation : "unknown",
    deploymentPreview:
      attached && graphIsClean && previewRevision === revision ? deploymentPreview : null,
    canRefresh: attached && idle,
    canValidate: attached && graphIsClean && available && idle,
    canRun: attached && graphIsClean && available && idle && !isActive(visibleStatus),
    canPreviewDeployment:
      attached &&
      graphIsClean &&
      available &&
      visibleStatus.deployment_preview_enabled === true &&
      idle,
    refresh: readStatus,
    validate,
    run,
    previewDeployment,
  };
}

function isActive(status: GraphOperationsStatus | null): boolean {
  return (
    status?.enabled === true &&
    (status.execution?.state === "starting" || status.execution?.state === "running")
  );
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : "Dander graph operation failed.";
}
