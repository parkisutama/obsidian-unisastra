// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

// The slice of the Electron BrowserWindow API that writing focus uses. Declared locally so the
// electron package is not a dependency.
interface ElectronBrowserWindow {
	isFullScreen(): boolean;
	setFullScreen(flag: boolean): void;
	on(event: "leave-full-screen", listener: () => void): void;
	off(event: "leave-full-screen", listener: () => void): void;
}

declare global {
	interface Window {
		electron: {
			remote: {
				getCurrentWindow: () => ElectronBrowserWindow;
			};
		};
	}
}

export {};
