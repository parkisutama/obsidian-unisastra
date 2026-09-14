import { describe, expect, it, vi } from "vitest";
import WritingModePresetConfig from "@/capabilities/features/writing-modes/preset-config";
import { DEFAULT_SETTINGS } from "@/capabilities/settings";

const CH_UNIT_PATTERN = /ch/;
const CHARACTER_COUNT_PATTERN = /character count/;

function render(feature: WritingModePresetConfig, mode: "idea" | "writing") {
  const rows: Array<{
    name: string;
    desc?: string;
    value?: boolean;
    change?: (value: boolean) => void;
  }> = [];
  const group = {
    addSetting(action: (setting: unknown) => void) {
      const row = { name: "" } as (typeof rows)[number];
      rows.push(row);
      const setting = {
        setName(name: string) {
          row.name = name;
          return setting;
        },
        setDesc(desc: string) {
          row.desc = desc;
          return setting;
        },
        setHeading() {
          return setting;
        },
        setClass() {
          return setting;
        },
        addToggle(action: (toggle: unknown) => void) {
          const toggle = {
            setValue(value: boolean) {
              row.value = value;
              return toggle;
            },
            onChange(change: (value: boolean) => void) {
              row.change = change;
              return toggle;
            },
          };
          action(toggle);
          return setting;
        },
      };
      action(setting);
    },
  };
  feature.registerMode(group as never, mode);
  return rows;
}

describe("writing mode recipe details", () => {
  it("renders one recipe and preserves edits through reopening without applying live features", () => {
    const tm = {
      settings: structuredClone(DEFAULT_SETTINGS),
      saveSettings: vi.fn().mockResolvedValue(undefined),
      features: { outliner: { toggle: vi.fn() } },
    };
    const feature = new WritingModePresetConfig(tm as never);
    const rows = render(feature, "idea");
    expect(rows).toHaveLength(9);
    expect(rows[0].name).toBe("Idea mode");
    rows.find((row) => row.name === "Outliner")?.change?.(false);
    expect(tm.settings.writingMode.presets.idea.outliner).toBe(false);
    expect(tm.saveSettings).toHaveBeenCalledTimes(1);
    expect(tm.features.outliner.toggle).not.toHaveBeenCalled();
    expect(tm.settings.writingMode.activeMode).toBe("none");
    expect(
      render(feature, "idea").find((row) => row.name === "Outliner")?.value
    ).toBe(false);
    expect(render(feature, "writing")[0].name).toBe("Writing mode");
  });

  it("clarifies that Line Width bundles two differently-measured behaviors", () => {
    const tm = {
      settings: structuredClone(DEFAULT_SETTINGS),
      saveSettings: vi.fn().mockResolvedValue(undefined),
      features: { outliner: { toggle: vi.fn() } },
    };
    const feature = new WritingModePresetConfig(tm as never);
    const lineWidthRow = render(feature, "idea").find(
      (row) => row.name === "Line Width"
    );
    expect(lineWidthRow?.desc).toMatch(CH_UNIT_PATTERN);
    expect(lineWidthRow?.desc).toMatch(CHARACTER_COUNT_PATTERN);
  });
});
