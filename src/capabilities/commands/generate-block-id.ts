import type { EditorView } from "@codemirror/view";
import type { Editor, MarkdownFileInfo, MarkdownView } from "obsidian";
import { Notice } from "obsidian";
import { insertBlockId } from "@/cm6/outliner/block-id";
import { EditorCommand } from "../base/editor-command";

export class GenerateBlockId extends EditorCommand {
	readonly commandKey = "generate-block-id";
	readonly commandTitle = "Outliner: Generate block ID";

	protected override registerCommand() {
		this.tm.plugin.addCommand({
			id: this.commandKey,
			name: this.commandTitle,
			icon: "hash",
			editorCallback: this.onCommand.bind(this),
		});
	}

	protected onCommand(editor: Editor, _view: MarkdownView | MarkdownFileInfo) {
		const cm = (editor as unknown as { cm: EditorView }).cm;
		const blockId = insertBlockId(cm);
		new Notice(`Block ID: ^${blockId}`);
	}
}
