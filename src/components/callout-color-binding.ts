// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

export function createColorPickerBinding(edit: (value: string) => void) {
	let synchronizing = false;
	return {
		onChange(value: string): void {
			if (!synchronizing) {
				edit(value);
			}
		},
		setValue(control: { setValue: (value: string) => unknown }, value: string): void {
			const previous = synchronizing;
			synchronizing = true;
			try {
				control.setValue(value);
			} finally {
				synchronizing = previous;
			}
		},
	};
}
