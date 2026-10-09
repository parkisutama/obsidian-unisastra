import { syntaxTree } from "@codemirror/language";
import {
	Decoration,
	type DecorationSet,
	type EditorView,
	ViewPlugin,
	type ViewUpdate,
} from "@codemirror/view";
import { editorLivePreviewField } from "obsidian";
import { resolveListItem } from "@/cm6/list-service";
import type UnisastraCore from "@/lib";
import { foldEditorContext } from "./fold-context";

const BLOCK_ID_LINE_RE = / \^[\w-]+$/;

function hiddenIdRange(view: EditorView, line: { text: string; from: number; to: number }) {
	const match = line.text.match(BLOCK_ID_LINE_RE);
	if (
		!match ||
		match.index === undefined ||
		resolveListItem(view.state, line.from)?.from !== line.from
	) {
		return null;
	}
	const from = line.from + match.index;
	if (
		view.state.selection.ranges.some(
			(selection) => selection.from <= line.to && selection.to >= from,
		)
	) {
		return null;
	}
	return { from, to: line.to };
}

/** ViewPlugin that hides block IDs in Live Preview via Decoration.replace() */
export function createBlockIdHiderPlugin(tm: UnisastraCore) {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;
			enabled = false;

			constructor(view: EditorView) {
				this.decorations = this.build(view);
			}

			update(update: ViewUpdate) {
				if (
					update.docChanged ||
					update.viewportChanged ||
					update.selectionSet ||
					update.state !== update.startState
				) {
					if (
						!(update.docChanged || update.viewportChanged || update.selectionSet) &&
						syntaxTree(update.state) === syntaxTree(update.startState) &&
						this.enabled === this.isEnabled(update.view)
					) {
						return;
					}
					this.decorations = this.build(update.view);
				}
			}

			isEnabled(view: EditorView): boolean {
				return (
					tm.settings.blockId.isBlockIdEnabled &&
					tm.settings.blockId.isHideIdsInLivePreviewEnabled &&
					!!view.state.field(editorLivePreviewField, false) &&
					!!foldEditorContext(tm, view)
				);
			}

			build(view: EditorView): DecorationSet {
				this.enabled = this.isEnabled(view);
				if (!this.enabled) {
					return Decoration.none;
				}
				const ranges: Array<{ from: number; to: number }> = [];
				const seen = new Set<number>();
				const doc = view.state.doc;

				for (const { from, to } of view.visibleRanges) {
					let pos = from;
					while (pos <= to) {
						const line = doc.lineAt(pos);
						if (seen.has(line.from)) {
							pos = line.to + 1;
							continue;
						}
						seen.add(line.from);
						const range = hiddenIdRange(view, line);
						if (range) {
							ranges.push(range);
						}
						pos = line.to + 1;
					}
				}

				return Decoration.set(
					ranges.map((r) => Decoration.replace({}).range(r.from, r.to)),
					true,
				);
			}
		},
		{ decorations: (v) => v.decorations },
	);
}

export function collectBlockIds(text: string): Set<string> {
	return new Set([...text.matchAll(/\s\^([\w-]+)[ \t]*$/gm)].map((match) => match[1]));
}

export function generateUniqueBlockId(ids: Set<string>): string {
	for (let attempt = 0; attempt < 64; attempt++) {
		const id = generateBlockId();
		if (!ids.has(id)) {
			ids.add(id);
			return id;
		}
	}
	throw new Error("Unable to generate a unique block ID");
}

/** Generate a new block ID string in the format ol-XXXXX */
export function generateBlockId(): string {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	let id = "ol-";
	for (let i = 0; i < 5; i++) {
		id += chars[Math.floor(Math.random() * chars.length)];
	}
	return id;
}

/** Insert a block ID on the current line if none exists, returns the ID */
export function insertBlockId(view: EditorView): string {
	const pos = view.state.selection.main.head;
	const line = view.state.doc.lineAt(pos);

	// Check if line already has a block ID
	const existing = line.text.match(BLOCK_ID_LINE_RE);
	if (existing) {
		return existing[0].trim().slice(1); // Return existing ID without ^
	}

	const newId = generateUniqueBlockId(collectBlockIds(view.state.doc.toString()));
	view.dispatch({
		changes: {
			from: line.to,
			insert: ` ^${newId}`,
		},
	});
	return newId;
}
