# Code architecture baseline

Baseline pada 2026-09-14 mendeskripsikan struktur yang ada. Aturan di bawah
ditinjau manual; repo belum memiliki test khusus dependency direction atau cycles.

## Responsibilities

| Module | Responsibility |
| --- | --- |
| `src/main.ts` | Obsidian Plugin entry point, load/unload delegation |
| `src/lib.ts` | Composition and coordination of settings, features, editor integration |
| `src/capabilities/base/` | Command, feature, toggle, and loadable abstractions |
| `src/capabilities/features/` | Feature configuration and activation |
| `src/capabilities/features/toolbar/` | Toolbar settings, actions/executor (shared by UI and commands), CM6 controller, elapsed/HUD models |
| `src/capabilities/features/callouts/` | Callout catalog, settings, lossless Markdown edit/conversion, runtime style generation, theme discovery model |
| `src/capabilities/commands/` | Editor commands, outline navigation, and toolbar-action command-palette parity (`toolbar-actions.ts`) |
| `src/capabilities/settings.ts` | Persisted settings model and defaults |
| `src/cm6/` | CodeMirror editor transactions, decorations, and outliner state |
| `src/components/` | Obsidian settings, outline view, and update UI |
| `src/components/floaty-toolbar/` | Floating/dock toolbar DOM (buttons, dropdowns, HUD, long-press reorder gesture) — not unit-tested beyond pure helpers, since Vitest here runs with `environment: "node"` |
| `src/components/callout-*.ts` | Callout manager settings-tab UI, style editor/preview, discovery UI, compact expand/collapse |
| `src/gfm-anchor/` | Anchor resolution, navigation, preview, and hover integration |
| `src/styles/` | Editor and UI SCSS, compiled into styles.css |
| `scripts/lib/` | Build (incl. license-banner embedding), test-vault setup, deploy, artifact verification, and release tooling |
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
