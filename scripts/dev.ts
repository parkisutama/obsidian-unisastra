import type { FSWatcher } from "node:fs";
import { existsSync, readdirSync, statSync, watch } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { build } from "./lib/build.ts";
import { deployPlugin } from "./lib/deploy-plugin.ts";
import { setupTestVault } from "./lib/setup-test-vault.ts";

const PLUGIN_ID = "unisastra";
const DIST_DIR = "./dist";
const TEST_VAULT_PATH = "./test-vault";
const WATCH_TARGETS = ["src", "manifest.json"] as const;
const REBUILD_DEBOUNCE_MS = 100;

interface WatchPath {
	isFile: boolean;
	path: string;
}

const { values: args } = parseArgs({
	args: process.argv.slice(2).filter((arg) => arg !== "--"),
	options: {
		debug: {
			type: "boolean",
		},
		once: {
			type: "boolean",
		},
	},
	strict: true,
	allowPositionals: true,
});

async function buildAndDeploy() {
	await build({ stripDebug: !args.debug });
	setupTestVault(DIST_DIR, PLUGIN_ID, TEST_VAULT_PATH);
	deployPlugin();
}

function collectWatchPaths(path: string) {
	const absolutePath = resolve(path);
	if (!existsSync(absolutePath)) {
		return [];
	}

	const paths = [absolutePath];
	const entries = readdirSync(absolutePath, { withFileTypes: true });
	for (const entry of entries) {
		if (!entry.isDirectory()) {
			continue;
		}

		paths.push(...collectWatchPaths(resolve(absolutePath, entry.name)));
	}

	return paths;
}

function createWatchers(onChange: (path: string) => void) {
	const watchers: FSWatcher[] = [];
	const watchPaths = WATCH_TARGETS.flatMap((target) => {
		const absoluteTarget = resolve(target);
		if (!existsSync(absoluteTarget)) {
			return [];
		}

		if (statSync(absoluteTarget).isFile()) {
			return [{ isFile: true, path: absoluteTarget }];
		}

		const entries = readdirSync(absoluteTarget, { withFileTypes: true });
		if (entries.length === 0) {
			return [{ isFile: false, path: absoluteTarget }];
		}

		return collectWatchPaths(absoluteTarget).map(
			(path): WatchPath => ({
				isFile: false,
				path,
			}),
		);
	});

	for (const watchPath of watchPaths) {
		watchers.push(
			watch(watchPath.path, { persistent: true }, (_event, filename) => {
				if (watchPath.isFile) {
					onChange(watchPath.path);
					return;
				}

				onChange(filename ? resolve(watchPath.path, filename.toString()) : watchPath.path);
			}),
		);
	}

	return watchers;
}

await buildAndDeploy();

if (args.once) {
	process.exit(0);
}

let isBuilding = false;
let isBuildQueued = false;
let rebuildTimer: NodeJS.Timeout | null = null;

async function rebuild(changedPath: string) {
	if (isBuilding) {
		isBuildQueued = true;
		return;
	}

	isBuilding = true;
	console.log(`Change detected: ${changedPath}`);

	try {
		await buildAndDeploy();
	} catch (error) {
		console.error(error);
	} finally {
		isBuilding = false;
	}

	if (isBuildQueued) {
		isBuildQueued = false;
		await rebuild("queued changes");
	}
}

const watchers = createWatchers((changedPath) => {
	if (rebuildTimer) {
		clearTimeout(rebuildTimer);
	}

	rebuildTimer = setTimeout(() => {
		rebuild(changedPath).catch(console.error);
	}, REBUILD_DEBOUNCE_MS);
});

console.log(`Watching ${WATCH_TARGETS.join(", ")}. Press Ctrl+C to stop the dev server.`);

function closeWatchers() {
	for (const watcher of watchers) {
		watcher.close();
	}
}

process.on("SIGINT", () => {
	closeWatchers();
	process.exit(0);
});

process.on("SIGTERM", () => {
	closeWatchers();
	process.exit(0);
});
