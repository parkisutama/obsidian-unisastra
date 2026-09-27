"use strict";
// Production outline rendering with real browser DOM and deferred Markdown rendering.
const fs = require("node:fs");
const path = require("node:path");

if (process.versions.electron) {
  const { app, BrowserWindow } = require("electron");
  app.setPath(
    "userData",
    path.join(path.dirname(process.argv[2]), "electron-profile")
  );
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
      const report = await win.webContents.executeJavaScript(
        "runPerformanceRegression()"
      );
      for (const failure of report.failures) {
        process.stderr.write(`${failure}\n`);
      }
      process.stdout.write(
        `${report.checks} performance browser checks; ${report.failures.length} failures\n`
      );
      app.exit(report.failures.length ? 1 : 0);
    } catch (error) {
      process.stderr.write(`${error}\n`);
      app.exit(1);
    }
  });
} else {
  const { spawnSync } = require("node:child_process");
  const directory = path.resolve("node_modules/.cache/performance-regression");
  fs.mkdirSync(directory, { recursive: true });
  const script = require("esbuild").buildSync({
    entryPoints: ["tests/fixtures/performance-outline.ts"],
    bundle: true,
    write: false,
    platform: "browser",
    format: "iife",
    alias: { obsidian: path.resolve("tests/fixtures/performance-obsidian.ts") },
  }).outputFiles[0].text;
  const file = path.join(directory, "fixture.html");
  fs.writeFileSync(
    file,
    `<!doctype html><html><head><title>Performance regression</title></head><body><script>${script}</script></body></html>`
  );
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => key !== "ELECTRON_RUN_AS_NODE"
    )
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
