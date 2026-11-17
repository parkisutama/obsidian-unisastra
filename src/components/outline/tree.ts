// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import type { OutlineEntry } from "./entries";

export interface OutlineTreeEntry extends OutlineEntry {
	ancestorIndices: number[];
	childIndices: number[];
	hasChildren: boolean;
	index: number;
	isLastSibling: boolean;
	parentIndex: number | null;
	stateKey: string;
	visualDepth: number;
}

export interface TaskProgress {
	completed: number;
	total: number;
}

export type TaskProgressTone = "idle" | "active" | "complete";

export function buildTreeEntries(entries: OutlineEntry[]): OutlineTreeEntry[] {
	const treeEntries = entries.map<OutlineTreeEntry>((entry, index) => ({
		ancestorIndices: [],
		...entry,
		childIndices: [],
		hasChildren: false,
		index,
		isLastSibling: false,
		stateKey: "",
		parentIndex: null,
		visualDepth: 0,
	}));

	const stack: number[] = [];
	for (const entry of treeEntries) {
		while (stack.length > 0 && treeEntries[stack.at(-1) ?? 0].depth >= entry.depth) {
			stack.pop();
		}

		const parentIndex = stack.at(-1) ?? null;
		entry.parentIndex = parentIndex;
		if (parentIndex !== null) {
			treeEntries[parentIndex].childIndices.push(entry.index);
			treeEntries[parentIndex].hasChildren = true;
		}
		entry.ancestorIndices =
			parentIndex === null ? [] : [...treeEntries[parentIndex].ancestorIndices, parentIndex];
		entry.visualDepth = parentIndex === null ? 0 : treeEntries[parentIndex].visualDepth + 1;

		const ancestorPath = parentIndex === null ? [] : treeEntries[parentIndex].stateKey.split(" > ");
		entry.stateKey = [...ancestorPath, `${entry.type}:${entry.depth}:${entry.title}`].join(" > ");

		stack.push(entry.index);
	}

	for (const entry of treeEntries) {
		if (entry.parentIndex === null) {
			const rootSiblings = treeEntries.filter((candidate) => candidate.parentIndex === null);
			entry.isLastSibling = rootSiblings.at(-1)?.index === entry.index;
			continue;
		}

		const siblings = treeEntries[entry.parentIndex].childIndices;
		entry.isLastSibling = siblings.at(-1) === entry.index;
	}

	return treeEntries;
}

export function getTaskProgress(entries: OutlineTreeEntry[]): Map<number, TaskProgress> {
	const progressByIndex = new Map<number, TaskProgress>();

	for (let index = entries.length - 1; index >= 0; index--) {
		const entry = entries[index];
		let completed = entry.taskState === "checked" ? 1 : 0;
		let total = entry.isTask ? 1 : 0;

		for (const childIndex of entry.childIndices) {
			const childProgress = progressByIndex.get(childIndex);
			if (!childProgress) {
				continue;
			}

			completed += childProgress.completed;
			total += childProgress.total;
		}

		progressByIndex.set(index, { completed, total });
	}

	return progressByIndex;
}

export function getTaskProgressTone(progress: TaskProgress): TaskProgressTone {
	if (progress.completed === 0) {
		return "idle";
	}

	if (progress.completed >= progress.total) {
		return "complete";
	}

	return "active";
}
