# `connector-library`

The **config-driven connector pattern** (DRUFF-6), proving the "Pre-made connectors" module from
`steering/00-project-overview.md` once, with Greenhouse as its offline fallback and Dander's
installed-plugin catalog as the dynamic source: "a form over each connector's known config shape,
no code." Everything connector-specific arrives as validated **data**; everything generic is a
small reusable engine other tickets consume at fixed seams.

## Files

- `descriptors/types.ts` — the descriptor contract: `ConnectorFieldDescriptor` (key/label/type/
  required/help/placeholder) and `ConnectorDescriptor` (id/name/kind/danderType/icon/fields), plus
  the Zod schemas that parse a descriptor so a malformed/hand-edited one fails loud at the boundary
  rather than rendering a broken form.
- `descriptors/greenhouse.ts` — the Greenhouse source binding, as data. It emits Dander's canonical
  `type: source`, `connector: greenhouse_job_board`, and `endpoint: jobs` contract.
- `discovery.ts` — strict client for Dander's presentation-only `GET /v1/connectors` contract. It
  maps installed plugin endpoints to canonical source bindings and declared output fields.
- `registry.ts` — `CONNECTOR_REGISTRY` plus `getConnector(id)` /
  `getConnectorForDanderNode(type, config)` / `listConnectors()`. Static and discovered entries
  share this one lookup surface.
- `defaultConfig.ts` — `defaultConfigForDescriptor`: seeds declared non-secret binding defaults
  for a freshly dropped connector node. No `secret` field ever gets a non-empty default.
- `validateConnectorConfig.ts` — pure required-field validator; returns a field-key -> message map,
  empty when the config is valid.
- `ConnectorConfigForm.tsx` — the descriptor-driven form: one row per field, generic dispatch on
  `type` (`text` | `secret`), fully controlled (`config`/`errors` in, `onChange(key, value)` out).

## Security: `secret` fields are references, not secrets

Per `steering/01-security.md`, Druff never stores a real secret value. A `secret`-typed field's
stored `config` value is only the **name/handle** of where the secret lives (a Secret Manager key
name / env key Dander resolves at run time) — never the key itself. `secret` fields are therefore
rendered unmasked (there's no real secret to hide) with an explicit "reference, not the value" hint,
and never receive a default value. No fixture, test, or committed descriptor carries a real key.

## How other tickets plug in

- **Palette** (`NodePalette.tsx`, DRUFF-2) lists `listConnectors()` as pre-made **source** entries
  and encodes `{ kind, connectorId }` on the drag payload.
- **Node-factory** (`createNode.ts`) seeds a dropped connector node's `data.connectorId` and
  `config` (via `defaultConfigForDescriptor`) when the drag payload carries one.
- **`PipelineNode`** renders a connector's `icon`/`name` from the registry when `data.connectorId`
  is set, so a Greenhouse node is visually identifiable on the canvas.
- **Inspector** (`NodeInspector.tsx`, DRUFF-3) resolves the node's descriptor, runs
  `validateConnectorConfig`, and renders `ConnectorConfigForm` in place of the generic key/value
  `NodeConfigEditor` — writing every edit back through the store's `updateNodeData`, so config stays
  store-driven and live on the canvas.
- **Graph converter** (`canvas-convert.ts`, DRUFF-4) maps `connectorId` to canonical `type` on save
  and resolves `type + config.connector` on load. This avoids misclassifying every generic source
  node as Greenhouse while keeping connector identity lossless.

## Out of scope

Druff never calls Salesforce or Greenhouse. It authors the binding; Dander resolves the connector
YAML and owns authentication, execution, state, and deployment.
