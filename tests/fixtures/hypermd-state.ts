// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { defineLanguageFacet, Language } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { NodeSet, NodeType, type Parser, Tree } from "@lezer/common";

const LIST_LINE = /^(\s*)([-+*]|\d+\.)\s/;
const HEADING_LINE = /^(#{1,6})\s/;
const types = [
	NodeType.define({ id: 0, name: "Document", top: true }),
	...[1, 2, 3, 4, 5, 6].map((n) =>
		NodeType.define({ id: n, name: `HyperMD-list-line_HyperMD-list-line-${n}` }),
	),
	...[1, 2, 3, 4, 5, 6].map((n) =>
		NodeType.define({ id: 6 + n, name: `HyperMD-header_HyperMD-header-${n}` }),
	),
];
const nodeSet = new NodeSet(types);

function indentColumns(indent: string, tabSize: number): number {
	let columns = 0;
	for (const char of indent) {
		columns += char === "\t" ? tabSize : 1;
	}
	return columns;
}

/**
 * Builds a line-level tree shaped like the one Obsidian's live preview gives lists and headings.
 * Assumption, checked only by native acceptance: a node covers its line including the line end,
 * so a cursor at the end of a line still resolves to it.
 */
function buildTree(text: string, tabSize: number): Tree {
	const buffer: number[] = [];
	let from = 0;
	for (const line of text.split("\n")) {
		const to = from + line.length;
		const list = LIST_LINE.exec(line);
		const heading = HEADING_LINE.exec(line);
		if (list) {
			const depth = Math.floor(indentColumns(list[1], tabSize) / tabSize) + 1;
			buffer.push(Math.min(depth, 6), from, to + 1, 4);
		} else if (heading) {
			buffer.push(6 + heading[1].length, from, to + 1, 4);
		}
		from = to + 1;
	}
	return Tree.build({ buffer, nodeSet, topID: 0, length: text.length });
}

function parserFor(tabSize: number): Parser {
	type Input = { length: number; read(from: number, to: number): string };
	const startParse = (input: Input) => {
		const tree = buildTree(input.read(0, input.length), tabSize);
		return { parsedPos: input.length, stoppedAt: null, advance: () => tree, stopAt() {} };
	};
	return { startParse, createParse: startParse } as unknown as Parser;
}

/** Marks the cursor with `|` in `doc`; a second `|` makes a selection. */
export function hypermdState(doc: string, tabSize = 4): EditorState {
	const [before, middle, after] = doc.split("|");
	const text = after === undefined ? before + (middle ?? "") : before + middle + after;
	const head = before.length;
	const anchor = after === undefined ? head : head + middle.length;
	const language = new Language(defineLanguageFacet(), parserFor(tabSize), [], "hypermd");
	return EditorState.create({
		doc: text,
		selection: { anchor: head, head: anchor },
		extensions: [EditorState.tabSize.of(tabSize), language],
	});
}

/** Runs a state command and returns the resulting state, or null when it declined. */
export function runCommand(
	command: (target: { state: EditorState; dispatch: EditorView["dispatch"] }) => boolean,
	state: EditorState,
): EditorState | null {
	let next: EditorState | null = null;
	const handled = command({
		state,
		dispatch: ((tr: { state: EditorState }) => {
			next = tr.state;
		}) as EditorView["dispatch"],
	});
	return handled ? (next ?? state) : null;
}
