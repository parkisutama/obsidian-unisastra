// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { describe, expect, it } from "vitest";
import {
	cursorStickHome,
	cursorStickLeft,
	indentListItem,
	moveListItemDown,
	moveListItemUp,
	outdentListItem,
	smartEnter,
	smartSelectAll,
	smartShiftTab,
	smartTab,
} from "@/cm6/outliner/keyboard-ops";
import { hypermdState, runCommand } from "./fixtures/hypermd-state";

type Command = Parameters<typeof runCommand>[0];

/** Applies the command to `doc` (cursor marked with `|`) and returns "text|cursor" or null. */
function apply(command: Command, doc: string): string | null {
	const next = runCommand(command, hypermdState(doc));
	if (!next) {
		return null;
	}
	const { anchor, head } = next.selection.main;
	const text = next.doc.toString();
	return anchor === head
		? `${text.slice(0, head)}|${text.slice(head)}`
		: `${text.slice(0, anchor)}|${text.slice(anchor, head)}|${text.slice(head)}`;
}

describe("move up and down", () => {
	it("moves an item with its children above the previous sibling", () => {
		expect(apply(moveListItemUp, "- a\n- b|\n    - b1")).toBe("- b|\n    - b1\n- a");
	});

	it("moves an item with its children below the next sibling", () => {
		expect(apply(moveListItemDown, "- a|\n    - a1\n- b")).toBe("- b\n- a|\n    - a1");
	});

	it("keeps the cursor offset inside the moved item", () => {
		expect(apply(moveListItemDown, "- a|bc\n- d")).toBe("- d\n- a|bc");
	});

	it("declines on the first item going up and the last going down", () => {
		expect(apply(moveListItemUp, "- a|\n- b")).toBeNull();
		expect(apply(moveListItemDown, "- a\n- b|")).toBeNull();
	});

	it("does not move across a parent boundary", () => {
		expect(apply(moveListItemUp, "- a\n    - a1|")).toBeNull();
		expect(apply(moveListItemDown, "- a\n    - a1|\n- b")).toBeNull();
	});

	it("declines outside a list", () => {
		expect(apply(moveListItemUp, "plain|\n- a")).toBeNull();
		expect(apply(moveListItemDown, "plain|\n- a")).toBeNull();
	});
});

describe("indent and outdent", () => {
	it("indents the item and its children by one level", () => {
		expect(apply(indentListItem, "- a\n- b|\n    - b1")).toBe("- a\n    - b|\n        - b1");
	});

	it("declines to indent the first item", () => {
		expect(apply(indentListItem, "- a|\n- b")).toBeNull();
	});

	it("outdents the item and its children by one level", () => {
		expect(apply(outdentListItem, "- a\n    - b|\n        - c")).toBe("- a\n- b|\n    - c");
	});

	it("declines to outdent a root item", () => {
		expect(apply(outdentListItem, "- a|")).toBeNull();
	});

	it("clamps the cursor at the line start when outdenting from inside the indent", () => {
		const out = apply(outdentListItem, "- a\n    |- b");
		expect(out).toBe("- a\n|- b");
	});

	it("smart tab and shift-tab act only inside lists", () => {
		expect(apply(smartTab, "- a\n- b|\n")).toBe("- a\n    - b|\n");
		expect(apply(smartShiftTab, "- a\n    - b|\n")).toBe("- a\n- b|\n");
		expect(apply(smartTab, "plain|")).toBeNull();
		expect(apply(smartShiftTab, "plain|")).toBeNull();
	});
});

describe("smartEnter", () => {
	it("adds a sibling below with the same marker and depth", () => {
		expect(apply(smartEnter, "- a|\n")).toBe("- a\n- |\n");
		expect(apply(smartEnter, "- a\n    - b|\n")).toBe("- a\n    - b\n    - |\n");
		expect(apply(smartEnter, "1. one|\n")).toBe("1. one\n1. |\n");
	});

	it("splits the text at the cursor", () => {
		expect(apply(smartEnter, "- ab|cd")).toBe("- ab\n- |cd");
	});

	it("outdents an empty nested item", () => {
		expect(apply(smartEnter, "- a\n    - |\n")).toBe("- a\n- |\n");
	});

	it("clears an empty root item to leave the list", () => {
		expect(apply(smartEnter, "- a\n- |\n")).toBe("- a\n|\n");
	});

	it("declines outside a list", () => {
		expect(apply(smartEnter, "plain|")).toBeNull();
	});
});

describe("smartSelectAll", () => {
	it("selects the item content, then the enclosing list", () => {
		const first = hypermdState("- ab|c\n- d");
		const step1 = runCommand(smartSelectAll, first);
		expect(step1?.selection.main).toMatchObject({ anchor: 2, head: 5 });
		const step2 = step1 && runCommand(smartSelectAll, step1);
		expect(step2?.selection.main).toMatchObject({ anchor: 0, head: 9 });
	});

	it("declines outside a list", () => {
		expect(apply(smartSelectAll, "plain|")).toBeNull();
	});
});

describe("cursor sticking", () => {
	it("moves a cursor inside the marker to the content start", () => {
		expect(apply(cursorStickLeft, "-| a")).toBe("- |a");
		expect(apply(cursorStickLeft, "- |a")).toBe("- |a");
	});

	it("leaves a cursor inside the content alone", () => {
		expect(apply(cursorStickLeft, "- ab|")).toBeNull();
	});

	it("sends Home to the content start unless already there", () => {
		expect(apply(cursorStickHome, "- ab|\n")).toBe("- |ab\n");
		expect(apply(cursorStickHome, "- |ab")).toBeNull();
	});

	it("declines outside a list", () => {
		expect(apply(cursorStickLeft, "plain|")).toBeNull();
		expect(apply(cursorStickHome, "plain|")).toBeNull();
	});
});
