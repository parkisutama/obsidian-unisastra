import { build } from "./lib/build.ts";

await build({
	entrypoints: { main: "main.ts" },
	outDir: "dist",
	format: "cjs",
	minify: true,
	stripDebug: true,
});
