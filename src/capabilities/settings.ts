import type { Vault } from "obsidian";
import {
	CURRENT_LINE_HIGHLIGHT_STYLE,
	type CurrentLineHighlightStyle,
	DIM_UNFOCUSED_EDITORS_BEHAVIOR,
	DIM_UNFOCUSED_MODE,
	type DimUnfocusedEditorsBehavior,
	type DimUnfocusedMode,
	ENABLED_PLATFORMS,
	type EnabledPlatforms,
} from "./constants";
import {
	type CalloutSettings,
	DEFAULT_CALLOUT_SETTINGS,
	normalizeCalloutSettings,
} from "./features/callouts/settings";
import { normalizeFoldState } from "./features/fold-persist/settings";
import {
	DEFAULT_TOOLBAR_SETTINGS,
	normalizeToolbarSettings,
	type ToolbarSettings,
} from "./features/toolbar/settings";

export interface GeneralSettings {
	enabledPlatforms: EnabledPlatforms;
	// Retained for existing data.json files; update announcements are retired.
	isAnnounceUpdatesEnabled: boolean;
	isMononoteEnabled: boolean;
	isOnlyActivateAfterFirstInteractionEnabled: boolean;
	isPluginActivated: boolean;
	isSidebarEqualResizeEnabled: boolean;
	version: string | null;
}

export interface TypewriterSettings {
	isOnlyMaintainTypewriterOffsetWhenReachedEnabled: boolean;
	isTypewriterOnlyUseCommandsEnabled: boolean;
	isTypewriterScrollEnabled: boolean;
	typewriterOffset: number;
}

export interface KeepLinesAboveAndBelowSettings {
	isKeepLinesAboveAndBelowEnabled: boolean;
	linesAboveAndBelow: number;
}

export interface MaxCharsSettings {
	isMaxCharsPerLineEnabled: boolean;
	isWarnLongLineEnabled: boolean;
	maxCharsPerLine: number;
	warnLongLineChars: number;
}

export interface DimmingSettings {
	dimmedOpacity: number;
	dimUnfocusedEditorsBehavior: DimUnfocusedEditorsBehavior;
	dimUnfocusedMode: DimUnfocusedMode;
	isDimHighlightListParentEnabled: boolean;
	isDimTableAsOneEnabled: boolean;
	isDimUnfocusedEnabled: boolean;
	isPauseDimUnfocusedWhileScrollingEnabled: boolean;
	isPauseDimUnfocusedWhileSelectingEnabled: boolean;
}

export interface CurrentLineSettings {
	"currentLineHighlightColor-dark": string;
	"currentLineHighlightColor-light": string;
	currentLineHighlightStyle: CurrentLineHighlightStyle;
	currentLineHighlightUnderlineThickness: number;
	fadeLinesIntensity: number;
	isFadeLinesEnabled: boolean;
	isHighlightCurrentLineEnabled: boolean;
	isHighlightCurrentLineOnlyInFocusedEditorEnabled: boolean;
	isPauseCurrentLineHighlightWhileScrollingEnabled: boolean;
	isPauseCurrentLineHighlightWhileSelectingEnabled: boolean;
}

export interface WritingFocusSettings {
	doesWritingFocusShowHeader: boolean;
	doesWritingFocusShowStatusBar: boolean;
	isWritingFocusFullscreen: boolean;
	writingFocusFontSize: number;
}

export interface RestoreCursorPositionSettings {
	cursorPositions: Record<string, unknown>;
	isRestoreCursorPositionEnabled: boolean;
}

export interface HemingwayModeSettings {
	hemingwayModeStatusBarText: string;
	isAllowArrowDownInHemingwayModeEnabled: boolean;
	isAllowArrowLeftInHemingwayModeEnabled: boolean;
	isAllowArrowRightInHemingwayModeEnabled: boolean;
	isAllowArrowUpInHemingwayModeEnabled: boolean;
	isAllowBackspaceInHemingwayModeEnabled: boolean;
	isAllowDeleteInHemingwayModeEnabled: boolean;
	isAllowEndInHemingwayModeEnabled: boolean;
	isAllowHomeInHemingwayModeEnabled: boolean;
	isAllowPageDownInHemingwayModeEnabled: boolean;
	isAllowPageUpInHemingwayModeEnabled: boolean;
	isAllowUndoInHemingwayModeEnabled: boolean;
	isHemingwayModeEnabled: boolean;
	isShowHemingwayModeStatusBarEnabled: boolean;
}

export interface ShowWhitespaceSettings {
	isShowSpacesEnabled: boolean;
	isShowStrictLineBreakEnabled: boolean;
	isShowTabsEnabled: boolean;
	isShowTrailingEnabled: boolean;
	isShowWhitespaceEnabled: boolean;
}

export interface OutlinerSettings {
	isCursorStickEnabled: boolean;
	isKeyboardOpsEnabled: boolean;
	isOutlinerEnabled: boolean;
	isOutlinerOnClickEnabled: boolean;
	isSidebarOutlineEnabled: boolean;
	isSmartEnterEnabled: boolean;
	isSmartSelectEnabled: boolean;
	isSmartTabEnabled: boolean;
	sidebarCollapseState: Record<string, Record<string, boolean>>;
	sidebarFilterMode: "all" | "branch" | "tasks";
	sidebarFilterModeByFile: Record<string, "all" | "branch" | "tasks">;
}

export interface BlockIdSettings {
	isAutoGenerateOnFoldEnabled: boolean;
	isBlockIdEnabled: boolean;
	isHideIdsInLivePreviewEnabled: boolean;
}

export interface FoldPersistSettings {
	foldState: Record<string, Record<string, boolean>>;
	isFoldPersistEnabled: boolean;
}

export interface CompatibilitySettings {
	isGFMAnchorCompatibilityEnabled: boolean;
}

export type WritingMode = "idea" | "writing" | "editing" | "normal" | "none";

export interface WritingModePreset {
	currentLine: boolean;
	dimming: boolean;
	hemingwayMode: boolean;
	maxChars: boolean;
	outliner: boolean;
	showWhitespace: boolean;
	typewriter: boolean;
	writingFocus: boolean;
}

export interface WritingModeSettings {
	activeMode: WritingMode;
	presets: Record<Exclude<WritingMode, "none">, WritingModePreset>;
}

export interface UnisastraSettings {
	blockId: BlockIdSettings;
	callouts: CalloutSettings;
	compatibility: CompatibilitySettings;
	currentLine: CurrentLineSettings;
	dimming: DimmingSettings;
	foldPersist: FoldPersistSettings;
	general: GeneralSettings;
	hemingwayMode: HemingwayModeSettings;
	keepLinesAboveAndBelow: KeepLinesAboveAndBelowSettings;
	maxChars: MaxCharsSettings;
	outliner: OutlinerSettings;
	restoreCursorPosition: RestoreCursorPositionSettings;
	showWhitespace: ShowWhitespaceSettings;
	toolbar: ToolbarSettings;
	typewriter: TypewriterSettings;
	writingFocus: WritingFocusSettings;
	writingMode: WritingModeSettings;
}

// Typesafe dotted-path type for accessing nested settings
// e.g. "typewriter.isTypewriterScrollEnabled", "general.version"
export type SettingsPath = {
	[C in keyof UnisastraSettings]: `${C & string}.${keyof UnisastraSettings[C] & string}`;
}[keyof UnisastraSettings];

export type SettingValueAtPath<P extends SettingsPath> = P extends `${infer C}.${infer K}`
	? C extends keyof UnisastraSettings
		? K extends keyof UnisastraSettings[C]
			? UnisastraSettings[C][K]
			: never
		: never
	: never;

export function getSettingByPath<P extends SettingsPath>(
	settings: UnisastraSettings,
	path: P,
): SettingValueAtPath<P> {
	const dot = path.indexOf(".");
	const category = path.slice(0, dot) as keyof UnisastraSettings;
	const key = path.slice(dot + 1);
	return settings[category][key as never] as SettingValueAtPath<P>;
}

export function setSettingByPath<P extends SettingsPath>(
	settings: UnisastraSettings,
	path: P,
	value: SettingValueAtPath<P>,
): void {
	const dot = path.indexOf(".");
	const category = path.slice(0, dot) as keyof UnisastraSettings;
	const key = path.slice(dot + 1);
	// @ts-expect-error
	settings[category][key] = value;
}

export const DEFAULT_SETTINGS: UnisastraSettings = {
	toolbar: DEFAULT_TOOLBAR_SETTINGS,
	callouts: DEFAULT_CALLOUT_SETTINGS,
	general: {
		version: null,
		isAnnounceUpdatesEnabled: false,
		isPluginActivated: true,
		isOnlyActivateAfterFirstInteractionEnabled: false,
		isMononoteEnabled: false,
		isSidebarEqualResizeEnabled: false,
		enabledPlatforms: ENABLED_PLATFORMS.BOTH,
	},
	typewriter: {
		isTypewriterScrollEnabled: true,
		isOnlyMaintainTypewriterOffsetWhenReachedEnabled: false,
		isTypewriterOnlyUseCommandsEnabled: false,
		typewriterOffset: 0.5,
	},
	keepLinesAboveAndBelow: {
		isKeepLinesAboveAndBelowEnabled: false,
		linesAboveAndBelow: 5,
	},
	maxChars: {
		isMaxCharsPerLineEnabled: false,
		isWarnLongLineEnabled: false,
		maxCharsPerLine: 64,
		warnLongLineChars: 120,
	},
	dimming: {
		isDimUnfocusedEnabled: false,
		isDimHighlightListParentEnabled: false,
		isDimTableAsOneEnabled: true,
		dimUnfocusedMode: DIM_UNFOCUSED_MODE.PARAGRAPHS,
		dimUnfocusedEditorsBehavior: DIM_UNFOCUSED_EDITORS_BEHAVIOR.DIM,
		dimmedOpacity: 0.25,
		isPauseDimUnfocusedWhileScrollingEnabled: true,
		isPauseDimUnfocusedWhileSelectingEnabled: true,
	},
	currentLine: {
		isHighlightCurrentLineEnabled: false,
		isFadeLinesEnabled: false,
		fadeLinesIntensity: 0.5,
		isHighlightCurrentLineOnlyInFocusedEditorEnabled: false,
		isPauseCurrentLineHighlightWhileScrollingEnabled: false,
		isPauseCurrentLineHighlightWhileSelectingEnabled: false,
		currentLineHighlightStyle: CURRENT_LINE_HIGHLIGHT_STYLE.BOX,
		currentLineHighlightUnderlineThickness: 1,
		"currentLineHighlightColor-dark": "#444",
		"currentLineHighlightColor-light": "#ddd",
	},
	writingFocus: {
		doesWritingFocusShowHeader: false,
		doesWritingFocusShowStatusBar: false,
		isWritingFocusFullscreen: true,
		writingFocusFontSize: 0,
	},
	restoreCursorPosition: {
		isRestoreCursorPositionEnabled: false,
		cursorPositions: {},
	},
	hemingwayMode: {
		isHemingwayModeEnabled: false,
		isAllowBackspaceInHemingwayModeEnabled: false,
		isAllowArrowLeftInHemingwayModeEnabled: false,
		isAllowArrowRightInHemingwayModeEnabled: true,
		isAllowArrowUpInHemingwayModeEnabled: false,
		isAllowArrowDownInHemingwayModeEnabled: false,
		isAllowHomeInHemingwayModeEnabled: false,
		isAllowEndInHemingwayModeEnabled: false,
		isAllowPageUpInHemingwayModeEnabled: false,
		isAllowPageDownInHemingwayModeEnabled: false,
		isAllowDeleteInHemingwayModeEnabled: false,
		isAllowUndoInHemingwayModeEnabled: false,
		isShowHemingwayModeStatusBarEnabled: true,
		hemingwayModeStatusBarText: "Hemingway",
	},
	showWhitespace: {
		isShowWhitespaceEnabled: false,
		isShowSpacesEnabled: true,
		isShowTabsEnabled: true,
		isShowTrailingEnabled: true,
		isShowStrictLineBreakEnabled: true,
	},
	outliner: {
		isOutlinerEnabled: true,
		isOutlinerOnClickEnabled: true,
		isKeyboardOpsEnabled: false,
		isCursorStickEnabled: false,
		isSmartEnterEnabled: false,
		isSmartTabEnabled: false,
		isSmartSelectEnabled: false,
		isSidebarOutlineEnabled: false,
		sidebarCollapseState: {},
		sidebarFilterMode: "all",
		sidebarFilterModeByFile: {},
	},
	blockId: {
		isBlockIdEnabled: false,
		isAutoGenerateOnFoldEnabled: false,
		isHideIdsInLivePreviewEnabled: false,
	},
	foldPersist: {
		isFoldPersistEnabled: false,
		foldState: {},
	},
	compatibility: {
		isGFMAnchorCompatibilityEnabled: true,
	},
	writingMode: {
		activeMode: "none",
		presets: {
			idea: {
				outliner: true,
				hemingwayMode: true,
				writingFocus: true,
				typewriter: false,
				dimming: false,
				currentLine: false,
				showWhitespace: false,
				maxChars: false,
			},
			writing: {
				outliner: false,
				hemingwayMode: false,
				writingFocus: true,
				typewriter: true,
				dimming: true,
				currentLine: false,
				showWhitespace: false,
				maxChars: false,
			},
			editing: {
				outliner: false,
				hemingwayMode: false,
				writingFocus: false,
				typewriter: false,
				dimming: false,
				currentLine: true,
				showWhitespace: true,
				maxChars: true,
			},
			normal: {
				outliner: true,
				hemingwayMode: false,
				writingFocus: false,
				typewriter: false,
				dimming: false,
				currentLine: false,
				showWhitespace: false,
				maxChars: false,
			},
		},
	},
};

// Legacy flat settings structure for migration
interface LegacyUnisastraSettings {
	"currentLineHighlightColor-dark": string;
	"currentLineHighlightColor-light": string;
	currentLineHighlightStyle: CurrentLineHighlightStyle;
	currentLineHighlightUnderlineThickness: number;
	dimmedOpacity: number;
	dimUnfocusedEditorsBehavior: DimUnfocusedEditorsBehavior;
	dimUnfocusedMode: DimUnfocusedMode;
	doesWritingFocusShowHeader: boolean;
	doesWritingFocusShowStatusBar: boolean;
	fadeLinesIntensity: number;
	hemingwayModeStatusBarText: string;
	isAllowBackspaceInHemingwayModeEnabled: boolean;
	isAnnounceUpdatesEnabled: boolean;
	isDimHighlightListParentEnabled: boolean;
	isDimTableAsOneEnabled: boolean;
	isDimUnfocusedEnabled: boolean;
	isFadeLinesEnabled: boolean;
	isHemingwayModeEnabled: boolean;
	isHighlightCurrentLineEnabled: boolean;
	isHighlightCurrentLineOnlyInFocusedEditorEnabled: boolean;
	isKeepLinesAboveAndBelowEnabled: boolean;
	isMaxCharsPerLineEnabled: boolean;
	isOnlyActivateAfterFirstInteractionEnabled: boolean;
	isOnlyMaintainTypewriterOffsetWhenReachedEnabled: boolean;
	isPauseDimUnfocusedWhileScrollingEnabled: boolean;
	isPauseDimUnfocusedWhileSelectingEnabled: boolean;
	isPluginActivated: boolean;
	isRestoreCursorPositionEnabled: boolean;
	isShowHemingwayModeStatusBarEnabled: boolean;
	isTypewriterOnlyUseCommandsEnabled: boolean;
	isTypewriterScrollEnabled: boolean;
	isWritingFocusFullscreen: boolean;
	linesAboveAndBelow: number;
	maxCharsPerLine: number;
	typewriterOffset: number;
	version: string | null;
	writingFocusFontSize: number;
}

// Migration function to convert legacy flat settings to new grouped settings
function migrateGeneralSettings(legacy: Partial<LegacyUnisastraSettings>) {
	return {
		version: legacy.version ?? DEFAULT_SETTINGS.general.version,
		isAnnounceUpdatesEnabled:
			legacy.isAnnounceUpdatesEnabled ?? DEFAULT_SETTINGS.general.isAnnounceUpdatesEnabled,
		isPluginActivated: legacy.isPluginActivated ?? DEFAULT_SETTINGS.general.isPluginActivated,
		isOnlyActivateAfterFirstInteractionEnabled:
			legacy.isOnlyActivateAfterFirstInteractionEnabled ??
			DEFAULT_SETTINGS.general.isOnlyActivateAfterFirstInteractionEnabled,
		isMononoteEnabled: DEFAULT_SETTINGS.general.isMononoteEnabled,
		isSidebarEqualResizeEnabled: DEFAULT_SETTINGS.general.isSidebarEqualResizeEnabled,
		enabledPlatforms: DEFAULT_SETTINGS.general.enabledPlatforms,
	};
}

function migrateTypewriterSettings(legacy: Partial<LegacyUnisastraSettings>) {
	return {
		isTypewriterScrollEnabled:
			legacy.isTypewriterScrollEnabled ?? DEFAULT_SETTINGS.typewriter.isTypewriterScrollEnabled,
		isOnlyMaintainTypewriterOffsetWhenReachedEnabled:
			legacy.isOnlyMaintainTypewriterOffsetWhenReachedEnabled ??
			DEFAULT_SETTINGS.typewriter.isOnlyMaintainTypewriterOffsetWhenReachedEnabled,
		isTypewriterOnlyUseCommandsEnabled:
			legacy.isTypewriterOnlyUseCommandsEnabled ??
			DEFAULT_SETTINGS.typewriter.isTypewriterOnlyUseCommandsEnabled,
		typewriterOffset: legacy.typewriterOffset ?? DEFAULT_SETTINGS.typewriter.typewriterOffset,
	};
}

function migrateDimmingSettings(legacy: Partial<LegacyUnisastraSettings>) {
	return {
		isDimUnfocusedEnabled:
			legacy.isDimUnfocusedEnabled ?? DEFAULT_SETTINGS.dimming.isDimUnfocusedEnabled,
		isDimHighlightListParentEnabled:
			legacy.isDimHighlightListParentEnabled ??
			DEFAULT_SETTINGS.dimming.isDimHighlightListParentEnabled,
		isDimTableAsOneEnabled:
			legacy.isDimTableAsOneEnabled ?? DEFAULT_SETTINGS.dimming.isDimTableAsOneEnabled,
		dimUnfocusedMode: legacy.dimUnfocusedMode ?? DEFAULT_SETTINGS.dimming.dimUnfocusedMode,
		dimUnfocusedEditorsBehavior:
			legacy.dimUnfocusedEditorsBehavior ?? DEFAULT_SETTINGS.dimming.dimUnfocusedEditorsBehavior,
		dimmedOpacity: legacy.dimmedOpacity ?? DEFAULT_SETTINGS.dimming.dimmedOpacity,
		isPauseDimUnfocusedWhileScrollingEnabled:
			legacy.isPauseDimUnfocusedWhileScrollingEnabled ??
			DEFAULT_SETTINGS.dimming.isPauseDimUnfocusedWhileScrollingEnabled,
		isPauseDimUnfocusedWhileSelectingEnabled:
			legacy.isPauseDimUnfocusedWhileSelectingEnabled ??
			DEFAULT_SETTINGS.dimming.isPauseDimUnfocusedWhileSelectingEnabled,
	};
}

function migrateCurrentLineSettings(legacy: Partial<LegacyUnisastraSettings>) {
	return {
		isHighlightCurrentLineEnabled:
			legacy.isHighlightCurrentLineEnabled ??
			DEFAULT_SETTINGS.currentLine.isHighlightCurrentLineEnabled,
		isFadeLinesEnabled:
			legacy.isFadeLinesEnabled ?? DEFAULT_SETTINGS.currentLine.isFadeLinesEnabled,
		fadeLinesIntensity:
			legacy.fadeLinesIntensity ?? DEFAULT_SETTINGS.currentLine.fadeLinesIntensity,
		isHighlightCurrentLineOnlyInFocusedEditorEnabled:
			legacy.isHighlightCurrentLineOnlyInFocusedEditorEnabled ??
			DEFAULT_SETTINGS.currentLine.isHighlightCurrentLineOnlyInFocusedEditorEnabled,
		isPauseCurrentLineHighlightWhileScrollingEnabled:
			DEFAULT_SETTINGS.currentLine.isPauseCurrentLineHighlightWhileScrollingEnabled,
		isPauseCurrentLineHighlightWhileSelectingEnabled:
			DEFAULT_SETTINGS.currentLine.isPauseCurrentLineHighlightWhileSelectingEnabled,
		currentLineHighlightStyle:
			legacy.currentLineHighlightStyle ?? DEFAULT_SETTINGS.currentLine.currentLineHighlightStyle,
		currentLineHighlightUnderlineThickness:
			legacy.currentLineHighlightUnderlineThickness ??
			DEFAULT_SETTINGS.currentLine.currentLineHighlightUnderlineThickness,
		"currentLineHighlightColor-dark":
			legacy["currentLineHighlightColor-dark"] ??
			DEFAULT_SETTINGS.currentLine["currentLineHighlightColor-dark"],
		"currentLineHighlightColor-light":
			legacy["currentLineHighlightColor-light"] ??
			DEFAULT_SETTINGS.currentLine["currentLineHighlightColor-light"],
	};
}

function migrateWritingFocusSettings(legacy: Partial<LegacyUnisastraSettings>) {
	return {
		doesWritingFocusShowHeader:
			legacy.doesWritingFocusShowHeader ?? DEFAULT_SETTINGS.writingFocus.doesWritingFocusShowHeader,
		doesWritingFocusShowStatusBar:
			legacy.doesWritingFocusShowStatusBar ??
			DEFAULT_SETTINGS.writingFocus.doesWritingFocusShowStatusBar,
		isWritingFocusFullscreen:
			legacy.isWritingFocusFullscreen ?? DEFAULT_SETTINGS.writingFocus.isWritingFocusFullscreen,
		writingFocusFontSize:
			legacy.writingFocusFontSize ?? DEFAULT_SETTINGS.writingFocus.writingFocusFontSize,
	};
}

function migrateHemingwaySettings(legacy: Partial<LegacyUnisastraSettings>) {
	return {
		isHemingwayModeEnabled:
			legacy.isHemingwayModeEnabled ?? DEFAULT_SETTINGS.hemingwayMode.isHemingwayModeEnabled,
		isAllowBackspaceInHemingwayModeEnabled:
			legacy.isAllowBackspaceInHemingwayModeEnabled ??
			DEFAULT_SETTINGS.hemingwayMode.isAllowBackspaceInHemingwayModeEnabled,
		isAllowArrowLeftInHemingwayModeEnabled:
			DEFAULT_SETTINGS.hemingwayMode.isAllowArrowLeftInHemingwayModeEnabled,
		isAllowArrowRightInHemingwayModeEnabled:
			DEFAULT_SETTINGS.hemingwayMode.isAllowArrowRightInHemingwayModeEnabled,
		isAllowArrowUpInHemingwayModeEnabled:
			DEFAULT_SETTINGS.hemingwayMode.isAllowArrowUpInHemingwayModeEnabled,
		isAllowArrowDownInHemingwayModeEnabled:
			DEFAULT_SETTINGS.hemingwayMode.isAllowArrowDownInHemingwayModeEnabled,
		isAllowHomeInHemingwayModeEnabled:
			DEFAULT_SETTINGS.hemingwayMode.isAllowHomeInHemingwayModeEnabled,
		isAllowEndInHemingwayModeEnabled:
			DEFAULT_SETTINGS.hemingwayMode.isAllowEndInHemingwayModeEnabled,
		isAllowPageUpInHemingwayModeEnabled:
			DEFAULT_SETTINGS.hemingwayMode.isAllowPageUpInHemingwayModeEnabled,
		isAllowPageDownInHemingwayModeEnabled:
			DEFAULT_SETTINGS.hemingwayMode.isAllowPageDownInHemingwayModeEnabled,
		isAllowDeleteInHemingwayModeEnabled:
			DEFAULT_SETTINGS.hemingwayMode.isAllowDeleteInHemingwayModeEnabled,
		isAllowUndoInHemingwayModeEnabled:
			DEFAULT_SETTINGS.hemingwayMode.isAllowUndoInHemingwayModeEnabled,
		isShowHemingwayModeStatusBarEnabled:
			legacy.isShowHemingwayModeStatusBarEnabled ??
			DEFAULT_SETTINGS.hemingwayMode.isShowHemingwayModeStatusBarEnabled,
		hemingwayModeStatusBarText:
			legacy.hemingwayModeStatusBarText ??
			DEFAULT_SETTINGS.hemingwayMode.hemingwayModeStatusBarText,
	};
}

function migrateSettings(legacy: Partial<LegacyUnisastraSettings>): UnisastraSettings {
	return {
		toolbar: normalizeToolbarSettings(undefined),
		callouts: normalizeCalloutSettings(undefined),
		general: migrateGeneralSettings(legacy),
		typewriter: migrateTypewriterSettings(legacy),
		keepLinesAboveAndBelow: {
			isKeepLinesAboveAndBelowEnabled:
				legacy.isKeepLinesAboveAndBelowEnabled ??
				DEFAULT_SETTINGS.keepLinesAboveAndBelow.isKeepLinesAboveAndBelowEnabled,
			linesAboveAndBelow:
				legacy.linesAboveAndBelow ?? DEFAULT_SETTINGS.keepLinesAboveAndBelow.linesAboveAndBelow,
		},
		maxChars: {
			isMaxCharsPerLineEnabled:
				legacy.isMaxCharsPerLineEnabled ?? DEFAULT_SETTINGS.maxChars.isMaxCharsPerLineEnabled,
			maxCharsPerLine: legacy.maxCharsPerLine ?? DEFAULT_SETTINGS.maxChars.maxCharsPerLine,
			isWarnLongLineEnabled: DEFAULT_SETTINGS.maxChars.isWarnLongLineEnabled,
			warnLongLineChars: DEFAULT_SETTINGS.maxChars.warnLongLineChars,
		},
		dimming: migrateDimmingSettings(legacy),
		currentLine: migrateCurrentLineSettings(legacy),
		writingFocus: migrateWritingFocusSettings(legacy),
		restoreCursorPosition: {
			isRestoreCursorPositionEnabled:
				legacy.isRestoreCursorPositionEnabled ??
				DEFAULT_SETTINGS.restoreCursorPosition.isRestoreCursorPositionEnabled,
			cursorPositions: {},
		},
		hemingwayMode: migrateHemingwaySettings(legacy),
		showWhitespace: { ...DEFAULT_SETTINGS.showWhitespace },
		outliner: { ...DEFAULT_SETTINGS.outliner },
		blockId: { ...DEFAULT_SETTINGS.blockId },
		foldPersist: { ...DEFAULT_SETTINGS.foldPersist },
		compatibility: { ...DEFAULT_SETTINGS.compatibility },
		writingMode: { ...DEFAULT_SETTINGS.writingMode },
	};
}

function mergeWritingModeSettings(
	settings: Partial<WritingModeSettings> | undefined,
): WritingModeSettings {
	return {
		...DEFAULT_SETTINGS.writingMode,
		...settings,
		presets: {
			idea: {
				...DEFAULT_SETTINGS.writingMode.presets.idea,
				...settings?.presets?.idea,
			},
			writing: {
				...DEFAULT_SETTINGS.writingMode.presets.writing,
				...settings?.presets?.writing,
			},
			editing: {
				...DEFAULT_SETTINGS.writingMode.presets.editing,
				...settings?.presets?.editing,
			},
			normal: {
				...DEFAULT_SETTINGS.writingMode.presets.normal,
				...settings?.presets?.normal,
			},
		},
	};
}

// Migration function to copy cursor positions from old file to settings
// Only needed when coming from pre-v1.2.0 (legacy flat format)
async function migrateCursorPositions(
	settings: UnisastraSettings,
	vault: Vault,
	manifestDir: string,
): Promise<UnisastraSettings> {
	const oldFilePath = `${manifestDir}/cursor-positions.json`;

	try {
		if (await vault.adapter.exists(oldFilePath)) {
			const data = await vault.adapter.read(oldFilePath);
			const cursorPositions = JSON.parse(data);
			settings.restoreCursorPosition.cursorPositions = cursorPositions;
		}
	} catch (error) {
		console.error("Failed to migrate cursor positions:", error);
	}

	return settings;
}

// Apply all startup migrations in a single pass, version-gated via the general.version key.
// Cursor position migration (from cursor-positions.json) is only needed for pre-v1.2.0 data
// which is identified by the absence of the top-level "general" key.
export async function applyStartupMigrations(
	rawData: Partial<LegacyUnisastraSettings> | Partial<UnisastraSettings>,
	vault: Vault,
	manifestDir: string,
): Promise<UnisastraSettings> {
	const isLegacyFormat = !("general" in rawData);

	// Cursor positions migration only needed when coming from pre-v1.2.0 (legacy flat format).
	// Since v1.2.0 cursor positions are stored directly in data.json.
	if (isLegacyFormat) {
		const settings = migrateSettings(rawData as Partial<LegacyUnisastraSettings>);
		return await migrateCursorPositions(settings, vault, manifestDir);
	}

	// Deep-merge with defaults so new settings groups get their defaults
	// when existing users upgrade
	const settings = rawData as Partial<UnisastraSettings> & {
		zoom?: {
			isZoomEnabled?: boolean;
			isZoomOnClickEnabled?: boolean;
		};
	};

	// Migrate zoom → outliner (introduced when zoom was renamed to outliner)
	if ("zoom" in settings && !("outliner" in settings) && settings.zoom) {
		const z = settings.zoom;
		(settings as Record<string, unknown>).outliner = {
			isOutlinerEnabled: z.isZoomEnabled ?? DEFAULT_SETTINGS.outliner.isOutlinerEnabled,
			isOutlinerOnClickEnabled:
				z.isZoomOnClickEnabled ?? DEFAULT_SETTINGS.outliner.isOutlinerOnClickEnabled,
		};
		(settings as Record<string, unknown>).zoom = undefined;
	}

	const merged: UnisastraSettings = { ...DEFAULT_SETTINGS };
	for (const key of Object.keys(DEFAULT_SETTINGS) as Array<keyof UnisastraSettings>) {
		if (settings[key] !== undefined) {
			if (key === "writingMode") {
				merged.writingMode = mergeWritingModeSettings(settings.writingMode);
				continue;
			}

			// @ts-expect-error — merging category objects
			merged[key] = { ...DEFAULT_SETTINGS[key], ...settings[key] };
		}
	}
	merged.toolbar = normalizeToolbarSettings(settings.toolbar);
	merged.callouts = normalizeCalloutSettings(settings.callouts);
	merged.foldPersist.foldState = normalizeFoldState(merged.foldPersist.foldState);
	return merged;
}
