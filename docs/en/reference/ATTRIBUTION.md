# Acknowledgements & Attribution

MD Writer descends from and adapts several open-source Obsidian plugins.
This page lists them; see the [main README](https://github.com/parkisutama/obsidian-md-writer#acknowledgements)
for the canonical, most up-to-date version and [LICENSE](https://github.com/parkisutama/obsidian-md-writer/blob/main/LICENSE)
for the project's full license text.

## Origin and build tooling (MIT)

- [Typewriter Mode](https://github.com/davisriedel/obsidian-typewriter-mode) by
  [Davis Riedel (davisriedel)](https://github.com/davisriedel) — MD Writer's
  original codebase and product direction.
- [bun-obsidian-plugin-build-scripts](https://github.com/davisriedel/bun-obsidian-plugin-build-scripts),
  also by Davis Riedel — the original build tooling, since migrated to pnpm + esbuild.
- [Typewriter Scroll](https://github.com/deathau/cm-typewriter-scroll-obsidian) by
  [deathau](https://github.com/deathau) — the plugin MD Writer was originally forked from.

## Adapted features (MIT unless noted)

- [Floaty Toolbar](https://github.com/0png/Floaty-Toolbar) by
  [0png](https://github.com/0png) — the floating selection toolbar. Full notice:
  [licenses/floaty-toolbar-MIT.txt](https://github.com/parkisutama/obsidian-md-writer/blob/main/licenses/floaty-toolbar-MIT.txt).
- [Focus Active Sentence](https://github.com/artisticat1/focus-active-sentence) by
  [artisticat1](https://github.com/artisticat1) — sentence highlighting.
- [Obsidian Focus Mode](https://github.com/ryanpcmcquen/obsidian-focus-mode) by
  [ryanpcmcquen](https://github.com/ryanpcmcquen) — writing focus. **Licensed under
  Mozilla Public License 2.0**, not MIT: the affected files
  (`src/capabilities/commands/writing-focus/`) remain under MPL-2.0 per the
  `EXCEPTION` clause in [LICENSE](https://github.com/parkisutama/obsidian-md-writer/blob/main/LICENSE)
  and [licenses/writing-focus-MPL2.0.txt](https://github.com/parkisutama/obsidian-md-writer/blob/main/licenses/writing-focus-MPL2.0.txt).
- [Remember Cursor Position](https://github.com/dy-sh/obsidian-remember-cursor-position) by
  [dy-sh](https://github.com/dy-sh) — restore cursor position.
- [Obsidian Hemingway Mode](https://github.com/jobedom/obsidian-hemingway-mode) by
  [jobedom](https://github.com/jobedom) — Hemingway mode.
- [MonoNote](https://github.com/czottmann/obsidian-mononote) by
  [Carlo Zottmann (czottmann)](https://github.com/czottmann) — the "keep one tab
  per note" general setting.
- [Show Whitespace](https://github.com/deathau/cm-show-whitespace-obsidian) by
  [deathau](https://github.com/deathau) — whitespace visualization.
- [Obsidian Zoom](https://github.com/vslinko/obsidian-zoom) by
  [vslinko](https://github.com/vslinko) — outliner zoom.

## Third-party runtime dependencies

- [Obsidian API](https://github.com/obsidianmd/obsidian-api) — **MIT**, not
  Apache 2.0.
- [CodeMirror 6](https://github.com/codemirror/dev) (`@codemirror/state`,
  `@codemirror/view`, `@codemirror/commands`, `@codemirror/language`) — MIT.

TypeScript itself (Apache-2.0) is a development-time tool, not something
bundled into or distributed with the plugin.

Many thanks to the developers of these plugins and libraries — please
consider supporting them.
