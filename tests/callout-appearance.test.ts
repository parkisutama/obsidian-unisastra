import { describe, expect, it } from "vitest";
import { effectiveCalloutValues } from "@/capabilities/features/callouts/appearance";

describe("effective callout appearance", () => {
	it("reads hex and rendered RGB colors when the theme does not expose a comma-separated tuple", () => {
		expect(effectiveCalloutValues("#abc", "lucide-pencil").color).toBe("#aabbcc");
		expect(effectiveCalloutValues("rgb(8 109 221)", "lucide-pencil").color).toBe("#086ddd");
		expect(effectiveCalloutValues("", "lucide-pencil", "rgb(8, 109, 221)").color).toBe("#086ddd");
	});
	it("shows computed theme values without turning them into persisted overrides", () => {
		expect(effectiveCalloutValues("8, 109, 221", '"lucide-pencil"')).toEqual({
			color: "#086ddd",
			icon: "lucide-pencil",
		});
		expect(effectiveCalloutValues("0,255,0", "lucide-check")).toEqual({
			color: "#00ff00",
			icon: "lucide-check",
		});
		expect(effectiveCalloutValues("300,0,0", "url(bad)")).toEqual({
			color: null,
			icon: null,
		});
		expect(effectiveCalloutValues("", "<svg></svg>")).toEqual({
			color: null,
			icon: null,
		});
	});
});
