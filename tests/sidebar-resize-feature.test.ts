import type { SettingGroup } from "obsidian";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SidebarEqualResize from "@/capabilities/features/general/sidebar-equal-resize";
import { DEFAULT_SETTINGS } from "@/capabilities/settings";
import type UnisastraCore from "@/lib";

const mock = vi.hoisted(() => ({
	desktop: true,
	start: vi.fn(),
	stop: vi.fn(),
	construct: vi.fn(),
}));
vi.mock("obsidian", () => ({
	Platform: {
		get isDesktopApp() {
			return mock.desktop;
		},
	},
}));
vi.mock("@/capabilities/features/general/sidebar-resize/adapter", () => ({
	ObsidianSidebarHost: class {},
}));
vi.mock("@/capabilities/features/general/sidebar-resize/controller", () => ({
	SidebarResizeController: class {
		constructor() {
			mock.construct();
		}
		start = mock.start;
		stop = mock.stop;
	},
}));

function fixture() {
	const settings = structuredClone(DEFAULT_SETTINGS);
	settings.general.isSidebarEqualResizeEnabled = true;
	const ready: Array<() => void> = [];
	const feature = new SidebarEqualResize({
		settings,
		plugin: {
			app: { workspace: { onLayoutReady: (cb: () => void) => ready.push(cb) } },
		},
		saveSettings: vi.fn().mockResolvedValue(undefined),
	} as unknown as UnisastraCore);
	return {
		feature,
		settings,
		ready: () => {
			for (const cb of ready.splice(0)) {
				cb();
			}
		},
	};
}

describe("sidebar feature integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mock.desktop = true;
	});
	it("starts once after layout and ignores stale callbacks after disable", () => {
		const f = fixture();
		f.feature.load();
		f.feature.refresh();
		f.feature.disable();
		f.ready();
		expect(mock.construct).not.toHaveBeenCalled();
		f.feature.enable();
		f.ready();
		f.feature.refresh();
		expect(mock.start).toHaveBeenCalledTimes(1);
		f.feature.dispose();
		f.feature.refresh();
		f.ready();
		expect(mock.start).toHaveBeenCalledTimes(1);
		expect(mock.stop).toHaveBeenCalledTimes(1);
	});
	it.each(["mobile", "inactive", "platform", "off"])("does not start when %s", (state) => {
		const f = fixture();
		if (state === "mobile") {
			mock.desktop = false;
		}
		if (state === "inactive") {
			f.settings.general.isPluginActivated = false;
		}
		if (state === "platform") {
			f.settings.general.enabledPlatforms = "mobile";
		}
		if (state === "off") {
			f.settings.general.isSidebarEqualResizeEnabled = false;
		}
		f.feature.load();
		f.ready();
		expect(mock.start).not.toHaveBeenCalled();
	});
	it("stops and resumes when General activation changes", () => {
		const f = fixture();
		f.feature.load();
		f.ready();
		f.settings.general.isPluginActivated = false;
		f.feature.refresh();
		expect(mock.stop).toHaveBeenCalledTimes(1);
		f.settings.general.isPluginActivated = true;
		f.feature.refresh();
		f.ready();
		expect(mock.start).toHaveBeenCalledTimes(2);
	});
	it("registers the requested toggle label and persists its value", () => {
		const f = fixture();
		f.settings.general.isSidebarEqualResizeEnabled = false;
		let onChange = (_value: boolean) => undefined;
		const toggle = {
			setValue: vi.fn().mockReturnThis(),
			onChange: (cb: typeof onChange) => {
				onChange = cb;
				return toggle;
			},
		};
		const setting = {
			setName: vi.fn().mockReturnThis(),
			setDesc: vi.fn().mockReturnThis(),
			setClass: vi.fn().mockReturnThis(),
			setDisabled: vi.fn().mockReturnThis(),
			addToggle: (cb: (t: typeof toggle) => void) => {
				cb(toggle);
				return setting;
			},
		};
		f.feature.registerSetting({
			addSetting: (cb: (s: typeof setting) => void) => cb(setting),
		} as unknown as SettingGroup);
		expect(setting.setName).toHaveBeenCalledWith("Sinkronkan lebar sidebar");
		expect(toggle.setValue).toHaveBeenCalledWith(false);
		f.feature.load();
		onChange(true);
		f.ready();
		expect(f.settings.general.isSidebarEqualResizeEnabled).toBe(true);
		expect(mock.start).toHaveBeenCalledTimes(1);
	});
});
