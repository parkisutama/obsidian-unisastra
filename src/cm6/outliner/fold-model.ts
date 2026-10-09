// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { foldEffect, foldedRanges, unfoldEffect } from "@codemirror/language";
import type { EditorState, StateEffect } from "@codemirror/state";

export interface IdentifiedFold {
	from: number;
	id: string;
	to: number;
}

export function uniqueBlockIds(text: string): Set<string> {
	const counts = new Map<string, number>();
	for (const match of text.matchAll(/\s\^([\w-]+)[ \t]*$/gm)) {
		counts.set(match[1], (counts.get(match[1]) ?? 0) + 1);
	}
	return new Set(
		[...counts]
			.filter(([id, count]) => count === 1 && !Object.hasOwn(Object.prototype, id))
			.map(([id]) => id),
	);
}

export function captureFolds(state: EditorState, items: IdentifiedFold[]): Record<string, boolean> {
	const ranges = new Set<number>();
	for (let cursor = foldedRanges(state).iter(); cursor.value; cursor.next()) {
		ranges.add(cursor.from);
	}
	return Object.fromEntries(items.map((item) => [item.id, ranges.has(item.from)]));
}

export function restoreFolds(
	state: EditorState,
	items: IdentifiedFold[],
	saved: unknown,
): StateEffect<unknown>[] {
	if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
		return [];
	}
	const current = captureFolds(state, items);
	const snapshot = saved as Record<string, unknown>;
	return items.flatMap((item) => {
		if (
			!Object.hasOwn(snapshot, item.id) ||
			typeof snapshot[item.id] !== "boolean" ||
			snapshot[item.id] === current[item.id]
		) {
			return [];
		}
		return [
			(snapshot[item.id] ? foldEffect : unfoldEffect).of({
				from: item.from,
				to: item.to,
			}),
		];
	});
}

export function equalFoldSnapshots(
	a: Record<string, boolean> | undefined,
	b: Record<string, boolean>,
): boolean {
	return (
		!!a &&
		Object.keys(a).length === Object.keys(b).length &&
		Object.entries(b).every(([key, value]) => Object.hasOwn(a, key) && a[key] === value)
	);
}
