import { describe, expect, it, vi } from "vitest";

vi.mock("obsidian", () => ({ getIcon: () => null }));

import type { CalloutEntrySettings } from "@/capabilities/features/callouts/settings";
import {
	CalloutStyles,
	calloutCss,
	calloutStyleProperties,
	validateCalloutOverride,
} from "@/capabilities/features/callouts/styles";

function entry(id: string, color: string | null, icon: string | null): CalloutEntrySettings {
	return {
		id,
		label: id,
		enabled: true,
		order: 0,
		source: "custom",
		styling: { mode: "override", color, icon },
	};
}
const resolveIcon = (id: string) =>
	id === "lucide-pencil" ? '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>' : null;

describe("callout runtime styles", () => {
	it("uses the same validated override properties for a builtin note and its local preview", () => {
		const builtin = {
			...entry("note", "#123456", "lucide-pencil"),
			source: "builtin" as const,
		};
		const properties = calloutStyleProperties(builtin.styling, resolveIcon);
		expect(properties["--callout-color"]).toBe("18,52,86");
		expect(properties["--callout-icon"]).toBe("lucide-pencil");
		for (const [key, value] of Object.entries(properties)) {
			expect(calloutCss([builtin], resolveIcon)).toContain(`${key}:${value};`);
		}
		expect(calloutStyleProperties({ mode: "inherit" }, resolveIcon)).toEqual({});
	});
	it("validates the complete form before saving and treats blank fields as inherited", () => {
		expect(validateCalloutOverride(" #aBc ", " lucide-pencil ", resolveIcon)).toEqual({
			mode: "override",
			color: "#aBc",
			icon: "lucide-pencil",
		});
		expect(validateCalloutOverride("", "", resolveIcon)).toEqual({
			mode: "override",
			color: null,
			icon: null,
		});
		expect(validateCalloutOverride("#abcd", "lucide-pencil", resolveIcon)).toBeNull();
		expect(validateCalloutOverride("#fff", "lucide-missing", resolveIcon)).toBeNull();
		expect(validateCalloutOverride("#fff", "pencil", resolveIcon)).toBeNull();
	});
	it("generates RGB color and a renderer-compatible icon ID only for validated overrides", () => {
		const css = calloutCss([entry("draft", "#aBc", "lucide-pencil")], resolveIcon);
		expect(css).toContain('.callout[data-callout="draft"]');
		expect(css).toContain("--callout-color:170,187,204;");
		expect(css).toContain("--callout-icon:lucide-pencil;");
		expect(css).not.toContain("<svg");
	});
	it("rejects CSS injection, invalid colors and unknown icons without losing valid fields", () => {
		expect(calloutCss([entry('x"]{}', "#ffffff", null)], resolveIcon)).toBe("");
		expect(calloutCss([entry("draft", "red;display:none", "unknown")], resolveIcon)).toBe("");
		expect(calloutCss([entry("draft", "#123456", "unknown")], resolveIcon)).toContain("18,52,86");
		expect(
			calloutCss([{ ...entry("draft", "#fff", null), styling: { mode: "inherit" } }], resolveIcon),
		).toBe("");
	});
	it("updates a single owned node per document and cleans reset, close and unload", () => {
		function documentHost() {
			const nodes: { textContent: string; remove: () => void }[] = [];
			const doc = {
				createElement: () => {
					const node = {
						textContent: "",
						remove: () => {
							const i = nodes.indexOf(node);
							if (i >= 0) {
								nodes.splice(i, 1);
							}
						},
					};
					return node;
				},
				head: {
					appendChild: (node: (typeof nodes)[number]) => nodes.push(node),
				},
			} as unknown as Document;
			return { doc, nodes };
		}
		const main = documentHost();
		const popout = documentHost();
		const styles = new CalloutStyles(resolveIcon);
		styles.open(main.doc);
		styles.update([entry("draft", "#fff", null)]);
		styles.open(popout.doc);
		expect(main.nodes).toHaveLength(1);
		expect(popout.nodes[0].textContent).toBe(main.nodes[0].textContent);
		styles.update([entry("draft", "#000", null)]);
		expect(main.nodes).toHaveLength(1);
		expect(main.nodes[0].textContent).toContain("0,0,0");
		styles.close(popout.doc);
		expect(popout.nodes).toHaveLength(0);
		styles.update([]);
		expect(main.nodes).toHaveLength(0);
		styles.update([entry("draft", "#fff", null)]);
		styles.destroy();
		styles.open(popout.doc);
		styles.update([entry("draft", "#fff", null)]);
		expect(main.nodes).toHaveLength(0);
		expect(popout.nodes).toHaveLength(0);
	});
});
