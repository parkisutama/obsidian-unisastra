// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { describe, expect, it } from "vitest";
import { collectOutlineFromText } from "@/components/outline/entries";
import {
	buildTreeEntries,
	getTaskProgress,
	getTaskProgressTone,
	type OutlineTreeEntry,
} from "@/components/outline/tree";

const tree = (doc: string): OutlineTreeEntry[] => buildTreeEntries(collectOutlineFromText(doc));
const progress = (doc: string) => {
	const entries = tree(doc);
	const byIndex = getTaskProgress(entries);
	return entries.map((e) => byIndex.get(e.index));
};

describe("buildTreeEntries", () => {
	it("returns an empty tree for no entries", () => {
		expect(buildTreeEntries([])).toEqual([]);
	});

	it("links parents, children, ancestors and visual depth", () => {
		const entries = tree("# h\n- a\n    - b\n- c\n## g\n- d");
		expect(entries.map((e) => e.title)).toEqual(["h", "a", "b", "c", "g", "d"]);
		expect(entries.map((e) => e.parentIndex)).toEqual([null, 0, 1, 0, 0, 4]);
		expect(entries.map((e) => e.childIndices)).toEqual([[1, 3, 4], [2], [], [], [5], []]);
		expect(entries.map((e) => e.ancestorIndices)).toEqual([[], [0], [0, 1], [0], [0], [0, 4]]);
		expect(entries.map((e) => e.visualDepth)).toEqual([0, 1, 2, 1, 1, 2]);
		expect(entries.map((e) => e.hasChildren)).toEqual([true, true, false, false, true, false]);
	});

	it("marks the last sibling at the root and under a parent", () => {
		const entries = tree("# a\n- x\n- y\n# b");
		expect(entries.map((e) => e.isLastSibling)).toEqual([false, false, true, true]);
	});

	it("treats a skipped heading level as a direct child", () => {
		const entries = tree("# a\n### c");
		expect(entries[1].parentIndex).toBe(0);
		expect(entries[1].visualDepth).toBe(1);
	});

	it("starts a new root when depth does not increase", () => {
		const entries = tree("## a\n# b\n## c");
		expect(entries.map((e) => e.parentIndex)).toEqual([null, null, 1]);
	});

	it("builds state keys from the ancestor path, type, depth and title", () => {
		const entries = tree("# h\n- a\n    - b");
		expect(entries.map((e) => e.stateKey)).toEqual([
			"heading:0:h",
			"heading:0:h > list-item:6:a",
			"heading:0:h > list-item:6:a > list-item:7:b",
		]);
	});

	it("gives equal titles under the same parent the same state key", () => {
		const entries = tree("# h\n- a\n- a");
		expect(entries[1].stateKey).toBe(entries[2].stateKey);
	});

	it("keeps the entry fields it was given", () => {
		const [first] = tree("- [x] done");
		expect(first).toMatchObject({ title: "done", isTask: true, taskState: "checked", index: 0 });
	});
});

describe("getTaskProgress", () => {
	it("counts a lone task", () => {
		expect(progress("- [x] a\n- [ ] b")).toEqual([
			{ completed: 1, total: 1 },
			{ completed: 0, total: 1 },
		]);
	});

	it("rolls tasks up through every ancestor", () => {
		expect(progress("# h\n- [x] a\n    - [ ] b\n    - [x] c")).toEqual([
			{ completed: 2, total: 3 },
			{ completed: 2, total: 3 },
			{ completed: 0, total: 1 },
			{ completed: 1, total: 1 },
		]);
	});

	it("counts nothing for plain items and headings without tasks", () => {
		expect(progress("# h\n- a")).toEqual([
			{ completed: 0, total: 0 },
			{ completed: 0, total: 0 },
		]);
	});

	it("does not leak a sibling's tasks into the next branch", () => {
		const [h1, , h2] = progress("# one\n- [x] a\n# two\n- [ ] b");
		expect(h1).toEqual({ completed: 1, total: 1 });
		expect(h2).toEqual({ completed: 0, total: 1 });
	});

	it("returns an empty map for no entries", () => {
		expect(getTaskProgress([]).size).toBe(0);
	});
});

describe("getTaskProgressTone", () => {
	it.each([
		[{ completed: 0, total: 0 }, "idle"],
		[{ completed: 0, total: 3 }, "idle"],
		[{ completed: 1, total: 3 }, "active"],
		[{ completed: 3, total: 3 }, "complete"],
		[{ completed: 4, total: 3 }, "complete"],
	])("reads %j as %s", (value, tone) => {
		expect(getTaskProgressTone(value)).toBe(tone);
	});
});
