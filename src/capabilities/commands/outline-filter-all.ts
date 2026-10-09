import { Notice } from "obsidian";
import { AbstractCommand } from "../base/abstract-command";

export class OutlineFilterAll extends AbstractCommand {
	readonly commandKey = "outline-filter-all";
	readonly commandTitle = "Outliner: Show all nodes in sidebar";

	protected override registerCommand() {
		this.tm.plugin.addCommand({
			id: this.commandKey,
			name: this.commandTitle,
			icon: "list",
			callback: async () => {
				const ok = await this.tm.setOutlineFilterMode("all");
				if (!ok) {
					new Notice("Unable to open the outline sidebar.");
				}
			},
		});
	}
}
