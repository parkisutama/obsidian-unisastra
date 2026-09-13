import type { Component } from "obsidian";
import { describe, expect, it, vi } from "vitest";
import type TypewriterModeLib from "@/lib";

const state = vi.hoisted(() => ({ actions: [] as (() => unknown)[] }));
vi.mock("obsidian", () => ({
  Notice: class {},
  Setting: class {
    setName() {
      return this;
    }
    setDesc() {
      return this;
    }
    addButton(callback: (button: unknown) => void) {
      const button = {
        setButtonText: () => button,
        setDisabled: () => button,
        onClick: (action: () => unknown) => {
          state.actions.push(action);
          return button;
        },
      };
      callback(button);
      return this;
    }
    addExtraButton() {
      return this;
    }
  },
}));

import { renderCalloutDiscovery } from "@/components/callout-discovery";

describe("discovery settings", () => {
  it("refreshes without saving and rolls back a candidate when explicit add fails", async () => {
    state.actions.length = 0;
    const host = {
      createDiv: () => host,
      empty: vi.fn(),
      createEl: vi.fn(),
      ownerDocument: {
        styleSheets: [
          { cssRules: [{ selectorText: '[data-callout="draft"]' }] },
        ],
      },
    };
    let refresh: () => void = () => undefined;
    let dispose: () => void = () => undefined;
    const saveSettings = vi.fn().mockRejectedValue(new Error("write failed"));
    const entries: unknown[] = [];
    const tm = {
      settings: { callouts: { entries } },
      saveSettings,
      plugin: {
        app: {
          workspace: {
            on: (_event: string, action: () => void) => {
              refresh = action;
            },
          },
        },
      },
    };
    const component = {
      register: (action: () => void) => {
        dispose = action;
      },
      registerEvent: vi.fn(),
    };
    const rerender = vi.fn();
    renderCalloutDiscovery(
      host as unknown as HTMLElement,
      tm as unknown as TypewriterModeLib,
      component as unknown as Component,
      rerender
    );
    refresh();
    expect(saveSettings).not.toHaveBeenCalled();
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await state.actions[0]?.();
    expect(saveSettings).toHaveBeenCalledOnce();
    expect(entries).toEqual([]);
    expect(rerender).not.toHaveBeenCalled();
    log.mockRestore();
    dispose();
    const count = host.empty.mock.calls.length;
    refresh();
    expect(host.empty).toHaveBeenCalledTimes(count);
  });
});
