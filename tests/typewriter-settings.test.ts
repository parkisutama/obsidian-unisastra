// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { describe, expect, it, vi } from "vitest";

const Control = vi.hoisted(
	() =>
		class Control {
			name = "";
			disabled = false;
			value = false;
			change: (value: boolean) => void = () => {
				/* Assigned by addToggle. */
			};
			setName(name: string) {
				this.name = name;
				return this;
			}
			setDesc() {
				return this;
			}
			setHeading() {
				return this;
			}
			setClass() {
				return this;
			}
			setDisabled(value: boolean) {
				this.disabled = value;
				return this;
			}
			addToggle(action: (toggle: unknown) => void) {
				const toggle = {
					setValue: (value: boolean) => {
						this.value = value;
						return toggle;
					},
					onChange: (change: (value: boolean) => void) => {
						this.change = change;
						return toggle;
					},
				};
				action(toggle);
				return this;
			}
		},
);
type Control = InstanceType<typeof Control>;

vi.mock("obsidian", () => ({
	Setting: class extends Control {
		constructor(container: { rows: Control[] }) {
			super();
			container.rows.push(this);
		}
	},
	SettingGroup: class {
		readonly container: { rows: Control[] };
		constructor(container: { rows: Control[] }) {
			this.container = container;
		}
	},
}));

import KeepLines from "@/capabilities/features/keep-above-and-below/keep-lines-above-and-below";
import TypewriterScroll from "@/capabilities/features/typewriter/typewriter-scroll";
import { DEFAULT_SETTINGS } from "@/capabilities/settings";
import { renderTypewriterSettings } from "@/components/typewriter-settings";

describe("combined scrolling settings", () => {
	it.each(["none", "typewriter", "keep"])(
		"refreshes mutual exclusion from %s without replacing controls",
		(initial) => {
			const tm = {
				settings: structuredClone(DEFAULT_SETTINGS),
				saveSettings: vi.fn().mockResolvedValue(undefined),
				features: {},
			};
			tm.settings.typewriter.isTypewriterScrollEnabled = initial === "typewriter";
			tm.settings.keepLinesAboveAndBelow.isKeepLinesAboveAndBelowEnabled = initial === "keep";
			const typewriter = new TypewriterScroll(tm as never);
			const keep = new KeepLines(tm as never);
			typewriter.enable = vi.fn();
			typewriter.disable = vi.fn();
			keep.enable = vi.fn();
			keep.disable = vi.fn();
			tm.features = {
				typewriter: { "typewriter.isTypewriterScrollEnabled": typewriter },
				keepAboveAndBelow: {
					"keepLinesAboveAndBelow.isKeepLinesAboveAndBelowEnabled": keep,
				},
			};
			const container = { rows: [] as Control[] };
			renderTypewriterSettings(container as never, tm as never);
			const tw = container.rows.find((row) => row.name === "Typewriter scrolling");
			const kl = container.rows.find((row) => row.name === "Keep lines above and below");
			expect(tw?.disabled).toBe(initial === "keep");
			expect(kl?.disabled).toBe(initial === "typewriter");
			if (initial === "keep") {
				kl?.change(false);
			} else if (initial === "typewriter") {
				tw?.change(false);
			}
			expect(tw?.disabled).toBe(false);
			expect(kl?.disabled).toBe(false);
			tw?.change(true);
			expect(tm.settings.typewriter.isTypewriterScrollEnabled).toBe(true);
			expect(typewriter.enable).toHaveBeenCalled();
			expect(kl?.disabled).toBe(true);
			tw?.change(false);
			kl?.change(true);
			expect(tw?.disabled).toBe(true);
			expect(keep.enable).toHaveBeenCalled();
			expect(tm.saveSettings).toHaveBeenCalled();
			expect(container.rows.find((row) => row.name === "Typewriter scrolling")).toBe(tw);
		},
	);
});
