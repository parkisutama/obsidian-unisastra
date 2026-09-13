import { describe, expect, it, vi } from "vitest";

vi.mock("obsidian", () => ({
  Notice: class {},
  Setting: class {},
}));

import {
  BUILTIN_CALLOUT_TYPES,
  canonicalBuiltinCalloutId,
  githubMarkerCanonicalId,
  isBuiltinCalloutId,
  isGithubAlertMarker,
} from "@/capabilities/features/callouts/catalog";
import {
  DEFAULT_CALLOUT_SETTINGS,
  normalizeCalloutSettings,
} from "@/capabilities/features/callouts/settings";
import { moveEntry } from "@/components/callout-manager";

describe("callout catalog", () => {
  it("resolves builtin types and aliases to a canonical lowercase ID", () => {
    expect(canonicalBuiltinCalloutId("note")).toBe("note");
    expect(canonicalBuiltinCalloutId("NOTE")).toBe("note");
    expect(canonicalBuiltinCalloutId("tldr")).toBe("abstract");
    expect(canonicalBuiltinCalloutId("Important")).toBe("tip");
    expect(canonicalBuiltinCalloutId("caution")).toBe("warning");
    expect(canonicalBuiltinCalloutId("not-a-callout")).toBeNull();
  });
  it("flags every builtin ID and alias as builtin, and unknown IDs as not", () => {
    for (const type of BUILTIN_CALLOUT_TYPES) {
      expect(isBuiltinCalloutId(type.id)).toBe(true);
      for (const alias of type.aliases) {
        expect(isBuiltinCalloutId(alias)).toBe(true);
      }
    }
    expect(isBuiltinCalloutId("my-custom-id")).toBe(false);
  });
  it("maps GitHub Alert markers onto the same canonical ID as their Obsidian alias", () => {
    expect(isGithubAlertMarker("IMPORTANT")).toBe(true);
    expect(isGithubAlertMarker("unknown")).toBe(false);
    expect(githubMarkerCanonicalId("NOTE")).toBe("note");
    expect(githubMarkerCanonicalId("IMPORTANT")).toBe("tip");
    expect(githubMarkerCanonicalId("CAUTION")).toBe("warning");
  });
});

describe("callout settings normalization", () => {
  it("provides all builtin types enabled and ordered by default", () => {
    expect(DEFAULT_CALLOUT_SETTINGS.outputMode).toBe("obsidian");
    expect(DEFAULT_CALLOUT_SETTINGS.entries).toHaveLength(
      BUILTIN_CALLOUT_TYPES.length
    );
    expect(
      DEFAULT_CALLOUT_SETTINGS.entries.every((entry) => entry.enabled)
    ).toBe(true);
  });
  it("does not share mutable defaults across normalization calls", () => {
    const first = normalizeCalloutSettings(undefined);
    const second = normalizeCalloutSettings(undefined);
    (first.entries[0] as { label: string }).label = "mutated";
    first.entries.pop();
    expect(second.entries[0].label).not.toBe("mutated");
    expect(second.entries).toHaveLength(BUILTIN_CALLOUT_TYPES.length);
  });
  it("accepts a valid custom hyphenated ID and preserves label/order/visibility", () => {
    const settings = normalizeCalloutSettings({
      entries: [
        {
          id: "my-custom-id",
          label: "My Custom",
          enabled: false,
          order: -1,
        },
      ],
    });
    const custom = settings.entries.find(
      (entry) => entry.id === "my-custom-id"
    );
    expect(custom).toMatchObject({
      id: "my-custom-id",
      label: "My Custom",
      enabled: false,
      source: "custom",
    });
  });
  it("rejects a malformed custom ID without dropping the builtin catalog", () => {
    const settings = normalizeCalloutSettings({
      entries: [{ id: "Not Valid! ID", label: "Bad" }],
    });
    expect(settings.entries.some((entry) => entry.label === "Bad")).toBe(false);
    expect(settings.entries).toHaveLength(BUILTIN_CALLOUT_TYPES.length);
  });
  it("deduplicates a custom entry that collides with a builtin alias, case-insensitively", () => {
    const settings = normalizeCalloutSettings({
      entries: [
        { id: "TLDR", label: "Duplicate", order: 0 },
        { id: "abstract", label: "Abstract", order: 1 },
      ],
    });
    const abstractEntries = settings.entries.filter(
      (entry) => entry.id === "abstract"
    );
    expect(abstractEntries).toHaveLength(1);
    expect(abstractEntries[0].label).toBe("Duplicate");
  });
  it("keeps existing entries on a nested merge while adding new builtins", () => {
    const settings = normalizeCalloutSettings({
      outputMode: "github",
      entries: [
        { id: "note", label: "Renamed note", enabled: false, order: 5 },
      ],
    });
    expect(settings.outputMode).toBe("github");
    const note = settings.entries.find((entry) => entry.id === "note");
    expect(note).toMatchObject({ label: "Renamed note", enabled: false });
    expect(settings.entries.length).toBe(BUILTIN_CALLOUT_TYPES.length);
  });
});

describe("callout manager reordering", () => {
  function entries() {
    return normalizeCalloutSettings(undefined).entries;
  }
  it("swaps order with the adjacent entry when moving up or down", () => {
    const list = entries();
    const [first, second] = list;
    moveEntry(list, 1, -1);
    expect(list[0].id).toBe(second.id);
    expect(list[1].id).toBe(first.id);
  });
  it("does nothing when moving the first entry up or the last entry down", () => {
    const list = entries();
    const before = list.map((entry) => entry.id);
    moveEntry(list, 0, -1);
    moveEntry(list, list.length - 1, 1);
    expect(list.map((entry) => entry.id)).toEqual(before);
  });
});
