// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { Compartment, type Extension, type StateEffect } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import type { OutlinerSettings } from "@/capabilities/settings";
import { createClickOnBulletHandler } from "./click-on-bullet";
import { createBoundaryViolationDetector } from "./detect-boundary-violation";
import {
	limitSelectionOnOutlinerFocus,
	limitSelectionWhenOutlinerFocused,
} from "./limit-selection";
import { getOutlinerExtension } from "./state-field";
import { dispatchOutlinerUnfocus } from "./utils";

const outlinerCoreCmpt = new Compartment();
const outlinerClickCmpt = new Compartment();

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

export function createOutlinerExtension(
	settings: OutlinerSettings,
	onFocus: (view: EditorView, pos: number) => void,
): Extension {
	return [
		outlinerCoreCmpt.of(buildCoreExtension(settings.isOutlinerEnabled)),
		outlinerClickCmpt.of(
			buildClickExtension(settings.isOutlinerOnClickEnabled, settings.isOutlinerEnabled, onFocus),
		),
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
	];
}
