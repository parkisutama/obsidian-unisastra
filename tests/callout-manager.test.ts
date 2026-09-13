import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/callout-discovery", () => ({
  renderCalloutDiscovery: vi.fn(),
}));

class ElementHost {
  readonly children: ElementHost[] = [];
  readonly tag: string;
  readonly cls: string;
  name = "";
  constructor(tag = "div", cls = "") {
    this.tag = tag;
    this.cls = cls;
  }
  createEl(tag: string, options?: { cls?: string }) {
    const node = new ElementHost(tag, options?.cls);
    this.children.push(node);
    return node;
  }
  createDiv(options?: { cls?: string }) {
    return this.createEl("div", options);
  }
}

vi.mock("obsidian", () => ({
  Notice: class {},
  SettingGroup: class {
    readonly listEl: ElementHost;
    constructor(container: ElementHost) {
      this.listEl = container.createDiv({ cls: "setting-items" });
    }
  },
  Setting: class {
    private readonly node: ElementHost;
    constructor(container: ElementHost) {
      this.node = container.createEl("setting");
    }
    setName(name: string) {
      this.node.name = name;
      return this;
    }
    setDesc() {
      return this;
    }
    addDropdown() {
      return this;
    }
    addExtraButton() {
      return this;
    }
    addToggle() {
      return this;
    }
    addText() {
      return this;
    }
    addButton() {
      return this;
    }
  },
}));
vi.mock("@/components/callout-style-editor", () => ({
  renderCalloutStyleEditor: (container: ElementHost) =>
    container.createEl("div"),
}));

import type { Component } from "obsidian";
import { normalizeCalloutSettings } from "@/capabilities/features/callouts/settings";
import { renderCalloutManager } from "@/components/callout-manager";
import type TypewriterModeLib from "@/lib";

describe("callout manager grouping", () => {
  it("keeps every entry's catalog controls and style preview in the same panel, in catalog order", () => {
    const container = new ElementHost();
    const callouts = normalizeCalloutSettings({
      entries: [{ id: "draft", order: -1 }],
    });
    const tm = { settings: { callouts } } as unknown as TypewriterModeLib;
    renderCalloutManager(
      container as unknown as HTMLElement,
      tm,
      vi.fn(),
      {} as Component
    );
    const panels = container.children.filter(
      (node) => node.cls === "ptm-callout-manager-entry"
    );
    expect(panels).toHaveLength(callouts.entries.length);
    expect(panels.map((panel) => panel.children[0].children[1].name)).toEqual(
      callouts.entries.map((entry) => entry.label)
    );
    for (const panel of panels) {
      expect(panel.children[0].children.map((node) => node.tag)).toEqual([
        "div",
        "setting",
        "div",
      ]);
    }
    expect(container.children.some((node) => node.tag === "details")).toBe(
      false
    );
  });
});
