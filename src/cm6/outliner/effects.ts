// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Adapted from Obsidian Zoom (https://github.com/vslinko/obsidian-zoom): src/logic/utils/effects.ts
// Copyright (c) 2021 Viacheslav Slinko
// Modifications Copyright (C) 2025-2026 Parkis Utama
// Full notice: third-party-notices/obsidian-zoom-MIT.txt

import { StateEffect as SE, type StateEffect } from "@codemirror/state";

export interface OutlinerRange {
	from: number;
	to: number;
}

export type OutlinerFocusEffect = StateEffect<OutlinerRange>;

export const outlinerFocusEffect = SE.define<OutlinerRange>();
export const outlinerUnfocusEffect = SE.define<void>();

export function isOutlinerFocusEffect(e: StateEffect<unknown>): e is OutlinerFocusEffect {
	return e.is(outlinerFocusEffect);
}
