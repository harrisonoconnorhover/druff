import type { GraphChangePreviewResponse } from "@/lib/dander-contracts";

/** Display Dander's write effects, including unchanged outputs that a full run still writes. */
export function GraphChangeReview({
  preview,
}: {
  preview: GraphChangePreviewResponse;
}): React.JSX.Element {
  return (
    <div
      className="space-y-3 rounded-md border bg-background p-3 text-sm"
      aria-label="Graph change review"
    >
      <p className="font-medium">
        {preview.node_changes.length} node changes · {preview.connection_changes.length} connection
        changes · {preview.affected_outputs.length} affected outputs
      </p>
      <p>
        A full run writes all {preview.run_output_ids.length} configured outputs. Saving alone does
        not change warehouse data.
      </p>
      {preview.outputs.length > 0 ? (
        <ul className="space-y-2">
          {preview.outputs.map((output) => (
            <li key={output.node_id} className="rounded border p-2">
              <strong>{output.name}</strong>
              {output.affected ? " · Changed" : " · Unchanged"}
              <p>{output.effect}</p>
              {output.after?.writer?.destination ? (
                <p className="text-xs text-muted-foreground">
                  Destination:{" "}
                  {[
                    output.after.writer.destination.project,
                    output.after.writer.destination.dataset,
                    output.after.writer.destination.table,
                  ]
                    .filter(Boolean)
                    .join(".")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p>No warehouse outputs are configured.</p>
      )}
      <p className="text-muted-foreground">
        Rows and cost: unknown. {preview.estimates?.explanation}
      </p>
      <details>
        <summary className="cursor-pointer">Change details and limits</summary>
        <ul className="mt-2 list-inside list-disc space-y-1">
          {preview.node_changes.map((node) => (
            <li key={node.node_id}>
              {node.name}: {node.change}
              {(node.changed_properties ?? []).length
                ? ` (${(node.changed_properties ?? []).join(", ")})`
                : ""}
            </li>
          ))}
          {preview.graph_properties_changed.length ? (
            <li>Graph settings: {preview.graph_properties_changed.join(", ")}</li>
          ) : null}
          {(preview.limitations ?? []).map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
