import { StateEffect as SE, type StateEffect } from "@codemirror/state";

export interface OutlinerRange {
	from: number;
	to: number;
}

export type OutlinerFocusEffect = StateEffect<OutlinerRange>;

export const outlinerFocusEffect = SE.define<OutlinerRange>();
export const outlinerUnfocusEffect = SE.define<void>();

export function isOutlinerFocusEffect(e: StateEffect<unknown>): e is OutlinerFocusEffect {
	return e.is(outlinerFocusEffect);
}
