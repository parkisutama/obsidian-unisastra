import { describe, expect, it, vi } from "vitest";
import WritingModeActive from "@/capabilities/features/writing-modes/active-mode";
import { DEFAULT_SETTINGS } from "@/capabilities/settings";

function createFakeToggle(
  tm: { settings: typeof DEFAULT_SETTINGS },
  path: string
) {
  const [group, key] = path.split(".");
  return {
    toggle: vi.fn((value: boolean) => {
      (tm.settings as never as Record<string, Record<string, boolean>>)[group][
        key
      ] = value;
    }),
  };
}

function createTm() {
  const tm = {
    saveSettings: vi.fn(),
    settings: structuredClone(DEFAULT_SETTINGS),
  } as {
    settings: typeof DEFAULT_SETTINGS;
    saveSettings: ReturnType<typeof vi.fn>;
  };

  const maxCharSettingKeys = [
    "maxChars.isMaxCharsPerLineEnabled",
    "maxChars.isWarnLongLineEnabled",
  ];

  return {
    ...tm,
    features: {
      maxChar: Object.fromEntries(
        maxCharSettingKeys.map((key) => [key, createFakeToggle(tm, key)])
      ),
    },
  };
}

describe("WritingModeActive.applyPreset", () => {
  it("turns off Warn Long Line together with Limit Max Chars when a preset disables Line Width", () => {
    const tm = createTm();
    const active = new WritingModeActive(tm as never);

    // simulate the user manually enabling the independent Warn Long Line
    // toggle while a maxChars-enabled preset (e.g. Editing) was active
    tm.settings.maxChars.isMaxCharsPerLineEnabled = true;
    tm.settings.maxChars.isWarnLongLineEnabled = true;

    active.applyPreset(DEFAULT_SETTINGS.writingMode.presets.idea);

    expect(tm.settings.maxChars.isMaxCharsPerLineEnabled).toBe(false);
    expect(tm.settings.maxChars.isWarnLongLineEnabled).toBe(false);
  });

  it("turns Warn Long Line back on together with Limit Max Chars for a preset that enables Line Width", () => {
    const tm = createTm();
    const active = new WritingModeActive(tm as never);

    tm.settings.maxChars.isMaxCharsPerLineEnabled = false;
    tm.settings.maxChars.isWarnLongLineEnabled = false;

    active.applyPreset(DEFAULT_SETTINGS.writingMode.presets.editing);

    expect(tm.settings.maxChars.isMaxCharsPerLineEnabled).toBe(true);
    expect(tm.settings.maxChars.isWarnLongLineEnabled).toBe(true);
  });
});
