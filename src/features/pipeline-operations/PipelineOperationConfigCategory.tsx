"use client";

import { useState, useSyncExternalStore, type ChangeEvent } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  ConfigCategory,
  ConfigCategoryEditorProps,
} from "@/features/pipeline-canvas/inspector/configCategories";
import {
  getOperationCatalogSnapshot,
  subscribeOperationCatalog,
} from "@/features/pipeline-operations/catalog-store";
import {
  ComparisonOperatorSchema,
  MatchLogicSchema,
  createOperation,
  moveOperation,
  readOperationConfig,
  writeOperationConfig,
  type ComparisonOperator,
  type FieldCondition,
  type OperationKind,
  type OperationScalar,
  type OperationSpec,
} from "@/features/pipeline-operations/operationConfig";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
);

function PipelineOperationConfigEditor({ node, onConfigChange }: ConfigCategoryEditorProps) {
  const catalog = useSyncExternalStore(
    subscribeOperationCatalog,
    getOperationCatalogSnapshot,
    getOperationCatalogSnapshot,
  );
  const initial = readOperationConfig(node.data.config);
  const [operations, setOperations] = useState<OperationSpec[] | null>(initial.operations);
  const [kindToAdd, setKindToAdd] = useState<OperationKind | "">(catalog[0]?.kind ?? "");
  const fields = node.data.fields?.map((field) => field.name) ?? [];

  if (operations === null) {
    return <p className="text-xs text-destructive">{initial.error}</p>;
  }

  function commit(next: OperationSpec[]): void {
    setOperations(next);
    onConfigChange(writeOperationConfig(node.data.config, next));
  }

  const unadvertised = operations.filter(
    (operation) => !catalog.some((descriptor) => descriptor.kind === operation.kind),
  );
  if (unadvertised.length > 0) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-destructive">
          The connected Dander runtime does not advertise every saved operation. They remain
          unchanged; connect a compatible runtime to edit them.
        </p>
        <ul className="list-inside list-disc text-xs text-muted-foreground">
          {operations.map((operation, index) => (
            <li key={index}>{operation.kind.replaceAll("_", " ")}</li>
          ))}
        </ul>
      </div>
    );
  }

  const selectedKind = kindToAdd || catalog[0]?.kind || "";
  return (
    <div className="flex flex-col gap-3">
      {operations.length === 0 && (
        <p className="text-xs text-muted-foreground">No ordered operations yet.</p>
      )}
      {operations.map((operation, index) => {
        const descriptor = catalog.find((item) => item.kind === operation.kind);
        return (
          <div key={index} className="flex flex-col gap-2 rounded-lg border p-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{descriptor?.display_name ?? operation.kind}</p>
                {descriptor?.description && (
                  <p className="text-xs text-muted-foreground">{descriptor.description}</p>
                )}
              </div>
              <div className="flex shrink-0">
                <IconButton
                  label="Move operation up"
                  disabled={index === 0}
                  onClick={() => commit(moveOperation(operations, index, index - 1))}
                >
                  <ArrowUp />
                </IconButton>
                <IconButton
                  label="Move operation down"
                  disabled={index === operations.length - 1}
                  onClick={() => commit(moveOperation(operations, index, index + 1))}
                >
                  <ArrowDown />
                </IconButton>
                <IconButton
                  label="Remove operation"
                  onClick={() => commit(operations.filter((_, item) => item !== index))}
                >
                  <Trash2 />
                </IconButton>
              </div>
            </div>
            <OperationControls
              operation={operation}
              fields={fields}
              operators={
                descriptor?.parameters.find((parameter) => parameter.control === "conditions")
                  ?.operators ?? []
              }
              onChange={(next) =>
                commit(operations.map((item, itemIndex) => (itemIndex === index ? next : item)))
              }
            />
          </div>
        );
      })}

      {catalog.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Open this graph from a Dander runtime that advertises operation support.
        </p>
      ) : fields.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Declare at least one transform output field before adding an operation.
        </p>
      ) : (
        <div className="flex items-center gap-2">
          <select
            aria-label="Operation to add"
            className={selectClassName}
            value={selectedKind}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              setKindToAdd(event.target.value as OperationKind)
            }
          >
            {catalog.map((operation) => (
              <option key={operation.kind} value={operation.kind}>
                {operation.display_name}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              commit([...operations, createOperation(selectedKind as OperationKind, fields[0])])
            }
          >
            <Plus /> Add
          </Button>
        </div>
      )}
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function OperationControls({
  operation,
  fields,
  operators,
  onChange,
}: {
  operation: OperationSpec;
  fields: string[];
  operators: ComparisonOperator[];
  onChange: (operation: OperationSpec) => void;
}) {
  if (operation.kind === "filter_rows") {
    return (
      <FilterControls
        operation={operation}
        fields={fields}
        operators={operators}
        onChange={onChange}
      />
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <FieldSelect
        value={operation.params.field}
        fields={fields}
        onChange={(field) => onChange(updateOperationField(operation, field))}
      />
      {operation.kind === "truncate_string" && (
        <div className="flex flex-col gap-1">
          <Label>Maximum length</Label>
          <Input
            type="number"
            min={0}
            value={operation.params.max_length}
            onChange={(event) => {
              const max_length = Number.parseInt(event.target.value, 10);
              if (Number.isInteger(max_length) && max_length >= 0) {
                onChange({ ...operation, params: { ...operation.params, max_length } });
              }
            }}
          />
        </div>
      )}
      {operation.kind === "default_value" && (
        <div className="flex flex-col gap-1">
          <Label>Default value</Label>
          <Input
            value={String(operation.params.default)}
            onChange={(event) =>
              onChange({
                ...operation,
                params: { ...operation.params, default: event.target.value },
              })
            }
          />
        </div>
      )}
    </div>
  );
}

function updateOperationField(
  operation: Exclude<OperationSpec, { kind: "filter_rows" }>,
  field: string,
): OperationSpec {
  if (operation.kind === "truncate_string") {
    return { ...operation, params: { ...operation.params, field } };
  }
  if (operation.kind === "default_value") {
    return { ...operation, params: { ...operation.params, field } };
  }
  return { ...operation, params: { ...operation.params, field } };
}

type FilterOperation = Extract<OperationSpec, { kind: "filter_rows" }>;

function FilterControls({
  operation,
  fields,
  operators,
  onChange,
}: {
  operation: FilterOperation;
  fields: string[];
  operators: ComparisonOperator[];
  onChange: (operation: OperationSpec) => void;
}) {
  function updateCondition(index: number, condition: FieldCondition): void {
    onChange({
      ...operation,
      params: {
        ...operation.params,
        conditions: operation.params.conditions.map((item, itemIndex) =>
          itemIndex === index ? condition : item,
        ),
      },
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label>Match</Label>
        <select
          className={selectClassName}
          value={operation.params.logic}
          onChange={(event) =>
            onChange({
              ...operation,
              params: { ...operation.params, logic: MatchLogicSchema.parse(event.target.value) },
            })
          }
        >
          <option value="all">All conditions</option>
          <option value="any">Any condition</option>
        </select>
      </div>
      {operation.params.conditions.map((condition, index) => (
        <div key={index} className="flex flex-col gap-1.5 rounded-md bg-muted/50 p-2">
          <FieldSelect
            value={condition.field}
            fields={fields}
            onChange={(field) => updateCondition(index, { ...condition, field })}
          />
          <select
            aria-label={`Condition ${index + 1} operator`}
            className={selectClassName}
            value={condition.op}
            onChange={(event) => {
              const op = ComparisonOperatorSchema.parse(event.target.value);
              updateCondition(index, normalizeConditionForOperator({ ...condition, op }));
            }}
          >
            {operators.map((operator) => (
              <option key={operator} value={operator}>
                {operator.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          {!isNullary(condition.op) && (
            <Input
              aria-label={`Condition ${index + 1} value`}
              placeholder={isListOperator(condition.op) ? "comma,separated,values" : "value"}
              value={displayConditionValue(condition.value)}
              onChange={(event) =>
                updateCondition(index, {
                  ...condition,
                  value: isListOperator(condition.op)
                    ? event.target.value.split(",").map((value) => value.trim())
                    : event.target.value,
                })
              }
            />
          )}
          {operation.params.conditions.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                onChange({
                  ...operation,
                  params: {
                    ...operation.params,
                    conditions: operation.params.conditions.filter((_, item) => item !== index),
                  },
                })
              }
            >
              <Trash2 /> Remove condition
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={fields.length === 0}
        onClick={() =>
          onChange({
            ...operation,
            params: {
              ...operation.params,
              conditions: [...operation.params.conditions, { field: fields[0], op: "is_not_null" }],
            },
          })
        }
      >
        <Plus /> Add condition
      </Button>
    </div>
  );
}

function FieldSelect({
  value,
  fields,
  onChange,
}: {
  value: string;
  fields: string[];
  onChange: (field: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>Field</Label>
      <select
        className={selectClassName}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {!fields.includes(value) && <option value={value}>{value}</option>}
        {fields.map((field) => (
          <option key={field} value={field}>
            {field}
          </option>
        ))}
      </select>
    </div>
  );
}

function isNullary(operator: ComparisonOperator): boolean {
  return operator === "is_null" || operator === "is_not_null";
}

function isListOperator(operator: ComparisonOperator): boolean {
  return operator === "in" || operator === "not_in";
}

function normalizeConditionForOperator(condition: FieldCondition): FieldCondition {
  if (isNullary(condition.op)) return { field: condition.field, op: condition.op };
  if (isListOperator(condition.op)) {
    return {
      field: condition.field,
      op: condition.op,
      value: Array.isArray(condition.value) ? condition.value : [condition.value ?? ""],
    };
  }
  return {
    field: condition.field,
    op: condition.op,
    value: Array.isArray(condition.value) ? (condition.value[0] ?? "") : (condition.value ?? ""),
  };
}

function displayConditionValue(value: OperationScalar | OperationScalar[] | null | undefined) {
  return Array.isArray(value) ? value.join(", ") : value == null ? "" : String(value);
}

export const PIPELINE_OPERATION_CONFIG_CATEGORY: ConfigCategory = {
  id: "pipeline-operations",
  label: "Ordered operations",
  matches: (node) => node.data.kind === "transform",
  Editor: PipelineOperationConfigEditor,
};
