# Third-Party Notices

Unisastra is distributed under the GNU General Public License, version 3 only (GPL-3.0-only).
See [LICENSE](LICENSE).

The plugin bundles no third-party npm packages into `main.js` or `styles.css`.
Obsidian, Electron, and CodeMirror are provided by the host application and are not bundled.

Unisastra is derived from one project and adapts code from seven others.
Each notice below is reproduced in full under `third-party-notices/`, embedded in the banner of the built `main.js`, and shipped in the release under `licenses/`.
The list in `scripts/lib/license-banner.ts` is the single source the build and its verification use.

## Upstream project

| Project | License | Copyright | Notice |
| --- | --- | --- | --- |
| [Typewriter Mode](https://github.com/davisriedel/obsidian-typewriter-mode) | MIT | 2023-2026 Davis Riedel | [typewriter-mode-MIT.txt](third-party-notices/typewriter-mode-MIT.txt) |

Unisastra began as a copy of Typewriter Mode.
Every source file that traces back to that import carries the SPDX license expression `GPL-3.0-only AND MIT` with the upstream copyright line.
Files that were in the first commit but do not exist in Typewriter Mode and share no code with it are marked as written for this plugin.

## Adapted code

| Project | License | Copyright | Files in this repository | Notice |
| --- | --- | --- | --- | --- |
| [Typewriter Scroll](https://github.com/deathau/cm-typewriter-scroll-obsidian) | MIT (declared in `package.json`; no license file) | death_au | `src/cm6/plugin.ts` (user-event filter, inherited through Typewriter Mode) | [typewriter-scroll-MIT.txt](third-party-notices/typewriter-scroll-MIT.txt) |
| [Obsidian Zoom](https://github.com/vslinko/obsidian-zoom) | MIT | 2021 Viacheslav Slinko | `src/cm6/outliner/`: `detect-boundary-violation.ts`, `state-field.ts`, `utils.ts`, `click-on-bullet.ts`, `effects.ts`, `limit-selection.ts` | [obsidian-zoom-MIT.txt](third-party-notices/obsidian-zoom-MIT.txt) |
| [Floaty Toolbar](https://github.com/0png/Floaty-Toolbar) | MIT | 2026 0png | `src/capabilities/commands/toolbar-actions.ts`, `src/capabilities/features/toolbar/actions.ts`, `src/components/floaty-toolbar/reorder.ts` | [floaty-toolbar-MIT.txt](third-party-notices/floaty-toolbar-MIT.txt) |
| [MonoNote](https://github.com/czottmann/obsidian-mononote) | MIT | 2023-present Carlo Zottmann | `src/capabilities/features/general/mononote.ts` | [mononote-MIT.txt](third-party-notices/mononote-MIT.txt) |
| [Remember Cursor Position](https://github.com/dy-sh/obsidian-remember-cursor-position) | MIT | 2021 Dmitry Savosh | `src/capabilities/features/restore-cursor-position/restore-cursor-position.ts` | [remember-cursor-position-MIT.txt](third-party-notices/remember-cursor-position-MIT.txt) |
| [Focus Active Sentence](https://github.com/artisticat1/focus-active-sentence) | MIT | 2023 artisticat | `src/cm6/highlight-sentence.ts` | [focus-active-sentence-MIT.txt](third-party-notices/focus-active-sentence-MIT.txt) |
| [Obsidian Focus Mode](https://github.com/ryanpcmcquen/obsidian-focus-mode) | MPL-2.0 | 2024-2026 ryanpcmcquen | `src/capabilities/commands/writing-focus/writing-focus.ts`, `src/styles/editor/writing-focus/_hide-elements.scss` | [writing-focus-MPL2.0.txt](third-party-notices/writing-focus-MPL2.0.txt) |

The two files adapted from Obsidian Focus Mode remain under the Mozilla Public License 2.0.
Their source is in this repository at the paths above.

## Projects that informed a feature

These projects informed a feature; no code from them is included.
The sources were compared with the upstream repositories on 2026-10-10.

- [Hemingway Mode](https://github.com/jobedom/obsidian-hemingway-mode) (MIT): Hemingway mode.
- [cm-show-whitespace-obsidian](https://github.com/deathau/cm-show-whitespace-obsidian) by death_au (MIT, declared in `package.json`): whitespace display. Unisastra uses CodeMirror 6's own whitespace extensions.
- [cm-typewriter-scroll-obsidian](https://github.com/deathau/cm-typewriter-scroll-obsidian): the scroll-offset calculation is a separate implementation; the one inherited fragment is listed under Adapted code.

Typewriter Mode describes itself as having started as a fork of cm-typewriter-scroll-obsidian before being restructured.
Neither deathau repository publishes a license file; both declare MIT in `package.json`.

## License history

Versions up to 1.2.0 were distributed under the MIT License.
From the next release the plugin is distributed under GPL-3.0-only.
The MIT notices of the upstream projects still apply to the code that came from them.
