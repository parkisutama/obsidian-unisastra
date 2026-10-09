# Development

> **Release steps changed on 2026-10-09.** Releases now come from a Release PR; the
> `pnpm run release`, `pnpm run ci`, and `validate:release-tag` commands no longer exist.
> Where this page mentions them, follow [CONTRIBUTING.md](CONTRIBUTING.md) instead.

**You are welcome to open issues and contribute to this project!**

## Prerequisites

1. Install [Node.js](https://nodejs.org/) 24.x (see `.node-version`)
2. Enable [pnpm](https://pnpm.io/) through Corepack:
   `corepack enable`

## Setup

1. Fork this repo and clone your fork
2. Install dependencies with `pnpm install`

For detailed workflow notes, see [Unisastra docs](./docs/README.md).

## Building and Testing

1. Build and Setup Test Vault
   - Build with `pnpm run build`
   - Use `pnpm run dev` to build, update the test vault, and deploy to the
     configured Obsidian plugin folder in one step
   - Use `pnpm run debug` to enable `console.debug` statements _(all other commands strip these)_
   - Deploy the current `dist` output to a custom Obsidian vault with
     `pnpm run deploy` _(requires a `.env` file with
     `OBSIDIAN_VAULT_PLUGIN_PATH=<path>`)_

2. Test in Obsidian
   - Open the test vault in Obsidian
   - If the test vault is already opened, _force reload_ Obsidian to see changes

## Code Quality

| Command | Description |
| --------- | ------------- |
| `pnpm run check` | Run all checks (typecheck + lint + stylelint + markdownlint) |
| `pnpm run typecheck` | TypeScript type check |
| `pnpm run lint` | Biome lint and format checks |
| `pnpm run lint:styles` | SCSS linting |
| `pnpm run lint:md` | Markdown linting |
| `pnpm run fix` | Apply available Biome, Stylelint, and Markdown fixes |

Husky installs through `pnpm install`. Pre-commit runs `pnpm run check`
without modifying files; commit-msg enforces Conventional Commits via commitlint.
Run `pnpm run fix` explicitly and review changes before staging.

For AI development, read [AGENTS.md](./AGENTS.md) and
[AI Assisted Development](./docs/en/for-developers/ai-assisted-development.md).
Claude follows the same instructions through [CLAUDE.md](./CLAUDE.md).

## Documentation Site

| Command | Description |
| --------- | ------------- |
| `pnpm run docs:dev` | Start the VitePress docs site locally |
| `pnpm run docs:build` | Build the static docs site for GitHub Pages |
| `pnpm run docs:preview` | Preview the built docs site locally |

GitHub Pages deployment is handled by the `Deploy documentation` workflow.

## Releasing

- `pnpm run release` — Run release validation, create the local release commit,
  and create the local semver tag
- `git push --follow-tags` — Push the release commit and tag; the tag triggers
  the GitHub release workflow
- `pnpm run ci` — CI build used by GitHub Actions

Longer release procedures live in
[Create a GitHub release for BRAT and Obsidian](./docs/en/for-developers/create-a-github-release.md).
