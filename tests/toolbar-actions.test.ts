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
  it("wraps and unwraps italic without matching a bold selection", async () => {
    const editor = target("before hello after", 7, 12);
    expect(
      await executeToolbarAction(editor.port, { kind: "italic" })
    ).toBeNull();
    expect(editor.text()).toBe("before *hello* after");
    await executeToolbarAction(editor.port, { kind: "italic" });
    expect(editor.text()).toBe("before hello after");

    const bolded = target("**hello**", 0, 9);
    expect(
      await executeToolbarAction(bolded.port, { kind: "italic" })
    ).toBeNull();
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
  it("cycles heading level on the cursor's line without touching other lines", async () => {
    const editor = target("intro\nbody text\noutro");
    editor.setSelection(6, 6);
    expect(
      await executeToolbarAction(editor.port, { kind: "heading" })
    ).toBeNull();
    expect(editor.text()).toBe("intro\n# body text\noutro");
    await executeToolbarAction(editor.port, { kind: "heading" });
    expect(editor.text()).toBe("intro\n## body text\noutro");
    for (let i = 0; i < 3; i++) {
      await executeToolbarAction(editor.port, { kind: "heading" });
    }
    expect(editor.text()).toBe("intro\nbody text\noutro");
  });
  it("refuses heading levels beyond H4", async () => {
    const editor = target("##### too deep");
    expect(
      await executeToolbarAction(editor.port, { kind: "heading" })
    ).toMatch("not supported");
    expect(editor.text()).toBe("##### too deep");
  });
});
