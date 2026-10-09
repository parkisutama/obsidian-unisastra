// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { describe, expect, it } from "vitest";
import {
	EMPTY_FILE_ELAPSED,
	elapsedMs,
	nextFileElapsedState,
	STOPPED_ELAPSED,
	startElapsed,
} from "@/capabilities/features/toolbar/elapsed";
import { formatElapsed, hudSegments } from "@/capabilities/features/toolbar/hud";

describe("elapsed model", () => {
	it("reports zero while stopped and counts idle time from a timestamp diff", () => {
		expect(elapsedMs(STOPPED_ELAPSED, 10_000)).toBe(0);
		const running = startElapsed(1000);
		expect(elapsedMs(running, 1000)).toBe(0);
		expect(elapsedMs(running, 61_000)).toBe(60_000);
	});
	it("never returns a negative duration for a clock that moved backwards", () => {
		const running = startElapsed(5000);
		expect(elapsedMs(running, 1000)).toBe(0);
	});
});

describe("per-window file elapsed", () => {
	it("initializes from the active file on first load", () => {
		const state = nextFileElapsedState(EMPTY_FILE_ELAPSED, "a.md", 1000);
		expect(state.path).toBe("a.md");
		expect(elapsedMs(state.elapsed, 1000)).toBe(0);
	});
	it("resets on A -> B -> A but not on repeated updates for the same path", () => {
		let state = nextFileElapsedState(EMPTY_FILE_ELAPSED, "a.md", 0);
		state = nextFileElapsedState(state, "a.md", 5000);
		expect(elapsedMs(state.elapsed, 5000)).toBe(5000);

		state = nextFileElapsedState(state, "b.md", 5000);
		expect(state.path).toBe("b.md");
		expect(elapsedMs(state.elapsed, 5000)).toBe(0);

		state = nextFileElapsedState(state, "a.md", 8000);
		expect(state.path).toBe("a.md");
		expect(elapsedMs(state.elapsed, 8000)).toBe(0);
	});
	it("clears the timer when the file becomes null (closed or deleted)", () => {
		let state = nextFileElapsedState(EMPTY_FILE_ELAPSED, "a.md", 0);
		state = nextFileElapsedState(state, null, 1000);
		expect(state).toEqual(EMPTY_FILE_ELAPSED);
	});
	it("resets on rename because the active path changes", () => {
		let state = nextFileElapsedState(EMPTY_FILE_ELAPSED, "old.md", 0);
		state = nextFileElapsedState(state, "old.md", 3000);
		state = nextFileElapsedState(state, "new.md", 3000);
		expect(state.path).toBe("new.md");
		expect(elapsedMs(state.elapsed, 3000)).toBe(0);
	});
});

describe("elapsed formatting", () => {
	it("formats minutes:seconds under an hour and hours:minutes:seconds over", () => {
		expect(formatElapsed(0)).toBe("0:00");
		expect(formatElapsed(65_000)).toBe("1:05");
		expect(formatElapsed(3_661_000)).toBe("1:01:01");
	});
});

describe("HUD segments", () => {
	const timers = {
		sessionVisible: true,
		fileVisible: true,
		sessionPrefix: "Sesi:",
		filePrefix: "File:",
	};
	it("builds a resettable session segment and a non-resettable file segment", () => {
		const segments = hudSegments(timers, 65_000, 5000);
		expect(segments).toEqual([
			{ label: "Sesi: 1:05", tooltip: expect.any(String), resettable: true },
			{ label: "File: 0:05", tooltip: expect.any(String), resettable: false },
		]);
	});
	it("omits a segment whose visibility toggle is off", () => {
		expect(hudSegments({ ...timers, sessionVisible: false }, 0, 0)).toHaveLength(1);
		expect(hudSegments({ ...timers, fileVisible: false }, 0, 0)).toHaveLength(1);
		expect(
			hudSegments({ ...timers, sessionVisible: false, fileVisible: false }, 0, 0),
		).toHaveLength(0);
	});
});
