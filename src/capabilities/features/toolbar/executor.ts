import { isolateHistory } from "@codemirror/commands";
import {
  type EditorState,
  Transaction,
  type TransactionSpec,
} from "@codemirror/state";
import { boldEdit, type ToolbarAction } from "./actions";

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
export function executeToolbarAction(
  target: ToolbarTarget,
  _action: ToolbarAction
): string | null {
  const issue = targetIssue(target);
  if (issue) {
    return issue;
  }
  const range = target.state.selection.main;
  if (range.empty) {
    return "Select text to format.";
  }
  const visible = target.policy().visible;
  if (visible && (range.from < visible.from || range.to > visible.to)) {
    return "Selection is outside the focused outline.";
  }
  const edit = boldEdit(
    target.state.sliceDoc(range.from, range.to),
    range.from,
    range.to
  );
  target.dispatch({
    changes: edit,
    selection:
      range.anchor <= range.head
        ? { anchor: edit.from, head: edit.from + edit.insert.length }
        : { anchor: edit.from + edit.insert.length, head: edit.from },
    annotations: [
      Transaction.userEvent.of("input.toolbar"),
      isolateHistory.of("full"),
    ],
  });
  return null;
}
