import type UnisastraCore from "@/lib";
import CurrentLineHighlightColorBase from "./current-line-highlight-color-base";

export default class CurrentLineHighlightColorDark extends CurrentLineHighlightColorBase {
	constructor(tm: UnisastraCore) {
		super(tm, "dark");
	}
}
