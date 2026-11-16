// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { describe, expect, it } from "vitest";
import {
	calculateOutlinerRange,
	getAllListItems,
	getFirstChild,
	getIndentForDepth,
	getNextSibling,
	getParentItem,
	getPreviousSibling,
	getSubtreeRange,
	reindentText,
	resolveListItem,
	toggleTaskItem,
} from "@/cm6/list-service";
import { hypermdState } from "./fixtures/hypermd-state";

const DOC = "- a\n    - a1\n    - a2\n- b ^id1\n- [ ] t\n- [x] d";

function itemAt(state: ReturnType<typeof hypermdState>, needle: string) {
	const item = resolveListItem(state, state.doc.toString().indexOf(needle));
	if (!item) {
		throw new Error(`no list item at ${needle}`);
	}
	return item;
}

describe("resolveListItem", () => {
	it("reads depth, marker, content and block id", () => {
		const b = itemAt(hypermdState(DOC), "- b");
		expect(b).toMatchObject({ depth: 0, marker: "-", contentText: "b ^id1", blockId: "id1" });
		expect(b.hasChildren).toBe(false);
	});

	it("spans children in the subtree and flags hasChildren", () => {
		const state = hypermdState(DOC);
		const a = itemAt(state, "- a\n");
		expect(a.hasChildren).toBe(true);
		expect(state.doc.sliceString(a.from, a.to)).toBe("- a\n    - a1\n    - a2");
	});

	it("returns null outside a list", () => {
		expect(resolveListItem(hypermdState("plain\n\n- a"), 2)).toBeNull();
	});

	it("reports depth from mixed tab and space indentation", () => {
		const state = hypermdState("- a\n\t- b\n    - c\n        - d");
		expect(getAllListItems(state).map((i) => i.depth)).toEqual([0, 1, 1, 2]);
	});

	it("detects task state and numbered markers", () => {
		const items = getAllListItems(hypermdState("1. one\n- [ ] t\n- [X] d"));
		expect(items.map((i) => i.marker)).toEqual(["1.", "-", "-"]);
		expect(items.map((i) => i.taskState)).toEqual([null, "unchecked", "checked"]);
		expect(items[1].contentText).toBe("t");
	});
});

describe("sibling navigation", () => {
	const state = hypermdState(DOC);

	it("finds previous and next siblings at the same depth only", () => {
		expect(getNextSibling(state, itemAt(state, "- a1"))?.contentText).toBe("a2");
		expect(getPreviousSibling(state, itemAt(state, "- a2"))?.contentText).toBe("a1");
		expect(getNextSibling(state, itemAt(state, "- a\n"))?.contentText).toBe("b ^id1");
	});

	it("returns null at the edges and across a shallower item", () => {
		expect(getPreviousSibling(state, itemAt(state, "- a\n"))).toBeNull();
		expect(getPreviousSibling(state, itemAt(state, "- a1"))).toBeNull();
		expect(getNextSibling(state, itemAt(state, "- a2"))).toBeNull();
		expect(getNextSibling(state, itemAt(state, "- [x] d"))).toBeNull();
	});

	it("does not reach a sibling of an earlier parent", () => {
		const nested = hypermdState("- p\n    - q\n- a\n    - a1");
		expect(getPreviousSibling(nested, itemAt(nested, "- a1"))).toBeNull();
		const after = hypermdState("- a\n    - a1\n- b\n    - b1");
		expect(getNextSibling(after, itemAt(after, "- a1"))).toBeNull();
	});

	it("finds parent and first child", () => {
		expect(getParentItem(state, itemAt(state, "- a2"))?.contentText).toBe("a");
		expect(getParentItem(state, itemAt(state, "- a\n"))).toBeNull();
		expect(getFirstChild(state, itemAt(state, "- a\n"))?.contentText).toBe("a1");
		expect(getFirstChild(state, itemAt(state, "- b"))).toBeNull();
	});
});

describe("getAllListItems", () => {
	it("returns an empty list for a document without lists", () => {
		expect(getAllListItems(hypermdState("# h\ntext"))).toEqual([]);
	});

	it("computes subtree ends", () => {
		const [a, a1] = getAllListItems(hypermdState(DOC));
		expect(a.to).toBe(DOC.indexOf("\n- b"));
		expect(a1.hasChildren).toBe(false);
	});
});

describe("indentation helpers", () => {
	it("uses the tab size for indent depth", () => {
		const state = hypermdState("- a", 2);
		expect(getIndentForDepth(state, 0)).toBe("");
		expect(getIndentForDepth(state, 2)).toBe("    ");
	});

	it("reindents spaces, keeps blank lines and clamps at zero", () => {
		const state = hypermdState("- a", 4);
		expect(reindentText(state, "- a\n\n    - b", 0, 1)).toBe("    - a\n\n        - b");
		expect(reindentText(state, "    - a", 1, 0)).toBe("- a");
		expect(reindentText(state, "- a", 0, -1)).toBe("- a");
		expect(reindentText(state, "- a", 1, 1)).toBe("- a");
	});

	it("keeps tabs when the text uses tabs", () => {
		const state = hypermdState("- a", 4);
		expect(reindentText(state, "\t- a", 1, 2)).toBe("\t\t- a");
		expect(reindentText(state, "\t- a", 1, 0)).toBe("- a");
	});
});

describe("toggleTaskItem", () => {
	const state = hypermdState(DOC);

	it("flips the checkbox character in place", () => {
		const open = toggleTaskItem(state, itemAt(state, "- [ ] t"));
		expect(open?.insert).toBe("x");
		expect(state.doc.sliceString(open?.from ?? 0, open?.to)).toBe(" ");
		const done = toggleTaskItem(state, itemAt(state, "- [x] d"));
		expect(done?.insert).toBe(" ");
		expect(state.doc.sliceString(done?.from ?? 0, done?.to)).toBe("x");
	});

	it("ignores plain items", () => {
		expect(toggleTaskItem(state, itemAt(state, "- b"))).toBeNull();
	});
});

describe("calculateOutlinerRange and subtree", () => {
	it("covers a list item with its children", () => {
		expect(calculateOutlinerRange(hypermdState(DOC), 1)).toEqual({
			from: 0,
			to: DOC.indexOf("\n- b"),
		});
	});

	it("covers a heading until the next heading of equal or higher level", () => {
		const doc = "# one\ntext\n## sub\nmore\n# two\nend";
		const state = hypermdState(doc);
		expect(calculateOutlinerRange(state, 2)).toEqual({ from: 0, to: doc.indexOf("# two") - 1 });
		expect(calculateOutlinerRange(state, doc.indexOf("## sub"))).toEqual({
			from: doc.indexOf("## sub"),
			to: doc.indexOf("# two") - 1,
		});
		expect(calculateOutlinerRange(state, doc.indexOf("# two"))?.to).toBe(doc.length);
	});

	it("returns null for plain text", () => {
		expect(calculateOutlinerRange(hypermdState("plain"), 2)).toBeNull();
	});

	it("starts the subtree at the line start to keep indentation", () => {
		const state = hypermdState(DOC);
		expect(getSubtreeRange(state, itemAt(state, "- a1")).text).toBe("    - a1");
	});
});
