import { describe, expect, it, vi } from "vitest";

vi.mock("obsidian", () => ({
  MarkdownView: class {},
  Notice: class {},
  Platform: { isMobile: false },
}));

import { dockVisibility } from "@/capabilities/features/toolbar/controller";
import { dockBottomOffsetPx } from "@/components/floaty-toolbar/toolbar";

describe("desktop toolbar visibility", () => {
  it("keeps persistent dock visible during typing and pointer departure", () => {
    expect(dockVisibility("dock", true, false, "typing")).toBe(true);
    expect(dockVisibility("dock", true, false, "leave")).toBe(true);
    expect(dockVisibility("dock", false, true, "typing")).toBe(false);
    expect(dockVisibility("dock", false, false, "reveal")).toBe(true);
  });
  it("auto-hides a normal dock on typing/leave and peeks on reveal", () => {
    expect(dockVisibility("dock", false, true, "typing")).toBe(false);
    expect(dockVisibility("dock", false, true, "leave")).toBe(false);
    expect(dockVisibility("dock", false, false, "reveal")).toBe(true);
  });
  it("never reports dock visibility in floating mode regardless of event", () => {
    expect(dockVisibility("floating", true, true, "typing")).toBe(false);
    expect(dockVisibility("floating", false, true, "reveal")).toBe(false);
  });
});
describe("dock bottom offset", () => {
  it("clears the Obsidian status bar when one is present", () => {
    expect(dockBottomOffsetPx(24)).toBe(32);
  });
  it("falls back to the base margin when there is no status bar", () => {
    expect(dockBottomOffsetPx(0)).toBe(8);
  });
});
