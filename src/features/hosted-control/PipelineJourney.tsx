"use client";

import { Button } from "@/components/ui/button";
import { RemoteGraphDialog } from "@/features/graph-io/RemoteGraphDialog";
import type { GraphPersistenceControls } from "@/features/graph-io/useGraphPersistence";
import type { HostedControlApiClient } from "@/features/hosted-control/control-api";
import { DateRepairPanel } from "@/features/hosted-control/DateRepairPanel";
import { GraphChangeReview } from "@/features/hosted-control/GraphChangeReview";
import { HostedRunControlsBar } from "@/features/hosted-control/HostedRunControlsBar";
import { HostedValidationPreviewBar } from "@/features/hosted-control/HostedValidationPreviewBar";
import { RunOutcome } from "@/features/hosted-control/RunOutcome";
import { useGraphChangePreview } from "@/features/hosted-control/useGraphChangePreview";
import type { HostedRunControls } from "@/features/hosted-control/useHostedRunControls";
import type { HostedValidationPreviewControls } from "@/features/hosted-control/useHostedValidationPreview";
import type { CapabilitiesResponse } from "@/lib/dander-contracts";
import { useGraphStore } from "@/lib/graph-store";

/** One primary action moves an authenticated graph from configuration to a reviewed saved run. */
export function PipelineJourney({
  client,
  persistence,
  capabilities,
  runs,
  operations,
}: {
  client: HostedControlApiClient;
  persistence: GraphPersistenceControls;
  capabilities: CapabilitiesResponse;
  runs: HostedRunControls;
  operations: HostedValidationPreviewControls;
}): React.JSX.Element {
  const review = useGraphChangePreview({ client, persistence, capabilities });
  const nodes = useGraphStore((state) => state.nodes);
  const onNodesChange = useGraphStore((state) => state.onNodesChange);
  const has = (operation: CapabilitiesResponse["operations"][number]): boolean =>
    capabilities.operations.includes(operation);
  const active =
    runs.run && ["queued", "running", "retrying", "canceling"].includes(runs.run.state);
  const inputs = nodes.filter((node) => node.data.type === "source");
  const outputs = nodes.filter((node) => node.data.type === "target");
  function selectNode(id: string): void {
    onNodesChange(nodes.map((node) => ({ id: node.id, type: "select", selected: node.id === id })));
  }
  const selectedRunGraph =
    runs.origin?.address.project === persistence.address?.project &&
    runs.origin?.address.graph === persistence.address?.graph;
  const step = !persistence.attached
    ? 0
    : !review.preview
      ? 1
      : !review.reviewedSaved
        ? 2
        : !runs.run
          ? 3
          : 4;
  return (
    <section
      aria-label="Pipeline journey"
      className="max-h-[55vh] space-y-3 overflow-auto border-b bg-muted/20 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            Connected to Dander
            {persistence.address
              ? ` · ${persistence.address.project} / ${persistence.address.graph}`
              : ""}
          </p>
          <h2 className="text-base font-semibold">
            {!persistence.attached
              ? "Choose a pipeline to get started"
              : active
                ? `${runs.origin?.address.graph ?? "Your pipeline"} is running`
                : "Review and run your pipeline"}
          </h2>
          <ol className="mt-1 flex flex-wrap gap-3 text-xs" aria-label="Pipeline steps">
            {["Choose", "Configure", "Review", "Run", "Results"].map((label, index) => (
              <li
                key={label}
                aria-current={index === step ? "step" : undefined}
                className={index === step ? "font-semibold" : "text-muted-foreground"}
              >
                {index + 1}. {label}
              </li>
            ))}
          </ol>
        </div>
        {!persistence.attached ? (
          <RemoteGraphDialog persistence={persistence} canCreate={has("graph.edit")} />
        ) : active ? (
          <Button
            size="sm"
            variant="outline"
            disabled={!runs.canCancel}
            onClick={() => void runs.cancel()}
          >
            Cancel run
          </Button>
        ) : review.canSave ? (
          <Button size="sm" onClick={() => void review.saveReviewed()}>
            Save reviewed changes
          </Button>
        ) : review.reviewedSaved ? (
          <Button
            size="sm"
            disabled={!runs.canStart}
            onClick={() => {
              if (review.isReviewedNow()) void runs.start();
            }}
          >
            Run reviewed graph
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={!review.canPreview}
            onClick={() => void review.previewChanges()}
          >
            {review.pending ? "Comparing changes…" : "Preview changes"}
          </Button>
        )}
      </div>
      {!persistence.attached ? (
        <p className="text-sm text-muted-foreground">
          Open a saved graph, or configure a local draft on the canvas and create it in your
          project. Source connections and execution environments are configured in Dander.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span>Configure:</span>
            {[...inputs, ...outputs].map((node) => (
              <Button key={node.id} size="sm" variant="outline" onClick={() => selectNode(node.id)}>
                {node.data.name}
              </Button>
            ))}
            {!inputs.length || !outputs.length ? (
              <span className="text-muted-foreground">
                Add a source and a write output from the canvas palette.
              </span>
            ) : null}
          </div>
          {!review.preview ? (
            <p className="text-sm text-muted-foreground">
              Set up sources, transformations and outputs on the canvas, then preview what your
              changes would write.
            </p>
          ) : (
            <GraphChangeReview preview={review.preview} />
          )}
          {review.reviewedSaved ? (
            <p className="text-sm">
              The saved graph matches this review. Running writes every configured output.
            </p>
          ) : null}
          {!has("graph.change-preview") ? (
            <p className="text-sm">Change previews are unavailable for this connection or role.</p>
          ) : null}
          {review.reviewedSaved && !has("run.start") ? (
            <p className="text-sm">An operator can run this reviewed graph.</p>
          ) : null}
          {review.preview ? (
            <Button
              size="sm"
              variant="ghost"
              disabled={!review.canPreview}
              onClick={() => void review.previewChanges()}
            >
              Refresh change preview
            </Button>
          ) : null}
        </>
      )}
      {review.error || persistence.error || runs.error ? (
        <p role="alert" className="text-sm text-destructive">
          {review.error ?? persistence.error ?? runs.error}
        </p>
      ) : null}
      {review.conflict || persistence.status === "conflict" || runs.conflict ? (
        <Button size="sm" variant="outline" onClick={() => void persistence.reload()}>
          Reload saved graph
        </Button>
      ) : null}
      <RunOutcome
        client={client}
        controls={runs}
        canExplain={has("run.explain")}
        onInspectOutputs={
          selectedRunGraph && outputs[0] ? () => selectNode(outputs[0].id) : undefined
        }
      />
      {persistence.attached ? (
        <DateRepairPanel
          client={client}
          persistence={persistence}
          controls={runs}
          canPreview={has("graph.repair-preview")}
        />
      ) : null}
      <details className="rounded-md border bg-background text-sm">
        <summary className="cursor-pointer p-3">
          Advanced validation, deployment and run controls
        </summary>
        <HostedValidationPreviewBar
          capabilities={capabilities}
          operations={operations}
          onReload={persistence.reload}
        />
        <HostedRunControlsBar
          capabilities={capabilities}
          controls={runs}
          onReload={persistence.reload}
          advanced
        />
      </details>
    </section>
  );
}
