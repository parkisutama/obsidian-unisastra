import { isolateHistory } from "@codemirror/commands";
import {
  type EditorState,
  Transaction,
  type TransactionSpec,
} from "@codemirror/state";
import {
  boldEdit,
  codeEdit,
  headingEdit,
  highlightEdit,
  italicEdit,
  strikethroughEdit,
  type TextEdit,
  type ToolbarAction,
} from "./actions";

type InlineActionKind = Exclude<ToolbarAction["kind"], "heading">;
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
    visible: { from: number; to: number } | null;
  };
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
  selection: TransactionSpec["selection"]
): void {
  target.dispatch({
    changes: edit,
    selection,
    annotations: [
      Transaction.userEvent.of("input.toolbar"),
      isolateHistory.of("full"),
    ],
  });
}
function executeHeadingAction(target: ToolbarTarget): string | null {
  const line = target.state.doc.lineAt(target.state.selection.main.head);
  const visible = target.policy().visible;
  if (visible && (line.from < visible.from || line.to > visible.to)) {
    return "Cursor line is outside the focused outline.";
  }
  const edit = headingEdit(line.text, line.from, line.to);
  if (!edit) {
    return "Heading level is not supported by the toolbar.";
  }
  dispatchToolbarEdit(target, edit, { anchor: edit.from + edit.insert.length });
  return null;
}
function executeInlineAction(
  target: ToolbarTarget,
  kind: InlineActionKind
): string | null {
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
    range.to
  );
  dispatchToolbarEdit(
    target,
    edit,
    range.anchor <= range.head
      ? { anchor: edit.from, head: edit.from + edit.insert.length }
      : { anchor: edit.from + edit.insert.length, head: edit.from }
  );
  return null;
}
export function executeToolbarAction(
  target: ToolbarTarget,
  action: ToolbarAction
): string | null {
  const issue = targetIssue(target);
  if (issue) {
    return issue;
  }
  return action.kind === "heading"
    ? executeHeadingAction(target)
    : executeInlineAction(target, action.kind);
}
