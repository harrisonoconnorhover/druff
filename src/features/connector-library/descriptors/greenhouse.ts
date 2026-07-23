import { Briefcase } from "lucide-react";
import type { ConnectorDescriptor } from "@/features/connector-library/descriptors/types";

/**
 * Greenhouse source connector (DRUFF-6) — the first pre-made connector, proving the config-driven
 * connector pattern end-to-end (`steering/00-project-overview.md`'s "Pre-made connectors" module).
 * Field set is representative of Greenhouse's Harvest API, not authoritative; refine against
 * Dander's actual Greenhouse connector config shape once the "Contract with Dander" is settled —
 * a data-only edit to this file, per this ticket's Design.
 *
 * No field carries a real value or default; `harvest_api_key_ref` is a `secret` **reference**
 * (a Secret Manager key name / env key Dander resolves at run time), never the API key itself —
 * see `01-security.md` and `descriptors/types.ts`'s doc comment.
 *
 * TODO(dander-contract): `danderType` below is a clearly-marked placeholder — the exact node
 * `type` string Dander uses for a Greenhouse source connector isn't knowable yet (see the TODO in
 * `steering/00-project-overview.md`'s "Contract with Dander"). Centralized here so confirming it
 * is a one-line change; round-trip tests assert id -> type -> id symmetry, not this literal string.
 */
export const GREENHOUSE_CONNECTOR: ConnectorDescriptor = {
  id: "greenhouse",
  name: "Greenhouse",
  kind: "source",
  danderType: "connector.greenhouse",
  icon: Briefcase,
  fields: [
    {
      key: "harvest_api_key_ref",
      label: "Harvest API key reference",
      type: "secret",
      required: true,
      help:
        "Reference/handle of the secret holding the Greenhouse Harvest API key (e.g. a Secret " +
        "Manager secret name). The key itself is never stored in Druff — Dander resolves it at " +
        "run time.",
      placeholder: "projects/my-project/secrets/greenhouse-harvest-api-key",
    },
    {
      key: "base_url",
      label: "Base URL",
      type: "text",
      required: false,
      help: "Override only if Greenhouse's Harvest API base URL differs from the default.",
      placeholder: "https://harvest.greenhouse.io/v1",
    },
    {
      key: "on_behalf_of",
      label: "On-behalf-of user ID",
      type: "text",
      required: false,
      help: "Greenhouse user ID to attribute API requests to, if your account requires one.",
    },
  ],
};
