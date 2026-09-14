// Zoom-out concept inspired by vslinko's obsidian-zoom
// (https://github.com/vslinko/obsidian-zoom). No code ported — see
// outliner-focus.ts.

import type { EditorView } from "@codemirror/view";
import type { Editor, MarkdownFileInfo, MarkdownView } from "obsidian";
import { EditorCommand } from "../base/editor-command";

export class OutlinerUnfocus extends EditorCommand {
  readonly commandKey = "zoom-out";
  readonly commandTitle = "Outliner: Unfocus (show full document)";

  protected override registerCommand() {
    this.tm.plugin.addCommand({
      id: this.commandKey,
      name: this.commandTitle,
      icon: "list",
      editorCallback: this.onCommand.bind(this),
    });
  }

  protected onCommand(editor: Editor, _view: MarkdownView | MarkdownFileInfo) {
    const cm = (editor as unknown as { cm: EditorView }).cm;
    this.tm.outlinerUnfocus(cm);
  }
}
