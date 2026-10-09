import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

process.env.TMPDIR ??= "/tmp";
process.env.TEMP ??= process.env.TMPDIR;
process.env.TMP ??= process.env.TMPDIR;

export default defineConfig({
  cacheDir: "node_modules/.cache/vitest",
  resolve: {
    alias: [
      { find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
      {
        find: /^obsidian$/,
        replacement: fileURLToPath(
          new URL("./tests/fixtures/obsidian.ts", import.meta.url)
        ),
      },
    ],
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
