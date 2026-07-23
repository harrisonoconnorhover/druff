# `connector-library`

The **config-driven connector pattern** (DRUFF-6), proving the "Pre-made connectors" module from
`steering/00-project-overview.md` once, with Greenhouse as its single concrete instance: "a form
over each connector's known config shape, no code." Everything connector-specific lives here as
**data**; everything generic is a small reusable engine other tickets consume at fixed seams.
Adding connector #2..N later is "add a descriptor file + one registry entry," not new components.

## Files

- `descriptors/types.ts` — the descriptor contract: `ConnectorFieldDescriptor` (key/label/type/
  required/help/placeholder) and `ConnectorDescriptor` (id/name/kind/danderType/icon/fields), plus
  the Zod schemas that parse a descriptor so a malformed/hand-edited one fails loud at the boundary
  rather than rendering a broken form.
- `descriptors/greenhouse.ts` — the Greenhouse source connector, as data. Fields are representative
  of Greenhouse's Harvest API, not authoritative — see the file's `TODO(dander-contract)`.
- `registry.ts` — `CONNECTOR_REGISTRY` plus `getConnector(id)` / `getConnectorByDanderType(type)` /
  `listConnectors()`. The one place other features read pre-made connectors from.
- `defaultConfig.ts` — `defaultConfigForDescriptor`: seeds a fully-keyed, all-empty `config` for a
  freshly-dropped connector node. No `secret` field ever gets a non-empty default.
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
- **Graph converter** (`canvas-convert.ts`, DRUFF-4) maps `connectorId <-> danderType` through the
  registry on save/load, so a Greenhouse node's connector identity survives the round trip. `config`
  passes through untouched — the descriptor never participates in serialization, only in editing.

## Out of scope

Druff never executes a connector — this module only authors/stores its `config`
(`steering/00-project-overview.md`'s scope discipline). There is no client-side call to Greenhouse
anywhere in this feature.
