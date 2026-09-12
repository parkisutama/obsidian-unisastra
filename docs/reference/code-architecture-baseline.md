# Code architecture baseline

Baseline pada 2026-09-12 mendeskripsikan struktur yang ada. Aturan di bawah
ditinjau manual; repo belum memiliki test khusus dependency direction atau cycles.

## Responsibilities

| Module | Responsibility |
| --- | --- |
| `src/main.ts` | Obsidian Plugin entry point, load/unload delegation |
| `src/lib.ts` | Composition and coordination of settings, features, editor integration |
| `src/capabilities/base/` | Command, feature, toggle, and loadable abstractions |
| `src/capabilities/features/` | Feature configuration and activation |
| `src/capabilities/commands/` | Editor commands and outline navigation |
| `src/capabilities/settings.ts` | Persisted settings model and defaults |
| `src/cm6/` | CodeMirror editor transactions, decorations, and outliner state |
| `src/components/` | Obsidian settings, outline view, and update UI |
| `src/gfm-anchor/` | Anchor resolution, navigation, preview, and hover integration |
| `src/styles/` | Editor and UI SCSS, compiled into styles.css |
| `scripts/lib/` | Build, test-vault setup, deploy, artifact and release tooling |
| `tests/` | Vitest behavior tests |

## Change rules

- Keep plugin composition in the existing entry/composition modules.
- Runtime source must remain compatible with Obsidian desktop and mobile;
  Node filesystem/deploy operations belong in build tooling.
- Preserve lifecycle cleanup and editor transaction semantics. Check selection,
  folding, embedded editors, and popout windows when modifying CodeMirror code.
- Preserve settings, command IDs, plugin ID, frontmatter, Markdown IDs, and CSS
  hooks documented in [current state](../current-state.md).
- Do not claim domain/application layer isolation: current modules integrate
  directly with Obsidian and CodeMirror. A layer migration is separate work.

For a new architectural decision, add an ADR under `reference/decisions/`.
Mark a superseded decision with a link to its successor; preserve historical rationale.
