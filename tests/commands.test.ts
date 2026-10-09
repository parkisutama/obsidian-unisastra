// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import type { TransactionSpec } from "@codemirror/state";
import { EditorState } from "@codemirror/state";
import { describe, expect, it, vi } from "vitest";
import {
	ManageCalloutsCommand,
	toolbarActionCommands,
} from "@/capabilities/commands/toolbar-actions";
import { DEFAULT_SETTINGS } from "@/capabilities/settings";

vi.mock("obsidian", () => ({
	ItemView: class ItemView {},
	Notice: class Notice {
		readonly message: string;

		constructor(message: string) {
			this.message = message;
		}
	},
	Platform: {
		isMobile: false,
	},
}));

const featureToggle = {
	getSettingValue: () => false,
	toggle: vi.fn(),
};

const createFeatureGroup = () =>
	new Proxy<Record<string, unknown>>(
		{},
		{
			get: () => featureToggle,
		},
	);

describe("command registration", () => {
	it("does not register duplicate Obsidian command ids", async () => {
		const registeredIds: string[] = [];
		const { getCommands } = await import("@/capabilities/commands");
		const tm = {
			features: {
				dimming: createFeatureGroup(),
				general: createFeatureGroup(),
				hemingwayMode: createFeatureGroup(),
				showWhitespace: createFeatureGroup(),
				typewriter: createFeatureGroup(),
				writingModes: createFeatureGroup(),
			},
			plugin: {
				addCommand: ({ id }: { id: string }) => {
					registeredIds.push(id);
				},
				addRibbonIcon: vi.fn(),
				app: {
					workspace: {
						containerEl: {
							hasClass: () => false,
							removeClass: vi.fn(),
							toggleClass: vi.fn(),
						},
						getActiveViewOfType: () => null,
						leftSplit: {
							collapse: vi.fn(),
							collapsed: false,
							expand: vi.fn(),
						},
						rightSplit: {
							collapse: vi.fn(),
							collapsed: false,
							expand: vi.fn(),
						},
					},
				},
			},
			saveSettings: vi.fn(),
			settings: structuredClone(DEFAULT_SETTINGS),
		};

		const commands = Object.values(getCommands(tm as never));
		const commandKeys = commands.map((command) => command.commandKey);

		for (const command of commands) {
			command.load();
		}

		expect(new Set(commandKeys).size).toBe(commandKeys.length);
		expect(new Set(registeredIds).size).toBe(registeredIds.length);
		expect(registeredIds.length).toBeGreaterThan(commandKeys.length);
		expect(registeredIds).toContain("unisastra-plugin-toggle");
		expect(registeredIds.some((id) => id.includes("md-writer"))).toBe(false);
	});

	it("activates a writing mode through the command palette command", async () => {
		const callbacks = new Map<string, () => void>();
		const applyMode = vi.fn();
		const { getCommands } = await import("@/capabilities/commands");
		const tm = {
			features: {
				dimming: createFeatureGroup(),
				general: createFeatureGroup(),
				hemingwayMode: createFeatureGroup(),
				showWhitespace: createFeatureGroup(),
				typewriter: createFeatureGroup(),
				writingModes: {
					"writingMode.activeMode": { applyMode },
				},
			},
			plugin: {
				addCommand: ({ callback, id }: { callback: () => void; id: string }) => {
					callbacks.set(id, callback);
				},
				addRibbonIcon: vi.fn(),
				app: {
					workspace: {
						containerEl: {
							hasClass: () => false,
							removeClass: vi.fn(),
							toggleClass: vi.fn(),
						},
						getActiveViewOfType: () => null,
						leftSplit: {
							collapse: vi.fn(),
							collapsed: false,
							expand: vi.fn(),
						},
						rightSplit: {
							collapse: vi.fn(),
							collapsed: false,
							expand: vi.fn(),
						},
					},
				},
			},
			saveSettings: vi.fn().mockResolvedValue(undefined),
			settings: structuredClone(DEFAULT_SETTINGS),
		};

		for (const command of Object.values(getCommands(tm as never))) {
			command.load();
		}

		callbacks.get("set-writing-mode-writing")?.();

		expect(applyMode).toHaveBeenCalledWith("writing");
		expect(tm.saveSettings).toHaveBeenCalled();
	});

	it("applies preset features when activating a writing mode", async () => {
		const toggles = {
			currentLine: vi.fn(),
			dimming: vi.fn(),
			hemingwayMode: vi.fn(),
			maxChar: vi.fn(),
			outliner: vi.fn(),
			showWhitespace: vi.fn(),
			typewriter: vi.fn(),
			writingFocus: vi.fn(),
		};
		const { default: WritingModeActive } = await import(
			"@/capabilities/features/writing-modes/active-mode"
		);
		const tm = {
			features: {
				currentLine: {
					"currentLine.isHighlightCurrentLineEnabled": {
						applyValue: toggles.currentLine,
					},
				},
				dimming: {
					"dimming.isDimUnfocusedEnabled": { applyValue: toggles.dimming },
				},
				hemingwayMode: {
					"hemingwayMode.isHemingwayModeEnabled": {
						applyValue: toggles.hemingwayMode,
					},
				},
				maxChar: {
					"maxChars.isMaxCharsPerLineEnabled": { applyValue: toggles.maxChar },
				},
				outliner: {
					"outliner.isOutlinerEnabled": { applyValue: toggles.outliner },
				},
				showWhitespace: {
					"showWhitespace.isShowWhitespaceEnabled": {
						applyValue: toggles.showWhitespace,
					},
				},
				typewriter: {
					"typewriter.isTypewriterScrollEnabled": {
						applyValue: toggles.typewriter,
					},
				},
			},
			commands: {
				"writing-focus": {
					setWritingFocusEnabled: toggles.writingFocus,
				},
			},
			settings: structuredClone(DEFAULT_SETTINGS),
		};

		new WritingModeActive(tm as never).applyMode("editing");

		expect(tm.settings.writingMode.activeMode).toBe("editing");
		expect(toggles.outliner).toHaveBeenCalledWith(false);
		expect(toggles.hemingwayMode).toHaveBeenCalledWith(false);
		expect(toggles.typewriter).toHaveBeenCalledWith(false);
		expect(toggles.dimming).toHaveBeenCalledWith(false);
		expect(toggles.currentLine).toHaveBeenCalledWith(true);
		expect(toggles.showWhitespace).toHaveBeenCalledWith(true);
		expect(toggles.maxChar).toHaveBeenCalledWith(true);
		expect(toggles.writingFocus).toHaveBeenCalledWith(false);
	});

	it("keeps live feature states unchanged when switching to manual mode", async () => {
		const toggle = vi.fn();
		const { default: WritingModeActive } = await import(
			"@/capabilities/features/writing-modes/active-mode"
		);
		const tm = {
			features: {
				outliner: {
					"outliner.isOutlinerEnabled": { toggle },
				},
			},
			settings: structuredClone(DEFAULT_SETTINGS),
		};

		new WritingModeActive(tm as never).applyMode("none");

		expect(tm.settings.writingMode.activeMode).toBe("none");
		expect(toggle).not.toHaveBeenCalled();
	});

	it.each(["normal", "writing"] as const)(
		"applies the requested default recipe for %s",
		async (mode) => {
			const toggles = {
				currentLine: vi.fn(),
				dimming: vi.fn(),
				hemingwayMode: vi.fn(),
				maxChar: vi.fn(),
				outliner: vi.fn(),
				showWhitespace: vi.fn(),
				typewriter: vi.fn(),
				writingFocus: vi.fn(),
			};
			const { default: WritingModeActive } = await import(
				"@/capabilities/features/writing-modes/active-mode"
			);
			const tm = {
				features: {
					currentLine: {
						"currentLine.isHighlightCurrentLineEnabled": {
							applyValue: toggles.currentLine,
						},
					},
					dimming: {
						"dimming.isDimUnfocusedEnabled": { applyValue: toggles.dimming },
					},
					hemingwayMode: {
						"hemingwayMode.isHemingwayModeEnabled": {
							applyValue: toggles.hemingwayMode,
						},
					},
					maxChar: {
						"maxChars.isMaxCharsPerLineEnabled": {
							applyValue: toggles.maxChar,
						},
					},
					outliner: {
						"outliner.isOutlinerEnabled": { applyValue: toggles.outliner },
					},
					showWhitespace: {
						"showWhitespace.isShowWhitespaceEnabled": {
							applyValue: toggles.showWhitespace,
						},
					},
					typewriter: {
						"typewriter.isTypewriterScrollEnabled": {
							applyValue: toggles.typewriter,
						},
					},
				},
				commands: {
					"writing-focus": {
						setWritingFocusEnabled: toggles.writingFocus,
					},
				},
				settings: structuredClone(DEFAULT_SETTINGS),
			};

			new WritingModeActive(tm as never).applyMode(mode);

			expect(tm.settings.writingMode.activeMode).toBe(mode);
			expect(toggles.outliner).toHaveBeenCalledWith(mode === "normal");
			expect(toggles.hemingwayMode).toHaveBeenCalledWith(false);
			expect(toggles.typewriter).toHaveBeenCalledWith(mode === "writing");
			expect(toggles.dimming).toHaveBeenCalledWith(mode === "writing");
			expect(toggles.currentLine).toHaveBeenCalledWith(false);
			expect(toggles.showWhitespace).toHaveBeenCalledWith(false);
			expect(toggles.maxChar).toHaveBeenCalledWith(false);
			expect(toggles.writingFocus).toHaveBeenCalledWith(mode === "writing");
		},
	);
});

describe("toolbar action commands", () => {
	type CheckCallback = (checking: boolean, editor: unknown, ctx: unknown) => boolean;

	function fakeToolbarTarget(text = "hello", from = 0, to = text.length) {
		let state = EditorState.create({
			doc: text,
			selection: { anchor: from, head: to },
		});
		return {
			get state() {
				return state;
			},
			dispatch: (spec: TransactionSpec) => {
				state = state.update(spec).state;
			},
			policy: () => ({
				enabled: true,
				current: true,
				hemingway: false,
				smartUrl: false,
				visible: { from: 0, to: 10_000 },
			}),
			text: () => state.doc.toString(),
		};
	}

	it("hides toolbar action commands from the palette on mobile", async () => {
		const { Platform } = await import("obsidian");
		(Platform as { isMobile: boolean }).isMobile = true;
		try {
			let checkCallback: CheckCallback | undefined;
			const tm = {
				plugin: {
					addCommand: ({ editorCheckCallback }: { editorCheckCallback: CheckCallback }) => {
						checkCallback = editorCheckCallback;
					},
				},
				toolbar: { target: vi.fn() },
			};
			const [command] = toolbarActionCommands(tm as never);
			command.load();
			expect(checkCallback?.(true, { cm: {} }, {})).toBe(false);
		} finally {
			(Platform as { isMobile: boolean }).isMobile = false;
		}
	});

	it("hides the command when the active editor has no live CM6 view to target", () => {
		let checkCallback: CheckCallback | undefined;
		const tm = {
			plugin: {
				addCommand: ({ editorCheckCallback }: { editorCheckCallback: CheckCallback }) => {
					checkCallback = editorCheckCallback;
				},
			},
			toolbar: { target: vi.fn() },
		};
		const [command] = toolbarActionCommands(tm as never);
		command.load();
		expect(checkCallback?.(true, {}, {})).toBe(false);
	});

	it("executes the same executor/guards the toolbar uses when invoked from the palette", () => {
		let checkCallback: CheckCallback | undefined;
		const fake = fakeToolbarTarget("hello", 0, 5);
		const tm = {
			plugin: {
				addCommand: ({ editorCheckCallback }: { editorCheckCallback: CheckCallback }) => {
					checkCallback = editorCheckCallback;
				},
			},
			toolbar: { target: () => fake },
		};
		const commands = toolbarActionCommands(tm as never);
		const bold = commands.find((command) => command.commandKey === "floaty-bold");
		bold?.load();
		expect(checkCallback?.(false, { cm: {} }, {})).toBe(true);
		expect(fake.text()).toBe("**hello**");
	});

	it("registers every upstream-parity command ID uniquely, including all five callout types", () => {
		const registered: string[] = [];
		const tm = {
			plugin: {
				addCommand: ({ id }: { id: string }) => {
					registered.push(id);
				},
			},
			toolbar: { target: vi.fn() },
		};
		for (const command of toolbarActionCommands(tm as never)) {
			command.load();
		}
		expect(new Set(registered).size).toBe(registered.length);
		for (const id of [
			"floaty-bold",
			"floaty-italic",
			"floaty-strikethrough",
			"floaty-inline-code",
			"floaty-highlight",
			"floaty-insert-link",
			"floaty-heading-1",
			"floaty-heading-2",
			"floaty-heading-3",
			"floaty-heading-4",
			"floaty-heading-plain",
			"floaty-callout-note",
			"floaty-callout-tip",
			"floaty-callout-warning",
			"floaty-callout-important",
			"floaty-callout-caution",
		]) {
			expect(registered).toContain(id);
		}
	});

	it("opens the callout manager via the manage-callouts command", () => {
		const openCalloutManager = vi.fn();
		let callback: (() => void) | undefined;
		const tm = {
			plugin: {
				addCommand: ({ callback: cb, id }: { callback: () => void; id: string }) => {
					if (id === "manage-callouts") {
						callback = cb;
					}
				},
			},
			openCalloutManager,
		};
		new ManageCalloutsCommand(tm as never).load();
		callback?.();
		expect(openCalloutManager).toHaveBeenCalled();
	});
});
