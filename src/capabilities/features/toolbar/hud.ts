export function formatElapsed(ms: number): string {
	const totalSeconds = Math.max(0, Math.floor(ms / 1000));
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	const pad = (value: number) => value.toString().padStart(2, "0");
	return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}
export interface HudTimerSettings {
	readonly filePrefix: string;
	readonly fileVisible: boolean;
	readonly sessionPrefix: string;
	readonly sessionVisible: boolean;
}
export interface HudSegment {
	readonly label: string;
	readonly resettable: boolean;
	readonly tooltip: string;
}
export function hudSegments(
	timers: HudTimerSettings,
	sessionMs: number,
	fileMs: number,
): HudSegment[] {
	const segments: HudSegment[] = [];
	if (timers.sessionVisible) {
		segments.push({
			label: `${timers.sessionPrefix} ${formatElapsed(sessionMs)}`.trim(),
			tooltip: "Time since the toolbar was enabled or last reset.",
			resettable: true,
		});
	}
	if (timers.fileVisible) {
		segments.push({
			label: `${timers.filePrefix} ${formatElapsed(fileMs)}`.trim(),
			tooltip: "Time spent on the current file in this window.",
			resettable: false,
		});
	}
	return segments;
}
