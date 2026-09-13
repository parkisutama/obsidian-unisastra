import {
  BUILTIN_CALLOUT_TYPES,
  BUILTIN_LABEL_BY_ID,
  canonicalBuiltinCalloutId,
  GITHUB_ALERT_MARKERS,
  githubMarkerCanonicalId,
} from "./catalog";

export type CalloutOutputMode = "obsidian" | "github";
export type CalloutEntrySource = "builtin" | "custom";
export type CalloutStyling =
  | { readonly mode: "inherit" }
  | {
      readonly color: string | null;
      readonly icon: string | null;
      readonly mode: "override";
    };

export interface CalloutEntrySettings {
  readonly enabled: boolean;
  readonly id: string;
  readonly label: string;
  readonly order: number;
  readonly source: CalloutEntrySource;
  readonly styling: CalloutStyling;
}

export interface CalloutSettings {
  entries: CalloutEntrySettings[];
  outputMode: CalloutOutputMode;
}

export function calloutMenuOptions(
  settings: CalloutSettings
): { id: string; label: string }[] {
  if (settings.outputMode === "github") {
    return GITHUB_ALERT_MARKERS.filter((marker) =>
      settings.entries.some(
        (entry) =>
          entry.enabled &&
          entry.source === "builtin" &&
          entry.id === githubMarkerCanonicalId(marker)
      )
    ).map((marker) => ({ id: marker, label: marker }));
  }
  return settings.entries
    .filter((entry) => entry.enabled)
    .map((entry) => ({ id: entry.id, label: entry.label }));
}

// Custom IDs must stay safe inside `> [!id]` and are kept separate from the
// canonical builtin/alias namespace so a custom entry can never shadow one.
export const CUSTOM_ID_PATTERN = /^[a-z0-9_-]{1,64}$/;
const CONTROL_CHARACTERS = /[\p{Cc}\p{Cf}]/u;

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
function label(value: unknown, fallback: string): string {
  if (typeof value !== "string" || CONTROL_CHARACTERS.test(value)) {
    return fallback;
  }
  return value.trim().slice(0, 80) || fallback;
}
function styling(value: unknown): CalloutStyling {
  const raw = record(value);
  if (raw.mode !== "override") {
    return { mode: "inherit" };
  }
  return {
    mode: "override",
    color: typeof raw.color === "string" ? raw.color : null,
    icon: typeof raw.icon === "string" ? raw.icon : null,
  };
}

export function defaultBuiltinEntries(): CalloutEntrySettings[] {
  return BUILTIN_CALLOUT_TYPES.map((type, index) => ({
    id: type.id,
    label: type.label,
    enabled: true,
    order: index,
    source: "builtin",
    styling: { mode: "inherit" },
  }));
}

export const DEFAULT_CALLOUT_SETTINGS: CalloutSettings = {
  outputMode: "obsidian",
  entries: defaultBuiltinEntries(),
};

function normalizeEntry(
  raw: unknown,
  fallbackOrder: number,
  seenIds: Set<string>
): CalloutEntrySettings | null {
  const entry = record(raw);
  const rawId =
    typeof entry.id === "string" ? entry.id.trim().toLowerCase() : "";
  const builtinId = canonicalBuiltinCalloutId(rawId);
  const id = builtinId ?? (CUSTOM_ID_PATTERN.test(rawId) ? rawId : "");
  if (!id || seenIds.has(id)) {
    return null;
  }
  seenIds.add(id);
  const fallbackLabel = builtinId
    ? (BUILTIN_LABEL_BY_ID.get(builtinId) ?? id)
    : id;
  return {
    id,
    label: label(entry.label, fallbackLabel),
    enabled: entry.enabled !== false,
    order:
      typeof entry.order === "number" && Number.isFinite(entry.order)
        ? entry.order
        : fallbackOrder,
    source: builtinId ? "builtin" : "custom",
    styling: styling(entry.styling),
  };
}

export function normalizeCalloutSettings(value: unknown): CalloutSettings {
  const raw = record(value);
  const seenIds = new Set<string>();
  const entries: CalloutEntrySettings[] = [];

  if (Array.isArray(raw.entries)) {
    raw.entries.forEach((entry, index) => {
      const normalized = normalizeEntry(entry, index, seenIds);
      if (normalized) {
        entries.push(normalized);
      }
    });
  }

  for (const type of BUILTIN_CALLOUT_TYPES) {
    if (!seenIds.has(type.id)) {
      entries.push({
        id: type.id,
        label: type.label,
        enabled: true,
        order: entries.length,
        source: "builtin",
        styling: { mode: "inherit" },
      });
      seenIds.add(type.id);
    }
  }

  entries.sort((a, b) => a.order - b.order);

  return {
    outputMode: raw.outputMode === "github" ? "github" : "obsidian",
    entries,
  };
}
