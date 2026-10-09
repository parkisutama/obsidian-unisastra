import { Notice } from "obsidian";
import { AbstractCommand } from "../base/abstract-command";

export class OutlineFilterTasks extends AbstractCommand {
	readonly commandKey = "outline-filter-tasks";
	readonly commandTitle = "Outliner: Show tasks only in sidebar";

	protected override registerCommand() {
		this.tm.plugin.addCommand({
			id: this.commandKey,
			name: this.commandTitle,
			icon: "check-square",
			callback: async () => {
				const ok = await this.tm.setOutlineFilterMode("tasks");
				if (!ok) {
					new Notice("Unable to open the outline sidebar.");
				}
			},
		});
	}
}
