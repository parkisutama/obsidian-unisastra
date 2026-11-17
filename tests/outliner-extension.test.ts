// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, type OutlinerSettings } from "@/capabilities/settings";
import { createOutlinerExtension } from "@/cm6/outliner";

// Settings as an old data.json may still hold them: the removed flags are all on.
const LEGACY_FLAGS_ON = {
	...DEFAULT_SETTINGS.outliner,
	isKeyboardOpsEnabled: true,
	isCursorStickEnabled: true,
	isSmartEnterEnabled: true,
	isSmartTabEnabled: true,
	isSmartSelectEnabled: true,
} as OutlinerSettings;

describe("createOutlinerExtension", () => {
	it("registers no editor keymap, even when legacy list flags are on", () => {
		const state = EditorState.create({
			extensions: createOutlinerExtension(LEGACY_FLAGS_ON, () => undefined),
		});
		const keys = state
			.facet(keymap)
			.flat()
			.map((binding) => binding.key ?? binding.mac ?? binding.win ?? binding.linux);
		expect(keys).toEqual([]);
	});
});
