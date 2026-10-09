import type { EditorView } from "@codemirror/view";
import type { Editor, MarkdownFileInfo, MarkdownView } from "obsidian";
import { Notice } from "obsidian";
import { insertBlockId } from "@/cm6/outliner/block-id";
import { EditorCommand } from "../base/editor-command";

export class CopyBlockLink extends EditorCommand {
	readonly commandKey = "copy-block-link";
	readonly commandTitle = "Outliner: Copy block link";

	protected override registerCommand() {
		this.tm.plugin.addCommand({
			id: this.commandKey,
			name: this.commandTitle,
			icon: "link",
			editorCallback: this.onCommand.bind(this),
		});
	}

	protected onCommand(editor: Editor, _view: MarkdownView | MarkdownFileInfo) {
		const cm = (editor as unknown as { cm: EditorView }).cm;
		const blockId = insertBlockId(cm);
		const file = this.tm.plugin.app.workspace.getActiveFile();
		if (!file) {
			return;
		}

		const link = `[[${file.basename}#^${blockId}]]`;
		navigator.clipboard.writeText(link);
		new Notice(`Copied: ${link}`);
	}
}
