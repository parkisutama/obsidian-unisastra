import type { EditorState } from "@codemirror/state";
import { calculateOutlinerRange as lezerCalculateRange } from "@/cm6/list-service";

export function calculateOutlinerRange(
	state: EditorState,
	pos: number,
): { from: number; to: number } | null {
	return lezerCalculateRange(state, pos);
}
