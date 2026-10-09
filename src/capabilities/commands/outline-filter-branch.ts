import { Notice } from "obsidian";
import { AbstractCommand } from "../base/abstract-command";

export class OutlineFilterBranch extends AbstractCommand {
	readonly commandKey = "outline-filter-branch";
	readonly commandTitle = "Outliner: Show current branch in sidebar";

	protected override registerCommand() {
		this.tm.plugin.addCommand({
			id: this.commandKey,
			name: this.commandTitle,
			icon: "git-branch",
			callback: async () => {
				const ok = await this.tm.setOutlineFilterMode("branch");
				if (!ok) {
					new Notice("Unable to open the outline sidebar.");
				}
			},
		});
	}
}
