"use client";

import { AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatViolationMessage } from "@/features/pipeline-canvas/validation/formatViolationMessage";
import type { CanvasValidationIssue } from "@/features/pipeline-canvas/validation/attributeViolations";

/**
 * The shared inline validation badge (DRUFF-16): renders nothing for a clean node/edge, otherwise
 * a small destructive-accent count badge whose tooltip lists every violation's message on hover
 * (AC3 — "a node/edge with multiple violations surfaces all of them ... messages available on
 * hover"). This is the *only* validation surface on the canvas — there is deliberately no separate
 * error log/list/panel anywhere (AC2, "Validation surface" module in
 * `steering/00-project-overview.md`).
 */
export function ViolationMarker({ violations }: { violations: CanvasValidationIssue[] }) {
  if (violations.length === 0) {
    return null;
  }

  const label = `${violations.length} validation ${violations.length === 1 ? "issue" : "issues"}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="button"
          tabIndex={0}
          aria-label={label}
          className="inline-flex items-center gap-1 rounded-full border border-destructive bg-destructive/10 px-1.5 py-0.5 text-xs font-medium text-destructive"
        >
          <AlertTriangle className="size-3" aria-hidden="true" />
          {violations.length}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <ul className="list-disc space-y-0.5 pl-3">
          {violations.map((violation, index) => (
            // Violations carry no stable id of their own (DRUFF-15's structured-data output); index
            // is fine here since the list is re-derived wholesale on every graph change, never
            // reordered in place.
            <li key={index}>{formatViolationMessage(violation)}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
