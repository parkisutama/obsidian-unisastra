import type UnisastraCore from "@/lib";
import type { Feature } from "../base/feature";
import blockId from "./block-id";
import compatibility from "./compatibility";
import currentLine from "./current-line";
import dimming from "./dimming";
import foldPersist from "./fold-persist";
import general from "./general";
import hemingwayMode from "./hemingway-mode";
import keepAboveAndBelow from "./keep-above-and-below";
import maxChar from "./max-char";
import outliner from "./outliner";
import showWhitespace from "./show-whitespace";
import toolbar from "./toolbar";
import typewriter from "./typewriter";
import writingFocus from "./writing-focus";
import writingModes from "./writing-modes";

export function getFeatures(tm: UnisastraCore): Record<string, Record<string, Feature>> {
	return {
		writingModes: writingModes(tm),
		general: general(tm),
		writingFocus: writingFocus(tm),
		outliner: outliner(tm),
		compatibility: compatibility(tm),
		blockId: blockId(tm),
		foldPersist: foldPersist(tm),
		hemingwayMode: hemingwayMode(tm),
		dimming: dimming(tm),
		currentLine: currentLine(tm),
		typewriter: typewriter(tm),
		keepAboveAndBelow: keepAboveAndBelow(tm),
		showWhitespace: showWhitespace(tm),
		maxChar: maxChar(tm),
		toolbar: toolbar(tm),
	};
}
