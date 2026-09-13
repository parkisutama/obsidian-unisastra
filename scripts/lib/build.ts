import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import builtins from "builtin-modules";
import esbuild from "esbuild";
import { compile as sassCompile } from "sass";

const LEADING_BOM = /^﻿/;

export interface BuildOptions {
  entrypoints?: {
    main?: string;
    styles?: string;
  };
  format?: "cjs" | "esm";
  minify?: boolean;
  outDir?: string;
  rootDir?: string;
  srcDir?: string;
  stripDebug?: boolean;
}

export async function build({
  rootDir = ".",
  srcDir = "src",
  entrypoints: { main = "main.ts", styles = "styles/index.scss" } = {},
  outDir = "dist",
  format = "cjs",
  minify = false,
  stripDebug = false,
}: BuildOptions = {}) {
  // Create outdir
  mkdirSync(`${rootDir}/${outDir}`, { recursive: true });

  // Build scss
  console.log("Building styles");
  const scssResult = sassCompile(`${rootDir}/${srcDir}/${styles}`, {
    style: "compressed",
  });
  // Dart Sass prepends a UTF-8 BOM when the compiled output contains
  // non-ASCII characters. Obsidian injects this file's contents directly as
  // a <style> element's text, and a leading BOM there corrupts the parse of
  // the very first CSS rule (it's silently dropped), so strip it here.
  const css = scssResult.css.replace(LEADING_BOM, "");
  writeFileSync(`${rootDir}/${outDir}/styles.css`, css);

  console.log("Copying manifest");
  copyFileSync(
    `${rootDir}/manifest.json`,
    `${rootDir}/${outDir}/manifest.json`
  );

  // Build js
  console.log("Building main");
  const esbuildFormat = format === "cjs" ? "cjs" : "esm";
  await esbuild.build({
    entryPoints: [`${rootDir}/${srcDir}/${main}`],
    outdir: `${rootDir}/${outDir}`,
    bundle: true,
    minifyWhitespace: minify,
    minifyIdentifiers: minify,
    minifySyntax: minify || stripDebug,
    sourcemap: minify ? false : "inline",
    target: "es2022",
    platform: "browser",
    format: esbuildFormat,
    // `drop: ["console"]` removes every console.* call; `pure` + minifySyntax
    // only eliminates the specific debug/log calls listed here, so
    // console.error/console.warn survive into the production bundle.
    pure: stripDebug ? ["console.log", "console.debug"] : [],
    external: [
      "obsidian",
      "electron",
      "@electron/remote",
      "@codemirror/autocomplete",
      "@codemirror/collab",
      "@codemirror/commands",
      "@codemirror/language",
      "@codemirror/lint",
      "@codemirror/search",
      "@codemirror/state",
      "@codemirror/view",
      "@lezer/common",
      "@lezer/highlight",
      "@lezer/lr",
      ...builtins,
    ],
  });
}
