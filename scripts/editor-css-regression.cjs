"use strict";
// Standalone browser regression using the existing Sass and Electron tooling.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

if (process.versions.electron) {
  const { app, BrowserWindow } = require("electron");
  app.whenReady().then(async () => {
    const win = new BrowserWindow({
      show: false,
      webPreferences: { sandbox: true },
    });
    try {
      await win.loadFile(process.argv[2]);
      const report = await win.webContents.executeJavaScript(
        "runSizerRegression().then(sizer => { const dim = runRegression(); return { checks: dim.checks + sizer.checks, failures: [...dim.failures, ...sizer.failures] }; })"
      );
      for (const failure of report.failures) {
        process.stderr.write(`${failure}\n`);
      }
      process.stdout.write(
        `${report.checks} browser checks; ${report.failures.length} failures\n`
      );
      app.exit(report.failures.length ? 1 : 0);
    } catch (error) {
      process.stderr.write(`${error}\n`);
      app.exit(1);
    }
  });
} else {
  const sass = require("sass");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mdw-editor-css-"));
  try {
    const css = [
      "src/styles/editor/dim/_dim-unfocused.scss",
      "src/styles/editor/_clickable-sizer.scss",
    ]
      .map((file) => sass.compile(file).css)
      .join("\n");
    const fixture = fs.readFileSync("tests/fixtures/editor-css.html", "utf8");
    const file = path.join(dir, "fixture.html");
    fs.writeFileSync(file, fixture.replace("/* COMPILED_CSS */", css));
    const browserEnv = Object.fromEntries(
      Object.entries(process.env).filter(
        ([key]) => key !== "ELECTRON_RUN_AS_NODE"
      )
    );
    const result = spawnSync(require("electron"), [__filename, file], {
      stdio: "inherit",
      timeout: 30_000,
      env: browserEnv,
    });
    if (result.error) {
      throw result.error;
    }
    process.exitCode = result.status ?? 1;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
