import { z } from "zod";

export const OperationKindSchema = z.enum([
  "truncate_string",
  "trim_whitespace",
  "default_value",
  "filter_rows",
]);
export type OperationKind = z.infer<typeof OperationKindSchema>;

export const ComparisonOperatorSchema = z.enum([
  "eq",
  "ne",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "not_in",
  "is_null",
  "is_not_null",
]);
export type ComparisonOperator = z.infer<typeof ComparisonOperatorSchema>;

export const MatchLogicSchema = z.enum(["all", "any"]);
export type MatchLogic = z.infer<typeof MatchLogicSchema>;

const ScalarSchema = z.union([z.string(), z.number(), z.boolean()]);
export type OperationScalar = z.infer<typeof ScalarSchema>;

export const FieldConditionSchema = z
  .object({
    field: z.string().min(1),
    op: ComparisonOperatorSchema,
    value: z.union([ScalarSchema, z.array(ScalarSchema).min(1), z.null()]).optional(),
  })
  .strict()
  .superRefine((condition, context) => {
    const nullary = condition.op === "is_null" || condition.op === "is_not_null";
    const list = condition.op === "in" || condition.op === "not_in";
    if (nullary && condition.value != null) {
      context.addIssue({ code: "custom", message: "This operator does not accept a value." });
    } else if (list && (!Array.isArray(condition.value) || condition.value.length === 0)) {
      context.addIssue({ code: "custom", message: "This operator requires a value list." });
    } else if (!nullary && !list && (condition.value == null || Array.isArray(condition.value))) {
      context.addIssue({ code: "custom", message: "This operator requires one value." });
    }
  });
export type FieldCondition = z.infer<typeof FieldConditionSchema>;

const MetadataSchema = z.record(z.string(), z.unknown()).default({});

export const OperationSpecSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("truncate_string"),
      params: z.object({ field: z.string().min(1), max_length: z.number().int().min(0) }).strict(),
      metadata: MetadataSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("trim_whitespace"),
      params: z.object({ field: z.string().min(1) }).strict(),
      metadata: MetadataSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("default_value"),
      params: z.object({ field: z.string().min(1), default: ScalarSchema }).strict(),
      metadata: MetadataSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("filter_rows"),
      params: z
        .object({
          conditions: z.array(FieldConditionSchema).min(1),
          logic: MatchLogicSchema.default("all"),
        })
        .strict(),
      metadata: MetadataSchema,
    })
    .strict(),
]);
export type OperationSpec = z.infer<typeof OperationSpecSchema>;

export type OperationConfigRead =
  { operations: OperationSpec[]; error: null } | { operations: null; error: string };

/** Parses only the operation slice. Invalid/newer config is preserved and made read-only. */
export function readOperationConfig(config?: Record<string, unknown>): OperationConfigRead {
  if (config?.operations === undefined) return { operations: [], error: null };
  const parsed = z.array(OperationSpecSchema).safeParse(config.operations);
  return parsed.success
    ? { operations: parsed.data, error: null }
    : {
        operations: null,
        error:
          "These operations use a format this Druff version cannot safely edit. The graph is unchanged.",
      };
}

/** Replaces only canonical `config.operations`, preserving every sibling config key. */
export function writeOperationConfig(
  config: Record<string, unknown> | undefined,
  operations: OperationSpec[],
): Record<string, unknown> {
  const parsed = z.array(OperationSpecSchema).parse(operations);
  const next = { ...(config ?? {}) };
  if (parsed.length === 0) delete next.operations;
  else next.operations = parsed;
  return next;
}

export function createOperation(kind: OperationKind, field: string): OperationSpec {
  if (kind === "truncate_string") {
    return { kind, params: { field, max_length: 255 }, metadata: {} };
  }
  if (kind === "trim_whitespace") {
    return { kind, params: { field }, metadata: {} };
  }
  if (kind === "default_value") {
    return { kind, params: { field, default: "" }, metadata: {} };
  }
  return {
    kind,
    params: { logic: "all", conditions: [{ field, op: "is_not_null" }] },
    metadata: {},
  };
}

export function moveOperation(
  operations: OperationSpec[],
  from: number,
  to: number,
): OperationSpec[] {
  if (to < 0 || to >= operations.length || from === to) return operations;
  const next = [...operations];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
