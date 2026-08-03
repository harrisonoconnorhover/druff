import { Briefcase } from "lucide-react";
import type { ConnectorDescriptor } from "@/features/connector-library/descriptors/types";

/**
 * Greenhouse source connector (DRUFF-6) — the first pre-made connector, proving the config-driven
 * connector pattern end-to-end (`steering/00-project-overview.md`'s "Pre-made connectors" module).
 * Dander keeps API/auth/pagination/schema in `connectors/greenhouse_job_board.yaml`. Druff authors
 * only the stable connector and endpoint binding used by the executable PipelineGraph bridge.
 */
export const GREENHOUSE_CONNECTOR: ConnectorDescriptor = {
  id: "greenhouse",
  name: "Greenhouse",
  kind: "source",
  danderType: "source",
  danderConnector: "greenhouse_job_board",
  icon: Briefcase,
  fields: [
    {
      key: "connector",
      label: "Dander connector",
      type: "text",
      required: true,
      defaultValue: "greenhouse_job_board",
      help: "Connector YAML name. API and authentication settings remain owned by Dander.",
    },
    {
      key: "endpoint",
      label: "Endpoint",
      type: "text",
      required: true,
      defaultValue: "jobs",
      help: "Endpoint name declared in the selected Dander connector YAML.",
    },
  ],
};
