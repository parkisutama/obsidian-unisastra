// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { syntaxTree } from "@codemirror/language";
import type { EditorView } from "@codemirror/view";
import { getLineContentEndBeforeBlockId } from "@/cm6/outliner/utils";

type TreeNodeRef = Parameters<
	NonNullable<Parameters<ReturnType<typeof syntaxTree>["iterate"]>[0]["enter"]>
>[0];

export interface OutlineEntry {
	contentMarkdown: string;
	depth: number;
	isTask: boolean;
	markdown: string;
	pos: number;
	rangeTo: number;
	taskState: "checked" | "unchecked" | null;
	title: string;
	type: "heading" | "list-item";
}

const HEADING_LINE_RE = /^(#{1,6})\s+(.+)/;
const LIST_ITEM_LINE_RE = /^(\s*)([-+*]|\d+\.)\s+(.*)/;
const TASK_ITEM_RE = /^\s*([-+*]|\d+\.)\s+\[[ xX]\]\s/u;
const TASK_CHECKED_RE = /\[[xX]\]/u;
const TASK_PREFIX_RE = /^\[[ xX]\]\s*/u;
const TASK_UNCHECKED_RE = /\[ \]/u;
const TRAILING_HEADING_MARKERS_RE = /\s+#+\s*$/u;

function getTaskState(text: string): "checked" | "unchecked" | null {
	if (TASK_CHECKED_RE.test(text)) {
		return "checked";
	}

	if (TASK_UNCHECKED_RE.test(text)) {
		return "unchecked";
	}

	return null;
}

function stripTaskPrefix(text: string): string {
	return text.replace(TASK_PREFIX_RE, "").trim();
}

export function getLineContentEnd(view: EditorView, pos: number): number {
	return getLineContentEndBeforeBlockId(view.state, pos);
}

function createHeadingEntry(depth: number, pos: number, title: string): OutlineEntry | null {
	const normalizedTitle = title.replace(TRAILING_HEADING_MARKERS_RE, "").trim();
	if (!normalizedTitle) {
		return null;
	}

	return {
		contentMarkdown: normalizedTitle,
		markdown: normalizedTitle,
		title: normalizedTitle,
		pos,
		depth,
		rangeTo: pos,
		isTask: false,
		taskState: null,
		type: "heading",
	};
}

function createAtxHeadingEntry(view: EditorView, nodeRef: TreeNodeRef): OutlineEntry | null {
	const level = Number(nodeRef.name.slice(10));
	const line = view.state.doc.lineAt(nodeRef.from);
	const title = line.text.match(HEADING_LINE_RE)?.[2] ?? "";
	return createHeadingEntry(level - 1, nodeRef.from, title);
}

function createSetextHeadingEntry(view: EditorView, nodeRef: TreeNodeRef): OutlineEntry | null {
	const level = nodeRef.name === "SetextHeading1" ? 1 : 2;
	const line = view.state.doc.lineAt(nodeRef.from);
	return createHeadingEntry(level - 1, nodeRef.from, line.text);
}

function getListItemDepth(nodeRef: TreeNodeRef): number {
	let depth = 0;
	let ancestor = nodeRef.node.parent;

	while (ancestor) {
		if (ancestor.name === "ListItem") {
			depth++;
		}
		ancestor = ancestor.parent;
	}

	return depth;
}

function createListItemEntry(view: EditorView, nodeRef: TreeNodeRef): OutlineEntry | null {
	const line = view.state.doc.lineAt(nodeRef.from);
	const rawMarkdown = line.text.trimStart();
	const body = line.text.match(LIST_ITEM_LINE_RE)?.[3]?.trim();
	const title = body ? stripTaskPrefix(body) : undefined;

	if (!(title && rawMarkdown)) {
		return null;
	}

	return {
		contentMarkdown: title,
		markdown: rawMarkdown,
		title,
		pos: nodeRef.from,
		depth: 6 + getListItemDepth(nodeRef),
		rangeTo: line.to,
		isTask: TASK_ITEM_RE.test(line.text),
		taskState: getTaskState(line.text),
		type: "list-item",
	};
}

function collectOutlineEntryFromNode(view: EditorView, nodeRef: TreeNodeRef): OutlineEntry | null {
	if (nodeRef.name.startsWith("ATXHeading")) {
		return createAtxHeadingEntry(view, nodeRef);
	}

	if (nodeRef.name === "SetextHeading1" || nodeRef.name === "SetextHeading2") {
		return createSetextHeadingEntry(view, nodeRef);
	}

	if (nodeRef.name === "ListItem") {
		return createListItemEntry(view, nodeRef);
	}

	return null;
}

function shouldSkipNodeChildren(nodeName: string): boolean {
	return (
		nodeName.startsWith("ATXHeading") ||
		nodeName === "SetextHeading1" ||
		nodeName === "SetextHeading2"
	);
}

function collectOutlineFromTree(view: EditorView): OutlineEntry[] {
	const tree = syntaxTree(view.state);
	const entries: OutlineEntry[] = [];

	tree.iterate({
		enter(nodeRef) {
			const entry = collectOutlineEntryFromNode(view, nodeRef);
			if (entry) {
				entries.push(entry);
			}

			return shouldSkipNodeChildren(nodeRef.name) ? false : undefined;
		},
	});

	return entries;
}

function createTextHeadingOutlineEntry(
	pos: number,
	headingMatch: RegExpMatchArray,
): OutlineEntry | null {
	const level = headingMatch[1].length;
	const title = headingMatch[2].replace(TRAILING_HEADING_MARKERS_RE, "").trim();
	if (!title) {
		return null;
	}

	return {
		contentMarkdown: title,
		markdown: title,
		title,
		pos,
		depth: level - 1,
		rangeTo: pos,
		isTask: false,
		taskState: null,
		type: "heading",
	};
}

/** Width in columns; a tab advances to the next multiple of 4, as in CommonMark. */
function getIndentColumns(indent: string): number {
	let columns = 0;
	for (const char of indent) {
		columns += char === "\t" ? 4 - (columns % 4) : 1;
	}
	return columns;
}

/**
 * Nesting depth from the indent columns of the open items. An item deeper than the top of the
 * stack is a child one level down, however far it is indented; an equal one is a sibling.
 */
function getNestingDepth(indentStack: number[], columns: number): number {
	while (indentStack.length > 0 && indentStack[indentStack.length - 1] > columns) {
		indentStack.pop();
	}
	if (indentStack.length === 0 || indentStack[indentStack.length - 1] < columns) {
		indentStack.push(columns);
	}
	return indentStack.length - 1;
}

function createTextListOutlineEntry(
	line: string,
	pos: number,
	listMatch: RegExpMatchArray,
	depth: number,
): OutlineEntry | null {
	const title = stripTaskPrefix(listMatch[3]);
	if (!title) {
		return null;
	}

	return {
		contentMarkdown: title,
		markdown: line.trimStart(),
		title,
		pos,
		depth: 6 + depth,
		rangeTo: pos + line.length,
		isTask: TASK_ITEM_RE.test(line),
		taskState: getTaskState(line),
		type: "list-item",
	};
}

export function collectOutlineFromText(doc: string): OutlineEntry[] {
	const entries: OutlineEntry[] = [];
	const lines = doc.split("\n");
	let pos = 0;
	let inFrontmatter = false;
	const indentStack: number[] = [];

	for (const line of lines) {
		if (pos === 0 && line.trim() === "---") {
			inFrontmatter = true;
			pos += line.length + 1;
			continue;
		}
		if (inFrontmatter) {
			if (line.trim() === "---") {
				inFrontmatter = false;
			}
			pos += line.length + 1;
			continue;
		}

		const headingMatch = line.match(HEADING_LINE_RE);
		if (headingMatch) {
			indentStack.length = 0;
			const headingEntry = createTextHeadingOutlineEntry(pos, headingMatch);
			if (headingEntry) {
				entries.push(headingEntry);
			}
			pos += line.length + 1;
			continue;
		}

		const listMatch = line.match(LIST_ITEM_LINE_RE);
		if (listMatch) {
			const depth = getNestingDepth(indentStack, getIndentColumns(listMatch[1]));
			const listEntry = createTextListOutlineEntry(line, pos, listMatch, depth);
			if (listEntry) {
				entries.push(listEntry);
			}
		} else if (line.length > 0 && !/^\s/.test(line)) {
			// An unindented paragraph ends the list.
			indentStack.length = 0;
		}

		pos += line.length + 1;
	}

	return entries;
}

export function collectOutlineEntries(view: EditorView): OutlineEntry[] {
	const entries = collectOutlineFromTree(view);
	if (entries.length > 0) {
		return entries;
	}

	// Fallback: parse document text directly when tree is not ready
	const doc = view.state.doc.toString();
	if (doc.trim().length === 0) {
		return [];
	}
	return collectOutlineFromText(doc);
}
