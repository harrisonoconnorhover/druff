"use client";

import { useState } from "react";
import type { GraphPersistenceControls } from "@/features/graph-io/useGraphPersistence";
import {
  HostedControlOperationError,
  type HostedControlApiClient,
} from "@/features/hosted-control/control-api";
import type { CapabilitiesResponse, GraphChangePreviewResponse } from "@/lib/dander-contracts";
import { useGraphStore } from "@/lib/graph-store";
import { canvasToGraph } from "@/lib/pipeline-graph";

type Review = {
  address: string;
  revision: string;
  candidate: string;
  preview: GraphChangePreviewResponse;
};

/** Preserve a review through its exact save; any subsequent edit requires a fresh preview. */
export function useGraphChangePreview({
  client,
  persistence,
  capabilities,
}: {
  client: Pick<HostedControlApiClient, "previewChanges">;
  persistence: GraphPersistenceControls;
  capabilities: CapabilitiesResponse;
}): {
  preview: GraphChangePreviewResponse | null;
  pending: boolean;
  error: string | null;
  conflict: boolean;
  canPreview: boolean;
  canSave: boolean;
  reviewedSaved: boolean;
  previewChanges(): Promise<void>;
  saveReviewed(): Promise<void>;
  isReviewedNow(): boolean;
} {
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const name = useGraphStore((state) => state.graphName);
  const trigger = useGraphStore((state) => state.graphTrigger);
  const candidate = JSON.stringify(canvasToGraph(nodes, edges, name, trigger));
  const address = JSON.stringify(persistence.address);
  const [review, setReview] = useState<Review | null>(null);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<{
    candidate: string;
    address: string;
    message: string;
    conflict: boolean;
  } | null>(null);
  const has = (operation: CapabilitiesResponse["operations"][number]): boolean =>
    capabilities.operations.includes(operation);
  const busy = ["loading", "saving", "deleting", "conflict"].includes(persistence.status);
  const savedMatches =
    persistence.status === "clean" &&
    review?.preview.candidate_content_sha256 === persistence.contentSha256;
  const currentReview =
    review?.address === address &&
    review.candidate === candidate &&
    (savedMatches || review.revision === persistence.revision)
      ? review
      : null;
  const currentFailure =
    failure?.address === address && failure.candidate === candidate ? failure : null;
  const canPreview = Boolean(
    persistence.address &&
    persistence.revision &&
    persistence.contentSha256 &&
    !busy &&
    !pending &&
    has("graph.change-preview"),
  );
  const canSave = Boolean(
    currentReview && persistence.status === "dirty" && !pending && has("graph.edit"),
  );

  async function previewChanges(): Promise<void> {
    if (!canPreview || !persistence.address || !persistence.revision) return;
    const captured = currentCandidate();
    setPending(true);
    setFailure(null);
    setReview(null);
    try {
      const preview = await client.previewChanges(
        persistence.address,
        persistence.revision,
        JSON.parse(captured),
      );
      if (preview.baseline_content_sha256 !== persistence.contentSha256)
        throw new HostedControlOperationError(
          "This preview belongs to a different saved graph. Reload and review again.",
          { conflict: true },
        );
      setReview({ address, revision: persistence.revision, candidate: captured, preview });
    } catch (cause) {
      setFailure({
        address,
        candidate: captured,
        message: cause instanceof Error ? cause.message : "The preview could not be loaded.",
        conflict: cause instanceof HostedControlOperationError && cause.conflict,
      });
    } finally {
      setPending(false);
    }
  }

  async function saveReviewed(): Promise<void> {
    if (!canSave || !currentReview || currentCandidate() !== currentReview.candidate) return;
    await persistence.save();
  }

  return {
    preview: currentReview?.preview ?? null,
    pending,
    error: currentFailure?.message ?? null,
    conflict: currentFailure?.conflict ?? false,
    canPreview,
    canSave,
    reviewedSaved: Boolean(currentReview && savedMatches),
    previewChanges,
    saveReviewed,
    isReviewedNow: () =>
      Boolean(currentReview && savedMatches && currentCandidate() === currentReview.candidate),
  };
}

function currentCandidate(): string {
  const state = useGraphStore.getState();
  return JSON.stringify(
    canvasToGraph(state.nodes, state.edges, state.graphName, state.graphTrigger),
  );
}
