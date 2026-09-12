import type { Vault } from "obsidian";
import { describe, expect, it, vi } from "vitest";
import {
  applyStartupMigrations,
  DEFAULT_SETTINGS,
  getSettingByPath,
  setSettingByPath,
  type TypewriterModeSettings,
} from "@/capabilities/settings";

const createVault = (cursorPositions?: Record<string, unknown>) =>
  ({
    adapter: {
      exists: vi.fn().mockResolvedValue(cursorPositions !== undefined),
      read: vi.fn().mockResolvedValue(JSON.stringify(cursorPositions ?? {})),
    },
  }) as unknown as Vault;

describe("settings defaults and migrations", () => {
  it("adds opt-in toolbar defaults without sharing mutable values", async () => {
    const oldSettings = { general: { ...DEFAULT_SETTINGS.general } };
    const first = await applyStartupMigrations(
      oldSettings,
      createVault(),
      "plugins/md-writer"
    );
    const second = await applyStartupMigrations(
      oldSettings,
      createVault(),
      "plugins/md-writer"
    );
    expect(first.toolbar.enabled).toBe(false);
    expect(first.toolbar.timers.sessionPrefix).toBe("Sesi:");
    first.toolbar.buttonOrder.reverse();
    first.toolbar.timers.sessionPrefix = "Changed";
    expect(second.toolbar.buttonOrder[0]).toBe("bold");
    expect(second.toolbar.timers.sessionPrefix).toBe("Sesi:");
  });

  it("normalizes malformed nested toolbar settings while preserving old values", async () => {
    const settings = await applyStartupMigrations(
      {
        general: { ...DEFAULT_SETTINGS.general },
        typewriter: { ...DEFAULT_SETTINGS.typewriter, typewriterOffset: 0.73 },
        toolbar: {
          enabled: true,
          mode: "unknown",
          buttonOrder: ["link", "link", "unknown"],
          timers: {
            sessionPrefix: "  ",
            filePrefix: "File\nBad",
            fileVisible: false,
            updateIntervalSeconds: 9001,
          },
        },
      } as never,
      createVault(),
      "plugins/md-writer"
    );
    expect(settings.typewriter.typewriterOffset).toBe(0.73);
    expect(settings.toolbar.mode).toBe("floating");
    expect(settings.toolbar.buttonOrder[0]).toBe("link");
    expect(settings.toolbar.buttonOrder).toHaveLength(8);
    expect(settings.toolbar.timers).toEqual({
      sessionVisible: true,
      fileVisible: false,
      sessionPrefix: "Sesi:",
      filePrefix: "File:",
      updateIntervalSeconds: 300,
    });
  });
  it("clamps the timer update interval to a valid range", async () => {
    const tooLow = await applyStartupMigrations(
      {
        general: { ...DEFAULT_SETTINGS.general },
        toolbar: { timers: { updateIntervalSeconds: -5 } },
      } as never,
      createVault(),
      "plugins/md-writer"
    );
    expect(tooLow.toolbar.timers.updateIntervalSeconds).toBe(1);

    const malformed = await applyStartupMigrations(
      {
        general: { ...DEFAULT_SETTINGS.general },
        toolbar: { timers: { updateIntervalSeconds: "not a number" } },
      } as never,
      createVault(),
      "plugins/md-writer"
    );
    expect(malformed.toolbar.timers.updateIntervalSeconds).toBe(1);
  });
  it("keeps typed dotted-path access in sync with defaults", () => {
    const settings = structuredClone(DEFAULT_SETTINGS);

    expect(
      getSettingByPath(settings, "typewriter.isTypewriterScrollEnabled")
    ).toBe(true);
    expect(
      getSettingByPath(
        settings,
        "compatibility.isGFMAnchorCompatibilityEnabled"
      )
    ).toBe(true);

    setSettingByPath(settings, "typewriter.typewriterOffset", 0.42);

    expect(getSettingByPath(settings, "typewriter.typewriterOffset")).toBe(
      0.42
    );
  });

  it("migrates legacy flat settings and cursor positions", async () => {
    const migrated = await applyStartupMigrations(
      {
        isTypewriterScrollEnabled: false,
        typewriterOffset: 0.65,
        isDimUnfocusedEnabled: true,
        version: "1.1.0",
      },
      createVault({ "Draft.md": { ch: 4, line: 2 } }),
      ".obsidian/plugins/md-writer"
    );

    expect(migrated.general.version).toBe("1.1.0");
    expect(migrated.typewriter.isTypewriterScrollEnabled).toBe(false);
    expect(migrated.typewriter.typewriterOffset).toBe(0.65);
    expect(migrated.dimming.isDimUnfocusedEnabled).toBe(true);
    expect(migrated.restoreCursorPosition.cursorPositions).toEqual({
      "Draft.md": { ch: 4, line: 2 },
    });
    expect(migrated.showWhitespace).toEqual(DEFAULT_SETTINGS.showWhitespace);
    expect(migrated.compatibility).toEqual(DEFAULT_SETTINGS.compatibility);
  });

  it("deep-merges modern settings with newly introduced defaults", async () => {
    const migrated = await applyStartupMigrations(
      {
        general: {
          ...DEFAULT_SETTINGS.general,
          version: "1.2.0",
        },
        typewriter: {
          ...DEFAULT_SETTINGS.typewriter,
          typewriterOffset: 0.25,
        },
      } satisfies Partial<TypewriterModeSettings>,
      createVault(),
      ".obsidian/plugins/md-writer"
    );

    expect(migrated.general.version).toBe("1.2.0");
    expect(migrated.typewriter.typewriterOffset).toBe(0.25);
    expect(migrated.outliner).toEqual(DEFAULT_SETTINGS.outliner);
    expect(migrated.blockId).toEqual(DEFAULT_SETTINGS.blockId);
    expect(migrated.compatibility).toEqual(DEFAULT_SETTINGS.compatibility);
  });

  it("deep-merges writing mode presets with newly introduced defaults", async () => {
    const migrated = await applyStartupMigrations(
      {
        general: {
          ...DEFAULT_SETTINGS.general,
          version: "1.2.0",
        },
        writingMode: {
          activeMode: "writing",
          presets: {
            idea: {
              currentLine: false,
              dimming: false,
              hemingwayMode: true,
              maxChars: false,
              outliner: false,
              showWhitespace: false,
              typewriter: false,
            },
            writing: {
              currentLine: false,
              dimming: false,
              hemingwayMode: false,
              maxChars: false,
              outliner: false,
              showWhitespace: false,
              typewriter: false,
            },
            editing: {
              currentLine: true,
              dimming: false,
              hemingwayMode: false,
              maxChars: true,
              outliner: false,
              showWhitespace: true,
              typewriter: false,
            },
          },
        },
      } as Partial<TypewriterModeSettings>,
      createVault(),
      ".obsidian/plugins/md-writer"
    );

    expect(migrated.writingMode.activeMode).toBe("writing");
    expect(migrated.writingMode.presets.writing.hemingwayMode).toBe(false);
    expect(migrated.writingMode.presets.idea.outliner).toBe(false);
    expect(migrated.writingMode.presets.idea.writingFocus).toBe(true);
    expect(migrated.writingMode.presets.writing.writingFocus).toBe(true);
    expect(migrated.writingMode.presets.editing.writingFocus).toBe(false);
    expect(migrated.writingMode.presets.normal).toEqual({
      currentLine: false,
      dimming: false,
      hemingwayMode: false,
      maxChars: false,
      outliner: false,
      showWhitespace: false,
      typewriter: false,
      writingFocus: false,
    });
  });
});
