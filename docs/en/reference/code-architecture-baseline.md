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

Fold integration lives in `src/cm6/outliner/fold-persist.ts` and `fold-context.ts`:
the editor owns its window callbacks, validates primary MarkdownView identity,
and reads native CM6 fold effects. `fold-model.ts` maps actual ranges to unique IDs.
`capabilities/features/fold-persist/coordinator.ts` owns per-file action revisions,
debounced saves, rename/delete and owner cancellation; it never dispatches to sibling panes.
`settings-writer.ts` serializes immutable snapshots for both settings and fold callers.
`lib.ts` composes these services and owns vault events; fold saves skip global UI refresh.
The persisted schema is unchanged. See [ADR-004](./decisions/ADR-004-fold-native-effects.md).

Editor ViewPlugin owns its embed/resize observers and queued animation frames.
Destroy disconnects/cancels them and queued measurement callbacks check disposal.
MonoNote owns cancellable delayed work; Hemingway retains its registered document.
`FeatureToggle.applyValue` applies state without persistence for preset recipes;
the existing UI/command caller persists the completed recipe once.
Toolbar owns per-document frames and uses a HUD signature to skip unchanged DOM.
GFM owns its content observer, metadata events and owner-window frame, suspending
observation around its own writes. Outline owns one committed render Component
and at most one pending Component; generation checks prevent stale async output.
These remain within existing module responsibilities, with no new persisted schema.

Sidebar width synchronization lives under
`src/capabilities/features/general/sidebar-resize/`: the pure model selects and
clamps a target, the controller bounds frame/observer feedback and owns cleanup,
and the adapter isolates native DOM/size access. Each flush reads one geometry
snapshot; adapter writes recheck native identity/visibility without remeasuring
layout, use that frame's bounds, and report whether a write succeeded.
`sidebar-equal-resize.ts`
registers the General toggle; composition refreshes it on settings changes and
disposes it on unload. No CM6, command, or Markdown changes are involved.
The adapter is restricted to the probed Obsidian 1.14.2 contract; unknown
versions fail closed. See [ADR-003](./decisions/ADR-003-sidebar-equal-resize.md).

Sidebar guide geometry and path highlighting live in
`src/components/outline-guides.ts`. The outline view supplies visible entries
after filtering/collapse and retains editor actions, persistence, and lifecycle.
The helper has no Node or editor dependencies; SCSS sizes rails to actual row
height. `tests/outline-guides.test.ts` covers topology and path selection;
`node scripts/outline-css-regression.cjs` checks browser geometry with compiled
SCSS and the production guide renderer, separately from Obsidian host acceptance.

Compact settings menggunakan `src/components/settings-tab.ts` sebagai overview
dan detail-page composition, termasuk revision guard untuk callback redraw dan
cleanup preview Callouts. `src/components/typewriter-settings.ts` menggabungkan
dua feature group scrolling dan memperbarui disabled state kontrol. Recipe
per-mode dirender oleh `WritingModePresetConfig.registerMode`; persistence dan
aktivasi tetap milik feature existing. Tidak ada schema atau dependency baru.

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
