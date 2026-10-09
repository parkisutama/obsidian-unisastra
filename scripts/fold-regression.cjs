"use strict";
// Real CM6 editor lifecycle with a synthetic parser and Obsidian boundary.
const fs = require("node:fs");
const path = require("node:path");

if (process.versions.electron) {
	const { app, BrowserWindow } = require("electron");
	app.setPath("userData", path.join(path.dirname(process.argv[2]), "electron-profile"));
	app.disableHardwareAcceleration();
	app.whenReady().then(async () => {
		const win = new BrowserWindow({
			show: false,
			width: 1200,
			height: 700,
			webPreferences: {
				sandbox: true,
				offscreen: true,
				backgroundThrottling: false,
			},
		});
		try {
			await win.loadFile(process.argv[2]);
			const report = await win.webContents.executeJavaScript("runFoldRegression()");
			for (const failure of report.failures) {
				process.stderr.write(`${failure}\n`);
			}
			process.stdout.write(
				`${report.checks} fold browser checks; ${report.failures.length} failures\n`,
			);
			app.exit(report.failures.length ? 1 : 0);
		} catch (error) {
			process.stderr.write(`${error}\n`);
			app.exit(1);
		}
	});
} else {
	const { spawnSync } = require("node:child_process");
	const directory = path.resolve("node_modules/.cache/fold-regression");
	fs.mkdirSync(directory, { recursive: true });
	const script = require("esbuild").buildSync({
		entryPoints: ["tests/fixtures/fold-persistence.ts"],
		bundle: true,
		write: false,
		platform: "browser",
		format: "iife",
		alias: {
			obsidian: path.resolve("tests/fixtures/fold-obsidian.ts"),
			"@/cm6/list-service": path.resolve("tests/fixtures/fold-list-service.ts"),
		},
	}).outputFiles[0].text;
	const file = path.join(directory, "fixture.html");
	fs.writeFileSync(
		file,
		`<!doctype html><html><head><title>Fold regression</title></head><body><script>${script}</script></body></html>`,
	);
	const env = Object.fromEntries(
		Object.entries(process.env).filter(([key]) => key !== "ELECTRON_RUN_AS_NODE"),
	);
	const result = spawnSync(require("electron"), [__filename, file], {
		stdio: "inherit",
		timeout: 30_000,
		env,
	});
	if (result.error) {
		throw result.error;
	}
	process.exitCode = result.status ?? 1;
}
