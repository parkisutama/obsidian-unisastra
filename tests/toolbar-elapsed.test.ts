import { describe, expect, it } from "vitest";
import {
  EMPTY_FILE_ELAPSED,
  elapsedMs,
  nextFileElapsedState,
  STOPPED_ELAPSED,
  startElapsed,
} from "@/capabilities/features/toolbar/elapsed";

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
