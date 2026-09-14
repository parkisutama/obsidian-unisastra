import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "@/capabilities/settings";

vi.mock("obsidian", () => ({
  ItemView: class ItemView {},
  Platform: { isMobile: false },
}));

function createFakeElectronWindow() {
  const listeners = new Map<string, () => void>();
  return {
    isFullScreen: vi.fn(() => false),
    setFullScreen: vi.fn(),
    on: vi.fn((event: string, handler: () => void) => {
      listeners.set(event, handler);
    }),
    off: vi.fn((event: string) => {
      listeners.delete(event);
    }),
  };
}

function createFakeSplit() {
  return { collapsed: false, collapse: vi.fn(), expand: vi.fn() };
}

function createFakeDoc() {
  const classes = new Set<string>();
  return {
    body: {
      classList: {
        contains: (cls: string) => classes.has(cls),
        add: (cls: string) => classes.add(cls),
        remove: (cls: string) => classes.delete(cls),
        toggle: (cls: string, force?: boolean) => {
          const shouldHave = force ?? !classes.has(cls);
          if (shouldHave) {
            classes.add(cls);
          } else {
            classes.delete(cls);
          }
        },
      },
    },
    querySelectorAll: () => [],
  };
}

function createTm(activeView: { getViewType(): string } | null) {
  const leftSplit = createFakeSplit();
  const rightSplit = createFakeSplit();
  const containerEl = {
    hasClass: vi.fn(() => false),
    removeClass: vi.fn(),
    toggleClass: vi.fn(),
  };

  return {
    plugin: {
      app: {
        workspace: {
          leftSplit,
          rightSplit,
          containerEl,
          getActiveViewOfType: vi.fn(() => activeView),
        },
      },
    },
    settings: structuredClone(DEFAULT_SETTINGS),
  };
}

describe("WritingFocus.disableFocusMode", () => {
  let fakeWindow: ReturnType<typeof createFakeElectronWindow>;

  beforeEach(() => {
    fakeWindow = createFakeElectronWindow();
    vi.stubGlobal("window", {
      activeDocument: createFakeDoc(),
      electron: { remote: { getCurrentWindow: () => fakeWindow } },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exits native fullscreen even when no ItemView is active, so window controls always come back", async () => {
    const { WritingFocus } = await import(
      "@/capabilities/commands/writing-focus/writing-focus"
    );
    const activeView = { getViewType: () => "markdown" };
    const tm = createTm(activeView);
    const writingFocus = new WritingFocus(tm as never);

    writingFocus.enableFocusMode();
    expect(fakeWindow.setFullScreen).toHaveBeenCalledWith(true);

    // simulate focus moving to a pane that isn't a matching ItemView
    // (e.g. search, or the active view briefly returning null) while
    // still in native fullscreen — this used to strand the user with no
    // window controls and no way to exit.
    tm.plugin.app.workspace.getActiveViewOfType = vi.fn(() => null);

    writingFocus.disableFocusMode();

    expect(fakeWindow.setFullScreen).toHaveBeenCalledWith(false);
  });

  it("is a no-op when focus mode was never enabled", async () => {
    const { WritingFocus } = await import(
      "@/capabilities/commands/writing-focus/writing-focus"
    );
    const tm = createTm(null);
    const writingFocus = new WritingFocus(tm as never);

    writingFocus.disableFocusMode();

    expect(fakeWindow.setFullScreen).not.toHaveBeenCalled();
  });

  it("stays exitable after two presets in a row both enable focus mode (e.g. Idea -> Writing)", async () => {
    const { WritingFocus } = await import(
      "@/capabilities/commands/writing-focus/writing-focus"
    );
    const activeView = { getViewType: () => "markdown" };
    const tm = createTm(activeView);
    const writingFocus = new WritingFocus(tm as never);

    // Idea preset enables writing focus...
    writingFocus.enableFocusMode();
    // ...and so does Writing preset, activated right after with no
    // disable in between. This used to re-run startFullscreen(), which
    // captured prevWasFullscreen as true (since we were already
    // fullscreen) and permanently blocked exitFullscreen() afterwards.
    writingFocus.enableFocusMode();

    expect(fakeWindow.setFullScreen).toHaveBeenCalledTimes(1);
    expect(fakeWindow.setFullScreen).toHaveBeenCalledWith(true);

    writingFocus.disableFocusMode();

    expect(fakeWindow.setFullScreen).toHaveBeenCalledWith(false);
  });
});
