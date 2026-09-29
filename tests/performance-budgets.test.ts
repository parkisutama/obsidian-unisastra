import { EditorState } from "@codemirror/state";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("obsidian", () => ({
  ItemView: class {},
  MarkdownView: class {},
  Notice: class {},
  Platform: { isMobile: false, isDesktop: true },
  editorInfoField: "info",
  editorLivePreviewField: "preview",
}));

import { FeatureToggle } from "@/capabilities/base/feature-toggle";
import { ToolbarController } from "@/capabilities/features/toolbar/controller";
import WritingModeActive from "@/capabilities/features/writing-modes/active-mode";
import { DEFAULT_SETTINGS } from "@/capabilities/settings";
import createUnisastraViewPlugin from "@/cm6/plugin";
import { createLivePreviewPlugin } from "@/gfm-anchor/live-preview";

afterEach(() => vi.unstubAllGlobals());

// CM6's runtime factory is internal; this probe avoids manufacturing a full DOM editor.
function instantiate(plugin: unknown, view: unknown) {
  return (
    plugin as {
      create: (view: unknown) => {
        destroy: () => void;
        update: (update: unknown) => void;
      };
    }
  ).create(view);
}

function host() {
  let sequence = 0;
  const frames = new Map<number, FrameRequestCallback>();
  const win = {
    requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
      frames.set(++sequence, callback);
      return sequence;
    }),
    cancelAnimationFrame: vi.fn((id: number) => frames.delete(id)),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    setInterval: vi.fn(() => 1),
    clearInterval: vi.fn(),
  };
  const doc = {
    defaultView: win,
    querySelector: () => null,
    querySelectorAll: () => [],
    body: {
      classList: { remove: vi.fn() },
      addClasses: vi.fn(),
      setCssProps: vi.fn(),
      setAttrs: vi.fn(),
    },
  };
  return {
    win,
    doc,
    frames,
    flush: () => {
      const pending = [...frames.values()];
      frames.clear();
      for (const callback of pending) {
        callback(0);
      }
    },
  };
}

it("releases all editor observers and queued startup frames across 50 cycles", () => {
  const env = host();
  vi.stubGlobal("window", env.win);
  const observers: { active: boolean }[] = [];
  class Observer {
    active = false;
    constructor() {
      observers.push(this);
    }
    observe() {
      this.active = true;
    }
    disconnect() {
      this.active = false;
    }
  }
  vi.stubGlobal("MutationObserver", Observer);
  vi.stubGlobal("ResizeObserver", Observer);
  const settings = structuredClone(DEFAULT_SETTINGS);
  settings.general.isPluginActivated = false;
  const tm = {
    settings,
    perWindowProps: {
      allBodyClasses: [],
      persistentBodyClasses: [],
      bodyClasses: [],
      cssVariables: {},
      bodyAttrs: {},
    },
    plugin: { app: { workspace: { getActiveViewOfType: () => null } } },
    getRestoreCursorPositionFeature: vi.fn(),
  };
  const view = {
    dom: { ownerDocument: env.doc },
    state: EditorState.create(),
    dispatch: vi.fn(),
  };
  const plugin = createUnisastraViewPlugin(tm as never);
  for (let index = 0; index < 50; index++) {
    const instance = instantiate(plugin, view);
    instance.destroy();
  }
  expect(observers.filter((observer) => observer.active)).toHaveLength(0);
  expect(env.frames.size).toBe(0);
  env.flush();
  expect(tm.getRestoreCursorPositionFeature).not.toHaveBeenCalled();
  expect(view.dispatch).not.toHaveBeenCalled();
});

it("does no disabled toolbar rendering and keeps elapsed time when timer displays are hidden", () => {
  const env = host();
  const settings = structuredClone(DEFAULT_SETTINGS);
  const controller = new ToolbarController({
    settings,
    plugin: { app: { workspace: { containerEl: { ownerDocument: env.doc } } } },
  } as never);
  const view = { dom: { ownerDocument: env.doc }, hasFocus: true };
  for (let index = 0; index < 100; index++) {
    controller.changed(view as never);
  }
  expect(env.win.requestAnimationFrame).not.toHaveBeenCalled();
  settings.toolbar.enabled = true;
  settings.toolbar.timers.sessionVisible = false;
  settings.toolbar.timers.fileVisible = false;
  controller.refresh();
  expect(env.win.setInterval).not.toHaveBeenCalled();
  const elapsed = controller.getSessionElapsedMs(Date.now() + 60_000);
  expect(elapsed).toBeGreaterThanOrEqual(60_000);
  settings.toolbar.timers.sessionVisible = true;
  controller.refresh();
  expect(env.win.setInterval).toHaveBeenCalledTimes(1);
  expect(env.frames.size).toBe(1);
  settings.toolbar.enabled = false;
  controller.refresh();
  expect(env.frames.size).toBe(0);
  expect(env.win.clearInterval).toHaveBeenCalledTimes(1);
  controller.destroy();
});

it("GFM skips selection-only scans, coalesces invalidations and cleans up", () => {
  const env = host();
  let enabled = false;
  const callbacks: MutationCallback[] = [];
  vi.stubGlobal(
    "MutationObserver",
    class {
      constructor(callback: MutationCallback) {
        callbacks.push(callback);
      }
      observe() {
        /* Mutations are delivered explicitly by this probe. */
      }
      disconnect() {
        /* No real observer is registered in the node probe. */
      }
    }
  );
  const events = { on: vi.fn(() => ({})), offref: vi.fn() };
  const scan = vi.fn(() => []);
  const view = {
    dom: { ownerDocument: env.doc },
    contentDOM: { querySelectorAll: scan },
    state: {
      field: (key: string) =>
        key === "info" ? { file: { path: "a.md" } } : true,
    },
  };
  const plugin = createLivePreviewPlugin(
    { metadataCache: events, workspace: events } as never,
    () => enabled
  );
  const instance = instantiate(plugin, view);
  const update = {
    docChanged: false,
    viewportChanged: false,
    transactions: [],
  };
  instance.update(update as never);
  expect(env.frames.size).toBe(0);
  enabled = true;
  instance.update(update as never);
  env.flush();
  expect(scan).toHaveBeenCalledTimes(1);
  for (let index = 0; index < 100; index++) {
    instance.update(update as never);
  }
  expect(env.frames.size).toBe(0);
  const record = { type: "childList", addedNodes: [{ matches: () => true }] };
  callbacks[0]([record] as never, {} as never);
  callbacks[0]([record] as never, {} as never);
  expect(env.frames.size).toBe(1);
  instance.destroy();
  env.flush();
  expect(scan).toHaveBeenCalledTimes(1);
  expect(events.offref).toHaveBeenCalledTimes(3);
});

it("preset state application does not persist intermediate values; standalone toggle still saves", async () => {
  class Toggle extends FeatureToggle {
    readonly settingKey = "maxChars.isWarnLongLineEnabled" as const;
    protected settingTitle = "test";
    protected settingDesc = "test";
    override enable = vi.fn();
    override disable = vi.fn();
  }
  const settings = structuredClone(DEFAULT_SETTINGS);
  settings.maxChars.isWarnLongLineEnabled = false;
  const tm = {
    settings,
    saveSettings: vi.fn().mockResolvedValue(undefined),
    features: { maxChar: {} as Record<string, Toggle> },
  };
  const toggle = new Toggle(tm as never);
  tm.features.maxChar[toggle.settingKey] = toggle;
  const preset = new WritingModeActive(tm as never);
  preset.applyMode("editing");
  preset.applyMode("editing");
  expect(toggle.enable).toHaveBeenCalledTimes(1);
  expect(tm.saveSettings).not.toHaveBeenCalled();
  await tm.saveSettings();
  expect(tm.saveSettings).toHaveBeenCalledTimes(1);
  toggle.toggle(false);
  expect(tm.saveSettings).toHaveBeenCalledTimes(2);
});
