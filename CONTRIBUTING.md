# Contributing

AI agents follow [AGENTS.md](AGENTS.md); the workflow below applies to everyone.

Setup, local development, and the test vault are described in [DEVELOPMENT.md](https://github.com/parkisutama/obsidian-univeritas/blob/main/docs/unisastra/DEVELOPMENT.md).
The user and developer guides live in the workspace repository: <https://github.com/parkisutama/obsidian-univeritas/tree/main/docs/unisastra>.
Specifications and decision records stay here under `docs/`.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm run check` | typecheck, Biome, Obsidian ESLint, Stylelint, Markdown lint, tests |
| `pnpm run verify` | `check` with coverage, then build, artifact verification, and conformance |
| `pnpm run test` | Vitest |
| `pnpm run build` | production build into `dist/`; never touches a vault |
| `pnpm run dev` | watch build; prepares `test-vault/` and copies to the vault named in `.env` |
| `pnpm run deploy` | build, then copy `dist/` to the vault named in `.env` once |
| `pnpm run fix` | autofix; inspect the diff afterwards |
| `pnpm run conformance` | the workspace engineering standard as executable checks |

## Commits and pull requests

- Commits follow [Conventional Commits](https://www.conventionalcommits.org/) with these types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `chore`, `revert`. A hook checks the message, and CI checks it again.
- Work on a short-lived branch and open a pull request. `main` accepts changes only through a pull request with green checks.
- Pull requests are squash-merged, so the **pull request title** becomes the commit on `main`. Write it as a Conventional Commit: `feat` and `fix` appear in the changelog and decide the next version.
- The pre-commit hook runs `pnpm run check`. Run `pnpm run verify` before pushing; CI runs the same command.
- Review comments use [Conventional Comments](https://conventionalcomments.org/) labels such as `issue`, `suggestion`, `question`, and `nitpick`.

## Releasing

Releases are automated with a human gate.

1. Every push to `main` updates one **Release PR** (`chore: release X.Y.Z`). It holds the next version in `package.json` and `manifest.json` and the new `CHANGELOG.md` section, both derived from the commits since the last release.
2. The maintainer reviews it: reword the changelog for readers, and for a minor or major release add the release record `docs/releases/X.Y.Z.md` from `docs/releases/TEMPLATE.md`. To release a different version than proposed, merge a commit whose body has the footer `Release-As: X.Y.Z`.
3. Merging the Release PR is the release decision. It creates the tag `X.Y.Z` (no `v` prefix) and the GitHub release; the workflow then runs `pnpm run verify`, attests the build, and attaches `main.js`, `manifest.json`, `styles.css`, and the plugin zip.

Before 1.0.0, a `feat` raises the patch number and a breaking change raises the minor number.

When `minAppVersion` changes, add `"X.Y.Z": "<new minAppVersion>"` to `versions.json` in the Release PR; `pnpm run verify` fails until it is there.

CI does not start by itself on the Release PR unless the repository secret `RELEASE_TOKEN` is set. Without it, push a commit to the Release PR branch or close and reopen the pull request.
