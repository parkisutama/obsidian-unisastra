import type { FeatureToggle } from "../base/feature-toggle";
import { ToggleCommand } from "../base/toggle-command";

export class ToggleShowWhitespace extends ToggleCommand {
	readonly commandKey = "show-whitespace";
	readonly commandTitle = "whitespace visibility";
	protected featureToggle = this.tm.features.showWhitespace[
		"showWhitespace.isShowWhitespaceEnabled"
	] as FeatureToggle;
}
