import type { EditorView } from "@codemirror/view";
import type { Editor, MarkdownFileInfo, MarkdownView } from "obsidian";
import { outdentListItem } from "@/cm6/outliner/keyboard-ops";
import { EditorCommand } from "../base/editor-command";

export class OutdentListItem extends EditorCommand {
	readonly commandKey = "outdent-list-item";
	readonly commandTitle = "Outliner: Outdent list item";

	protected override registerCommand() {
		this.tm.plugin.addCommand({
			id: this.commandKey,
			name: this.commandTitle,
			icon: "outdent",
			editorCallback: this.onCommand.bind(this),
		});
	}

	protected onCommand(editor: Editor, _view: MarkdownView | MarkdownFileInfo) {
		const cm = (editor as unknown as { cm: EditorView }).cm;
		outdentListItem({ state: cm.state, dispatch: cm.dispatch });
	}
}
