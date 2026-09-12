export const TOOLBAR_ITEMS = [
  "bold",
  "italic",
  "strikethrough",
  "code",
  "highlight",
  "link",
  "heading",
  "callout",
] as const;
export type ToolbarItemId = (typeof TOOLBAR_ITEMS)[number];
export interface ToolbarSettings {
  buttonOrder: ToolbarItemId[];
  dockAlwaysVisible: boolean;
  enabled: boolean;
  mode: "floating" | "dock";
  smartUrl: boolean;
  timers: {
    sessionVisible: boolean;
    fileVisible: boolean;
    sessionPrefix: string;
    filePrefix: string;
  };
}
export const DEFAULT_TOOLBAR_SETTINGS: ToolbarSettings = {
  enabled: false,
  mode: "floating",
  dockAlwaysVisible: false,
  smartUrl: false,
  buttonOrder: [...TOOLBAR_ITEMS],
  timers: {
    sessionVisible: true,
    fileVisible: true,
    sessionPrefix: "Sesi:",
    filePrefix: "File:",
  },
};
const CONTROL_CHARACTERS = /[\p{Cc}\p{Cf}]/u;

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
function prefix(value: unknown, fallback: string): string {
  if (typeof value !== "string" || CONTROL_CHARACTERS.test(value)) {
    return fallback;
  }
  return value.trim().slice(0, 40) || fallback;
}
export function normalizeToolbarSettings(value: unknown): ToolbarSettings {
  const raw = record(value);
  const timers = record(raw.timers);
  const order = Array.isArray(raw.buttonOrder)
    ? raw.buttonOrder.filter((id): id is ToolbarItemId =>
        TOOLBAR_ITEMS.includes(id as ToolbarItemId)
      )
    : [];
  const dockAlwaysVisible = raw.dockAlwaysVisible === true;
  return {
    enabled: raw.enabled === true,
    mode: dockAlwaysVisible || raw.mode === "dock" ? "dock" : "floating",
    dockAlwaysVisible,
    smartUrl: raw.smartUrl === true,
    buttonOrder: [...new Set([...order, ...TOOLBAR_ITEMS])],
    timers: {
      sessionVisible: timers.sessionVisible !== false,
      fileVisible: timers.fileVisible !== false,
      sessionPrefix: prefix(timers.sessionPrefix, "Sesi:"),
      filePrefix: prefix(timers.filePrefix, "File:"),
    },
  };
}
