import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const DIST_FILES = ["main.js", "styles.css", "manifest.json"] as const;
const OBSIDIAN_VAULT_PLUGIN_PATH_PATTERN = /^OBSIDIAN_VAULT_PLUGIN_PATH=(.+)$/m;

interface DeployPluginOptions {
  distDir?: string;
  envPath?: string;
  required?: boolean;
}

function readPluginDir(envPath: string, required: boolean) {
  if (!existsSync(envPath)) {
    if (required) {
      throw new Error(
        "Missing .env file. Create one with OBSIDIAN_VAULT_PLUGIN_PATH=<path>"
      );
    }

    return null;
  }

  const envText = readFileSync(envPath, "utf-8");
  const match = envText.match(OBSIDIAN_VAULT_PLUGIN_PATH_PATTERN);
  if (!match) {
    if (required) {
      throw new Error("OBSIDIAN_VAULT_PLUGIN_PATH not found in .env");
    }

    return null;
  }

  return match[1].trim();
}

export function deployPlugin({
  distDir = "./dist",
  envPath = "./.env",
  required = false,
}: DeployPluginOptions = {}) {
  const pluginDir = readPluginDir(envPath, required);
  if (!pluginDir) {
    console.log(
      "Skipping Obsidian vault deploy; OBSIDIAN_VAULT_PLUGIN_PATH not set"
    );
    return;
  }

  for (const file of DIST_FILES) {
    const sourcePath = resolve(distDir, file);
    if (!existsSync(sourcePath)) {
      throw new Error(`Missing dist/${file}; run the build first`);
    }
  }

  const manifest = JSON.parse(
    readFileSync(resolve(distDir, "manifest.json"), "utf-8")
  ) as { id?: string };
  const destinationId = basename(resolve(pluginDir));
  if (!manifest.id || destinationId !== manifest.id) {
    throw new Error(
      `Configured plugin folder "${destinationId}" does not match built plugin ID "${manifest.id ?? "missing"}". Update OBSIDIAN_VAULT_PLUGIN_PATH before deploying.`
    );
  }

  if (!existsSync(pluginDir)) {
    mkdirSync(pluginDir, { recursive: true });
    console.log(`Created ${pluginDir}`);
  }

  for (const file of DIST_FILES) {
    const sourcePath = resolve(distDir, file);
    const destinationPath = resolve(pluginDir, file);
    copyFileSync(sourcePath, destinationPath);
    console.log(`Copied dist/${file} to ${destinationPath}`);
  }

  console.log(`Deployed to ${pluginDir}`);
}
