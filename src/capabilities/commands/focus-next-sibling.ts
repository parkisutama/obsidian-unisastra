import type { EditorView } from "@codemirror/view";
import type { Editor, MarkdownFileInfo, MarkdownView } from "obsidian";
import { EditorCommand } from "../base/editor-command";

export class FocusNextSibling extends EditorCommand {
	readonly commandKey = "focus-next-sibling";
	readonly commandTitle = "Outliner: Focus next sibling";

	protected override registerCommand() {
		this.tm.plugin.addCommand({
			id: this.commandKey,
			name: this.commandTitle,
			icon: "arrow-down-to-line",
			editorCallback: this.onCommand.bind(this),
		});
	}

	protected onCommand(editor: Editor, _view: MarkdownView | MarkdownFileInfo) {
		const cm = (editor as unknown as { cm: EditorView }).cm;
		this.tm.focusOutlinerRelation(cm, "next-sibling");
	}
}
