"use client";

import { type ChangeEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CodeParameter } from "@/features/pipeline-canvas/inspector/categories/customCodeConfig";

/** Props for {@link ParameterListEditor}. */
export type ParameterListEditorProps = {
  /** The current ordered parameter list; owned by the caller (`CustomCodeConfigEditor`), not
   *  local state here — see that component's doc comment for why the blank-row-survives rationale
   *  lives one level up instead of being duplicated in this component too. */
  parameters: CodeParameter[];
  onChange: (parameters: CodeParameter[]) => void;
};

/**
 * Ordered add/edit/remove list of named parameters (DRUFF-14's AC2), structured like
 * `NodeConfigEditor`'s row list (`nodeConfig.ts`): index keys, since a row's identity is only its
 * position, and a freshly-added blank-name row is a legitimate in-progress edit, not something this
 * component itself drops — that's `writeCustomCode`'s job on commit, one level up.
 */
export function ParameterListEditor({ parameters, onChange }: ParameterListEditorProps) {
  function updateAt(index: number, name: string): void {
    onChange(parameters.map((param, i) => (i === index ? { name } : param)));
  }

  function removeAt(index: number): void {
    onChange(parameters.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      {parameters.length === 0 && (
        <p className="text-xs text-muted-foreground">No parameters yet.</p>
      )}
      {parameters.map((param, index) => (
        // Index as key: same rationale as NodeConfigEditor's rows — a parameter has no identity
        // beyond position, and rows are only appended/removed, never reordered.
        <div key={index} className="flex items-center gap-1.5">
          <Input
            aria-label={`Parameter ${index + 1} name`}
            placeholder="parameter_name"
            value={param.name}
            onChange={(event: ChangeEvent<HTMLInputElement>) => updateAt(index, event.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove parameter"
            onClick={() => removeAt(index)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...parameters, { name: "" }])}
      >
        <Plus />
        Add parameter
      </Button>
    </div>
  );
}
