// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { describe, expect, it } from "vitest";
import { collectOutlineFromText } from "@/components/outline/entries";

const LIST_BASE = 6;
const depths = (doc: string) =>
	collectOutlineFromText(doc)
		.filter((e) => e.type === "list-item")
		.map((e) => e.depth - LIST_BASE);

describe("outline text path: list depth follows nesting, not indent width", () => {
	it.each([
		["tabs", "- a\n\t- b\n\t\t- c\n- d"],
		["two spaces", "- a\n  - b\n    - c\n- d"],
		["four spaces", "- a\n    - b\n        - c\n- d"],
	])("reads %s as one level per step", (_name, doc) => {
		expect(depths(doc)).toEqual([0, 1, 2, 0]);
	});

	it("keeps a sibling at the same level after a deeper item", () => {
		expect(depths("- a\n\t- b\n\t\t- c\n\t- d")).toEqual([0, 1, 2, 1]);
	});

	it("reads mixed tab and space indentation by nesting", () => {
		expect(depths("- a\n\t- b\n    - c")).toEqual([0, 1, 1]);
	});

	it("advances a tab to the next multiple of four columns", () => {
		// One space then a tab is column 4, so five spaces is one column deeper.
		expect(depths("- a\n \t- b\n     - c")).toEqual([0, 1, 2]);
	});

	it("counts a jump of several levels as one level", () => {
		expect(depths("- a\n        - b")).toEqual([0, 1]);
	});

	it("starts at depth 0 when the first item is already indented", () => {
		expect(depths("    - a\n    - b\n        - c")).toEqual([0, 0, 1]);
	});

	it("puts a dedent between two levels under the nearer parent", () => {
		expect(depths("- a\n    - b\n        - c\n      - d")).toEqual([0, 1, 2, 2]);
	});

	it("restarts after a heading or an unindented paragraph", () => {
		expect(depths("- a\n\t- b\n\ntext\n\t- c")).toEqual([0, 1, 0]);
		expect(depths("- a\n\t- b\n# h\n\t- c")).toEqual([0, 1, 0]);
	});

	it("keeps the nesting across blank lines and indented continuation lines", () => {
		expect(depths("- a\n\n\tmore\n\t- b")).toEqual([0, 1]);
	});
});
