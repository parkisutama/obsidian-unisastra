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
