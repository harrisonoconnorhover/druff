import { TriggerSchema, type TriggerKind } from "@/lib/pipeline-graph";

/**
 * Pure, framework-free domain module for the Trigger config category (DRUFF-13): the mode table,
 * config<->view-model mapping, and required-field validation. Kept free of React and the store so
 * the non-trivial logic the AC requires unit-tested (AC5) is testable without rendering anything —
 * mirrors `nodeConfig.ts` (DRUFF-3) and `httpRequestConfig.ts` (DRUFF-12).
 *
 * Grounded in Dander's real `Trigger` model (`../dander/src/dander/pipeline/graph.py`): a `kind`
 * discriminator (`schedule` | `manual` | `dependency`) plus kind-specific payload fields, all
 * opaque/inert here — a cron expression is stored as authored text, never parsed or scheduled
 * client-side (the "Druff never executes user code" non-goal).
 */

/** On-disk key this category reads/writes under a node's `config` (this ticket's Design: stored at
 *  `config.trigger`, a faithful Dander `Trigger` object — see the Design's flagged DRUFF-4/Dander
 *  contract question re: Dander's canonical `Node.trigger` sibling placement). */
export const TRIGGER_CONFIG_KEY = "trigger";

/** One editable field within a trigger mode. `multi` marks an add/remove list (only `depends_on`
 *  today); everything else is a single text input. */
export type TriggerFieldDescriptor = {
  key: "cron" | "event" | "depends_on";
  label: string;
  required: boolean;
  multi?: boolean;
  help?: string;
  placeholder?: string;
};

/** One entry in the config-driven mode table: a Dander `TriggerKind` plus the fields its payload
 *  needs. Adding/removing a mode is a one-row change here, not new branching code. */
export type TriggerModeDescriptor = {
  kind: TriggerKind;
  label: string;
  help?: string;
  fields: TriggerFieldDescriptor[];
};

/**
 * The config-driven mode table backing the mode selector. The ticket frames the choice as binary
 * (schedule vs webhook/event), but Dander's `TriggerKind` has a third value, `dependency`; per this
 * ticket's Design ("Two modes vs three kinds" trade-off), all three ship so that loading/editing a
 * hand-authored `dependency` trigger has a home rather than being silently unrepresentable (AC4).
 * `manual` is labeled "Webhook / event" to match the ticket's wording for that mode.
 */
export const TRIGGER_MODES: readonly TriggerModeDescriptor[] = [
  {
    kind: "schedule",
    label: "Schedule",
    help: "Runs on a cron schedule. The expression is stored as authored text and never evaluated in the browser.",
    fields: [
      {
        key: "cron",
        label: "Cron expression",
        required: true,
        placeholder: "0 * * * *",
        help: 'Opaque cron string, e.g. "0 * * * *" — parsed only by Dander, never in Druff.',
      },
    ],
  },
  {
    kind: "manual",
    label: "Webhook / event",
    help: "Fires on a manual run or an external event. Dander's manual trigger carries only an optional opaque event name — no webhook URL/method/secret fields exist in its model yet.",
    fields: [
      {
        key: "event",
        label: "Event name",
        required: false,
        placeholder: "candidate.created",
        help: "Optional opaque external-event name.",
      },
    ],
  },
  {
    kind: "dependency",
    label: "Upstream dependency",
    help: "Runs after the listed upstream node ids complete.",
    fields: [
      {
        key: "depends_on",
        label: "Depends on",
        required: true,
        multi: true,
        placeholder: "upstream-node-id",
        help: "Upstream node ids by name only.",
      },
    ],
  },
];

/** The editable view-model for whichever mode is active: every kind's payload fields, always
 *  present together so switching modes never has to invent/discard a differently-shaped object —
 *  only the fields relevant to the active `kind` are read/written to `config` (see
 *  {@link writeTriggerConfig}). */
export type TriggerFieldValues = {
  cron: string;
  event: string;
  depends_on: string[];
};

const EMPTY_VALUES: TriggerFieldValues = { cron: "", event: "", depends_on: [] };

/**
 * Parses a node's `config.trigger` into `{ kind, values }`. Returns `kind: null` (with empty
 * `values`) when the key is absent or doesn't parse as a `Trigger` — a freshly-dropped trigger node
 * or a legacy/hand-edited config renders an **unselected** editor rather than throwing, per this
 * ticket's Design. Never mutates `config`.
 */
export function readTriggerConfig(config: Record<string, unknown> | undefined): {
  kind: TriggerKind | null;
  values: TriggerFieldValues;
} {
  const parsed = TriggerSchema.safeParse(config?.[TRIGGER_CONFIG_KEY]);
  if (!parsed.success) {
    return { kind: null, values: { ...EMPTY_VALUES } };
  }

  const trigger = parsed.data;
  return {
    kind: trigger.kind,
    values: {
      cron: trigger.cron ?? "",
      event: trigger.event ?? "",
      depends_on: trigger.depends_on,
    },
  };
}

/**
 * Writes the edited mode/values back onto a **copy** of `prevConfig`: every non-`trigger` key is
 * preserved untouched, and `config.trigger` is rewritten to a clean Dander-shaped object holding
 * **only** `kind` plus the selected kind's own payload key(s) (+ preserved `metadata`) — never
 * another kind's stale payload. This is the core reason switching modes can't silently corrupt the
 * stored config (AC4): Dander's own `Trigger._check_kind_payload` validator rejects a trigger whose
 * payload doesn't match its `kind` (e.g. a `manual` trigger still carrying `cron`), so a leftover
 * cross-kind field would fail to load on Dander's side even though it parsed fine here.
 *
 * A blank/whitespace-only single-value field (`cron`/`event`) is omitted entirely rather than
 * written as `""`; `depends_on` entries are trimmed and blank entries dropped, mirroring
 * `entriesToConfig`'s blank-row convention. `metadata` is preserved verbatim from the previous
 * `config.trigger` (if it parsed) regardless of mode switch, and omitted when empty — Dander's own
 * omit-when-default convention this codebase already follows for `RequestSpec` (`httpRequestConfig.ts`).
 */
export function writeTriggerConfig(
  prevConfig: Record<string, unknown> | undefined,
  kind: TriggerKind,
  values: TriggerFieldValues,
): Record<string, unknown> {
  const nextConfig: Record<string, unknown> = { ...(prevConfig ?? {}) };

  const prevTrigger = TriggerSchema.safeParse(prevConfig?.[TRIGGER_CONFIG_KEY]);
  const metadata = prevTrigger.success ? prevTrigger.data.metadata : {};

  const trigger: Record<string, unknown> = { kind };

  switch (kind) {
    case "schedule": {
      const cron = values.cron.trim();
      if (cron !== "") trigger.cron = cron;
      break;
    }
    case "manual": {
      const event = values.event.trim();
      if (event !== "") trigger.event = event;
      break;
    }
    case "dependency": {
      const dependsOn = values.depends_on.map((id) => id.trim()).filter((id) => id !== "");
      if (dependsOn.length > 0) trigger.depends_on = dependsOn;
      break;
    }
  }

  if (Object.keys(metadata).length > 0) {
    trigger.metadata = metadata;
  }

  nextConfig[TRIGGER_CONFIG_KEY] = trigger;
  return nextConfig;
}

/**
 * Required-field validation mirroring Dander's `Trigger._check_kind_payload`, for inline UX only
 * (AC4's "actionable inline message") — same empty-object-means-valid convention as
 * `validateConnectorConfig`. `schedule` requires a non-empty (trimmed) `cron`; `dependency`
 * requires at least one non-blank `depends_on` entry; `manual`'s `event` is optional, so it never
 * produces an error.
 */
export function validateTrigger(
  kind: TriggerKind,
  values: TriggerFieldValues,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (kind === "schedule" && values.cron.trim() === "") {
    errors.cron = "Cron expression is required.";
  }
  if (kind === "dependency" && !values.depends_on.some((id) => id.trim() !== "")) {
    errors.depends_on = "At least one upstream dependency is required.";
  }

  return errors;
}
