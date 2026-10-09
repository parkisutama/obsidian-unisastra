import type UnisastraCore from "@/lib";
import type { AbstractCommand } from "../base/abstract-command";
import { CopyBlockEmbed } from "./copy-block-embed";
import { CopyBlockLink } from "./copy-block-link";
import { FocusFirstChild } from "./focus-first-child";
import { FocusNextSibling } from "./focus-next-sibling";
import { FocusParent } from "./focus-parent";
import { FocusPreviousSibling } from "./focus-previous-sibling";
import { GenerateBlockId } from "./generate-block-id";
import { IndentListItem } from "./indent-list-item";
import { MoveListDown } from "./move-list-down";
import { MoveListUp } from "./move-list-up";
import { MoveTypewriterDown, MoveTypewriterUp } from "./move-typewriter";
import { OutdentListItem } from "./outdent-list-item";
import { OutlineFilterAll } from "./outline-filter-all";
import { OutlineFilterBranch } from "./outline-filter-branch";
import { OutlineFilterCycle } from "./outline-filter-cycle";
import { OutlineFilterTasks } from "./outline-filter-tasks";
import { OutlinerFocus } from "./outliner-focus";
import { OutlinerUnfocus } from "./outliner-unfocus";
import { RevealActiveOutlineNode } from "./reveal-active-outline-node";
import SetWritingModeCommand, { WRITING_MODES } from "./set-writing-mode";
import { ToggleDimming } from "./toggle-dimming";
import { ToggleHemingwayMode } from "./toggle-hemingway-mode";
import { TogglePlugin } from "./toggle-plugin";
import { ToggleShowWhitespace } from "./toggle-show-whitespace";
import { ToggleTypewriter } from "./toggle-typewriter";
import { ToggleTypewriterAndDimming } from "./toggle-typewriter-and-dimming";
import { ManageCalloutsCommand, toolbarActionCommands } from "./toolbar-actions";
import { WritingFocusCommand } from "./writing-focus";

export function getCommands(tm: UnisastraCore): Record<string, AbstractCommand> {
	return Object.fromEntries(
		[
			new TogglePlugin(tm),
			new ToggleTypewriter(tm),
			new ToggleDimming(tm),
			new ToggleTypewriterAndDimming(tm),
			new MoveTypewriterUp(tm),
			new MoveTypewriterDown(tm),
			new WritingFocusCommand(tm),
			new ToggleHemingwayMode(tm),
			new ToggleShowWhitespace(tm),
			new OutlinerFocus(tm),
			new OutlinerUnfocus(tm),
			new RevealActiveOutlineNode(tm),
			new FocusParent(tm),
			new FocusFirstChild(tm),
			new FocusNextSibling(tm),
			new FocusPreviousSibling(tm),
			new MoveListUp(tm),
			new MoveListDown(tm),
			new IndentListItem(tm),
			new OutdentListItem(tm),
			new OutlineFilterAll(tm),
			new OutlineFilterBranch(tm),
			new OutlineFilterTasks(tm),
			new OutlineFilterCycle(tm),
			new CopyBlockLink(tm),
			new CopyBlockEmbed(tm),
			new GenerateBlockId(tm),
			new ManageCalloutsCommand(tm),
			...toolbarActionCommands(tm),
			...WRITING_MODES.map(({ mode, label }) => new SetWritingModeCommand(tm, mode, label)),
		].map((cmd) => [cmd.commandKey, cmd]),
	);
}
