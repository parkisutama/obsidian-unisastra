export interface ElapsedState {
	readonly startedAt: number | null;
}
export const STOPPED_ELAPSED: ElapsedState = { startedAt: null };
export function startElapsed(now: number): ElapsedState {
	return { startedAt: now };
}
export function elapsedMs(state: ElapsedState, now: number): number {
	return state.startedAt === null ? 0 : Math.max(0, now - state.startedAt);
}
export interface FileElapsedState {
	readonly elapsed: ElapsedState;
	readonly path: string | null;
}
export const EMPTY_FILE_ELAPSED: FileElapsedState = {
	path: null,
	elapsed: STOPPED_ELAPSED,
};
export function nextFileElapsedState(
	current: FileElapsedState,
	activePath: string | null,
	now: number,
): FileElapsedState {
	if (activePath === null) {
		return EMPTY_FILE_ELAPSED;
	}
	if (current.path === activePath) {
		return current;
	}
	return { path: activePath, elapsed: startElapsed(now) };
}
