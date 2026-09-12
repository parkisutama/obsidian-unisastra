import { history, undo, undoDepth } from "@codemirror/commands";
import { EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";
import {
  executeToolbarAction,
  type ToolbarTarget,
} from "@/capabilities/features/toolbar/executor";

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
    visible: { from: 0, to: 10_000 },
  };
  const port: ToolbarTarget = {
    get state() {
      return state;
    },
    dispatch: (transaction) => {
      state = state.update(transaction).state;
    },
    policy: () => policy,
  };
  return { port, policy, text: () => state.doc.toString() };
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
    expect(
      await executeToolbarAction(editor.port, { kind: "bold" })
    ).toBeNull();
    expect(editor.text()).toBe("before **hello** after");
    await executeToolbarAction(editor.port, { kind: "bold" });
    expect(editor.text()).toBe("before hello after");
  });
  it("refuses Hemingway, stale target and ranges outside the outline", async () => {
    const editor = target();
    editor.policy.hemingway = true;
    expect(await executeToolbarAction(editor.port, { kind: "bold" })).toMatch(
      "Hemingway"
    );
    editor.policy.hemingway = false;
    editor.policy.current = false;
    expect(await executeToolbarAction(editor.port, { kind: "bold" })).toMatch(
      "changed"
    );
    editor.policy.current = true;
    editor.policy.visible.to = 3;
    expect(await executeToolbarAction(editor.port, { kind: "bold" })).toMatch(
      "outline"
    );
    expect(editor.text()).toBe("hello");
  });
  it("does nothing for empty selections or disabled targets", async () => {
    const editor = target("hello", 0, 0);
    expect(await executeToolbarAction(editor.port, { kind: "bold" })).toMatch(
      "Select"
    );
    editor.policy.enabled = false;
    expect(await executeToolbarAction(editor.port, { kind: "bold" })).toMatch(
      "disabled"
    );
    expect(editor.text()).toBe("hello");
  });
});
