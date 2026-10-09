import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";

type TreeNode = ReturnType<ReturnType<typeof syntaxTree>["resolve"]>;

// ---- Types ----

export interface ListItemInfo {
	blockId: string | null;
	contentFrom: number;
	contentText: string;
	/** Nesting depth: 0 = root-level item */
	depth: number;
	from: number;
	hasChildren: boolean;
	isTask: boolean;
	marker: string;
	node: TreeNode;
	/** Document node (HyperMD uses flat structure, no list containers) */
	parentList: TreeNode;
	taskState: "checked" | "unchecked" | null;
	/** End offset including all nested children (subtree end) */
	to: number;
}

// ---- Internal helpers (HyperMD-compatible) ----

const BLOCK_ID_RE = /\s\^([\w-]+)$/;
const LIST_LINE_RE = /^HyperMD-list-line_HyperMD-list-line-(\d+)/;
const HEADING_LINE_RE = /^HyperMD-header_HyperMD-header-(\d+)/;
const LIST_MARKER_RE = /^(\s*)([-+*]|\d+\.)\s/;
const TASK_MARKER_RE = /^(\s*)([-+*]|\d+\.)\s+\[([ xX])\]\s/;

function isHyperMDListLine(name: string): boolean {
	return LIST_LINE_RE.test(name);
}

/** Extract 0-indexed depth from HyperMD node name */
function getListLineDepth(name: string): number {
	const match = name.match(LIST_LINE_RE);
	return match ? Number(match[1]) - 1 : 0;
}

function getHeadingLevel(name: string): number {
	const match = name.match(HEADING_LINE_RE);
	return match ? Number(match[1]) : 0;
}

/** Walk up from a position to find the enclosing HyperMD-list-line node */
function findListLineNode(state: EditorState, pos: number): TreeNode | null {
	const tree = syntaxTree(state);
	let node: TreeNode | null = tree.resolve(pos, 1);
	while (node) {
		if (isHyperMDListLine(node.name)) {
			return node;
		}
		node = node.parent;
	}
	return null;
}

/** Build a ListItemInfo from a HyperMD-list-line node */
function buildItemFromNode(
	state: EditorState,
	node: TreeNode,
	subtreeTo: number,
	hasChildren: boolean,
): ListItemInfo {
	const doc = state.doc;
	const depth = getListLineDepth(node.name);
	const line = doc.lineAt(node.from);
	const lineText = line.text;

	const markerMatch = lineText.match(LIST_MARKER_RE);
	const marker = markerMatch ? markerMatch[2] : "-";

	let contentFrom = line.from;
	if (markerMatch) {
		contentFrom = line.from + markerMatch[0].length;
	}

	const taskMatch = lineText.match(TASK_MARKER_RE);
	if (taskMatch) {
		contentFrom = line.from + taskMatch[0].length;
	}

	const contentText = doc.sliceString(contentFrom, line.to).trim();
	const blockIdMatch = contentText.match(BLOCK_ID_RE);
	let taskState: "checked" | "unchecked" | null = null;
	if (taskMatch?.[3] === " ") {
		taskState = "unchecked";
	} else if (taskMatch) {
		taskState = "checked";
	}

	return {
		node,
		from: node.from,
		to: subtreeTo,
		depth,
		parentList: node.parent ?? node,
		hasChildren,
		marker,
		isTask: taskMatch !== null,
		taskState,
		contentText,
		contentFrom,
		blockId: blockIdMatch ? blockIdMatch[1] : null,
	};
}

// ---- Core query functions ----

export function resolveListItem(state: EditorState, pos: number): ListItemInfo | null {
	const listNode = findListLineNode(state, pos);
	if (!listNode) {
		return null;
	}

	const depth = getListLineDepth(listNode.name);
	const doc = state.doc;
	const startLine = doc.lineAt(listNode.from);

	let subtreeTo = startLine.to;
	let hasChildren = false;
	for (let lineNum = startLine.number + 1; lineNum <= doc.lines; lineNum++) {
		const line = doc.line(lineNum);
		const lineNode = findListLineNode(state, line.from);
		if (!lineNode) {
			break;
		}
		const lineDepth = getListLineDepth(lineNode.name);
		if (lineDepth <= depth) {
			break;
		}
		hasChildren = true;
		subtreeTo = line.to;
	}

	return buildItemFromNode(state, listNode, subtreeTo, hasChildren);
}

export function getAllListItems(state: EditorState): ListItemInfo[] {
	const tree = syntaxTree(state);
	const doc = state.doc;

	// Collect all list line nodes in document order
	const rawItems: Array<{
		node: TreeNode;
		depth: number;
		lineTo: number;
	}> = [];
	tree.iterate({
		enter(nodeRef) {
			if (isHyperMDListLine(nodeRef.name)) {
				const line = doc.lineAt(nodeRef.from);
				rawItems.push({
					node: nodeRef.node,
					depth: getListLineDepth(nodeRef.name),
					lineTo: line.to,
				});
				return false;
			}
		},
	});

	// Sort by position and deduplicate by line
	rawItems.sort((a, b) => a.node.from - b.node.from);
	const seen = new Set<number>();
	const deduped = rawItems.filter((r) => {
		const lineStart = doc.lineAt(r.node.from).from;
		if (seen.has(lineStart)) {
			return false;
		}
		seen.add(lineStart);
		return true;
	});

	// Calculate subtree end and hasChildren for each item
	const items: ListItemInfo[] = [];
	for (let i = 0; i < deduped.length; i++) {
		const raw = deduped[i];
		let subtreeTo = raw.lineTo;
		let hasChildren = false;
		for (let j = i + 1; j < deduped.length; j++) {
			if (deduped[j].depth <= raw.depth) {
				break;
			}
			hasChildren = true;
			subtreeTo = deduped[j].lineTo;
		}
		items.push(buildItemFromNode(state, raw.node, subtreeTo, hasChildren));
	}

	return items;
}

export function getSubtreeRange(
	state: EditorState,
	item: ListItemInfo,
): { from: number; to: number; text: string } {
	// Always capture from the start of the line to include leading indentation
	const lineFrom = state.doc.lineAt(item.from).from;
	const text = state.doc.sliceString(lineFrom, item.to);
	return { from: lineFrom, to: item.to, text };
}

export function getPreviousSibling(state: EditorState, item: ListItemInfo): ListItemInfo | null {
	const doc = state.doc;
	const startLine = doc.lineAt(item.from);

	for (let lineNum = startLine.number - 1; lineNum >= 1; lineNum--) {
		const line = doc.line(lineNum);
		const node = findListLineNode(state, line.from);
		if (!node) {
			return null;
		}
		const depth = getListLineDepth(node.name);
		if (depth === item.depth) {
			return resolveListItem(state, line.from);
		}
		if (depth < item.depth) {
			return null;
		}
	}
	return null;
}

export function getNextSibling(state: EditorState, item: ListItemInfo): ListItemInfo | null {
	const doc = state.doc;
	const endLine = doc.lineAt(item.to);

	for (let lineNum = endLine.number + 1; lineNum <= doc.lines; lineNum++) {
		const line = doc.line(lineNum);
		const node = findListLineNode(state, line.from);
		if (!node) {
			return null;
		}
		const depth = getListLineDepth(node.name);
		if (depth === item.depth) {
			return resolveListItem(state, line.from);
		}
		if (depth < item.depth) {
			return null;
		}
	}
	return null;
}

export function getParentItem(state: EditorState, item: ListItemInfo): ListItemInfo | null {
	if (item.depth === 0) {
		return null;
	}

	const doc = state.doc;
	const startLine = doc.lineAt(item.from);

	for (let lineNum = startLine.number - 1; lineNum >= 1; lineNum--) {
		const line = doc.line(lineNum);
		const node = findListLineNode(state, line.from);
		if (!node) {
			return null;
		}
		const depth = getListLineDepth(node.name);
		if (depth < item.depth) {
			return resolveListItem(state, line.from);
		}
	}
	return null;
}

export function getFirstChild(state: EditorState, item: ListItemInfo): ListItemInfo | null {
	if (!item.hasChildren) {
		return null;
	}

	const doc = state.doc;
	const startLine = doc.lineAt(item.from);

	for (let lineNum = startLine.number + 1; lineNum <= doc.lines; lineNum++) {
		const line = doc.line(lineNum);
		const node = findListLineNode(state, line.from);
		if (!node) {
			return null;
		}
		const depth = getListLineDepth(node.name);
		if (depth <= item.depth) {
			return null;
		}
		if (depth === item.depth + 1) {
			return resolveListItem(state, line.from);
		}
	}

	return null;
}

export function getIndentForDepth(state: EditorState, depth: number): string {
	const tabSize = state.tabSize;
	return " ".repeat(tabSize).repeat(depth);
}

export function reindentText(
	state: EditorState,
	text: string,
	currentDepth: number,
	targetDepth: number,
): string {
	if (currentDepth === targetDepth) {
		return text;
	}

	const tabSize = state.tabSize;
	const depthDiff = targetDepth - currentDepth;
	const lines = text.split("\n");

	// Detect whether the text uses tabs or spaces for indentation
	const usesTabs = lines.some((line) => line.startsWith("\t"));

	return lines
		.map((line) => {
			if (line.trim() === "") {
				return line;
			}

			// Count the visual indent columns
			let visualIndent = 0;
			let charIdx = 0;
			for (; charIdx < line.length; charIdx++) {
				if (line[charIdx] === "\t") {
					visualIndent += tabSize;
				} else if (line[charIdx] === " ") {
					visualIndent += 1;
				} else {
					break;
				}
			}

			const content = line.slice(charIdx);
			const newVisualIndent = Math.max(0, visualIndent + depthDiff * tabSize);

			if (usesTabs) {
				const tabs = Math.floor(newVisualIndent / tabSize);
				const spaces = newVisualIndent % tabSize;
				return "\t".repeat(tabs) + " ".repeat(spaces) + content;
			}
			return " ".repeat(newVisualIndent) + content;
		})
		.join("\n");
}

export function toggleTaskItem(
	state: EditorState,
	item: ListItemInfo,
): { from: number; to: number; insert: string } | null {
	if (!item.isTask) {
		return null;
	}

	const line = state.doc.lineAt(item.from);
	const taskMatch = line.text.match(TASK_MARKER_RE);
	if (!(taskMatch && taskMatch.index !== undefined)) {
		return null;
	}

	const markerOffset = taskMatch[0].lastIndexOf("[");
	if (markerOffset < 0) {
		return null;
	}

	const checkboxPos = line.from + taskMatch.index + markerOffset + 1;
	const nextState = taskMatch[3] === " " ? "x" : " ";
	return {
		from: checkboxPos,
		to: checkboxPos + 1,
		insert: nextState,
	};
}

export function calculateOutlinerRange(
	state: EditorState,
	pos: number,
): { from: number; to: number } | null {
	// Check for list item
	const listNode = findListLineNode(state, pos);
	if (listNode) {
		const item = resolveListItem(state, pos);
		if (item) {
			return { from: item.from, to: item.to };
		}
	}

	// Check for heading
	const tree = syntaxTree(state);
	let node: TreeNode | null = tree.resolve(pos, 1);
	while (node) {
		if (HEADING_LINE_RE.test(node.name)) {
			return calculateHeadingRange(state, node);
		}
		node = node.parent;
	}

	// Fallback: try from line start
	const line = state.doc.lineAt(pos);
	node = tree.resolve(line.from, 1);
	while (node) {
		if (isHyperMDListLine(node.name)) {
			const item = resolveListItem(state, line.from);
			if (item) {
				return { from: item.from, to: item.to };
			}
		}
		if (HEADING_LINE_RE.test(node.name)) {
			return calculateHeadingRange(state, node);
		}
		node = node.parent;
	}

	return null;
}

function calculateHeadingRange(
	state: EditorState,
	headingNode: TreeNode,
): { from: number; to: number } {
	const level = getHeadingLevel(headingNode.name);
	const from = headingNode.from;
	let to = state.doc.length;

	const doc = state.doc;
	const startLine = doc.lineAt(from);

	for (let lineNum = startLine.number + 1; lineNum <= doc.lines; lineNum++) {
		const line = doc.line(lineNum);
		let lineNode: TreeNode | null = syntaxTree(state).resolve(line.from, 1);
		// Walk up to find line-level node
		while (lineNode?.parent && lineNode.parent.name !== "Document") {
			lineNode = lineNode.parent;
		}
		if (lineNode && HEADING_LINE_RE.test(lineNode.name)) {
			const siblingLevel = getHeadingLevel(lineNode.name);
			if (siblingLevel <= level) {
				to = line.from - 1;
				break;
			}
		}
	}

	return { from, to: Math.max(from, to) };
}
