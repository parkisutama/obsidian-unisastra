import { isolateHistory } from "@codemirror/commands";
import { type EditorState, Transaction, type TransactionSpec } from "@codemirror/state";
import { calloutEdit } from "@/capabilities/features/callouts/markdown";
import {
	boldEdit,
	codeEdit,
	type HeadingLevel,
	headingEdit,
	highlightEdit,
	isLikelyUrl,
	italicEdit,
	LINK_PLACEHOLDER_URL,
	linkUnwrapEdit,
	linkWrapEdit,
	strikethroughEdit,
	type TextEdit,
	type ToolbarAction,
} from "./actions";

type InlineActionKind = Exclude<ToolbarAction["kind"], "heading" | "link" | "callout">;
const INLINE_EDITORS: Record<
	InlineActionKind,
	(text: string, from: number, to: number) => TextEdit
> = {
	bold: boldEdit,
	italic: italicEdit,
	strikethrough: strikethroughEdit,
	code: codeEdit,
	highlight: highlightEdit,
};

export interface ToolbarTarget {
	dispatch: (spec: TransactionSpec) => void;
	policy: () => {
		enabled: boolean;
		current: boolean;
		hemingway: boolean;
		smartUrl: boolean;
		visible: { from: number; to: number } | null;
	};
	readClipboardText?: () => Promise<string>;
	readonly state: EditorState;
}
export function targetIssue(target: ToolbarTarget): string | null {
	const policy = target.policy();
	if (!policy.enabled) {
		return "Toolbar actions are disabled in this editor.";
	}
	if (!policy.current) {
		return "The target editor changed. Select the text again.";
	}
	if (policy.hemingway) {
		return "Formatting is unavailable while Hemingway mode is active.";
	}
	if (target.state.selection.ranges.length !== 1) {
		return "Multiple selections are not supported by the toolbar.";
	}
	return null;
}
function dispatchToolbarEdit(
	target: ToolbarTarget,
	edit: TextEdit,
	selection: TransactionSpec["selection"],
): void {
	target.dispatch({
		changes: edit,
		selection,
		annotations: [Transaction.userEvent.of("input.toolbar"), isolateHistory.of("full")],
	});
}
function executeHeadingAction(target: ToolbarTarget, level: HeadingLevel): string | null {
	const line = target.state.doc.lineAt(target.state.selection.main.head);
	const visible = target.policy().visible;
	if (visible && (line.from < visible.from || line.to > visible.to)) {
		return "Cursor line is outside the focused outline.";
	}
	const edit = headingEdit(line.text, line.from, line.to, level);
	if (!edit) {
		return "Heading level is not supported by the toolbar.";
	}
	dispatchToolbarEdit(target, edit, { anchor: edit.from + edit.insert.length });
	return null;
}
function executeInlineAction(target: ToolbarTarget, kind: InlineActionKind): string | null {
	const range = target.state.selection.main;
	if (range.empty) {
		return "Select text to format.";
	}
	const visible = target.policy().visible;
	if (visible && (range.from < visible.from || range.to > visible.to)) {
		return "Selection is outside the focused outline.";
	}
	const edit = INLINE_EDITORS[kind](
		target.state.sliceDoc(range.from, range.to),
		range.from,
		range.to,
	);
	dispatchToolbarEdit(
		target,
		edit,
		range.anchor <= range.head
			? { anchor: edit.from, head: edit.from + edit.insert.length }
			: { anchor: edit.from + edit.insert.length, head: edit.from },
	);
	return null;
}
async function executeLinkAction(target: ToolbarTarget): Promise<string | null> {
	const range = target.state.selection.main;
	if (range.empty) {
		return "Select text to format.";
	}
	const visible = target.policy().visible;
	if (visible && (range.from < visible.from || range.to > visible.to)) {
		return "Selection is outside the focused outline.";
	}
	const selectedText = target.state.sliceDoc(range.from, range.to);
	const unwrapped = linkUnwrapEdit(selectedText, range.from, range.to);
	if (unwrapped) {
		dispatchToolbarEdit(target, unwrapped, {
			anchor: unwrapped.from,
			head: unwrapped.from + unwrapped.insert.length,
		});
		return null;
	}

	let url = LINK_PLACEHOLDER_URL;
	if (target.policy().smartUrl) {
		try {
			const clipboardText = (await target.readClipboardText?.())?.trim() ?? "";
			if (isLikelyUrl(clipboardText)) {
				url = clipboardText;
			}
		} catch {
			// Clipboard unavailable or denied; keep the placeholder URL.
		}
		const current = target.state.selection.main;
		const revalidated = target.policy();
		const stillSameSelection =
			target.state.selection.ranges.length === 1 &&
			current.from === range.from &&
			current.to === range.to;
		if (
			!(revalidated.enabled && revalidated.current) ||
			revalidated.hemingway ||
			!stillSameSelection
		) {
			return "The target changed while reading the clipboard. Link was not inserted.";
		}
	}

	const edit = linkWrapEdit(selectedText, range.from, range.to, url);
	dispatchToolbarEdit(target, edit, { anchor: edit.urlFrom, head: edit.urlTo });
	return null;
}
function executeCalloutAction(target: ToolbarTarget, id: string): string | null {
	const range = target.state.selection.main;
	if (range.empty) {
		return "Select text to format.";
	}
	const visible = target.policy().visible;
	if (visible && (range.from < visible.from || range.to > visible.to)) {
		return "Selection is outside the focused outline.";
	}
	const result = calloutEdit(target.state.sliceDoc(range.from, range.to), id);
	if ("refusal" in result) {
		return result.refusal;
	}
	const edit: TextEdit = {
		from: range.from,
		to: range.to,
		insert: result.insert,
	};
	dispatchToolbarEdit(target, edit, { anchor: edit.from + edit.insert.length });
	return null;
}
export function executeToolbarAction(
	target: ToolbarTarget,
	action: ToolbarAction,
): string | null | Promise<string | null> {
	const issue = targetIssue(target);
	if (issue) {
		return issue;
	}
	if (action.kind === "heading") {
		return executeHeadingAction(target, action.level);
	}
	if (action.kind === "link") {
		return executeLinkAction(target);
	}
	if (action.kind === "callout") {
		return executeCalloutAction(target, action.id);
	}
	return executeInlineAction(target, action.kind);
}
