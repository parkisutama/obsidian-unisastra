import json from "@eslint/json";
import tsparser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";
import { PlainTextParser } from "eslint-plugin-obsidianmd/dist/lib/plainTextParser.js";

const obsidianRules = {
	"obsidianmd/commands/no-command-in-command-id": "error",
	"obsidianmd/commands/no-command-in-command-name": "error",
	"obsidianmd/commands/no-default-hotkeys": "error",
	"obsidianmd/commands/no-plugin-id-in-command-id": "error",
	"obsidianmd/commands/no-plugin-name-in-command-name": "error",
	"obsidianmd/detach-leaves": "error",
	"obsidianmd/editor-drop-paste": "error",
	"obsidianmd/hardcoded-config-path": "error",
	"obsidianmd/no-forbidden-elements": "error",
	"obsidianmd/no-global-this": "error",
	"obsidianmd/no-sample-code": "error",
	"obsidianmd/no-static-styles-assignment": "error",
	"obsidianmd/no-tfile-tfolder-cast": "error",
	"obsidianmd/object-assign": "error",
	"obsidianmd/platform": "error",
	"obsidianmd/prefer-abstract-input-suggest": "error",
	"obsidianmd/prefer-active-doc": "warn",
	"obsidianmd/prefer-get-language": "error",
	"obsidianmd/prefer-window-timers": "error",
	"obsidianmd/regex-lookbehind": "error",
	"obsidianmd/sample-names": "error",
	"obsidianmd/settings-tab/no-manual-html-headings": "error",
	"obsidianmd/settings-tab/no-problematic-settings-headings": "error",
	"obsidianmd/ui/sentence-case": ["error", { enforceCamelCaseLower: true }],
	"obsidianmd/vault/iterate": "error",
};

const typedObsidianRules = {
	"obsidianmd/no-plugin-as-component": "error",
	"obsidianmd/no-unsupported-api": "error",
	"obsidianmd/no-view-references-in-plugin": "error",
	"obsidianmd/prefer-file-manager-trash-file": "warn",
	"obsidianmd/prefer-instanceof": "error",
};

export default defineConfig([
	{
		plugins: {
			obsidianmd,
		},
	},
	{
		files: ["src/**/*.ts"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				project: "./tsconfig.json",
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			...obsidianRules,
			...typedObsidianRules,
		},
	},
	{
		files: ["manifest.json"],
		language: "json/json",
		plugins: {
			json,
			obsidianmd,
		},
		rules: {
			"obsidianmd/validate-manifest": "error",
		},
	},
	{
		files: ["LICENSE"],
		languageOptions: {
			parser: PlainTextParser,
		},
		rules: {
			"obsidianmd/validate-license": "error",
		},
	},
]);
