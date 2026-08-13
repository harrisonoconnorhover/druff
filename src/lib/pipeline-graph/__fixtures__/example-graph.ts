import { PipelineGraphSchema } from "@/lib/pipeline-graph/schema";

/**
 * Representative, non-sensitive fixture graph adapted from Dander's own
 * `crm_to_warehouse_example` (`src/dander/pipeline/README.md`) — fake names throughout;
 * `sensitivity: pii` appears only as a metadata *tag*, never a real value
 * (`steering/01-security.md`). Exercises the full shape surface DRUFF-4's converters/serializers
 * must round-trip: two declared source fields, a direct mapping, an `expression` transformation
 * with `inputs`, a `left` join, and a second, join-less edge into a third node.
 */
export const EXAMPLE_GRAPH = PipelineGraphSchema.parse({
  name: "crm_to_warehouse_example",
  nodes: [
    {
      id: "crm_contacts",
      type: "source",
      name: "Extract CRM Contacts",
      config: { endpoint: "/contacts" },
      fields: [
        {
          name: "contact_id",
          type: "STRING",
          nullable: false,
          description: "Unique contact identifier from the CRM.",
          metadata: {},
        },
        {
          name: "full_name",
          type: "STRING",
          nullable: true,
          description: "Contact's full name as entered in the CRM.",
          metadata: { sensitivity: "pii" },
        },
      ],
    },
    {
      id: "warehouse_customers",
      type: "target",
      name: "Load Warehouse Customers",
      config: {},
      fields: [
        { name: "customer_id", type: "STRING", nullable: false, description: null, metadata: {} },
        { name: "display_name", type: "STRING", nullable: true, description: null, metadata: {} },
      ],
    },
    {
      id: "notify_slack",
      type: "trigger",
      name: "Notify on load",
      config: { channel: "#pipeline-status" },
      fields: [],
    },
  ],
  edges: [
    {
      from: "crm_contacts",
      to: "warehouse_customers",
      metadata: {},
      mappings: [
        { source: "contact_id", target: "customer_id", transformation: null, metadata: {} },
        {
          source: null,
          target: "display_name",
          transformation: {
            kind: "expression",
            expression: "UPPER(full_name)",
            constant: null,
            inputs: ["full_name"],
            metadata: {},
          },
          metadata: {},
        },
      ],
      join: {
        type: "left",
        keys: [{ left: "contact_id", right: "customer_id" }],
        metadata: {},
      },
    },
    {
      // Join-less edge: exercises "join omitted entirely when absent" on both encode and decode.
      from: "warehouse_customers",
      to: "notify_slack",
      metadata: {},
      mappings: [],
    },
  ],
});

/**
 * Hand-authored YAML text decoding to `EXAMPLE_GRAPH` — written independently of `encodeGraph`
 * (not derived from it), so `serialize.test.ts` can exercise `decodeGraph` on its own: the
 * `config`/`params` alias (`crm_contacts` uses `params`), and Dander's documented defaults
 * (omitted `nullable`/`description`/`metadata`/`config`/`fields` throughout).
 */
export const EXAMPLE_GRAPH_YAML = `
name: crm_to_warehouse_example
nodes:
  - id: crm_contacts
    type: source
    name: Extract CRM Contacts
    params:
      endpoint: /contacts
    fields:
      - name: contact_id
        type: STRING
        nullable: false
        description: Unique contact identifier from the CRM.
      - name: full_name
        type: STRING
        description: Contact's full name as entered in the CRM.
        metadata:
          sensitivity: pii
  - id: warehouse_customers
    type: target
    name: Load Warehouse Customers
    fields:
      - name: customer_id
        type: STRING
        nullable: false
      - name: display_name
        type: STRING
  - id: notify_slack
    type: trigger
    name: Notify on load
    config:
      channel: "#pipeline-status"
edges:
  - from: crm_contacts
    to: warehouse_customers
    mappings:
      - source: contact_id
        target: customer_id
      - target: display_name
        transformation:
          kind: expression
          expression: "UPPER(full_name)"
          inputs:
            - full_name
    join:
      type: left
      keys:
        - left: contact_id
          right: customer_id
  - from: warehouse_customers
    to: notify_slack
`;
