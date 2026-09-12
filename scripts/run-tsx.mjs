import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Missing tsx entrypoint.");
  process.exit(1);
}

const temporaryDirectory = process.platform === "win32" ? tmpdir() : "/tmp";
const result = spawnSync(process.execPath, ["--import", "tsx", ...args], {
  env: {
    ...process.env,
    TEMP: temporaryDirectory,
    TMP: temporaryDirectory,
    TMPDIR: temporaryDirectory,
  },
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
