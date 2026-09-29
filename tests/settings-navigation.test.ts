import { describe, expect, it, vi } from "vitest";

class Host {
  children: Host[] = [];
  readonly attributes = new Map<string, string>();
  readonly listeners = new Map<string, () => void>();
  isConnected = true;
  scrollTop = 0;
  focused = false;
  readonly classList = { toggle: vi.fn() };
  text = "";
  readonly tag: string;
  readonly cls: string;
  constructor(tag = "div", cls = "") {
    this.tag = tag;
    this.cls = cls;
  }
  createEl(tag: string, options?: { cls?: string; text?: string }) {
    const child = new Host(tag, options?.cls);
    child.text = options?.text ?? "";
    this.children.push(child);
    return child;
  }
  createDiv(options?: { cls?: string; text?: string }) {
    return this.createEl("div", options);
  }
  setText(text: string) {
    this.text = text;
  }
  createSpan(options?: { cls?: string; text?: string }) {
    return this.createEl("span", options);
  }
  setAttribute(key: string, value: string) {
    this.attributes.set(key, value);
  }
  getAttribute(key: string) {
    return this.attributes.get(key);
  }
  querySelectorAll(selector: string) {
    return this.all().filter((node) => node.cls === selector.slice(1));
  }
  addClass() {
    /* Class styling is outside this navigation harness. */
  }
  addEventListener(key: string, action: () => void) {
    this.listeners.set(key, action);
  }
  empty() {
    for (const child of this.all()) {
      child.isConnected = false;
    }
    this.children = [];
  }
  focus() {
    this.focused = true;
  }
  all(): Host[] {
    return this.children.flatMap((child) => [child, ...child.all()]);
  }
}

const draw = vi.hoisted(() => ({ callouts: vi.fn(), toolbar: vi.fn() }));
vi.mock("@/components/callout-manager", () => ({
  renderCalloutManager: draw.callouts,
}));
vi.mock("@/components/toolbar-button-order", () => ({
  renderToolbarButtonOrder: draw.toolbar,
}));
vi.mock("obsidian", () => ({
  Component: class {},
  PluginSettingTab: class {
    containerEl = new Host();
  },
  SettingGroup: class {
    readonly container: Host;
    readonly listEl: Host;
    constructor(container: Host) {
      this.listEl = container.createDiv({ cls: "setting-items" });
      this.container = this.listEl;
    }
  },
  setIcon: vi.fn(),
  Setting: class {
    readonly nameEl: Host;
    constructor(container: Host) {
      this.nameEl = container.createEl("heading");
    }
    setName(name: string) {
      this.nameEl.text = name;
      return this;
    }
    setHeading() {
      return this;
    }
    setDesc(description: string) {
      this.nameEl.createDiv({ text: description });
      return this;
    }
    setClass() {
      return this;
    }
  },
}));

import SettingsTab from "@/components/settings-tab";
import type UnisastraCore from "@/lib";

function setup() {
  const group = (name: string) => ({
    [name]: {
      registerSetting: (target: { container: Host }) =>
        target.container.createDiv({ text: name }),
    },
  });
  const presets = { registerSetting: vi.fn(), registerMode: vi.fn() };
  const tm = {
    plugin: { addChild: vi.fn((component) => component), removeChild: vi.fn() },
    features: {
      general: group("general-control"),
      compatibility: group("github-control"),
      writingModes: {
        ...group("writingMode.activeMode"),
        "writingMode.presets": presets,
      },
      toolbar: group("toolbar-control"),
      writingFocus: group("focus-control"),
      outliner: group("outliner-control"),
      hemingwayMode: group("hemingway-control"),
      dimming: group("dimming-control"),
      currentLine: group("current-control"),
      typewriter: group("typewriter-control"),
      keepAboveAndBelow: group("keep-control"),
      showWhitespace: group("whitespace-control"),
      maxChar: group("width-control"),
    },
    settings: { typewriter: {}, keepLinesAboveAndBelow: {} },
  };
  const tab = new SettingsTab({} as never, tm as unknown as UnisastraCore);
  const root = tab.containerEl as unknown as Host;
  return { tab, root, tm, presets };
}

function click(root: Host, text: string) {
  const button = root
    .all()
    .find(
      (node) =>
        node.tag === "button" &&
        (node.attributes.get("aria-label") === text || node.text === text)
    );
  if (!button) {
    throw new Error(`Missing button: ${text}`);
  }
  button.listeners.get("click")?.();
}

describe("settings navigation", () => {
  it("groups General controls together, shares panels for presets/capabilities, and describes toolbar", () => {
    const { tab, root } = setup();
    tab.display();
    const general = root
      .all()
      .find((node) =>
        node.children.some((child) => child.text === "general-control")
      );
    expect(general?.children.map((child) => child.text)).toContain(
      "github-control"
    );
    expect(
      general?.children
        .filter((child) => child.tag === "button")
        .map((child) => child.attributes.get("aria-label"))
    ).toEqual(["Toolbar", "Callouts"]);
    const presets = root
      .all()
      .find(
        (node) =>
          node.cls === "unisastra-settings-panel unisastra-settings-presets"
      );
    expect(
      presets
        ?.all()
        .filter((node) => node.tag === "button")
        .map((node) => node.attributes.get("aria-label"))
    ).toEqual(["Normal", "Idea", "Writing", "Editing"]);
    expect(
      root
        .all()
        .some(
          (node) =>
            node.cls ===
            "unisastra-settings-panel unisastra-settings-capabilities"
        )
    ).toBe(true);
    click(root, "Toolbar");
    const back = root
      .all()
      .find((node) => node.cls === "unisastra-settings-back");
    expect(back?.text).toBe("");
    expect(back?.attributes.get("aria-label")).toBe("Back to settings");
    expect(
      root
        .all()
        .find((node) => node.cls === "unisastra-settings-detail-header")
        ?.all()
        .some((node) => node.text === "Toolbar")
    ).toBe(true);
  });
  it("keeps General and compatibility on overview and opens one capability with Back restoration", () => {
    const { tab, root, presets } = setup();
    tab.display();
    expect(root.all().map((node) => node.text)).toContain("github-control");
    expect(root.all().map((node) => node.text)).not.toContain(
      "outliner-control"
    );
    expect(
      root.all().some((node) => node.cls === "unisastra-settings-tab-bar")
    ).toBe(false);
    expect(presets.registerSetting).not.toHaveBeenCalled();
    root.scrollTop = 180;
    click(root, "Outliner");
    expect(root.all().map((node) => node.text)).toContain("outliner-control");
    expect(root.all().find((node) => node.tag === "heading")?.focused).toBe(
      true
    );
    click(root, "Back to settings");
    expect(root.scrollTop).toBe(180);
    expect(
      root
        .all()
        .find(
          (node) =>
            node.tag === "button" &&
            node.attributes.get("aria-label") === "Outliner"
        )?.focused
    ).toBe(true);
  });

  it("opens only the requested preset", () => {
    const { tab, root, presets } = setup();
    tab.display();
    click(root, "Writing");
    expect(presets.registerMode).toHaveBeenCalledWith(
      expect.anything(),
      "writing"
    );
    expect(presets.registerSetting).not.toHaveBeenCalled();
  });

  it("preserves direct Callouts entry and rejects callbacks from old pages or hidden settings", () => {
    const { tab, root, tm } = setup();
    draw.callouts.mockClear();
    tab.setActiveTab("callouts");
    tab.display();
    const oldRedraw = draw.callouts.mock.calls.at(-1)?.[2];
    expect(oldRedraw).toBeTypeOf("function");
    click(root, "Back to settings");
    expect(tm.plugin.removeChild).toHaveBeenCalledTimes(1);
    click(root, "Callouts");
    const count = draw.callouts.mock.calls.length;
    oldRedraw();
    expect(draw.callouts).toHaveBeenCalledTimes(count);
    const currentRedraw = draw.callouts.mock.calls.at(-1)?.[2];
    tab.hide();
    currentRedraw();
    expect(draw.callouts).toHaveBeenCalledTimes(count);
    expect(tm.plugin.removeChild).toHaveBeenCalledTimes(2);
  });
});
