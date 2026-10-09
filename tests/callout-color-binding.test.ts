// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { describe, expect, it, vi } from "vitest";
import { createColorPickerBinding } from "@/components/callout-color-binding";

describe("callout color picker synchronization", () => {
	it("does not turn programmatic default values into user edits even if setValue emits change", () => {
		const edit = vi.fn();
		const binding = createColorPickerBinding(edit);
		const control = { setValue: (value: string) => binding.onChange(value) };
		binding.setValue(control, "#4385be");
		expect(edit).not.toHaveBeenCalled();
		binding.onChange("#ffffff");
		expect(edit).toHaveBeenCalledExactlyOnceWith("#ffffff");
	});
});
