import type { LucideIcon } from "lucide-react";
import { z } from "zod";

/**
 * The connector-descriptor contract (DRUFF-6): the declarative shape a "pre-made connector" module
 * (`steering/00-project-overview.md`) is authored as, so the palette/inspector render a form from
 * **data**, never hardcoded per-connector JSX. Kept deliberately small — see this ticket's Design
 * "text | secret only" trade-off; `number`/`boolean`/`select` are the documented extension seam,
 * added alongside the matching shadcn primitive only when a real connector first needs them.
 */
export const ConnectorFieldTypeSchema = z.enum(["text", "secret"]);
export type ConnectorFieldType = z.infer<typeof ConnectorFieldTypeSchema>;

/**
 * One config field on a connector's known shape. `type: "secret"` marks a field whose stored value
 * is a **reference/handle** to a secret Dander resolves at run time — never the secret itself (see
 * `01-security.md` and this ticket's Design "secret-as-reference" trade-off).
 */
export const ConnectorFieldDescriptorSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: ConnectorFieldTypeSchema,
  required: z.boolean(),
  defaultValue: z.string().optional(),
  help: z.string().optional(),
  placeholder: z.string().optional(),
});
export type ConnectorFieldDescriptor = z.infer<typeof ConnectorFieldDescriptorSchema>;

/**
 * A full connector descriptor. `id` is Druff's stable palette/registry key. `danderType` is the
 * canonical graph node type; `danderConnector` is the connector YAML identity stored in config.
 * Both are required to recognize a connector when loading a generic `source` node.
 *
 * `icon` is validated by the Zod schema only as "present or absent" (`z.custom`) — a React
 * component reference isn't itself data crossing a serialization boundary, so there's nothing
 * structural to check beyond "is this callable/a component", unlike the rest of the descriptor.
 */
export const ConnectorDescriptorSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.literal("source"),
  danderType: z.string(),
  danderConnector: z.string(),
  icon: z
    .custom<LucideIcon>(
      (value) => value === undefined || typeof value === "object" || typeof value === "function",
    )
    .optional(),
  fields: z.array(ConnectorFieldDescriptorSchema),
});
export type ConnectorDescriptor = z.infer<typeof ConnectorDescriptorSchema>;
