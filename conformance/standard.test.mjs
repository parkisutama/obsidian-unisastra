// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Parkis Utama

// Conformance to the Obsidian Plugin Engineering Standard. This file is identical in every
// plugin repository; the master copy lives in the workspace repository under
// templates/conformance/. Change it there first, then copy it.
//
//   pnpm run conformance

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

const root = process.cwd();
const read = (file) => readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(read(file));
const exists = (file) => existsSync(path.join(root, file));
const tracked = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" })
	.split("\n")
	.filter(Boolean);

const pkg = readJson("package.json");
const manifest = readJson("manifest.json");
const versions = readJson("versions.json");
const devDependencies = pkg.devDependencies ?? {};
const allDependencies = { ...pkg.dependencies, ...devDependencies };

const REQUIRED_SCRIPTS = [
	"dev",
	"build",
	"deploy",
	"typecheck",
	"lint",
	"lint:obsidian",
	"lint:md",
	"fix",
	"test",
	"test:coverage",
	"verify:artifacts",
	"check",
	"verify",
	"conformance",
	"version:sync",
];
const RETIRED_SCRIPTS = [
	"check:ci",
	"lint:fix",
	"version",
	"ci",
	"release",
	"validate:release-tag",
	"typecheck:fast",
	"typecheck:ci",
];
const REQUIRED_FILES = [
	"README.md",
	"CONTRIBUTING.md",
	"SECURITY.md",
	"CHANGELOG.md",
	"LICENSE",
	"THIRD_PARTY_NOTICES.md",
	"AGENTS.md",
	"CLAUDE.md",
	".node-version",
	".editorconfig",
	".gitattributes",
	".env.example",
	".github/dependabot.yml",
	".github/workflows/ci.yml",
	".github/workflows/release.yml",
	"docs/releases/TEMPLATE.md",
];
// Exact pins: these decide lint output, format output, or the API the code compiles against.
const EXACT_VERSIONS = {
	"@biomejs/biome": "2.5.15",
	"@eslint/json": "0.14.0",
	obsidian: "1.14.4",
};
// Major lines; the lockfile holds the exact version.
const VERSION_LINES = {
	typescript: /^\^6\./,
	eslint: /^\^10\./,
	"typescript-eslint": /^\^8\./,
	"@typescript-eslint/parser": /^\^8\./,
	"eslint-plugin-obsidianmd": /^\^0\.4\./,
	esbuild: /^\^0\.28\./,
	vitest: /^\^5\./,
	"@vitest/coverage-v8": /^\^5\./,
	rumdl: /^\^0\.2\./,
	"@types/node": /^\^24\./,
	husky: /^\^9\./,
	"@commitlint/cli": /^\^21\./,
	"@commitlint/config-conventional": /^\^21\./,
};
const FORBIDDEN_DEPENDENCIES = [
	"ultracite",
	"electron",
	"jiti",
	"vite",
	"dotenv",
	"tsx",
	"builtin-modules",
	"@types/codemirror",
];
const SOURCE_DIRS = ["src/", "scripts/", "tests/", "conformance/"];
const SOURCE_EXTENSIONS = /\.(ts|mts|cts|js|mjs|cjs|css|scss)$/;
const SPDX_HEADER_LINES = 5;

function workflows() {
	const dir = path.join(root, ".github/workflows");
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((name) => /\.ya?ml$/.test(name))
		.map((name) => ({ name, text: read(`.github/workflows/${name}`) }));
}

/** Lines that belong to `run:` steps, including the bodies of block scalars. */
function runLines(text) {
	const lines = text.split(/\r?\n/);
	const found = [];
	for (let i = 0; i < lines.length; i += 1) {
		const match = /^(\s*)(?:- )?run:\s*(.*)$/.exec(lines[i]);
		if (!match) continue;
		const value = match[2];
		if (!/^[|>][+-]?\s*$/.test(value)) {
			found.push(value);
			continue;
		}
		const keyIndent = lines[i].search(/\S/);
		for (i += 1; i < lines.length; i += 1) {
			if (lines[i].trim() !== "" && lines[i].search(/\S/) <= keyIndent) {
				i -= 1;
				break;
			}
			found.push(lines[i]);
		}
	}
	return found;
}

test("package.json has every standard script", () => {
	const missing = REQUIRED_SCRIPTS.filter((name) => !(name in (pkg.scripts ?? {})));
	assert.deepEqual(missing, []);
});

test("package.json has no retired script", () => {
	const present = RETIRED_SCRIPTS.filter((name) => name in (pkg.scripts ?? {}));
	assert.deepEqual(present, []);
});

test("build never copies to the vault and deploy builds first", () => {
	assert.match(pkg.scripts?.deploy ?? "", /\bbuild\b/);
	assert.match(pkg.scripts?.verify ?? "", /verify:artifacts/);
	assert.match(pkg.scripts?.verify ?? "", /conformance/);
});

test("toolchain identity matches the standard", () => {
	assert.equal(pkg.packageManager, "pnpm@12.10.1");
	assert.equal(pkg.engines?.node, ">=24");
	assert.equal(read(".node-version").trim(), "24");
	assert.equal(pkg.private, true);
	assert.equal(pkg.license, "GPL-3.0-only");
});

test("pinned tools use the exact standard version", () => {
	const actual = Object.fromEntries(
		Object.keys(EXACT_VERSIONS).map((name) => [name, devDependencies[name]]),
	);
	assert.deepEqual(actual, EXACT_VERSIONS);
});

test("shared tools are on the standard version line", () => {
	const wrong = Object.entries(VERSION_LINES)
		.filter(([name, line]) => !line.test(devDependencies[name] ?? ""))
		.map(([name]) => `${name}: ${devDependencies[name] ?? "missing"}`);
	assert.deepEqual(wrong, []);
});

test("no forbidden dependency is declared", () => {
	const present = FORBIDDEN_DEPENDENCIES.filter((name) => name in allDependencies);
	assert.deepEqual(present, []);
});

test("plugin versions agree across package.json, manifest.json, and versions.json", () => {
	assert.equal(manifest.version, pkg.version);
	assert.equal(manifest.minAppVersion, devDependencies.obsidian);
	assert.equal(versions[manifest.version], manifest.minAppVersion);
});

test("required repository files exist", () => {
	const missing = REQUIRED_FILES.filter((file) => !exists(file));
	assert.deepEqual(missing, []);
});

test("no build artifact is tracked by git", () => {
	const artifacts = tracked.filter(
		(file) => file === "main.js" || file === "styles.css" || file.startsWith("dist/"),
	);
	assert.deepEqual(artifacts, []);
});

test(".gitignore covers build output and local environment", () => {
	const ignored = read(".gitignore")
		.split(/\r?\n/)
		.map((line) => line.trim());
	for (const entry of ["dist", "coverage", ".env", "node_modules"]) {
		assert.ok(
			ignored.some((line) => line === entry || line === `${entry}/`),
			`.gitignore lacks ${entry}`,
		);
	}
});

test(".editorconfig and .gitattributes set tabs and LF", () => {
	assert.match(read(".editorconfig"), /indent_style\s*=\s*tab/);
	assert.match(read(".gitattributes"), /^\* text=auto eol=lf$/m);
});

test("every workflow defaults to read-only permissions", () => {
	const wrong = workflows()
		.filter(({ text }) => !/^permissions:\r?\n {2}contents: read\r?\n(?! {2}\S)/m.test(text))
		.map(({ name }) => name);
	assert.deepEqual(wrong, []);
});

test("every workflow action is pinned to a commit SHA", () => {
	const unpinned = [];
	for (const { name, text } of workflows()) {
		for (const match of text.matchAll(/^\s*(?:- )?uses:\s*(\S+)/gm)) {
			const ref = match[1];
			if (ref.startsWith("./")) continue;
			if (!/@[0-9a-f]{40}$/.test(ref)) unpinned.push(`${name}: ${ref}`);
		}
	}
	assert.deepEqual(unpinned, []);
});

test("no workflow interpolates a github context into a shell script", () => {
	const injected = [];
	for (const { name, text } of workflows()) {
		for (const line of runLines(text)) {
			if (/\$\{\{\s*github\./.test(line)) injected.push(`${name}: ${line.trim()}`);
		}
	}
	assert.deepEqual(injected, []);
});

test("ci.yml runs the verify entry point", () => {
	assert.ok(exists(".github/workflows/ci.yml"), "ci.yml is missing");
	assert.match(read(".github/workflows/ci.yml"), /pnpm run verify\b/);
});

test("every source file starts with an SPDX license identifier", () => {
	const missing = tracked
		.filter((file) => SOURCE_DIRS.some((dir) => file.startsWith(dir)))
		.filter((file) => SOURCE_EXTENSIONS.test(file))
		.filter((file) => {
			const head = read(file).split(/\r?\n/, SPDX_HEADER_LINES).join("\n");
			return !/SPDX-License-Identifier: \S+/.test(head);
		});
	assert.deepEqual(missing, []);
});
