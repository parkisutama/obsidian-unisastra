// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { EditorState } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { describe, expect, it } from "vitest";
import { collectOutlineEntries } from "@/components/outline/entries";

/**
 * Entries come from the document text only. The tree reader was removed because the live tree
 * has no ListItem or ATXHeading nodes (native checkpoint 1c).
 */
const collect = (doc: string) =>
	collectOutlineEntries({ state: EditorState.create({ doc }) } as unknown as EditorView);

describe("headings", () => {
	it("reads ATX levels as depth 0 to 5 with the title and position", () => {
		const doc = "# one\n## two\n###### six";
		const entries = collect(doc);
		expect(entries.map((e) => [e.title, e.depth, e.pos, e.type])).toEqual([
			["one", 0, 0, "heading"],
			["two", 1, 6, "heading"],
			["six", 5, 13, "heading"],
		]);
		expect(entries.every((e) => !(e.isTask || e.taskState) && e.rangeTo === e.pos)).toBe(true);
	});

	it("strips trailing closing markers and surrounding space", () => {
		expect(collect("## title ##  ")[0].title).toBe("title");
	});

	it("ignores a heading with no space, seven hashes, an indent, or an empty title", () => {
		expect(collect("#nospace\n####### seven\n  # indented\n#   ")).toEqual([]);
	});

	it("does not treat setext underlines as headings", () => {
		expect(collect("Title\n=====\nSub\n-----")).toEqual([]);
	});
});

describe("list items", () => {
	it("reads every marker kind with the raw line and range", () => {
		const doc = "- a\n+ b\n* c\n1. d";
		const entries = collect(doc);
		expect(entries.map((e) => e.title)).toEqual(["a", "b", "c", "d"]);
		expect(entries.map((e) => e.markdown)).toEqual(["- a", "+ b", "* c", "1. d"]);
		expect(entries.map((e) => [e.pos, e.rangeTo])).toEqual([
			[0, 3],
			[4, 7],
			[8, 11],
			[12, 16],
		]);
		expect(entries.every((e) => e.type === "list-item" && e.depth === 6)).toBe(true);
	});

	it("keeps the item text after the marker trimmed", () => {
		expect(collect("-   spaced out  ")[0].title).toBe("spaced out");
	});

	it("drops an item with no text", () => {
		expect(collect("- \n-\n- [ ] ")).toEqual([]);
	});

	it("reports markdown without the leading indent", () => {
		expect(collect("- a\n    - b")[1].markdown).toBe("- b");
	});
});

describe("tasks", () => {
	it("marks unchecked and checked tasks and strips the checkbox from the title", () => {
		const [open, done, upper] = collect("- [ ] open\n- [x] done\n1. [X] upper");
		expect([open.isTask, open.taskState, open.title]).toEqual([true, "unchecked", "open"]);
		expect([done.isTask, done.taskState, done.title]).toEqual([true, "checked", "done"]);
		expect([upper.isTask, upper.taskState, upper.title]).toEqual([true, "checked", "upper"]);
	});

	it("leaves plain items without task flags", () => {
		const [plain] = collect("- plain");
		expect([plain.isTask, plain.taskState]).toEqual([false, null]);
	});

	it("reads task state from a checkbox anywhere in the line, even when it is not a task", () => {
		// Existing behavior, recorded as is: getTaskState scans the whole line.
		const [item] = collect("- note [x] later");
		expect([item.isTask, item.taskState]).toEqual([false, "checked"]);
	});
});

describe("document shape", () => {
	it("returns nothing for an empty or whitespace document", () => {
		expect(collect("")).toEqual([]);
		expect(collect(" \n\t\n")).toEqual([]);
	});

	it("skips frontmatter but keeps positions in the full document", () => {
		const doc = "---\ntitle: x\n- not a list\n---\n# real";
		const entries = collect(doc);
		expect(entries.map((e) => e.title)).toEqual(["real"]);
		expect(entries[0].pos).toBe(doc.indexOf("# real"));
	});

	it("treats a --- that is not on the first line as plain text", () => {
		expect(collect("# h\n---\n- a").map((e) => e.title)).toEqual(["h", "a"]);
	});

	it("keeps document order across headings and lists", () => {
		const entries = collect("# h\n- a\n## g\n- [ ] b");
		expect(entries.map((e) => e.title)).toEqual(["h", "a", "g", "b"]);
	});

	it("ignores plain paragraphs and blank lines", () => {
		expect(collect("text\n\nmore text")).toEqual([]);
	});
});
