import { Compartment, type Extension, type StateEffect } from "@codemirror/state";
import { type EditorView, keymap } from "@codemirror/view";
import type { OutlinerSettings } from "@/capabilities/settings";
import { resolveListItem } from "@/cm6/list-service";
import { createClickOnBulletHandler } from "./click-on-bullet";
import { createBoundaryViolationDetector } from "./detect-boundary-violation";
import {
	cursorStickHome,
	cursorStickLeft,
	moveListItemDown,
	moveListItemUp,
	smartEnter,
	smartSelectAll,
	smartShiftTab,
	smartTab,
} from "./keyboard-ops";
import {
	limitSelectionOnOutlinerFocus,
	limitSelectionWhenOutlinerFocused,
} from "./limit-selection";
import { getOutlinerExtension } from "./state-field";
import { dispatchOutlinerUnfocus } from "./utils";

const outlinerCoreCmpt = new Compartment();
const outlinerClickCmpt = new Compartment();
const outlinerKeyboardCmpt = new Compartment();
const outlinerSmartEnterCmpt = new Compartment();
const outlinerSmartTabCmpt = new Compartment();
const outlinerSmartSelectCmpt = new Compartment();
const outlinerCursorStickCmpt = new Compartment();

function buildCoreExtension(enabled: boolean): Extension {
	if (!enabled) {
		return [];
	}
	return [
		getOutlinerExtension(),
		limitSelectionOnOutlinerFocus,
		limitSelectionWhenOutlinerFocused,
		createBoundaryViolationDetector((view) => {
			dispatchOutlinerUnfocus(view);
		}),
	];
}

function buildClickExtension(
	enabled: boolean,
	outlinerEnabled: boolean,
	onFocus: (view: EditorView, pos: number) => void,
): Extension {
	if (!(enabled && outlinerEnabled)) {
		return [];
	}
	return createClickOnBulletHandler((view, pos) => {
		onFocus(view, pos);
	});
}

function buildKeyboardExtension(enabled: boolean): Extension {
	if (!enabled) {
		return [];
	}
	return keymap.of([
		{ key: "Mod-Shift-ArrowUp", run: moveListItemUp },
		{ key: "Mod-Shift-ArrowDown", run: moveListItemDown },
	]);
}

function buildSmartEnterExtension(enabled: boolean): Extension {
	if (!enabled) {
		return [];
	}
	return keymap.of([
		{
			key: "Enter",
			run: (view) => {
				const item = resolveListItem(view.state, view.state.selection.main.head);
				if (!item) {
					return false;
				}
				return smartEnter({ state: view.state, dispatch: view.dispatch });
			},
		},
	]);
}

function buildSmartTabExtension(enabled: boolean): Extension {
	if (!enabled) {
		return [];
	}
	return keymap.of([
		{
			key: "Tab",
			run: (view) => {
				const item = resolveListItem(view.state, view.state.selection.main.head);
				if (!item) {
					return false;
				}
				return smartTab({ state: view.state, dispatch: view.dispatch });
			},
		},
		{
			key: "Shift-Tab",
			run: (view) => {
				const item = resolveListItem(view.state, view.state.selection.main.head);
				if (!item) {
					return false;
				}
				return smartShiftTab({ state: view.state, dispatch: view.dispatch });
			},
		},
	]);
}

function buildSmartSelectExtension(enabled: boolean): Extension {
	if (!enabled) {
		return [];
	}
	return keymap.of([
		{
			key: "Mod-a",
			run: (view) => {
				return smartSelectAll({
					state: view.state,
					dispatch: view.dispatch,
				});
			},
		},
	]);
}

function buildCursorStickExtension(enabled: boolean): Extension {
	if (!enabled) {
		return [];
	}
	return keymap.of([
		{
			key: "ArrowLeft",
			run: (view) => {
				return cursorStickLeft({
					state: view.state,
					dispatch: view.dispatch,
				});
			},
		},
		{
			key: "Home",
			run: (view) => {
				return cursorStickHome({
					state: view.state,
					dispatch: view.dispatch,
				});
			},
		},
	]);
}

export function createOutlinerExtension(
	settings: OutlinerSettings,
	onFocus: (view: EditorView, pos: number) => void,
): Extension {
	return [
		outlinerCoreCmpt.of(buildCoreExtension(settings.isOutlinerEnabled)),
		outlinerClickCmpt.of(
			buildClickExtension(settings.isOutlinerOnClickEnabled, settings.isOutlinerEnabled, onFocus),
		),
		outlinerKeyboardCmpt.of(buildKeyboardExtension(settings.isKeyboardOpsEnabled ?? false)),
		outlinerSmartEnterCmpt.of(buildSmartEnterExtension(settings.isSmartEnterEnabled ?? false)),
		outlinerSmartTabCmpt.of(buildSmartTabExtension(settings.isSmartTabEnabled ?? false)),
		outlinerSmartSelectCmpt.of(buildSmartSelectExtension(settings.isSmartSelectEnabled ?? false)),
		outlinerCursorStickCmpt.of(buildCursorStickExtension(settings.isCursorStickEnabled ?? false)),
	];
}

export function getOutlinerReconfigureEffects(
	settings: OutlinerSettings,
	onFocus: (view: EditorView, pos: number) => void,
): StateEffect<unknown>[] {
	return [
		outlinerCoreCmpt.reconfigure(buildCoreExtension(settings.isOutlinerEnabled)),
		outlinerClickCmpt.reconfigure(
			buildClickExtension(settings.isOutlinerOnClickEnabled, settings.isOutlinerEnabled, onFocus),
		),
		outlinerKeyboardCmpt.reconfigure(
			buildKeyboardExtension(settings.isKeyboardOpsEnabled ?? false),
		),
		outlinerSmartEnterCmpt.reconfigure(
			buildSmartEnterExtension(settings.isSmartEnterEnabled ?? false),
		),
		outlinerSmartTabCmpt.reconfigure(buildSmartTabExtension(settings.isSmartTabEnabled ?? false)),
		outlinerSmartSelectCmpt.reconfigure(
			buildSmartSelectExtension(settings.isSmartSelectEnabled ?? false),
		),
		outlinerCursorStickCmpt.reconfigure(
			buildCursorStickExtension(settings.isCursorStickEnabled ?? false),
		),
	];
}
