// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { history, undo, undoDepth } from "@codemirror/commands";
import { EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";
import { detectHeadingLevel } from "@/capabilities/features/toolbar/actions";
import { executeToolbarAction, type ToolbarTarget } from "@/capabilities/features/toolbar/executor";

describe("detectHeadingLevel", () => {
	it("reports 0 for a plain paragraph and the hash count for H1-H4", () => {
		expect(detectHeadingLevel("plain text")).toBe(0);
		expect(detectHeadingLevel("# One")).toBe(1);
		expect(detectHeadingLevel("#### Four")).toBe(4);
	});
	it("reports -1 for headings beyond H4, which the toolbar does not manage", () => {
		expect(detectHeadingLevel("##### Five")).toBe(-1);
	});
});

function target(text = "hello", from = 0, to = text.length) {
	let state = EditorState.create({
		extensions: [history()],
		doc: text,
		selection: { anchor: from, head: to },
	});
	const policy = {
		enabled: true,
		hemingway: false,
		current: true,
		smartUrl: false,
		visible: { from: 0, to: 10_000 },
	};
	const port: ToolbarTarget = {
		get state() {
			return state;
		},
		dispatch: (transaction) => {
			state = state.update(transaction).state;
		},
		readClipboardText: undefined,
		policy: () => policy,
	};
	return {
		port,
		policy,
		text: () => state.doc.toString(),
		setSelection: (anchor: number, head = anchor) => {
			state = state.update({ selection: { anchor, head } }).state;
		},
	};
}
describe("toolbar executor", () => {
	it("keeps successive actions as separate undo steps", () => {
		const editor = target();
		executeToolbarAction(editor.port, { kind: "bold" });
		executeToolbarAction(editor.port, { kind: "bold" });
		expect(undoDepth(editor.port.state)).toBe(2);
		undo(editor.port);
		expect(editor.text()).toBe("**hello**");
		undo(editor.port);
		expect(editor.text()).toBe("hello");
	});
	it("wraps and unwraps selected bold without touching other text", async () => {
		const editor = target("before hello after", 7, 12);
		expect(await executeToolbarAction(editor.port, { kind: "bold" })).toBeNull();
		expect(editor.text()).toBe("before **hello** after");
		await executeToolbarAction(editor.port, { kind: "bold" });
		expect(editor.text()).toBe("before hello after");
	});
	it("refuses Hemingway, stale target and ranges outside the outline", async () => {
		const editor = target();
		editor.policy.hemingway = true;
		expect(await executeToolbarAction(editor.port, { kind: "bold" })).toMatch("Hemingway");
		editor.policy.hemingway = false;
		editor.policy.current = false;
		expect(await executeToolbarAction(editor.port, { kind: "bold" })).toMatch("changed");
		editor.policy.current = true;
		editor.policy.visible.to = 3;
		expect(await executeToolbarAction(editor.port, { kind: "bold" })).toMatch("outline");
		expect(editor.text()).toBe("hello");
	});
	it("does nothing for empty selections or disabled targets", async () => {
		const editor = target("hello", 0, 0);
		expect(await executeToolbarAction(editor.port, { kind: "bold" })).toMatch("Select");
		editor.policy.enabled = false;
		expect(await executeToolbarAction(editor.port, { kind: "bold" })).toMatch("disabled");
		expect(editor.text()).toBe("hello");
	});
	it("wraps and unwraps italic without matching a bold selection", async () => {
		const editor = target("before hello after", 7, 12);
		expect(await executeToolbarAction(editor.port, { kind: "italic" })).toBeNull();
		expect(editor.text()).toBe("before *hello* after");
		await executeToolbarAction(editor.port, { kind: "italic" });
		expect(editor.text()).toBe("before hello after");

		const bolded = target("**hello**", 0, 9);
		expect(await executeToolbarAction(bolded.port, { kind: "italic" })).toBeNull();
		expect(bolded.text()).toBe("***hello***");
	});
	it("wraps and unwraps strikethrough, code, and highlight", async () => {
		for (const [kind, marker] of [
			["strikethrough", "~~"],
			["code", "`"],
			["highlight", "=="],
		] as const) {
			const editor = target("hello", 0, 5);
			await executeToolbarAction(editor.port, { kind });
			expect(editor.text()).toBe(`${marker}hello${marker}`);
			await executeToolbarAction(editor.port, { kind });
			expect(editor.text()).toBe("hello");
		}
	});
	it("applies the chosen heading level to the cursor's line without touching other lines", async () => {
		const editor = target("intro\nbody text\noutro");
		editor.setSelection(6, 6);
		expect(await executeToolbarAction(editor.port, { kind: "heading", level: 1 })).toBeNull();
		expect(editor.text()).toBe("intro\n# body text\noutro");
		await executeToolbarAction(editor.port, { kind: "heading", level: 2 });
		expect(editor.text()).toBe("intro\n## body text\noutro");
		await executeToolbarAction(editor.port, { kind: "heading", level: 0 });
		expect(editor.text()).toBe("intro\nbody text\noutro");
	});
	it("refuses heading levels beyond H4", async () => {
		const editor = target("##### too deep");
		expect(await executeToolbarAction(editor.port, { kind: "heading", level: 1 })).toMatch(
			"not supported",
		);
		expect(editor.text()).toBe("##### too deep");
	});
	it("inserts a placeholder link without reading the clipboard when smartUrl is off", async () => {
		const editor = target("docs", 0, 4);
		editor.port.readClipboardText = () => {
			throw new Error("Clipboard must not be read when smartUrl is off.");
		};
		expect(await executeToolbarAction(editor.port, { kind: "link" })).toBeNull();
		expect(editor.text()).toBe("[docs](https://)");
	});
	it("uses a valid clipboard URL when smartUrl is on", async () => {
		const editor = target("docs", 0, 4);
		editor.policy.smartUrl = true;
		editor.port.readClipboardText = () => Promise.resolve("https://example.com");
		expect(await executeToolbarAction(editor.port, { kind: "link" })).toBeNull();
		expect(editor.text()).toBe("[docs](https://example.com)");
	});
	it("falls back to the placeholder for non-URL clipboard content", async () => {
		const editor = target("docs", 0, 4);
		editor.policy.smartUrl = true;
		editor.port.readClipboardText = () => Promise.resolve("not a url");
		expect(await executeToolbarAction(editor.port, { kind: "link" })).toBeNull();
		expect(editor.text()).toBe("[docs](https://)");
	});
	it("falls back to the placeholder when clipboard access fails", async () => {
		const editor = target("docs", 0, 4);
		editor.policy.smartUrl = true;
		editor.port.readClipboardText = () => Promise.reject(new Error("denied"));
		expect(await executeToolbarAction(editor.port, { kind: "link" })).toBeNull();
		expect(editor.text()).toBe("[docs](https://)");
	});
	it("cancels without writing when the selection changes while awaiting clipboard", async () => {
		const editor = target("docs", 0, 4);
		editor.policy.smartUrl = true;
		editor.port.readClipboardText = () => {
			editor.setSelection(0, 0);
			return Promise.resolve("https://example.com");
		};
		expect(await executeToolbarAction(editor.port, { kind: "link" })).toMatch("changed");
		expect(editor.text()).toBe("docs");
	});
	it("unwraps an existing markdown link back to its link text", async () => {
		const editor = target("[docs](https://example.com)");
		expect(await executeToolbarAction(editor.port, { kind: "link" })).toBeNull();
		expect(editor.text()).toBe("docs");
	});
	it("wraps a selection as a callout of the chosen type, uppercasing the marker", async () => {
		const editor = target("hello", 0, 5);
		expect(await executeToolbarAction(editor.port, { kind: "callout", id: "tip" })).toBeNull();
		expect(editor.text()).toBe("> [!TIP]\n> hello");
	});
	it("refuses an empty selection or a selection that cuts through a callout header", async () => {
		const empty = target("hello", 0, 0);
		expect(await executeToolbarAction(empty.port, { kind: "callout", id: "note" })).toMatch(
			"Select",
		);

		const ambiguous = target("intro\n> [!note]\n> body");
		expect(
			await executeToolbarAction(ambiguous.port, {
				kind: "callout",
				id: "danger",
			}),
		).toMatch("cuts through");
		expect(ambiguous.text()).toBe("intro\n> [!note]\n> body");
	});
});
