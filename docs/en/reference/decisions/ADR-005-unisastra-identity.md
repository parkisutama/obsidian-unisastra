# ADR-005: Unisastra identity without legacy migration

- Date: 2026-09-29.
- Status: Accepted by maintainer for local implementation.
- Contract: [Unisastra spec](../../../specs/unisastra-rebrand/spec.md).

## Context

MD Writer has not been submitted to Obsidian Community Plugins and has one
maintainer user. The maintainer wants its current writing workflow under the
Unisastra name. Retaining old product-specific IDs would make future
maintenance confusing. The existing plugin is distributed from a repository
currently named `obsidian-md-writer`.

## Decision

Rename the Obsidian plugin ID and display name, plugin-specific command key,
outline view type, frontmatter opt-out key, `ptm-` and `tm-settings` CSS
prefixes, package and archive.
Update all source, style, test, tooling, and active documentation consumers
together. Product wording retains the current positioning. Unrelated feature
names and Markdown block ID format stay intact.

No compatibility aliases or migration are provided for the old plugin
installation, persisted settings, hotkeys, workspace layout, CSS snippets, or
frontmatter. The plugin is installed as a new identity. No vault content is
rewritten automatically.

The repository may be renamed on GitHub after local work is reviewed; local
implementation does not rename it, push, deploy, or release.

## Options considered

- Keep old identifiers as aliases: reduces personal configuration disruption
  but leaves two names throughout the code and UI.
- Rename identifiers consistently: makes the new identity clear and accepts
  that old personal configuration is not migrated.

The maintainer chose the second option.

## Consequences

- Existing hotkeys, saved outline panels, old frontmatter opt-outs, and custom
  snippets using old selectors do not carry over automatically.
- All new runtime selectors and styles must change in one tested slice.
- Historical records remain accurate under the name they originally used.
- Build and release checks must verify the new manifest and artifact names.
