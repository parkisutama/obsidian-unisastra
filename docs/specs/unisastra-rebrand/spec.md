# Unisastra rebrand specification

Status: Accepted for local implementation by maintainer on 2026-09-29.

## Problem and outcome

The current MD Writer identity appears in the Obsidian plugin ID, command IDs,
outline view type, CSS hooks, build and release assets, repository references,
and active documentation. The maintainer wants the same writing workflow under
the Unisastra identity, without carrying confusing old identifiers.

Unisastra keeps the present product positioning: high-precision drafting,
whitespace-aware editing, and outliner navigation. New branding strategy and
visual assets are outside this task.

## Scope

- Set display name `Unisastra` and plugin ID `unisastra`.
- Rename product-specific command IDs, outline view type, CSS classes and
  variables, frontmatter opt-out key, package and release archive name.
- Update runtime copy, active user/developer docs, build and release tooling,
  and repository references for the future GitHub rename.
- Preserve actual editing, folding, selection, toolbar, and settings behavior.
- Preserve third-party license and attribution text, updating only the current
  product name where appropriate.

## Exclusions

- No migration of old plugin installation, data, hotkeys, workspace, snippets,
  or Markdown vault content.
- No new features, UI design, logo, publication, vault deployment, GitHub
  repository rename, push, or release.
- Historical changelog, archived docs, and accepted ADRs retain their original
  context unless a current link needs correction.

## Identifier decisions

| Surface | Old | New |
| --- | --- | --- |
| Obsidian plugin ID | `md-writer` | `unisastra` |
| Display name | MD Writer | Unisastra |
| Plugin toggle command key | `md-writer-plugin` | `unisastra-plugin` |
| Command namespace | `md-writer:*` | `unisastra:*` through plugin ID |
| Outline view type | `md-writer-outline` | `unisastra-outline` |
| Frontmatter opt-out | `md-writer: false` | `unisastra: false` |
| CSS prefix | `ptm-` | `unisastra-` |
| Settings UI CSS prefix | `tm-settings` | `unisastra-settings` |
| Settings CSS class | `md-writer-setting` | `unisastra-setting` |
| Package and zip | `md-writer`, `md-writer.zip` | `unisastra`, `unisastra.zip` |
| GitHub repository target | `parkisutama/obsidian-md-writer` | `parkisutama/obsidian-unisastra` |

Unrelated typewriter feature names and data keys remain descriptive of the
feature. Existing Markdown block IDs do not encode the plugin name and keep
their format.

The local release metadata advances from `1.1.0` to `1.2.0`. This prepares
the next release without creating a tag or publishing it.

## Acceptance

1. Source, tests, generated styles, and release tooling refer consistently to
   the new plugin ID and identifier mapping.
2. Existing behavior tests pass after updating expectations for the new
   identifiers. Add targeted checks for manifest ID, command key, outline view
   type, and frontmatter opt-out behavior.
3. `pnpm run check:ci` passes, including typecheck, lint, tests, build,
   artifact verification, and docs build.
4. Active install docs describe a fresh `unisastra` installation. No script
   writes to a configured operational vault during verification.
5. Desktop, mobile, and popout Obsidian acceptance is reported separately from
   automated checks; untested scenarios remain open.
