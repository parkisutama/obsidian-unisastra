import { beforeEach, describe, expect, it, vi } from "vitest";
import HemingwayMode from "@/capabilities/features/hemingway-mode/hemingway-mode";
import { DEFAULT_SETTINGS } from "@/capabilities/settings";

function createTm(
  settingsOverrides: Partial<typeof DEFAULT_SETTINGS.hemingwayMode> = {}
) {
  return {
    saveSettings: vi.fn(),
    settings: {
      ...structuredClone(DEFAULT_SETTINGS),
      hemingwayMode: {
        ...structuredClone(DEFAULT_SETTINGS.hemingwayMode),
        isHemingwayModeEnabled: true,
        ...settingsOverrides,
      },
    },
  };
}

function fakeKeydown(key: string, extra: Record<string, unknown> = {}) {
  return {
    ctrlKey: false,
    defaultPrevented: false,
    key,
    metaKey: false,
    preventDefault(this: { defaultPrevented: boolean }) {
      this.defaultPrevented = true;
    },
    stopPropagation: vi.fn(),
    ...extra,
  };
}

function dispatch(mode: HemingwayMode, event: ReturnType<typeof fakeKeydown>) {
  const withHandler = mode as unknown as {
    keyboardHandler: (event: ReturnType<typeof fakeKeydown>) => void;
  };
  withHandler.keyboardHandler(event);
  return event;
}

describe("HemingwayMode granular key controls", () => {
  let tm: ReturnType<typeof createTm>;

  beforeEach(() => {
    tm = createTm();
  });

  it("blocks ArrowLeft by default", () => {
    const mode = new HemingwayMode(tm as never);
    const event = dispatch(mode, fakeKeydown("ArrowLeft"));
    expect(event.defaultPrevented).toBe(true);
  });

  it("allows ArrowRight by default so the cursor can move past an auto-paired closer", () => {
    const mode = new HemingwayMode(tm as never);
    const event = dispatch(mode, fakeKeydown("ArrowRight"));
    expect(event.defaultPrevented).toBe(false);
  });

  it("respects a granular toggle allowing an individually enabled key", () => {
    tm = createTm({ isAllowHomeInHemingwayModeEnabled: true });
    const mode = new HemingwayMode(tm as never);
    const event = dispatch(mode, fakeKeydown("Home"));
    expect(event.defaultPrevented).toBe(false);
  });

  it("still blocks a key that was not individually allowed", () => {
    tm = createTm({ isAllowHomeInHemingwayModeEnabled: true });
    const mode = new HemingwayMode(tm as never);
    const event = dispatch(mode, fakeKeydown("End"));
    expect(event.defaultPrevented).toBe(true);
  });

  it("blocks undo unless isAllowUndoInHemingwayModeEnabled is set", () => {
    const mode = new HemingwayMode(tm as never);
    const blocked = dispatch(mode, fakeKeydown("z", { ctrlKey: true }));
    expect(blocked.defaultPrevented).toBe(true);

    tm = createTm({ isAllowUndoInHemingwayModeEnabled: true });
    const mode2 = new HemingwayMode(tm as never);
    const allowed = dispatch(mode2, fakeKeydown("z", { ctrlKey: true }));
    expect(allowed.defaultPrevented).toBe(false);
  });

  it("does nothing when Hemingway mode is disabled", () => {
    tm = createTm({ isHemingwayModeEnabled: false });
    const mode = new HemingwayMode(tm as never);
    const event = dispatch(mode, fakeKeydown("ArrowLeft"));
    expect(event.defaultPrevented).toBe(false);
  });

  it("blocks Backspace by default, matching the existing Allow Backspace toggle", () => {
    const mode = new HemingwayMode(tm as never);
    const event = dispatch(mode, fakeKeydown("Backspace"));
    expect(event.defaultPrevented).toBe(true);
  });

  it("allows Backspace when isAllowBackspaceInHemingwayModeEnabled is set", () => {
    tm = createTm({ isAllowBackspaceInHemingwayModeEnabled: true });
    const mode = new HemingwayMode(tm as never);
    const event = dispatch(mode, fakeKeydown("Backspace"));
    expect(event.defaultPrevented).toBe(false);
  });
});
