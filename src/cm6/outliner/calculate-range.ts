// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type { EditorState } from "@codemirror/state";
import { calculateOutlinerRange as lezerCalculateRange } from "@/cm6/list-service";

export function calculateOutlinerRange(
	state: EditorState,
	pos: number,
): { from: number; to: number } | null {
	return lezerCalculateRange(state, pos);
}
