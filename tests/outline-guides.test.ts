import { describe, expect, it } from "vitest";
import { buildOutlineGuides, getOutlineTrail } from "@/components/outline-guides";

const entries = [
	{ index: 0, ancestorIndices: [] },
	{ index: 1, ancestorIndices: [0] },
	{ index: 2, ancestorIndices: [0, 1] },
	{ index: 3, ancestorIndices: [0, 1] },
	{ index: 4, ancestorIndices: [0] },
	{ index: 5, ancestorIndices: [0, 4] },
];

describe("outline connectors", () => {
	it("continues past a leaf with a following sibling, but ends a last parent independently of its children", () => {
		const rows = buildOutlineGuides(entries);
		expect(rows[2].isLastSibling).toBe(false);
		expect(rows[3].isLastSibling).toBe(true);
		expect(rows[4].isLastSibling).toBe(true);
		expect(rows[4].hasChildren).toBe(true);
		expect(rows[2].continuingDepths).toEqual([1]);
		expect(rows[5].continuingDepths).toEqual([]);
	});

	it("uses visible siblings and children after collapse or filtering", () => {
		const rows = buildOutlineGuides([entries[0], entries[1], entries[4]]);
		expect(rows.map((row) => row.hasChildren)).toEqual([true, false, false]);
		expect(rows.map((row) => row.isLastSibling)).toEqual([true, false, true]);
		const tasks = buildOutlineGuides([entries[2], entries[3], entries[5]]);
		expect(tasks.map((row) => row.ancestorIndices)).toEqual([[], [], []]);
		expect(tasks.every((row) => row.continuingDepths.length === 0)).toBe(true);
	});

	it("connects a filtered descendant to its nearest visible ancestor", () => {
		const rows = buildOutlineGuides([entries[0], entries[2], entries[5]]);
		expect(rows[1].ancestorIndices).toEqual([0]);
		expect(rows[1].isLastSibling).toBe(false);
		expect(rows[2].isLastSibling).toBe(true);
	});

	it("highlights only the path to a target, including intervening rows", () => {
		const rows = buildOutlineGuides(entries);
		expect([...getOutlineTrail(rows, 5)]).toEqual([
			"0:stem",
			"1:column:1",
			"2:column:1",
			"3:column:1",
			"4:elbow",
			"4:stem",
			"5:elbow",
		]);
		expect([...getOutlineTrail(rows, 3)]).toEqual([
			"0:stem",
			"1:elbow",
			"1:stem",
			"2:column:2",
			"3:elbow",
		]);
		expect(getOutlineTrail(rows, -1).size).toBe(0);
		expect(getOutlineTrail(rows, 0).size).toBe(0);
	});
});
