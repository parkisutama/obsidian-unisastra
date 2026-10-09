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
export const TOOLBAR_ITEM_LABELS: Readonly<Record<ToolbarItemId, string>> = {
	bold: "Bold",
	italic: "Italic",
	strikethrough: "Strikethrough",
	code: "Inline code",
	highlight: "Highlight",
	link: "Link",
	heading: "Heading",
	callout: "Callout",
};
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
		updateIntervalSeconds: number;
	};
}
export const MIN_TIMER_UPDATE_INTERVAL_SECONDS = 1;
export const MAX_TIMER_UPDATE_INTERVAL_SECONDS = 300;
export const DEFAULT_TIMER_UPDATE_INTERVAL_SECONDS = 1;
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
		updateIntervalSeconds: DEFAULT_TIMER_UPDATE_INTERVAL_SECONDS,
	},
};
const CONTROL_CHARACTERS = /[\p{Cc}\p{Cf}]/u;

function record(value: unknown): Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: {};
}
export function prefix(value: unknown, fallback: string): string {
	if (typeof value !== "string" || CONTROL_CHARACTERS.test(value)) {
		return fallback;
	}
	return value.trim().slice(0, 40) || fallback;
}
export function timerUpdateIntervalSeconds(value: unknown): number {
	const parsed = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(parsed)) {
		return DEFAULT_TIMER_UPDATE_INTERVAL_SECONDS;
	}
	return Math.min(
		MAX_TIMER_UPDATE_INTERVAL_SECONDS,
		Math.max(MIN_TIMER_UPDATE_INTERVAL_SECONDS, Math.round(parsed)),
	);
}
/** Mutates toolbar.mode, refusing to undock while dockAlwaysVisible is on. Returns a refusal message, or null on success. */
export function setDockMode(toolbar: ToolbarSettings, dock: boolean): string | null {
	if (!dock && toolbar.dockAlwaysVisible) {
		return 'Turn off "always show dock" before undocking the toolbar.';
	}
	toolbar.mode = dock ? "dock" : "floating";
	return null;
}
export function normalizeToolbarSettings(value: unknown): ToolbarSettings {
	const raw = record(value);
	const timers = record(raw.timers);
	const order = Array.isArray(raw.buttonOrder)
		? raw.buttonOrder.filter((id): id is ToolbarItemId =>
				TOOLBAR_ITEMS.includes(id as ToolbarItemId),
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
			updateIntervalSeconds: timerUpdateIntervalSeconds(timers.updateIntervalSeconds),
		},
	};
}
