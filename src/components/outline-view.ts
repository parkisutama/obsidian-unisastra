// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { syntaxTree } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import {
	Component,
	ItemView,
	MarkdownRenderer,
	MarkdownView,
	Notice,
	setIcon,
	type WorkspaceLeaf,
} from "obsidian";
import { resolveListItem, toggleTaskItem } from "@/cm6/list-service";
import { insertBlockId } from "@/cm6/outliner/block-id";
import {
	indentListItem,
	moveListItemDown,
	moveListItemUp,
	outdentListItem,
} from "@/cm6/outliner/keyboard-ops";
import { getLineContentEndBeforeBlockId, getVisibleRange } from "@/cm6/outliner/utils";
import type UnisastraCore from "@/lib";
import {
	applyOutlineTrail,
	buildOutlineGuides,
	getOutlineTrail,
	type OutlineGuideRow,
	renderOutlineGuides,
} from "./outline-guides";

type TreeNodeRef = Parameters<
	NonNullable<Parameters<ReturnType<typeof syntaxTree>["iterate"]>[0]["enter"]>
>[0];

export const OUTLINE_VIEW_TYPE = "unisastra-outline";

interface OutlineEntry {
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

interface OutlineTreeEntry extends OutlineEntry {
	ancestorIndices: number[];
	childIndices: number[];
	hasChildren: boolean;
	index: number;
	isLastSibling: boolean;
	parentIndex: number | null;
	stateKey: string;
	visualDepth: number;
}

type OutlineFilterMode = "all" | "branch" | "tasks";

interface TaskProgress {
	completed: number;
	total: number;
}

type TaskProgressTone = "idle" | "active" | "complete";

interface OutlineActionSpec {
	icon: string;
	label: string;
	onClick: () => void;
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

function getLineContentEnd(view: EditorView, pos: number): number {
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

function createTextListOutlineEntry(
	line: string,
	pos: number,
	listMatch: RegExpMatchArray,
): OutlineEntry | null {
	const indent = listMatch[1].length;
	const depth = Math.floor(indent / 2);
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

function collectOutlineFromText(doc: string): OutlineEntry[] {
	const entries: OutlineEntry[] = [];
	const lines = doc.split("\n");
	let pos = 0;
	let inFrontmatter = false;

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
			const headingEntry = createTextHeadingOutlineEntry(pos, headingMatch);
			if (headingEntry) {
				entries.push(headingEntry);
			}
			pos += line.length + 1;
			continue;
		}

		const listMatch = line.match(LIST_ITEM_LINE_RE);
		if (listMatch) {
			const listEntry = createTextListOutlineEntry(line, pos, listMatch);
			if (listEntry) {
				entries.push(listEntry);
			}
		}

		pos += line.length + 1;
	}

	return entries;
}

function collectOutlineEntries(view: EditorView): OutlineEntry[] {
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

export class OutlineView extends ItemView {
	private collapseSaveTimeout: number | null = null;
	private collapseState = new Map<string, boolean>();
	private collapseStateFilePath: string | null = null;
	private lastMarkdownView: MarkdownView | null = null;
	private pendingReveal = false;
	private pendingFocusReveal = false;
	private treeEntries: OutlineTreeEntry[] = [];
	private guideRows: OutlineGuideRow[] = [];
	private updateTimeout: number | null = null;
	private readonly tm: UnisastraCore;
	private generation = 0;
	private closed = false;
	private renderComponent: Component | null = null;
	private pendingComponent: Component | null = null;
	private renderSignature = "";
	private renderedEditor: EditorView | null = null;

	private get ownerWindow() {
		return this.contentEl.ownerDocument.defaultView ?? window;
	}

	private invalidateRender() {
		this.generation += 1;
		if (this.pendingComponent) {
			this.removeChild(this.pendingComponent);
			this.pendingComponent = null;
		}
	}

	constructor(leaf: WorkspaceLeaf, tm: UnisastraCore) {
		super(leaf);
		this.tm = tm;
	}

	override getViewType(): string {
		return OUTLINE_VIEW_TYPE;
	}

	override getDisplayText(): string {
		return "Outline";
	}

	override getIcon(): string {
		return "list-tree";
	}

	revealActiveNode(focus = false) {
		this.pendingReveal = true;
		this.pendingFocusReveal = focus;
		this.scheduleUpdate();
	}

	requestRefresh() {
		this.scheduleUpdate();
	}

	setFilterMode(mode: OutlineFilterMode) {
		const sourcePath = this.getActiveSourcePath();
		const currentMode = this.getPreferredFilterMode(sourcePath);
		if (currentMode === mode) {
			return;
		}

		this.persistFilterMode(mode, sourcePath);
		this.pendingReveal = true;
		this.scheduleUpdate();
	}

	cycleFilterMode() {
		const modes: OutlineFilterMode[] = ["all", "branch", "tasks"];
		const currentMode = this.getPreferredFilterMode(this.getActiveSourcePath());
		const currentIndex = modes.indexOf(currentMode);
		const nextMode = modes[(currentIndex + 1) % modes.length];
		this.setFilterMode(nextMode);
		return nextMode;
	}

	override onOpen(): Promise<void> {
		this.closed = false;
		this.buildOutline();
		// Retry after delay in case syntax tree wasn't ready
		this.updateTimeout = this.ownerWindow.setTimeout(() => this.buildOutline(), 1000);

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				this.scheduleUpdate();
			}),
		);
		this.registerEvent(
			this.app.workspace.on("editor-change", () => {
				this.scheduleUpdate();
			}),
		);
		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				this.scheduleUpdate();
			}),
		);
		this.registerEvent(
			this.app.metadataCache.on("changed", (file) => {
				if (file.path === this.getActiveSourcePath()) {
					this.renderSignature = "";
					this.scheduleUpdate();
				}
			}),
		);

		return Promise.resolve();
	}

	override onClose(): Promise<void> {
		this.closed = true;
		this.invalidateRender();
		if (this.renderComponent) {
			this.removeChild(this.renderComponent);
			this.renderComponent = null;
		}
		this.renderSignature = "";
		this.renderedEditor = null;
		if (this.updateTimeout) {
			this.ownerWindow.clearTimeout(this.updateTimeout);
			this.updateTimeout = null;
		}
		if (this.collapseSaveTimeout) {
			window.clearTimeout(this.collapseSaveTimeout);
			this.collapseSaveTimeout = null;
		}

		return Promise.resolve();
	}

	private scheduleUpdate() {
		if (this.closed) {
			return;
		}
		this.invalidateRender();
		if (this.updateTimeout) {
			this.ownerWindow.clearTimeout(this.updateTimeout);
		}
		this.updateTimeout = this.ownerWindow.setTimeout(() => this.buildOutline(), 200);
	}

	private getActiveEntryIndex(entries: OutlineEntry[], selectionPos: number): number {
		for (const [index, entry] of entries.entries()) {
			const nextEntry = entries[index + 1];
			if (selectionPos < entry.pos) {
				continue;
			}

			if (!nextEntry || selectionPos < nextEntry.pos) {
				return index;
			}
		}

		return -1;
	}

	private buildTreeEntries(entries: OutlineEntry[]): OutlineTreeEntry[] {
		const treeEntries = entries.map<OutlineTreeEntry>((entry, index) => ({
			ancestorIndices: [],
			...entry,
			childIndices: [],
			hasChildren: false,
			index,
			isLastSibling: false,
			stateKey: "",
			parentIndex: null,
			visualDepth: 0,
		}));

		const stack: number[] = [];
		for (const entry of treeEntries) {
			while (stack.length > 0 && treeEntries[stack.at(-1) ?? 0].depth >= entry.depth) {
				stack.pop();
			}

			const parentIndex = stack.at(-1) ?? null;
			entry.parentIndex = parentIndex;
			if (parentIndex !== null) {
				treeEntries[parentIndex].childIndices.push(entry.index);
				treeEntries[parentIndex].hasChildren = true;
			}
			entry.ancestorIndices =
				parentIndex === null ? [] : [...treeEntries[parentIndex].ancestorIndices, parentIndex];
			entry.visualDepth = parentIndex === null ? 0 : treeEntries[parentIndex].visualDepth + 1;

			const ancestorPath =
				parentIndex === null ? [] : treeEntries[parentIndex].stateKey.split(" > ");
			entry.stateKey = [...ancestorPath, `${entry.type}:${entry.depth}:${entry.title}`].join(" > ");

			stack.push(entry.index);
		}

		for (const entry of treeEntries) {
			if (entry.parentIndex === null) {
				const rootSiblings = treeEntries.filter((candidate) => candidate.parentIndex === null);
				entry.isLastSibling = rootSiblings.at(-1)?.index === entry.index;
				continue;
			}

			const siblings = treeEntries[entry.parentIndex].childIndices;
			entry.isLastSibling = siblings.at(-1) === entry.index;
		}

		return treeEntries;
	}

	private getVisibleEntries(
		entries: OutlineTreeEntry[],
		filterMode: OutlineFilterMode,
		activeEntryIndex: number,
		branchRootIndex: number | null,
	): OutlineTreeEntry[] {
		const searchVisibleIndices: Set<number> | null = null;
		const structurallyVisible = entries.filter((entry) =>
			this.isEntryStructurallyVisible(entries, entry, searchVisibleIndices),
		);

		if (filterMode === "all") {
			return structurallyVisible;
		}

		if (filterMode === "tasks") {
			return structurallyVisible.filter((entry) => entry.isTask);
		}

		const branchRoot =
			branchRootIndex === null
				? (entries[activeEntryIndex] ?? null)
				: (entries[branchRootIndex] ?? null);
		if (!branchRoot) {
			return structurallyVisible;
		}

		const includedIndices = new Set<number>();
		let ancestorIndex: number | null = branchRoot.index;
		while (ancestorIndex !== null) {
			includedIndices.add(ancestorIndex);
			ancestorIndex = entries[ancestorIndex].parentIndex;
		}

		const collectDescendants = (entry: OutlineTreeEntry) => {
			includedIndices.add(entry.index);
			for (const childIndex of entry.childIndices) {
				collectDescendants(entries[childIndex]);
			}
		};
		collectDescendants(branchRoot);

		return structurallyVisible.filter((entry) => includedIndices.has(entry.index));
	}

	private isEntryStructurallyVisible(
		entries: OutlineTreeEntry[],
		entry: OutlineTreeEntry,
		forcedVisibleIndices: Set<number> | null,
	): boolean {
		let parentIndex = entry.parentIndex;
		while (parentIndex !== null) {
			const parent = entries[parentIndex];
			if (
				this.collapseState.get(parent.stateKey) &&
				!forcedVisibleIndices?.has(entry.index) &&
				!forcedVisibleIndices?.has(parentIndex)
			) {
				return false;
			}
			parentIndex = parent.parentIndex;
		}
		return true;
	}

	private getTaskProgress(entries: OutlineTreeEntry[]): Map<number, TaskProgress> {
		const progressByIndex = new Map<number, TaskProgress>();

		for (let index = entries.length - 1; index >= 0; index--) {
			const entry = entries[index];
			let completed = entry.taskState === "checked" ? 1 : 0;
			let total = entry.isTask ? 1 : 0;

			for (const childIndex of entry.childIndices) {
				const childProgress = progressByIndex.get(childIndex);
				if (!childProgress) {
					continue;
				}

				completed += childProgress.completed;
				total += childProgress.total;
			}

			progressByIndex.set(index, { completed, total });
		}

		return progressByIndex;
	}

	private hasChildHeadingWithTaskProgress(
		entry: OutlineTreeEntry,
		progressByIndex: Map<number, TaskProgress>,
	): boolean {
		for (const childIndex of entry.childIndices) {
			const child = this.treeEntries[childIndex];
			if (child?.type !== "heading") {
				continue;
			}

			const progress = progressByIndex.get(childIndex);
			if (progress && progress.total > 0) {
				return true;
			}
		}

		return false;
	}

	private shouldShowTaskProgress(
		entry: OutlineTreeEntry,
		progress: TaskProgress | undefined,
		progressByIndex: Map<number, TaskProgress>,
	): progress is TaskProgress {
		if (!progress || progress.total === 0) {
			return false;
		}

		if (entry.type === "heading") {
			return !this.hasChildHeadingWithTaskProgress(entry, progressByIndex);
		}

		return entry.hasChildren;
	}

	private toggleCollapsed(entry: OutlineTreeEntry) {
		if (!entry.hasChildren) {
			return;
		}

		const isCollapsed = this.collapseState.get(entry.stateKey) ?? false;
		this.collapseState.set(entry.stateKey, !isCollapsed);
		this.persistCollapseState();
		this.scheduleUpdate();
	}

	private focusSidebarItemByVisibleIndex(index: number) {
		const target = this.contentEl.querySelector<HTMLElement>(`[data-visible-index="${index}"]`);
		target?.focus();
		target?.scrollIntoView({ block: "nearest" });
	}

	private clearHoverTrail() {
		applyOutlineTrail(this.contentEl, new Set(), "is-hover-connector");
		for (const item of Array.from(
			this.contentEl.querySelectorAll<HTMLElement>(".unisastra-outline-item.is-hover-trail"),
		)) {
			item.removeClass("is-hover-trail");
		}
	}

	private applyHoverTrail(entry: OutlineTreeEntry) {
		this.clearHoverTrail();
		applyOutlineTrail(
			this.contentEl,
			getOutlineTrail(this.guideRows, entry.index),
			"is-hover-connector",
		);
		const trailIndices = [...entry.ancestorIndices, entry.index];
		for (const index of trailIndices) {
			const item = this.contentEl.querySelector<HTMLElement>(`[data-tree-index="${index}"]`);
			item?.addClass("is-hover-trail");
		}
	}

	private getActiveSourcePath(): string | null {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		return activeView?.file?.path ?? null;
	}

	private getPreferredFilterMode(filePath: string | null): OutlineFilterMode {
		if (filePath) {
			return (
				this.tm.settings.outliner.sidebarFilterModeByFile[filePath] ??
				this.tm.settings.outliner.sidebarFilterMode
			);
		}

		return this.tm.settings.outliner.sidebarFilterMode;
	}

	private getEffectiveFilterMode(
		filePath: string | null,
		focusedRootPos: number | null,
	): OutlineFilterMode {
		if (focusedRootPos !== null) {
			return "branch";
		}

		return this.getPreferredFilterMode(filePath);
	}

	private persistFilterMode(mode: OutlineFilterMode, filePath: string | null) {
		this.tm.settings.outliner.sidebarFilterMode = mode;
		if (filePath) {
			this.tm.settings.outliner.sidebarFilterModeByFile[filePath] = mode;
		}
		this.tm.saveSettings().catch((error) => {
			console.error("Failed to save outline filter mode:", error);
		});
	}

	private expandAncestorChain(entries: OutlineTreeEntry[], entryIndex: number) {
		let parentIndex = entries[entryIndex]?.parentIndex ?? null;
		let didChange = false;

		while (parentIndex !== null) {
			const parent = entries[parentIndex];
			if (this.collapseState.get(parent.stateKey)) {
				this.collapseState.set(parent.stateKey, false);
				didChange = true;
			}
			parentIndex = parent.parentIndex;
		}

		if (didChange) {
			this.persistCollapseState();
		}
	}

	private getBranchRootIndex(
		entries: OutlineTreeEntry[],
		focusedRootPos: number | null,
		activeEntryIndex: number,
	): number | null {
		if (focusedRootPos !== null) {
			return entries.find((entry) => entry.pos === focusedRootPos)?.index ?? null;
		}

		return activeEntryIndex >= 0 ? activeEntryIndex : null;
	}

	private syncCollapseState(filePath: string) {
		if (this.collapseStateFilePath === filePath) {
			return;
		}

		const savedState = this.tm.settings.outliner.sidebarCollapseState[filePath] ?? {};
		this.collapseState = new Map(Object.entries(savedState));
		this.collapseStateFilePath = filePath;
	}

	private persistCollapseState() {
		const filePath = this.collapseStateFilePath;
		if (!filePath) {
			return;
		}

		if (this.collapseSaveTimeout) {
			window.clearTimeout(this.collapseSaveTimeout);
		}

		this.collapseSaveTimeout = window.setTimeout(() => {
			this.tm.settings.outliner.sidebarCollapseState[filePath] = Object.fromEntries(
				this.collapseState,
			);
			this.tm.saveSettings().catch((error) => {
				console.error("Failed to save outline collapse state:", error);
			});
		}, 200);
	}

	private revealActiveItemIfNeeded(activeItem: HTMLElement) {
		const viewport = this.contentEl;
		const viewportRect = viewport.getBoundingClientRect();
		const itemRect = activeItem.getBoundingClientRect();
		const isAbove = itemRect.top < viewportRect.top;
		const isBelow = itemRect.bottom > viewportRect.bottom;

		if (isAbove || isBelow) {
			activeItem.scrollIntoView({ block: "nearest" });
		}
	}

	private getActiveEditorContext(): {
		activeView: MarkdownView;
		cm: EditorView;
		sourcePath: string;
	} | null {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		const fallbackView =
			this.lastMarkdownView ??
			this.app.workspace
				.getLeavesOfType("markdown")
				.map((leaf) => leaf.view)
				.find((view): view is MarkdownView => view instanceof MarkdownView) ??
			null;
		const resolvedView = activeView ?? fallbackView;
		if (!resolvedView) {
			return null;
		}

		const cm = (resolvedView.editor as unknown as { cm: EditorView }).cm;
		if (!cm) {
			return null;
		}

		this.lastMarkdownView = resolvedView;

		return {
			activeView: resolvedView,
			cm,
			sourcePath: resolvedView.file?.path ?? this.app.vault.getRoot().path,
		};
	}

	private renderEmptyState(message: string) {
		this.contentEl.createDiv({
			cls: "unisastra-outline-empty",
			text: message,
		});
	}

	private createNavigateToEntryHandler(
		cm: EditorView,
		entry: OutlineTreeEntry,
		focusedRootPos: number | null,
	) {
		return (event: MouseEvent | KeyboardEvent) => {
			const target = event.target;
			if (target instanceof HTMLElement && target.closest("a.internal-link, a.external-link")) {
				return;
			}

			event.preventDefault();
			if (focusedRootPos !== null) {
				if (entry.pos === focusedRootPos) {
					this.tm.outlinerUnfocus(cm);
				} else {
					this.tm.outlinerFocusAtPosition(cm, entry.pos);
				}
				cm.focus();
				this.scheduleUpdate();
				return;
			}

			const targetPos = getLineContentEnd(cm, entry.pos);
			cm.dispatch({
				selection: { anchor: targetPos },
				effects: EditorView.scrollIntoView(targetPos, { y: "center" }),
			});
			cm.focus();
		};
	}

	private expandEntry(entry: OutlineTreeEntry): boolean {
		if (!(entry.hasChildren && (this.collapseState.get(entry.stateKey) ?? false))) {
			return false;
		}

		this.collapseState.set(entry.stateKey, false);
		this.persistCollapseState();
		this.scheduleUpdate();
		return true;
	}

	private collapseEntry(entry: OutlineTreeEntry): boolean {
		if (!(entry.hasChildren && !(this.collapseState.get(entry.stateKey) ?? false))) {
			return false;
		}

		this.collapseState.set(entry.stateKey, true);
		this.persistCollapseState();
		this.scheduleUpdate();
		return true;
	}

	private focusFirstVisibleChild(entry: OutlineTreeEntry, visibleEntries: OutlineTreeEntry[]) {
		if (entry.childIndices.length === 0) {
			return;
		}

		const firstChildIndex = visibleEntries.findIndex(
			(candidate) => candidate.index === entry.childIndices[0],
		);
		if (firstChildIndex >= 0) {
			this.focusSidebarItemByVisibleIndex(firstChildIndex);
		}
	}

	private focusVisibleParent(entry: OutlineTreeEntry, visibleEntries: OutlineTreeEntry[]) {
		if (entry.parentIndex === null) {
			return;
		}

		const parentVisibleIndex = visibleEntries.findIndex(
			(candidate) => candidate.index === entry.parentIndex,
		);
		if (parentVisibleIndex >= 0) {
			this.focusSidebarItemByVisibleIndex(parentVisibleIndex);
		}
	}

	private handleOutlineItemKeydown(
		event: KeyboardEvent,
		entry: OutlineTreeEntry,
		visibleEntries: OutlineTreeEntry[],
		visibleIndex: number,
		cm: EditorView,
		navigateToEntry: (event: KeyboardEvent) => void,
	) {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			this.focusSidebarItemByVisibleIndex(Math.min(visibleEntries.length - 1, visibleIndex + 1));
			return;
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();
			this.focusSidebarItemByVisibleIndex(Math.max(0, visibleIndex - 1));
			return;
		}

		if (event.key === "ArrowRight") {
			event.preventDefault();
			if (this.expandEntry(entry)) {
				return;
			}

			this.focusFirstVisibleChild(entry, visibleEntries);
			return;
		}

		if (event.key === "ArrowLeft") {
			event.preventDefault();
			if (this.collapseEntry(entry)) {
				return;
			}

			this.focusVisibleParent(entry, visibleEntries);
			return;
		}

		if (event.key === "Enter" || event.key === " ") {
			navigateToEntry(event);
			return;
		}

		if (event.key === "F2" || (event.key === "Enter" && (event.metaKey || event.ctrlKey))) {
			event.preventDefault();
			this.tm.outlinerFocusAtPosition(cm, entry.pos);
			cm.focus();
			this.scheduleUpdate();
		}
	}

	private renderEntryLead(
		content: HTMLElement,
		cm: EditorView,
		entry: OutlineTreeEntry,
		guideRow: OutlineGuideRow,
	) {
		const lead = content.createDiv({
			cls: "unisastra-outline-lead",
		});
		renderOutlineGuides(lead, guideRow, entry.hasChildren);

		const node = lead.createDiv({
			cls: `unisastra-outline-node unisastra-outline-node-${entry.type}`,
		});
		if (entry.hasChildren) {
			const disclosure = node.createEl("button", {
				cls: "unisastra-outline-disclosure",
				attr: {
					"aria-expanded": String(!(this.collapseState.get(entry.stateKey) ?? false)),
					"aria-label": `${
						this.collapseState.get(entry.stateKey) ? "Expand" : "Collapse"
					} ${entry.title}`,
					type: "button",
				},
			});
			disclosure.setText(this.collapseState.get(entry.stateKey) ? "+" : "−");
			disclosure.addEventListener("click", (event) => {
				event.preventDefault();
				event.stopPropagation();
				this.toggleCollapsed(entry);
			});
		} else {
			node.createDiv({ cls: "unisastra-outline-disclosure-spacer" });
		}

		if (entry.isTask) {
			const checkbox = node.createEl("input", {
				cls: "unisastra-outline-task-toggle",
				attr: {
					type: "checkbox",
					"aria-label": `Toggle task ${entry.title}`,
				},
			});
			checkbox.checked = entry.taskState === "checked";
			checkbox.addEventListener("click", (event) => {
				event.preventDefault();
				event.stopPropagation();
				this.toggleTaskEntry(cm, entry);
			});
			return;
		}

		node.createDiv({
			cls: `unisastra-outline-marker unisastra-outline-marker-${entry.type}`,
		});
	}

	private async renderOutlineList(
		list: HTMLElement,
		visibleEntries: OutlineTreeEntry[],
		activeEntryIndex: number,
		focusedRootPos: number | null,
		cm: EditorView,
		sourcePath: string,
		taskProgressByIndex: Map<number, TaskProgress>,
		guideRows: OutlineGuideRow[],
		component: Component,
		generation: number,
	) {
		for (const [visibleIndex, entry] of visibleEntries.entries()) {
			if (this.closed || generation !== this.generation) {
				return;
			}
			const item = list.createDiv({
				cls: `unisastra-outline-item unisastra-outline-${entry.type}`,
			});
			item.style.setProperty("--unisastra-outline-depth", `${entry.visualDepth}`);
			item.classList.toggle("is-active", entry.index === activeEntryIndex);
			item.classList.toggle("is-focused-root", focusedRootPos === entry.pos);
			item.setAttribute("role", "button");
			item.tabIndex = 0;
			item.setAttribute("aria-label", `Jump to ${entry.title}`);
			item.dataset.isLastSibling = String(entry.isLastSibling);
			item.dataset.treeIndex = String(entry.index);
			item.dataset.visibleIndex = String(visibleIndex);

			const content = item.createDiv({
				cls: "unisastra-outline-link",
			});

			this.renderEntryLead(content, cm, entry, guideRows[visibleIndex]);

			const markdownEl = content.createDiv({
				cls: "unisastra-outline-content markdown-rendered",
			});

			await MarkdownRenderer.render(
				this.app,
				entry.contentMarkdown,
				markdownEl,
				sourcePath,
				component,
			);
			if (this.closed || generation !== this.generation) {
				component.unload();
				return;
			}
			this.buildItemActions(item, entry, taskProgressByIndex.get(entry.index), taskProgressByIndex);

			const navigateToEntry = this.createNavigateToEntryHandler(cm, entry, focusedRootPos);
			item.addEventListener("mouseenter", () => {
				this.applyHoverTrail(entry);
			});
			item.addEventListener("mouseleave", () => {
				this.clearHoverTrail();
			});
			item.addEventListener("focusin", () => {
				applyOutlineTrail(list, getOutlineTrail(this.guideRows, entry.index), "is-focus-connector");
			});
			item.addEventListener("focusout", (event) => {
				if (!item.contains(event.relatedTarget as Node | null)) {
					applyOutlineTrail(list, new Set(), "is-focus-connector");
				}
			});
			item.addEventListener("click", navigateToEntry);
			item.addEventListener("dblclick", (event) => {
				event.preventDefault();
				if (focusedRootPos !== null) {
					return;
				}
				this.tm.outlinerFocusAtPosition(cm, entry.pos);
				cm.focus();
			});
			item.addEventListener("keydown", (event) => {
				this.handleOutlineItemKeydown(
					event,
					entry,
					visibleEntries,
					visibleIndex,
					cm,
					navigateToEntry,
				);
			});
		}
		applyOutlineTrail(list, getOutlineTrail(guideRows, activeEntryIndex), "is-active-connector");
	}

	private handleRevealResult(
		list: HTMLElement,
		filterMode: OutlineFilterMode,
		focusedRootPos: number | null,
		sourcePath: string,
	) {
		const activeItem = list.querySelector<HTMLElement>(".unisastra-outline-item.is-active");
		if (activeItem) {
			if (this.pendingReveal) {
				activeItem.scrollIntoView({ block: "nearest" });
				if (this.pendingFocusReveal) {
					activeItem.focus();
				}
				this.pendingReveal = false;
				this.pendingFocusReveal = false;
				return;
			}

			this.revealActiveItemIfNeeded(activeItem);
			return;
		}

		if (this.pendingReveal && filterMode !== "all" && focusedRootPos === null) {
			this.persistFilterMode("all", sourcePath);
			this.scheduleUpdate();
			return;
		}

		this.pendingReveal = false;
		this.pendingFocusReveal = false;
	}

	private async buildOutline() {
		if (this.closed) {
			return;
		}
		this.invalidateRender();
		const generation = this.generation;
		const container = this.contentEl.ownerDocument.createElement("div");

		const editorContext = this.getActiveEditorContext();
		if (!editorContext) {
			this.clearRenderedOutline();
			this.renderEmptyState("No active document");
			return;
		}

		const { cm, sourcePath } = editorContext;
		this.syncCollapseState(sourcePath);

		const entries = collectOutlineEntries(cm);
		if (entries.length === 0) {
			this.clearRenderedOutline();
			this.renderEmptyState("No outline entries");
			return;
		}

		const treeEntries = this.buildTreeEntries(entries);
		const activeEntryIndex = this.getActiveEntryIndex(entries, cm.state.selection.main.head);
		const focusedRange = getVisibleRange(cm.state);
		const focusedRootPos = focusedRange?.from ?? null;
		const filterMode = this.getEffectiveFilterMode(sourcePath, focusedRootPos);
		const branchRootIndex = this.getBranchRootIndex(treeEntries, focusedRootPos, activeEntryIndex);

		if (activeEntryIndex >= 0 && this.pendingReveal) {
			this.expandAncestorChain(treeEntries, activeEntryIndex);
		}
		if (branchRootIndex !== null && filterMode === "branch") {
			this.expandAncestorChain(treeEntries, branchRootIndex);
		}

		const visibleEntries = this.getVisibleEntries(
			treeEntries,
			filterMode,
			activeEntryIndex,
			branchRootIndex,
		);
		const taskProgressByIndex = this.getTaskProgress(treeEntries);
		const signature = JSON.stringify([
			sourcePath,
			focusedRootPos,
			filterMode,
			visibleEntries,
			[...taskProgressByIndex],
			[...this.collapseState],
		]);
		const existingList = this.contentEl.querySelector<HTMLElement>(".unisastra-outline-list");
		if (signature === this.renderSignature && cm === this.renderedEditor && existingList) {
			this.updateActiveOutlineRow(existingList, activeEntryIndex, entries);
			this.handleRevealResult(existingList, filterMode, focusedRootPos, sourcePath);
			return;
		}
		if (activeEntryIndex >= 0) {
			this.buildToolbar(container, entries[activeEntryIndex], visibleEntries.length);
		}

		const list = container.createDiv({ cls: "unisastra-outline-list" });
		const guideRows = buildOutlineGuides(visibleEntries);
		const component = this.addChild(new Component());
		this.pendingComponent = component;
		try {
			await this.renderOutlineList(
				list,
				visibleEntries,
				activeEntryIndex,
				focusedRootPos,
				cm,
				sourcePath,
				taskProgressByIndex,
				guideRows,
				component,
				generation,
			);
		} catch (error) {
			this.removeChild(component);
			if (this.pendingComponent === component) {
				this.pendingComponent = null;
			}
			console.error("Unisastra: outline render failed", error);
			return;
		}
		if (this.closed || generation !== this.generation) {
			this.removeChild(component);
			return;
		}
		if (this.renderComponent) {
			this.removeChild(this.renderComponent);
		}
		this.renderComponent = component;
		this.pendingComponent = null;
		this.treeEntries = treeEntries;
		this.guideRows = guideRows;
		this.renderSignature = signature;
		this.renderedEditor = cm;
		this.contentEl.replaceChildren(...Array.from(container.childNodes));
		this.handleRevealResult(list, filterMode, focusedRootPos, sourcePath);
	}

	private clearRenderedOutline() {
		if (this.renderComponent) {
			this.removeChild(this.renderComponent);
			this.renderComponent = null;
		}
		this.renderSignature = "";
		this.renderedEditor = null;
		this.treeEntries = [];
		this.guideRows = [];
		this.contentEl.empty();
	}

	private updateActiveOutlineRow(list: HTMLElement, activeIndex: number, entries: OutlineEntry[]) {
		for (const row of Array.from(list.querySelectorAll<HTMLElement>(".unisastra-outline-item"))) {
			row.classList.toggle("is-active", Number(row.dataset.treeIndex) === activeIndex);
		}
		const title = this.contentEl.querySelector(".unisastra-outline-toolbar-title");
		if (title) {
			title.textContent = entries[activeIndex]?.title ?? "";
		}
		applyOutlineTrail(list, getOutlineTrail(this.guideRows, activeIndex), "is-active-connector");
	}

	private buildToolbar(container: HTMLElement, activeEntry: OutlineEntry, visibleCount: number) {
		const toolbar = container.createDiv({ cls: "unisastra-outline-toolbar" });
		const heading = toolbar.createDiv({
			cls: "unisastra-outline-toolbar-title",
		});
		heading.setText(activeEntry.title);

		const meta = toolbar.createDiv({ cls: "unisastra-outline-toolbar-meta" });
		meta.createDiv({
			cls: "unisastra-outline-toolbar-meta-item",
			text: `${visibleCount} visible`,
		});
	}

	private toggleTaskEntry(cm: EditorView, entry: OutlineEntry) {
		const item = resolveListItem(cm.state, entry.pos);
		if (!item) {
			return;
		}

		const change = toggleTaskItem(cm.state, item);
		if (!change) {
			return;
		}

		cm.dispatch({ changes: change, userEvent: "input.toggle" });
		this.scheduleUpdate();
	}

	private buildItemActions(
		itemEl: HTMLElement,
		entry: OutlineTreeEntry,
		progress: TaskProgress | undefined,
		progressByIndex: Map<number, TaskProgress>,
	) {
		const linkEl = itemEl.querySelector<HTMLElement>(".unisastra-outline-link");
		if (!linkEl) {
			return;
		}

		const trailing = linkEl.createDiv({
			cls: "unisastra-outline-item-trailing",
		});
		if (this.shouldShowTaskProgress(entry, progress, progressByIndex)) {
			const progressTone = this.getTaskProgressTone(progress);
			itemEl.dataset.progressTone = progressTone;
			trailing.createDiv({
				cls: `unisastra-outline-item-progress is-${progressTone}`,
				text: `${progress.completed}/${progress.total}`,
			});
		} else {
			delete itemEl.dataset.progressTone;
		}

		const actions = trailing.createDiv({
			cls: "unisastra-outline-item-actions",
		});
		const actionSpecs: OutlineActionSpec[] = [
			{
				icon: "list-tree",
				label: "Focus",
				onClick: () => {
					const editorContext = this.getActiveEditorContext();
					if (!editorContext) {
						return;
					}

					this.tm.outlinerFocusAtPosition(editorContext.cm, entry.pos);
					editorContext.cm.focus();
					this.scheduleUpdate();
				},
			},
			{
				icon: "link",
				label: "Copy block link",
				onClick: () => {
					this.copyBlockReference(entry.pos, false);
				},
			},
			{
				icon: "box",
				label: "Copy block embed",
				onClick: () => {
					this.copyBlockReference(entry.pos, true);
				},
			},
		];

		if (entry.type === "list-item") {
			actionSpecs.push(
				{
					icon: "arrow-up",
					label: "Move up",
					onClick: () => {
						this.runListOperation(entry.pos, moveListItemUp);
					},
				},
				{
					icon: "arrow-down",
					label: "Move down",
					onClick: () => {
						this.runListOperation(entry.pos, moveListItemDown);
					},
				},
				{
					icon: "indent",
					label: "Indent",
					onClick: () => {
						this.runListOperation(entry.pos, indentListItem);
					},
				},
				{
					icon: "outdent",
					label: "Outdent",
					onClick: () => {
						this.runListOperation(entry.pos, outdentListItem);
					},
				},
			);
		}

		for (const action of actionSpecs) {
			this.createItemAction(actions, action);
		}
	}

	private getTaskProgressTone(progress: TaskProgress): TaskProgressTone {
		if (progress.completed === 0) {
			return "idle";
		}

		if (progress.completed >= progress.total) {
			return "complete";
		}

		return "active";
	}

	private createItemAction(container: HTMLElement, action: OutlineActionSpec) {
		const button = container.createEl("button", {
			cls: "unisastra-outline-item-action",
			attr: {
				type: "button",
				"aria-label": action.label,
				title: action.label,
			},
		});
		setIcon(button, action.icon);
		button.addEventListener("click", (event) => {
			event.preventDefault();
			event.stopPropagation();
			action.onClick();
		});
	}

	private copyBlockReference(pos: number, asEmbed: boolean) {
		const editorContext = this.getActiveEditorContext();
		if (!editorContext) {
			return;
		}

		const { activeView, cm } = editorContext;
		const file = activeView.file;
		if (!file) {
			return;
		}

		const line = cm.state.doc.lineAt(pos);
		cm.dispatch({ selection: { anchor: line.from } });
		const blockId = insertBlockId(cm);
		const reference = `${asEmbed ? "!" : ""}[[${file.basename}#^${blockId}]]`;
		navigator.clipboard.writeText(reference).catch((error) => {
			console.error("Failed to copy outline reference:", error);
		});
		new Notice(`Copied: ${reference}`);
		cm.focus();
		this.scheduleUpdate();
	}

	private runListOperation(
		pos: number,
		operation: (target: {
			state: EditorView["state"];
			dispatch: EditorView["dispatch"];
		}) => boolean,
	) {
		const editorContext = this.getActiveEditorContext();
		if (!editorContext) {
			return;
		}

		const { cm } = editorContext;
		const line = cm.state.doc.lineAt(pos);
		cm.dispatch({ selection: { anchor: line.from } });
		if (!operation({ state: cm.state, dispatch: cm.dispatch })) {
			new Notice("This action only works on list items.");
			return;
		}

		cm.focus();
		this.pendingReveal = true;
		this.scheduleUpdate();
	}
}
